#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

let sessionId: string = '';
let endpoint: string = '';

const TOOLS: Tool[] = [
  { name: 'read_objects', description: 'Read objects by query', inputSchema: { type: 'object', properties: { object: { type: 'string', description: 'Object type (e.g., CUSTOMER, VENDOR, GLACCOUNT)' }, fields: { type: 'array', items: { type: 'string' } }, filter: { type: 'string', description: 'Query filter expression' }, pagesize: { type: 'number' } }, required: ['object'] } },
  { name: 'get_object', description: 'Get object by key', inputSchema: { type: 'object', properties: { object: { type: 'string' }, key: { type: 'string' } }, required: ['object', 'key'] } },
  { name: 'create_object', description: 'Create a new object', inputSchema: { type: 'object', properties: { object: { type: 'string' }, data: { type: 'object' } }, required: ['object', 'data'] } },
  { name: 'update_object', description: 'Update an object', inputSchema: { type: 'object', properties: { object: { type: 'string' }, key: { type: 'string' }, data: { type: 'object' } }, required: ['object', 'key', 'data'] } },
  { name: 'run_report', description: 'Run a financial report', inputSchema: { type: 'object', properties: { reportName: { type: 'string' }, params: { type: 'object' } }, required: ['reportName'] } },
  { name: 'list_objects', description: 'List available object types', inputSchema: { type: 'object', properties: {} } },
];

const server = new Server({ name: 'sage-intacct-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });

function buildXml(functionContent: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<request><control><senderid>${process.env.INTACCT_SENDER_ID}</senderid><password>${process.env.INTACCT_SENDER_PASSWORD}</password><controlid>${Date.now()}</controlid><uniqueid>false</uniqueid><dtdversion>3.0</dtdversion></control>
<operation><authentication><sessionid>${sessionId}</sessionid></authentication><content><function controlid="fn1">${functionContent}</function></content></operation></request>`;
}

async function initConnection() {
  const loginXml = `<?xml version="1.0" encoding="UTF-8"?>
<request><control><senderid>${process.env.INTACCT_SENDER_ID}</senderid><password>${process.env.INTACCT_SENDER_PASSWORD}</password><controlid>${Date.now()}</controlid><uniqueid>false</uniqueid><dtdversion>3.0</dtdversion></control>
<operation><authentication><login><userid>${process.env.INTACCT_USER_ID}</userid><companyid>${process.env.INTACCT_COMPANY_ID}</companyid><password>${process.env.INTACCT_USER_PASSWORD}</password></login></authentication><content><function controlid="login"><getAPISession /></function></content></operation></request>`;

  endpoint = 'https://api.intacct.com/ia/xml/xmlgw.phtml';
  const r = await axios.post(endpoint, loginXml, { headers: { 'Content-Type': 'application/xml' } });
  const match = r.data.match(/<sessionid>([^<]+)<\/sessionid>/);
  if (match) sessionId = match[1];
  const epMatch = r.data.match(/<endpoint>([^<]+)<\/endpoint>/);
  if (epMatch) endpoint = epMatch[1];
  console.error('Connected to Sage Intacct');
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (!sessionId) throw new Error('Not connected');
  try {
    switch (name) {
      case 'read_objects': {
        const fields = (args as any).fields?.join(',') || '*';
        let xml = `<readByQuery><object>${(args as any).object}</object><fields>${fields}</fields><query>${(args as any).filter || ''}</query><pagesize>${(args as any).pagesize || 100}</pagesize></readByQuery>`;
        const r = await axios.post(endpoint, buildXml(xml), { headers: { 'Content-Type': 'application/xml' } });
        return { content: [{ type: 'text' as const, text: r.data }] };
      }
      case 'get_object': {
        let xml = `<read><object>${(args as any).object}</object><keys>${(args as any).key}</keys><fields>*</fields></read>`;
        const r = await axios.post(endpoint, buildXml(xml), { headers: { 'Content-Type': 'application/xml' } });
        return { content: [{ type: 'text' as const, text: r.data }] };
      }
      case 'create_object': {
        const dataXml = Object.entries((args as any).data).map(([k, v]) => `<${k}>${v}</${k}>`).join('');
        let xml = `<create><${(args as any).object}>${dataXml}</${(args as any).object}></create>`;
        const r = await axios.post(endpoint, buildXml(xml), { headers: { 'Content-Type': 'application/xml' } });
        return { content: [{ type: 'text' as const, text: r.data }] };
      }
      case 'update_object': {
        const dataXml = Object.entries((args as any).data).map(([k, v]) => `<${k}>${v}</${k}>`).join('');
        let xml = `<update><${(args as any).object}><RECORDNO>${(args as any).key}</RECORDNO>${dataXml}</${(args as any).object}></update>`;
        const r = await axios.post(endpoint, buildXml(xml), { headers: { 'Content-Type': 'application/xml' } });
        return { content: [{ type: 'text' as const, text: r.data }] };
      }
      case 'run_report': {
        let xml = `<readReport><report>${(args as any).reportName}</report></readReport>`;
        const r = await axios.post(endpoint, buildXml(xml), { headers: { 'Content-Type': 'application/xml' } });
        return { content: [{ type: 'text' as const, text: r.data }] };
      }
      case 'list_objects': {
        let xml = `<inspect detail="1"><object>*</object></inspect>`;
        const r = await axios.post(endpoint, buildXml(xml), { headers: { 'Content-Type': 'application/xml' } });
        return { content: [{ type: 'text' as const, text: r.data }] };
      }
      default: throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Sage Intacct Error: ${error.message}` }], isError: true };
  }
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Sage Intacct MCP Server running on stdio');
}

main();
