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
let unityToken: string = '';

const TOOLS: Tool[] = [
  {
    name: 'search_patients',
    description: 'Search patients',
    inputSchema: {
      type: 'object',
      properties: { searchTerm: { type: 'string' }, appName: { type: 'string' } },
      required: ['searchTerm'],
    },
  },
  {
    name: 'get_patient',
    description: 'Get patient details',
    inputSchema: {
      type: 'object',
      properties: { patientId: { type: 'string' } },
      required: ['patientId'],
    },
  },
  {
    name: 'get_clinical_summary',
    description: 'Get clinical summary',
    inputSchema: {
      type: 'object',
      properties: { patientId: { type: 'string' } },
      required: ['patientId'],
    },
  },
  {
    name: 'get_medications',
    description: 'Get patient medications',
    inputSchema: {
      type: 'object',
      properties: { patientId: { type: 'string' } },
      required: ['patientId'],
    },
  },
  {
    name: 'get_allergies',
    description: 'Get patient allergies',
    inputSchema: {
      type: 'object',
      properties: { patientId: { type: 'string' } },
      required: ['patientId'],
    },
  },
  {
    name: 'get_problems',
    description: 'Get patient problem list',
    inputSchema: {
      type: 'object',
      properties: { patientId: { type: 'string' } },
      required: ['patientId'],
    },
  },
  {
    name: 'get_vitals',
    description: 'Get patient vitals',
    inputSchema: {
      type: 'object',
      properties: { patientId: { type: 'string' } },
      required: ['patientId'],
    },
  },
  {
    name: 'unity_call',
    description: 'Make a generic Unity API call',
    inputSchema: {
      type: 'object',
      properties: { action: { type: 'string' }, data: { type: 'object' } },
      required: ['action'],
    },
  },
];

const server = new Server(
  { name: 'allscripts-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

async function initConnection() {
  const baseUrl = process.env.ALLSCRIPTS_URL;
  const appName = process.env.ALLSCRIPTS_APP_NAME || '';
  const appUsername = process.env.ALLSCRIPTS_APP_USERNAME || '';
  const appPassword = process.env.ALLSCRIPTS_APP_PASSWORD || '';

  const tokenResp = await axios.post(`${baseUrl}/Unity/UnityService.svc/json/GetToken`, {
    Username: appUsername,
    Password: appPassword,
  });
  unityToken = tokenResp.data;

  api = axios.create({
    baseURL: `${baseUrl}/Unity/UnityService.svc/json`,
    headers: { 'Content-Type': 'application/json' },
  });
  console.error(`Connected to Allscripts: ${baseUrl}`);
}

async function unityCall(action: string, patientId?: string, data?: any) {
  if (!api) throw new Error('Not connected');
  const body = {
    Action: action,
    Appname: process.env.ALLSCRIPTS_APP_NAME || '',
    Token: unityToken,
    PatientID: patientId || '',
    Parameter1: data?.param1 || '',
    Parameter2: data?.param2 || '',
    Parameter3: data?.param3 || '',
    Parameter4: data?.param4 || '',
    Parameter5: data?.param5 || '',
    Parameter6: data?.param6 || '',
    Data: data?.xmlData || '',
  };
  const r = await api.post('/MagicJson', body);
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
              text: JSON.stringify(
                await unityCall('SearchPatients', undefined, { param1: (args as any).searchTerm }),
                null,
                2
              ),
            },
          ],
        };
      case 'get_patient':
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(await unityCall('GetPatient', (args as any).patientId), null, 2),
            },
          ],
        };
      case 'get_clinical_summary':
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                await unityCall('GetClinicalSummary', (args as any).patientId),
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
                await unityCall('GetMedications', (args as any).patientId),
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
                await unityCall('GetAllergies', (args as any).patientId),
                null,
                2
              ),
            },
          ],
        };
      case 'get_problems':
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                await unityCall('GetProblems', (args as any).patientId),
                null,
                2
              ),
            },
          ],
        };
      case 'get_vitals':
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(await unityCall('GetVitals', (args as any).patientId), null, 2),
            },
          ],
        };
      case 'unity_call':
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                await unityCall(
                  (args as any).action,
                  (args as any).data?.patientId,
                  (args as any).data
                ),
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
      content: [{ type: 'text' as const, text: `Allscripts Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  await initConnection();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Allscripts MCP Server running on stdio');
}

main();
