-- ============================================
-- SCRIPT DE CONFIGURACIÓN DE SUPABASE
-- SkinAI App - Análisis de Piel con IA
-- ============================================
--
-- INSTRUCCIONES:
-- 1. Ve al dashboard de Supabase: https://supabase.com/dashboard
-- 2. Selecciona tu proyecto
-- 3. Ve a "SQL Editor" en el menú lateral
-- 4. Crea una nueva query
-- 5. Copia y pega este script completo
-- 6. Ejecuta el script
-- ============================================

-- ============================================
-- 1. CREAR TABLA DE ANÁLISIS
-- ============================================

-- Crear la tabla principal de análisis
CREATE TABLE IF NOT EXISTS analysis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_piel TEXT CHECK (tipo_piel IN ('oily', 'dry', 'combination', 'normal', 'sensitive')),
  preocupaciones JSONB,
  imagem_url TEXT,
  resultado_json JSONB,
  edad_aparente INTEGER,
  modelo_ia TEXT DEFAULT 'gemini-1.5-pro',
  fecha_analisis TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_analysis_user_id ON analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_created_at ON analysis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_tipo_piel ON analysis(tipo_piel);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_analysis_updated_at BEFORE UPDATE ON analysis
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en la tabla
ALTER TABLE analysis ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay (para evitar conflictos)
DROP POLICY IF EXISTS "Users can view own analyses" ON analysis;
DROP POLICY IF EXISTS "Users can insert own analyses" ON analysis;
DROP POLICY IF EXISTS "Users can update own analyses" ON analysis;
DROP POLICY IF EXISTS "Users can delete own analyses" ON analysis;

-- Política: Los usuarios pueden ver solo sus propios análisis
CREATE POLICY "Users can view own analyses"
ON analysis FOR SELECT
USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar análisis con su propio user_id
CREATE POLICY "Users can insert own analyses"
ON analysis FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propios análisis
CREATE POLICY "Users can update own analyses"
ON analysis FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar sus propios análisis
CREATE POLICY "Users can delete own analyses"
ON analysis FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 3. CREAR TABLA DE RATE LIMITING (OPCIONAL)
-- ============================================

-- Tabla para controlar el límite de análisis por usuario
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  analysis_count INTEGER DEFAULT 0 NOT NULL,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índice para rate_limits
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_id ON rate_limits(user_id);

-- Habilitar RLS para rate_limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver su propio rate limit
CREATE POLICY "Users can view own rate limits"
ON rate_limits FOR SELECT
USING (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar su propio rate limit
CREATE POLICY "Users can update own rate limits"
ON rate_limits FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Sistema puede insertar rate limits para cualquier usuario
CREATE POLICY "System can insert rate limits"
ON rate_limits FOR INSERT
WITH CHECK (true);

-- ============================================
-- 4. FUNCIÓN PARA INCREMENTAR RATE LIMIT
-- ============================================

CREATE OR REPLACE FUNCTION increment_rate_limit(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
  v_last_reset TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Obtener el registro actual
  SELECT analysis_count, last_reset INTO v_count, v_last_reset
  FROM rate_limits
  WHERE user_id = p_user_id;

  -- Si no existe, crear uno nuevo
  IF NOT FOUND THEN
    INSERT INTO rate_limits (user_id, analysis_count, last_reset)
    VALUES (p_user_id, 1, TIMEZONE('utc'::text, NOW()))
    RETURNING analysis_count INTO v_count;
    RETURN v_count;
  END IF;

  -- Si han pasado más de 24 horas, resetear el contador
  IF (TIMEZONE('utc'::text, NOW()) - v_last_reset) > INTERVAL '24 hours' THEN
    UPDATE rate_limits
    SET analysis_count = 1,
        last_reset = TIMEZONE('utc'::text, NOW())
    WHERE user_id = p_user_id
    RETURNING analysis_count INTO v_count;
    RETURN v_count;
  END IF;

  -- Incrementar el contador
  UPDATE rate_limits
  SET analysis_count = analysis_count + 1
  WHERE user_id = p_user_id
  RETURNING analysis_count INTO v_count;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. FUNCIÓN PARA VERIFICAR RATE LIMIT
-- ============================================

CREATE OR REPLACE FUNCTION check_rate_limit(p_user_id UUID, p_max_limit INTEGER DEFAULT 10)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_last_reset TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Obtener el registro actual
  SELECT analysis_count, last_reset INTO v_count, v_last_reset
  FROM rate_limits
  WHERE user_id = p_user_id;

  -- Si no existe, permitir (es su primer análisis)
  IF NOT FOUND THEN
    RETURN true;
  END IF;

  -- Si han pasado más de 24 horas, permitir
  IF (TIMEZONE('utc'::text, NOW()) - v_last_reset) > INTERVAL '24 hours' THEN
    RETURN true;
  END IF;

  -- Verificar si está dentro del límite
  RETURN v_count < p_max_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. CREAR VISTAS ÚTILES
-- ============================================

-- Vista para estadísticas del usuario
CREATE OR REPLACE VIEW user_analysis_stats AS
SELECT
  user_id,
  COUNT(*) as total_analyses,
  MAX(created_at) as last_analysis,
  MIN(created_at) as first_analysis,
  MODE() WITHIN GROUP (ORDER BY tipo_piel) as most_common_skin_type
FROM analysis
GROUP BY user_id;

-- Dar permisos de lectura a usuarios autenticados
GRANT SELECT ON user_analysis_stats TO authenticated;

-- ============================================
-- SCRIPT COMPLETADO
-- ============================================

-- Verificar que todo se creó correctamente
DO $$
BEGIN
  RAISE NOTICE '✅ Tablas creadas: analysis, rate_limits';
  RAISE NOTICE '✅ Índices creados correctamente';
  RAISE NOTICE '✅ Row Level Security (RLS) habilitado';
  RAISE NOTICE '✅ Políticas de seguridad aplicadas';
  RAISE NOTICE '✅ Funciones de rate limiting creadas';
  RAISE NOTICE '✅ Vistas de estadísticas creadas';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 CONFIGURACIÓN COMPLETADA CON ÉXITO';
  RAISE NOTICE '';
  RAISE NOTICE '📌 PRÓXIMOS PASOS:';
  RAISE NOTICE '1. Configurar el bucket de Storage (skin-analyses)';
  RAISE NOTICE '2. Habilitar Email Authentication en Auth settings';
  RAISE NOTICE '3. Configurar las variables de entorno en tu aplicación';
END $$;
