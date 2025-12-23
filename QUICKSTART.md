# Quick Start - SkinAI App + N8N Integration

## 🚀 Configuración Rápida (5 minutos)

### 1. Variables de Entorno

Copia el archivo de ejemplo:
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:
```env
# Supabase (OBLIGATORIO)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Gemini AI (OBLIGATORIO)
VITE_GEMINI_API_KEY=AIzaSy...

# N8N (NECESARIO para recomendaciones)
VITE_N8N_BASE_URL=https://tu-n8n.easypanel.host
```

### 2. Instalar e Iniciar

```bash
npm install
npm run dev
```

La app estará en: `http://localhost:5173`

## 🔗 Integración con N8N

### Paso 1: Configurar N8N

1. **Importar workflow de recomendaciones** en tu instancia de n8n
2. **Activar el workflow**
3. **Copiar la URL del webhook** (ej: `https://tu-n8n.com/webhook/skinai-analysis`)

### Paso 2: Actualizar .env.local

```env
VITE_N8N_BASE_URL=https://tu-n8n.easypanel.host
```

**Importante:** La URL NO debe terminar con `/`

### Paso 3: Verificar Integración

1. **Subir una foto** en la página principal
2. **Analizar la piel**
3. **Ir a n8n** y verificar que hay una nueva ejecución
4. **Ir a la página de Recomendaciones** en la app
5. **Esperar 3-5 segundos** para ver los productos

## 📊 Verificar en Supabase

### Ver análisis guardados:
```sql
SELECT id, created_at, skin_type, overall_score
FROM analysis
ORDER BY created_at DESC
LIMIT 5;
```

### Ver recomendaciones generadas:
```sql
SELECT
  r.product_name,
  r.motivo,
  r.confidence_score,
  p.brand
FROM recommendations r
JOIN products p ON r.product_id = p.id
ORDER BY r.created_at DESC
LIMIT 10;
```

## 🐛 Troubleshooting Común

### "No se generaron recomendaciones"

✅ **Verificar:**
1. N8N está corriendo y el workflow está activado
2. `VITE_N8N_BASE_URL` está configurado correctamente
3. Hay productos en la tabla `products` de Supabase
4. El webhook en n8n tiene la ruta correcta: `/webhook/skinai-analysis`

### "Error al cargar recomendaciones"

✅ **Verificar:**
1. El `analysis_id` existe en la tabla `analysis`
2. N8N completó la ejecución sin errores
3. Hay registros en la tabla `recommendations` para ese `analysis_id`

### Ver logs:

```bash
# Navegador (Console)
# Buscar mensajes de:
# - "No se pudieron generar recomendaciones automáticas"
# - "Error al obtener recomendaciones"

# N8N
# - Ver ejecuciones recientes
# - Buscar errores en rojo
```

## 📝 Checklist de Funcionalidad

Después de configurar, verifica que funcione:

- [ ] Login/Logout de usuarios
- [ ] Subir foto y analizar rostro
- [ ] Ver resultados del análisis
- [ ] Webhook de n8n se ejecuta (ver en n8n)
- [ ] Recomendaciones aparecen en la página
- [ ] Enlaces de afiliado funcionan (`tag=skinai-21`)
- [ ] Historial de análisis se guarda

## 🎯 Próximos Pasos

Una vez que todo funcione:

1. **Llenar tabla de productos** con al menos 20 productos reales
2. **Ajustar prompts** de Gemini en n8n para mejores recomendaciones
3. **Añadir imágenes** de productos en Supabase Storage
4. **Configurar Stripe** (futuro) siguiendo `ARCHITECTURE.md`

## 📚 Documentación Completa

Para más detalles, consulta:
- `ARCHITECTURE.md` - Arquitectura completa del sistema
- `README.md` - Información general del proyecto
- `lib/n8n-webhooks.ts` - Código de integración con n8n

## 💡 Consejos

### Desarrollo Local

```bash
# Verificar tipos TypeScript
npm run check

# Build de producción
npm run build

# Preview del build
npm run preview
```

### Testing de Webhooks

Usa `curl` para probar el webhook directamente:

```bash
curl -X POST https://tu-n8n.com/webhook/skinai-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "analysis_id": "uuid-del-analisis",
    "user_id": "uuid-del-usuario"
  }'
```

### Variables de Entorno en Producción

**NUNCA** commitees `.env.local` al repositorio.

En producción (Vercel, Netlify, etc.), configura las variables de entorno en el dashboard.

---

**¿Problemas?** Revisa `ARCHITECTURE.md` o abre un issue en el repositorio.
