import { supabase } from './supabaseClient';
import { AnalysisResult } from '../types';

export const uploadSkinAnalysisImage = async (base64data: string): Promise<string> => {
  const fileName = `skin-analysis-${Date.now()}.jpg`;
  const response = await fetch(base64data);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from('skin-analyses')
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    throw new Error(`Error al subir la imagen: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from('skin-analyses').getPublicUrl(fileName);
  return publicUrlData.publicUrl;
};

export const createAnalysisPlaceholder = async (
  userId: string | null,
  imageUrl: string | null = null
) => {
  const { data, error } = await supabase
    .from('analysis')
    .insert([
      {
        user_id: userId,
        imagen_url: imageUrl,
        resultado_json: null,
        tipo_piel: null,
        preocupaciones: null,
        edad_aparente: null,
        modelo_ia: 'gemini-1.5-pro'
      }
    ])
    .select();

  if (error) {
    throw new Error(`Error al crear el análisis: ${error.message}`);
  }
  return data;
};

export const updateAnalysisImageUrl = async (
  analysisId: string,
  imageUrl: string
) => {
  const { data, error } = await supabase
    .from('analysis')
    .update({ imagen_url: imageUrl })
    .eq('id', analysisId)
    .select();

  if (error) {
    throw new Error(`Error al actualizar la URL de la imagen: ${error.message}`);
  }
  return data;
};

export const saveSkinAnalysis = async (
  userId: string | null,
  analysis: AnalysisResult,
  imageUrl: string
) => {
  const { data, error } = await supabase
    .from('analysis')
    .insert([
      {
        user_id: userId,
        tipo_piel: analysis.analisis.tipo_piel,
        preocupaciones: analysis.analisis.caracteristicas, // Saving string[] to JSONB column
        imagen_url: imageUrl,
        resultado_json: analysis,
        modelo_ia: 'gemini-1.5-pro'
      }
    ])
    .select();

  if (error) {
    throw new Error(`Error al guardar el análisis: ${error.message}`);
  }
  return data;
};

export const getAnalysisById = async (analysisId: string) => {
  const { data, error } = await supabase
    .from('analysis')
    .select('*')
    .eq('id', analysisId)
    .maybeSingle();

  if (error) {
    throw new Error(`Error al obtener el análisis: ${error.message}`);
  }
  return data;
};

export const getUserAnalysisHistory = async (userId: string | null, page: number, pageSize: number) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('analysis')
    .select('*', { count: 'exact' })
    .order('fecha_analisis', { ascending: false })
    .range(from, to);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Error al obtener el historial: ${error.message}`);
  }
  return { data, count };
};

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  image_url: string;
  url_compra: string;
  url_affiliate?: string;
  ingredient_key?: string;
}

export interface ProductRecommendation {
  id: string;
  user_id: string;
  analysis_id: string;
  product_id: string;
  motivo?: string;
  confidence_score?: number;
  products?: Product;
}

export const getRecommendations = async (
  analysisId: string
): Promise<ProductRecommendation[]> => {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*, products(*)')
    .eq('analysis_id', analysisId);

  if (error) {
    throw new Error(`Error al obtener recomendaciones: ${error.message}`);
  }

  return data || [];
};

export const getUserRecommendations = async (
  userId: string,
  limit: number = 10
): Promise<ProductRecommendation[]> => {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('user_id', userId)
    .limit(limit);

  if (error) {
    throw new Error(`Error al obtener recomendaciones del usuario: ${error.message}`);
  }

  return data || [];
};

export interface AffiliateProduct {
  id: string;
  ingredient_key: string;
  product_name: string;
  affiliate_url: string;
  price_tier: 'budget' | 'mid' | 'premium';
  skin_type_target: string[];
  image_url?: string;
}

export const getAffiliateProducts = async (ingredientKeys: string[]): Promise<AffiliateProduct[]> => {
  if (!ingredientKeys) return [];

  const selectFields = 'id, product_name, affiliate_url, image_url, price_tier, ingredient_key';

  try {
    let products: AffiliateProduct[] = [];

    if (ingredientKeys.length > 0) {
      // Búsqueda difusa (fuzzy search) similar a la Edge Function
      const orFilter = ingredientKeys
        .map(key => `ingredient_key.ilike.%${key}%,product_name.ilike.%${key}%`)
        .join(',');

      const { data, error } = await supabase
        .from('affiliate_products')
        .select(selectFields)
        .or(orFilter)
        .limit(10);

      if (error) throw error;
      products = data as any[] || [];
    }

    // Fallback si no hay resultados
    if (products.length === 0) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('affiliate_products')
        .select(selectFields)
        .limit(5);

      if (fallbackError) throw fallbackError;
      products = fallbackData as any[] || [];
    }

    return products;
  } catch (error) {
    console.error('Error fetching affiliate products:', error);
    return [];
  }
};

export const getSubscriptionTier = async (userId: string): Promise<'free' | 'pro'> => {
  // First try to get from public.users table
  const { data, error } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  if (error || !data) {
    // Fallback: check auth metadata
    const { data: authData } = await supabase.auth.getUser();
    if (authData.user?.id === userId) {
      return (authData.user.user_metadata?.plan === 'monthly' || authData.user.user_metadata?.plan === 'annual') ? 'pro' : 'free';
    }
    return 'free';
  }

  return data.subscription_tier === 'pro' ? 'pro' : 'free';
};

export const testInsertMinimalAnalysis = async () => {
  if (!import.meta.env.DEV) {
    throw new Error('Esta función solo está disponible en modo desarrollo');
  }

  const testData = {
    user_id: null,
    tipo_piel: 'oily' as const,
    preocupaciones: ['acne', 'oiliness'],
    imagen_url: 'http://example.com/image.jpg',
    resultado_json: {
      analisis: {
        tipo_piel: 'oily',
        edad_aparente: 25,
        puntuacion: 80,
        caracteristicas: ['acne', 'oiliness']
      },
      mensaje_motivador: 'You look great!',
      rutina: {
        manana: [],
        noche: []
      }
    },
    modelo_ia: 'gemini-1.5-pro'
  };

  const { data, error } = await supabase
    .from('analysis')
    .insert([testData])
    .select();

  if (error) {
    throw new Error(`Error en test: ${error.message}`);
  }

  return data;
};