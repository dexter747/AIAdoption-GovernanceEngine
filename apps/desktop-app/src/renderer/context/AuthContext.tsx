import { createContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
}

interface AuthData {
  accessToken: string;
  user: User;
  expiresAt: number;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    checkAuth();

    // Listen for auth success from deep link callback
    const unsubSuccess = window.electron?.auth.onSuccess((data: AuthData) => {
      console.log('Auth success received in renderer:', data.user.email);
      setUser(data.user);
      setIsLoading(false);
    });

    const unsubError = window.electron?.auth.onError((error: string) => {
      console.error('Auth error:', error);
      setIsLoading(false);
    });

    return () => {
      // Cleanup listeners if they return cleanup functions
      if (typeof unsubSuccess === 'function') unsubSuccess();
      if (typeof unsubError === 'function') unsubError();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const authData = await window.electron?.auth.check();
      if (authData?.user) {
        console.log('Restored auth from storage:', authData.user.email);
        setUser(authData.user);
      } else {
        console.log('No stored auth found');
      }
    } catch (error) {
      console.error('Failed to check auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      await window.electron?.auth.login();
    } catch (error) {
      console.error('Failed to open login:', error);
    }
  };

  const logout = async () => {
    try {
      await window.electron?.auth.logout();
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
