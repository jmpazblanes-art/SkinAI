import { supabase } from '../services/supabaseClient';

/**
 * Supabase Edge Functions Integration
 */

interface SkinAnalysisResponse {
  success: boolean;
  analysis_id: string;
  analisis: {
    tipo_piel: string;
    caracteristicas: string[];
    edad_aparente: number;
    puntuacion: number;
  };
  mensaje_motivador: string;
  rutina: {
    manana: any[];
    noche: any[];
  };
  productos: any[];
  plan_type?: string;
  analisis_restantes?: number;
  error?: string;
  message?: string; // Por compatibilidad
}

/**
 * Llama a la Edge Function de Supabase para realizar el análisis de piel
 */
export async function callSkinAnalysisWebhook(
  userId: string,
  imageBase64: string,
  metadata?: { birthDate?: string }
): Promise<SkinAnalysisResponse> {
  try {
    console.log('=== CALLING SUPABASE EDGE FUNCTION ===');
    console.log('Function: analyze-skin');

    const { data, error } = await supabase.functions.invoke('analyze-skin', {
      body: {
        image: imageBase64,
        user_id: userId,
        birth_date: metadata?.birthDate
      }
    });

    if (error) {
      console.error('❌ Error invoking Edge Function:', error);
      throw new Error(`Error de Supabase: ${error.message}`);
    }

    console.log('✅ Edge Function llamada exitosamente', data);

    if (data.success === false) {
      throw new Error(data.error || 'Error en el análisis');
    }

    return data as SkinAnalysisResponse;

  } catch (error: any) {
    console.error('❌ Error en callSkinAnalysisWebhook:', error);
    throw error;
  }
}

// Funciones legacy - mantener por compatibilidad
export async function callRecommendationsWebhook(
  analysisId: string,
  userId: string
): Promise<any> {
  console.warn('⚠️ callRecommendationsWebhook is deprecated.');
  return null;
}

export async function createStripeCheckout(
  userId: string,
  plan: 'premium_monthly' | 'premium_annual',
  successUrl: string,
  cancelUrl: string
): Promise<any> {
  try {
    // Use relative path to leverage Vite proxy in development
    const webhookUrl = '/webhook/stripe-create-checkout';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        plan,
        success_url: successUrl,
        cancel_url: cancelUrl
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error creando sesión de Stripe:', error);
    throw error;
  }
}