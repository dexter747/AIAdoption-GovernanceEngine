import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;

function initConnection(): void {
  const accessToken = process.env.BOX_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('BOX_ACCESS_TOKEN environment variable is required');
  }

  api = axios.create({
    baseURL: 'https://api.box.com/2.0',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
}

const tools: Tool[] = [
  {
    name: 'search_files',
    description: 'Search for files and folders in Box',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query string' },
        type: {
          type: 'string',
          description: 'Type filter (file or folder)',
          enum: ['file', 'folder'],
        },
        fileExtensions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by file extensions',
        },
        ancestorFolderIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Limit search to specific folder IDs',
        },
        limit: { type: 'number', description: 'Maximum number of results' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_file',
    description: 'Get metadata for a specific file in Box',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'The Box file ID' },
        fields: { type: 'string', description: 'Comma-separated list of fields to include' },
      },
      required: ['fileId'],
    },
  },
  {
    name: 'get_folder',
    description: 'Get metadata for a specific folder in Box',
    inputSchema: {
      type: 'object',
      properties: {
        folderId: { type: 'string', description: 'The Box folder ID (use "0" for root)' },
        fields: { type: 'string', description: 'Comma-separated list of fields to include' },
      },
      required: ['folderId'],
    },
  },
  {
    name: 'list_folder_items',
    description: 'List items in a Box folder',
    inputSchema: {
      type: 'object',
      properties: {
        folderId: { type: 'string', description: 'The Box folder ID (use "0" for root)' },
        limit: { type: 'number', description: 'Maximum number of items to return' },
        offset: { type: 'number', description: 'Offset for pagination' },
        fields: { type: 'string', description: 'Comma-separated list of fields to include' },
      },
      required: ['folderId'],
    },
  },
  {
    name: 'upload_file',
    description: 'Upload a file to Box',
    inputSchema: {
      type: 'object',
      properties: {
        folderId: { type: 'string', description: 'Parent folder ID to upload into' },
        fileName: { type: 'string', description: 'Name for the uploaded file' },
        content: { type: 'string', description: 'Base64-encoded file content' },
      },
      required: ['folderId', 'fileName', 'content'],
    },
  },
  {
    name: 'get_file_metadata',
    description: 'Get metadata instances for a file in Box',
    inputSchema: {
      type: 'object',
      properties: {
        fileId: { type: 'string', description: 'The Box file ID' },
        scope: { type: 'string', description: 'Metadata scope (global or enterprise)' },
        templateKey: { type: 'string', description: 'Metadata template key' },
      },
      required: ['fileId'],
    },
  },
  {
    name: 'create_folder',
    description: 'Create a new folder in Box',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Folder name' },
        parentId: { type: 'string', description: 'Parent folder ID (use "0" for root)' },
      },
      required: ['name', 'parentId'],
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to Box Content API',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'HTTP method (GET, POST, PUT, DELETE)',
          enum: ['GET', 'POST', 'PUT', 'DELETE'],
        },
        path: { type: 'string', description: 'API path (relative to https://api.box.com/2.0)' },
        body: { type: 'object', description: 'Request body for POST/PUT' },
      },
      required: ['method', 'path'],
    },
  },
];

const server = new Server(
  { name: 'box-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async request => {
  if (!api) initConnection();

  const { name, arguments: args } = request.params;

  try {
    let r;

    switch (name) {
      case 'search_files':
        r = await api!.get('/search', {
          params: {
            query: args!.query,
            type: args?.type,
            file_extensions: args?.fileExtensions
              ? (args.fileExtensions as string[]).join(',')
              : undefined,
            ancestor_folder_ids: args?.ancestorFolderIds
              ? (args.ancestorFolderIds as string[]).join(',')
              : undefined,
            limit: args?.limit || 30,
          },
        });
        break;
      case 'get_file':
        r = await api!.get(`/files/${args!.fileId}`, {
          params: { fields: args?.fields },
        });
        break;
      case 'get_folder':
        r = await api!.get(`/folders/${args!.folderId}`, {
          params: { fields: args?.fields },
        });
        break;
      case 'list_folder_items':
        r = await api!.get(`/folders/${args!.folderId}/items`, {
          params: {
            limit: args?.limit || 100,
            offset: args?.offset || 0,
            fields: args?.fields,
          },
        });
        break;
      case 'upload_file': {
        const content = Buffer.from(args!.content as string, 'base64');
        const boundary = '---BoxUploadBoundary';
        const attributes = JSON.stringify({
          name: args!.fileName,
          parent: { id: args!.folderId },
        });
        const body = Buffer.concat([
          Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="attributes"\r\nContent-Type: application/json\r\n\r\n${attributes}\r\n`
          ),
          Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${args!.fileName}"\r\nContent-Type: application/octet-stream\r\n\r\n`
          ),
          content,
          Buffer.from(`\r\n--${boundary}--`),
        ]);
        r = await axios.post('https://upload.box.com/api/2.0/files/content', body, {
          headers: {
            Authorization: api!.defaults.headers['Authorization'] as string,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
          },
        });
        break;
      }
      case 'get_file_metadata':
        if (args?.scope && args?.templateKey) {
          r = await api!.get(`/files/${args!.fileId}/metadata/${args.scope}/${args.templateKey}`);
        } else {
          r = await api!.get(`/files/${args!.fileId}/metadata`);
        }
        break;
      case 'create_folder':
        r = await api!.post('/folders', {
          name: args!.name,
          parent: { id: args!.parentId },
        });
        break;
      case 'api_call':
        r = await api!.request({
          method: args!.method as string,
          url: args!.path as string,
          data: args?.body,
        });
        break;
      default:
        return {
          content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }

    return { content: [{ type: 'text' as const, text: JSON.stringify(r.data, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Box MCP server running on stdio');
}

main().catch(console.error);
