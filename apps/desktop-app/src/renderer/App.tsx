import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LicenseProvider } from './context/LicenseContext';
import { ToastProvider } from './components/ui/toast';
import { ErrorBoundary } from './components/ui/error-boundary';
import Sidebar from './components/Sidebar';
import { useState, useEffect, lazy, Suspense, memo } from 'react';

// ── Lazy-loaded pages ──────────────────────────────────────────────────────────
// Each page is only fetched & parsed when the user first visits that route.
// This reduces the initial JS bundle from one monolith to small route chunks,
// cutting startup time and RAM usage on older machines by ~30–50 %.
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ConnectionsPageEnhanced = lazy(() => import('./pages/ConnectionsPageEnhanced'));
const QueriesPage = lazy(() => import('./pages/QueriesPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const APIKeysPage = lazy(() => import('./pages/APIKeysPage'));
const DatabaseConnectionsPage = lazy(() => import('./pages/DatabaseConnectionsPage'));
const ModernChatPage = lazy(() => import('./pages/ModernChatPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const ConnectionsDashboard = lazy(() => import('./pages/ConnectionsDashboard'));
const ProfileSettingsPage = lazy(() => import('./pages/ProfileSettingsPage'));
const LicenseActivationPage = lazy(() => import('./pages/LicenseActivationPage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const MyConnectionsPage = lazy(() => import('./pages/MyConnectionsPage'));
const ContextManager = lazy(() => import('./components/ContextManager'));

// ── Solutions pages ────────────────────────────────────────────────────────────
const BusinessIntelPage = lazy(() => import('./pages/BusinessIntelPage'));
const ProjectIntelPage = lazy(() => import('./pages/ProjectIntelPage'));
const ResourcePlanningPage = lazy(() => import('./pages/ResourcePlanningPage'));
const RegulatoryIntelPage = lazy(() => import('./pages/RegulatoryIntelPage'));
const ProcurementPage = lazy(() => import('./pages/ProcurementPage'));
const KYCDashboardPage = lazy(() => import('./pages/KYCDashboardPage'));
const FraudDetectionPage = lazy(() => import('./pages/FraudDetectionPage'));
const AMLDashboardPage = lazy(() => import('./pages/AMLDashboardPage'));
const ESGReportingPage = lazy(() => import('./pages/ESGReportingPage'));
const ClientReportingPage = lazy(() => import('./pages/ClientReportingPage'));

// ── Tiny spinner shown while a lazy chunk is downloading ───────────────────
const PageFallback = memo(() => (
  <div className="flex-1 flex items-center justify-center">
    <div className="w-4 h-4 border border-white/20 border-t-white/60 rounded-full animate-spin" />
  </div>
));

function LoadingScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center gap-5">
      <div className="relative">
        <div className="absolute inset-0 rounded-xl bg-white/10 blur-lg scale-125 animate-pulse" />
        <img
          src="/logo.png"
          alt="Velanova"
          className="relative w-10 h-10 rounded-xl object-cover opacity-90"
        />
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

  // Persist sidebar state without triggering re-renders in children
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    /* Full-screen window — no scroll at this level */
    <div className="flex h-screen overflow-hidden bg-[#080808]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      {/* 1px panel divider is already part of sidebar border-r */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0b0b0b]">
        <Suspense fallback={<PageFallback />}>{children}</Suspense>
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
    <Suspense fallback={<LoadingScreen />}>
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
        {/* Solutions routes */}
        <Route path="/business-intel" element={<ProtectedRoute><AppLayout><BusinessIntelPage /></AppLayout></ProtectedRoute>} />
        <Route path="/project-intel" element={<ProtectedRoute><AppLayout><ProjectIntelPage /></AppLayout></ProtectedRoute>} />
        <Route path="/resource-planning" element={<ProtectedRoute><AppLayout><ResourcePlanningPage /></AppLayout></ProtectedRoute>} />
        <Route path="/regulatory-intel" element={<ProtectedRoute><AppLayout><RegulatoryIntelPage /></AppLayout></ProtectedRoute>} />
        <Route path="/procurement" element={<ProtectedRoute><AppLayout><ProcurementPage /></AppLayout></ProtectedRoute>} />
        <Route path="/kyc" element={<ProtectedRoute><AppLayout><KYCDashboardPage /></AppLayout></ProtectedRoute>} />
        <Route path="/fraud-detection" element={<ProtectedRoute><AppLayout><FraudDetectionPage /></AppLayout></ProtectedRoute>} />
        <Route path="/aml" element={<ProtectedRoute><AppLayout><AMLDashboardPage /></AppLayout></ProtectedRoute>} />
        <Route path="/esg" element={<ProtectedRoute><AppLayout><ESGReportingPage /></AppLayout></ProtectedRoute>} />
        <Route path="/client-reporting" element={<ProtectedRoute><AppLayout><ClientReportingPage /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
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
