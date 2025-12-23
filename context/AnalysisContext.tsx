import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AnalysisResult, HistoryEntry, DailyRoutineStep } from '../types';
import { MOCK_HISTORY, MOCK_RECOMMENDATIONS } from '../constants';

export interface AnalysisResultWithImage {
  result: AnalysisResult;
  imageUrl: string;
  analysisId?: string; // ID del análisis guardado en Supabase
}

interface AnalysisContextType {
  latestAnalysis: AnalysisResultWithImage | null;
  history: HistoryEntry[];
  setLatestAnalysis: (result: AnalysisResult | null, image: string, addToHistory?: boolean, analysisId?: string) => void;
  updateHistoryEntry: (entryId: string, newAnalysis: AnalysisResult) => void;
  getRecommendations: () => typeof MOCK_RECOMMENDATIONS;
  getRoutine: () => DailyRoutineStep[];
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

const generateRoutineForAnalysis = (analysis: AnalysisResult): DailyRoutineStep[] => {
  const routine: DailyRoutineStep[] = [];
  let stepId = 0;

  // Morning Routine
  switch (analysis.analisis.tipo_piel) {
    case 'oily':
      routine.push({ id: `m${++stepId}`, time: 'morning', productType: 'Limpiador en Gel', instructions: 'Lava tu cara con un limpiador en gel para controlar el sebo.', completed: false });
      routine.push({ id: `m${++stepId}`, time: 'morning', productType: 'Hidratante Ligera', instructions: 'Usa una hidratante sin aceites para evitar brillos.', completed: false });
      break;
    case 'dry':
      routine.push({ id: `m${++stepId}`, time: 'morning', productType: 'Limpiador Cremoso', instructions: 'Limpia suavemente con un limpiador hidratante.', completed: false });
      routine.push({ id: `m${++stepId}`, time: 'morning', productType: 'Crema Hidratante Rica', instructions: 'Aplica una crema rica con ceramidas para nutrir la piel.', completed: false });
      break;
    case 'combination':
      routine.push({ id: `m${++stepId}`, time: 'morning', productType: 'Limpiador Suave', instructions: 'Usa un limpiador suave que no reseque las mejillas.', completed: false });
      routine.push({ id: `m${++stepId}`, time: 'morning', productType: 'Hidratante Equilibrante', instructions: 'Aplica una hidratante que controle la zona T sin resecar.', completed: false });
      break;
    default: // Normal & Sensitive
      routine.push({ id: `m${++stepId}`, time: 'morning', productType: 'Limpiador Suave', instructions: 'Lava tu cara con un limpiador muy suave.', completed: false });
      routine.push({ id: `m${++stepId}`, time: 'morning', productType: 'Hidratante Calmante', instructions: 'Usa una hidratante para pieles sensibles.', completed: false });
  }
  routine.push({ id: `m${++stepId}`, time: 'morning', productType: 'Protector Solar SPF 50', instructions: 'El paso más importante: protege tu piel del sol.', completed: false });

  // Evening Routine - Base
  switch (analysis.analisis.tipo_piel) {
    case 'oily':
      routine.push({ id: `e${++stepId}`, time: 'evening', productType: 'Doble Limpieza', instructions: 'Usa un limpiador en aceite seguido por tu limpiador en gel.', completed: false });
      routine.push({ id: `e${++stepId}`, time: 'evening', productType: 'Hidratante Ligera', instructions: 'Aplica tu hidratante sin aceites.', completed: false });
      break;
    default:
      routine.push({ id: `e${++stepId}`, time: 'evening', productType: 'Limpiador', instructions: 'Limpia tu rostro para remover impurezas del día.', completed: false });
      routine.push({ id: `e${++stepId}`, time: 'evening', productType: 'Crema de Noche', instructions: 'Usa una crema nutritiva para la noche.', completed: false });
  }

  // Evening Routine - Treatments based on problems
  const mainProblem = (analysis.problems || []).sort((a, b) => (b.severity === 'high' ? 1 : -1) - (a.severity === 'high' ? 1 : -1))[0];
  if (mainProblem) {
    let treatmentStep: DailyRoutineStep | null = null;
    const issue = mainProblem.issue.toLowerCase();

    if (issue.includes('acné') || issue.includes('puntos negros')) {
      treatmentStep = { id: `e_treat_${++stepId}`, time: 'evening', productType: 'Sérum con Ácido Salicílico', instructions: 'Aplica un sérum con BHA para limpiar poros, antes de hidratar.', completed: false };
    } else if (issue.includes('arrugas') || issue.includes('líneas finas')) {
      treatmentStep = { id: `e_treat_${++stepId}`, time: 'evening', productType: 'Sérum con Retinol', instructions: 'Usa un sérum con retinol para las líneas finas, antes de hidratar.', completed: false };
    } else if (issue.includes('enrojecimiento') || analysis.analisis.tipo_piel === 'sensitive') {
      treatmentStep = { id: `e_treat_${++stepId}`, time: 'evening', productType: 'Sérum Calmante', instructions: 'Aplica un sérum con niacinamida o centella asiática.', completed: false };
    } else if (issue.includes('manchas')) {
      treatmentStep = { id: `e_treat_${++stepId}`, time: 'evening', productType: 'Sérum Despigmentante', instructions: 'Usa un sérum con vitamina C o ácido azelaico para unificar el tono.', completed: false };
    }

    if (treatmentStep) {
      // Insert treatment before the last step (moisturizer)
      routine.splice(routine.length - 1, 0, treatmentStep);
    }
  }

  return routine;
};

export const AnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [latestAnalysis, setAnalysis] = useState<AnalysisResultWithImage | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(MOCK_HISTORY);

  const setLatestAnalysis = (result: AnalysisResult | null, imageUrl: string, addToHistory = true, analysisId?: string) => {
    if (result && imageUrl) {
      const newAnalysis: AnalysisResultWithImage = { result, imageUrl, analysisId };
      setAnalysis(newAnalysis);

      if (addToHistory) {
        // Generate the specific routine for this analysis
        const newRoutine = generateRoutineForAnalysis(result);

        const newEntry: HistoryEntry = {
          id: `hist_${Date.now()}`,
          date: new Date().toISOString(),
          imageUrl,
          analysis: result,
          routine: newRoutine,
        };
        setHistory(prev => [newEntry, ...prev]);
      }
    } else {
      setAnalysis(null);
    }
  };

  const updateHistoryEntry = (entryId: string, newAnalysis: AnalysisResult) => {
    setHistory(prevHistory =>
      prevHistory.map(entry => {
        if (entry.id === entryId) {
          return {
            ...entry,
            analysis: newAnalysis,
            routine: generateRoutineForAnalysis(newAnalysis),
          };
        }
        return entry;
      })
    );
  };

  const getRecommendations = () => {
    // In a real app, this would be generated by AI based on latestAnalysis
    return MOCK_RECOMMENDATIONS;
  }

  const getRoutine = () => {
    if (latestAnalysis) {
      return generateRoutineForAnalysis(latestAnalysis.result);
    }
    // Return empty routine if no analysis has been performed yet
    return [];
  }

  return (
    <AnalysisContext.Provider value={{ latestAnalysis, history, setLatestAnalysis, updateHistoryEntry, getRecommendations, getRoutine }}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};