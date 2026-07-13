#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;

const TOOLS: Tool[] = [
  {
    name: 'search_patients',
    description: 'Search for patients',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        birthdate: { type: 'string' },
        identifier: { type: 'string' },
      },
    },
  },
  {
    name: 'get_patient',
    description: 'Get patient by ID',
    inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
  },
  {
    name: 'get_encounters',
    description: 'Get patient encounters',
    inputSchema: {
      type: 'object',
      properties: { patientId: { type: 'string' } },
      required: ['patientId'],
    },
  },
  {
    name: 'get_conditions',
    description: 'Get patient conditions',
    inputSchema: {
      type: 'object',
      properties: { patientId: { type: 'string' } },
      required: ['patientId'],
    },
  },
  {
    name: 'get_medications',
    description: 'Get medication requests',
    inputSchema: {
      type: 'object',
      properties: { patientId: { type: 'string' } },
      required: ['patientId'],
    },
  },
  {
    name: 'get_observations',
    description: 'Get observations (labs, vitals)',
    inputSchema: {
      type: 'object',
      properties: { patientId: { type: 'string' }, category: { type: 'string' } },
      required: ['patientId'],
    },
  },
  {
    name: 'get_allergies',
    description: 'Get allergies',
    inputSchema: {
      type: 'object',
      properties: { patientId: { type: 'string' } },
      required: ['patientId'],
    },
  },
  {
    name: 'fhir_search',
    description: 'Generic FHIR resource search',
    inputSchema: {
      type: 'object',
      properties: { resourceType: { type: 'string' }, params: { type: 'object' } },
      required: ['resourceType'],
    },
  },
];

const server = new Server(
  { name: 'cerner-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

async function initConnection() {
  const baseUrl = process.env.CERNER_FHIR_URL;
  const token = process.env.CERNER_ACCESS_TOKEN || '';
  api = axios.create({
    baseURL: baseUrl,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/fhir+json' },
  });
  console.error(`Connected to Cerner FHIR: ${baseUrl}`);
}

async function fhirGet(resource: string, params?: Record<string, any>) {
  if (!api) throw new Error('Not connected');
  const r = await api.get(`/${resource}`, { params });
  if (r.data.resourceType === 'Bundle')
    return { total: r.data.total, entries: r.data.entry?.map((e: any) => e.resource) || [] };
  return r.data;
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case 'search_patients':
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(await fhirGet('Patient', args as any), null, 2),
            },
          ],
        };
      case 'get_patient':
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(await fhirGet(`Patient/${(args as any).id}`), null, 2),
            },
          ],
        };
      case 'get_encounters':
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                await fhirGet('Encounter', { patient: (args as any).patientId }),
                null,
                2
              ),
            },
          ],
        };
      case 'get_conditions':
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                await fhirGet('Condition', { patient: (args as any).patientId }),
                null,
                2
              ),
            },
          ],
        };
      case 'get_medications':
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                await fhirGet('MedicationRequest', { patient: (args as any).patientId }),
                null,
                2
              ),
            },
          ],
        };
      case 'get_observations':
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                await fhirGet('Observation', {
                  patient: (args as any).patientId,
                  category: (args as any).category,
                }),
                null,
                2
              ),
            },
          ],
        };
      case 'get_allergies':
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                await fhirGet('AllergyIntolerance', { patient: (args as any).patientId }),
                null,
                2
              ),
            },
          ],
        };
      case 'fhir_search':
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                await fhirGet((args as any).resourceType, (args as any).params),
                null,
                2
              ),
            },
          ],
        };
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Cerner Error: ${error.response?.data?.issue?.[0]?.diagnostics || error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Cerner MCP Server running on stdio');
}

main();
