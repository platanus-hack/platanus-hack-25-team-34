/**
 * Authentication Context
 * 
 * Manages the current logged-in user state.
 * For MVP, this is a simple dev login (no real authentication).
 * 
 * LOCAL_DEVELOPMENT mode: When VITE_LOCAL_DEVELOPMENT=true,
 * authentication is bypassed with a mock user for easier testing.
 * TODO: Add google authentication for production
 */
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';

// Check if in local development mode
const isLocalDevelopment = import.meta.env.VITE_LOCAL_DEVELOPMENT === 'true';

// Mock user for local development
const mockDevUser: User = {
  id: 1,
  name: 'Dev User (Local)',
  balance_clp: 1000000,
};

interface AuthContextType {
  user: User | null;
  login: (userId: number) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  isAuthenticated: boolean;
  isLocalDevelopment: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export AuthContext for testing
export { AuthContext };

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (userId: number) => {
    try {
      const userData = await authApi.devLogin(userId);
      setUser(userData);
      // Store in localStorage for persistence
      localStorage.setItem('hedgie_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hedgie_user');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('hedgie_user', JSON.stringify(userData));
  };

  // Check localStorage on mount
  React.useEffect(() => {
    if (isLocalDevelopment) {
      // In local development mode, auto-login with mock user
      setUser(mockDevUser);
      console.log('🔧 LOCAL_DEVELOPMENT mode: Auto-authenticated as Dev User');
    } else {
      // Normal mode: check localStorage
      const storedUser = localStorage.getItem('hedgie_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: isLocalDevelopment || !!user,
        isLocalDevelopment,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
