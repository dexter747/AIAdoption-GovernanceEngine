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
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthData = (data: AuthData) => {
    setUser(data.user);
    setToken(data.accessToken);
    localStorage.setItem('token', data.accessToken);
  };

  useEffect(() => {
    // Check for existing auth on mount
    checkAuth();

    // Listen for auth success from deep link callback
    const unsubSuccess = window.electron?.auth.onSuccess((data: AuthData) => {
      console.log('Auth success received in renderer:', data.user.email);
      handleAuthData(data);
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
      if (window.electron) {
        // Electron environment: use IPC-backed auth store
        const authData = await window.electron.auth.check();
        if (authData?.user) {
          console.log('Restored auth from storage:', authData.user.email);
          handleAuthData(authData);
        } else {
          console.log('No stored auth found');
        }
      } else {
        // Browser / dev environment: fall back to localStorage token
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          console.log('Dev mode: using token from localStorage');
          // Decode JWT payload to extract user info (no verification needed here)
          try {
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            // Prefer id/sub from the token; the Express API auth middleware
            // will normalise non-UUID values into deterministic UUIDs.
            const rawId = payload.id || payload.sub || payload.userId || 'dev-user';
            setUser({
              id: rawId,
              email: payload.email || 'dev@velanova.ai',
              name: payload.name || 'Dev User',
            });
            setToken(storedToken);
          } catch {
            console.warn('Could not decode token payload, clearing stale token');
            localStorage.removeItem('token');
          }
        } else {
          console.log('No stored auth found');
        }
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
      setToken(null);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
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
