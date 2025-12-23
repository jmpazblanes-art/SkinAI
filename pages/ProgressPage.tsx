import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserAnalysisHistory, getSubscriptionTier } from '../services/supabaseService';
import SubscriptionModal from '../components/SubscriptionModal';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import PremiumLock from '../components/PremiumLock';

interface AnalysisRecord {
    id: string;
    fecha_analisis: string;
    resultado_json: any;
}

const ProgressPage: React.FC = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<AnalysisRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro'>('free');
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);
                const tier = await getSubscriptionTier(user.id);
                setSubscriptionTier(tier);

                if (tier === 'free') {
                    setShowSubscriptionModal(true);
                    setLoading(false);
                    return;
                }

                const { data } = await getUserAnalysisHistory(user.id, 1, 50);
                // Sort by date ascending for the chart
                const sortedData = (data || []).sort((a: any, b: any) =>
                    new Date(a.fecha_analisis).getTime() - new Date(b.fecha_analisis).getTime()
                );
                setHistory(sortedData);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleCloseModal = () => {
        setShowSubscriptionModal(false);
        navigate('/');
    };

    // Simple SVG Line Chart Component
    const SimpleLineChart = ({ data }: { data: AnalysisRecord[] }) => {
        if (data.length < 2) {
            return (
                <div className="h-64 flex items-center justify-center text-gray-500">
                    Necesitas al menos 2 análisis para ver tu evolución.
                </div>
            );
        }

        const width = 800;
        const height = 300;
        const padding = 40;

        const scores = data.map(d => {
            const json = typeof d.resultado_json === 'string' ? JSON.parse(d.resultado_json) : d.resultado_json;
            return json.analisis?.puntuacion || json.overallScore || 0;
        });

        const dates = data.map(d => new Date(d.fecha_analisis).toLocaleDateString());

        const minScore = Math.min(...scores, 0);
        const maxScore = 100;

        const xScale = (index: number) => padding + (index / (data.length - 1)) * (width - 2 * padding);
        const yScale = (score: number) => height - padding - ((score - minScore) / (maxScore - minScore)) * (height - 2 * padding);

        const points = scores.map((score, i) => `${xScale(i)},${yScale(score)}`).join(' ');

        return (
            <div className="w-full overflow-x-auto">
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="min-w-[600px]">
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(score => (
                        <line
                            key={score}
                            x1={padding}
                            y1={yScale(score)}
                            x2={width - padding}
                            y2={yScale(score)}
                            stroke="#334155"
                            strokeDasharray="4"
                        />
                    ))}

                    {/* Line */}
                    <polyline
                        points={points}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="3"
                    />

                    {/* Points */}
                    {scores.map((score, i) => (
                        <g key={i}>
                            <circle cx={xScale(i)} cy={yScale(score)} r="6" fill="#06b6d4" />
                            <text x={xScale(i)} y={yScale(score) - 15} textAnchor="middle" fill="white" fontSize="12">
                                {score}
                            </text>
                            <text x={xScale(i)} y={height - 10} textAnchor="middle" fill="#94a3b8" fontSize="10">
                                {dates[i]}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 relative">
            <h1 className="text-3xl font-bold text-white mb-8">Tu Progreso</h1>

            <PremiumLock blurAmount="blur-lg">
                <Card>
                    <h2 className="text-xl font-semibold mb-6">Evolución de Puntuación</h2>
                    <p className="text-gray-400 mb-8">Visualiza cómo ha mejorado la salud de tu piel a lo largo del tiempo.</p>
                    <SimpleLineChart data={history} />
                </Card>
            </PremiumLock>
        </div>
    );
};

export default ProgressPage;
