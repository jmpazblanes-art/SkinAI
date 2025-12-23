export interface User {
  id: string;
  name: string;
  email: string;
  birthDate?: string;
  profilePictureUrl?: string;
  subscription_tier?: 'free' | 'pro';
}

export interface SkinProblem {
  area: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface RoutineStep {
  paso: string;
  ingrediente_key: string;
  explicacion: string;
}

export interface AnalysisResult {
  analisis: {
    tipo_piel: 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive';
    edad_aparente: number;
    puntuacion: number;
    caracteristicas: string[];
    analisis_general?: string;
  };
  mensaje_motivador: string;
  rutina: {
    manana: RoutineStep[];
    noche: RoutineStep[];
  };
  problems?: SkinProblem[];
  affiliateProducts?: any[];
}

export interface DailyRoutineStep {
  id: string;
  time: 'morning' | 'evening';
  productType: string;
  instructions: string;
  completed: boolean;
}

export interface ProductRecommendation {
  id: string;
  name: string;
  brand: string;
  productType: string;
  price: number;
  imageUrl: string;
  affiliateLink: string;
  description: string;
  reason?: string;
}

export interface HistoryEntry {
  id: string;
  date: string;
  imageUrl: string;
  analysis: AnalysisResult;
  routine: DailyRoutineStep[];
}

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

export type SubscriptionTier = 'free' | 'pro';