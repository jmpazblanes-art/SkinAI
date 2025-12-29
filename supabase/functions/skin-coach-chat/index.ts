import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { messages } = await req.json()

        if (!messages || !Array.isArray(messages)) {
            return new Response(
                JSON.stringify({ error: 'Mensajes no proporcionados' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        const googleApiKey = Deno.env.get('GOOGLE_API_KEY')
        if (!googleApiKey) {
            return new Response(
                JSON.stringify({ error: 'Falta la clave GOOGLE_API_KEY en Supabase Secrets' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        const genAI = new GoogleGenerativeAI(googleApiKey)
        // CAMBIO CRÍTICO: Usamos "gemini-flash-latest" que es el nombre que acepta esta versión del SDK
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

        const lastMessage = messages[messages.length - 1].content;

        let fullPrompt = "Instrucción de Sistema: Eres Skin Coach IA, experto en dermocosmética. NO ERES MÉDICO NI PERSONAL SANITARIO. Responde en español. ESTÁ TERMINANTEMENTE PROHIBIDO usar palabras como 'diagnóstico', 'cura', 'enfermedad', 'clínica', 'especialista', 'tratamiento médico' o llamarte a ti mismo 'dermatólogo'. Tus respuestas deben basarse exclusivamente en rutinas e ingredientes cosméticos.\n\n";

        // Añadimos el mensaje del usuario
        fullPrompt += `Usuario dice: ${lastMessage}\nCoach responde:`;

        console.log(`💬 Enviando prompt a Gemini (gemini-flash-latest)`)

        try {
            const result = await model.generateContent(fullPrompt);
            const responseText = result.response.text();

            return new Response(
                JSON.stringify({ text: responseText }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        } catch (geminiError: any) {
            console.error('❌ Error de Gemini API:', geminiError.message)
            return new Response(
                JSON.stringify({
                    error: 'Error de Gemini: ' + geminiError.message,
                    details: geminiError.toString()
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

    } catch (error: any) {
        console.error('❌ Error fatal en función:', error.message)
        return new Response(
            JSON.stringify({ error: 'Error interno: ' + error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
