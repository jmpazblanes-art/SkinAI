import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import NotificationContainer from './notifications/NotificationContainer';
import { useReminder } from '../hooks/useReminder';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  useReminder();

  return (
    <div className="flex h-screen bg-base-200 text-base-content overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-base-100 shadow-sm flex-shrink-0 z-30">
          <div className="flex-1 flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-base-content hover:bg-base-200 transition-colors"
              aria-label="Abrir menú"
            >
              <i className="iconoir-menu text-2xl"></i>
            </button>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-secondary to-primary p-1.5 sm:p-2 rounded-lg shadow-sm">
                <i className="iconoir-camera text-xl sm:text-3xl text-white"></i>
              </div>
              <h1 className="text-xl sm:text-4xl font-bold text-base-content">
                Skin<span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">AI</span>
              </h1>
            </div>
          </div>

          <div className="flex-1 flex justify-end">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="font-medium hidden md:block text-sm sm:text-base">Hola, {user?.name?.split(' ')[0]}</span>
              <button
                onClick={logout}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-primary rounded-md shadow-sm hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Cerrar <span className="hidden xs:inline">Sesión</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-base-200 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
          <footer className="py-6 text-center">
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 px-4">
              Sugerencias orientativas · No es consejo médico · Consulta a un profesional
            </p>
          </footer>
        </main>
      </div>
      <NotificationContainer />
    </div>
  );
};

export default Layout;