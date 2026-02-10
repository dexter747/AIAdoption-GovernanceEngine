import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.OPERA_API_URL || '';
const CLIENT_ID = process.env.OPERA_CLIENT_ID || '';
const CLIENT_SECRET = process.env.OPERA_CLIENT_SECRET || '';
const PROPERTY_ID = process.env.OPERA_PROPERTY_ID || '';

let api: AxiosInstance | null = null;
let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getOAuthToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const tokenUrl = `${API_URL}/oauth/v1/tokens`;
  const response = await axios.post(
    tokenUrl,
    new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
    }
  );

  accessToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
  return accessToken!;
}

async function initConnection(): Promise<void> {
  if (api) return;
  const token = await getOAuthToken();
  api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-hotelId': PROPERTY_ID,
    },
  });

  api.interceptors.request.use(async (config) => {
    const freshToken = await getOAuthToken();
    config.headers['Authorization'] = `Bearer ${freshToken}`;
    return config;
  });
}

const tools: Tool[] = [
  {
    name: 'search_reservations',
    description: 'Search reservations in Oracle OPERA',
    inputSchema: {
      type: 'object',
      properties: {
        guestName: { type: 'string', description: 'Guest last name' },
        arrivalDate: { type: 'string', description: 'Arrival date (YYYY-MM-DD)' },
        departureDate: { type: 'string', description: 'Departure date (YYYY-MM-DD)' },
        confirmationNumber: { type: 'string', description: 'Confirmation number' },
        status: { type: 'string', description: 'Reservation status (e.g. RESERVED, CHECKED_IN, CHECKED_OUT)' },
        limit: { type: 'number', description: 'Max results to return' },
      },
    },
  },
  {
    name: 'get_reservation',
    description: 'Retrieve a specific reservation by ID from Oracle OPERA',
    inputSchema: {
      type: 'object',
      properties: {
        reservationId: { type: 'string', description: 'Reservation identifier' },
      },
      required: ['reservationId'],
    },
  },
  {
    name: 'get_guests',
    description: 'Search guest profiles in Oracle OPERA',
    inputSchema: {
      type: 'object',
      properties: {
        lastName: { type: 'string', description: 'Guest last name' },
        firstName: { type: 'string', description: 'Guest first name' },
        email: { type: 'string', description: 'Guest email address' },
        membershipNumber: { type: 'string', description: 'Loyalty membership number' },
        limit: { type: 'number', description: 'Max results to return' },
      },
    },
  },
  {
    name: 'get_guest',
    description: 'Retrieve a specific guest profile by ID from Oracle OPERA',
    inputSchema: {
      type: 'object',
      properties: {
        guestId: { type: 'string', description: 'Guest profile identifier' },
      },
      required: ['guestId'],
    },
  },
  {
    name: 'get_rooms',
    description: 'Retrieve rooms and their status from Oracle OPERA',
    inputSchema: {
      type: 'object',
      properties: {
        roomType: { type: 'string', description: 'Room type code filter' },
        floor: { type: 'string', description: 'Floor number filter' },
        status: { type: 'string', description: 'Room status (e.g. CLEAN, DIRTY, INSPECTED, OCCUPIED, VACANT)' },
      },
    },
  },
  {
    name: 'get_availability',
    description: 'Check room availability in Oracle OPERA',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        endDate: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        roomType: { type: 'string', description: 'Room type code filter' },
        adults: { type: 'number', description: 'Number of adults' },
        children: { type: 'number', description: 'Number of children' },
      },
      required: ['startDate', 'endDate'],
    },
  },
  {
    name: 'api_call',
    description: 'Make a raw API call to Oracle OPERA',
    inputSchema: {
      type: 'object',
      properties: {
        method: { type: 'string', description: 'HTTP method', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
        path: { type: 'string', description: 'API path' },
        body: { type: 'object', description: 'Request body' },
        params: { type: 'object', description: 'Query parameters' },
      },
      required: ['method', 'path'],
    },
  },
];

const server = new Server(
  { name: 'oracle-opera-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  await initConnection();
  if (!api) {
    return { content: [{ type: 'text', text: 'Oracle OPERA API connection not initialized. Check environment variables.' }], isError: true };
  }

  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_reservations': {
        const params: Record<string, string | number> = {};
        if (args?.guestName) params.guestName = args.guestName as string;
        if (args?.arrivalDate) params.arrivalDate = args.arrivalDate as string;
        if (args?.departureDate) params.departureDate = args.departureDate as string;
        if (args?.confirmationNumber) params.confirmationNumber = args.confirmationNumber as string;
        if (args?.status) params.reservationStatus = args.status as string;
        if (args?.limit) params.limit = args.limit as number;
        const response = await api.get('/rsv/v1/hotels/' + PROPERTY_ID + '/reservations', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_reservation': {
        const reservationId = args?.reservationId as string;
        const response = await api.get(`/rsv/v1/hotels/${PROPERTY_ID}/reservations/${reservationId}`);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_guests': {
        const params: Record<string, string | number> = {};
        if (args?.lastName) params.lastName = args.lastName as string;
        if (args?.firstName) params.firstName = args.firstName as string;
        if (args?.email) params.email = args.email as string;
        if (args?.membershipNumber) params.membershipNumber = args.membershipNumber as string;
        if (args?.limit) params.limit = args.limit as number;
        const response = await api.get('/crm/v1/guests', { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_guest': {
        const guestId = args?.guestId as string;
        const response = await api.get(`/crm/v1/guests/${guestId}`);
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_rooms': {
        const params: Record<string, string> = {};
        if (args?.roomType) params.roomType = args.roomType as string;
        if (args?.floor) params.floor = args.floor as string;
        if (args?.status) params.housekeepingStatus = args.status as string;
        const response = await api.get(`/fof/v1/hotels/${PROPERTY_ID}/rooms`, { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_availability': {
        const params: Record<string, string | number> = {};
        params.startDate = args?.startDate as string;
        params.endDate = args?.endDate as string;
        if (args?.roomType) params.roomType = args.roomType as string;
        if (args?.adults) params.adults = args.adults as number;
        if (args?.children) params.children = args.children as number;
        const response = await api.get(`/par/v1/hotels/${PROPERTY_ID}/availability`, { params });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'api_call': {
        const method = (args?.method as string).toLowerCase();
        const path = args?.path as string;
        const response = await api.request({
          method,
          url: path,
          data: args?.body,
          params: args?.params,
        });
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (error: any) {
    const message = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    return { content: [{ type: 'text', text: `Oracle OPERA API error: ${message}` }], isError: true };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Oracle OPERA MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
