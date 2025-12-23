# Guía de Seguridad - SkinAI App

## 🔐 Resumen de Mejoras de Seguridad Implementadas

Este documento describe las mejoras de seguridad implementadas en la aplicación SkinAI y las mejores prácticas a seguir.

## ✅ Problemas Solucionados

### 1. Eliminación de Claves Sensibles del Frontend

**Problema Anterior:**
- `SUPABASE_SERVICE_ROLE_KEY` estaba expuesto en `.env.local`
- `STRIPE_SECRET_KEY` estaba expuesto en el frontend

**Solución:**
- Removidas todas las claves de servicio del frontend
- Solo se mantienen claves públicas con prefijo `VITE_`
- Actualizado `.gitignore` para prevenir commits accidentales

### 2. Autenticación Real con Supabase Auth

**Problema Anterior:**
- Sistema de autenticación simulado que aceptaba cualquier credencial
- Datos de usuario almacenados solo en localStorage sin validación

**Solución:**
- Implementada autenticación real usando Supabase Auth
- Login y registro funcionales con validación
- Gestión de sesiones segura
- Recuperación automática de sesión al recargar

### 3. Asociación de Datos con Usuarios Reales

**Problema Anterior:**
- Análisis guardados con `user_id: null`
- No había forma de asociar datos con usuarios

**Solución:**
- Todos los análisis ahora se guardan con el ID real del usuario autenticado
- Historial filtrado por usuario
- Políticas de Row Level Security (RLS) recomendadas en Supabase

### 4. Limpieza de Código

**Problema Anterior:**
- `console.log` innecesarios en producción
- Credenciales hardcodeadas en componentes
- Archivo ejecutable sospechoso (`stripe.exe`)

**Solución:**
- Console.logs limitados solo a modo desarrollo
- Credenciales removidas
- Archivo `stripe.exe` eliminado
- `.gitignore` actualizado para prevenir archivos ejecutables

## 🛡️ Configuración Recomendada de Supabase

### Row Level Security (RLS)

Para máxima seguridad, configura las siguientes políticas RLS en tu base de datos Supabase:

```sql
-- Política para la tabla 'analysis'
-- Los usuarios solo pueden ver sus propios análisis
ALTER TABLE analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses"
ON analysis FOR SELECT
USING (auth.uid() = user_id);

-- Los usuarios solo pueden insertar análisis con su propio user_id
CREATE POLICY "Users can insert own analyses"
ON analysis FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios análisis
CREATE POLICY "Users can update own analyses"
ON analysis FOR UPDATE
USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propios análisis
CREATE POLICY "Users can delete own analyses"
ON analysis FOR DELETE
USING (auth.uid() = user_id);
```

### Storage Security

```sql
-- Política para el bucket 'skin-analyses'
-- Solo usuarios autenticados pueden subir
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'skin-analyses' AND auth.role() = 'authenticated');

-- Los usuarios solo pueden ver sus propias imágenes
CREATE POLICY "Users can view own images"
ON storage.objects FOR SELECT
USING (bucket_id = 'skin-analyses' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 🚨 Limitaciones Actuales y Recomendaciones

### 1. API Keys Expuestas en el Frontend

**Situación Actual:**
- `VITE_GEMINI_API_KEY` está expuesta en el cliente
- Cualquier usuario puede ver esta clave en el código fuente del navegador

**Riesgos:**
- Abuso de la API de Gemini
- Costos elevados por uso no autorizado
- Límites de rate alcanzados rápidamente

**Solución Recomendada:**
Implementar un backend/API serverless:

```typescript
// Ejemplo usando Supabase Edge Functions
// supabase/functions/analyze-skin/index.ts

import { GoogleGenAI } from "@google/genai";

Deno.serve(async (req) => {
  const { base64Image } = await req.json();

  // La API key está segura en el servidor
  const ai = new GoogleGenAI({
    apiKey: Deno.env.get('GEMINI_API_KEY')
  });

  const result = await ai.models.generateContent({...});
  return new Response(JSON.stringify(result));
});
```

### 2. Pagos de Stripe

**Situación Actual:**
- Solo hay claves públicas de Stripe (correcto)
- No hay backend para procesar pagos

**Recomendación:**
- Implementar Supabase Edge Functions o un backend Node.js
- Procesar pagos desde el servidor
- Usar Stripe Webhooks para confirmaciones

### 3. Rate Limiting

**Situación Actual:**
- No hay límites de requests desde el frontend
- Usuarios podrían abusar del servicio

**Recomendación:**
```typescript
// Implementar rate limiting con Supabase
// Crear una tabla 'rate_limits' y verificar antes de cada análisis
const checkRateLimit = async (userId: string) => {
  const { data } = await supabase
    .from('rate_limits')
    .select('count, last_reset')
    .eq('user_id', userId)
    .single();

  // Límite: 10 análisis por día
  if (data && data.count >= 10) {
    throw new Error('Límite diario alcanzado');
  }
};
```

## 📋 Checklist de Seguridad

### Antes de Deploy a Producción

- [ ] Rotar todas las API keys que estuvieron expuestas
- [ ] Configurar RLS en todas las tablas de Supabase
- [ ] Implementar rate limiting
- [ ] Configurar variables de entorno en el hosting (Vercel, Netlify, etc.)
- [ ] Habilitar HTTPS en producción
- [ ] Configurar CORS apropiadamente
- [ ] Implementar logging de errores (no exponer detalles al cliente)
- [ ] Configurar políticas de Storage en Supabase
- [ ] Revisar permisos del bucket de Storage
- [ ] Implementar confirmación de email en Supabase Auth

### Configuración de Supabase Auth

1. En el dashboard de Supabase, ve a Authentication > Settings
2. Habilita Email confirmation
3. Configura las URLs de redirección permitidas
4. Considera habilitar 2FA para usuarios

### Monitoreo

- Configurar alertas de Supabase para uso anormal
- Monitorear costos de Gemini API
- Revisar logs regularmente
- Configurar alertas de errores con Sentry o similar

## 🔑 Gestión de Variables de Entorno

### Desarrollo (`.env.local`)
```bash
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_key
# Solo claves públicas
```

### Producción
Configure las mismas variables en su plataforma de hosting (Vercel, Netlify, etc.)

### ⚠️ NUNCA Exponer
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- Claves de administrador
- Tokens de acceso privados

## 📞 Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, por favor NO la publiques en issues públicos.
Contacta directamente al equipo de desarrollo.

## 📚 Recursos Adicionales

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Stripe Security Best Practices](https://stripe.com/docs/security)

---

**Última actualización:** Noviembre 2025
**Estado:** ✅ Mejoras de seguridad implementadas - Listo para desarrollo
**Próximos pasos:** Implementar backend para operaciones sensibles antes de producción
