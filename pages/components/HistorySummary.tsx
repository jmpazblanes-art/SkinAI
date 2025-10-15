import React from 'react';
import { HistoryEntry } from '../../types';
import Card from '../../components/ui/Card';

interface HistorySummaryProps {
    history: HistoryEntry[];
}

const HistorySummary: React.FC<HistorySummaryProps> = ({ history }) => {
    if (history.length === 0) return null;

    const avgScore = history.reduce((acc, curr) => acc + curr.analysis.overallScore, 0) / history.length;

    // Fix: Explicitly typed the accumulator and asserted the initial value's type to ensure correct type inference for the reduce operation.
    const skinTypeCounts = history.reduce((acc: Record<string, number>, curr) => {
        const type = curr.analysis.skinType;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Fix: Explicitly cast sorting values to number to fix arithmetic operation error.
    const mostCommonSkinType = Object.entries(skinTypeCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'N/A';
    
    const allProblems = history.flatMap(h => h.analysis.problems.map(p => p.issue));
    // Fix: Explicitly typed the accumulator and asserted the initial value's type to ensure correct type inference for the reduce operation.
    const problemCounts = allProblems.reduce((acc: Record<string, number>, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <Card className="mb-6">
            <h2 className="text-xl font-bold text-base-content mb-4">Resumen de tu Historial</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-base-200 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Puntuación Media</p>
                    <p className="text-2xl font-bold text-primary">{avgScore.toFixed(0)}</p>
                </div>
                <div className="p-4 bg-base-200 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de Piel Común</p>
                    <p className="text-2xl font-bold text-primary capitalize">{mostCommonSkinType}</p>
                </div>
                <div className="p-4 bg-base-200 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total de Análisis</p>
                    <p className="text-2xl font-bold text-primary">{history.length}</p>
                </div>
            </div>
             {Object.keys(problemCounts).length > 0 && (
                <div className="mt-4">
                     <h3 className="text-md font-semibold text-base-content mb-2">Problemas Frecuentes</h3>
                     <div className="flex flex-wrap gap-2">
                        {/* Fix: Explicitly cast sorting values to number to fix arithmetic operation error. */}
                        {Object.entries(problemCounts).sort((a,b) => (b[1] as number) - (a[1] as number)).slice(0, 5).map(([issue, count]) => (
                             <span key={issue} className="px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-primary dark:bg-indigo-900/50 dark:text-indigo-300">
                                {issue} ({count})
                            </span>
                        ))}
                     </div>
                </div>
            )}
        </Card>
    );
};

export default HistorySummary;