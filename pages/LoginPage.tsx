import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const [email, setEmail] = useState('alex.doe@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Error al iniciar sesión. Por favor, comprueba tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex items-center justify-center gap-3">
            <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-xl shadow-lg">
                <i className="iconoir-camera text-4xl text-white"></i>
            </div>
            <h1 className="text-5xl font-extrabold text-neutral-800 dark:text-neutral-200">
                Skin<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ity</span>
            </h1>
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-200">Inicia sesión en tu cuenta</h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            O{' '}
            <a href="#" className="font-medium text-primary hover:text-primary-focus">
              crea una cuenta nueva
            </a>
          </p>
        </div>
        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
             {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Iniciar Sesión
              </Button>
            </div>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                (Usar cualquier email/contraseña para la simulación)
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;