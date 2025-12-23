import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';

interface ProUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <Card className="max-w-md w-full relative overflow-hidden border-2 border-primary/50 shadow-2xl shadow-primary/20">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-6 shadow-lg">
                        <i className="iconoir-lock-key text-3xl text-white"></i>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">
                        Desbloquea <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">SkinAI Pro</span>
                    </h2>

                    <p className="text-gray-400 mb-8">
                        Accede a todas las funcionalidades premium y lleva tu cuidado facial al siguiente nivel.
                    </p>

                    <div className="space-y-4 mb-8 text-left bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center text-gray-200">
                            <i className="iconoir-check-circle text-primary mr-3 text-xl"></i>
                            <span>Historial de análisis ilimitado</span>
                        </div>
                        <div className="flex items-center text-gray-200">
                            <i className="iconoir-check-circle text-primary mr-3 text-xl"></i>
                            <span>Gráficas de evolución detalladas</span>
                        </div>
                        <div className="flex items-center text-gray-200">
                            <i className="iconoir-check-circle text-primary mr-3 text-xl"></i>
                            <span>Seguimiento de progreso personalizado</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={onClose}
                            className="w-full py-4 text-lg font-bold shadow-xl shadow-primary/20"
                        >
                            Actualizar a Pro - 4.99€/mes
                        </Button>

                        <button
                            onClick={onClose}
                            className="text-sm text-gray-500 hover:text-gray-300 transition-colors py-2"
                        >
                            Ahora no, gracias
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ProUpgradeModal;
