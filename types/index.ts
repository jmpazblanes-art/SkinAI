export interface User {
  id: string;
  name: string;
  email: string;
  birthDate?: string;
  profilePictureUrl?: string;
}

export interface SkinProblem {
  area: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface AnalysisResult {
  skinType: 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive';
  overallScore: number;
  problems: SkinProblem[];
  keyRecommendations: string[];
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