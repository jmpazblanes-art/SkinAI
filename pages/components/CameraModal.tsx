import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from '../../components/ui/Button';

interface CameraModalProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Se denegó el permiso para acceder a la cámara. Por favor, habilítalo en la configuración de tu navegador.");
      } else {
        setError("No se pudo acceder a la cámara. Asegúrate de que no esté siendo utilizada por otra aplicación.");
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Flip the image horizontally for a mirror effect
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleUsePhoto = () => {
    if (canvasRef.current) {
      canvasRef.current.toBlob(blob => {
        if (blob) {
          onCapture(blob);
        }
      }, 'image/jpeg', 0.9);
    }
  };
  
  const handleClose = () => {
      stopCamera();
      onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in-fast" role="dialog" aria-modal="true">
      <div className="bg-base-100 rounded-lg shadow-xl p-6 w-full max-w-lg text-center relative">
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 p-2 rounded-full text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors z-10"
          aria-label="Cerrar modal"
        >
          <i className="iconoir-xmark text-3xl"></i>
        </button>
        <h2 className="text-2xl font-bold mb-4">Capturar Foto</h2>
        {error ? (
          <div className="text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-300 p-4 rounded-md">
            <p className="font-semibold">Error de Cámara</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="relative w-full aspect-square mx-auto bg-base-200 rounded-md overflow-hidden flex items-center justify-center">
            {capturedImage ? (
              <img src={capturedImage} alt="Vista previa de la captura" className="object-contain h-full w-full" />
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-2/3 h-4/5 border-4 border-white border-opacity-50 rounded-full" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }}></div>
                </div>
              </>
            )}
             {!stream && !capturedImage && !error && <p className="absolute text-base-content">Iniciando cámara...</p>}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
        <div className="mt-6 flex justify-center space-x-4">
          {capturedImage ? (
            <>
              <Button onClick={handleRetake} variant="secondary">Tomar otra</Button>
              <Button onClick={handleUsePhoto}>Usar esta foto</Button>
            </>
          ) : (
            <Button onClick={handleCapture} disabled={!stream}>
              <i className="iconoir-camera mr-2"></i> Capturar
            </Button>
          )}
        </div>
      </div>
       <style>{`
            @keyframes fade-in-fast {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in-fast {
                animation: fade-in-fast 0.2s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default CameraModal;