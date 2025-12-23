import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getSubscriptionTier } from '../services/supabaseService';
import ProUpgradeModal from './ProUpgradeModal';
import Button from './ui/Button';

interface PremiumLockProps {
    children: React.ReactNode;
    blurAmount?: string; // e.g., 'blur-sm', 'blur-md', 'blur-lg'
}

const PremiumLock: React.FC<PremiumLockProps> = ({ children, blurAmount = 'blur-md' }) => {
    const { user } = useAuth();
    const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro' | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const checkTier = async () => {
            if (user) {
                const tier = await getSubscriptionTier(user.id);
                setSubscriptionTier(tier);
            }
            setIsLoading(false);
        };
        checkTier();
    }, [user]);

    if (isLoading) {
        return <div className="animate-pulse bg-base-300 h-32 rounded-lg w-full"></div>;
    }

    if (subscriptionTier === 'pro') {
        return <>{children}</>;
    }

    return (
        <div className="relative overflow-hidden rounded-xl">
            {/* Blurred Content */}
            <div className={`filter ${blurAmount} select-none pointer-events-none opacity-60 transition-all duration-300`}>
                {children}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-base-100/10 backdrop-blur-[2px]">
                <div className="bg-base-100/90 p-6 rounded-2xl shadow-2xl border border-primary/20 text-center max-w-xs mx-4 transform hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <i className="iconoir-lock text-2xl text-white"></i>
                    </div>
                    <h3 className="text-lg font-bold text-base-content mb-2">Contenido Premium</h3>
                    <p className="text-sm text-base-content/70 mb-4">
                        Desbloquea esta función y obtén acceso ilimitado con SkinAI Pro.
                    </p>
                    <Button
                        onClick={() => setShowModal(true)}
                        className="w-full shadow-lg shadow-primary/20"
                    >
                        Desbloquear con Pro
                    </Button>
                </div>
            </div>

            <ProUpgradeModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </div>
    );
};

export default PremiumLock;
