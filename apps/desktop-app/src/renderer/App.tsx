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

function LoadingScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center gap-5">
      <div className="relative">
        <div className="absolute inset-0 rounded-xl bg-white/10 blur-lg scale-125 animate-pulse" />
        <img src="/logo.png" alt="Velanova" className="relative w-10 h-10 rounded-xl object-cover opacity-90" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="w-5 h-5 border border-white/20 border-t-white/70 rounded-full animate-spin" />
        <p className="text-[12px] text-zinc-600 tracking-wide">{label}</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen label="Loading…" />;
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
    <div className="flex min-h-screen bg-[#080808]">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className="flex-1 overflow-auto bg-[#0a0a0a]">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen label="Checking authentication…" />;
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
