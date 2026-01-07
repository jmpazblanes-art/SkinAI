import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserAnalysisHistory, getSubscriptionTier } from '../services/supabaseService';
import ProUpgradeModal from '../components/ProUpgradeModal';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

interface AnalysisRecord {
  id: string;
  fecha_analisis: string;
  tipo_piel: string;
  edad_aparente: number;
  resultado_json: any;
  imagen_url?: string;
}

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro'>('free');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Check subscription tier first
        const tier = await getSubscriptionTier(user.id);
        setSubscriptionTier(tier);

        if (tier === 'free') {
          setShowUpgradeModal(true);
          setLoading(false);
          return;
        }

        const { data } = await getUserAnalysisHistory(user.id, 1, 50);
        setHistory(data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('No se pudo cargar el historial');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleCloseModal = () => {
    setShowUpgradeModal(false);
    navigate('/'); // Redirect to home if they decline
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Fecha no disponible';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha no válida';
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha no válida';
    }
  };

  const getPreocupaciones = (record: AnalysisRecord): string[] => {
    if (record.resultado_json) {
      const json = typeof record.resultado_json === 'string'
        ? JSON.parse(record.resultado_json)
        : record.resultado_json;

      // Handle new structure
      if (json.analisis && json.analisis.caracteristicas) {
        return json.analisis.caracteristicas;
      }

      // Handle legacy structure
      if (json.preocupaciones && Array.isArray(json.preocupaciones)) {
        return json.preocupaciones;
      }
    }
    return [];
  };

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = history.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-base-content/60 animate-pulse">Cargando tu progreso...</p>
      </div>
    );
  }

  // If free user, show blurred placeholder with modal
  if (subscriptionTier === 'free') {
    return (
      <div className="relative min-h-[60vh] flex flex-col items-center">
        <div className="filter blur-md pointer-events-none opacity-40 p-6 select-none w-full max-w-4xl">
          <h1 className="text-3xl font-bold text-base-content mb-8">Historial de Análisis</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-base-100 rounded-2xl p-6 h-40 border border-base-300 shadow-sm">
                <div className="h-4 bg-base-300 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-base-200 rounded w-3/4"></div>
                  <div className="h-3 bg-base-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <ProUpgradeModal isOpen={showUpgradeModal} onClose={handleCloseModal} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <i className="iconoir-warning-circle text-5xl text-red-500"></i>
        <p className="text-red-500 font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="text-primary hover:underline">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-base-content">Historial</h1>
          <p className="text-sm sm:text-base text-base-content/60 mt-1">Sigue la evolución de tu piel a lo largo del tiempo.</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold self-start">
          {history.length} análisis guardados
        </div>
      </div>

      {history.length === 0 ? (
        <Card className="text-center py-16">
          <div className="max-w-xs mx-auto">
            <div className="bg-base-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="iconoir-face-id text-4xl text-base-content/30"></i>
            </div>
            <p className="text-xl font-bold text-base-content">Sin historial aún</p>
            <p className="text-base-content/60 mt-2 mb-8">Realiza tu primer análisis facial para ver aquí tu evolución.</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-focus transition-all"
            >
              Comenzar primer análisis
            </button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((record) => {
              const preocupaciones = getPreocupaciones(record).slice(0, 3);
              const tipoPiel = record.resultado_json?.analisis?.tipo_piel || record.tipo_piel || 'normal';

              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedAnalysis(record)}
                  className="group bg-base-100 rounded-3xl p-6 cursor-pointer hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 border border-base-300 relative overflow-hidden flex flex-col h-full"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <i className="iconoir-scan text-6xl text-primary"></i>
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-primary/10 text-primary font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                      {formatDate(record.fecha_analisis).split(',')[0]}
                    </div>
                    <div className="text-[10px] text-base-content/40 font-bold uppercase tracking-widest">
                      {formatDate(record.fecha_analisis).split(',')[1]}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-base-content capitalize">Piel {tipoPiel}</h3>
                    <p className="text-sm text-base-content/60">
                      Veredicto: <span className="text-primary font-medium">{record.resultado_json?.analisis?.puntuacion || 0}/100</span>
                    </p>
                  </div>

                  <div className="flex-grow">
                    <div className="flex flex-wrap gap-2">
                      {preocupaciones.map((p, i) => (
                        <span key={i} className="bg-base-200 text-base-content/70 px-2.5 py-1 rounded-lg text-xs font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-base-200 flex items-center justify-between text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    <span className="text-xs font-bold uppercase tracking-wider">Ver detalles</span>
                    <i className="iconoir-arrow-right text-lg"></i>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
              >
                Anterior
              </button>
              <span className="text-gray-300">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {selectedAnalysis && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAnalysis(null)}
        >
          <div
            className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">Detalles del Análisis</h2>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <p className="text-cyan-400 mb-4">
              {formatDate(selectedAnalysis.fecha_analisis)}
            </p>

            {selectedAnalysis.imagen_url && (
              <div className="mb-6">
                <img
                  src={selectedAnalysis.imagen_url}
                  alt="Análisis facial"
                  className="w-full max-w-md mx-auto rounded-lg"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-1">Tipo de Piel</h3>
                <p className="text-white text-xl capitalize font-semibold">
                  {selectedAnalysis.resultado_json?.analisis?.tipo_piel || selectedAnalysis.tipo_piel || 'No detectado'}
                </p>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-1">Edad Aparente</h3>
                <p className="text-white text-xl font-semibold">
                  {selectedAnalysis.resultado_json?.analisis?.edad_aparente || selectedAnalysis.edad_aparente ? `${selectedAnalysis.resultado_json?.analisis?.edad_aparente || selectedAnalysis.edad_aparente} años` : 'No detectada'}
                </p>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-2">Características observadas</h3>
                {getPreocupaciones(selectedAnalysis).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {getPreocupaciones(selectedAnalysis).map((p, i) => (
                      <span
                        key={i}
                        className="bg-slate-600 text-cyan-300 px-3 py-1 rounded-full"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-400">Ningún problema detectado ✓</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedAnalysis(null)}
              className="w-full mt-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;