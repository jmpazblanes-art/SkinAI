import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RoutinePage from './pages/RoutinePage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import RecommendationsPage from './pages/RecommendationsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import TipsPage from './pages/TipsPage';
import LoginPage from './pages/LoginPage';
import FeedbackPage from './pages/FeedbackPage';
import SuccessPage from './pages/SuccessPage';
import CancelPage from './pages/CancelPage';
import TermsPage from './pages/TermsPage';
import ProgressPage from './pages/ProgressPage';
import ChatPage from './pages/ChatPage';
import { useAuth } from './hooks/useAuth';
import { AnalysisProvider } from './context/AnalysisContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Initial Acceptance Popup Logic
  const [showWelcomePopup, setShowWelcomePopup] = React.useState(false);

  React.useEffect(() => {
    const hasAccepted = localStorage.getItem('skinai_terms_accepted');
    if (!hasAccepted && isAuthenticated) {
      setShowWelcomePopup(true);
    }
  }, [isAuthenticated]);

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleAcceptWelcome = () => {
    localStorage.setItem('skinai_terms_accepted', 'true');
    setShowWelcomePopup(false);
  };

  return (
    <ThemeProvider>
      <AnalysisProvider>
        <NotificationProvider>
          {showWelcomePopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-base-200 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
                <h2 className="text-2xl font-bold text-base-content mb-4">Bienvenido a SkinAI</h2>
                <div className="space-y-4 text-base-content/80 mb-6">
                  <p>Antes de continuar, es importante que sepas:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <i className="iconoir-check text-green-500 mr-2 mt-1"></i>
                      <span>Esta app ofrece sugerencias de cuidado facial para fines de bienestar</span>
                    </li>
                    <li className="flex items-start">
                      <i className="iconoir-check text-green-500 mr-2 mt-1"></i>
                      <span>Los resultados son orientativos y no son valoraciones clínicas</span>
                    </li>
                    <li className="flex items-start">
                      <i className="iconoir-check text-green-500 mr-2 mt-1"></i>
                      <span>Para problemas de piel, consulta siempre con un especialista</span>
                    </li>
                  </ul>
                  <p className="text-sm mt-4">
                    Al continuar, confirmas que has leído y aceptas nuestros <a href="/#/terminos" className="text-primary hover:underline">Términos de Uso</a>.
                  </p>
                </div>
                <button
                  onClick={handleAcceptWelcome}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-focus transition-colors"
                >
                  Entendido, continuar
                </button>
              </div>
            </div>
          )}
          {isAuthenticated ? (
            <Layout>
              <Routes>
                <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
                <Route path="/routine" element={<PrivateRoute><RoutinePage /></PrivateRoute>} />

                <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
                <Route path="/progreso" element={<PrivateRoute><ProgressPage /></PrivateRoute>} />
                <Route path="/tips" element={<PrivateRoute><TipsPage /></PrivateRoute>} />
                <Route path="/feedback" element={<PrivateRoute><FeedbackPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/recommendations" element={<PrivateRoute><RecommendationsPage /></PrivateRoute>} />
                <Route path="/subscription" element={<PrivateRoute><SubscriptionPage /></PrivateRoute>} />
                <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
                <Route path="/terminos" element={<PrivateRoute><TermsPage /></PrivateRoute>} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/cancel" element={<CancelPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          ) : (
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/cancel" element={<CancelPage />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          )}
        </NotificationProvider>
      </AnalysisProvider>
    </ThemeProvider>
  );
}

export default App;