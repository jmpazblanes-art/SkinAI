# 🧪 Checklist de Pruebas - Integración N8N

## ✅ Pre-requisitos

Antes de empezar las pruebas, verifica:

- [ ] App corriendo: `npm run dev` en `http://localhost:5173`
- [ ] N8N accesible en: https://n8nskinity-n8n.ixbbes.easypanel.host
- [ ] Workflow "SkinAI Analysis" activado en n8n
- [ ] Tabla `products` tiene al menos 20 productos en Supabase

## 📝 Test 1: Análisis Facial Básico

**Objetivo:** Verificar que el análisis facial funciona correctamente

1. [ ] Ir a la página principal
2. [ ] Subir una foto de rostro (o tomar con cámara)
3. [ ] Click en "Analizar"
4. [ ] **Verificar:** Aparece loading "Analizando piel..."
5. [ ] **Verificar:** Se muestra "Análisis guardado correctamente"
6. [ ] **Verificar:** Aparecen resultados:
   - Tipo de piel
   - Score general
   - Problemas detectados
   - Recomendaciones generales

**✅ Resultado esperado:** Análisis completo sin errores

---

## 🔗 Test 2: Llamada al Webhook de N8N

**Objetivo:** Verificar que el webhook se ejecuta automáticamente

### En la App:

1. [ ] Abrir DevTools del navegador (F12)
2. [ ] Ir a la pestaña "Console"
3. [ ] Realizar un análisis (Test 1)
4. [ ] **Verificar:** NO aparece "No se pudieron generar recomendaciones automáticas"

### En N8N:

1. [ ] Ir a https://n8nskinity-n8n.ixbbes.easypanel.host
2. [ ] Abrir workflow "SkinAI Analysis"
3. [ ] Click en "Executions" (historial de ejecuciones)
4. [ ] **Verificar:** Hay una nueva ejecución (timestamp reciente)
5. [ ] Click en la ejecución para ver detalles
6. [ ] **Verificar:** Estado = SUCCESS (verde)
7. [ ] **Verificar:** Todos los nodos se ejecutaron sin errores

**✅ Resultado esperado:** Webhook ejecutado sin errores

---

## 📊 Test 3: Verificar Datos en Supabase

**Objetivo:** Confirmar que los datos se guardaron correctamente

### Paso 1: Obtener el Analysis ID

```sql
-- En Supabase SQL Editor:
SELECT id, created_at, user_id, skin_type, overall_score
FROM analysis
ORDER BY created_at DESC
LIMIT 1;
```

1. [ ] Copiar el `id` (analysis_id) de la primera fila

### Paso 2: Verificar Recomendaciones

```sql
-- Reemplazar 'TU_ANALYSIS_ID' con el ID copiado:
SELECT
  r.id,
  r.product_name,
  r.motivo,
  r.confidence_score,
  r.product_url,
  p.brand,
  p.category
FROM recommendations r
JOIN products p ON r.product_id = p.id
WHERE r.analysis_id = 'TU_ANALYSIS_ID'
ORDER BY r.confidence_score DESC;
```

1. [ ] **Verificar:** Devuelve entre 3-5 registros
2. [ ] **Verificar:** Cada registro tiene:
   - `product_name` (no nulo)
   - `motivo` (texto coherente)
   - `confidence_score` (entre 0-100)
   - `product_url` (contiene `?tag=skinai-21`)

**✅ Resultado esperado:** 3-5 recomendaciones guardadas en Supabase

---

## 🛍️ Test 4: Ver Recomendaciones en la App

**Objetivo:** Verificar que las recomendaciones se muestran correctamente

1. [ ] En la app, click en "Recomendaciones" (menú lateral)
2. [ ] **Verificar:** Aparece loading "Generando recomendaciones..."
3. [ ] **Esperar 3-5 segundos**
4. [ ] **Verificar:** Aparecen tarjetas de productos
5. [ ] **Para cada producto, verificar:**
   - [ ] Tiene imagen (si está en Supabase)
   - [ ] Tiene nombre del producto
   - [ ] Tiene marca
   - [ ] Tiene categoría
   - [ ] Tiene motivo de recomendación (ej: "Ideal para piel grasa")
   - [ ] Tiene score de confianza (ej: "Confianza: 85%")
   - [ ] Tiene botón "Ver en Amazon"

**✅ Resultado esperado:** 3-5 productos mostrados correctamente

---

## 🔗 Test 5: Enlaces de Afiliado

**Objetivo:** Verificar que los enlaces tienen el código de afiliado correcto

1. [ ] En la página de Recomendaciones
2. [ ] Click derecho en un botón "Ver en Amazon"
3. [ ] Seleccionar "Copiar dirección de enlace"
4. [ ] Pegar en un editor de texto
5. [ ] **Verificar:** La URL contiene `?tag=skinai-21`
6. [ ] **Formato correcto:** `https://www.amazon.es/dp/XXXXXXXX?tag=skinai-21`

**Opcional:** Abrir el enlace en navegador privado

7. [ ] Abrir enlace en modo incógnito
8. [ ] **Verificar:** Redirige a Amazon correctamente
9. [ ] **Verificar:** El producto existe

**✅ Resultado esperado:** Enlaces funcionan y tienen código de afiliado

---

## 🔄 Test 6: Múltiples Análisis

**Objetivo:** Verificar que se pueden hacer varios análisis consecutivos

1. [ ] Realizar un segundo análisis (Test 1)
2. [ ] **Verificar:** Se genera una nueva ejecución en n8n
3. [ ] **Verificar:** Se guardan nuevas recomendaciones en Supabase
4. [ ] Ir a Recomendaciones
5. [ ] **Verificar:** Muestra las recomendaciones del último análisis

**✅ Resultado esperado:** Cada análisis genera sus propias recomendaciones

---

## ⚠️ Test 7: Manejo de Errores

**Objetivo:** Verificar que la app maneja errores correctamente

### Caso 1: N8N caído

1. [ ] Detener n8n temporalmente (o usar URL incorrecta en `.env.local`)
2. [ ] Realizar un análisis
3. [ ] **Verificar:** El análisis se completa normalmente
4. [ ] **Verificar:** Aparece mensaje de éxito
5. [ ] **Verificar:** En Console aparece warning (solo en dev)
6. [ ] Ir a Recomendaciones
7. [ ] **Verificar:** Muestra estado "Generando recomendaciones..." permanente
8. [ ] **Verificar:** Botón "Actualizar página" funciona

**✅ Resultado esperado:** App sigue funcionando sin recomendaciones

### Caso 2: Sin productos en Supabase

1. [ ] Realizar análisis (con n8n funcionando)
2. [ ] Si n8n no encuentra productos, debe fallar o devolver mensaje
3. [ ] Verificar logs en n8n

**✅ Resultado esperado:** Error claro en n8n (no en la app)

---

## 📱 Test 8: Experiencia de Usuario

**Objetivo:** Verificar que el flujo es intuitivo y rápido

1. [ ] **Tiempo total:** Desde subir foto hasta ver recomendaciones < 15 segundos
2. [ ] **Loading states:** Siempre hay feedback visual
3. [ ] **Mensajes:** Claros y en español
4. [ ] **Sin bloqueos:** La app no se congela en ningún momento

**✅ Resultado esperado:** Flujo fluido y rápido

---

## 🎯 Resumen de Resultados

| Test | Estado | Notas |
|------|--------|-------|
| 1. Análisis Facial | ⬜ |  |
| 2. Webhook N8N | ⬜ |  |
| 3. Datos en Supabase | ⬜ |  |
| 4. Ver Recomendaciones | ⬜ |  |
| 5. Enlaces de Afiliado | ⬜ |  |
| 6. Múltiples Análisis | ⬜ |  |
| 7. Manejo de Errores | ⬜ |  |
| 8. Experiencia de Usuario | ⬜ |  |

**Leyenda:**
- ⬜ Pendiente
- ✅ Pasó
- ❌ Falló

---

## 🐛 Reporte de Problemas

Si algún test falla, documenta:

1. **Test fallido:** [Número y nombre]
2. **Paso que falló:** [Número de paso]
3. **Comportamiento esperado:** [Qué debería pasar]
4. **Comportamiento observado:** [Qué pasó realmente]
5. **Logs/Screenshots:** [Adjuntar si es posible]
6. **Variables de entorno:** [Verificar que están correctas]

---

## ✅ Criterios de Aceptación

La integración está **COMPLETA** cuando:

- ✅ Todos los tests 1-6 pasan
- ✅ Test 7 (manejo de errores) pasa al menos 1 caso
- ✅ Test 8 confirma buena UX
- ✅ Enlaces de afiliado funcionan correctamente
- ✅ No hay errores en Console del navegador (solo warnings esperados)

---

**Fecha:** 2025-11-07
**Versión:** 1.0
**Tester:** _____________
**Resultado final:** ⬜ APROBADO / ⬜ RECHAZADO
