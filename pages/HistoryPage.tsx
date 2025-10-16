import React, { useEffect, useState } from 'react';
import { getUserAnalysisHistory } from '../services/supabaseService';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching history for page:', page);
        const { data, count } = await getUserAnalysisHistory(null, page, pageSize); // Usa null si no hay usuario real aún
        console.log('Data received from Supabase:', data);
        console.log('Total count received from Supabase:', count);
        setHistory(data || []);
        setTotalCount(count || 0);
      } catch (error) {
        console.error('Error cargando historial:', error);
      }
    }
    fetchData();
  }, [page, pageSize]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Historial de Análisis</h1>
      {history.length === 0 ? (
        <p>No hay análisis guardados.</p>
      ) : (
                <ul className="space-y-6">
          {history.map((item: any) => (
            <li key={item.id}>
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
                    <p className="font-semibold">Tipo de piel: <span className="font-normal">{item.skin_type}</span></p>
                    <p className="font-semibold">Puntuación: <span className="font-normal">{item.overall_score}</span></p>
                    <div className="mt-4">
                      <strong className="text-gray-700">Problemas Detectados:</strong>
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-600">
                        {item.problems.map((p: any, i: number) => (
                          <li key={i}><span className="font-semibold">{p.area}:</span> {p.issue} ({p.severity}) - <span className="italic">{p.recommendation}</span></li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4">
                      <strong className="text-gray-700">Recomendaciones Generales:</strong>
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-600">
                        {item.recommendations.map((rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {item.image_url && (
                    <div className="md:col-span-1 flex items-center justify-center">
                      <img src={item.image_url} alt="Análisis de piel" className="w-full h-auto rounded-lg border"/>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex justify-between items-center">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default HistoryPage;