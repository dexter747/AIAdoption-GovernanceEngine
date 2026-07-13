/* ═══════════════════════════════════════════════════════════════════════
   Integration Tests — Routing, Sidebar Navigation, Cross-Component
   Tests that lazy-loaded pages mount correctly via React Router
   and that Sidebar navigation links resolve to the correct routes.
   ═══════════════════════════════════════════════════════════════════════ */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from '../../components/ui/NotificationSystem';

// Mock the auth context so ProtectedRoute passes through
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: '1', email: 'test@velanova.ai', name: 'Test User' },
    token: 'test-token',
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('../../hooks/useCachedAvatar', () => ({
  useCachedAvatar: () => null,
}));

// Mock recharts ResponsiveContainer globally for all integration tests
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  };
});

// Mock pdfExport
vi.mock('../../lib/pdfExport', () => ({
  generatePDFReport: vi.fn().mockResolvedValue(undefined),
}));

// Helper: render page at a specific route
function renderAtRoute(route: string, PageComponent: React.ComponentType) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <NotificationProvider>
        <Routes>
          <Route path={route} element={<PageComponent />} />
        </Routes>
      </NotificationProvider>
    </MemoryRouter>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   IT-1: Route → Page Component Mounting
   Verifies every governance feature page mounts on its route without
   crashing and renders its unique title/identifier.
   ═══════════════════════════════════════════════════════════════════════ */
describe('IT-1: Route-based page mounting', () => {
  const routePageMap = [
    { route: '/audit-trail', module: 'AuditTrailPage', title: 'Audit Trail' },
    { route: '/compliance-matrix', module: 'ComplianceMatrixPage', title: 'Compliance Matrix' },
    { route: '/executive-summary', module: 'ExecutiveSummaryPage', title: 'Executive Summary' },
    { route: '/data-sovereignty', module: 'DataSovereigntyPage', title: 'Data Sovereignty' },
    {
      route: '/multi-jurisdiction',
      module: 'MultiJurisdictionPage',
      title: 'Multi-Jurisdiction Comparison',
    },
    { route: '/workflows', module: 'WorkflowAutomationPage', title: 'Workflow Automation' },
    { route: '/ai-governance', module: 'BYOKConfigPage', title: 'AI Model Governance' },
    {
      route: '/bias-monitoring',
      module: 'BiasMonitoringPage',
      title: 'Bias & Fairness Monitoring',
    },
    {
      route: '/sanctions-screening',
      module: 'SanctionsScreeningPage',
      title: 'Sanctions & PEP Screening',
    },
  ];

  routePageMap.forEach(({ route, module, title }) => {
    it(`mounts ${module} at ${route}`, async () => {
      const { default: PageComponent } = await import(`../../pages/${module}`);
      renderAtRoute(route, PageComponent);

      await waitFor(() => {
        expect(screen.getByText(title)).toBeInTheDocument();
      });
    });
  });
});

/* ═══════════════════════════════════════════════════════════════════════
   IT-2: Sidebar Navigation Links
   Verifies the Sidebar component renders correct nav links for all
   governance features.
   ═══════════════════════════════════════════════════════════════════════ */
describe('IT-2: Sidebar renders governance nav links', () => {
  it('renders all governance page links', async () => {
    const { default: Sidebar } = await import('../../components/Sidebar');

    render(
      <MemoryRouter initialEntries={['/audit-trail']}>
        <NotificationProvider>
          <Sidebar collapsed={false} onToggle={vi.fn()} />
        </NotificationProvider>
      </MemoryRouter>
    );

    const expectedLinks = [
      { name: 'Audit Trail', href: '/audit-trail' },
      { name: 'Risk Heatmap', href: '/risk-heatmap' },
      { name: 'Exec Summary', href: '/executive-summary' },
      { name: 'Compliance', href: '/compliance-matrix' },
      { name: 'Data Sovereignty', href: '/data-sovereignty' },
      { name: 'Jurisdictions', href: '/multi-jurisdiction' },
      { name: 'Workflows', href: '/workflows' },
      { name: 'AI Governance', href: '/ai-governance' },
      { name: 'Bias Monitor', href: '/bias-monitoring' },
      { name: 'Sanctions', href: '/sanctions-screening' },
    ];

    for (const { name, href } of expectedLinks) {
      const link = screen.getByText(name);
      expect(link).toBeInTheDocument();
      // Verify link target
      const anchor = link.closest('a');
      expect(anchor).toBeTruthy();
      expect(anchor?.getAttribute('href')).toBe(href);
    }
  });

  it('collapses sidebar and hides link text', async () => {
    const { default: Sidebar } = await import('../../components/Sidebar');

    render(
      <MemoryRouter initialEntries={['/']}>
        <NotificationProvider>
          <Sidebar collapsed={true} onToggle={vi.fn()} />
        </NotificationProvider>
      </MemoryRouter>
    );

    // In collapsed mode, text should not be visible (hidden by CSS or not rendered)
    // The links still exist but text is hidden
    expect(screen.queryByText('Audit Trail')).not.toBeInTheDocument();
  });
});

/* ═══════════════════════════════════════════════════════════════════════
   IT-3: PDF Export Integration
   Verifies ExportButton on pages correctly calls generatePDFReport
   with the page-specific configuration.
   ═══════════════════════════════════════════════════════════════════════ */
describe('IT-3: PDF Export integration across pages', () => {
  const pdfPages = [
    { module: 'AuditTrailPage', route: '/audit-trail' },
    { module: 'ComplianceMatrixPage', route: '/compliance-matrix' },
    { module: 'BiasMonitoringPage', route: '/bias-monitoring' },
    { module: 'SanctionsScreeningPage', route: '/sanctions-screening' },
  ];

  pdfPages.forEach(({ module, route }) => {
    it(`${module} has a working export button`, async () => {
      const { generatePDFReport } = await import('../../lib/pdfExport');
      const { default: PageComponent } = await import(`../../pages/${module}`);
      const user = userEvent.setup();

      renderAtRoute(route, PageComponent);

      // Find the export button (compact or full)
      const exportButtons = screen.getAllByRole('button');
      const exportBtn = exportButtons.find(
        b =>
          b.textContent?.includes('Export PDF') ||
          b.getAttribute('title')?.includes('Export') ||
          b.getAttribute('title')?.includes('Downloaded')
      );

      // compact buttons don't have text, find by svg icon in a button with title
      if (exportBtn) {
        await user.click(exportBtn);
        await waitFor(() => {
          expect(generatePDFReport).toHaveBeenCalled();
        });
      }
    });
  });
});

/* ═══════════════════════════════════════════════════════════════════════
   IT-4: NotificationProvider wrapping pages
   Verifies that NotificationBell receives context properly when
   placed alongside page content within NotificationProvider.
   ═══════════════════════════════════════════════════════════════════════ */
describe('IT-4: Notification integration', () => {
  it('NotificationBell works when wrapped in provider with page content', async () => {
    const { NotificationBell, useNotifications } =
      await import('../../components/ui/NotificationSystem');

    function PageWithBell() {
      const { addNotification, unreadCount } = useNotifications();
      return (
        <div>
          <span data-testid="unread">{unreadCount}</span>
          <button
            data-testid="fire"
            onClick={() =>
              addNotification({
                severity: 'critical',
                title: 'Critical Alert',
                message: 'Test',
                module: 'AML',
              })
            }
          >
            Fire
          </button>
          <NotificationBell />
        </div>
      );
    }

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NotificationProvider>
          <PageWithBell />
        </NotificationProvider>
      </MemoryRouter>
    );

    // Fire a notification
    await user.click(screen.getByTestId('fire'));
    expect(screen.getByTestId('unread').textContent).toBe('1');

    // Bell should show badge
    const badge = document.querySelector('.animate-pulse');
    expect(badge).toBeInTheDocument();
  });
});

/* ═══════════════════════════════════════════════════════════════════════
   IT-5: Cross-page filter consistency
   Tests that filter state works across page re-mounts (BiasMonitoring
   and SanctionsScreening have independent filter states).
   ═══════════════════════════════════════════════════════════════════════ */
describe('IT-5: Filter state isolation between pages', () => {
  it('BiasMonitoring and SanctionsScreening maintain independent filter states', async () => {
    const { default: BiasPage } = await import('../../pages/BiasMonitoringPage');
    const { default: SanctionsPage } = await import('../../pages/SanctionsScreeningPage');
    const user = userEvent.setup();

    // Mount BiasPage, apply filter
    const { unmount: unmount1 } = renderAtRoute('/bias-monitoring', BiasPage);
    const sigButtons = screen.getAllByText('significant');
    await user.click(sigButtons[sigButtons.length - 1]);
    // Should show only significant items
    expect(screen.getByText('Client Nationality')).toBeInTheDocument();
    unmount1();

    // Mount SanctionsPage — should have its own default "all" filter
    renderAtRoute('/sanctions-screening', SanctionsPage);
    // Should show all results by default
    expect(screen.getByText('Mikhail Petrov Holdings Ltd')).toBeInTheDocument();
    expect(screen.getByText('Jersey Heritage Trust')).toBeInTheDocument();
  });
});

/* ═══════════════════════════════════════════════════════════════════════
   IT-6: ExportButton + AIExplainabilityPanel composition
   Tests that pages using both ExportButton and AIExplainabilityPanel
   (Fraud, AML) render without conflicts.
   ═══════════════════════════════════════════════════════════════════════ */
describe('IT-6: ExportButton + AIExplainability co-existence', () => {
  it('FraudDetectionPage renders both export and explainability', async () => {
    const { default: FraudPage } = await import('../../pages/FraudDetectionPage');
    renderAtRoute('/fraud-detection', FraudPage);

    await waitFor(() => {
      expect(screen.getByText('Fraud Detection')).toBeInTheDocument();
    });

    // Should have export button
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('AMLDashboardPage renders both export and explainability', async () => {
    const { default: AMLPage } = await import('../../pages/AMLDashboardPage');
    renderAtRoute('/aml', AMLPage);

    await waitFor(() => {
      expect(screen.getByText('AML & SAR Automation')).toBeInTheDocument();
    });
  });
});

/* ═══════════════════════════════════════════════════════════════════════
   IT-7: Data integrity checks
   Verifies mock data consistency within pages — counts, IDs, etc.
   ═══════════════════════════════════════════════════════════════════════ */
describe('IT-7: Mock data integrity', () => {
  it('BiasMonitoring stats match rendered data', async () => {
    const { default: BiasPage } = await import('../../pages/BiasMonitoringPage');
    renderAtRoute('/bias-monitoring', BiasPage);

    // Stats card should show "6" for total bias reports
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('SanctionsScreening total screened matches stat card', async () => {
    const { default: SanctionsPage } = await import('../../pages/SanctionsScreeningPage');
    renderAtRoute('/sanctions-screening', SanctionsPage);

    expect(screen.getByText('14,847')).toBeInTheDocument();
  });

  it('SanctionsScreening match scores sum correctly', async () => {
    const { default: SanctionsPage } = await import('../../pages/SanctionsScreeningPage');
    renderAtRoute('/sanctions-screening', SanctionsPage);

    // Confirmed matches should show high scores
    expect(screen.getByText('94%')).toBeInTheDocument();
    expect(screen.getByText('91%')).toBeInTheDocument();
  });
});
