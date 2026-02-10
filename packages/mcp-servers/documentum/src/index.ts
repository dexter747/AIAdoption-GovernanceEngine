import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;

function initConnection(): void {
  const baseURL = process.env.DOCUMENTUM_URL;
  const username = process.env.DOCUMENTUM_USERNAME;
  const password = process.env.DOCUMENTUM_PASSWORD;
  const repository = process.env.DOCUMENTUM_REPOSITORY;

  if (!baseURL || !username || !password || !repository) {
    throw new Error('DOCUMENTUM_URL, DOCUMENTUM_USERNAME, DOCUMENTUM_PASSWORD, and DOCUMENTUM_REPOSITORY environment variables are required');
  }

  const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

  api = axios.create({
    baseURL: `${baseURL}/dctm-rest/repositories/${repository}`,
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
    },
  });
}

const tools: Tool[] = [
  {
    name: 'search_documents',
    description: 'Search documents using DQL (Documentum Query Language)',
    inputSchema: {
      type: 'object',
      properties: {
        dql: { type: 'string', description: 'DQL query string (e.g. "SELECT * FROM dm_document WHERE object_name LIKE \'%report%\'")' },
        maxResults: { type: 'number', description: 'Maximum number of results to return' },
      },
      required: ['dql'],
    },
  },
  {
    name: 'get_document',
    description: 'Get metadata for a specific document by object ID',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: { type: 'string', description: 'The Documentum object ID' },
      },
      required: ['objectId'],
    },
  },
  {
    name: 'get_document_content',
    description: 'Get the content/download URL for a document',
    inputSchema: {
      type: 'object',
      properties: {
        objectId: { type: 'string', description: 'The Documentum object ID' },
      },
      required: ['objectId'],
    },
  },
  {
    name: 'create_document',
    description: 'Create a new document in Documentum',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Document name' },
        type: { type: 'string', description: 'Document type (default: dm_document)' },
        folderId: { type: 'string', description: 'Parent folder object ID' },
        properties: { type: 'object', description: 'Additional document properties' },
      },
      required: ['name', 'folderId'],
    },
  },
  {
    name: 'list_repositories',
    description: 'List available Documentum repositories',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_cabinets',
    description: 'List cabinets (top-level folders) in the repository',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum number of cabinets to return' },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to Documentum REST API',
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string', description: 'HTTP method (GET, POST, PUT, DELETE)', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
        path: { type: 'string', description: 'API path (relative to repository base)' },
        body: { type: 'object', description: 'Request body for POST/PUT' },
      },
      required: ['method', 'path'],
    },
  },
];

const server = new Server(
  { name: 'documentum-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!api) initConnection();

  const { name, arguments: args } = request.params;

  try {
    let r;

    switch (name) {
      case 'search_documents':
        r = await api!.get('/dql', {
          params: {
            dql: args!.dql,
            'items-per-page': args?.maxResults || 50,
          },
        });
        break;
      case 'get_document':
        r = await api!.get(`/objects/${args!.objectId}`);
        break;
      case 'get_document_content':
        r = await api!.get(`/objects/${args!.objectId}/content-media`);
        break;
      case 'create_document':
        r = await api!.post(`/folders/${args!.folderId}/documents`, {
          name: 'document',
          type: args?.type || 'dm_document',
          properties: {
            object_name: args!.name,
            ...((args?.properties as Record<string, unknown>) || {}),
          },
        });
        break;
      case 'list_repositories': {
        const baseURL = process.env.DOCUMENTUM_URL;
        r = await axios.get(`${baseURL}/dctm-rest/repositories`, {
          headers: api!.defaults.headers as Record<string, string>,
        });
        break;
      }
      case 'list_cabinets':
        r = await api!.get('/cabinets', {
          params: { 'items-per-page': args?.limit || 50 },
        });
        break;
      case 'api_call':
        r = await api!.request({ method: args!.method as string, url: args!.path as string, data: args?.body });
        break;
      default:
        return { content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }], isError: true };
    }

    return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Documentum MCP server running on stdio');
}

main().catch(console.error);
