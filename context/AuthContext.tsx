import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateProfilePicture: (newPictureUrl: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: User = {
  id: '1',
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  birthDate: '1990-05-15',
  profilePictureUrl: 'https://picsum.photos/seed/user1/200/200',
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Simulate checking for a logged-in user in local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, pass: string) => {
    // Simulate API call
    console.log(`Logging in with ${email} and ${pass}`);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
        setUser(MOCK_USER);
        resolve();
      }, 500);
    });
  };

  const logout = () => {
    // Simulate API call
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfilePicture = (newPictureUrl: string) => {
    if (user) {
      const updatedUser = { ...user, profilePictureUrl: newPictureUrl };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };


  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateProfilePicture }}>
      {children}
    </AuthContext.Provider>
  );
};