import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance | null = null;

async function initConnection(): Promise<void> {
  const baseURL = process.env.BANNER_API_URL;
  const apiKey = process.env.BANNER_API_KEY;
  const username = process.env.BANNER_USERNAME;
  const password = process.env.BANNER_PASSWORD;

  if (!baseURL) {
    throw new Error('BANNER_API_URL environment variable is required');
  }

  if (!apiKey && (!username || !password)) {
    throw new Error(
      'Either BANNER_API_KEY or BANNER_USERNAME and BANNER_PASSWORD environment variables are required'
    );
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  api = axios.create({
    baseURL: `${baseURL}/api`,
    headers,
    ...(username && password && !apiKey ? { auth: { username, password } } : {}),
  });
}

const TOOLS: Tool[] = [
  {
    name: 'search_students',
    description: 'Search for students in Ellucian Banner via Ethos Integration',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Search by student name' },
        email: { type: 'string', description: 'Search by email address' },
        major: { type: 'string', description: 'Filter by major/program' },
        status: { type: 'string', description: 'Enrollment status (active, graduated, withdrawn)' },
        level: {
          type: 'string',
          description: 'Academic level (undergraduate, graduate, doctoral)',
        },
        limit: { type: 'number', description: 'Maximum results to return' },
        offset: { type: 'number', description: 'Offset for pagination' },
      },
    },
  },
  {
    name: 'get_student',
    description: 'Retrieve detailed student record by ID from Ellucian Banner',
    inputSchema: {
      type: 'object',
      properties: {
        student_id: { type: 'string', description: 'Student ID (Banner ID)' },
        include: {
          type: 'string',
          description: 'Additional data to include (addresses, phones, emails, academic-standings)',
        },
      },
      required: ['student_id'],
    },
  },
  {
    name: 'get_courses',
    description: 'Retrieve course catalog information from Banner',
    inputSchema: {
      type: 'object',
      properties: {
        course_id: { type: 'string', description: 'Specific course ID' },
        subject: { type: 'string', description: 'Subject code (e.g., CS, MATH)' },
        number: { type: 'string', description: 'Course number' },
        title: { type: 'string', description: 'Search by course title' },
        level: { type: 'string', description: 'Course level (100, 200, 300, 400, 500, 600)' },
      },
    },
  },
  {
    name: 'get_sections',
    description: 'Retrieve course section details including schedule and enrollment',
    inputSchema: {
      type: 'object',
      properties: {
        section_id: { type: 'string', description: 'Specific section ID (CRN)' },
        course_id: { type: 'string', description: 'Filter by course' },
        term: { type: 'string', description: 'Academic term (e.g., 202610)' },
        instructor: { type: 'string', description: 'Filter by instructor name' },
        status: { type: 'string', description: 'Section status (open, closed, waitlisted)' },
      },
    },
  },
  {
    name: 'get_grades',
    description: 'Retrieve grade records for students',
    inputSchema: {
      type: 'object',
      properties: {
        student_id: { type: 'string', description: 'Student ID' },
        term: { type: 'string', description: 'Academic term' },
        course_id: { type: 'string', description: 'Specific course' },
        section_id: { type: 'string', description: 'Specific section (CRN)' },
      },
      required: ['student_id'],
    },
  },
  {
    name: 'get_financial_aid',
    description: 'Retrieve financial aid information for students',
    inputSchema: {
      type: 'object',
      properties: {
        student_id: { type: 'string', description: 'Student ID' },
        aid_year: { type: 'string', description: 'Aid year (e.g., 2026)' },
        type: { type: 'string', description: 'Aid type (grant, loan, scholarship, work-study)' },
        status: { type: 'string', description: 'Aid status (offered, accepted, disbursed)' },
      },
      required: ['student_id'],
    },
  },
  {
    name: 'get_faculty',
    description: 'Retrieve faculty/instructor information from Banner',
    inputSchema: {
      type: 'object',
      properties: {
        faculty_id: { type: 'string', description: 'Faculty ID' },
        name: { type: 'string', description: 'Search by faculty name' },
        department: { type: 'string', description: 'Filter by department' },
        term: { type: 'string', description: 'Academic term for assignments' },
      },
    },
  },
  {
    name: 'api_call',
    description: 'Make a custom API call to Ellucian Banner via Ethos Integration',
    inputSchema: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          description: 'HTTP method (GET, POST, PUT, DELETE)',
          enum: ['GET', 'POST', 'PUT', 'DELETE'],
        },
        endpoint: { type: 'string', description: 'API endpoint path (appended to base /api)' },
        params: { type: 'object', description: 'Query parameters' },
        body: { type: 'object', description: 'Request body for POST/PUT' },
      },
      required: ['method', 'endpoint'],
    },
  },
];

const server = new Server(
  { name: 'ellucian-banner', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  if (!api) {
    await initConnection();
  }

  try {
    let response;

    switch (name) {
      case 'search_students': {
        const params: Record<string, string | number> = {};
        if (args?.name) params.name = args.name as string;
        if (args?.email) params.email = args.email as string;
        if (args?.major) params.major = args.major as string;
        if (args?.status) params.status = args.status as string;
        if (args?.level) params.level = args.level as string;
        if (args?.limit) params.limit = args.limit as number;
        if (args?.offset) params.offset = args.offset as number;
        response = await api!.get('/persons', { params });
        break;
      }

      case 'get_student': {
        const studentId = args?.student_id as string;
        const params: Record<string, string> = {};
        if (args?.include) params.include = args.include as string;
        response = await api!.get(`/persons/${studentId}`, { params });
        break;
      }

      case 'get_courses': {
        const endpoint = args?.course_id ? `/courses/${args.course_id}` : '/courses';
        const params: Record<string, string> = {};
        if (args?.subject) params.subject = args.subject as string;
        if (args?.number) params.number = args.number as string;
        if (args?.title) params.title = args.title as string;
        if (args?.level) params.level = args.level as string;
        response = await api!.get(endpoint, { params });
        break;
      }

      case 'get_sections': {
        const endpoint = args?.section_id ? `/sections/${args.section_id}` : '/sections';
        const params: Record<string, string> = {};
        if (args?.course_id) params.course_id = args.course_id as string;
        if (args?.term) params.term = args.term as string;
        if (args?.instructor) params.instructor = args.instructor as string;
        if (args?.status) params.status = args.status as string;
        response = await api!.get(endpoint, { params });
        break;
      }

      case 'get_grades': {
        const studentId = args?.student_id as string;
        const params: Record<string, string> = {};
        if (args?.term) params.term = args.term as string;
        if (args?.course_id) params.course_id = args.course_id as string;
        if (args?.section_id) params.section_id = args.section_id as string;
        response = await api!.get(`/students/${studentId}/grades`, { params });
        break;
      }

      case 'get_financial_aid': {
        const studentId = args?.student_id as string;
        const params: Record<string, string> = {};
        if (args?.aid_year) params.aid_year = args.aid_year as string;
        if (args?.type) params.type = args.type as string;
        if (args?.status) params.status = args.status as string;
        response = await api!.get(`/students/${studentId}/financial-aid`, { params });
        break;
      }

      case 'get_faculty': {
        const endpoint = args?.faculty_id ? `/faculty/${args.faculty_id}` : '/faculty';
        const params: Record<string, string> = {};
        if (args?.name) params.name = args.name as string;
        if (args?.department) params.department = args.department as string;
        if (args?.term) params.term = args.term as string;
        response = await api!.get(endpoint, { params });
        break;
      }

      case 'api_call': {
        const method = ((args?.method as string) || 'GET').toLowerCase();
        const endpoint = args?.endpoint as string;
        response = await api!.request({
          method,
          url: endpoint,
          params: args?.params as Record<string, unknown>,
          data: args?.body,
        });
        break;
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
    };
  } catch (error: unknown) {
    const err = error as Error & { response?: { status: number; data: unknown } };
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${err.message}${err.response ? `\nStatus: ${err.response.status}\nData: ${JSON.stringify(err.response.data)}` : ''}`,
        },
      ],
      isError: true,
    };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Ellucian Banner MCP server running on stdio');
}

main().catch(console.error);
