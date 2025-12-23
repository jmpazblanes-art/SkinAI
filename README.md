<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SkinAI - Análisis de Piel con IA

Aplicación web de análisis facial con inteligencia artificial que proporciona recomendaciones personalizadas para el cuidado de la piel.

## 🚀 Características

- **Análisis de piel con IA** usando Google Gemini
- **Autenticación segura** con Supabase Auth
- **Almacenamiento en la nube** con Supabase Storage
- **Historial de análisis** personalizado por usuario
- **Recomendaciones personalizadas** basadas en tipo de piel
- **Interfaz responsive** con modo oscuro
- **Captura de fotos** en tiempo real con la cámara

## 🔒 Seguridad

Esta aplicación ha sido auditada y mejorada para cumplir con las mejores prácticas de seguridad:

✅ Autenticación real con Supabase Auth
✅ Sin claves sensibles expuestas en el frontend
✅ Datos asociados a usuarios autenticados
✅ Código limpio sin credenciales hardcodeadas

**📖 Consulta [SECURITY.md](SECURITY.md) para más detalles sobre seguridad**

## 📋 Prerequisitos

- **Node.js** (versión 16 o superior)
- **Cuenta de Supabase** (gratuita)
- **API Key de Google Gemini** (gratuita)
- **Cuenta de Stripe** (opcional, para pagos)

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd skinity-base
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Supabase Configuration
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Gemini AI Configuration
VITE_GEMINI_API_KEY=tu_gemini_api_key

# Stripe Configuration (opcional)
VITE_STRIPE_PUBLIC_KEY=tu_stripe_public_key
VITE_STRIPE_ANNUAL_PRICE_ID=tu_price_id
VITE_STRIPE_MONTHLY_PRICE_ID=tu_price_id
```

#### Obtener credenciales:

**Supabase:**
1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a Settings > API
3. Copia `URL` y `anon/public key`

**Google Gemini:**
1. Ve a [Google AI Studio](https://ai.google.dev/)
2. Genera una API key
3. Copia la key

### 4. Configurar Supabase

#### Crear tabla de análisis:

```sql
CREATE TABLE analysis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skin_type TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  problems JSONB NOT NULL,
  recommendations TEXT[] NOT NULL,
  image_url TEXT NOT NULL,
  result JSONB NOT NULL
);

-- Habilitar Row Level Security
ALTER TABLE analysis ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view own analyses"
ON analysis FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
ON analysis FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

#### Crear bucket de Storage:

1. Ve a Storage en Supabase Dashboard
2. Crea un nuevo bucket llamado `skin-analyses`
3. Configura como público (para poder mostrar las imágenes)

#### Configurar Authentication:

1. Ve a Authentication > Settings
2. Habilita Email provider
3. (Opcional) Configura Email confirmation
4. Añade tu URL de desarrollo a las URLs permitidas: `http://localhost:5173`

### 5. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Arquitectura

```
skinity-base/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── ui/          # Componentes UI básicos
│   │   └── notifications/ # Sistema de notificaciones
│   ├── context/         # Context API (Auth, Theme, etc.)
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Páginas de la aplicación
│   ├── services/        # Servicios (Supabase, Gemini)
│   ├── types/           # TypeScript types
│   └── utils/           # Utilidades
├── .env.local           # Variables de entorno (no commitear)
├── .env.example         # Ejemplo de variables de entorno
└── SECURITY.md          # Documentación de seguridad
```

## 🧪 Compilación para Producción

```bash
npm run build
```

Los archivos optimizados estarán en la carpeta `dist/`.

### Deploy Recomendado:

- **Vercel** (recomendado para apps React)
- **Netlify**
- **Supabase Hosting**

**⚠️ Importante antes de deploy:**
- Configura las variables de entorno en tu plataforma
- Lee [SECURITY.md](SECURITY.md) para consideraciones de seguridad
- Rota las API keys que estuvieron expuestas durante desarrollo

## 📱 Funcionalidades

### Para Usuarios:
- Registro e inicio de sesión
- Análisis de piel con IA
- Captura de fotos con cámara o upload
- Historial de análisis
- Recomendaciones personalizadas
- Rutina de cuidado sugerida
- Consejos y tips

### Panel de Usuario:
- Ver perfil
- Historial de análisis
- Gestionar suscripción (próximamente)

## 🔐 Seguridad y Privacidad

- ✅ Autenticación segura con Supabase Auth
- ✅ Row Level Security en base de datos
- ✅ Imágenes almacenadas de forma segura en Supabase Storage
- ✅ Sin claves sensibles en el código del cliente
- ⚠️ **Nota:** La API de Gemini se llama desde el frontend (limitación actual)
  - Para producción, se recomienda implementar un backend

Ver [SECURITY.md](SECURITY.md) para más detalles.

## 🚧 Limitaciones Conocidas

1. **API de Gemini en Frontend:** La clave de API está expuesta en el cliente
   - **Recomendación:** Implementar Supabase Edge Functions o backend Node.js

2. **Sin Rate Limiting:** No hay límites de requests por usuario
   - **Recomendación:** Implementar rate limiting en backend o base de datos

3. **Pagos de Stripe:** No implementado completamente
   - **Recomendación:** Implementar backend para procesar pagos

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.

## 🐛 Reporte de Bugs

Para reportar bugs o sugerir mejoras, abre un issue en el repositorio.

Para vulnerabilidades de seguridad, contacta directamente al equipo (ver SECURITY.md).

## 📞 Soporte

Para preguntas o soporte, contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ usando React, TypeScript, Supabase y Google Gemini**
