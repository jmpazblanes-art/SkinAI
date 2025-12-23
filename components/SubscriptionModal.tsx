import React from 'react';
import Button from './ui/Button';
import { useAuth } from '../hooks/useAuth';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        // Redirect to Stripe checkout or pricing page
        // For now, let's assume a direct link or a function to trigger checkout
        // Ideally this should call a function in AuthContext or similar to get the checkout URL
        // But based on LoginPage, it seems we might need to trigger a new checkout session
        // For this MVP, I'll redirect to a hypothetical upgrade URL or just show a message
        // actually, the user said "preparado para Stripe".
        // In LoginPage, signup returns a checkoutUrl.
        // I should probably have a function to create a checkout session for an existing user.
        // For now, I'll just redirect to a hardcoded URL or a placeholder.
        // Wait, the user provided Stripe keys in memory.
        // I'll make it redirect to the subscription page or trigger a function.
        // Let's assume there is a /subscription route or similar, or I'll just put a placeholder alert for now
        // and the user can hook it up to the real Stripe logic later if not present.
        // Actually, looking at LoginPage, it handles signup with plan.
        // For existing users, we probably need a "create checkout session" endpoint.
        // I'll add a TODO comment and maybe redirect to /subscription if it exists, or just alert.
        // Wait, I see SubscriptionPage.tsx in the file list earlier!
        window.location.href = '/subscription';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 text-center">
                    <div className="mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-white/10">
                        <i className="iconoir-crown text-3xl text-yellow-400"></i>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Desbloquea SkinAI Pro</h2>
                    <p className="text-gray-400 mb-6">
                        Lleva tu cuidado facial al siguiente nivel con acceso ilimitado.
                    </p>

                    <div className="space-y-3 mb-8 text-left bg-slate-800/50 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center text-gray-200">
                            <i className="iconoir-check-circle text-green-400 mr-3"></i>
                            <span>Historial de análisis completo</span>
                        </div>
                        <div className="flex items-center text-gray-200">
                            <i className="iconoir-graph-up text-cyan-400 mr-3"></i>
                            <span>Gráficas de evolución detalladas</span>
                        </div>
                        <div className="flex items-center text-gray-200">
                            <i className="iconoir-eye-alt text-purple-400 mr-3"></i>
                            <span>Seguimiento de progreso visual</span>
                        </div>
                        <div className="flex items-center text-gray-200">
                            <i className="iconoir-infinite text-pink-400 mr-3"></i>
                            <span>Escaneos ilimitados</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={handleUpgrade}
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-3 shadow-lg shadow-primary/25"
                        >
                            Actualizar a Pro
                        </Button>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-white text-sm font-medium transition-colors"
                        >
                            Ahora no, gracias
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;
