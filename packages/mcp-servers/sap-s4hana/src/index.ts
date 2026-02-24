#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
  if (!process.env.SAP_S4_BASE_URL) console.error('Warning: SAP_S4_BASE_URL not set');
  if (!process.env.SAP_S4_USERNAME) console.error('Warning: SAP_S4_USERNAME not set');
  if (!process.env.SAP_S4_PASSWORD) console.error('Warning: SAP_S4_PASSWORD not set');

  api = axios.create({
    baseURL: `${process.env.SAP_S4_BASE_URL}/sap/opu/odata/sap`,
    auth: {
      username: process.env.SAP_S4_USERNAME || '',
      password: process.env.SAP_S4_PASSWORD || '',
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: 30000,
  });
}

const tools = [
  {
    name: 'list_sales_orders',
    description: 'List sales orders',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'get_sales_order',
    description: 'Get sales order details',
    inputSchema: {
      type: 'object' as const,
      properties: { orderId: { type: 'string', description: 'The orderId' } },
      required: ['orderId'],
    },
  },
  {
    name: 'list_purchase_orders',
    description: 'List purchase orders',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_business_partners',
    description: 'List business partners',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'list_materials',
    description: 'List materials',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
];

async function safeCall(
  fn: () => Promise<any>
): Promise<{ content: { type: 'text'; text: string }[] }> {
  try {
    const response = await fn();
    return { content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }] };
  } catch (err: any) {
    const msg = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
    return { content: [{ type: 'text' as const, text: `Error: ${msg}` }] };
  }
}

async function main(): Promise<void> {
  initConnection();

  const server = new Server(
    { name: 'sap-s4hana-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
      case 'list_sales_orders':
        return safeCall(() => api.get(`/API_SALES_ORDER_SRV/A_SalesOrder`));
      case 'get_sales_order':
        return safeCall(() => api.get(`/API_SALES_ORDER_SRV/A_SalesOrder('${a.orderId}')`));
      case 'list_purchase_orders':
        return safeCall(() => api.get(`/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder`));
      case 'list_business_partners':
        return safeCall(() => api.get(`/API_BUSINESS_PARTNER/A_BusinessPartner`));
      case 'list_materials':
        return safeCall(() => api.get(`/API_PRODUCT_SRV/A_Product`));
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('SAP S/4HANA MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
