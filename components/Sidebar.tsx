import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import LazyImage from './ui/LazyImage';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-base-200">
      <span className="text-sm font-medium text-base-content">Modo Oscuro</span>
      <button
        onClick={toggleTheme}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-base-200 ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300'
          }`}
      >
        <span className="sr-only">Activar modo oscuro</span>
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
      </button>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();

  const linkClasses = (path: string) =>
    `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${location.pathname === path
      ? 'bg-primary text-primary-content shadow-md'
      : `text-base-content hover:bg-base-200 dark:hover:bg-neutral-700`
    }`;

  return (
    <div className="w-64 bg-base-100 text-base-content flex-shrink-0 flex flex-col h-full border-r border-base-300/60">
      <div className="flex flex-col h-full">
        <div className="flex items-center p-6 border-b border-base-300/60">
          <LazyImage className="h-12 w-12 rounded-full object-cover" src={user?.profilePictureUrl} alt="User" />
          <div className="ml-4">
            <p className="font-semibold text-base-content">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={linkClasses(link.path)}
            >
              <i className={`${link.icon} h-5 w-5 mr-3`}></i>
              {link.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-base-300/60 space-y-4">
          <ThemeToggle />
          {user?.subscription_tier !== 'pro' && (
            <div className={`p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-primary/20 text-center`}>
              <h4 className={`font-semibold text-primary dark:text-blue-300`}>Actualiza a Pro</h4>
              <p className={`text-sm text-gray-600 dark:text-blue-400 mt-1`}>Obtén análisis ilimitados y funciones exclusivas.</p>
              <button
                onClick={() => navigate('/subscription')}
                className="mt-3 w-full bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary-focus transition-transform duration-200 hover:-translate-y-0.5"
              >
                Actualizar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;