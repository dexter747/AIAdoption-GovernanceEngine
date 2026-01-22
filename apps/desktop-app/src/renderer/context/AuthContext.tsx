import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    checkAuth();

    // Listen for auth success from deep link callback
    window.electron?.auth.onSuccess((data: AuthData) => {
      setUser(data.user);
      setIsLoading(false);
    });

    window.electron?.auth.onError((error: string) => {
      console.error('Auth error:', error);
      setIsLoading(false);
    });
  }, []);

  const checkAuth = async () => {
    try {
      const authData = await window.electron?.auth.check();
      if (authData?.user) {
        setUser(authData.user);
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
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Type declarations moved to types/electron.d.ts
