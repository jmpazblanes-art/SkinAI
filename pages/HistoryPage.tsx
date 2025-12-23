import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserAnalysisHistory, getSubscriptionTier } from '../services/supabaseService';
import ProUpgradeModal from '../components/ProUpgradeModal';
import { useNavigate } from 'react-router-dom';

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
  const itemsPerPage = 5;

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
        month: 'long',
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
      if (json.problemas && Array.isArray(json.problemas)) {
        return json.problemas;
      }
      if (json.concerns && Array.isArray(json.concerns)) {
        return json.concerns;
      }
    }
    return [];
  };

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = history.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  // If free user, show blurred placeholder with modal
  if (subscriptionTier === 'free') {
    return (
      <div className="relative min-h-screen">
        <div className="filter blur-lg pointer-events-none opacity-50 p-6 select-none">
          <h1 className="text-3xl font-bold text-white mb-8">Historial de Análisis</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-800 rounded-lg p-6 h-40 border border-slate-700">
                <div className="h-4 bg-slate-700 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                </div>
                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
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
      <div className="text-center py-10">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Historial de Análisis</h1>

      {history.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <p className="text-gray-300 text-lg">No tienes análisis guardados todavía.</p>
          <p className="text-gray-400 mt-2">Realiza tu primer análisis facial para comenzar.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {currentItems.map((record) => {
              const preocupaciones = getPreocupaciones(record);
              // Handle new structure for display
              const tipoPiel = record.resultado_json?.analisis?.tipo_piel || record.tipo_piel || 'No detectado';
              const edadAparente = record.resultado_json?.analisis?.edad_aparente || record.edad_aparente;

              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedAnalysis(record)}
                  className="bg-slate-800 rounded-lg p-6 cursor-pointer hover:bg-slate-700 transition-colors border border-slate-700 hover:border-cyan-500"
                >
                  <p className="text-cyan-400 font-medium mb-3">
                    {formatDate(record.fecha_analisis)}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-gray-400">Tipo de piel: </span>
                      <span className="text-white font-semibold capitalize">
                        {tipoPiel}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Edad aparente: </span>
                      <span className="text-white font-semibold">
                        {edadAparente ? `${edadAparente} años` : 'No detectada'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400">Características observadas: </span>
                    {preocupaciones.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {preocupaciones.map((p, i) => (
                          <span
                            key={i}
                            className="bg-slate-700 text-cyan-300 px-3 py-1 rounded-full text-sm"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-green-400 ml-2">Ninguno detectado ✓</span>
                    )}
                  </div>

                  <p className="text-gray-500 text-sm mt-4">
                    Haz clic para ver detalles →
                  </p>
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