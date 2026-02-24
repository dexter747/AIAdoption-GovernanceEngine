#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'trello-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
);

const API_KEY = process.env.TRELLO_API_KEY;
const API_TOKEN = process.env.TRELLO_API_TOKEN;
const BASE_URL = 'https://api.trello.com/1';

function authParams(): string {
  return `key=${API_KEY}&token=${API_TOKEN}`;
}

async function makeRequest(endpoint: string, method: string = 'GET', body?: any) {
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${BASE_URL}/${endpoint}${separator}${authParams()}`;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Trello API Error: ${response.status} - ${error}`);
  }

  // Some endpoints return empty body on success (DELETE, PUT)
  const text = await response.text();
  return text ? JSON.parse(text) : { success: true };
}

// ── Helper functions ────────────────────────────────────────────────

async function listBoards() {
  try {
    const data = await makeRequest(
      'members/me/boards?fields=name,desc,url,closed,dateLastActivity,shortUrl'
    );
    const boards = data.map((b: any) => ({
      id: b.id,
      name: b.name,
      description: b.desc,
      url: b.shortUrl || b.url,
      closed: b.closed,
      lastActivity: b.dateLastActivity,
    }));
    return { content: [{ type: 'text' as const, text: JSON.stringify(boards, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function getBoard(boardId: string) {
  try {
    const data = await makeRequest(
      `boards/${boardId}?fields=name,desc,url,closed,dateLastActivity,memberships&lists=open&list_fields=name,pos,closed`
    );
    return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function listLists(boardId: string) {
  try {
    const data = await makeRequest(`boards/${boardId}/lists?fields=name,pos,closed`);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function listCards(listId: string) {
  try {
    const data = await makeRequest(
      `lists/${listId}/cards?fields=name,desc,due,dueComplete,labels,idMembers,pos,closed,shortUrl,dateLastActivity`
    );
    const cards = data.map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.desc,
      due: c.due,
      dueComplete: c.dueComplete,
      labels: c.labels?.map((l: any) => l.name || l.color) || [],
      url: c.shortUrl,
      closed: c.closed,
      lastActivity: c.dateLastActivity,
    }));
    return { content: [{ type: 'text' as const, text: JSON.stringify(cards, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function getCard(cardId: string) {
  try {
    const data = await makeRequest(
      `cards/${cardId}?fields=name,desc,due,dueComplete,labels,idMembers,pos,closed,shortUrl,dateLastActivity,idList,idBoard&attachments=true&checklists=all&members=true&actions=commentCard&actions_limit=10`
    );
    return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function createCard(
  idList: string,
  name: string,
  desc?: string,
  due?: string,
  labelIds?: string
) {
  try {
    let endpoint = `cards?idList=${idList}&name=${encodeURIComponent(name)}`;
    if (desc) endpoint += `&desc=${encodeURIComponent(desc)}`;
    if (due) endpoint += `&due=${encodeURIComponent(due)}`;
    if (labelIds) endpoint += `&idLabels=${encodeURIComponent(labelIds)}`;

    const data = await makeRequest(endpoint, 'POST');
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({ id: data.id, name: data.name, url: data.shortUrl }, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function updateCard(cardId: string, updates: Record<string, any>) {
  try {
    const params = Object.entries(updates)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    const data = await makeRequest(`cards/${cardId}?${params}`, 'PUT');
    return {
      content: [
        { type: 'text' as const, text: `Card ${cardId} updated successfully. Name: ${data.name}` },
      ],
    };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function moveCard(cardId: string, idList: string) {
  try {
    const data = await makeRequest(`cards/${cardId}?idList=${idList}`, 'PUT');
    return { content: [{ type: 'text' as const, text: `Card moved to list. Card: ${data.name}` }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function addComment(cardId: string, text: string) {
  try {
    await makeRequest(`cards/${cardId}/actions/comments?text=${encodeURIComponent(text)}`, 'POST');
    return { content: [{ type: 'text' as const, text: `Comment added to card ${cardId}` }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function searchTrello(query: string, boardId?: string) {
  try {
    let endpoint = `search?query=${encodeURIComponent(query)}&modelTypes=cards,boards&cards_limit=20&boards_limit=10`;
    if (boardId) endpoint += `&idBoards=${boardId}`;
    const data = await makeRequest(endpoint);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function getBoardCards(boardId: string) {
  try {
    const data = await makeRequest(
      `boards/${boardId}/cards?fields=name,desc,due,dueComplete,labels,idList,idMembers,closed,shortUrl,dateLastActivity`
    );
    return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function createList(boardId: string, name: string) {
  try {
    const data = await makeRequest(
      `boards/${boardId}/lists?name=${encodeURIComponent(name)}`,
      'POST'
    );
    return {
      content: [
        { type: 'text' as const, text: JSON.stringify({ id: data.id, name: data.name }, null, 2) },
      ],
    };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function getLabels(boardId: string) {
  try {
    const data = await makeRequest(`boards/${boardId}/labels`);
    return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function archiveCard(cardId: string) {
  try {
    await makeRequest(`cards/${cardId}?closed=true`, 'PUT');
    return { content: [{ type: 'text' as const, text: `Card ${cardId} archived` }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

async function deleteCard(cardId: string) {
  try {
    await makeRequest(`cards/${cardId}`, 'DELETE');
    return { content: [{ type: 'text' as const, text: `Card ${cardId} deleted` }] };
  } catch (error: any) {
    return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
  }
}

// ── Resources ────────────────────────────────────────────────────────

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'trello://boards',
      name: 'My Boards',
      description: 'All Trello boards accessible to this account',
      mimeType: 'application/json',
    },
    {
      uri: 'trello://me',
      name: 'My Profile',
      description: 'Current Trello user profile',
      mimeType: 'application/json',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async request => {
  const uri = request.params.uri;

  if (uri === 'trello://boards') {
    const data = await makeRequest(
      'members/me/boards?fields=name,desc,url,closed,dateLastActivity,shortUrl'
    );
    return {
      contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(data, null, 2) }],
    };
  } else if (uri === 'trello://me') {
    const data = await makeRequest('members/me?fields=fullName,username,email,url');
    return {
      contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(data, null, 2) }],
    };
  } else {
    throw new Error(`Unknown resource: ${uri}`);
  }
});

// ── Tools ────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_boards',
      description: 'List all Trello boards accessible to the authenticated user',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_board',
      description: 'Get board details including its lists',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
        },
        required: ['boardId'],
      },
    },
    {
      name: 'list_lists',
      description: 'List all lists (columns) in a board',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
        },
        required: ['boardId'],
      },
    },
    {
      name: 'list_cards',
      description: 'List all cards in a specific list',
      inputSchema: {
        type: 'object',
        properties: {
          listId: { type: 'string', description: 'List ID' },
        },
        required: ['listId'],
      },
    },
    {
      name: 'get_board_cards',
      description: 'Get all cards on a board (across all lists)',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
        },
        required: ['boardId'],
      },
    },
    {
      name: 'get_card',
      description: 'Get full card details including comments, checklists, attachments, and members',
      inputSchema: {
        type: 'object',
        properties: {
          cardId: { type: 'string', description: 'Card ID' },
        },
        required: ['cardId'],
      },
    },
    {
      name: 'create_card',
      description: 'Create a new card in a list',
      inputSchema: {
        type: 'object',
        properties: {
          listId: { type: 'string', description: 'List ID to create the card in' },
          name: { type: 'string', description: 'Card title' },
          description: { type: 'string', description: 'Card description (supports Markdown)' },
          due: {
            type: 'string',
            description: 'Due date (ISO 8601 format, e.g. 2026-03-15T10:00:00.000Z)',
          },
          labelIds: { type: 'string', description: 'Comma-separated label IDs to apply' },
        },
        required: ['listId', 'name'],
      },
    },
    {
      name: 'update_card',
      description: 'Update card fields (name, description, due date, etc.)',
      inputSchema: {
        type: 'object',
        properties: {
          cardId: { type: 'string', description: 'Card ID' },
          name: { type: 'string', description: 'New card title' },
          desc: { type: 'string', description: 'New description' },
          due: { type: 'string', description: 'New due date (ISO 8601)' },
          dueComplete: { type: 'boolean', description: 'Mark due date complete' },
          closed: { type: 'boolean', description: 'Archive (true) or unarchive (false)' },
        },
        required: ['cardId'],
      },
    },
    {
      name: 'move_card',
      description: 'Move a card to a different list (column)',
      inputSchema: {
        type: 'object',
        properties: {
          cardId: { type: 'string', description: 'Card ID' },
          listId: { type: 'string', description: 'Destination list ID' },
        },
        required: ['cardId', 'listId'],
      },
    },
    {
      name: 'add_comment',
      description: 'Add a comment to a card',
      inputSchema: {
        type: 'object',
        properties: {
          cardId: { type: 'string', description: 'Card ID' },
          text: { type: 'string', description: 'Comment text' },
        },
        required: ['cardId', 'text'],
      },
    },
    {
      name: 'create_list',
      description: 'Create a new list (column) on a board',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          name: { type: 'string', description: 'List name' },
        },
        required: ['boardId', 'name'],
      },
    },
    {
      name: 'get_labels',
      description: 'Get all labels defined on a board',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
        },
        required: ['boardId'],
      },
    },
    {
      name: 'archive_card',
      description: 'Archive (close) a card',
      inputSchema: {
        type: 'object',
        properties: {
          cardId: { type: 'string', description: 'Card ID' },
        },
        required: ['cardId'],
      },
    },
    {
      name: 'delete_card',
      description: 'Permanently delete a card',
      inputSchema: {
        type: 'object',
        properties: {
          cardId: { type: 'string', description: 'Card ID' },
        },
        required: ['cardId'],
      },
    },
    {
      name: 'search',
      description: 'Search for cards and boards by keyword',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          boardId: { type: 'string', description: 'Limit search to a specific board (optional)' },
        },
        required: ['query'],
      },
    },
  ],
}));

// ── Tool dispatcher ──────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;
  const a = args as any;

  switch (name) {
    case 'list_boards':
      return listBoards();
    case 'get_board':
      return getBoard(a.boardId);
    case 'list_lists':
      return listLists(a.boardId);
    case 'list_cards':
      return listCards(a.listId);
    case 'get_board_cards':
      return getBoardCards(a.boardId);
    case 'get_card':
      return getCard(a.cardId);
    case 'create_card':
      return createCard(a.listId, a.name, a.description, a.due, a.labelIds);
    case 'update_card': {
      const updates: Record<string, any> = {};
      if (a.name) updates.name = a.name;
      if (a.desc) updates.desc = a.desc;
      if (a.due) updates.due = a.due;
      if (a.dueComplete !== undefined) updates.dueComplete = a.dueComplete;
      if (a.closed !== undefined) updates.closed = a.closed;
      return updateCard(a.cardId, updates);
    }
    case 'move_card':
      return moveCard(a.cardId, a.listId);
    case 'add_comment':
      return addComment(a.cardId, a.text);
    case 'create_list':
      return createList(a.boardId, a.name);
    case 'get_labels':
      return getLabels(a.boardId);
    case 'archive_card':
      return archiveCard(a.cardId);
    case 'delete_card':
      return deleteCard(a.cardId);
    case 'search':
      return searchTrello(a.query, a.boardId);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.error('Trello MCP Server starting...');
  console.error(`API Key configured: ${API_KEY ? 'Yes' : 'No'}`);
  console.error(`API Token configured: ${API_TOKEN ? 'Yes' : 'No'}`);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Trello MCP Server running — 16 tools available');
}

main();
