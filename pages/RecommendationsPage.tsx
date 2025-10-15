import React, { useState, useMemo, useEffect } from 'react';
import { AnalysisResult, ProductRecommendation } from '../types';
import Card from '../components/ui/Card';
import { useAnalysis } from '../context/AnalysisContext';
import RecommendationsSkeleton from './components/RecommendationsSkeleton';
import LazyImage from '../components/ui/LazyImage';
import { MOCK_RECOMMENDATIONS } from '../constants';


// --- AI SIMULATION LOGIC ---

// A simple keyword-based scoring system to simulate AI recommendations
const generateScores = (analysis: AnalysisResult, products: ProductRecommendation[]): (ProductRecommendation & { score: number; reason: string })[] => {
    return products.map(product => {
        let score = 0;
        let reasons: string[] = [];
        const productText = `${product.name} ${product.description}`.toLowerCase();

        // Score based on skin type
        switch (analysis.skinType) {
            case 'oily':
                if (productText.includes('gel') || productText.includes('ligera') || productText.includes('control de sebo') || productText.includes('matificante')) {
                    score += 20;
                    reasons.push('Ideal para piel grasa.');
                }
                break;
            case 'dry':
                if (productText.includes('cremoso') || productText.includes('rica') || productText.includes('hidratante') || productText.includes('ceramidas')) {
                    score += 20;
                    reasons.push('Perfecto para piel seca.');
                }
                break;
            case 'combination':
                 if (productText.includes('equilibrante') || productText.includes('suave')) {
                    score += 15;
                    reasons.push('Bueno para piel mixta.');
                }
                break;
            case 'sensitive':
                if (productText.includes('sensible') || productText.includes('calmante') || productText.includes('suave')) {
                    score += 25;
                    reasons.push('Recomendado para piel sensible.');
                }
                break;
        }
        
        // Score based on problems
        analysis.problems.forEach(problem => {
            const issue = problem.issue.toLowerCase();
            if ((issue.includes('acné') || issue.includes('puntos negros') || issue.includes('congestión')) && (productText.includes('salicílico') || productText.includes('niacinamida') || productText.includes('congestión'))) {
                score += 30;
                reasons.push('Ayuda a combatir el acné.');
            }
            if ((issue.includes('manchas')) && (productText.includes('niacinamida') || productText.includes('vitamina c') || productText.includes('glicólico'))) {
                score += 25;
                reasons.push('Eficaz contra las manchas.');
            }
            if ((issue.includes('arrugas') || issue.includes('líneas finas')) && (productText.includes('retinol') || productText.includes('hialurónico'))) {
                score += 25;
                reasons.push('Combate líneas finas.');
            }
             if ((issue.includes('enrojecimiento')) && (productText.includes('calmante') || productText.includes('centella'))) {
                score += 30;
                reasons.push('Calma el enrojecimiento.');
            }
        });

        if (product.productType.toLowerCase().includes('protector solar')) {
            score += 15;
            reasons.push('Protección solar esencial.');
        }

        if (reasons.length === 0) {
            reasons.push('Una buena opción general.');
        }

        return { ...product, score, reason: Array.from(new Set(reasons)).slice(0, 1).join(' ') };
    });
};

const generateProductRecommendations = async (analysis: AnalysisResult): Promise<ProductRecommendation[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    const allProducts = MOCK_RECOMMENDATIONS;
    const scoredProducts = generateScores(analysis, allProducts);
    return scoredProducts.sort((a, b) => b.score - a.score).slice(0, 8);
};


// --- COMPONENT ---

const RecommendationsPage = () => {
    const { latestAnalysis } = useAnalysis();
    const [displayedRecommendations, setDisplayedRecommendations] = useState<ProductRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [filters, setFilters] = useState({
        productType: 'all',
        brand: 'all',
        maxPrice: 100
    });
    
    useEffect(() => {
        const fetchRecommendations = async () => {
            setIsLoading(true);
            if (latestAnalysis?.result) {
                const personalizedRecs = await generateProductRecommendations(latestAnalysis.result);
                setDisplayedRecommendations(personalizedRecs);
            } else {
                setDisplayedRecommendations(MOCK_RECOMMENDATIONS);
            }
            setIsLoading(false);
        };
        fetchRecommendations();
    }, [latestAnalysis]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        // Fix: Ensure maxPrice is stored as a number, not a string from the input.
        setFilters(prev => ({...prev, [name]: name === 'maxPrice' ? Number(value) : value}));
    };

    const filteredRecommendations = useMemo(() => {
        return displayedRecommendations.filter(p => {
            const typeMatch = filters.productType === 'all' || p.productType === filters.productType;
            // Fix: Ensured comparison is correct to avoid potential scope/typo issues.
            const brandMatch = filters.brand === 'all' || p.brand === filters.brand;
            const priceMatch = p.price <= filters.maxPrice;
            return typeMatch && brandMatch && priceMatch;
        });
    }, [displayedRecommendations, filters]);
    
    // Fix: Using `...new Set()` is a common and idiomatic way to get unique values from an array. This should resolve type inference issues.
    // Fix: Explicitly provide generic type to Set to avoid `unknown` type when spreading.
    const uniqueTypes: string[] = ['all', ...new Set<string>(displayedRecommendations.map(p => p.productType))];
    // Fix: Explicitly provide generic type to Set to avoid `unknown` type when spreading.
    const uniqueBrands: string[] = ['all', ...new Set<string>(displayedRecommendations.map(p => p.brand))];

    return (
        <div>
            <h1 className="text-3xl font-bold text-base-content mb-2">Recomendaciones de Productos</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                {latestAnalysis 
                    ? `Basado en tu último análisis de piel (${latestAnalysis.result.skinType}), aquí tienes algunos productos recomendados.`
                    : 'Estos son nuestros productos más populares. ¡Realiza un análisis para obtener recomendaciones personalizadas!'
                }
            </p>

            <Card className="mb-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-center">
                    <div>
                        <label htmlFor="productType" className="block text-sm font-medium text-base-content mb-1">Tipo de producto</label>
                        <div className="relative">
                            <select 
                                id="productType" 
                                name="productType" 
                                onChange={handleFilterChange} 
                                value={filters.productType} 
                                className="appearance-none block w-full bg-base-100 px-4 py-2 pr-10 border border-base-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-focus focus:border-transparent sm:text-sm transition-colors duration-150"
                            >
                                {uniqueTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-base-content mb-1">Marca</label>
                        <div className="relative">
                            <select 
                                id="brand" 
                                name="brand" 
                                onChange={handleFilterChange} 
                                value={filters.brand} 
                                className="appearance-none block w-full bg-base-100 px-4 py-2 pr-10 border border-base-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-focus focus:border-transparent sm:text-sm transition-colors duration-150"
                            >
                                {uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="maxPrice" className="block text-sm font-medium text-base-content">Precio máximo: {filters.maxPrice}€</label>
                        <input type="range" id="maxPrice" name="maxPrice" min="0" max="100" value={filters.maxPrice} onChange={handleFilterChange} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer mt-2 accent-primary"/>
                    </div>
                </div>
            </Card>

            {isLoading ? <RecommendationsSkeleton count={6} /> : (
                <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRecommendations.map(product => (
                        <Card key={product.id} className="p-0 flex flex-col relative overflow-hidden">
                            {product.reason && latestAnalysis && (
                                <div className="absolute top-2 left-2 z-10 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center animate-fade-in-fast">
                                    <i className="iconoir-sparkle mr-1"></i>
                                    {product.reason}
                                </div>
                            )}
                            <LazyImage src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded-t-xl"/>
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="text-lg font-bold text-base-content">{product.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{product.brand}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 flex-grow">{product.description}</p>
                                <div className="flex justify-between items-center mt-4">
                                    <p className="text-lg font-semibold text-primary">{product.price.toFixed(2)}€</p>
                                    <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-semibold text-white bg-secondary rounded-md shadow-sm hover:bg-primary-focus transition-transform duration-200 hover:-translate-y-0.5">
                                        Comprar
                                    </a>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
                {filteredRecommendations.length === 0 && (
                     <Card>
                        <div className="text-center py-12 text-gray-500">
                             <i className="iconoir-search text-4xl mb-3"></i>
                            <p className="font-semibold">No se encontraron productos.</p>
                             <p>Prueba a ajustar los filtros para ver más resultados.</p>
                        </div>
                    </Card>
                )}
                </>
            )}
        </div>
    );
};

export default RecommendationsPage;