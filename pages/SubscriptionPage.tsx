import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';

const SubscriptionTier = ({ name, price, features, isPopular, onSelect, currentPlan }: { name: string, price: string, features: string[], isPopular?: boolean, onSelect: () => void, currentPlan: boolean }) => (
    <Card className={`text-center flex flex-col ${currentPlan ? 'border-2 border-primary' : 'border border-transparent'}`}>
        {isPopular && <div className="bg-primary text-white text-sm font-bold py-1 rounded-t-xl">MÁS POPULAR</div>}
        <div className="p-6 flex-grow">
            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="text-4xl font-extrabold my-4">{price}€<span className="text-base font-medium text-gray-500">/mes</span></p>
            <ul className="space-y-3 text-gray-600">
                {features.map((feature, i) => <li key={i} className="flex items-center justify-center">
                    <i className="iconoir-check-circle text-primary mr-2"></i>{feature}
                </li>)}
            </ul>
        </div>
        <div className="p-6">
            <Button onClick={onSelect} className="w-full" disabled={currentPlan}>
                {currentPlan ? 'Plan Actual' : 'Seleccionar Plan'}
            </Button>
        </div>
    </Card>
);

const SubscriptionPage = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleSelectPlan = async (planType: 'monthly' | 'annual') => {
        if (!user) {
            alert('Debes iniciar sesión para suscribirte');
            return;
        }

        setIsLoading(planType);
        console.log('🚀 Iniciando proceso de checkout para:', planType);
        try {
            // IDs de precios de Stripe reales (Modo Pago de Prueba)
            const priceId = planType === 'monthly'
                ? 'price_1ShTgDEfruJcNACvAwbS0otW'
                : 'price_1ShTgmEfruJcNACvPwzOMzuE';

            console.log('📡 Llamando a Edge Function stripe-checkout con priceId:', priceId);
            const { data, error } = await supabase.functions.invoke('stripe-checkout', {
                body: {
                    price_id: priceId,
                    user_id: user.id,
                    return_url: window.location.origin
                }
            });

            if (error) {
                console.error('❌ Error de Supabase:', error);
                throw error;
            }

            console.log('📦 Respuesta de la función:', data);
            if (data?.url) {
                console.log('🔗 Redirigiendo a Stripe:', data.url);
                window.location.href = data.url;
            } else {
                console.warn('⚠️ No se recibió URL de redirección');
            }
        } catch (error: any) {
            console.error('❌ Error al iniciar checkout:', error);
            alert('Error al conectar con Stripe: ' + error.message);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">Elige tu Plan Perfecto</h1>
            <p className="text-gray-600 text-center mb-10">Desbloquea todo el potencial de SkinAI con un plan Pro.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <SubscriptionTier
                    name="Gratis"
                    price="0"
                    features={['1 análisis por mes', 'Rutina diaria básica', 'Historial de 1 análisis']}
                    onSelect={() => { }}
                    currentPlan={user?.subscription_tier === 'free' || !user?.subscription_tier}
                />
                <SubscriptionTier
                    name="Mensual"
                    price="4,99"
                    features={['Análisis ilimitados', 'Rutinas avanzadas', 'Historial completo', 'Recomendaciones Pro', 'Soporte prioritario']}
                    isPopular
                    onSelect={() => handleSelectPlan('monthly')}
                    currentPlan={user?.subscription_tier === 'pro'}
                />
                <SubscriptionTier
                    name="Anual"
                    price="39,99"
                    features={['Todo lo de Pro', 'Ahorra un 33%', 'Consulta anual con experto (simulada)']}
                    onSelect={() => handleSelectPlan('annual')}
                    currentPlan={false} // Simplificado para este ejemplo
                />
            </div>

            <Card className="max-w-4xl mx-auto mt-10 text-center">
                <h2 className="text-xl font-bold">Estado de tu Suscripción</h2>
                <p className="mt-2">Actualmente estás en el plan <span className="font-bold text-primary">{user?.subscription_tier === 'pro' ? 'Pro' : 'Gratis'}</span>.</p>
            </Card>
        </div>
    );
};

export default SubscriptionPage;