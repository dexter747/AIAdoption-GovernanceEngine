import { IntegrationsClient } from './IntegrationsClient';
import { totalIntegrationCount } from '@/data/integrations-data';

export const metadata = {
  title: 'All Integrations',
  description: `Connect to ${totalIntegrationCount}+ enterprise systems. MCP servers, APIs, databases, ERPs, CRMs, mainframes, and more — each with unique connection fields.`,
};

export default function IntegrationsPage() {
  return <IntegrationsClient />;
}
