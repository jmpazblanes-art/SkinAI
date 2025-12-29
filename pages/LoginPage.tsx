import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [plan, setPlan] = useState<'free' | 'monthly' | 'annual'>('free');
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Protección inmediata: verificar si el botón ya está disabled
    if (submitButtonRef.current?.disabled) return;

    // Desactivar botón INMEDIATAMENTE
    if (submitButtonRef.current) submitButtonRef.current.disabled = true;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignup) {
        if (!name.trim()) {
          throw new Error('El nombre es requerido');
        }
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        if (!hasAcceptedTerms) {
          throw new Error('Debes aceptar los términos de uso');
        }

        // Llamar al webhook de n8n a través del AuthContext
        const result = await signup(email, password, name, plan, hasAcceptedTerms);

        // Si el plan es de pago, redirigir a Stripe
        if (result.needsCheckout && result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
          return;
        }

        // Si es plan gratuito, mostrar mensaje de éxito y redirigir al dashboard
        setSuccess('Cuenta creada exitosamente. Revisa tu email para confirmar tu cuenta.');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        await login(email, password);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
      if (submitButtonRef.current) submitButtonRef.current.disabled = false;
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex items-center justify-center gap-3">
            <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-xl shadow-lg">
              <i className="iconoir-camera text-4xl text-primary-content"></i>
            </div>
            <h1 className="text-5xl font-extrabold text-base-content">
              Skin<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AI</span>
            </h1>
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold text-base-content">
            {isSignup ? 'Crea tu cuenta' : 'Inicia sesión en tu cuenta'}
          </h2>
          <p className="mt-2 text-center text-sm text-base-content/60">
            {isSignup ? '¿Ya tienes una cuenta? ' : '¿No tienes una cuenta? '}
            <button
              type="button"
              onClick={toggleMode}
              className="font-medium text-primary hover:text-primary-focus"
            >
              {isSignup ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>
        </div>
        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {isSignup && (
              <>
                <Input
                  id="name"
                  label="Nombre completo"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div>
                  <label htmlFor="plan" className="block text-sm font-medium text-base-content mb-2">
                    Selecciona tu plan
                  </label>
                  <select
                    id="plan"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as 'free' | 'monthly' | 'annual')}
                    className="w-full px-3 py-2 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-base-100 text-base-content"
                  >
                    <option value="free" className="bg-base-100">Plan Gratuito - 5 análisis/mes</option>
                    <option value="monthly" className="bg-base-100">Plan Mensual - €4.99/mes - Análisis ilimitados</option>
                    <option value="annual" className="bg-base-100">Plan Anual - €39.99/año - Análisis ilimitados + 2 meses gratis</option>
                  </select>
                </div>
              </>
            )}
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
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {isSignup && (
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    checked={hasAcceptedTerms}
                    onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-base-content/80">
                    Entiendo que esta app ofrece sugerencias de cuidado estético y NO es consejo médico. Acepto los <a href="/terms" className="text-primary hover:text-primary-focus">Términos de Uso</a>.
                  </label>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}
            <div>
              <Button
                ref={submitButtonRef}
                type="submit"
                className="w-full"
                isLoading={isLoading}
                loadingText={isSignup ? 'Creando...' : 'Iniciando sesión...'}
                disabled={isSignup && !hasAcceptedTerms}
              >
                {isSignup ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;