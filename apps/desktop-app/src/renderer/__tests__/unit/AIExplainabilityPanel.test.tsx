/* ═══════════════════════════════════════════════════════════════════════
   Unit Tests — AIExplainabilityPanel
   Tests: rendering, compact mode, expansion, factors, risk flags, model info
   ═══════════════════════════════════════════════════════════════════════ */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIExplainabilityPanel from '../../components/ui/AIExplainabilityPanel';

describe('AIExplainabilityPanel', () => {
  const baseProps = {
    confidence: 87,
    reasoning: 'Multiple structuring patterns detected across linked accounts.',
    recommendedAction: 'Escalate to MLRO for SAR consideration.',
  };

  describe('collapsed state (default)', () => {
    it('renders the "Why this decision?" header button', () => {
      render(<AIExplainabilityPanel {...baseProps} />);
      expect(screen.getByText('Why this decision?')).toBeInTheDocument();
    });

    it('shows confidence percentage in header', () => {
      render(<AIExplainabilityPanel {...baseProps} />);
      expect(screen.getByText('87%')).toBeInTheDocument();
    });

    it('does NOT show reasoning text when collapsed', () => {
      render(<AIExplainabilityPanel {...baseProps} />);
      expect(screen.queryByText(baseProps.reasoning)).not.toBeInTheDocument();
    });
  });

  describe('expanded state', () => {
    it('shows reasoning on click', async () => {
      const user = userEvent.setup();
      render(<AIExplainabilityPanel {...baseProps} />);

      await user.click(screen.getByText('Why this decision?'));

      expect(screen.getByText(baseProps.reasoning)).toBeInTheDocument();
    });

    it('shows recommended action when expanded', async () => {
      const user = userEvent.setup();
      render(<AIExplainabilityPanel {...baseProps} />);

      await user.click(screen.getByText('Why this decision?'));

      expect(screen.getByText('Recommended Action')).toBeInTheDocument();
      expect(screen.getByText(baseProps.recommendedAction!)).toBeInTheDocument();
    });

    it('shows confidence gauge with description', async () => {
      const user = userEvent.setup();
      render(<AIExplainabilityPanel {...baseProps} />);

      await user.click(screen.getByText('Why this decision?'));

      expect(screen.getByText('Decision Confidence')).toBeInTheDocument();
      // 87% = "Very high confidence"
      expect(screen.getByText(/Very high confidence/)).toBeInTheDocument();
    });

    it('shows low confidence description for low values', async () => {
      const user = userEvent.setup();
      render(<AIExplainabilityPanel {...baseProps} confidence={30} />);

      await user.click(screen.getByText('Why this decision?'));

      expect(screen.getByText(/Low confidence/)).toBeInTheDocument();
    });

    it('toggles collapse on second click', async () => {
      const user = userEvent.setup();
      render(<AIExplainabilityPanel {...baseProps} />);

      await user.click(screen.getByText('Why this decision?'));
      expect(screen.getByText(baseProps.reasoning)).toBeInTheDocument();

      await user.click(screen.getByText('Why this decision?'));
      expect(screen.queryByText(baseProps.reasoning)).not.toBeInTheDocument();
    });
  });

  describe('defaultOpen', () => {
    it('renders expanded when defaultOpen=true', () => {
      render(<AIExplainabilityPanel {...baseProps} defaultOpen />);
      expect(screen.getByText(baseProps.reasoning)).toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    it('renders inline compact view with reasoning', () => {
      render(<AIExplainabilityPanel {...baseProps} compact />);

      expect(screen.getByText('AI Explainability')).toBeInTheDocument();
      expect(screen.getByText(baseProps.reasoning)).toBeInTheDocument();
      // No expand button — always shown
      expect(screen.queryByText('Why this decision?')).not.toBeInTheDocument();
    });

    it('shows confidence label in compact view', () => {
      render(<AIExplainabilityPanel {...baseProps} compact />);
      expect(screen.getByText(/Confidence: 87%/)).toBeInTheDocument();
    });
  });

  describe('factors', () => {
    it('renders contributing factors when expanded', async () => {
      const user = userEvent.setup();
      const factors = [
        { factor: 'Transaction Velocity', weight: 'high' as const, detail: '14 transactions in 2 hours' },
        { factor: 'Geographic Risk', weight: 'medium' as const, detail: 'Transfers to high-risk jurisdictions' },
      ];

      render(<AIExplainabilityPanel {...baseProps} factors={factors} />);
      await user.click(screen.getByText('Why this decision?'));

      expect(screen.getByText('Contributing Factors')).toBeInTheDocument();
      expect(screen.getByText('Transaction Velocity')).toBeInTheDocument();
      expect(screen.getByText('Geographic Risk')).toBeInTheDocument();
      expect(screen.getByText(/high impact/i)).toBeInTheDocument();
      expect(screen.getByText(/medium impact/i)).toBeInTheDocument();
    });
  });

  describe('riskFlags', () => {
    it('renders risk flags when expanded', async () => {
      const user = userEvent.setup();
      render(<AIExplainabilityPanel {...baseProps} riskFlags={['PEP_ASSOCIATION', 'SANCTIONS_HIT']} />);

      await user.click(screen.getByText('Why this decision?'));

      expect(screen.getByText('Risk Flags')).toBeInTheDocument();
      expect(screen.getByText('PEP ASSOCIATION')).toBeInTheDocument();
      expect(screen.getByText('SANCTIONS HIT')).toBeInTheDocument();
    });
  });

  describe('dataSources', () => {
    it('renders data sources list when expanded', async () => {
      const user = userEvent.setup();
      render(<AIExplainabilityPanel {...baseProps} dataSources={['Transaction DB', 'OpenSanctions', 'JFSC PEP List']} />);

      await user.click(screen.getByText('Why this decision?'));

      expect(screen.getByText('Data Sources')).toBeInTheDocument();
      expect(screen.getByText('Transaction DB')).toBeInTheDocument();
      expect(screen.getByText('OpenSanctions')).toBeInTheDocument();
    });
  });

  describe('modelInfo', () => {
    it('renders model information when expanded', async () => {
      const user = userEvent.setup();
      render(
        <AIExplainabilityPanel
          {...baseProps}
          modelInfo={{ name: 'Fraud Engine', version: '3.2.1', type: 'Random Forest + LSTM' }}
        />
      );

      await user.click(screen.getByText('Why this decision?'));

      expect(screen.getByText('Model Information')).toBeInTheDocument();
      expect(screen.getByText('Fraud Engine')).toBeInTheDocument();
      expect(screen.getByText('3.2.1')).toBeInTheDocument();
    });
  });
});
