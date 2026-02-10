#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;

const TOOLS: Tool[] = [
  { name: 'search_patients', description: 'Search for patients', inputSchema: { type: 'object', properties: { name: { type: 'string' }, birthdate: { type: 'string' }, identifier: { type: 'string' }, family: { type: 'string' }, given: { type: 'string' } } } },
  { name: 'get_patient', description: 'Get patient by ID', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'get_encounters', description: 'Get patient encounters', inputSchema: { type: 'object', properties: { patientId: { type: 'string' }, status: { type: 'string' }, date: { type: 'string' } }, required: ['patientId'] } },
  { name: 'get_conditions', description: 'Get patient conditions/diagnoses', inputSchema: { type: 'object', properties: { patientId: { type: 'string' }, category: { type: 'string' } }, required: ['patientId'] } },
  { name: 'get_medications', description: 'Get patient medication requests', inputSchema: { type: 'object', properties: { patientId: { type: 'string' }, status: { type: 'string' } }, required: ['patientId'] } },
  { name: 'get_observations', description: 'Get patient observations (labs, vitals)', inputSchema: { type: 'object', properties: { patientId: { type: 'string' }, category: { type: 'string', description: 'vital-signs, laboratory, social-history' }, code: { type: 'string' } }, required: ['patientId'] } },
  { name: 'get_allergies', description: 'Get patient allergies', inputSchema: { type: 'object', properties: { patientId: { type: 'string' } }, required: ['patientId'] } },
  { name: 'get_procedures', description: 'Get patient procedures', inputSchema: { type: 'object', properties: { patientId: { type: 'string' } }, required: ['patientId'] } },
  { name: 'get_diagnostic_reports', description: 'Get diagnostic reports', inputSchema: { type: 'object', properties: { patientId: { type: 'string' }, category: { type: 'string' } }, required: ['patientId'] } },
  { name: 'fhir_search', description: 'Generic FHIR resource search', inputSchema: { type: 'object', properties: { resourceType: { type: 'string' }, params: { type: 'object' } }, required: ['resourceType'] } },
];

const server = new Server({ name: 'epic-fhir-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });

async function initConnection() {
  const baseUrl = process.env.EPIC_FHIR_URL; // e.g., https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4
  const token = process.env.EPIC_ACCESS_TOKEN || '';

  api = axios.create({
    baseURL: baseUrl,
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/fhir+json' },
  });
  console.error(`Connected to Epic FHIR: ${baseUrl}`);
}

async function fhirGet(resource: string, params?: Record<string, any>) {
  if (!api) throw new Error('Not connected');
  const r = await api.get(`/${resource}`, { params });
  const bundle = r.data;
  if (bundle.resourceType === 'Bundle') {
    return { total: bundle.total, entries: bundle.entry?.map((e: any) => e.resource) || [] };
  }
  return bundle;
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case 'search_patients': {
        const params: any = {};
        if ((args as any).name) params.name = (args as any).name;
        if ((args as any).birthdate) params.birthdate = (args as any).birthdate;
        if ((args as any).identifier) params.identifier = (args as any).identifier;
        if ((args as any).family) params.family = (args as any).family;
        if ((args as any).given) params.given = (args as any).given;
        const result = await fhirGet('Patient', params);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
      case 'get_patient': {
        const result = await fhirGet(`Patient/${(args as any).id}`);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
      case 'get_encounters': {
        const params: any = { patient: (args as any).patientId };
        if ((args as any).status) params.status = (args as any).status;
        if ((args as any).date) params.date = (args as any).date;
        const result = await fhirGet('Encounter', params);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
      case 'get_conditions': {
        const params: any = { patient: (args as any).patientId };
        if ((args as any).category) params.category = (args as any).category;
        const result = await fhirGet('Condition', params);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
      case 'get_medications': {
        const params: any = { patient: (args as any).patientId };
        if ((args as any).status) params.status = (args as any).status;
        const result = await fhirGet('MedicationRequest', params);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
      case 'get_observations': {
        const params: any = { patient: (args as any).patientId };
        if ((args as any).category) params.category = (args as any).category;
        if ((args as any).code) params.code = (args as any).code;
        const result = await fhirGet('Observation', params);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
      case 'get_allergies': {
        const result = await fhirGet('AllergyIntolerance', { patient: (args as any).patientId });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
      case 'get_procedures': {
        const result = await fhirGet('Procedure', { patient: (args as any).patientId });
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
      case 'get_diagnostic_reports': {
        const params: any = { patient: (args as any).patientId };
        if ((args as any).category) params.category = (args as any).category;
        const result = await fhirGet('DiagnosticReport', params);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
      case 'fhir_search': {
        const result = await fhirGet((args as any).resourceType, (args as any).params || {});
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }
      default: throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Epic FHIR Error: ${error.response?.data?.issue?.[0]?.diagnostics || error.message}` }], isError: true };
  }
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Epic FHIR MCP Server running on stdio');
}

main();
