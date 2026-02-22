import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;
let siteId: string = '';

async function initConnection(): Promise<void> {
  const tenantId = process.env.SHAREPOINT_TENANT_ID;
  const clientId = process.env.SHAREPOINT_CLIENT_ID;
  const clientSecret = process.env.SHAREPOINT_CLIENT_SECRET;
  const siteUrl = process.env.SHAREPOINT_SITE_URL;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      'SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, and SHAREPOINT_CLIENT_SECRET environment variables are required'
    );
  }

  // OAuth 2.0 client_credentials flow
  const tokenResponse = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const accessToken = tokenResponse.data.access_token;

  api = axios.create({
    baseURL: 'https://graph.microsoft.com/v1.0',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  // Resolve site ID from site URL if provided
  if (siteUrl) {
    try {
      const url = new URL(siteUrl);
      const siteResponse = await api.get(`/sites/${url.hostname}:${url.pathname}`);
      siteId = siteResponse.data.id;
    } catch {
      console.error('Warning: Could not resolve site ID from SHAREPOINT_SITE_URL');
    }
  }
}

const tools: Tool[] = [
  {
    name: 'list_sites',
    description: 'List SharePoint sites accessible to the application',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search query to filter sites' },
      },
    },
  },
  {
    name: 'get_site',
    description: 'Get details of a specific SharePoint site',
    inputSchema: {
      type: 'object',
      properties: {
        siteId: { type: 'string', description: 'The site ID' },
      },
      required: ['siteId'],
    },
  },
  {
    name: 'list_documents',
    description: 'List items in a SharePoint document library',
    inputSchema: {
      type: 'object',
      properties: {
        siteId: { type: 'string', description: 'The site ID (uses default if not provided)' },
        driveId: { type: 'string', description: 'The drive/library ID' },
        folderId: {
          type: 'string',
          description: 'Folder ID to list items from (root if not provided)',
        },
      },
    },
  },
  {
    name: 'get_document',
    description: 'Get metadata and download URL for a document',
    inputSchema: {
      type: 'object',
      properties: {
        siteId: { type: 'string', description: 'The site ID (uses default if not provided)' },
        driveId: { type: 'string', description: 'The drive/library ID' },
        itemId: { type: 'string', description: 'The document/item ID' },
      },
      required: ['itemId'],
    },
  },
  {
    name: 'search_content',
    description: 'Search across SharePoint for documents and content',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query string' },
        entityTypes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Entity types to search (driveItem, listItem, site, etc.)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'upload_document',
    description: 'Upload a document to a SharePoint document library',
    inputSchema: {
      type: 'object',
      properties: {
        siteId: { type: 'string', description: 'The site ID (uses default if not provided)' },
        driveId: { type: 'string', description: 'The drive/library ID' },
        fileName: { type: 'string', description: 'Name for the uploaded file' },
        content: { type: 'string', description: 'Base64-encoded file content' },
        folderPath: { type: 'string', description: 'Folder path within the drive' },
      },
      required: ['fileName', 'content'],
    },
  },
  {
    name: 'list_lists',
    description: 'List SharePoint lists in a site',
    inputSchema: {
      type: 'object',
      properties: {
        siteId: { type: 'string', description: 'The site ID (uses default if not provided)' },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to Microsoft Graph API for SharePoint',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'HTTP method (GET, POST, PUT, DELETE)',
          enum: ['GET', 'POST', 'PUT', 'DELETE'],
        },
        path: {
          type: 'string',
          description: 'API path (relative to https://graph.microsoft.com/v1.0)',
        },
        body: { type: 'object', description: 'Request body for POST/PUT' },
      },
      required: ['method', 'path'],
    },
  },
];

const server = new Server(
  { name: 'sharepoint-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async request => {
  if (!api) await initConnection();

  const { name, arguments: args } = request.params;
  const resolvedSiteId = (args?.siteId as string) || siteId;

  try {
    let r;

    switch (name) {
      case 'list_sites':
        r = args?.search
          ? await api!.get(`/sites?search=${encodeURIComponent(args.search as string)}`)
          : await api!.get('/sites?search=*');
        break;
      case 'get_site':
        r = await api!.get(`/sites/${args!.siteId}`);
        break;
      case 'list_documents': {
        const driveBase = args?.driveId
          ? `/sites/${resolvedSiteId}/drives/${args.driveId}`
          : `/sites/${resolvedSiteId}/drive`;
        const folderPart = args?.folderId ? `/items/${args.folderId}/children` : '/root/children';
        r = await api!.get(`${driveBase}${folderPart}`);
        break;
      }
      case 'get_document': {
        const dBase = args?.driveId
          ? `/sites/${resolvedSiteId}/drives/${args.driveId}`
          : `/sites/${resolvedSiteId}/drive`;
        r = await api!.get(`${dBase}/items/${args!.itemId}`);
        break;
      }
      case 'search_content':
        r = await api!.post('/search/query', {
          requests: [
            {
              entityTypes: args?.entityTypes || ['driveItem', 'listItem'],
              query: { queryString: args!.query },
            },
          ],
        });
        break;
      case 'upload_document': {
        const uBase = args?.driveId
          ? `/sites/${resolvedSiteId}/drives/${args.driveId}`
          : `/sites/${resolvedSiteId}/drive`;
        const uploadPath = args?.folderPath
          ? `/root:/${args.folderPath}/${args!.fileName}:/content`
          : `/root:/${args!.fileName}:/content`;
        const content = Buffer.from(args!.content as string, 'base64');
        r = await api!.put(`${uBase}${uploadPath}`, content, {
          headers: { 'Content-Type': 'application/octet-stream' },
        });
        break;
      }
      case 'list_lists':
        r = await api!.get(`/sites/${resolvedSiteId}/lists`);
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
  console.error('SharePoint MCP server running on stdio');
}

main().catch(console.error);
