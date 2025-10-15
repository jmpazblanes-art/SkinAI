import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import NotificationContainer from './notifications/NotificationContainer';
import { useReminder } from '../hooks/useReminder';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  useReminder();
  
  return (
    <div className="flex h-screen bg-base-200 text-base-content">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-base-100 shadow-sm flex-shrink-0">
          <div className="flex-1"></div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-secondary to-primary p-2 rounded-lg shadow-sm">
                  <i className="iconoir-camera text-3xl text-white"></i>
              </div>
              <h1 className="text-4xl font-bold text-base-content">
                  Skin<span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">ity</span>
              </h1>
            </div>
          </div>
          <div className="flex-1 flex justify-end">
            <div className="flex items-center space-x-4">
              <span className="font-medium hidden sm:block">Bienvenido, {user?.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md shadow-sm hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-base-200 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <NotificationContainer />
    </div>
  );
};

export default Layout;