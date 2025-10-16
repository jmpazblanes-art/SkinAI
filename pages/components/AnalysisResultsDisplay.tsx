import React from 'react';
import { AnalysisResult, SkinProblem } from '../../types';
import Card from '../../components/ui/Card';
import { getProblemIcon } from '../../utils/skinUtils';

// Sub-component for displaying the score ring
const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    const colorClass = score > 80 ? 'stroke-primary' : score > 60 ? 'stroke-yellow-500' : 'stroke-red-500';

    return (
        <div className="relative flex items-center justify-center w-32 h-32">
            <svg className="transform -rotate-90" width="120" height="120" viewBox="0 0 100 100" aria-label={`Puntuación de la piel: ${score} de 100`}>
                <title>Puntuación de la piel: ${score} de 100</title>
                <circle cx="50" cy="50" r="45" stroke="currentColor" className="text-base-300" strokeWidth="10" fill="transparent" />
                <circle
                    cx="50" cy="50" r="45"
                    className={`transition-all duration-1000 ease-out ${colorClass}`}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <span className="absolute text-3xl font-bold text-base-content">{score}</span>
        </div>
    );
};

// Sub-component for displaying a single detected problem
const DetailedProblem: React.FC<{ problem: SkinProblem }> = ({ problem }) => {
  const iconClass = getProblemIcon(problem.issue);
  const isRedness = problem.issue.toLowerCase().includes('enrojecimiento');
  
  return (
    <div className="p-4 bg-base-200 rounded-lg flex items-start gap-4">
      <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ${isRedness ? 'text-red-500' : 'text-primary'}`}>
        <i className={`${iconClass} text-2xl`}></i>
      </div>
      <div className="flex-grow">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-base-content">{problem.issue} <span className="text-sm text-gray-500">en {problem.area}</span></p>
            <span className={`ml-4 flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${problem.severity === 'high' ? 'bg-red-100 text-red-800' : problem.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
              {problem.severity}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{problem.recommendation}</p>
      </div>
    </div>
  );
};


interface AnalysisResultsDisplayProps {
  result: AnalysisResult;
  imageUrl: string;
  showTitle?: boolean;
  containerClassName?: string;
}

// Main component with the new layout
const AnalysisResultsDisplay: React.FC<AnalysisResultsDisplayProps> = ({ result, imageUrl, showTitle = true, containerClassName = "mt-8 animate-fade-in" }) => (
    <Card className={containerClassName}>
        {showTitle && <h2 className="text-2xl font-bold text-base-content mb-4">Resultados del Análisis</h2>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex items-center justify-center">
                {imageUrl && <img src={imageUrl} alt="Imagen del análisis" className="rounded-lg shadow-md object-cover w-full h-auto" />}
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center p-4 bg-base-200 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Puntuación</h3>
                    <ScoreRing score={result.overallScore} />
                </div>
                <div className="flex flex-col items-center sm:items-start justify-center p-4 bg-base-200 rounded-lg h-full">
                    <h3 className="text-lg font-semibold mb-2">Tipo de Piel</h3>
                    <p className="capitalize text-primary font-bold text-3xl">{result.skinType}</p>
                </div>
            </div>
        </div>

        <div className="mt-8">
             <h3 className="text-lg font-semibold mb-3 flex items-center">
                <i className="iconoir-thumbs-up mr-2 text-primary"></i>
                Recomendaciones Clave
            </h3>
            <div className="p-4 bg-base-200 rounded-lg">
                <ul className="space-y-2">
                    {result.keyRecommendations.map((rec, i) => (
                        <li key={i} className="flex items-start">
                            <i className="iconoir-check text-primary mr-3 mt-1 flex-shrink-0"></i>
                            <span className="text-gray-600 dark:text-gray-400">{rec}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i className="iconoir-health-shield mr-2 text-primary"></i>
                Problemas Detectados
            </h3>
            {result.problems.length > 0 ? (
                 <div className="space-y-4">
                 {result.problems.map((prob, i) => (
                   <DetailedProblem key={i} problem={prob} />
                 ))}
               </div>
            ) : (
                <div className="p-4 bg-base-200 rounded-lg text-center text-gray-500">
                    <p>¡Felicidades! No se detectaron problemas significativos.</p>
                </div>
            )}
        </div>
    </Card>
);

export default AnalysisResultsDisplay;