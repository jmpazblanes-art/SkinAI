import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const SuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirigir después de 5 segundos
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
                <i className="iconoir-check text-5xl text-green-600 dark:text-green-400"></i>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ¡Pago exitoso!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tu suscripción ha sido activada correctamente. Serás redirigido al dashboard en unos segundos.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Ir al Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SuccessPage;
