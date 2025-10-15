import React, { useState, useEffect, useMemo } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';
import { HistoryEntry, SkinProblem, DailyRoutineStep, AnalysisResult } from '../types';
import { useNotification } from '../context/NotificationContext';
import HistorySummary from './components/HistorySummary';
import HistorySkeleton from './components/HistorySkeleton';
import LazyImage from '../components/ui/LazyImage';
import { analyzeSkin } from '../services/geminiService';
import ReanalysisModal from './components/ReanalysisModal';
import { getProblemIcon } from '../utils/skinUtils';

const DetailedProblem: React.FC<{ problem: SkinProblem }> = ({ problem }) => {
  const iconClass = getProblemIcon(problem.issue);
  const isRedness = problem.issue.toLowerCase().includes('enrojecimiento');

  return (
    <div className="p-4 rounded-lg flex items-start gap-4">
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
        <p className="text-sm text-base-content/80 mt-1 leading-relaxed">{problem.recommendation}</p>
      </div>
    </div>
  );
};

const AssociatedRoutine: React.FC<{ routine: DailyRoutineStep[] }> = ({ routine }) => {
    const morningSteps = routine.filter(s => s.time === 'morning');
    const eveningSteps = routine.filter(s => s.time === 'evening');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h4 className="font-semibold mb-2 flex items-center text-base-content"><i className="iconoir-sun-light mr-2 text-yellow-500"></i>Rutina de Mañana</h4>
                <ul className="space-y-2 text-sm list-disc list-inside text-base-content/80 leading-relaxed">
                    {morningSteps.length > 0 ? morningSteps.map(step => <li key={step.id}>{step.productType}: {step.instructions}</li>) : <li>No hay rutina de mañana.</li>}
                </ul>
            </div>
            <div>
                <h4 className="font-semibold mb-2 flex items-center text-base-content"><i className="iconoir-moon-sat mr-2 text-indigo-500"></i>Rutina de Noche</h4>
                <ul className="space-y-2 text-sm list-disc list-inside text-base-content/80 leading-relaxed">
                    {eveningSteps.length > 0 ? eveningSteps.map(step => <li key={step.id}>{step.productType}: {step.instructions}</li>) : <li>No hay rutina de noche.</li>}
                </ul>
            </div>
        </div>
    );
};

const skinTypeStyles: Record<string, string> = {
    oily: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    dry: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    combination: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
    normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    sensitive: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
};

const HistoryItem: React.FC<{ item: HistoryEntry; isExpanded: boolean; onToggle: () => void; onReanalyze: (item: HistoryEntry) => void; isReanalyzing: boolean; }> = ({ item, isExpanded, onToggle, onReanalyze, isReanalyzing }) => {
    
    const problemIcons = useMemo(() => {
        const uniqueIcons = new Set<string>();
        item.analysis.problems.forEach(p => {
            const icon = getProblemIcon(p.issue);
            uniqueIcons.add(icon);
        });
        return Array.from(uniqueIcons).slice(0, 4); // Show max 4 unique icons
    }, [item.analysis.problems]);

    return (
        <Card className="mb-4 transition-shadow duration-300 hover:shadow-2xl">
            <button onClick={onToggle} className="w-full text-left p-2" aria-expanded={isExpanded}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    <div className="flex justify-center items-center">
                        <LazyImage src={item.imageUrl} alt={`Análisis facial del ${new Date(item.date).toLocaleDateString()}`} className="w-28 h-28 object-cover rounded-lg" />
                    </div>
                    <div className="md:col-span-3">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-lg font-bold text-base-content">Análisis del {new Date(item.date).toLocaleDateString()}</p>
                                <p className="text-sm text-base-content/70">{new Date(item.date).toLocaleTimeString()}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="px-4 py-1.5 text-sm font-bold rounded-full bg-primary text-white">
                                    Puntuación: {item.analysis.overallScore}
                                </span>
                                <i className={`iconoir-nav-arrow-down text-xl text-gray-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true"></i>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${skinTypeStyles[item.analysis.skinType] || 'bg-gray-100 text-gray-800'}`}>
                                {item.analysis.skinType}
                            </span>
                             {problemIcons.length > 0 && (
                                <div className="flex items-center space-x-3" title={`Problemas detectados: ${item.analysis.problems.map(p=>p.issue).join(', ')}`}>
                                    {problemIcons.map((iconClass, index) => (
                                        <i key={index} className={`${iconClass} text-xl text-gray-500 dark:text-gray-400`}></i>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </button>
            
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100 pt-6 mt-6 border-t border-base-300' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-8 px-2">
                    <div>
                        <h3 className="text-2xl font-bold text-base-content mb-4 flex items-center">
                            <i className="iconoir-health-shield mr-3 text-primary"></i>
                            Problemas Detallados
                        </h3>
                        <div className="space-y-1 rounded-lg">
                            {item.analysis.problems.length > 0 ? 
                                item.analysis.problems.map((p, i) => <div className="rounded-md [&:nth-child(even)]:bg-base-200/50" key={i}><DetailedProblem problem={p} /></div>) :
                                <p className="text-sm text-gray-500 p-4">No se detectaron problemas.</p>
                            }
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-base-content mb-4 flex items-center">
                            <i className="iconoir-thumbs-up mr-3 text-primary"></i>
                            Recomendaciones Clave
                        </h3>
                        <ul className="list-disc list-inside text-sm space-y-2 text-base-content/80 pl-2 leading-relaxed">
                            {item.analysis.keyRecommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-base-content mb-4 flex items-center">
                            <i className="iconoir-calendar mr-3 text-primary"></i>
                            Rutina Asociada
                        </h3>
                        <AssociatedRoutine routine={item.routine} />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button 
                            onClick={() => onReanalyze(item)} 
                            variant="secondary" 
                            icon={!isReanalyzing ? <i className="iconoir-refresh-double mr-2"></i> : undefined}
                            isLoading={isReanalyzing}
                        >
                            Re-analizar
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};


const HistoryPage = () => {
  const { history, updateHistoryEntry } = useAnalysis();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });
  const [skinTypeFilter, setSkinTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const [isReanalysisModalOpen, setIsReanalysisModalOpen] = useState(false);
  const [reanalysisResult, setReanalysisResult] = useState<AnalysisResult | null>(null);
  const [reanalysisError, setReanalysisError] = useState<string | null>(null);
  const [reanalyzingId, setReanalyzingId] = useState<string | null>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700); // Simulate data fetching
    return () => clearTimeout(timer);
  }, []);

  const filteredHistory = useMemo(() => {
    return history
      .filter(item => {
        const itemDate = new Date(item.date);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        if (startDate && itemDate < startDate) return false;
        if (endDate) {
          endDate.setHours(23, 59, 59, 999); // Include the whole end day
          if (itemDate > endDate) return false;
        }
        return true;
      })
      .filter(item => {
        if (skinTypeFilter === 'all') return true;
        return item.analysis.skinType === skinTypeFilter;
      })
      .filter(item => {
        if (severityFilter === 'all') return true;
        return item.analysis.problems.some(p => p.severity === severityFilter);
      })
      .filter(item => {
        if (!searchTerm) return true;
        const lowerCaseSearch = searchTerm.toLowerCase();
        const { skinType, problems, keyRecommendations } = item.analysis;
        return (
          skinType.toLowerCase().includes(lowerCaseSearch) ||
          problems.some(p => p.issue.toLowerCase().includes(lowerCaseSearch) || p.area.toLowerCase().includes(lowerCaseSearch)) ||
          keyRecommendations.some(r => r.toLowerCase().includes(lowerCaseSearch))
        );
      });
  }, [history, searchTerm, dateRange, skinTypeFilter, severityFilter]);


  const handleToggle = (id: string) => {
    setExpandedId(prevId => (prevId === id ? null : id));
  };

  const handleReanalyzeClick = async (item: HistoryEntry) => {
    setReanalyzingId(item.id);
    setIsReanalysisModalOpen(true);
    setReanalysisResult(null);
    setReanalysisError(null);
    
    try {
      addNotification('Iniciando nuevo análisis con el modelo actualizado...', 'info');
      const base64Image = item.imageUrl.split(',')[1];
      if (!base64Image) throw new Error("Formato de imagen inválido en el historial.");
      
      const result = await analyzeSkin(base64Image);
      setReanalysisResult(result);
      
      updateHistoryEntry(item.id, result);
      addNotification('Análisis completado. La entrada del historial ha sido actualizada.', 'success');

    } catch (err: any) {
      const errorMessage = err.message || "Ocurrió un error inesperado.";
      const displayMessage = errorMessage.replace("RETRYABLE: ", "");
      setReanalysisError(displayMessage);
      addNotification(displayMessage, 'error');
    } finally {
        setReanalyzingId(null);
    }
  };

  const closeReanalysisModal = () => {
    setIsReanalysisModalOpen(false);
    setReanalysisResult(null);
    setReanalysisError(null);
  };
  
  const handleExportCSV = () => {
    exportToCSV(filteredHistory);
    addNotification('Exportando vista actual a CSV...', 'info');
  };

  const handleExportPDF = () => {
    exportToPDF(filteredHistory);
    addNotification('Exportando vista actual a PDF...', 'info');
  };
  
  const selectClasses = "block w-full px-4 py-2 bg-base-100 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-focus sm:text-sm";

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
            <h1 className="text-4xl font-extrabold text-base-content">Historial de Análisis</h1>
            <p className="text-base-content/80 mt-1 leading-relaxed">Busca y filtra todos tus análisis de piel anteriores.</p>
        </div>
        {history.length > 0 && (
            <div className="flex space-x-2 mt-4 sm:mt-0">
                <Button onClick={handleExportCSV} variant="secondary" icon={<i className="iconoir-download mr-2"></i>}>CSV</Button>
                <Button onClick={handleExportPDF} variant="secondary" icon={<i className="iconoir-pdf-document mr-2"></i>}>PDF</Button>
            </div>
        )}
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1">
            <label htmlFor="search" className="block text-sm font-medium text-base-content mb-1">Buscar</label>
            <input type="text" id="search" placeholder="Ej: acné..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={selectClasses}/>
          </div>
          <div>
            <label htmlFor="skinTypeFilter" className="block text-sm font-medium text-base-content mb-1">Tipo de Piel</label>
            <select id="skinTypeFilter" value={skinTypeFilter} onChange={e => setSkinTypeFilter(e.target.value)} className={selectClasses}>
                <option value="all">Todos</option>
                <option value="oily">Grasa</option>
                <option value="dry">Seca</option>
                <option value="combination">Mixta</option>
                <option value="normal">Normal</option>
                <option value="sensitive">Sensible</option>
            </select>
          </div>
          <div>
            <label htmlFor="severityFilter" className="block text-sm font-medium text-base-content mb-1">Severidad</label>
            <select id="severityFilter" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className={selectClasses}>
                <option value="all">Todas</option>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
            </select>
          </div>
           <div>
             <label htmlFor="startDate" className="block text-sm font-medium text-base-content mb-1">Desde</label>
             <input type="date" id="startDate" value={dateRange.start} onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))} className={selectClasses}/>
          </div>
           <div>
             <label htmlFor="endDate" className="block text-sm font-medium text-base-content mb-1">Hasta</label>
             <input type="date" id="endDate" value={dateRange.end} onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))} className={selectClasses}/>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <HistorySkeleton count={3} />
      ) : history.length > 0 ? (
        <>
          <HistorySummary history={history} />
          {filteredHistory.length > 0 ? (
            <div>
              {filteredHistory.map((item) => (
                <HistoryItem 
                    key={item.id} 
                    item={item} 
                    isExpanded={expandedId === item.id}
                    onToggle={() => handleToggle(item.id)}
                    onReanalyze={handleReanalyzeClick}
                    isReanalyzing={reanalyzingId === item.id}
                />
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12 text-gray-500">
                <i className="iconoir-search text-4xl mb-3"></i>
                <p className="font-semibold mb-2">No se encontraron resultados.</p>
                <p>Prueba a ajustar los filtros de búsqueda o el rango de fechas.</p>
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card>
            <div className="text-center py-12 text-gray-500">
                <i className="iconoir-history text-4xl mb-3"></i>
                <p className="font-semibold mb-2">Tu historial está vacío.</p>
                <p>Realiza un análisis en la página principal para empezar a construir tu historial.</p>
            </div>
        </Card>
      )}

      {isReanalysisModalOpen && (
        <ReanalysisModal 
          isLoading={!!reanalyzingId}
          result={reanalysisResult}
          error={reanalysisError}
          onClose={closeReanalysisModal}
        />
      )}
    </div>
  );
};

export default HistoryPage;