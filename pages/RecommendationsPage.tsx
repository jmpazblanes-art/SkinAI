import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { useAnalysis } from '../context/AnalysisContext';
import RecommendationsSkeleton from './components/RecommendationsSkeleton';
import LazyImage from '../components/ui/LazyImage';
import { getAffiliateProducts, AffiliateProduct } from '../services/supabaseService';
import { useNotification } from '../context/NotificationContext';

/**
 * RecommendationsPage
 *
 * Esta página muestra las recomendaciones de productos basadas en los ingredientes
 * de la rutina generada.
 */

const RecommendationsPage = () => {
  const { latestAnalysis } = useAnalysis();
  const { addNotification } = useNotification();
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      if (!latestAnalysis?.result) {
        setIsLoading(false);
        return;
      }

      try {
        // PRIORIDAD: Usar los productos que ya encontró la IA y devolvió la Edge Function
        if (latestAnalysis.result.affiliateProducts && latestAnalysis.result.affiliateProducts.length > 0) {
          console.log('✅ Usando productos pre-cargados del análisis');
          setProducts(latestAnalysis.result.affiliateProducts);
          setIsLoading(false);
          return;
        }

        // FALLBACK: Si no hay productos en el análisis, intentar buscarlos (comportamiento antiguo)
        console.log('🔄 Buscando productos bajo demanda...');
        const morningKeys = latestAnalysis.result.rutina.manana.map(step => step.ingrediente_key);
        const eveningKeys = latestAnalysis.result.rutina.noche.map(step => step.ingrediente_key);
        const allKeys = Array.from(new Set([...morningKeys, ...eveningKeys])).filter(Boolean);

        if (allKeys.length === 0) {
          setProducts([]);
          setIsLoading(false);
          return;
        }

        const fetchedProducts = await getAffiliateProducts(allKeys);
        setProducts(fetchedProducts);
        setIsLoading(false);

      } catch (err: any) {
        console.error('Error al obtener productos:', err);
        setError(err.message || 'Error al cargar productos');
        addNotification('Error al cargar productos', 'error');
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [latestAnalysis, addNotification]);

  const categories = [
    { id: 'limpiador', title: 'Limpiadores', keywords: ['limpiador', 'micellar', 'gel', 'espumoso'] },
    { id: 'serum', title: 'Serums y Tratamientos', keywords: ['serum', 'vitamin_c', 'retinol', 'effaclar', 'acid'] },
    { id: 'hidratante', title: 'Hidratantes', keywords: ['hidratante', 'crema', 'lotion', 'gel de agua', 'skin food', 'hydra'] },
    { id: 'protector_solar', title: 'Protección Solar', keywords: ['spf', 'sun', 'fotoprotector', 'heliocare'] }
  ];

  const getProductsByCategory = (categoryKeywords: string[]) => {
    return products.filter(product => {
      const name = product.product_name.toLowerCase();
      const key = product.ingredient_key.toLowerCase();
      // Special case for SPF to avoid mixing with moisturizers that have SPF if we want strict separation, 
      // but usually "SPF" keyword is enough.
      // We process categories in order.
      return categoryKeywords.some(keyword => name.includes(keyword) || key.includes(keyword));
    });
  };

  // Helper to deduplicate products if they appear in multiple categories (optional, but good for UI)
  // For now, we'll just let them appear where they match.

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-base-content mb-2">Recomendaciones de Productos</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Buscando los mejores productos para tu rutina...
        </p>
        <RecommendationsSkeleton count={6} />
      </div>
    );
  }

  if (!latestAnalysis?.result) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-base-content mb-2">Recomendaciones de Productos</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Realiza un análisis de piel para obtener recomendaciones personalizadas.
        </p>
        <Card>
          <div className="text-center py-12">
            <i className="iconoir-face-id text-6xl text-gray-400 mb-4"></i>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No hay análisis previo
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Ve a la página principal para realizar tu primer análisis facial.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-base-content mb-2">Recomendaciones de Productos</h1>
        <Card className="border-red-200 dark:border-red-800">
          <div className="text-center py-12">
            <i className="iconoir-warning-circle text-6xl text-red-500 mb-4"></i>
            <p className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Error al cargar recomendaciones
            </p>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-base-content mb-2">Recomendaciones de Productos</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Basado en tu último análisis de piel ({latestAnalysis.result.analisis?.tipo_piel || 'normal'})
        </p>
        <Card>
          <div className="text-center py-12">
            <i className="iconoir-shopping-bag text-6xl text-gray-400 mb-4"></i>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No se encontraron productos específicos
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              No hemos encontrado productos afiliados exactos para los ingredientes de tu rutina,
              pero puedes buscar productos con los ingredientes sugeridos en tu farmacia o tienda de confianza.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <h1 className="text-3xl font-bold text-base-content mb-2">Productos sugeridos</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Selección de productos basada en los ingredientes clave de tu rutina ({latestAnalysis.result.analisis?.tipo_piel || 'normal'}).
      </p>

      <div className="space-y-12">
        {categories.map((category) => {
          const categoryProducts = getProductsByCategory(category.keywords);

          if (categoryProducts.length === 0) return null;

          return (
            <div key={category.id} className="animate-fade-in">
              <h2 className="text-2xl font-bold text-base-content mb-6 flex items-center">
                <span className="bg-primary/10 p-2 rounded-lg mr-3 text-primary">
                  {category.id === 'limpiador' && <i className="iconoir-droplet"></i>}
                  {category.id === 'serum' && <i className="iconoir-flask"></i>}
                  {category.id === 'hidratante' && <i className="iconoir-half-moon"></i>}
                  {category.id === 'protector_solar' && <i className="iconoir-sun-light"></i>}
                </span>
                {category.title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryProducts.map(product => (
                  <Card key={product.id} className="p-0 flex flex-col relative overflow-hidden hover:shadow-lg transition-all duration-300 bg-base-100 border-base-300">
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${product.price_tier === 'budget' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                          product.price_tier === 'premium' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          }`}>
                          {product.price_tier === 'budget' ? 'Económico' :
                            product.price_tier === 'premium' ? 'Premium' : 'Calidad/Precio'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-base-content mb-3 line-clamp-2 min-h-[3.5rem] leading-tight">
                        {product.product_name}
                      </h3>

                      <div className="mt-auto pt-4 border-t border-base-200">
                        <a
                          href={product.affiliate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full px-4 py-3 text-sm font-bold text-primary-content bg-primary rounded-xl shadow-md hover:bg-primary-focus transition-all duration-200 hover:-translate-y-0.5 text-center"
                        >
                          Ver en Amazon <i className="iconoir-arrow-right ml-1"></i>
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {/* Fallback para productos que no encajan en ninguna categoría */}
        {(() => {
          const categorizedIds = new Set(
            categories.flatMap(cat => getProductsByCategory(cat.keywords).map(p => p.id))
          );
          const otherProducts = products.filter(p => !categorizedIds.has(p.id));

          if (otherProducts.length === 0) return null;

          return (
            <div className="animate-fade-in border-t border-slate-700 pt-12">
              <h2 className="text-2xl font-bold text-base-content mb-6 flex items-center">
                <span className="bg-primary/10 p-2 rounded-lg mr-3 text-primary">
                  <i className="iconoir-star"></i>
                </span>
                Otros Productos Recomendados
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {otherProducts.map(product => (
                  <Card key={product.id} className="p-0 flex flex-col relative overflow-hidden hover:shadow-lg transition-all duration-300 bg-base-100 border-base-300">
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${product.price_tier === 'budget' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                          product.price_tier === 'premium' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          }`}>
                          {product.price_tier === 'budget' ? 'Económico' :
                            product.price_tier === 'premium' ? 'Premium' : 'Calidad/Precio'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-base-content mb-3 line-clamp-2 min-h-[3.5rem] leading-tight">
                        {product.product_name}
                      </h3>
                      <div className="mt-auto pt-4 border-t border-base-200">
                        <a
                          href={product.affiliate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full px-4 py-3 text-sm font-bold text-primary-content bg-primary rounded-xl shadow-md hover:bg-primary-focus transition-all duration-200 hover:-translate-y-0.5 text-center"
                        >
                          Ver en Amazon <i className="iconoir-arrow-right ml-1"></i>
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      <Card className="mt-12 bg-base-200 border-base-300">
        <div className="text-center">
          <i className="iconoir-info-circle text-3xl text-primary mb-2"></i>
          <p className="text-sm text-base-content/70">
            Estos productos contienen los ingredientes recomendados en tu rutina.
            Los enlaces son de afiliados, lo que nos ayuda a mantener SkinAI.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default RecommendationsPage;
