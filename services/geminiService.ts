import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY environment variable is not set. Please check your .env.local file.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    skinType: {
      type: Type.STRING,
      enum: ['oily', 'dry', 'combination', 'normal', 'sensitive'],
      description: 'El tipo de piel general del usuario.'
    },
    overallScore: {
      type: Type.NUMBER,
      description: 'Una puntuación del 1 al 100 que representa la salud general de la piel.'
    },
    problems: {
      type: Type.ARRAY,
      description: 'Una lista de los problemas de piel detectados.',
      items: {
        type: Type.OBJECT,
        properties: {
          area: { type: Type.STRING, description: 'Ej: Frente, Mejillas, Nariz' },
          issue: { type: Type.STRING, description: 'Ej: Acné, Enrojecimiento, Arrugas, Manchas oscuras' },
          severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
          recommendation: { type: Type.STRING, description: 'Una recomendación específica para este problema.' }
        },
        required: ['area', 'issue', 'severity', 'recommendation']
      }
    },
    keyRecommendations: {
      type: Type.ARRAY,
      description: 'Una lista de 3-5 recomendaciones clave de alto nivel para el usuario.',
      items: { type: Type.STRING }
    }
  },
  required: ['skinType', 'overallScore', 'problems', 'keyRecommendations']
};

export const analyzeSkin = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };

    const textPart = {
      text: `Analiza la imagen proporcionada de un rostro humano. Identifica el tipo de piel, detecta cualquier problema como acné, arrugas, manchas oscuras o enrojecimiento, y proporciona recomendaciones clave para una rutina de cuidado de la piel. Estructura tu respuesta como un objeto JSON que se ajuste al esquema proporcionado. Concéntrate en ofrecer consejos prácticos, claros y concisos. La puntuación general debe reflejar el estado de la piel en función de los problemas detectados.`
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Corregido al modelo disponible
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisResult;

  } catch (error: any) {
    // Log error for debugging in development only
    if (import.meta.env.DEV) {
      console.error("Error analyzing skin with Gemini API:", error);
    }
    const errorMessage = error.toString().toLowerCase();

    if (errorMessage.includes('safety')) {
      throw new Error("La imagen fue bloqueada por nuestros filtros de seguridad. Por favor, sube una foto de un rostro sin contenido inapropiado.");
    }
    if (errorMessage.includes('invalid argument') || errorMessage.includes('request payload')) {
        throw new Error("La imagen parece ser inválida o está en un formato no compatible. Por favor, prueba con una foto diferente.");
    }
    if (errorMessage.includes('deadline') || errorMessage.includes('unavailable') || errorMessage.includes('network') || errorMessage.includes('503')) {
        throw new Error("RETRYABLE: Hubo un problema temporal al conectar con el servicio de IA. Por favor, inténtalo de nuevo.");
    }

    throw error;
  }
};