import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LicenseProvider } from './context/LicenseContext';
import { ToastProvider } from './components/ui/toast';
import { ErrorBoundary } from './components/ui/error-boundary';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import ConnectionsPageEnhanced from './pages/ConnectionsPageEnhanced';
import QueriesPage from './pages/QueriesPage';
import ChatPage from './pages/ChatPage';
import PricingPage from './pages/PricingPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import APIKeysPage from './pages/APIKeysPage';
import DatabaseConnectionsPage from './pages/DatabaseConnectionsPage';
import ModernChatPage from './pages/ModernChatPage';
import SubscriptionPage from './pages/SubscriptionPage';
import ConnectionsDashboard from './pages/ConnectionsDashboard';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import LicenseActivationPage from './pages/LicenseActivationPage';
import LibraryPage from './pages/LibraryPage';
import MyConnectionsPage from './pages/MyConnectionsPage';
import ContextManager from './components/ContextManager';
import { useState, useEffect } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ModernChatPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <AppLayout>
              <LibraryPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-connections"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MyConnectionsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/connections"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ConnectionsPageEnhanced />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ModernChatPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat-old"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/connections-dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ConnectionsDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/queries"
        element={
          <ProtectedRoute>
            <AppLayout>
              <QueriesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SubscriptionPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pricing"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PricingPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/api-keys"
        element={
          <ProtectedRoute>
            <AppLayout>
              <APIKeysPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/databases"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DatabaseConnectionsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile-settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfileSettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/license"
        element={
          <ProtectedRoute>
            <AppLayout>
              <LicenseActivationPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contexts"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ContextManager />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LicenseProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </LicenseProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
