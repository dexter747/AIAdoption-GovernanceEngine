/* ═══════════════════════════════════════════════════════════════════════
   Unit Tests — ExportButton component
   Tests: rendering, click states (idle/generating/done), compact mode
   ═══════════════════════════════════════════════════════════════════════ */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExportButton from '../../components/ui/ExportButton';
import type { PDFReportOptions } from '../../lib/pdfExport';

// Mock generatePDFReport
vi.mock('../../lib/pdfExport', () => ({
  generatePDFReport: vi.fn().mockResolvedValue(undefined),
}));

const mockConfig: PDFReportOptions = {
  title: 'Test Report',
  module: 'Test',
  sections: [],
};

describe('ExportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default label "Export PDF"', () => {
    render(<ExportButton getReportConfig={() => mockConfig} />);
    expect(screen.getByText('Export PDF')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<ExportButton getReportConfig={() => mockConfig} label="Download Report" />);
    expect(screen.getByText('Download Report')).toBeInTheDocument();
  });

  it('renders compact mode (icon only, no text)', () => {
    render(<ExportButton getReportConfig={() => mockConfig} compact />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    // Compact mode should NOT render the "Export PDF" text
    expect(screen.queryByText('Export PDF')).not.toBeInTheDocument();
  });

  it('calls getReportConfig and generatePDFReport on click', async () => {
    const { generatePDFReport } = await import('../../lib/pdfExport');
    const configFn = vi.fn().mockReturnValue(mockConfig);
    const user = userEvent.setup();

    render(<ExportButton getReportConfig={configFn} />);
    await user.click(screen.getByRole('button'));

    expect(configFn).toHaveBeenCalledOnce();
    expect(generatePDFReport).toHaveBeenCalledWith(mockConfig);
  });

  it('shows "Generating..." state while PDF is being created', async () => {
    const { generatePDFReport } = await import('../../lib/pdfExport');
    let resolvePromise: () => void;
    const promise = new Promise<void>(resolve => { resolvePromise = resolve; });
    (generatePDFReport as ReturnType<typeof vi.fn>).mockReturnValue(promise);

    const user = userEvent.setup();
    render(<ExportButton getReportConfig={() => mockConfig} />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Generating...')).toBeInTheDocument();

    // Resolve the promise to clean up
    resolvePromise!();
    await waitFor(() => {
      expect(screen.queryByText('Generating...')).not.toBeInTheDocument();
    });
  });

  it('shows "Downloaded!" state after successful export', async () => {
    const { generatePDFReport } = await import('../../lib/pdfExport');
    (generatePDFReport as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<ExportButton getReportConfig={() => mockConfig} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Downloaded!')).toBeInTheDocument();
    });
  });

  it('reverts to idle after error', async () => {
    const { generatePDFReport } = await import('../../lib/pdfExport');
    (generatePDFReport as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('PDF fail'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const user = userEvent.setup();
    render(<ExportButton getReportConfig={() => mockConfig} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Export PDF')).toBeInTheDocument();
    });
  });

  it('disables button while generating', async () => {
    const { generatePDFReport } = await import('../../lib/pdfExport');
    let resolvePromise: () => void;
    const promise = new Promise<void>(resolve => { resolvePromise = resolve; });
    (generatePDFReport as ReturnType<typeof vi.fn>).mockReturnValue(promise);

    const user = userEvent.setup();
    render(<ExportButton getReportConfig={() => mockConfig} />);

    await user.click(screen.getByRole('button'));

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    resolvePromise!();
    await waitFor(() => {
      expect(screen.queryByText('Generating...')).not.toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    render(<ExportButton getReportConfig={() => mockConfig} className="custom-cls" />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('custom-cls');
  });

  it('cleans up timer on unmount (no React warning)', async () => {
    const { generatePDFReport } = await import('../../lib/pdfExport');
    (generatePDFReport as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const user = userEvent.setup();
    const { unmount } = render(<ExportButton getReportConfig={() => mockConfig} />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Downloaded!')).toBeInTheDocument();
    });

    // Unmount while the 2s reset timer is still pending — should not cause errors
    expect(() => unmount()).not.toThrow();
  });
});
