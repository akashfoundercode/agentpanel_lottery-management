import { createContext, useContext, useState, ReactNode } from 'react';
import api from '../api/axios';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('agent_token'));

  const login = (token: string) => {
    localStorage.setItem('agent_token', token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await api.post('/admin/agent/logout');
    } catch {
      // token already invalid, proceed
    } finally {
      localStorage.removeItem('agent_token');
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
