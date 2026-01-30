
import React, { createContext, useContext } from 'react';
import { UserType } from '../types';

interface AuthContextType {
  mode: UserType;
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hardcoded for direct access as the tool is for the internal professional team
  const mode = UserType.MT;
  const isAdmin = true;

  const login = (password: string): boolean => {
    return true; // No-op for direct access
  };

  const logout = () => {
    // No-op for direct access
  };

  return (
    <AuthContext.Provider value={{ mode, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return context;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within WorkspaceProvider');
  return { isAdmin: context.isAdmin, login: context.login, logout: context.logout };
};
