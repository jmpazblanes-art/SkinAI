-- ============================================
-- CONFIGURAR TABLA USERS PARA SUSCRIPCIONES
-- ============================================

-- 1. Añadir columna subscription_tier si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE public.users ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro'));
    RAISE NOTICE '✅ Columna subscription_tier añadida';
  ELSE
    RAISE NOTICE '⚠️ Columna subscription_tier ya existe';
  END IF;
END $$;

-- 2. Asegurar que todos los usuarios existentes tengan subscription_tier
UPDATE public.users 
SET subscription_tier = 'free' 
WHERE subscription_tier IS NULL;

-- 3. Habilitar RLS si no está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de seguridad
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Función para crear/actualizar usuario automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, subscription_tier)
  VALUES (NEW.id, NEW.email, 'free')
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Crear trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Migrar usuarios existentes de auth.users a public.users
INSERT INTO public.users (id, email, subscription_tier)
SELECT id, email, 'free'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- Verificación
DO $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.users;
  RAISE NOTICE '✅ Tabla users configurada';
  RAISE NOTICE '✅ Trigger automático activo';
  RAISE NOTICE '✅ Total usuarios: %', user_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎉 CONFIGURACIÓN COMPLETADA';
END $$;
