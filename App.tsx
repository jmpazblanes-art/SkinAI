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
import { useAuth } from './hooks/useAuth';
import { AnalysisProvider } from './context/AnalysisContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <ThemeProvider>
      <AnalysisProvider>
        <NotificationProvider>
          {isAuthenticated ? (
            <Layout>
              <Routes>
                <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
                <Route path="/routine" element={<PrivateRoute><RoutinePage /></PrivateRoute>} />
                <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
                <Route path="/tips" element={<PrivateRoute><TipsPage /></PrivateRoute>} />
                <Route path="/feedback" element={<PrivateRoute><FeedbackPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/recommendations" element={<PrivateRoute><RecommendationsPage /></PrivateRoute>} />
                <Route path="/subscription" element={<PrivateRoute><SubscriptionPage /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          ) : (
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          )}
        </NotificationProvider>
      </AnalysisProvider>
    </ThemeProvider>
  );
}

export default App;