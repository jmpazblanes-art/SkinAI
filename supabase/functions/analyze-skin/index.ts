import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Manejo de CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { image, user_id } = await req.json()

        if (!image) {
            return new Response(
                JSON.stringify({ error: 'Imagen no proporcionada' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // Inicializar Gemini
        const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_API_KEY') || '')
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

        const prompt = `Actúa como un experto en dermocosmética. Analiza la piel de la imagen. 
    IMPORTANTE: Usa un lenguaje estrictamente cosmético. ESTÁ PROHIBIDO usar términos médicos, diagnósticos, 'curas' o 'tratamientos'. 
    Solo sugiere 'rutinas', 'cuidados' y 'recomendaciones cosméticas'. 
    
    Devuelve estrictamente un JSON con el siguiente formato:
    {
      "tipo_piel": "oily | dry | combination | normal | sensitive",
      "preocupaciones": ["brillos", "puntos negros", "textura irregular", etc],
      "ingredientes_clave": ["niacinamida", "ácido hialurónico", "vitamina c"],
      "mensaje_motivador": "un mensaje breve y positivo sobre el cuidado de la piel",
      "rutina": {
        "manana": [
          {"paso": "Limpieza", "producto": "Limpiador suave", "ingrediente_key": "limpiador"},
          {"paso": "Tratamiento", "producto": "Sérum de...", "ingrediente_key": "ingrediente_del_serum"}
        ],
        "noche": [
          {"paso": "Limpieza", "producto": "Aceite limpiador", "ingrediente_key": "aceite"},
          {"paso": "Hidratación", "producto": "Crema de...", "ingrediente_key": "ingrediente_de_la_crema"}
        ]
      }
    }`

        // Gemini espera la imagen en base64 sin el prefijo data:image/...
        const base64Data = image.split(',')[1] || image

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg"
                }
            }
        ])

        const responseText = result.response.text()
        // Limpiar posibles bloques de código markdown
        const jsonString = responseText.replace(/```json|```/g, '').trim()
        const rawAnalysis = JSON.parse(jsonString)

        // Inicializar cliente Supabase para buscar productos
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Consultar productos afiliados basados en ingredientes sugeridos
        const ingredientKeys = [
            ...(rawAnalysis.ingredientes_clave || []),
            ...(rawAnalysis.rutina?.manana?.map((s: any) => s.ingrediente_key) || []),
            ...(rawAnalysis.rutina?.noche?.map((s: any) => s.ingrediente_key) || [])
        ].filter(Boolean)

        const uniqueKeys = [...new Set(ingredientKeys)]

        console.log('Ingredientes detectados por Gemini:', uniqueKeys)

        let products = []
        const selectFields = 'id, product_name, affiliate_url, image_url, price_tier, ingredient_key'

        if (uniqueKeys.length > 0) {
            // Construir filtro OR para búsqueda parcial (fuzzy search)
            const orFilter = uniqueKeys
                .map(key => `ingredient_key.ilike.%${key}%,product_name.ilike.%${key}%`)
                .join(',')

            const { data, error: searchError } = await supabase
                .from('affiliate_products')
                .select(selectFields)
                .or(orFilter)
                .limit(5)

            if (searchError) console.error('Error en búsqueda de productos:', searchError)
            products = data || []
        }

        console.log(`Productos encontrados por ingredientes: ${products.length}`)

        // FALLBACK OBLIGATORIO: Si no hay productos, traer 5 productos genéricos
        if (products.length === 0) {
            console.log('Aplicando fallback obligatorio: No se encontraron coincidencias, trayendo productos genéricos.')
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('affiliate_products')
                .select(selectFields)
                .limit(5)

            if (fallbackError) console.error('Error en fallback de productos:', fallbackError)
            products = fallbackData || []
            console.log(`Productos entregados por fallback: ${products.length}`)
        }

        // Respuesta final
        const finalResponse = {
            success: true,
            analysis_id: crypto.randomUUID(),
            analisis: {
                tipo_piel: rawAnalysis.tipo_piel,
                caracteristicas: rawAnalysis.preocupaciones,
                edad_aparente: 25,
                puntuacion: 85
            },
            mensaje_motivador: rawAnalysis.mensaje_motivador,
            rutina: rawAnalysis.rutina,
            productos: products
        }

        return new Response(
            JSON.stringify(finalResponse),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message, success: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
