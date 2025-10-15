

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyzeSkin } from '../services/geminiService';
import { processImageForAnalysis } from '../utils/imageProcessor';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAnalysis } from '../context/AnalysisContext';
import { useNotification } from '../context/NotificationContext';
import DashboardSummary from './components/DashboardSummary';
import AnalysisSkeleton from './components/AnalysisSkeleton';
import CameraModal from './components/CameraModal';
import AnalysisResultsDisplay from './components/AnalysisResultsDisplay';
import FuturisticFaceScan from './components/FuturisticFaceScan';
import { blobToBase64 } from '../utils/fileUtils';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_MB = 10;

const HomePage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { latestAnalysis, setLatestAnalysis, history } = useAnalysis();
  const { addNotification } = useNotification();

  useEffect(() => {
    if (latestAnalysis && !selectedFile) {
      setPreviewDataUrl(latestAnalysis.imageUrl);
    }
  }, [latestAnalysis, selectedFile]);

  const resetAnalysisState = () => {
    setSelectedFile(null);
    setPreviewDataUrl(null);
    setLatestAnalysis(null, '', false);
    setError(null);
    setIsRetryable(false);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    // Reset states on new file selection
    resetAnalysisState();

    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        const errorMsg = "Formato de archivo no válido. Sube JPEG, PNG o GIF.";
        setError(errorMsg);
        addNotification(errorMsg, 'error');
        if(fileInputRef.current) fileInputRef.current.value = ""; // Clear the input
        return;
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        const errorMsg = `El archivo es demasiado grande. El tamaño máximo es ${MAX_SIZE_MB}MB.`;
        setError(errorMsg);
        addNotification(errorMsg, 'error');
        if(fileInputRef.current) fileInputRef.current.value = ""; // Clear the input
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (blob: Blob) => {
    const fileName = `capture-${Date.now()}.jpg`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    
    // Reset states
    resetAnalysisState();
    
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setIsCameraOpen(false);
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!selectedFile) {
      setError("Por favor, sube una foto primero.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsRetryable(false);
    setLatestAnalysis(null, '', false);

    try {
      addNotification('Procesando imagen...', 'info');
      const { base64, dataUrl } = await processImageForAnalysis(selectedFile);
      
      addNotification('Imagen procesada. Analizando...', 'info');
      const result = await analyzeSkin(base64);
      
      setLatestAnalysis(result, dataUrl);
      addNotification('Análisis completado y guardado en el historial.', 'success');
    } catch (err: any) {
      const errorMessage = err.message || "Ocurrió un error inesperado.";
      if (errorMessage.startsWith("RETRYABLE:")) {
          const displayMessage = errorMessage.replace("RETRYABLE: ", "");
          setError(displayMessage);
          setIsRetryable(true);
          addNotification(displayMessage, 'error');
      } else {
          setError(errorMessage);
          setIsRetryable(false);
          addNotification(errorMessage, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, setLatestAnalysis, addNotification]);

  return (
    <div>
      <h1 className="text-5xl sm:text-6xl font-extrabold text-base-content mb-3 leading-tight">
        Análisis Facial con <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Inteligencia Artificial</span>
      </h1>
      <p className="text-lg text-base-content/80 max-w-2xl mb-6 leading-loose">
        Sube una foto de tu rostro y recibe un análisis detallado de tu piel con recomendaciones personalizadas para mejorar tu cuidado facial.
      </p>
      
      {history.length > 0 && <DashboardSummary history={history} />}

      <Card className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center justify-center p-2 border border-dashed border-base-300/50 dark:border-base-300/30 rounded-lg h-64 bg-base-200/50">
            {previewDataUrl ? (
              <img src={previewDataUrl} alt="Vista previa de la foto de rostro para analizar" className="max-h-full max-w-full object-contain rounded-md" />
            ) : (
              <FuturisticFaceScan />
            )}
          </div>
          <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-semibold">Comienza un nuevo análisis</h2>
            <p className="text-base-content/80 leading-relaxed">Asegúrate de que la foto sea de frente, sin maquillaje y con buena iluminación para obtener los mejores resultados.</p>
            <input
              type="file"
              accept="image/jpeg, image/png, image/gif, image/webp"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              aria-labelledby="upload-button"
            />
            <div className="flex flex-wrap gap-4">
                <Button 
                    id="upload-button"
                    onClick={() => fileInputRef.current?.click()} 
                    variant="secondary"
                    icon={<i className="iconoir-cloud-upload mr-2"></i>}
                >
                Subir foto
                </Button>
                <Button 
                    onClick={() => setIsCameraOpen(true)}
                    variant="secondary"
                    icon={<i className="iconoir-camera mr-2"></i>}
                >
                    Tomar foto
                </Button>
                <Button onClick={handleAnalyzeClick} isLoading={isLoading} disabled={!selectedFile}>
                  Analizar <i className="iconoir-arrow-right ml-2"></i>
                </Button>
            </div>
          </div>
        </div>
      </Card>
      
       <Card className="mt-8">
         <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center">
             <div className="bg-primary/10 p-3 rounded-full mr-4">
                <i className="iconoir-light-bulb-on h-8 w-8 text-primary"></i>
             </div>
             <div>
               <h2 className="text-xl font-bold text-base-content">Descubre Consejos de Expertos</h2>
               <p className="text-base-content/80 mt-1">Explora nuestra colección de consejos para mejorar tu rutina.</p>
             </div>
           </div>
           <Link to="/tips" className="w-full sm:w-auto">
             <Button variant="secondary" className="w-full sm:w-auto">
                Ver todos los consejos
             </Button>
           </Link>
         </div>
       </Card>
        
      {error && (
        <Card className="mt-8 border border-red-200 dark:border-red-800/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <i className="iconoir-warning-circle text-red-500 text-2xl mr-3 flex-shrink-0"></i>
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
            {isRetryable && (
              <Button onClick={handleAnalyzeClick} variant="secondary" className="w-full sm:w-auto flex-shrink-0">
                <i className="iconoir-refresh-double mr-2"></i>
                Reintentar
              </Button>
            )}
          </div>
        </Card>
      )}
      
      {isLoading && <AnalysisSkeleton />}

      {latestAnalysis && !isLoading && <AnalysisResultsDisplay result={latestAnalysis.result} />}

      {!latestAnalysis && !isLoading && !selectedFile && history.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No has subido ninguna foto aún.</p>
          </div>
      )}
      
      {isCameraOpen && <CameraModal onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />}
    </div>
  );
};

export default HomePage;