import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const CancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-full">
                <i className="iconoir-xmark text-5xl text-yellow-600 dark:text-yellow-400"></i>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Pago cancelado
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Has cancelado el proceso de pago. Puedes volver a intentarlo cuando quieras.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/subscription')} className="w-full">
                Ver Planes
              </Button>
              <Button onClick={() => navigate('/login')} variant="secondary" className="w-full">
                Volver al Registro
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CancelPage;
