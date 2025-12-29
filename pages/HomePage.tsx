import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAnalysis } from '../context/AnalysisContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../hooks/useAuth';
import DashboardSummary from './components/DashboardSummary';
import CameraModal from './components/CameraModal';
import FuturisticFaceScan from './components/FuturisticFaceScan';
import AnalysisResultsDisplay from './components/AnalysisResultsDisplay';
import AnalysisSkeleton from './components/AnalysisSkeleton';
import { callSkinAnalysisWebhook } from '../lib/n8n-webhooks';
import { getAffiliateProducts } from '../services/supabaseService';
import PremiumLock from '../components/PremiumLock';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_MB = 10;

const HomePage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { latestAnalysis, setLatestAnalysis, history } = useAnalysis();
  const { addNotification } = useNotification();
  const { user } = useAuth();

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

    resetAnalysisState();

    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        const errorMsg = "Formato de archivo no válido. Sube JPEG, PNG o GIF.";
        setError(errorMsg);
        addNotification(errorMsg, 'error');
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        const errorMsg = `El archivo es demasiado grande. El tamaño máximo es ${MAX_SIZE_MB}MB.`;
        setError(errorMsg);
        addNotification(errorMsg, 'error');
        if (fileInputRef.current) fileInputRef.current.value = "";
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

    resetAnalysisState();

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setIsCameraOpen(false);
  };

  const handleAnalyzeClick = async () => {
    if (!previewDataUrl) return;
    setMessage('Iniciando análisis...');
    setIsLoading(true);
    setError(null);
    setIsRetryable(false);

    try {
      // Enviar imagen al webhook de N8N
      setMessage('Analizando tu piel con IA dermatológica...');
      const webhookResponse = await callSkinAnalysisWebhook(user?.id || '', previewDataUrl, {
        birthDate: user?.birthDate
      });

      console.log('📦 Respuesta completa del webhook:', webhookResponse);

      if (!webhookResponse.success) {
        throw new Error(webhookResponse.error || (webhookResponse as any).message || 'No se pudo completar el análisis');
      }

      // Parsear la respuesta del webhook a la nueva estructura AnalysisResult
      const rawAnalysis = webhookResponse;

      // Construir el objeto AnalysisResult
      const analysisResult: any = {
        analisis: {
          tipo_piel: webhookResponse.analisis?.tipo_piel || 'normal',
          edad_aparente: webhookResponse.analisis?.edad_aparente || 25,
          puntuacion: webhookResponse.analisis?.puntuacion || 75,
          caracteristicas: webhookResponse.analisis?.caracteristicas || []
        },
        mensaje_motivador: webhookResponse.mensaje_motivador || "¡Tu piel es única, cuídala!",
        rutina: webhookResponse.rutina || { manana: [], noche: [] }
      };

      console.log('✅ Análisis completado:', analysisResult);

      // Los productos ya vienen incluidos en la respuesta de la Edge Function
      const affiliateProducts = webhookResponse.productos || [];
      (analysisResult as any).affiliateProducts = affiliateProducts;

      setMessage('¡Análisis completado!');
      setLatestAnalysis(analysisResult, previewDataUrl, true, webhookResponse.analysis_id);
      addNotification('Análisis completado exitosamente', 'success');

      // Mostrar info de análisis restantes si es usuario free
      if (webhookResponse.plan_type === 'free') {
        const restantes = webhookResponse.analisis_restantes;
        if (restantes === 0) {
          addNotification('Has agotado tus análisis gratuitos. ¡Actualiza a Pro para análisis ilimitados!', 'warning');
        } else {
          addNotification(`Te quedan ${restantes} análisis gratuitos`, 'info');
        }
      }

    } catch (error: any) {
      console.error('❌ Error en análisis:', error);
      const errorMessage = error.message || 'Ocurrió un error desconocido';
      setMessage(`Error: ${errorMessage}`);
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      setIsRetryable(true);
    } finally {
      setIsLoading(false);
    }
  };

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
            {message && <p className="mt-4">{message}</p>}
          </div>
        </div>
        <div className="mt-6 p-4 bg-slate-700/50 border-l-4 border-cyan-500 rounded-r-lg">
          <p className="text-sm text-base-content/90">
            <strong>Nota:</strong> Esta herramienta ofrece sugerencias de cuidado facial basadas en inteligencia artificial. Los resultados son orientativos y no constituyen asesoramiento profesional de salud. Para cualquier preocupación sobre tu piel, consulta con un profesional.
          </p>
        </div>
      </Card>

      {isLoading && <AnalysisSkeleton />}

      {latestAnalysis && !isLoading && (
        <>
          <AnalysisResultsDisplay
            result={latestAnalysis.result}
            imageUrl={latestAnalysis.imageUrl}
          />
          <p className="text-sm text-gray-500 text-center mt-6 px-4">
            Esta herramienta ofrece sugerencias de cuidado facial basadas en análisis visual con IA. No constituye asesoramiento profesional de salud. Para problemas de piel persistentes, consulta con un asistente inteligente o personal calificado.
          </p>
        </>
      )}

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

      {/* Expert Chat Section - Locked for Free Users */}
      <div className="mt-8">
        <PremiumLock blurAmount="blur-md">
          <Card className="border border-primary/20 bg-gradient-to-br from-base-100 to-primary/5">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0 relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <i className="iconoir-chat-bubble-check text-4xl text-primary"></i>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-base-100"></div>
              </div>
              <div className="flex-grow text-center md:text-left">
                <h2 className="text-2xl font-bold text-base-content mb-2">Tu Skin Coach IA</h2>
                <p className="text-base-content/70 mb-4">
                  ¿Tienes dudas sobre tu rutina? Conversa con nuestro asistente experto en rutinas y cuidado facial.
                  Consulta consejos cosméticos personalizados 24/7.
                </p>
                <div className="flex flex-col gap-3">
                  <Button className="w-full md:w-auto shadow-lg shadow-primary/20" onClick={() => window.location.href = '/#/chat'}>
                    <i className="iconoir-chat-lines mr-2"></i>
                    Iniciar Consulta
                  </Button>
                  <p className="text-[10px] text-base-content/50 italic">
                    * Esta IA ofrece consejos cosméticos, no análisis cosméticos.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </PremiumLock>
      </div>

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

      {isCameraOpen && <CameraModal onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />}
    </div>
  );
};

export default HomePage;