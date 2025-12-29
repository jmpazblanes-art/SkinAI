import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const TermsPage: React.FC = () => {
    const navigate = useNavigate();
    const [showAcceptButton, setShowAcceptButton] = useState(false);

    useEffect(() => {
        const hasAccepted = localStorage.getItem('skinai_terms_accepted');
        if (!hasAccepted) {
            setShowAcceptButton(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('skinai_terms_accepted', 'true');
        setShowAcceptButton(false);
        navigate('/');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-base-content mb-6">Términos de Uso y Aviso Legal</h1>

            <Card className="space-y-6 p-8">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <i className="iconoir-warning-triangle text-yellow-400 text-xl"></i>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">AVISO IMPORTANTE</h3>
                            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                <p>
                                    SkinAI es una aplicación de bienestar general diseñada para ofrecer sugerencias de cuidado facial.
                                    Esta aplicación <strong>NO tiene fines sanitarios</strong>, <strong>NO realiza análisis cosméticos</strong> y <strong>NO debe utilizarse como sustituto del asesoramiento profesional de salud</strong>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-primary">LIMITACIONES DEL SERVICIO</h2>
                    <ul className="list-disc pl-5 space-y-2 text-base-content/80">
                        <li>Los análisis se basan en procesamiento de imágenes mediante inteligencia artificial</li>
                        <li>Los resultados son meramente orientativos y para fines de entretenimiento</li>
                        <li>La aplicación no detecta ni analiza patologías cutáneas</li>
                        <li>El servicio se limita a orientaciones de carácter cosmético</li>
                        <li>No somos personal de salud clínico ni facultativos</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-primary">RECOMENDACIONES</h2>
                    <ul className="list-disc pl-5 space-y-2 text-base-content/80">
                        <li>Para cualquier preocupación sobre tu salud cutánea, consulta con un asistente inteligente o personal calificado</li>
                        <li>No ignores síntomas preocupantes basándote en los resultados de esta app</li>
                        <li>Si observas cambios en lesiones o manchas, acude a un profesional</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-primary">EXENCIÓN DE RESPONSABILIDAD</h2>
                    <p className="text-base-content/80">
                        Al usar esta aplicación, aceptas que SkinAI y sus creadores no son responsables de ninguna decisión que tomes basándote en los resultados mostrados. El uso de la app es bajo tu propia responsabilidad.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-primary">USO DE DATOS</h2>
                    <p className="text-base-content/80">
                        Las fotos que tomes se procesan para generar sugerencias y no se comparten con terceros. Consulta nuestra política de privacidad para más información.
                    </p>
                </section>

                {showAcceptButton && (
                    <div className="mt-8 pt-6 border-t border-base-300 flex justify-center">
                        <Button onClick={handleAccept} className="w-full sm:w-auto px-8">
                            Acepto los términos
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TermsPage;
