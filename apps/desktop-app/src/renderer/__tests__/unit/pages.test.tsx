/* Unit Tests — Page Components (Governance Features) */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock recharts
const MockChart = ({ children }: { children?: React.ReactNode }) => <div data-testid="chart">{children}</div>;
const MockElement = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: MockChart, BarChart: MockChart, LineChart: MockChart, AreaChart: MockChart, RadarChart: MockChart,
  Pie: MockElement, Bar: MockElement, Line: MockElement, Area: MockElement, Radar: MockElement,
  Cell: MockElement, XAxis: MockElement, YAxis: MockElement, CartesianGrid: MockElement,
  Tooltip: MockElement, Legend: MockElement, PolarGrid: MockElement, PolarAngleAxis: MockElement, PolarRadiusAxis: MockElement,
}));

vi.mock('../../lib/pdfExport', () => ({
  generatePDFReport: vi.fn().mockResolvedValue(undefined),
}));

/* Helper: expect at least one match */
function expectAtLeastOne(regex: RegExp) {
  expect(screen.getAllByText(regex).length).toBeGreaterThanOrEqual(1);
}

/* ── AuditTrailPage ─────────────────────────────────────────── */
describe('AuditTrailPage', () => {
  it('renders page title', async () => {
    const { default: AuditTrailPage } = await import('../../pages/AuditTrailPage');
    render(<AuditTrailPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Audit Trail');
  });

  it('renders toolbar stats', async () => {
    const { default: AuditTrailPage } = await import('../../pages/AuditTrailPage');
    render(<AuditTrailPage />);
    expectAtLeastOne(/events/);
    expectAtLeastOne(/compliance/);
  });

  it('has search input', async () => {
    const { default: AuditTrailPage } = await import('../../pages/AuditTrailPage');
    render(<AuditTrailPage />);
    expect(screen.getByPlaceholderText(/search events/i)).toBeInTheDocument();
  });

  it('renders filter selects', async () => {
    const { default: AuditTrailPage } = await import('../../pages/AuditTrailPage');
    render(<AuditTrailPage />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(3);
  });

  it('renders audit events in the list', async () => {
    const { default: AuditTrailPage } = await import('../../pages/AuditTrailPage');
    render(<AuditTrailPage />);
    expectAtLeastOne(/Filed SAR with JFSC/);
    expectAtLeastOne(/Claire de la Haye/);
  });

  it('filters by search query', async () => {
    const { default: AuditTrailPage } = await import('../../pages/AuditTrailPage');
    render(<AuditTrailPage />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText(/search events/i);
    await user.type(input, 'SAR');
    expectAtLeastOne(/Filed SAR with JFSC/);
  });
});

/* ── ComplianceMatrixPage ──────────────────────────────────── */
describe('ComplianceMatrixPage', () => {
  it('renders page title', async () => {
    const { default: ComplianceMatrixPage } = await import('../../pages/ComplianceMatrixPage');
    render(<ComplianceMatrixPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Compliance Matrix');
  });

  it('shows compliance rate in toolbar', async () => {
    const { default: ComplianceMatrixPage } = await import('../../pages/ComplianceMatrixPage');
    render(<ComplianceMatrixPage />);
    // The compliance rate is shown as a percentage in the toolbar
    expectAtLeastOne(/%/);
  });

  it('renders category filter buttons', async () => {
    const { default: ComplianceMatrixPage } = await import('../../pages/ComplianceMatrixPage');
    render(<ComplianceMatrixPage />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expectAtLeastOne(/AML\/CFT/);
  });

  it('has a search input', async () => {
    const { default: ComplianceMatrixPage } = await import('../../pages/ComplianceMatrixPage');
    render(<ComplianceMatrixPage />);
    expect(screen.getByPlaceholderText(/search frameworks/i)).toBeInTheDocument();
  });

  it('shows regulation list items', async () => {
    const { default: ComplianceMatrixPage } = await import('../../pages/ComplianceMatrixPage');
    render(<ComplianceMatrixPage />);
    expectAtLeastOne(/JFSC AML/);
    expectAtLeastOne(/POCL/);
  });
});

/* ── ExecutiveSummaryPage ──────────────────────────────────── */
describe('ExecutiveSummaryPage', () => {
  it('renders page title', async () => {
    const { default: ExecutiveSummaryPage } = await import('../../pages/ExecutiveSummaryPage');
    render(<ExecutiveSummaryPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Executive Summary');
  });

  it('shows idle state before generation', async () => {
    const { default: ExecutiveSummaryPage } = await import('../../pages/ExecutiveSummaryPage');
    render(<ExecutiveSummaryPage />);
    expect(screen.getByText('Generate Executive Summary')).toBeInTheDocument();
  });

  it('has a generate button', async () => {
    const { default: ExecutiveSummaryPage } = await import('../../pages/ExecutiveSummaryPage');
    render(<ExecutiveSummaryPage />);
    expect(screen.getByText('Generate Summary')).toBeInTheDocument();
  });
});

/* ── DataSovereigntyPage ───────────────────────────────────── */
describe('DataSovereigntyPage', () => {
  it('renders page title', async () => {
    const { default: DataSovereigntyPage } = await import('../../pages/DataSovereigntyPage');
    render(<DataSovereigntyPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Data Sovereignty');
  });

  it('shows JDPA GDPR badge', async () => {
    const { default: DataSovereigntyPage } = await import('../../pages/DataSovereigntyPage');
    render(<DataSovereigntyPage />);
    expectAtLeastOne(/JDPA/);
  });

  it('renders view toggle tabs', async () => {
    const { default: DataSovereigntyPage } = await import('../../pages/DataSovereigntyPage');
    render(<DataSovereigntyPage />);
    expect(screen.getByText('Data Stores')).toBeInTheDocument();
    expect(screen.getByText('Data Flows')).toBeInTheDocument();
    expect(screen.getByText('Regulations')).toBeInTheDocument();
  });

  it('shows data store cards', async () => {
    const { default: DataSovereigntyPage } = await import('../../pages/DataSovereigntyPage');
    render(<DataSovereigntyPage />);
    expectAtLeastOne(/Primary Transaction DB/);
  });

  it('switches between views on tab click', async () => {
    const { default: DataSovereigntyPage } = await import('../../pages/DataSovereigntyPage');
    render(<DataSovereigntyPage />);
    const user = userEvent.setup();
    await user.click(screen.getByText('Data Flows'));
    expectAtLeastOne(/Cross-border/);
  });
});

/* ── MultiJurisdictionPage ─────────────────────────────────── */
describe('MultiJurisdictionPage', () => {
  it('renders page title', async () => {
    const { default: MultiJurisdictionPage } = await import('../../pages/MultiJurisdictionPage');
    render(<MultiJurisdictionPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Multi-Jurisdiction Comparison');
  });

  it('shows jurisdiction buttons', async () => {
    const { default: MultiJurisdictionPage } = await import('../../pages/MultiJurisdictionPage');
    render(<MultiJurisdictionPage />);
    expectAtLeastOne(/Jersey/);
    expectAtLeastOne(/United Kingdom/);
    expectAtLeastOne(/Switzerland/);
  });

  it('shows regulatory dimension cards', async () => {
    const { default: MultiJurisdictionPage } = await import('../../pages/MultiJurisdictionPage');
    render(<MultiJurisdictionPage />);
    expectAtLeastOne(/AML Framework/);
    expectAtLeastOne(/Data Protection/);
  });

  it('category filters are rendered', async () => {
    const { default: MultiJurisdictionPage } = await import('../../pages/MultiJurisdictionPage');
    render(<MultiJurisdictionPage />);
    expectAtLeastOne(/^all$/);
    expectAtLeastOne(/^financial$/);
    expectAtLeastOne(/^technology$/);
    expectAtLeastOne(/^governance$/);
  });
});

/* ── WorkflowAutomationPage ────────────────────────────────── */
describe('WorkflowAutomationPage', () => {
  it('renders page title', async () => {
    const { default: WorkflowAutomationPage } = await import('../../pages/WorkflowAutomationPage');
    render(<WorkflowAutomationPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Workflow Automation');
  });

  it('shows workflow list', async () => {
    const { default: WorkflowAutomationPage } = await import('../../pages/WorkflowAutomationPage');
    render(<WorkflowAutomationPage />);
    expectAtLeastOne(/SAR Filing Pipeline/);
    expectAtLeastOne(/KYC Client Onboarding/);
  });

  it('renders stats cards for selected workflow', async () => {
    const { default: WorkflowAutomationPage } = await import('../../pages/WorkflowAutomationPage');
    render(<WorkflowAutomationPage />);
    expect(screen.getByText('Total Runs')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
  });

  it('shows filter buttons', async () => {
    const { default: WorkflowAutomationPage } = await import('../../pages/WorkflowAutomationPage');
    render(<WorkflowAutomationPage />);
    expectAtLeastOne(/active/);
    expectAtLeastOne(/paused/);
  });
});

/* ── BYOKConfigPage ────────────────────────────────────────── */
describe('BYOKConfigPage', () => {
  it('renders page title', async () => {
    const { default: BYOKConfigPage } = await import('../../pages/BYOKConfigPage');
    render(<BYOKConfigPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('AI Model Governance');
  });

  it('shows model cards in default view', async () => {
    const { default: BYOKConfigPage } = await import('../../pages/BYOKConfigPage');
    render(<BYOKConfigPage />);
    expectAtLeastOne(/Fraud Detection Engine/);
    expectAtLeastOne(/AML Detection Engine/);
  });

  it('has view toggle buttons', async () => {
    const { default: BYOKConfigPage } = await import('../../pages/BYOKConfigPage');
    render(<BYOKConfigPage />);
    expect(screen.getByText('Models')).toBeInTheDocument();
    expect(screen.getByText('API Keys')).toBeInTheDocument();
    expect(screen.getByText('Governance')).toBeInTheDocument();
  });

  it('switches to API Keys view', async () => {
    const { default: BYOKConfigPage } = await import('../../pages/BYOKConfigPage');
    render(<BYOKConfigPage />);
    const user = userEvent.setup();
    await user.click(screen.getByText('API Keys'));
    expect(screen.getByText('API Key Management')).toBeInTheDocument();
  });

  it('switches to Governance view', async () => {
    const { default: BYOKConfigPage } = await import('../../pages/BYOKConfigPage');
    render(<BYOKConfigPage />);
    const user = userEvent.setup();
    await user.click(screen.getByText('Governance'));
    expect(screen.getByText('AI Governance Framework')).toBeInTheDocument();
  });
});

/* ── BiasMonitoringPage ────────────────────────────────────── */
describe('BiasMonitoringPage', () => {
  it('renders page title', async () => {
    const { default: BiasMonitoringPage } = await import('../../pages/BiasMonitoringPage');
    render(<BiasMonitoringPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Bias & Fairness Monitoring');
  });

  it('shows stats cards', async () => {
    const { default: BiasMonitoringPage } = await import('../../pages/BiasMonitoringPage');
    render(<BiasMonitoringPage />);
    expect(screen.getByText('Total Bias Reports')).toBeInTheDocument();
  });

  it('shows bias dimension names', async () => {
    const { default: BiasMonitoringPage } = await import('../../pages/BiasMonitoringPage');
    render(<BiasMonitoringPage />);
    expectAtLeastOne(/Geographic Origin/);
    expectAtLeastOne(/Entity Type/);
    expectAtLeastOne(/Client Nationality/);
  });

  it('filters by bias level', async () => {
    const { default: BiasMonitoringPage } = await import('../../pages/BiasMonitoringPage');
    render(<BiasMonitoringPage />);
    const user = userEvent.setup();
    const levelButtons = screen.getAllByText('significant');
    await user.click(levelButtons[levelButtons.length - 1]);
    expectAtLeastOne(/Client Nationality/);
  });

  it('shows disparate impact explanation panel', async () => {
    const { default: BiasMonitoringPage } = await import('../../pages/BiasMonitoringPage');
    render(<BiasMonitoringPage />);
    expectAtLeastOne(/Disparate Impact/);
  });
});

/* ── SanctionsScreeningPage ────────────────────────────────── */
describe('SanctionsScreeningPage', () => {
  it('renders page title', async () => {
    const { default: SanctionsScreeningPage } = await import('../../pages/SanctionsScreeningPage');
    render(<SanctionsScreeningPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sanctions & PEP Screening');
  });

  it('shows stats cards', async () => {
    const { default: SanctionsScreeningPage } = await import('../../pages/SanctionsScreeningPage');
    render(<SanctionsScreeningPage />);
    expect(screen.getByText('Total Screened')).toBeInTheDocument();
    expect(screen.getByText('Active Matches')).toBeInTheDocument();
  });

  it('shows entity names', async () => {
    const { default: SanctionsScreeningPage } = await import('../../pages/SanctionsScreeningPage');
    render(<SanctionsScreeningPage />);
    expectAtLeastOne(/Mikhail Petrov/);
    expectAtLeastOne(/Ahmad Al-Rashid/);
  });

  it('has search and filter controls', async () => {
    const { default: SanctionsScreeningPage } = await import('../../pages/SanctionsScreeningPage');
    render(<SanctionsScreeningPage />);
    expect(screen.getByPlaceholderText(/search entity/i)).toBeInTheDocument();
    expectAtLeastOne(/confirmed/);
    expectAtLeastOne(/potential/);
  });

  it('filters by status', async () => {
    const { default: SanctionsScreeningPage } = await import('../../pages/SanctionsScreeningPage');
    render(<SanctionsScreeningPage />);
    const user = userEvent.setup();
    const confirmedBtns = screen.getAllByText('confirmed');
    await user.click(confirmedBtns[confirmedBtns.length - 1]);
    expectAtLeastOne(/Mikhail Petrov/);
  });

  it('shows data sources panel', async () => {
    const { default: SanctionsScreeningPage } = await import('../../pages/SanctionsScreeningPage');
    render(<SanctionsScreeningPage />);
    expect(screen.getByText('Consolidated Screening Sources')).toBeInTheDocument();
    expectAtLeastOne(/OpenSanctions/);
  });

  it('shows match scores', async () => {
    const { default: SanctionsScreeningPage } = await import('../../pages/SanctionsScreeningPage');
    render(<SanctionsScreeningPage />);
    expectAtLeastOne(/94%/);
    expectAtLeastOne(/78%/);
  });
});
