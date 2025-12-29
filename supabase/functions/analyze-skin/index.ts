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
        const { image, user_id, birth_date } = await req.json()

        if (!image) {
            return new Response(
                JSON.stringify({ error: 'Imagen no proporcionada' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // Calcular edad real si se proporciona birth_date
        let ageContext = "";
        if (birth_date) {
            const birth = new Date(birth_date);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            ageContext = `El usuario tiene cronológicamente ${age} años. `;
        }

        // Inicializar Gemini
        const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_API_KEY') || '')
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: {
                temperature: 0, // Fuerza resultados idénticos ante entradas similares
                topP: 1,
                topK: 1
            }
        })

        const prompt = `Actúa como un analista experto y OBJETIVO en dermocosmética. Analiza la piel de la imagen. 
    ${ageContext}
    
    CRITERIOS DE CONSISTENCIA:
    1. TIPO DE PIEL: Solo cambia de "normal" a "combination" si ves brillos claros en zona T. Sé conservador.
    2. PUNTUACIÓN: Usa una escala lógica. 80-90 es piel muy sana. 60-70 necesita mejora. No varíes más de 2-3 puntos sin causa clara.
    3. EDAD: No te alejes más de 3 años de la edad real proporcionada a menos que veas signos profundos de envejecimiento o una piel excepcionalmente joven.
    
    IMPORTANTE: Usa lenguaje puramente cosmético. PROHIBIDO términos médicos. 
    
    Devuelve estrictamente un JSON:
    {
      "tipo_piel": "oily | dry | combination | normal | sensitive",
      "edad_aparente": número entre 18 y 90,
      "puntuacion": número entre 1 y 100,
      "preocupaciones": ["lista de 3-4 strings"],
      "ingredientes_clave": ["lista de 3 strings"],
      "mensaje_motivador": "string breve",
      "rutina": { "manana": [...], "noche": [...] }
    }`

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
                edad_aparente: rawAnalysis.edad_aparente || 25,
                puntuacion: rawAnalysis.puntuacion || 80
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
