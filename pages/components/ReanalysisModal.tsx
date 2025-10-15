import React from 'react';
import { AnalysisResult } from '../../types';
import Button from '../../components/ui/Button';
import AnalysisSkeleton from './AnalysisSkeleton';
import AnalysisResultsDisplay from './AnalysisResultsDisplay';

interface ReanalysisModalProps {
  isLoading: boolean;
  result: AnalysisResult | null;
  error: string | null;
  onClose: () => void;
}

const ReanalysisModal: React.FC<ReanalysisModalProps> = ({ isLoading, result, error, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in-fast" role="dialog" aria-modal="true">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-full text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors z-10"
          aria-label="Cerrar modal"
        >
          <i className="iconoir-xmark text-3xl"></i>
        </button>
        <div className="p-6">
            <h2 className="text-3xl font-bold text-center mb-4">Resultado del Nuevo Análisis</h2>
            
            {isLoading && !result && !error && <AnalysisSkeleton />}
            
            {error && (
                <div className="text-center text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-300 p-4 rounded-md flex items-center justify-center gap-3">
                    <i className="iconoir-warning-circle text-2xl flex-shrink-0"></i>
                    <p><span className="font-semibold">Error en el Análisis:</span> {error}</p>
                </div>
            )}
            
            {result && (
              <>
                <div className="text-center text-blue-700 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300 p-4 rounded-md mb-4 flex items-center justify-center gap-3">
                    <i className="iconoir-check-circle text-2xl flex-shrink-0"></i>
                    <p className="font-semibold">¡Análisis completado! Tu rutina y recomendaciones han sido actualizadas.</p>
                </div>
                <AnalysisResultsDisplay result={result} showTitle={false} containerClassName="mt-0 animate-fade-in" />
              </>
            )}
            
            <div className="mt-6 flex justify-center">
                <Button onClick={onClose} variant="secondary">Cerrar</Button>
            </div>
        </div>
      </div>
       <style>{`
            @keyframes fade-in-fast {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in-fast {
                animation: fade-in-fast 0.2s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default ReanalysisModal;