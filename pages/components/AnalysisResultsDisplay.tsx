import React from 'react';
import { AnalysisResult, SkinProblem } from '../../types';
import Card from '../../components/ui/Card';
import { getProblemIcon } from '../../utils/skinUtils';
import LazyImage from '../../components/ui/LazyImage';

// Sub-component for displaying the score ring
const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    const colorClass = score > 80 ? 'stroke-primary' : score > 60 ? 'stroke-yellow-500' : 'stroke-red-500';

    return (
        <div className="relative flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32">
            <svg className="transform -rotate-90 w-20 h-20 sm:w-[120px] sm:h-[120px]" viewBox="0 0 100 100" aria-label={`Puntuación de la piel: ${score} de 100`}>
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
            <span className="absolute text-2xl sm:text-3xl font-bold text-base-content">{score}</span>
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
const AnalysisResultsDisplay: React.FC<AnalysisResultsDisplayProps> = ({ result, imageUrl, showTitle = true, containerClassName = "mt-8 animate-fade-in" }) => {
    // Helper to get product for a step
    const getProductForStep = (ingredientKey: string) => {
        const products = (result as any).affiliateProducts || [];
        return products.find((p: any) => p.ingredient_key === ingredientKey);
    };

    return (
        <Card className={containerClassName}>
            {showTitle && <h2 className="text-2xl font-bold text-base-content mb-4">Resultados del Análisis</h2>}

            {/* Verdict Section */}
            {(result.mensaje_motivador || result.analisis?.analisis_general) && (
                <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <i className="iconoir-quote-solid text-6xl text-primary"></i>
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-3 flex items-center">
                        <i className="iconoir-magic-wand mr-2"></i>
                        El Veredicto de SkinAI
                    </h3>
                    <p className="text-lg text-base-content leading-relaxed italic relative z-10 font-medium">
                        "{result.mensaje_motivador || result.analisis?.analisis_general}"
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 flex items-center justify-center">
                    {imageUrl && (
                        <div className="relative w-full max-w-sm mx-auto">
                            <img
                                src={imageUrl}
                                alt="Imagen del análisis"
                                className="rounded-2xl shadow-2xl object-cover w-full max-h-64 border-4 border-base-200"
                            />
                            <div className="absolute -bottom-4 -right-4 bg-base-100 p-2 rounded-lg shadow-lg border border-base-200">
                                <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                    Analizado
                                </span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-center p-4 bg-base-200 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Puntuación</h3>
                        <ScoreRing score={result.analisis?.puntuacion || 0} />
                    </div>
                    <div className="flex flex-col items-center sm:items-start justify-center p-4 bg-base-200 rounded-lg h-full">
                        <h3 className="text-lg font-semibold mb-2">Tipo de Piel</h3>
                        <p className="text-primary font-bold text-3xl">
                            {result.analisis?.tipo_piel === 'oily' ? 'Grasa' :
                                result.analisis?.tipo_piel === 'dry' ? 'Seca' :
                                    result.analisis?.tipo_piel === 'combination' ? 'Mixta' :
                                        result.analisis?.tipo_piel === 'sensitive' ? 'Sensible' :
                                            result.analisis?.tipo_piel === 'normal' ? 'Normal' :
                                                result.analisis?.tipo_piel || 'Normal'}
                        </p>
                        <p className="text-sm text-base-content/60 mt-2">Edad aparente: <span className="font-semibold text-base-content">{result.analisis?.edad_aparente} años</span></p>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <i className="iconoir-health-shield mr-2 text-primary"></i>
                    Características de tu piel
                </h3>
                {result.analisis?.caracteristicas && result.analisis.caracteristicas.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {result.analisis.caracteristicas.map((char, i) => (
                            <span key={i} className="px-3 py-1 bg-base-200 rounded-full text-sm font-medium text-base-content/80">
                                {char}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 bg-base-200 rounded-lg text-center text-gray-500">
                        <p>No se detectaron características específicas.</p>
                    </div>
                )}
            </div>

            {/* Routine Section */}
            {result.rutina && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Morning Routine */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center text-orange-500">
                            <i className="iconoir-sun-light mr-2"></i>
                            Rutina de Mañana
                        </h3>
                        <div className="space-y-6">
                            {result.rutina.manana.map((step, i) => {
                                const product = getProductForStep(step.ingrediente_key);
                                return (
                                    <div key={i} className="bg-base-200 rounded-xl overflow-hidden border border-base-300 shadow-sm">
                                        <div className="p-4 border-b border-base-300/50">
                                            <h4 className="font-bold text-base-content text-lg mb-1">{step.paso}</h4>
                                            <p className="text-sm text-base-content/70">{step.explicacion}</p>
                                        </div>

                                        {product && (
                                            <div className="p-4 bg-base-100/50">
                                                <div className="flex flex-col xs:flex-row gap-4">
                                                    {product.image_url && (
                                                        <div className="w-full xs:w-20 h-28 xs:h-20 flex-shrink-0 bg-white rounded-lg p-2 flex items-center justify-center border border-base-200">
                                                            <LazyImage
                                                                src={product.image_url}
                                                                alt={product.product_name}
                                                                className="max-h-full max-w-full object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-grow">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 inline-block ${product.price_tier === 'budget' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                product.price_tier === 'premium' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                }`}>
                                                                {product.price_tier === 'budget' ? 'Económico' :
                                                                    product.price_tier === 'premium' ? 'Premium' : 'Recomendado'}
                                                            </span>
                                                        </div>
                                                        <h5 className="font-semibold text-sm text-base-content line-clamp-2 mb-3">
                                                            {product.product_name}
                                                        </h5>
                                                        <a
                                                            href={product.affiliate_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-bold text-primary-content bg-primary rounded-lg hover:bg-primary-focus transition-colors shadow-sm"
                                                        >
                                                            Ver en Amazon <i className="iconoir-arrow-right ml-1"></i>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Evening Routine */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center text-indigo-500">
                            <i className="iconoir-half-moon mr-2"></i>
                            Rutina de Noche
                        </h3>
                        <div className="space-y-6">
                            {result.rutina.noche.map((step, i) => {
                                const product = getProductForStep(step.ingrediente_key);
                                return (
                                    <div key={i} className="bg-base-200 rounded-xl overflow-hidden border border-base-300 shadow-sm">
                                        <div className="p-4 border-b border-base-300/50">
                                            <h4 className="font-bold text-base-content text-lg mb-1">{step.paso}</h4>
                                            <p className="text-sm text-base-content/70">{step.explicacion}</p>
                                        </div>

                                        {product && (
                                            <div className="p-4 bg-base-100/50">
                                                <div className="flex flex-col xs:flex-row gap-4">
                                                    {product.image_url && (
                                                        <div className="w-full xs:w-20 h-28 xs:h-20 flex-shrink-0 bg-white rounded-lg p-2 flex items-center justify-center border border-base-200">
                                                            <LazyImage
                                                                src={product.image_url}
                                                                alt={product.product_name}
                                                                className="max-h-full max-w-full object-contain"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-grow">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 inline-block ${product.price_tier === 'budget' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                product.price_tier === 'premium' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                }`}>
                                                                {product.price_tier === 'budget' ? 'Económico' :
                                                                    product.price_tier === 'premium' ? 'Premium' : 'Recomendado'}
                                                            </span>
                                                        </div>
                                                        <h5 className="font-semibold text-sm text-base-content line-clamp-2 mb-3">
                                                            {product.product_name}
                                                        </h5>
                                                        <a
                                                            href={product.affiliate_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-bold text-primary-content bg-primary rounded-lg hover:bg-primary-focus transition-colors shadow-sm"
                                                        >
                                                            Ver en Amazon <i className="iconoir-arrow-right ml-1"></i>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default AnalysisResultsDisplay;