# Arquitectura SkinAI App + N8N

## Resumen

La app SkinAI está diseñada con una arquitectura **serverless** donde toda la lógica de negocio compleja se procesa en **n8n** (workflows de automatización). La app frontend solo maneja la interfaz de usuario y las interacciones básicas.

```
┌─────────────────────┐
│   SkinAI App        │
│  (React + Vite)     │
└──────────┬──────────┘
           │
           │ HTTP Webhooks
           ↓
┌─────────────────────┐
│   N8N Workflows     │
│  (Hostinger VPS)    │
└──────────┬──────────┘
           │
           │ Read/Write
           ↓
┌─────────────────────┐
│  Supabase Database  │
│   + Storage         │
└─────────────────────┘
```

## Componentes Principales

### 1. Frontend (React + Vite)

**Responsabilidades:**
- Captura de imágenes faciales
- Análisis facial con Google Gemini AI
- Visualización de resultados
- UI/UX

**NO hace:**
- Generación de recomendaciones de productos (lo hace n8n)
- Procesamiento de pagos (lo hará n8n en el futuro)
- Lógica de negocio compleja

### 2. N8N Workflows

**Workflows implementados:**

#### 🤖 Recomendaciones de Productos
- **Endpoint:** `POST /webhook/skinai-analysis`
- **Trigger:** Después de guardar un análisis en Supabase
- **Proceso:**
  1. Recibe `analysis_id` y `user_id`
  2. Lee el análisis desde Supabase
  3. Lee catálogo de productos (20 productos en tabla `products`)
  4. Usa Gemini AI para generar 3-5 recomendaciones personalizadas
  5. Añade URLs con código de afiliado Amazon (`skinai-21`)
  6. Guarda en tabla `recommendations`

#### 💳 Stripe Payments (FUTURO - no implementado)
- **Endpoint:** `POST /webhook/stripe-create-checkout`
- **Proceso:**
  1. Recibe `user_id`, `plan`, `success_url`, `cancel_url`
  2. Crea sesión de Stripe Checkout
  3. Devuelve `checkout_url`
  4. Procesa webhooks de Stripe
  5. Actualiza estado de suscripción en Supabase

### 3. Supabase

**Tablas principales:**

```sql
-- Análisis faciales
analysis (
  id uuid PRIMARY KEY,
  created_at timestamp,
  updated_at timestamp,
  user_id uuid,
  imagem_url text,
  resultado_json jsonb,
  tipo_piel text,
  preocupaciones jsonb,
  edad_aparente integer,
  modelo_ia text,
  fecha_analisis timestamp
)

-- Catálogo de productos
products (
  id uuid PRIMARY KEY,
  name text,
  category text,
  brand text,
  asin text,
  base_url text,
  description text,
  recommended_for text[],
  image_url text
)

-- Recomendaciones generadas por n8n
recommendations (
  id uuid PRIMARY KEY,
  created_at timestamp,
  user_id uuid,
  analysis_id uuid REFERENCES analysis(id),
  product_id uuid REFERENCES products(id),
  product_name text,
  product_url text,
  motivo text,
  confidence_score integer
)
```

## Flujo de Datos

### Análisis Facial + Recomendaciones

```
1. Usuario sube foto
   ↓
2. App analiza con Gemini AI
   ↓
3. App guarda análisis en Supabase
   ↓
4. App llama webhook de n8n (NO BLOQUEANTE)
   ↓
5. N8N:
   - Lee análisis
   - Lee productos
   - Genera recomendaciones con IA
   - Guarda en tabla recommendations
   ↓
6. Usuario navega a página de recomendaciones
   ↓
7. App consulta tabla recommendations en Supabase
   ↓
8. Muestra productos personalizados con enlaces de afiliado
```

## Archivos Clave

### Webhooks de N8N
- **`lib/n8n-webhooks.ts`**
  - `callRecommendationsWebhook()`: Llama a n8n para generar recomendaciones
  - `createStripeCheckout()`: FUTURO - Para crear sesiones de pago

### Servicios de Supabase
- **`services/supabaseService.ts`**
  - `saveSkinAnalysis()`: Guarda análisis facial
  - `getRecommendations()`: Obtiene recomendaciones por analysis_id
  - `getUserRecommendations()`: Obtiene últimas recomendaciones del usuario

### Páginas
- **`pages/HomePage.tsx`**
  - Captura y análisis facial
  - Llama al webhook de n8n después de guardar (línea 115-122)

- **`pages/RecommendationsPage.tsx`**
  - Muestra recomendaciones desde Supabase
  - Estados de loading/error/vacío
  - NO genera recomendaciones localmente

### Contexto
- **`context/AnalysisContext.tsx`**
  - Almacena último análisis
  - Ahora incluye `analysisId` para consultar recomendaciones

## Variables de Entorno

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Gemini AI
VITE_GEMINI_API_KEY=AIzaSy...

# N8N Webhooks
VITE_N8N_BASE_URL=https://your-n8n-instance.com

# FUTURO: Stripe (comentado)
# VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## Setup y Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:
- Supabase: Obtener de tu proyecto en supabase.com
- Gemini API: Obtener de Google AI Studio
- N8N Base URL: URL de tu instancia de n8n (después de importar workflows)

### 3. Configurar Supabase

#### Crear tablas:
Ejecutar `supabase-setup.sql` en SQL Editor de Supabase

#### Llenar tabla products:
Insertar al menos 20 productos en la tabla `products` con:
- `name`, `category`, `brand`, `asin`, `base_url`, `description`, `recommended_for[]`, `image_url`

### 4. Configurar N8N

#### Importar workflow:
- Importar el archivo JSON del workflow de recomendaciones
- Activar el workflow
- Copiar la URL del webhook

#### Actualizar .env.local:
```env
VITE_N8N_BASE_URL=https://tu-n8n.easypanel.host
```

### 5. Ejecutar la app
```bash
npm run dev
```

## Testing

### Flujo completo de recomendaciones:

1. **Subir foto y analizar**
   - Ir a página principal
   - Subir foto o tomar con cámara
   - Click en "Analizar"
   - Verificar que se guarda en Supabase

2. **Verificar webhook de n8n**
   - Abrir n8n y ver ejecuciones
   - Debe haber una ejecución con el `analysis_id`
   - Verificar que guardó recomendaciones en Supabase

3. **Ver recomendaciones**
   - Navegar a página de Recomendaciones
   - Esperar 3-5 segundos (loading)
   - Deben aparecer 3-5 productos personalizados
   - Verificar enlaces de afiliado (deben incluir `skinai-21`)

### Verificar en Supabase:

```sql
-- Ver últimos análisis
SELECT id, created_at, tipo_piel, edad_aparente, modelo_ia
FROM analysis
ORDER BY created_at DESC
LIMIT 10;

-- Ver recomendaciones de un análisis
SELECT r.*, p.name, p.brand, p.category
FROM recommendations r
JOIN products p ON r.product_id = p.id
WHERE r.analysis_id = 'YOUR_ANALYSIS_ID_HERE'
ORDER BY r.confidence_score DESC;
```

## Troubleshooting

### Las recomendaciones no aparecen

**Posibles causas:**

1. **N8N no recibió el webhook**
   - Verificar URL en `.env.local`
   - Ver logs de n8n para errores
   - Revisar que el workflow esté activado

2. **N8N no pudo generar recomendaciones**
   - Ver ejecución en n8n
   - Verificar que Gemini API Key esté configurada en n8n
   - Verificar que haya productos en tabla `products`

3. **La app no encuentra el analysis_id**
   - Verificar que `saveSkinAnalysis()` devuelve el ID
   - Revisar contexto `AnalysisContext` tiene `analysisId`
   - Ver console del navegador para errores

### Webhook falla con 404

- Verificar que `VITE_N8N_BASE_URL` no termina con `/`
- URL correcta: `https://n8n.example.com`
- URL incorrecta: `https://n8n.example.com/`

### Código de afiliado no aparece en URLs

- Verificar que n8n está añadiendo `?tag=skinai-21` a las URLs
- Revisar que la tabla `products` tiene `base_url` correctas
- Las URLs finales deben ser: `https://www.amazon.es/dp/{asin}?tag=skinai-21`

## Próximos Pasos

1. **Implementar webhook de Stripe en n8n**
   - Crear workflow para `stripe-create-checkout`
   - Configurar webhooks de Stripe a n8n
   - Actualizar `SubscriptionPage.tsx` para usar n8n

2. **Mejorar recomendaciones**
   - Añadir más productos al catálogo
   - Refinar prompts de Gemini en n8n
   - Añadir imágenes de productos

3. **Analytics**
   - Tracking de clicks en enlaces de afiliado
   - Métricas de conversión
   - Dashboard en n8n

## Contacto

Para dudas sobre:
- **Frontend:** Revisar este documento y código
- **N8N:** Contactar con el equipo de automatizaciones
- **Supabase:** Ver documentación oficial de Supabase

---

**Última actualización:** 2025-11-07
**Versión:** 1.0
