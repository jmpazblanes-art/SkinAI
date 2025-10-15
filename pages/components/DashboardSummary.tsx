import React, { useState, useRef, useEffect } from 'react';
import { HistoryEntry } from '../../types';
import Card from '../../components/ui/Card';

interface DashboardSummaryProps {
    history: HistoryEntry[];
}

const ScoreChart: React.FC<{ entries: HistoryEntry[] }> = ({ entries }) => {
    const [activePoint, setActivePoint] = useState<{ x: number, y: number, score: number, date: string } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    if (entries.length < 2) {
        return <div className="text-center text-sm text-gray-500 flex items-center justify-center h-full">Realiza al menos dos análisis para ver tu progreso.</div>;
    }

    const maxScore = 100;
    const points = entries.map((entry, i) => {
        const x = entries.length > 1 ? (i / (entries.length - 1)) * 100 : 50;
        const y = 100 - (entry.analysis.overallScore / maxScore) * 100;
        return { x, y, score: entry.analysis.overallScore, date: new Date(entry.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) };
    });

    const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');
    const areaPoints = `${points[0].x},100 ${linePoints} ${points[points.length - 1].x},100`;

    useEffect(() => {
        const path = svgRef.current?.querySelector('.score-line-path');
        if (path instanceof SVGPolylineElement) {
            const length = path.getTotalLength();
            path.style.strokeDasharray = String(length);
            path.style.strokeDashoffset = String(length);
            // Trigger reflow
            path.getBoundingClientRect();
            path.style.transition = 'stroke-dashoffset 1s ease-out';
            path.style.strokeDashoffset = '0';
        }
    }, [entries]);

    const startDate = entries.length > 0 ? new Date(entries[0].date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : '';
    const endDate = entries.length > 0 ? new Date(entries[entries.length - 1].date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : '';

    return (
        <div className="relative h-full w-full">
            <svg ref={svgRef} viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" className="text-primary" stopOpacity="0.2" />
                        <stop offset="100%" className="text-primary" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polyline
                    points={areaPoints}
                    className="fill-primary"
                    style={{ fill: 'url(#scoreGradient)' }}
                />
                <polyline
                    className="score-line-path stroke-primary"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={linePoints}
                />
            </svg>

            <div className="absolute inset-0 flex">
                {points.map((p, i) => (
                    <div
                        key={i}
                        className="flex-1 h-full"
                        onMouseEnter={() => setActivePoint(p)}
                        onMouseLeave={() => setActivePoint(null)}
                    />
                ))}
            </div>

            {activePoint && (
                 <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ transform: 'translateZ(0)' }}>
                    <div
                        className="absolute top-0 bottom-0 w-px bg-primary/30"
                        style={{ left: `${activePoint.x}%` }}
                    />
                    <div
                        className="absolute w-3 h-3 bg-white dark:bg-base-100 border-2 border-primary rounded-full"
                        style={{
                            left: `${activePoint.x}%`,
                            top: `${activePoint.y}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    />
                    <div
                        className="absolute p-2 text-xs bg-base-100 dark:bg-neutral-800 text-base-content rounded-md shadow-lg"
                        style={{
                            left: `${activePoint.x}%`,
                            top: `${activePoint.y}%`,
                            transform: 'translate(-50%, -140%)',
                        }}
                    >
                        <div className="font-bold text-base">{activePoint.score}</div>
                        <div className="text-gray-500 dark:text-gray-400 whitespace-nowrap">{activePoint.date}</div>
                    </div>
                </div>
            )}
             <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-xs text-gray-400">
                <span>{startDate}</span>
                <span>{endDate}</span>
            </div>
        </div>
    );
};

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ history }) => {
    if (history.length === 0) return null;

    const latestEntry = history[0];
    const scoreHistoryEntries = history.slice(0, 5).reverse();
    
    const scoreChange = scoreHistoryEntries.length > 1 
        ? scoreHistoryEntries[scoreHistoryEntries.length - 1].analysis.overallScore - scoreHistoryEntries[scoreHistoryEntries.length - 2].analysis.overallScore 
        : 0;
        
    const scoreChangeColor = scoreChange > 0 ? 'text-primary' : scoreChange < 0 ? 'text-red-500' : 'text-gray-500';
    const scoreChangeIcon = scoreChange > 0 ? '▲' : scoreChange < 0 ? '▼' : '▬';
    
    return (
        <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="text-center md:text-left">
                    <h2 className="text-xl font-bold text-base-content">Tu Último Análisis</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{new Date(latestEntry.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <p className="text-5xl font-bold text-primary">{latestEntry.analysis.overallScore}</p>
                         {scoreHistoryEntries.length > 1 && (
                            <span className={`text-lg font-semibold ${scoreChangeColor}`}>
                                {scoreChangeIcon} {Math.abs(scoreChange)}
                            </span>
                        )}
                    </div>
                </div>
                 <div className="md:col-span-2 pb-6">
                    <h3 className="text-lg font-semibold text-base-content mb-2 text-center md:text-left">Progreso de Puntuación</h3>
                    <div className="h-32 text-primary">
                       <ScoreChart entries={scoreHistoryEntries} />
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default DashboardSummary;