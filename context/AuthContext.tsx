import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { getCurrentUser, loginUser as serviceLogin, logoutUser as serviceLogout } from '../services/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  canCreateTemplate: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getCurrentUser();
    if (stored) setUser(stored);
    setLoading(false);
  }, []);

  const login = (email: string, pass: string) => {
    const foundUser = serviceLogin(email, pass);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    serviceLogout();
    setUser(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      isAdmin: user?.role === UserRole.ADMIN,
      canCreateTemplate: user?.role === UserRole.ADMIN || user?.canCreateTemplate || false
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};