/* ═══════════════════════════════════════════════════════════════════════
   Unit Tests — lib/pdfExport.ts
   Tests for generatePDFReport with various section types.
   jsPDF is mocked since it requires browser canvas internals.
   ═══════════════════════════════════════════════════════════════════════ */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted so mock variables are available when vi.mock factories run (hoisted to top)
const { textMock, saveMock, jsPDFMock } = vi.hoisted(() => {
  const addPageMock = vi.fn();
  const textMock = vi.fn();
  const setFontSizeMock = vi.fn();
  const setTextColorMock = vi.fn();
  const setFillColorMock = vi.fn();
  const rectMock = vi.fn();
  const saveMock = vi.fn();
  const getWidthMock = vi.fn(() => 210);
  const getHeightMock = vi.fn(() => 297);

  const jsPDFMock = vi.fn(() => ({
    addPage: addPageMock,
    text: textMock,
    setFontSize: setFontSizeMock,
    setTextColor: setTextColorMock,
    setFillColor: setFillColorMock,
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    line: vi.fn(),
    rect: rectMock,
    roundedRect: vi.fn(),
    save: saveMock,
    addImage: vi.fn(),
    splitTextToSize: vi.fn((text: string) => [text]),
    setPage: vi.fn(),
    getNumberOfPages: vi.fn(() => 1),
    internal: {
      pageSize: { getWidth: getWidthMock, getHeight: getHeightMock },
      getNumberOfPages: vi.fn(() => 1),
    },
  }));

  return {
    addPageMock,
    textMock,
    setFontSizeMock,
    setTextColorMock,
    setFillColorMock,
    rectMock,
    saveMock,
    getWidthMock,
    getHeightMock,
    jsPDFMock,
  };
});

vi.mock('jspdf', () => ({ default: jsPDFMock }));
vi.mock('jspdf-autotable', () => ({ default: vi.fn() }));
vi.mock('html2canvas', () => ({ default: vi.fn() }));

import { generatePDFReport, type PDFReportOptions } from '../../lib/pdfExport';

describe('generatePDFReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a PDF with a title and saves it', async () => {
    const config: PDFReportOptions = {
      title: 'Test Report',
      module: 'Test Module',
      sections: [],
    };

    await generatePDFReport(config);

    expect(jsPDFMock).toHaveBeenCalledWith('p', 'mm', 'a4');
    expect(saveMock).toHaveBeenCalled();
  });

  it('renders the title text on the document', async () => {
    const config: PDFReportOptions = {
      title: 'Audit Trail Report',
      subtitle: 'Complete activity log',
      module: 'Audit',
      sections: [],
    };

    await generatePDFReport(config);

    // Title should be rendered via doc.text
    const titleCalls = textMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && (c[0] as string).includes('Audit Trail Report')
    );
    expect(titleCalls.length).toBeGreaterThan(0);
  });

  it('renders subtitle when provided', async () => {
    const config: PDFReportOptions = {
      title: 'Report',
      subtitle: 'My subtitle text',
      module: 'Module',
      sections: [],
    };

    await generatePDFReport(config);

    const subtitleCalls = textMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && (c[0] as string).includes('My subtitle text')
    );
    expect(subtitleCalls.length).toBeGreaterThan(0);
  });

  it('renders classification badge (defaults to OFFICIAL)', async () => {
    const config: PDFReportOptions = {
      title: 'Report',
      module: 'Module',
      sections: [],
    };

    await generatePDFReport(config);

    const classificationCalls = textMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && (c[0] as string) === 'OFFICIAL'
    );
    expect(classificationCalls.length).toBeGreaterThanOrEqual(1);
  });

  it('uses custom classification when provided', async () => {
    const config: PDFReportOptions = {
      title: 'Report',
      module: 'Module',
      classification: 'TOP SECRET',
      sections: [],
    };

    await generatePDFReport(config);

    const calls = textMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && (c[0] as string) === 'TOP SECRET'
    );
    expect(calls.length).toBeGreaterThanOrEqual(1);
  });

  it('renders heading sections', async () => {
    const config: PDFReportOptions = {
      title: 'Report',
      module: 'Module',
      sections: [{ type: 'heading', title: 'Section Alpha' }],
    };

    await generatePDFReport(config);

    const headingCalls = textMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && (c[0] as string).includes('Section Alpha')
    );
    expect(headingCalls.length).toBeGreaterThan(0);
  });

  it('renders heading from content field when title is missing (Bug H1 fix)', async () => {
    const config: PDFReportOptions = {
      title: 'Report',
      module: 'Module',
      sections: [{ type: 'heading', content: 'Content-Only Heading' }],
    };

    await generatePDFReport(config);

    const headingCalls = textMock.mock.calls.filter(
      (c: unknown[]) =>
        typeof c[0] === 'string' && (c[0] as string).includes('Content-Only Heading')
    );
    expect(headingCalls.length).toBeGreaterThan(0);
  });

  it('renders text sections', async () => {
    const config: PDFReportOptions = {
      title: 'Report',
      module: 'Module',
      sections: [{ type: 'text', content: 'Paragraph text content here' }],
    };

    await generatePDFReport(config);

    // text() should have been called with some content
    expect(textMock).toHaveBeenCalled();
  });

  it('passes jurisdiction in meta line', async () => {
    const config: PDFReportOptions = {
      title: 'Report',
      module: 'KYC',
      jurisdiction: 'Jersey',
      sections: [],
    };

    await generatePDFReport(config);

    const metaCalls = textMock.mock.calls.filter(
      (c: unknown[]) => typeof c[0] === 'string' && (c[0] as string).includes('Jersey')
    );
    expect(metaCalls.length).toBeGreaterThan(0);
  });

  it('generates filename from module name', async () => {
    const config: PDFReportOptions = {
      title: 'Report',
      module: 'Fraud Detection',
      sections: [],
    };

    await generatePDFReport(config);

    const saveArg = saveMock.mock.calls[0]?.[0] as string;
    expect(saveArg).toBeDefined();
    expect(saveArg.toLowerCase()).toContain('velanova');
  });
});
