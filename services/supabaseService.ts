import { supabase } from './supabaseClient';
import { AnalysisResult } from '../types';

export const uploadSkinAnalysisImage = async (base64data: string): Promise<string> => {
  const fileName = `skin-analysis-${Date.now()}.jpg`;

  // Convert base64 to Blob
  const response = await fetch(base64data);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from('skin-analyses')
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    console.error('Error subiendo imagen:', error);
    throw error;
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage.from('skin-analyses').getPublicUrl(fileName);
  return publicUrlData.publicUrl;
};

export const saveSkinAnalysis = async (
  userId: string | null,
  analysis: AnalysisResult,
  imageUrl: string
) => {
  console.log('Intentando guardar en Supabase:', {
    user_id: userId,
    skin_type: analysis.skinType,
    overall_score: analysis.overallScore,
    problems: analysis.problems,
    recommendations: analysis.keyRecommendations,
    image_url: imageUrl,
    result: analysis
  });

  const { data, error } = await supabase
    .from('analysis')
    .insert([
      {
        user_id: userId,
        skin_type: analysis.skinType,
        overall_score: analysis.overallScore,
        problems: analysis.problems,
        recommendations: analysis.keyRecommendations,
        image_url: imageUrl,
        result: analysis
      }
    ]);

  if (error) {
    console.error('Error saving skin analysis:', error);
    throw error;
  }
  return data;
};

export const getUserAnalysisHistory = async (userId: string | null, page: number, pageSize: number) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase.from('analysis').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
  if (userId) query = query.eq('user_id', userId);
  const { data, error, count } = await query;
  if (error) {
    console.error('Error fetching analysis history:', error);
    throw error;
  }
  return { data, count };
};

export const testInsertMinimalAnalysis = async () => {
  const testData = {
    user_id: null,
    skin_type: 'oily',
    overall_score: 99,
    problems: [{ area: 'test', issue: 'test', severity: 'low', recommendation: 'test' }],
    recommendations: ['test rec 1', 'test rec 2'],
    image_url: 'http://example.com/image.jpg',
    result: { "test": "data" }
  };

  console.log("Intentando guardar datos MÍNIMOS de prueba en Supabase:", JSON.stringify(testData, null, 2));

  const { data, error } = await supabase
    .from('analysis')
    .insert([testData])
    .select();

  if (error) {
    console.error('Error guardando el análisis MÍNIMO de prueba:', error);
    throw error;
  }

  console.log('Análisis MÍNIMO de prueba guardado con éxito:', data);
  return data;
};