import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;

function initConnection(): void {
  const baseURL = process.env.FILENET_URL;
  const username = process.env.FILENET_USERNAME;
  const password = process.env.FILENET_PASSWORD;
  const objectStore = process.env.FILENET_OBJECT_STORE;

  if (!baseURL || !username || !password || !objectStore) {
    throw new Error('FILENET_URL, FILENET_USERNAME, FILENET_PASSWORD, and FILENET_OBJECT_STORE environment variables are required');
  }

  const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

  api = axios.create({
    baseURL,
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
    },
  });
}

const tools: Tool[] = [
  {
    name: 'search_documents',
    description: 'Search documents in FileNet using SQL-like query syntax',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'SQL-like search query (e.g. "SELECT * FROM Document WHERE DocumentTitle LIKE \'%report%\'")' },
        maxResults: { type: 'number', description: 'Maximum number of results to return' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_document',
    description: 'Get metadata for a specific document by ID',
    inputSchema: {
      type: 'object',
      properties: {
        documentId: { type: 'string', description: 'The FileNet document ID (GUID)' },
      },
      required: ['documentId'],
    },
  },
  {
    name: 'get_document_content',
    description: 'Get content elements/download info for a document',
    inputSchema: {
      type: 'object',
      properties: {
        documentId: { type: 'string', description: 'The FileNet document ID (GUID)' },
      },
      required: ['documentId'],
    },
  },
  {
    name: 'create_document',
    description: 'Create a new document in FileNet',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Document title' },
        documentClass: { type: 'string', description: 'Document class (default: Document)' },
        folderId: { type: 'string', description: 'Parent folder ID to file the document into' },
        properties: { type: 'object', description: 'Additional document properties' },
      },
      required: ['title'],
    },
  },
  {
    name: 'list_object_stores',
    description: 'List available FileNet object stores',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_folder',
    description: 'Get folder details and contents',
    inputSchema: {
      type: 'object',
      properties: {
        folderId: { type: 'string', description: 'The folder ID (GUID)' },
        folderPath: { type: 'string', description: 'The folder path (alternative to folderId)' },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to IBM FileNet P8',
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string', description: 'HTTP method (GET, POST, PUT, DELETE)', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
        path: { type: 'string', description: 'API path' },
        body: { type: 'object', description: 'Request body for POST/PUT' },
      },
      required: ['method', 'path'],
    },
  },
];

const server = new Server(
  { name: 'ibm-filenet-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!api) initConnection();

  const { name, arguments: args } = request.params;
  const objectStore = process.env.FILENET_OBJECT_STORE;

  try {
    let r;

    switch (name) {
      case 'search_documents':
        r = await api!.post(`/os/${objectStore}/search`, {
          query: args!.query,
          maxElements: args?.maxResults || 50,
        });
        break;
      case 'get_document':
        r = await api!.get(`/os/${objectStore}/documents/${args!.documentId}`);
        break;
      case 'get_document_content':
        r = await api!.get(`/os/${objectStore}/documents/${args!.documentId}/content`);
        break;
      case 'create_document':
        r = await api!.post(`/os/${objectStore}/documents`, {
          classId: args?.documentClass || 'Document',
          properties: {
            DocumentTitle: args!.title,
            ...((args?.properties as Record<string, unknown>) || {}),
          },
          ...(args?.folderId ? { folderId: args.folderId } : {}),
        });
        break;
      case 'list_object_stores':
        r = await api!.get('/os');
        break;
      case 'get_folder':
        if (args?.folderId) {
          r = await api!.get(`/os/${objectStore}/folders/${args.folderId}`);
        } else if (args?.folderPath) {
          r = await api!.get(`/os/${objectStore}/folders`, { params: { path: args.folderPath } });
        } else {
          return { content: [{ type: 'text' as const, text: 'Error: Either folderId or folderPath is required' }], isError: true };
        }
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
  console.error('IBM FileNet P8 MCP server running on stdio');
}

main().catch(console.error);
