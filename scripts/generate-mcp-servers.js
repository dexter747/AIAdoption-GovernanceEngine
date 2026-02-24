#!/usr/bin/env node
/**
 * MCP Server Generator — creates all missing MCP server packages
 * following the exact pattern used by existing servers (Shopify, Jira, Trello, etc.)
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'packages', 'mcp-servers');

// ── Complete metadata for all 110 missing connectors ────────────────
// Each entry: [systemType, displayName, category, envVars, apiBaseInfo, tools]

const CONNECTORS = {
  // ── PROJECT MANAGEMENT ──
  asana: {
    name: 'Asana',
    env: ['ASANA_ACCESS_TOKEN'],
    baseUrl: 'https://app.asana.com/api/1.0',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_workspaces', desc: 'List all workspaces', endpoint: '/workspaces' },
      {
        name: 'list_projects',
        desc: 'List projects in a workspace',
        endpoint: '/workspaces/${workspaceId}/projects',
        params: ['workspaceId'],
      },
      {
        name: 'get_project',
        desc: 'Get project details',
        endpoint: '/projects/${projectId}',
        params: ['projectId'],
      },
      {
        name: 'list_tasks',
        desc: 'List tasks in a project',
        endpoint: '/projects/${projectId}/tasks',
        params: ['projectId'],
      },
      {
        name: 'get_task',
        desc: 'Get task details',
        endpoint: '/tasks/${taskId}',
        params: ['taskId'],
      },
      {
        name: 'create_task',
        desc: 'Create a new task',
        endpoint: '/tasks',
        method: 'POST',
        body: ['name', 'notes', 'projectId', 'assignee', 'due_on'],
      },
      {
        name: 'update_task',
        desc: 'Update a task',
        endpoint: '/tasks/${taskId}',
        method: 'PUT',
        params: ['taskId'],
        body: ['name', 'notes', 'completed', 'due_on'],
      },
      {
        name: 'search_tasks',
        desc: 'Search tasks in a workspace',
        endpoint: '/workspaces/${workspaceId}/tasks/search?text=${query}',
        params: ['workspaceId', 'query'],
      },
    ],
  },
  'monday-com': {
    name: 'Monday.com',
    env: ['MONDAY_API_TOKEN'],
    baseUrl: 'https://api.monday.com/v2',
    authHeader: { Authorization: '${TOKEN}' },
    graphql: true,
    tools: [
      { name: 'list_boards', desc: 'List all boards' },
      { name: 'get_board', desc: 'Get board details with groups and items', params: ['boardId'] },
      { name: 'list_items', desc: 'List items in a board', params: ['boardId'] },
      { name: 'get_item', desc: 'Get item details', params: ['itemId'] },
      {
        name: 'create_item',
        desc: 'Create a new item',
        body: ['boardId', 'groupId', 'itemName', 'columnValues'],
      },
      { name: 'update_item', desc: 'Update an item', body: ['boardId', 'itemId', 'columnValues'] },
      { name: 'search_items', desc: 'Search items across boards', params: ['query'] },
    ],
  },
  clickup: {
    name: 'ClickUp',
    env: ['CLICKUP_API_TOKEN'],
    baseUrl: 'https://api.clickup.com/api/v2',
    authHeader: { Authorization: '${TOKEN}' },
    tools: [
      { name: 'list_workspaces', desc: 'List all workspaces (teams)', endpoint: '/team' },
      {
        name: 'list_spaces',
        desc: 'List spaces in a workspace',
        endpoint: '/team/${teamId}/space',
        params: ['teamId'],
      },
      {
        name: 'list_folders',
        desc: 'List folders in a space',
        endpoint: '/space/${spaceId}/folder',
        params: ['spaceId'],
      },
      {
        name: 'list_lists',
        desc: 'List lists in a folder',
        endpoint: '/folder/${folderId}/list',
        params: ['folderId'],
      },
      {
        name: 'list_tasks',
        desc: 'List tasks in a list',
        endpoint: '/list/${listId}/task',
        params: ['listId'],
      },
      {
        name: 'get_task',
        desc: 'Get task details',
        endpoint: '/task/${taskId}',
        params: ['taskId'],
      },
      {
        name: 'create_task',
        desc: 'Create a new task',
        endpoint: '/list/${listId}/task',
        method: 'POST',
        params: ['listId'],
        body: ['name', 'description', 'assignees', 'priority', 'due_date'],
      },
      {
        name: 'update_task',
        desc: 'Update a task',
        endpoint: '/task/${taskId}',
        method: 'PUT',
        params: ['taskId'],
        body: ['name', 'description', 'status', 'priority'],
      },
    ],
  },
  linear: {
    name: 'Linear',
    env: ['LINEAR_API_KEY'],
    baseUrl: 'https://api.linear.app',
    authHeader: { Authorization: '${TOKEN}' },
    graphql: true,
    tools: [
      { name: 'list_issues', desc: 'List issues with optional filters' },
      { name: 'get_issue', desc: 'Get issue details', params: ['issueId'] },
      {
        name: 'create_issue',
        desc: 'Create a new issue',
        body: ['title', 'description', 'teamId', 'assigneeId', 'priority'],
      },
      {
        name: 'update_issue',
        desc: 'Update an issue',
        params: ['issueId'],
        body: ['title', 'description', 'stateId', 'priority'],
      },
      { name: 'list_projects', desc: 'List all projects' },
      { name: 'list_teams', desc: 'List all teams' },
      { name: 'search_issues', desc: 'Search issues by query', params: ['query'] },
    ],
  },
  wrike: {
    name: 'Wrike',
    env: ['WRIKE_ACCESS_TOKEN'],
    baseUrl: 'https://www.wrike.com/api/v4',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_folders', desc: 'List folders and projects', endpoint: '/folders' },
      {
        name: 'get_folder',
        desc: 'Get folder details',
        endpoint: '/folders/${folderId}',
        params: ['folderId'],
      },
      { name: 'list_tasks', desc: 'List tasks', endpoint: '/tasks' },
      {
        name: 'get_task',
        desc: 'Get task details',
        endpoint: '/tasks/${taskId}',
        params: ['taskId'],
      },
      {
        name: 'create_task',
        desc: 'Create a new task in a folder',
        endpoint: '/folders/${folderId}/tasks',
        method: 'POST',
        params: ['folderId'],
        body: ['title', 'description', 'status', 'dates'],
      },
      {
        name: 'update_task',
        desc: 'Update a task',
        endpoint: '/tasks/${taskId}',
        method: 'PUT',
        params: ['taskId'],
        body: ['title', 'description', 'status'],
      },
      {
        name: 'search',
        desc: 'Search tasks, folders, and projects',
        endpoint: '/tasks?title=${query}',
        params: ['query'],
      },
    ],
  },
  smartsheet: {
    name: 'Smartsheet',
    env: ['SMARTSHEET_ACCESS_TOKEN'],
    baseUrl: 'https://api.smartsheet.com/2.0',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_sheets', desc: 'List all sheets', endpoint: '/sheets' },
      {
        name: 'get_sheet',
        desc: 'Get sheet with rows and columns',
        endpoint: '/sheets/${sheetId}',
        params: ['sheetId'],
      },
      {
        name: 'list_rows',
        desc: 'List rows in a sheet',
        endpoint: '/sheets/${sheetId}/rows',
        params: ['sheetId'],
      },
      {
        name: 'add_row',
        desc: 'Add a row to a sheet',
        endpoint: '/sheets/${sheetId}/rows',
        method: 'POST',
        params: ['sheetId'],
        body: ['cells'],
      },
      {
        name: 'update_row',
        desc: 'Update a row in a sheet',
        endpoint: '/sheets/${sheetId}/rows',
        method: 'PUT',
        params: ['sheetId'],
        body: ['rowId', 'cells'],
      },
      {
        name: 'search',
        desc: 'Search across all sheets',
        endpoint: '/search?query=${query}',
        params: ['query'],
      },
    ],
  },
  basecamp: {
    name: 'Basecamp',
    env: ['BASECAMP_ACCESS_TOKEN', 'BASECAMP_ACCOUNT_ID'],
    baseUrl: 'https://3.basecampapi.com/${ACCOUNT_ID}',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_projects', desc: 'List all projects', endpoint: '/projects.json' },
      {
        name: 'get_project',
        desc: 'Get project details',
        endpoint: '/projects/${projectId}.json',
        params: ['projectId'],
      },
      {
        name: 'list_todolists',
        desc: 'List to-do lists in a project',
        endpoint: '/buckets/${projectId}/todosets/${todosetId}/todolists.json',
        params: ['projectId', 'todosetId'],
      },
      {
        name: 'list_todos',
        desc: 'List to-dos in a to-do list',
        endpoint: '/buckets/${projectId}/todolists/${todolistId}/todos.json',
        params: ['projectId', 'todolistId'],
      },
      {
        name: 'create_todo',
        desc: 'Create a to-do',
        endpoint: '/buckets/${projectId}/todolists/${todolistId}/todos.json',
        method: 'POST',
        params: ['projectId', 'todolistId'],
        body: ['content', 'description', 'assignee_ids', 'due_on'],
      },
    ],
  },
  // ── COMMUNICATION ──
  slack: {
    name: 'Slack',
    env: ['SLACK_BOT_TOKEN'],
    baseUrl: 'https://slack.com/api',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_channels', desc: 'List all channels', endpoint: '/conversations.list' },
      {
        name: 'get_channel_history',
        desc: 'Get messages from a channel',
        endpoint: '/conversations.history?channel=${channelId}',
        params: ['channelId'],
      },
      {
        name: 'send_message',
        desc: 'Send a message to a channel',
        endpoint: '/chat.postMessage',
        method: 'POST',
        body: ['channel', 'text'],
      },
      {
        name: 'search_messages',
        desc: 'Search messages',
        endpoint: '/search.messages?query=${query}',
        params: ['query'],
      },
      { name: 'list_users', desc: 'List workspace users', endpoint: '/users.list' },
      {
        name: 'get_user',
        desc: 'Get user profile',
        endpoint: '/users.info?user=${userId}',
        params: ['userId'],
      },
    ],
  },
  'ms-teams': {
    name: 'Microsoft Teams',
    env: ['MS_TEAMS_ACCESS_TOKEN'],
    baseUrl: 'https://graph.microsoft.com/v1.0',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_teams', desc: 'List all teams', endpoint: '/me/joinedTeams' },
      {
        name: 'list_channels',
        desc: 'List channels in a team',
        endpoint: '/teams/${teamId}/channels',
        params: ['teamId'],
      },
      {
        name: 'get_messages',
        desc: 'Get messages from a channel',
        endpoint: '/teams/${teamId}/channels/${channelId}/messages',
        params: ['teamId', 'channelId'],
      },
      {
        name: 'send_message',
        desc: 'Send a message to a channel',
        endpoint: '/teams/${teamId}/channels/${channelId}/messages',
        method: 'POST',
        params: ['teamId', 'channelId'],
        body: ['content'],
      },
      {
        name: 'list_members',
        desc: 'List team members',
        endpoint: '/teams/${teamId}/members',
        params: ['teamId'],
      },
      {
        name: 'search',
        desc: 'Search messages across Teams',
        endpoint: '/search/query',
        method: 'POST',
        body: ['query'],
      },
    ],
  },
  notion: {
    name: 'Notion',
    env: ['NOTION_API_KEY'],
    baseUrl: 'https://api.notion.com/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}', 'Notion-Version': '2022-06-28' },
    tools: [
      {
        name: 'search',
        desc: 'Search pages and databases',
        endpoint: '/search',
        method: 'POST',
        body: ['query'],
      },
      {
        name: 'get_page',
        desc: 'Get a page by ID',
        endpoint: '/pages/${pageId}',
        params: ['pageId'],
      },
      {
        name: 'get_database',
        desc: 'Get a database by ID',
        endpoint: '/databases/${databaseId}',
        params: ['databaseId'],
      },
      {
        name: 'query_database',
        desc: 'Query a database with filters',
        endpoint: '/databases/${databaseId}/query',
        method: 'POST',
        params: ['databaseId'],
        body: ['filter', 'sorts'],
      },
      {
        name: 'create_page',
        desc: 'Create a new page',
        endpoint: '/pages',
        method: 'POST',
        body: ['parent', 'properties', 'children'],
      },
      {
        name: 'update_page',
        desc: 'Update page properties',
        endpoint: '/pages/${pageId}',
        method: 'PATCH',
        params: ['pageId'],
        body: ['properties'],
      },
      {
        name: 'get_block_children',
        desc: 'Get child blocks of a block',
        endpoint: '/blocks/${blockId}/children',
        params: ['blockId'],
      },
    ],
  },
  confluence: {
    name: 'Confluence',
    env: ['CONFLUENCE_BASE_URL', 'CONFLUENCE_USERNAME', 'CONFLUENCE_API_TOKEN'],
    baseUrl: '${BASE_URL}/wiki/rest/api',
    authType: 'basic',
    tools: [
      { name: 'list_spaces', desc: 'List all spaces', endpoint: '/space' },
      {
        name: 'get_space',
        desc: 'Get space details',
        endpoint: '/space/${spaceKey}',
        params: ['spaceKey'],
      },
      {
        name: 'list_pages',
        desc: 'List pages in a space',
        endpoint: '/space/${spaceKey}/content/page',
        params: ['spaceKey'],
      },
      {
        name: 'get_page',
        desc: 'Get page content',
        endpoint: '/content/${pageId}?expand=body.storage',
        params: ['pageId'],
      },
      {
        name: 'search',
        desc: 'Search content',
        endpoint: '/content/search?cql=${cql}',
        params: ['cql'],
      },
      {
        name: 'create_page',
        desc: 'Create a new page',
        endpoint: '/content',
        method: 'POST',
        body: ['spaceKey', 'title', 'body'],
      },
    ],
  },
  zoom: {
    name: 'Zoom',
    env: ['ZOOM_ACCESS_TOKEN'],
    baseUrl: 'https://api.zoom.us/v2',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_meetings', desc: 'List scheduled meetings', endpoint: '/users/me/meetings' },
      {
        name: 'get_meeting',
        desc: 'Get meeting details',
        endpoint: '/meetings/${meetingId}',
        params: ['meetingId'],
      },
      {
        name: 'create_meeting',
        desc: 'Create a new meeting',
        endpoint: '/users/me/meetings',
        method: 'POST',
        body: ['topic', 'type', 'start_time', 'duration', 'agenda'],
      },
      { name: 'list_recordings', desc: 'List cloud recordings', endpoint: '/users/me/recordings' },
      { name: 'list_users', desc: 'List account users', endpoint: '/users' },
    ],
  },
  'google-meet': {
    name: 'Google Meet',
    env: ['GOOGLE_ACCESS_TOKEN'],
    baseUrl: 'https://www.googleapis.com/calendar/v3',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_events', desc: 'List calendar events', endpoint: '/calendars/primary/events' },
      {
        name: 'get_event',
        desc: 'Get event details',
        endpoint: '/calendars/primary/events/${eventId}',
        params: ['eventId'],
      },
      {
        name: 'create_meeting',
        desc: 'Create a meeting with Google Meet link',
        endpoint: '/calendars/primary/events',
        method: 'POST',
        body: ['summary', 'start', 'end', 'attendees'],
      },
    ],
  },
  'google-workspace': {
    name: 'Google Workspace',
    env: ['GOOGLE_WORKSPACE_ACCESS_TOKEN'],
    baseUrl: 'https://www.googleapis.com',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_files', desc: 'List Google Drive files', endpoint: '/drive/v3/files' },
      {
        name: 'get_file',
        desc: 'Get file metadata',
        endpoint: '/drive/v3/files/${fileId}',
        params: ['fileId'],
      },
      {
        name: 'list_users',
        desc: 'List workspace users',
        endpoint: '/admin/directory/v1/users?domain=${domain}',
        params: ['domain'],
      },
      {
        name: 'search_drive',
        desc: 'Search files in Drive',
        endpoint: '/drive/v3/files?q=${query}',
        params: ['query'],
      },
    ],
  },
  'dropbox-business': {
    name: 'Dropbox Business',
    env: ['DROPBOX_ACCESS_TOKEN'],
    baseUrl: 'https://api.dropboxapi.com/2',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      {
        name: 'list_folder',
        desc: 'List files in a folder',
        endpoint: '/files/list_folder',
        method: 'POST',
        body: ['path'],
      },
      {
        name: 'get_metadata',
        desc: 'Get file or folder metadata',
        endpoint: '/files/get_metadata',
        method: 'POST',
        body: ['path'],
      },
      {
        name: 'search',
        desc: 'Search for files',
        endpoint: '/files/search_v2',
        method: 'POST',
        body: ['query'],
      },
      {
        name: 'list_members',
        desc: 'List team members',
        endpoint: '/team/members/list_v2',
        method: 'POST',
      },
    ],
  },
  // ── CRM & SALES ──
  'zoho-crm': {
    name: 'Zoho CRM',
    env: ['ZOHO_ACCESS_TOKEN', 'ZOHO_API_DOMAIN'],
    baseUrl: '${API_DOMAIN}/crm/v5',
    authHeader: { Authorization: 'Zoho-oauthtoken ${TOKEN}' },
    tools: [
      {
        name: 'list_records',
        desc: 'List records from a module',
        endpoint: '/${module}',
        params: ['module'],
      },
      {
        name: 'get_record',
        desc: 'Get a record by ID',
        endpoint: '/${module}/${recordId}',
        params: ['module', 'recordId'],
      },
      {
        name: 'create_record',
        desc: 'Create a new record',
        endpoint: '/${module}',
        method: 'POST',
        params: ['module'],
        body: ['data'],
      },
      {
        name: 'update_record',
        desc: 'Update a record',
        endpoint: '/${module}/${recordId}',
        method: 'PUT',
        params: ['module', 'recordId'],
        body: ['data'],
      },
      {
        name: 'search_records',
        desc: 'Search records in a module',
        endpoint: '/${module}/search?criteria=${criteria}',
        params: ['module', 'criteria'],
      },
    ],
  },
  pipedrive: {
    name: 'Pipedrive',
    env: ['PIPEDRIVE_API_TOKEN', 'PIPEDRIVE_DOMAIN'],
    baseUrl: 'https://${DOMAIN}.pipedrive.com/api/v1',
    tools: [
      { name: 'list_deals', desc: 'List all deals', endpoint: '/deals' },
      {
        name: 'get_deal',
        desc: 'Get deal details',
        endpoint: '/deals/${dealId}',
        params: ['dealId'],
      },
      { name: 'list_persons', desc: 'List all contacts', endpoint: '/persons' },
      { name: 'list_organizations', desc: 'List all organizations', endpoint: '/organizations' },
      {
        name: 'create_deal',
        desc: 'Create a new deal',
        endpoint: '/deals',
        method: 'POST',
        body: ['title', 'value', 'person_id', 'org_id'],
      },
      {
        name: 'search',
        desc: 'Search across items',
        endpoint: '/itemSearch?term=${term}',
        params: ['term'],
      },
    ],
  },
  freshsales: {
    name: 'Freshsales',
    env: ['FRESHSALES_API_KEY', 'FRESHSALES_DOMAIN'],
    baseUrl: 'https://${DOMAIN}.freshsales.io/api',
    authHeader: { Authorization: 'Token token=${TOKEN}' },
    tools: [
      { name: 'list_contacts', desc: 'List contacts', endpoint: '/contacts/view/1' },
      {
        name: 'get_contact',
        desc: 'Get contact details',
        endpoint: '/contacts/${contactId}',
        params: ['contactId'],
      },
      { name: 'list_deals', desc: 'List deals', endpoint: '/deals/view/1' },
      {
        name: 'get_deal',
        desc: 'Get deal details',
        endpoint: '/deals/${dealId}',
        params: ['dealId'],
      },
      {
        name: 'search',
        desc: 'Search contacts, deals, accounts',
        endpoint: '/search?q=${query}&include=contact,deal',
        params: ['query'],
      },
    ],
  },
  sugarcrm: {
    name: 'SugarCRM',
    env: ['SUGARCRM_BASE_URL', 'SUGARCRM_USERNAME', 'SUGARCRM_PASSWORD'],
    baseUrl: '${BASE_URL}/rest/v11_15',
    tools: [
      {
        name: 'list_records',
        desc: 'List records from a module',
        endpoint: '/${module}',
        params: ['module'],
      },
      {
        name: 'get_record',
        desc: 'Get a record by ID',
        endpoint: '/${module}/${recordId}',
        params: ['module', 'recordId'],
      },
      {
        name: 'create_record',
        desc: 'Create a new record',
        endpoint: '/${module}',
        method: 'POST',
        params: ['module'],
        body: ['data'],
      },
      {
        name: 'search',
        desc: 'Global search',
        endpoint: '/globalsearch?q=${query}',
        params: ['query'],
      },
    ],
  },
  insightly: {
    name: 'Insightly',
    env: ['INSIGHTLY_API_KEY'],
    baseUrl: 'https://api.insightly.com/v3.1',
    authType: 'basic',
    tools: [
      { name: 'list_contacts', desc: 'List contacts', endpoint: '/Contacts' },
      {
        name: 'get_contact',
        desc: 'Get contact details',
        endpoint: '/Contacts/${contactId}',
        params: ['contactId'],
      },
      { name: 'list_opportunities', desc: 'List opportunities', endpoint: '/Opportunities' },
      { name: 'list_projects', desc: 'List projects', endpoint: '/Projects' },
      {
        name: 'search',
        desc: 'Search across entities',
        endpoint: '/Contacts/Search?field_name=${field}&field_value=${value}',
        params: ['field', 'value'],
      },
    ],
  },
  'copper-crm': {
    name: 'Copper CRM',
    env: ['COPPER_API_KEY', 'COPPER_EMAIL'],
    baseUrl: 'https://api.copper.com/developer_api/v1',
    authHeader: {
      'X-PW-AccessToken': '${TOKEN}',
      'X-PW-Application': 'developer_api',
      'X-PW-UserEmail': '${EMAIL}',
    },
    tools: [
      { name: 'list_leads', desc: 'List leads', endpoint: '/leads/search', method: 'POST' },
      { name: 'list_people', desc: 'List people', endpoint: '/people/search', method: 'POST' },
      {
        name: 'list_opportunities',
        desc: 'List opportunities',
        endpoint: '/opportunities/search',
        method: 'POST',
      },
      {
        name: 'search',
        desc: 'Search across entities',
        endpoint: '/search',
        method: 'POST',
        body: ['query'],
      },
    ],
  },
  'close-crm': {
    name: 'Close CRM',
    env: ['CLOSE_API_KEY'],
    baseUrl: 'https://api.close.com/api/v1',
    authType: 'basic',
    tools: [
      { name: 'list_leads', desc: 'List leads', endpoint: '/lead' },
      {
        name: 'get_lead',
        desc: 'Get lead details',
        endpoint: '/lead/${leadId}',
        params: ['leadId'],
      },
      { name: 'list_contacts', desc: 'List contacts', endpoint: '/contact' },
      { name: 'list_opportunities', desc: 'List opportunities', endpoint: '/opportunity' },
      {
        name: 'search',
        desc: 'Search leads',
        endpoint: '/lead/?query=${query}',
        params: ['query'],
      },
    ],
  },
  'capsule-crm': {
    name: 'Capsule CRM',
    env: ['CAPSULE_ACCESS_TOKEN'],
    baseUrl: 'https://api.capsulecrm.com/api/v2',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_parties', desc: 'List people and organisations', endpoint: '/parties' },
      {
        name: 'get_party',
        desc: 'Get party details',
        endpoint: '/parties/${partyId}',
        params: ['partyId'],
      },
      { name: 'list_opportunities', desc: 'List opportunities', endpoint: '/opportunities' },
      { name: 'list_cases', desc: 'List cases', endpoint: '/kases' },
      {
        name: 'search',
        desc: 'Search parties',
        endpoint: '/parties/search?q=${query}',
        params: ['query'],
      },
    ],
  },
  apptivo: {
    name: 'Apptivo',
    env: ['APPTIVO_API_KEY', 'APPTIVO_ACCESS_KEY'],
    baseUrl: 'https://api.apptivo.com/app',
    tools: [
      { name: 'list_contacts', desc: 'List contacts', endpoint: '/dao/v6/contacts' },
      { name: 'list_customers', desc: 'List customers', endpoint: '/dao/v6/customers' },
      { name: 'list_opportunities', desc: 'List opportunities', endpoint: '/dao/v6/opportunities' },
      {
        name: 'search',
        desc: 'Search records',
        endpoint: '/dao/v6/contacts?searchText=${query}',
        params: ['query'],
      },
    ],
  },
  bitrix24: {
    name: 'Bitrix24',
    env: ['BITRIX24_WEBHOOK_URL'],
    baseUrl: '${WEBHOOK_URL}',
    tools: [
      { name: 'list_leads', desc: 'List CRM leads', endpoint: '/crm.lead.list' },
      {
        name: 'get_lead',
        desc: 'Get lead details',
        endpoint: '/crm.lead.get?id=${leadId}',
        params: ['leadId'],
      },
      { name: 'list_deals', desc: 'List CRM deals', endpoint: '/crm.deal.list' },
      { name: 'list_contacts', desc: 'List contacts', endpoint: '/crm.contact.list' },
      {
        name: 'search',
        desc: 'Search CRM',
        endpoint: '/crm.lead.list?filter[TITLE]=${query}',
        params: ['query'],
      },
    ],
  },
  keap: {
    name: 'Keap (Infusionsoft)',
    env: ['KEAP_ACCESS_TOKEN'],
    baseUrl: 'https://api.infusionsoft.com/crm/rest/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_contacts', desc: 'List contacts', endpoint: '/contacts' },
      {
        name: 'get_contact',
        desc: 'Get contact details',
        endpoint: '/contacts/${contactId}',
        params: ['contactId'],
      },
      { name: 'list_orders', desc: 'List orders', endpoint: '/orders' },
      {
        name: 'search',
        desc: 'Search contacts',
        endpoint: '/contacts?email=${email}',
        params: ['email'],
      },
    ],
  },
  nimble: {
    name: 'Nimble',
    env: ['NIMBLE_API_KEY'],
    baseUrl: 'https://api.nimble.com/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_contacts', desc: 'List contacts', endpoint: '/contacts' },
      {
        name: 'get_contact',
        desc: 'Get contact details',
        endpoint: '/contact/${contactId}',
        params: ['contactId'],
      },
      {
        name: 'search',
        desc: 'Search contacts',
        endpoint: '/contacts?keyword=${query}',
        params: ['query'],
      },
    ],
  },
  creatio: {
    name: 'Creatio',
    env: ['CREATIO_BASE_URL', 'CREATIO_USERNAME', 'CREATIO_PASSWORD'],
    baseUrl: '${BASE_URL}/0/odata',
    tools: [
      { name: 'list_contacts', desc: 'List contacts', endpoint: '/Contact' },
      { name: 'list_accounts', desc: 'List accounts', endpoint: '/Account' },
      { name: 'list_opportunities', desc: 'List opportunities', endpoint: '/Opportunity' },
      {
        name: 'get_record',
        desc: 'Get a record by ID',
        endpoint: '/${entity}(${guid})',
        params: ['entity', 'guid'],
      },
      {
        name: 'search',
        desc: 'Search records',
        endpoint: "/${entity}?$filter=contains(Name,'${query}')",
        params: ['entity', 'query'],
      },
    ],
  },
  'zendesk-sell': {
    name: 'Zendesk Sell',
    env: ['ZENDESK_SELL_ACCESS_TOKEN'],
    baseUrl: 'https://api.getbase.com/v2',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_leads', desc: 'List leads', endpoint: '/leads' },
      { name: 'list_deals', desc: 'List deals', endpoint: '/deals' },
      { name: 'list_contacts', desc: 'List contacts', endpoint: '/contacts' },
      {
        name: 'get_deal',
        desc: 'Get deal details',
        endpoint: '/deals/${dealId}',
        params: ['dealId'],
      },
      {
        name: 'search',
        desc: 'Search across entities',
        endpoint: '/leads?name=${query}',
        params: ['query'],
      },
    ],
  },
  'peoplesoft-crm': {
    name: 'PeopleSoft CRM',
    env: ['PEOPLESOFT_CRM_BASE_URL', 'PEOPLESOFT_CRM_USERNAME', 'PEOPLESOFT_CRM_PASSWORD'],
    baseUrl: '${BASE_URL}/PSIGW/RESTListeningConnector/PSFT_HR',
    authType: 'basic',
    tools: [
      { name: 'list_customers', desc: 'List customers', endpoint: '/customers' },
      {
        name: 'get_customer',
        desc: 'Get customer details',
        endpoint: '/customers/${customerId}',
        params: ['customerId'],
      },
      { name: 'list_cases', desc: 'List support cases', endpoint: '/cases' },
      {
        name: 'search',
        desc: 'Search records',
        endpoint: '/customers?searchCriteria=${query}',
        params: ['query'],
      },
    ],
  },
  // ── HCM & HR ──
  bamboohr: {
    name: 'BambooHR',
    env: ['BAMBOOHR_API_KEY', 'BAMBOOHR_SUBDOMAIN'],
    baseUrl: 'https://api.bamboohr.com/api/gateway.php/${SUBDOMAIN}/v1',
    authType: 'basic',
    tools: [
      { name: 'list_employees', desc: 'List all employees', endpoint: '/employees/directory' },
      {
        name: 'get_employee',
        desc: 'Get employee details',
        endpoint:
          '/employees/${employeeId}/?fields=firstName,lastName,department,jobTitle,workEmail,hireDate,status',
        params: ['employeeId'],
      },
      {
        name: 'list_time_off',
        desc: 'List time off requests',
        endpoint: '/time_off/requests/?status=approved',
      },
      {
        name: 'get_report',
        desc: 'Get a custom report',
        endpoint: '/reports/${reportId}?format=JSON',
        params: ['reportId'],
      },
    ],
  },
  gusto: {
    name: 'Gusto',
    env: ['GUSTO_ACCESS_TOKEN'],
    baseUrl: 'https://api.gusto.com/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_companies', desc: 'List companies', endpoint: '/companies' },
      {
        name: 'list_employees',
        desc: 'List employees',
        endpoint: '/companies/${companyId}/employees',
        params: ['companyId'],
      },
      {
        name: 'get_employee',
        desc: 'Get employee details',
        endpoint: '/employees/${employeeId}',
        params: ['employeeId'],
      },
      {
        name: 'list_payrolls',
        desc: 'List payrolls',
        endpoint: '/companies/${companyId}/payrolls',
        params: ['companyId'],
      },
    ],
  },
  rippling: {
    name: 'Rippling',
    env: ['RIPPLING_API_KEY'],
    baseUrl: 'https://api.rippling.com',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_employees', desc: 'List employees', endpoint: '/platform/api/employees' },
      {
        name: 'get_employee',
        desc: 'Get employee details',
        endpoint: '/platform/api/employees/${employeeId}',
        params: ['employeeId'],
      },
      { name: 'list_departments', desc: 'List departments', endpoint: '/platform/api/departments' },
      { name: 'list_groups', desc: 'List groups', endpoint: '/platform/api/groups' },
    ],
  },
  deel: {
    name: 'Deel',
    env: ['DEEL_API_TOKEN'],
    baseUrl: 'https://api.deel.com/rest/v2',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_contracts', desc: 'List contracts', endpoint: '/contracts' },
      {
        name: 'get_contract',
        desc: 'Get contract details',
        endpoint: '/contracts/${contractId}',
        params: ['contractId'],
      },
      { name: 'list_people', desc: 'List people', endpoint: '/people' },
      { name: 'list_invoices', desc: 'List invoices', endpoint: '/invoices' },
    ],
  },
  // ── CLOUD DATABASES ──
  'amazon-aurora': {
    name: 'Amazon Aurora',
    env: ['AURORA_HOST', 'AURORA_PORT', 'AURORA_DATABASE', 'AURORA_USER', 'AURORA_PASSWORD'],
    dbType: 'mysql',
    tools: [
      { name: 'query', desc: 'Execute a SQL query', body: ['sql'] },
      { name: 'list_tables', desc: 'List all tables in the database' },
      { name: 'describe_table', desc: 'Get table schema', params: ['tableName'] },
      { name: 'list_databases', desc: 'List all databases' },
    ],
  },
  'aws-rds': {
    name: 'AWS RDS',
    env: ['RDS_HOST', 'RDS_PORT', 'RDS_DATABASE', 'RDS_USER', 'RDS_PASSWORD'],
    dbType: 'postgres',
    tools: [
      { name: 'query', desc: 'Execute a SQL query', body: ['sql'] },
      { name: 'list_tables', desc: 'List all tables' },
      { name: 'describe_table', desc: 'Get table schema', params: ['tableName'] },
      { name: 'list_databases', desc: 'List all databases' },
    ],
  },
  'azure-sql': {
    name: 'Azure SQL',
    env: ['AZURE_SQL_HOST', 'AZURE_SQL_DATABASE', 'AZURE_SQL_USER', 'AZURE_SQL_PASSWORD'],
    dbType: 'mssql',
    tools: [
      { name: 'query', desc: 'Execute a SQL query', body: ['sql'] },
      { name: 'list_tables', desc: 'List all tables' },
      { name: 'describe_table', desc: 'Get table schema', params: ['tableName'] },
      { name: 'list_databases', desc: 'List all databases' },
    ],
  },
  'google-cloud-sql': {
    name: 'Google Cloud SQL',
    env: [
      'CLOUDSQL_HOST',
      'CLOUDSQL_PORT',
      'CLOUDSQL_DATABASE',
      'CLOUDSQL_USER',
      'CLOUDSQL_PASSWORD',
    ],
    dbType: 'postgres',
    tools: [
      { name: 'query', desc: 'Execute a SQL query', body: ['sql'] },
      { name: 'list_tables', desc: 'List all tables' },
      { name: 'describe_table', desc: 'Get table schema', params: ['tableName'] },
    ],
  },
  cockroachdb: {
    name: 'CockroachDB',
    env: ['COCKROACHDB_URL'],
    dbType: 'postgres',
    tools: [
      { name: 'query', desc: 'Execute a SQL query', body: ['sql'] },
      { name: 'list_tables', desc: 'List all tables' },
      { name: 'describe_table', desc: 'Get table schema', params: ['tableName'] },
    ],
  },
  neon: {
    name: 'Neon',
    env: ['NEON_DATABASE_URL'],
    dbType: 'postgres',
    tools: [
      { name: 'query', desc: 'Execute a SQL query', body: ['sql'] },
      { name: 'list_tables', desc: 'List all tables' },
      { name: 'describe_table', desc: 'Get table schema', params: ['tableName'] },
    ],
  },
  planetscale: {
    name: 'PlanetScale',
    env: [
      'PLANETSCALE_HOST',
      'PLANETSCALE_DATABASE',
      'PLANETSCALE_USERNAME',
      'PLANETSCALE_PASSWORD',
    ],
    dbType: 'mysql',
    tools: [
      { name: 'query', desc: 'Execute a SQL query', body: ['sql'] },
      { name: 'list_tables', desc: 'List all tables' },
      { name: 'describe_table', desc: 'Get table schema', params: ['tableName'] },
    ],
  },
  supabase: {
    name: 'Supabase',
    env: ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'],
    baseUrl: '${BASE_URL}',
    authHeader: { apikey: '${TOKEN}', Authorization: 'Bearer ${TOKEN}' },
    tools: [
      {
        name: 'query',
        desc: 'Execute a SQL query via RPC',
        endpoint: '/rest/v1/rpc/query',
        method: 'POST',
        body: ['sql'],
      },
      { name: 'list_tables', desc: 'List tables', endpoint: '/rest/v1/' },
      {
        name: 'get_rows',
        desc: 'Get rows from a table',
        endpoint: '/rest/v1/${table}',
        params: ['table'],
      },
      {
        name: 'insert_row',
        desc: 'Insert a row',
        endpoint: '/rest/v1/${table}',
        method: 'POST',
        params: ['table'],
        body: ['data'],
      },
    ],
  },
  sqlite: {
    name: 'SQLite',
    env: ['SQLITE_DATABASE_PATH'],
    dbType: 'sqlite',
    tools: [
      { name: 'query', desc: 'Execute a SQL query', body: ['sql'] },
      { name: 'list_tables', desc: 'List all tables' },
      { name: 'describe_table', desc: 'Get table schema', params: ['tableName'] },
    ],
  },
  firestore: {
    name: 'Google Firestore',
    env: ['FIRESTORE_PROJECT_ID', 'GOOGLE_APPLICATION_CREDENTIALS'],
    baseUrl:
      'https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents',
    tools: [
      {
        name: 'list_collections',
        desc: 'List collections',
        endpoint: '/:listCollections',
        method: 'POST',
      },
      {
        name: 'list_documents',
        desc: 'List documents in a collection',
        endpoint: '/${collection}',
        params: ['collection'],
      },
      {
        name: 'get_document',
        desc: 'Get document by path',
        endpoint: '/${documentPath}',
        params: ['documentPath'],
      },
      {
        name: 'query',
        desc: 'Run a structured query',
        endpoint: '/:runQuery',
        method: 'POST',
        body: ['structuredQuery'],
      },
    ],
  },
  influxdb: {
    name: 'InfluxDB',
    env: ['INFLUXDB_URL', 'INFLUXDB_TOKEN', 'INFLUXDB_ORG'],
    baseUrl: '${URL}',
    authHeader: { Authorization: 'Token ${TOKEN}' },
    tools: [
      {
        name: 'query',
        desc: 'Execute a Flux query',
        endpoint: '/api/v2/query?org=${ORG}',
        method: 'POST',
        body: ['query'],
      },
      { name: 'list_buckets', desc: 'List buckets', endpoint: '/api/v2/buckets' },
      {
        name: 'list_measurements',
        desc: 'List measurements in a bucket',
        endpoint: '/api/v2/query?org=${ORG}',
        method: 'POST',
        body: ['bucket'],
      },
    ],
  },
  // ── DATA WAREHOUSE ──
  snowflake: {
    name: 'Snowflake',
    env: [
      'SNOWFLAKE_ACCOUNT',
      'SNOWFLAKE_USERNAME',
      'SNOWFLAKE_PASSWORD',
      'SNOWFLAKE_DATABASE',
      'SNOWFLAKE_WAREHOUSE',
    ],
    dbType: 'snowflake',
    tools: [
      { name: 'query', desc: 'Execute a SQL query', body: ['sql'] },
      { name: 'list_databases', desc: 'List databases' },
      { name: 'list_schemas', desc: 'List schemas in a database', params: ['database'] },
      { name: 'list_tables', desc: 'List tables in a schema', params: ['database', 'schema'] },
      {
        name: 'describe_table',
        desc: 'Describe table columns',
        params: ['database', 'schema', 'table'],
      },
    ],
  },
  bigquery: {
    name: 'Google BigQuery',
    env: ['BIGQUERY_PROJECT_ID', 'GOOGLE_APPLICATION_CREDENTIALS'],
    tools: [
      { name: 'query', desc: 'Execute a SQL query', body: ['sql'] },
      { name: 'list_datasets', desc: 'List datasets in the project' },
      { name: 'list_tables', desc: 'List tables in a dataset', params: ['datasetId'] },
      { name: 'get_table', desc: 'Get table schema', params: ['datasetId', 'tableId'] },
    ],
  },
  redshift: {
    name: 'Amazon Redshift',
    env: [
      'REDSHIFT_HOST',
      'REDSHIFT_PORT',
      'REDSHIFT_DATABASE',
      'REDSHIFT_USER',
      'REDSHIFT_PASSWORD',
    ],
    dbType: 'postgres',
    tools: [
      { name: 'query', desc: 'Execute a SQL query', body: ['sql'] },
      { name: 'list_tables', desc: 'List all tables' },
      { name: 'describe_table', desc: 'Get table schema', params: ['tableName'] },
      { name: 'list_schemas', desc: 'List all schemas' },
    ],
  },
  databricks: {
    name: 'Databricks',
    env: ['DATABRICKS_HOST', 'DATABRICKS_TOKEN', 'DATABRICKS_WAREHOUSE_ID'],
    baseUrl: 'https://${HOST}/api/2.0',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      {
        name: 'query',
        desc: 'Execute a SQL query',
        endpoint: '/sql/statements',
        method: 'POST',
        body: ['sql'],
      },
      { name: 'list_catalogs', desc: 'List catalogs', endpoint: '/unity-catalog/catalogs' },
      {
        name: 'list_schemas',
        desc: 'List schemas',
        endpoint: '/unity-catalog/schemas?catalog_name=${catalog}',
        params: ['catalog'],
      },
      {
        name: 'list_tables',
        desc: 'List tables',
        endpoint: '/unity-catalog/tables?catalog_name=${catalog}&schema_name=${schema}',
        params: ['catalog', 'schema'],
      },
    ],
  },
  'azure-synapse': {
    name: 'Azure Synapse Analytics',
    env: ['SYNAPSE_HOST', 'SYNAPSE_DATABASE', 'SYNAPSE_USER', 'SYNAPSE_PASSWORD'],
    dbType: 'mssql',
    tools: [
      { name: 'query', desc: 'Execute a SQL query', body: ['sql'] },
      { name: 'list_tables', desc: 'List all tables' },
      { name: 'describe_table', desc: 'Get table schema', params: ['tableName'] },
    ],
  },
  teradata: {
    name: 'Teradata',
    env: ['TERADATA_HOST', 'TERADATA_USER', 'TERADATA_PASSWORD'],
    dbType: 'teradata',
    tools: [
      { name: 'query', desc: 'Execute a SQL query', body: ['sql'] },
      { name: 'list_databases', desc: 'List all databases' },
      { name: 'list_tables', desc: 'List tables in a database', params: ['database'] },
      { name: 'describe_table', desc: 'Get table schema', params: ['database', 'table'] },
    ],
  },
  dremio: {
    name: 'Dremio',
    env: ['DREMIO_HOST', 'DREMIO_TOKEN'],
    baseUrl: 'https://${HOST}/api/v3',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      {
        name: 'query',
        desc: 'Execute a SQL query',
        endpoint: '/sql',
        method: 'POST',
        body: ['sql'],
      },
      { name: 'list_catalogs', desc: 'List data catalogs', endpoint: '/catalog' },
      {
        name: 'get_catalog',
        desc: 'Get catalog details',
        endpoint: '/catalog/${catalogId}',
        params: ['catalogId'],
      },
    ],
  },
  starburst: {
    name: 'Starburst',
    env: ['STARBURST_HOST', 'STARBURST_USER', 'STARBURST_PASSWORD'],
    dbType: 'trino',
    tools: [
      { name: 'query', desc: 'Execute a SQL query', body: ['sql'] },
      { name: 'list_catalogs', desc: 'List catalogs' },
      { name: 'list_schemas', desc: 'List schemas in a catalog', params: ['catalog'] },
      { name: 'list_tables', desc: 'List tables in a schema', params: ['catalog', 'schema'] },
    ],
  },
  firebolt: {
    name: 'Firebolt',
    env: ['FIREBOLT_CLIENT_ID', 'FIREBOLT_CLIENT_SECRET', 'FIREBOLT_DATABASE', 'FIREBOLT_ENGINE'],
    tools: [
      { name: 'query', desc: 'Execute a SQL query', body: ['sql'] },
      { name: 'list_tables', desc: 'List all tables' },
      { name: 'describe_table', desc: 'Get table schema', params: ['tableName'] },
    ],
  },
  // ── BI & ANALYTICS ──
  tableau: {
    name: 'Tableau',
    env: ['TABLEAU_SERVER_URL', 'TABLEAU_TOKEN_NAME', 'TABLEAU_TOKEN_SECRET', 'TABLEAU_SITE_ID'],
    baseUrl: '${SERVER_URL}/api/3.21',
    tools: [
      {
        name: 'list_workbooks',
        desc: 'List workbooks',
        endpoint: '/sites/${siteId}/workbooks',
        params: ['siteId'],
      },
      {
        name: 'get_workbook',
        desc: 'Get workbook details',
        endpoint: '/sites/${siteId}/workbooks/${workbookId}',
        params: ['siteId', 'workbookId'],
      },
      {
        name: 'list_views',
        desc: 'List views',
        endpoint: '/sites/${siteId}/views',
        params: ['siteId'],
      },
      {
        name: 'list_datasources',
        desc: 'List data sources',
        endpoint: '/sites/${siteId}/datasources',
        params: ['siteId'],
      },
    ],
  },
  'power-bi': {
    name: 'Power BI',
    env: ['POWERBI_ACCESS_TOKEN'],
    baseUrl: 'https://api.powerbi.com/v1.0/myorg',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_dashboards', desc: 'List dashboards', endpoint: '/dashboards' },
      { name: 'list_reports', desc: 'List reports', endpoint: '/reports' },
      { name: 'list_datasets', desc: 'List datasets', endpoint: '/datasets' },
      {
        name: 'execute_query',
        desc: 'Execute a DAX query',
        endpoint: '/datasets/${datasetId}/executeQueries',
        method: 'POST',
        params: ['datasetId'],
        body: ['query'],
      },
    ],
  },
  looker: {
    name: 'Looker',
    env: ['LOOKER_BASE_URL', 'LOOKER_CLIENT_ID', 'LOOKER_CLIENT_SECRET'],
    baseUrl: '${BASE_URL}/api/4.0',
    tools: [
      { name: 'list_dashboards', desc: 'List dashboards', endpoint: '/dashboards' },
      {
        name: 'get_dashboard',
        desc: 'Get dashboard details',
        endpoint: '/dashboards/${dashboardId}',
        params: ['dashboardId'],
      },
      { name: 'list_looks', desc: 'List looks', endpoint: '/looks' },
      {
        name: 'run_query',
        desc: 'Run a query',
        endpoint: '/queries/run/json',
        method: 'POST',
        body: ['model', 'view', 'fields', 'filters'],
      },
      { name: 'list_models', desc: 'List LookML models', endpoint: '/lookml_models' },
    ],
  },
  qlik: {
    name: 'Qlik Sense',
    env: ['QLIK_TENANT_URL', 'QLIK_API_KEY'],
    baseUrl: '${TENANT_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_apps', desc: 'List apps', endpoint: '/apps' },
      { name: 'get_app', desc: 'Get app details', endpoint: '/apps/${appId}', params: ['appId'] },
      { name: 'list_spaces', desc: 'List spaces', endpoint: '/spaces' },
      { name: 'list_items', desc: 'List items', endpoint: '/items' },
    ],
  },
  cognos: {
    name: 'IBM Cognos',
    env: ['COGNOS_BASE_URL', 'COGNOS_NAMESPACE', 'COGNOS_USERNAME', 'COGNOS_PASSWORD'],
    baseUrl: '${BASE_URL}/api/v1',
    tools: [
      { name: 'list_reports', desc: 'List reports', endpoint: '/content' },
      {
        name: 'get_report',
        desc: 'Get report details',
        endpoint: '/content/${reportId}',
        params: ['reportId'],
      },
      {
        name: 'run_report',
        desc: 'Run a report',
        endpoint: '/reports/${reportId}/run',
        method: 'POST',
        params: ['reportId'],
      },
    ],
  },
  'crystal-reports': {
    name: 'Crystal Reports',
    env: ['CRYSTAL_SERVER_URL', 'CRYSTAL_USERNAME', 'CRYSTAL_PASSWORD'],
    baseUrl: '${SERVER_URL}/api/v1',
    authType: 'basic',
    tools: [
      { name: 'list_reports', desc: 'List available reports', endpoint: '/reports' },
      {
        name: 'get_report',
        desc: 'Get report details',
        endpoint: '/reports/${reportId}',
        params: ['reportId'],
      },
      {
        name: 'run_report',
        desc: 'Run a report with parameters',
        endpoint: '/reports/${reportId}/run',
        method: 'POST',
        params: ['reportId'],
        body: ['parameters'],
      },
    ],
  },
  brio: {
    name: 'Brio (Hyperion Intelligence)',
    env: ['BRIO_BASE_URL', 'BRIO_USERNAME', 'BRIO_PASSWORD'],
    baseUrl: '${BASE_URL}/api',
    authType: 'basic',
    tools: [
      { name: 'list_reports', desc: 'List reports', endpoint: '/reports' },
      {
        name: 'get_report',
        desc: 'Get report details',
        endpoint: '/reports/${reportId}',
        params: ['reportId'],
      },
      {
        name: 'run_query',
        desc: 'Run a query',
        endpoint: '/queries',
        method: 'POST',
        body: ['query'],
      },
    ],
  },
  // ── COMMERCE ──
  bigcommerce: {
    name: 'BigCommerce',
    env: ['BIGCOMMERCE_STORE_HASH', 'BIGCOMMERCE_ACCESS_TOKEN'],
    baseUrl: 'https://api.bigcommerce.com/stores/${STORE_HASH}/v3',
    authHeader: { 'X-Auth-Token': '${TOKEN}' },
    tools: [
      { name: 'list_products', desc: 'List products', endpoint: '/catalog/products' },
      {
        name: 'get_product',
        desc: 'Get product details',
        endpoint: '/catalog/products/${productId}',
        params: ['productId'],
      },
      { name: 'list_orders', desc: 'List orders', endpoint: '/orders' },
      {
        name: 'get_order',
        desc: 'Get order details',
        endpoint: '/orders/${orderId}',
        params: ['orderId'],
      },
      { name: 'list_customers', desc: 'List customers', endpoint: '/customers' },
    ],
  },
  woocommerce: {
    name: 'WooCommerce',
    env: ['WOOCOMMERCE_URL', 'WOOCOMMERCE_CONSUMER_KEY', 'WOOCOMMERCE_CONSUMER_SECRET'],
    baseUrl: '${URL}/wp-json/wc/v3',
    tools: [
      { name: 'list_products', desc: 'List products', endpoint: '/products' },
      {
        name: 'get_product',
        desc: 'Get product details',
        endpoint: '/products/${productId}',
        params: ['productId'],
      },
      { name: 'list_orders', desc: 'List orders', endpoint: '/orders' },
      {
        name: 'get_order',
        desc: 'Get order details',
        endpoint: '/orders/${orderId}',
        params: ['orderId'],
      },
      { name: 'list_customers', desc: 'List customers', endpoint: '/customers' },
    ],
  },
  squarespace: {
    name: 'Squarespace',
    env: ['SQUARESPACE_API_KEY'],
    baseUrl: 'https://api.squarespace.com/1.0',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_orders', desc: 'List orders', endpoint: '/commerce/orders' },
      {
        name: 'get_order',
        desc: 'Get order details',
        endpoint: '/commerce/orders/${orderId}',
        params: ['orderId'],
      },
      { name: 'list_products', desc: 'List products', endpoint: '/commerce/products' },
      { name: 'list_inventory', desc: 'List inventory', endpoint: '/commerce/inventory' },
    ],
  },
  prestashop: {
    name: 'PrestaShop',
    env: ['PRESTASHOP_URL', 'PRESTASHOP_API_KEY'],
    baseUrl: '${URL}/api',
    authType: 'basic',
    tools: [
      { name: 'list_products', desc: 'List products', endpoint: '/products' },
      {
        name: 'get_product',
        desc: 'Get product details',
        endpoint: '/products/${productId}',
        params: ['productId'],
      },
      { name: 'list_orders', desc: 'List orders', endpoint: '/orders' },
      { name: 'list_customers', desc: 'List customers', endpoint: '/customers' },
    ],
  },
  stripe: {
    name: 'Stripe',
    env: ['STRIPE_SECRET_KEY'],
    baseUrl: 'https://api.stripe.com/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_customers', desc: 'List customers', endpoint: '/customers' },
      {
        name: 'get_customer',
        desc: 'Get customer details',
        endpoint: '/customers/${customerId}',
        params: ['customerId'],
      },
      { name: 'list_payments', desc: 'List payment intents', endpoint: '/payment_intents' },
      { name: 'list_invoices', desc: 'List invoices', endpoint: '/invoices' },
      { name: 'list_subscriptions', desc: 'List subscriptions', endpoint: '/subscriptions' },
      { name: 'get_balance', desc: 'Get account balance', endpoint: '/balance' },
    ],
  },
  // ── DEVTOOLS ──
  github: {
    name: 'GitHub',
    env: ['GITHUB_TOKEN'],
    baseUrl: 'https://api.github.com',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_repos', desc: 'List repositories', endpoint: '/user/repos' },
      {
        name: 'get_repo',
        desc: 'Get repository details',
        endpoint: '/repos/${owner}/${repo}',
        params: ['owner', 'repo'],
      },
      {
        name: 'list_issues',
        desc: 'List issues',
        endpoint: '/repos/${owner}/${repo}/issues',
        params: ['owner', 'repo'],
      },
      {
        name: 'list_prs',
        desc: 'List pull requests',
        endpoint: '/repos/${owner}/${repo}/pulls',
        params: ['owner', 'repo'],
      },
      {
        name: 'search_code',
        desc: 'Search code',
        endpoint: '/search/code?q=${query}',
        params: ['query'],
      },
      {
        name: 'search_issues',
        desc: 'Search issues and PRs',
        endpoint: '/search/issues?q=${query}',
        params: ['query'],
      },
    ],
  },
  gitlab: {
    name: 'GitLab',
    env: ['GITLAB_TOKEN', 'GITLAB_URL'],
    baseUrl: '${URL}/api/v4',
    authHeader: { 'PRIVATE-TOKEN': '${TOKEN}' },
    tools: [
      { name: 'list_projects', desc: 'List projects', endpoint: '/projects' },
      {
        name: 'get_project',
        desc: 'Get project details',
        endpoint: '/projects/${projectId}',
        params: ['projectId'],
      },
      {
        name: 'list_issues',
        desc: 'List issues',
        endpoint: '/projects/${projectId}/issues',
        params: ['projectId'],
      },
      {
        name: 'list_mrs',
        desc: 'List merge requests',
        endpoint: '/projects/${projectId}/merge_requests',
        params: ['projectId'],
      },
      {
        name: 'search',
        desc: 'Search across GitLab',
        endpoint: '/search?scope=projects&search=${query}',
        params: ['query'],
      },
    ],
  },
  bitbucket: {
    name: 'Bitbucket',
    env: ['BITBUCKET_USERNAME', 'BITBUCKET_APP_PASSWORD'],
    baseUrl: 'https://api.bitbucket.org/2.0',
    authType: 'basic',
    tools: [
      {
        name: 'list_repos',
        desc: 'List repositories',
        endpoint: '/repositories/${workspace}',
        params: ['workspace'],
      },
      {
        name: 'get_repo',
        desc: 'Get repository details',
        endpoint: '/repositories/${workspace}/${repoSlug}',
        params: ['workspace', 'repoSlug'],
      },
      {
        name: 'list_prs',
        desc: 'List pull requests',
        endpoint: '/repositories/${workspace}/${repoSlug}/pullrequests',
        params: ['workspace', 'repoSlug'],
      },
      {
        name: 'list_issues',
        desc: 'List issues',
        endpoint: '/repositories/${workspace}/${repoSlug}/issues',
        params: ['workspace', 'repoSlug'],
      },
    ],
  },
  jenkins: {
    name: 'Jenkins',
    env: ['JENKINS_URL', 'JENKINS_USER', 'JENKINS_TOKEN'],
    baseUrl: '${URL}',
    authType: 'basic',
    tools: [
      {
        name: 'list_jobs',
        desc: 'List all jobs',
        endpoint: '/api/json?tree=jobs[name,url,color,lastBuild[number,result,timestamp]]',
      },
      {
        name: 'get_job',
        desc: 'Get job details',
        endpoint: '/job/${jobName}/api/json',
        params: ['jobName'],
      },
      {
        name: 'get_build',
        desc: 'Get build details',
        endpoint: '/job/${jobName}/${buildNumber}/api/json',
        params: ['jobName', 'buildNumber'],
      },
      {
        name: 'trigger_build',
        desc: 'Trigger a build',
        endpoint: '/job/${jobName}/build',
        method: 'POST',
        params: ['jobName'],
      },
    ],
  },
  // ── IDENTITY & ACCESS ──
  okta: {
    name: 'Okta',
    env: ['OKTA_DOMAIN', 'OKTA_API_TOKEN'],
    baseUrl: 'https://${DOMAIN}/api/v1',
    authHeader: { Authorization: 'SSWS ${TOKEN}' },
    tools: [
      { name: 'list_users', desc: 'List users', endpoint: '/users' },
      {
        name: 'get_user',
        desc: 'Get user details',
        endpoint: '/users/${userId}',
        params: ['userId'],
      },
      { name: 'list_groups', desc: 'List groups', endpoint: '/groups' },
      { name: 'list_apps', desc: 'List applications', endpoint: '/apps' },
      {
        name: 'search_users',
        desc: 'Search users',
        endpoint: '/users?search=${query}',
        params: ['query'],
      },
    ],
  },
  'active-directory': {
    name: 'Active Directory (Azure AD)',
    env: ['AZURE_AD_TENANT_ID', 'AZURE_AD_CLIENT_ID', 'AZURE_AD_CLIENT_SECRET'],
    baseUrl: 'https://graph.microsoft.com/v1.0',
    tools: [
      { name: 'list_users', desc: 'List users', endpoint: '/users' },
      {
        name: 'get_user',
        desc: 'Get user details',
        endpoint: '/users/${userId}',
        params: ['userId'],
      },
      { name: 'list_groups', desc: 'List groups', endpoint: '/groups' },
      {
        name: 'list_group_members',
        desc: 'List group members',
        endpoint: '/groups/${groupId}/members',
        params: ['groupId'],
      },
      {
        name: 'search_users',
        desc: 'Search users',
        endpoint: '/users?$search="displayName:${query}"',
        params: ['query'],
      },
    ],
  },
  jumpcloud: {
    name: 'JumpCloud',
    env: ['JUMPCLOUD_API_KEY'],
    baseUrl: 'https://console.jumpcloud.com/api',
    authHeader: { 'x-api-key': '${TOKEN}' },
    tools: [
      { name: 'list_users', desc: 'List system users', endpoint: '/systemusers' },
      {
        name: 'get_user',
        desc: 'Get user details',
        endpoint: '/systemusers/${userId}',
        params: ['userId'],
      },
      { name: 'list_systems', desc: 'List systems', endpoint: '/systems' },
      { name: 'list_groups', desc: 'List user groups', endpoint: '/v2/usergroups' },
    ],
  },
  // ── FINANCE ──
  freshbooks: {
    name: 'FreshBooks',
    env: ['FRESHBOOKS_ACCESS_TOKEN', 'FRESHBOOKS_ACCOUNT_ID'],
    baseUrl: 'https://api.freshbooks.com/accounting/account/${ACCOUNT_ID}',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_invoices', desc: 'List invoices', endpoint: '/invoices/invoices' },
      {
        name: 'get_invoice',
        desc: 'Get invoice details',
        endpoint: '/invoices/invoices/${invoiceId}',
        params: ['invoiceId'],
      },
      { name: 'list_clients', desc: 'List clients', endpoint: '/users/clients' },
      { name: 'list_expenses', desc: 'List expenses', endpoint: '/expenses/expenses' },
      { name: 'list_payments', desc: 'List payments', endpoint: '/payments/payments' },
    ],
  },
  xero: {
    name: 'Xero',
    env: ['XERO_ACCESS_TOKEN', 'XERO_TENANT_ID'],
    baseUrl: 'https://api.xero.com/api.xro/2.0',
    authHeader: { Authorization: 'Bearer ${TOKEN}', 'Xero-tenant-id': '${TENANT_ID}' },
    tools: [
      { name: 'list_invoices', desc: 'List invoices', endpoint: '/Invoices' },
      {
        name: 'get_invoice',
        desc: 'Get invoice details',
        endpoint: '/Invoices/${invoiceId}',
        params: ['invoiceId'],
      },
      { name: 'list_contacts', desc: 'List contacts', endpoint: '/Contacts' },
      { name: 'list_accounts', desc: 'List chart of accounts', endpoint: '/Accounts' },
      {
        name: 'list_bank_transactions',
        desc: 'List bank transactions',
        endpoint: '/BankTransactions',
      },
      { name: 'get_balance_sheet', desc: 'Get balance sheet', endpoint: '/Reports/BalanceSheet' },
      { name: 'get_profit_loss', desc: 'Get profit and loss', endpoint: '/Reports/ProfitAndLoss' },
    ],
  },
  hyperion: {
    name: 'Oracle Hyperion',
    env: ['HYPERION_BASE_URL', 'HYPERION_USERNAME', 'HYPERION_PASSWORD'],
    baseUrl: '${BASE_URL}/HyperionPlanning/rest/v3',
    authType: 'basic',
    tools: [
      { name: 'list_applications', desc: 'List applications', endpoint: '/applications' },
      {
        name: 'list_dimensions',
        desc: 'List dimensions',
        endpoint: '/applications/${app}/dimensions',
        params: ['app'],
      },
      {
        name: 'get_members',
        desc: 'Get dimension members',
        endpoint: '/applications/${app}/dimensions/${dimension}/members',
        params: ['app', 'dimension'],
      },
      {
        name: 'run_report',
        desc: 'Run a report',
        endpoint: '/applications/${app}/reports/${report}',
        params: ['app', 'report'],
      },
    ],
  },
  // ── FINANCIAL MARKETS ──
  'bloomberg-terminal': {
    name: 'Bloomberg Terminal',
    env: ['BLOOMBERG_HOST', 'BLOOMBERG_PORT'],
    tools: [
      {
        name: 'get_security_data',
        desc: 'Get security reference data',
        params: ['securities', 'fields'],
      },
      {
        name: 'get_historical_data',
        desc: 'Get historical data',
        params: ['security', 'fields', 'startDate', 'endDate'],
      },
      {
        name: 'get_intraday_data',
        desc: 'Get intraday tick data',
        params: ['security', 'eventType', 'startDateTime', 'endDateTime'],
      },
      { name: 'search_securities', desc: 'Search for securities', params: ['query'] },
    ],
  },
  'reuters-3000': {
    name: 'Reuters 3000 / Refinitiv',
    env: ['REFINITIV_USERNAME', 'REFINITIV_PASSWORD', 'REFINITIV_APP_KEY'],
    baseUrl: 'https://api.refinitiv.com',
    tools: [
      {
        name: 'get_quote',
        desc: 'Get real-time quote',
        endpoint: '/data/pricing/v1/${ric}',
        params: ['ric'],
      },
      {
        name: 'get_historical',
        desc: 'Get historical data',
        endpoint: '/data/historical-pricing/v1/views/interday-summaries/${ric}',
        params: ['ric'],
      },
      {
        name: 'search',
        desc: 'Search instruments',
        endpoint: '/discovery/search/v1?query=${query}',
        params: ['query'],
      },
      {
        name: 'get_fundamentals',
        desc: 'Get fundamental data',
        endpoint: '/data/fundamentals/v1/${ric}',
        params: ['ric'],
      },
    ],
  },
  murex: {
    name: 'Murex MX.3',
    env: ['MUREX_BASE_URL', 'MUREX_USERNAME', 'MUREX_PASSWORD'],
    baseUrl: '${BASE_URL}/mx/api/v1',
    authType: 'basic',
    tools: [
      { name: 'list_trades', desc: 'List trades', endpoint: '/trades' },
      {
        name: 'get_trade',
        desc: 'Get trade details',
        endpoint: '/trades/${tradeId}',
        params: ['tradeId'],
      },
      {
        name: 'get_portfolio',
        desc: 'Get portfolio positions',
        endpoint: '/portfolios/${portfolioId}/positions',
        params: ['portfolioId'],
      },
      {
        name: 'get_risk',
        desc: 'Get risk metrics',
        endpoint: '/risk/scenarios/${scenarioId}',
        params: ['scenarioId'],
      },
      {
        name: 'search',
        desc: 'Search trades',
        endpoint: '/trades/search?query=${query}',
        params: ['query'],
      },
    ],
  },
  calypso: {
    name: 'Calypso',
    env: ['CALYPSO_BASE_URL', 'CALYPSO_USERNAME', 'CALYPSO_PASSWORD'],
    baseUrl: '${BASE_URL}/calypso/api/v1',
    authType: 'basic',
    tools: [
      { name: 'list_trades', desc: 'List trades', endpoint: '/trades' },
      {
        name: 'get_trade',
        desc: 'Get trade details',
        endpoint: '/trades/${tradeId}',
        params: ['tradeId'],
      },
      { name: 'get_positions', desc: 'Get positions', endpoint: '/positions' },
      {
        name: 'get_market_data',
        desc: 'Get market data',
        endpoint: '/marketdata/${instrument}',
        params: ['instrument'],
      },
    ],
  },
  frontarena: {
    name: 'FrontArena',
    env: ['FRONTARENA_BASE_URL', 'FRONTARENA_USERNAME', 'FRONTARENA_PASSWORD'],
    baseUrl: '${BASE_URL}/api/v1',
    authType: 'basic',
    tools: [
      { name: 'list_instruments', desc: 'List instruments', endpoint: '/instruments' },
      {
        name: 'get_instrument',
        desc: 'Get instrument details',
        endpoint: '/instruments/${instrumentId}',
        params: ['instrumentId'],
      },
      { name: 'list_trades', desc: 'List trades', endpoint: '/trades' },
      {
        name: 'get_portfolio',
        desc: 'Get portfolio',
        endpoint: '/portfolios/${portfolioId}',
        params: ['portfolioId'],
      },
    ],
  },
  simcorp: {
    name: 'SimCorp Dimension',
    env: ['SIMCORP_BASE_URL', 'SIMCORP_USERNAME', 'SIMCORP_PASSWORD'],
    baseUrl: '${BASE_URL}/api/v1',
    authType: 'basic',
    tools: [
      { name: 'list_portfolios', desc: 'List portfolios', endpoint: '/portfolios' },
      {
        name: 'get_portfolio',
        desc: 'Get portfolio details',
        endpoint: '/portfolios/${portfolioId}',
        params: ['portfolioId'],
      },
      {
        name: 'get_holdings',
        desc: 'Get holdings',
        endpoint: '/portfolios/${portfolioId}/holdings',
        params: ['portfolioId'],
      },
      { name: 'list_instruments', desc: 'List instruments', endpoint: '/instruments' },
    ],
  },
  'charles-river': {
    name: 'Charles River IMS',
    env: ['CHARLES_RIVER_BASE_URL', 'CHARLES_RIVER_API_KEY'],
    baseUrl: '${BASE_URL}/api/v2',
    authHeader: { 'X-API-Key': '${TOKEN}' },
    tools: [
      { name: 'list_orders', desc: 'List orders', endpoint: '/orders' },
      {
        name: 'get_order',
        desc: 'Get order details',
        endpoint: '/orders/${orderId}',
        params: ['orderId'],
      },
      { name: 'list_portfolios', desc: 'List portfolios', endpoint: '/portfolios' },
      { name: 'get_compliance', desc: 'Get compliance results', endpoint: '/compliance/results' },
    ],
  },
  'blackrock-aladdin': {
    name: 'BlackRock Aladdin',
    env: ['ALADDIN_BASE_URL', 'ALADDIN_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_portfolios', desc: 'List portfolios', endpoint: '/portfolios' },
      {
        name: 'get_portfolio',
        desc: 'Get portfolio details',
        endpoint: '/portfolios/${portfolioId}',
        params: ['portfolioId'],
      },
      {
        name: 'get_risk_analytics',
        desc: 'Get risk analytics',
        endpoint: '/risk/analytics/${portfolioId}',
        params: ['portfolioId'],
      },
      {
        name: 'get_exposures',
        desc: 'Get portfolio exposures',
        endpoint: '/portfolios/${portfolioId}/exposures',
        params: ['portfolioId'],
      },
    ],
  },
  // ── ERP ──
  'sap-s4hana': {
    name: 'SAP S/4HANA',
    env: ['SAP_S4_BASE_URL', 'SAP_S4_USERNAME', 'SAP_S4_PASSWORD'],
    baseUrl: '${BASE_URL}/sap/opu/odata/sap',
    authType: 'basic',
    tools: [
      {
        name: 'list_sales_orders',
        desc: 'List sales orders',
        endpoint: '/API_SALES_ORDER_SRV/A_SalesOrder',
      },
      {
        name: 'get_sales_order',
        desc: 'Get sales order details',
        endpoint: "/API_SALES_ORDER_SRV/A_SalesOrder('${orderId}')",
        params: ['orderId'],
      },
      {
        name: 'list_purchase_orders',
        desc: 'List purchase orders',
        endpoint: '/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder',
      },
      {
        name: 'list_business_partners',
        desc: 'List business partners',
        endpoint: '/API_BUSINESS_PARTNER/A_BusinessPartner',
      },
      { name: 'list_materials', desc: 'List materials', endpoint: '/API_PRODUCT_SRV/A_Product' },
    ],
  },
  // ── ENTERPRISE ──
  'sap-enterprise': {
    name: 'SAP Enterprise',
    env: ['SAP_BASE_URL', 'SAP_USERNAME', 'SAP_PASSWORD'],
    baseUrl: '${BASE_URL}/sap/opu/odata/sap',
    authType: 'basic',
    tools: [
      {
        name: 'query',
        desc: 'Execute OData query',
        endpoint: '/${service}/${entity}',
        params: ['service', 'entity'],
      },
      {
        name: 'get_entity',
        desc: 'Get entity by key',
        endpoint: "/${service}/${entity}('${key}')",
        params: ['service', 'entity', 'key'],
      },
      { name: 'list_services', desc: 'List available OData services', endpoint: '/' },
    ],
  },
  accenture: {
    name: 'Accenture',
    env: ['ACCENTURE_BASE_URL', 'ACCENTURE_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { 'X-API-Key': '${TOKEN}' },
    tools: [
      { name: 'list_projects', desc: 'List projects', endpoint: '/projects' },
      {
        name: 'get_project',
        desc: 'Get project details',
        endpoint: '/projects/${projectId}',
        params: ['projectId'],
      },
      { name: 'list_resources', desc: 'List resources', endpoint: '/resources' },
    ],
  },
  broadcom: {
    name: 'Broadcom',
    env: ['BROADCOM_BASE_URL', 'BROADCOM_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_devices', desc: 'List devices', endpoint: '/devices' },
      {
        name: 'get_device',
        desc: 'Get device details',
        endpoint: '/devices/${deviceId}',
        params: ['deviceId'],
      },
      { name: 'list_alerts', desc: 'List alerts', endpoint: '/alerts' },
    ],
  },
  'dxc-technology': {
    name: 'DXC Technology',
    env: ['DXC_BASE_URL', 'DXC_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_services', desc: 'List services', endpoint: '/services' },
      {
        name: 'get_service',
        desc: 'Get service details',
        endpoint: '/services/${serviceId}',
        params: ['serviceId'],
      },
      { name: 'list_incidents', desc: 'List incidents', endpoint: '/incidents' },
    ],
  },
  infosys: {
    name: 'Infosys',
    env: ['INFOSYS_BASE_URL', 'INFOSYS_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_projects', desc: 'List projects', endpoint: '/projects' },
      {
        name: 'get_project',
        desc: 'Get project details',
        endpoint: '/projects/${projectId}',
        params: ['projectId'],
      },
    ],
  },
  'micro-focus': {
    name: 'Micro Focus',
    env: ['MICRO_FOCUS_BASE_URL', 'MICRO_FOCUS_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_projects', desc: 'List projects', endpoint: '/projects' },
      {
        name: 'get_project',
        desc: 'Get project details',
        endpoint: '/projects/${projectId}',
        params: ['projectId'],
      },
      { name: 'list_defects', desc: 'List defects', endpoint: '/defects' },
    ],
  },
  opentext: {
    name: 'OpenText',
    env: ['OPENTEXT_BASE_URL', 'OPENTEXT_USERNAME', 'OPENTEXT_PASSWORD'],
    baseUrl: '${BASE_URL}/api/v2',
    authType: 'basic',
    tools: [
      { name: 'list_nodes', desc: 'List content nodes', endpoint: '/nodes' },
      {
        name: 'get_node',
        desc: 'Get node details',
        endpoint: '/nodes/${nodeId}',
        params: ['nodeId'],
      },
      {
        name: 'search',
        desc: 'Search content',
        endpoint: '/search?where_name=contains_${query}',
        params: ['query'],
      },
    ],
  },
  'progress-software': {
    name: 'Progress Software',
    env: ['PROGRESS_BASE_URL', 'PROGRESS_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_applications', desc: 'List applications', endpoint: '/applications' },
      {
        name: 'get_application',
        desc: 'Get application details',
        endpoint: '/applications/${appId}',
        params: ['appId'],
      },
    ],
  },
  tcs: {
    name: 'TCS',
    env: ['TCS_BASE_URL', 'TCS_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_projects', desc: 'List projects', endpoint: '/projects' },
      {
        name: 'get_project',
        desc: 'Get project details',
        endpoint: '/projects/${projectId}',
        params: ['projectId'],
      },
    ],
  },
  wipro: {
    name: 'Wipro',
    env: ['WIPRO_BASE_URL', 'WIPRO_API_KEY'],
    baseUrl: '${BASE_URL}/api/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_services', desc: 'List services', endpoint: '/services' },
      {
        name: 'get_service',
        desc: 'Get service details',
        endpoint: '/services/${serviceId}',
        params: ['serviceId'],
      },
    ],
  },
  // ── LEGACY / MAINFRAME ──
  'ach-mainframe': {
    name: 'ACH Mainframe',
    env: ['ACH_HOST', 'ACH_PORT', 'ACH_USERNAME', 'ACH_PASSWORD'],
    tools: [
      { name: 'list_batches', desc: 'List ACH batches', endpoint: '/batches' },
      {
        name: 'get_batch',
        desc: 'Get batch details',
        endpoint: '/batches/${batchId}',
        params: ['batchId'],
      },
      { name: 'list_transactions', desc: 'List transactions', endpoint: '/transactions' },
    ],
  },
  'chips-mainframe': {
    name: 'CHIPS Mainframe',
    env: ['CHIPS_HOST', 'CHIPS_PORT', 'CHIPS_USERNAME', 'CHIPS_PASSWORD'],
    tools: [
      { name: 'list_messages', desc: 'List CHIPS messages', endpoint: '/messages' },
      {
        name: 'get_message',
        desc: 'Get message details',
        endpoint: '/messages/${messageId}',
        params: ['messageId'],
      },
      { name: 'list_participants', desc: 'List participants', endpoint: '/participants' },
    ],
  },
  'cobol-banking': {
    name: 'COBOL Banking',
    env: ['COBOL_HOST', 'COBOL_PORT', 'COBOL_USERNAME', 'COBOL_PASSWORD'],
    tools: [
      { name: 'list_accounts', desc: 'List accounts', endpoint: '/accounts' },
      {
        name: 'get_account',
        desc: 'Get account details',
        endpoint: '/accounts/${accountId}',
        params: ['accountId'],
      },
      {
        name: 'list_transactions',
        desc: 'List transactions',
        endpoint: '/accounts/${accountId}/transactions',
        params: ['accountId'],
      },
    ],
  },
  'fis-profile': {
    name: 'FIS Profile',
    env: ['FIS_PROFILE_BASE_URL', 'FIS_PROFILE_USERNAME', 'FIS_PROFILE_PASSWORD'],
    baseUrl: '${BASE_URL}/api/v1',
    authType: 'basic',
    tools: [
      {
        name: 'get_account',
        desc: 'Get account information',
        endpoint: '/accounts/${accountId}',
        params: ['accountId'],
      },
      {
        name: 'list_transactions',
        desc: 'List transactions',
        endpoint: '/accounts/${accountId}/transactions',
        params: ['accountId'],
      },
      {
        name: 'get_customer',
        desc: 'Get customer profile',
        endpoint: '/customers/${customerId}',
        params: ['customerId'],
      },
    ],
  },
  'fis-world': {
    name: 'FIS World',
    env: ['FIS_WORLD_BASE_URL', 'FIS_WORLD_USERNAME', 'FIS_WORLD_PASSWORD'],
    baseUrl: '${BASE_URL}/api/v1',
    authType: 'basic',
    tools: [
      { name: 'list_accounts', desc: 'List accounts', endpoint: '/accounts' },
      {
        name: 'get_account',
        desc: 'Get account details',
        endpoint: '/accounts/${accountId}',
        params: ['accountId'],
      },
      { name: 'list_loans', desc: 'List loans', endpoint: '/loans' },
    ],
  },
  'ibm-cics': {
    name: 'IBM CICS',
    env: ['CICS_BASE_URL', 'CICS_USERNAME', 'CICS_PASSWORD'],
    baseUrl: '${BASE_URL}/CICSSystemManagement',
    authType: 'basic',
    tools: [
      { name: 'list_programs', desc: 'List programs', endpoint: '/CICSProgram' },
      { name: 'list_transactions', desc: 'List transactions', endpoint: '/CICSLocalTransaction' },
      { name: 'list_regions', desc: 'List regions', endpoint: '/CICSRegion' },
      { name: 'get_status', desc: 'Get system status', endpoint: '/CICSManagedSystem' },
    ],
  },
  'ibm-ims': {
    name: 'IBM IMS',
    env: ['IMS_BASE_URL', 'IMS_USERNAME', 'IMS_PASSWORD'],
    baseUrl: '${BASE_URL}/ims/rest/v1',
    authType: 'basic',
    tools: [
      { name: 'list_programs', desc: 'List programs', endpoint: '/pgm' },
      { name: 'list_transactions', desc: 'List transactions', endpoint: '/tran' },
      {
        name: 'query_database',
        desc: 'Query IMS database',
        endpoint: '/query',
        method: 'POST',
        body: ['psbName', 'databaseName', 'segments'],
      },
    ],
  },
  'jde-oneworld': {
    name: 'JD Edwards OneWorld',
    env: ['JDE_BASE_URL', 'JDE_USERNAME', 'JDE_PASSWORD'],
    baseUrl: '${BASE_URL}/jderest/v3',
    authType: 'basic',
    tools: [
      {
        name: 'query',
        desc: 'Execute a query',
        endpoint: '/dataservice',
        method: 'POST',
        body: ['tableName', 'outputFields', 'query'],
      },
      { name: 'list_tables', desc: 'List available tables', endpoint: '/tables' },
      {
        name: 'get_address_book',
        desc: 'Get address book entries',
        endpoint: '/dataservice',
        method: 'POST',
      },
    ],
  },
  'jde-world': {
    name: 'JD Edwards World',
    env: ['JDE_WORLD_HOST', 'JDE_WORLD_USERNAME', 'JDE_WORLD_PASSWORD'],
    tools: [
      {
        name: 'query',
        desc: 'Execute a query',
        endpoint: '/query',
        method: 'POST',
        body: ['file', 'fields', 'selection'],
      },
      { name: 'list_files', desc: 'List available files', endpoint: '/files' },
    ],
  },
  'oracle-ebs': {
    name: 'Oracle E-Business Suite',
    env: ['ORACLE_EBS_BASE_URL', 'ORACLE_EBS_USERNAME', 'ORACLE_EBS_PASSWORD'],
    baseUrl: '${BASE_URL}/webservices/rest',
    authType: 'basic',
    tools: [
      { name: 'list_modules', desc: 'List EBS modules', endpoint: '/modules' },
      {
        name: 'query',
        desc: 'Query a module',
        endpoint: '/${module}/query',
        method: 'POST',
        params: ['module'],
        body: ['filters'],
      },
      {
        name: 'get_record',
        desc: 'Get record by ID',
        endpoint: '/${module}/${recordId}',
        params: ['module', 'recordId'],
      },
    ],
  },
  'peoplesoft-financials': {
    name: 'PeopleSoft Financials',
    env: ['PEOPLESOFT_FIN_BASE_URL', 'PEOPLESOFT_FIN_USERNAME', 'PEOPLESOFT_FIN_PASSWORD'],
    baseUrl: '${BASE_URL}/PSIGW/RESTListeningConnector/PSFT_FIN',
    authType: 'basic',
    tools: [
      { name: 'list_journals', desc: 'List journal entries', endpoint: '/journals' },
      {
        name: 'get_journal',
        desc: 'Get journal details',
        endpoint: '/journals/${journalId}',
        params: ['journalId'],
      },
      { name: 'list_vouchers', desc: 'List vouchers', endpoint: '/vouchers' },
      { name: 'list_po', desc: 'List purchase orders', endpoint: '/purchaseorders' },
    ],
  },
  'sap-r2': {
    name: 'SAP R/2',
    env: ['SAP_R2_HOST', 'SAP_R2_SYSNR', 'SAP_R2_CLIENT', 'SAP_R2_USERNAME', 'SAP_R2_PASSWORD'],
    tools: [
      { name: 'call_rfc', desc: 'Call an RFC function', body: ['functionName', 'params'] },
      { name: 'list_tables', desc: 'List database tables', body: ['pattern'] },
      { name: 'read_table', desc: 'Read table data', body: ['tableName', 'fields', 'filter'] },
    ],
  },
  'sap-r3': {
    name: 'SAP R/3',
    env: ['SAP_R3_HOST', 'SAP_R3_SYSNR', 'SAP_R3_CLIENT', 'SAP_R3_USERNAME', 'SAP_R3_PASSWORD'],
    tools: [
      { name: 'call_rfc', desc: 'Call an RFC function', body: ['functionName', 'params'] },
      { name: 'list_tables', desc: 'List database tables', body: ['pattern'] },
      { name: 'read_table', desc: 'Read table data', body: ['tableName', 'fields', 'filter'] },
    ],
  },
  'swift-fin': {
    name: 'SWIFT Financial Messaging',
    env: ['SWIFT_BASE_URL', 'SWIFT_API_KEY', 'SWIFT_CERTIFICATE'],
    baseUrl: '${BASE_URL}/swift/v1',
    authHeader: { Authorization: 'Bearer ${TOKEN}' },
    tools: [
      { name: 'list_messages', desc: 'List SWIFT messages', endpoint: '/messages' },
      {
        name: 'get_message',
        desc: 'Get message details',
        endpoint: '/messages/${messageId}',
        params: ['messageId'],
      },
      {
        name: 'send_message',
        desc: 'Send a SWIFT message',
        endpoint: '/messages',
        method: 'POST',
        body: ['messageType', 'sender', 'receiver', 'content'],
      },
    ],
  },
  'temenos-t24': {
    name: 'Temenos T24',
    env: ['T24_BASE_URL', 'T24_USERNAME', 'T24_PASSWORD'],
    baseUrl: '${BASE_URL}/api/v1.0.0',
    authType: 'basic',
    tools: [
      { name: 'list_customers', desc: 'List customers', endpoint: '/party/customers' },
      {
        name: 'get_customer',
        desc: 'Get customer details',
        endpoint: '/party/customers/${customerId}',
        params: ['customerId'],
      },
      { name: 'list_accounts', desc: 'List accounts', endpoint: '/holdings/accounts' },
      {
        name: 'get_account',
        desc: 'Get account details',
        endpoint: '/holdings/accounts/${accountId}',
        params: ['accountId'],
      },
    ],
  },
  'unisys-clearpath': {
    name: 'Unisys ClearPath',
    env: ['CLEARPATH_HOST', 'CLEARPATH_PORT', 'CLEARPATH_USERNAME', 'CLEARPATH_PASSWORD'],
    tools: [
      { name: 'query', desc: 'Execute a query', body: ['command'] },
      { name: 'list_programs', desc: 'List programs', endpoint: '/programs' },
      { name: 'get_status', desc: 'Get system status', endpoint: '/status' },
    ],
  },
  // ── DOCUMENT MANAGEMENT ──
  // (box, documentum, ibm-filenet, sharepoint already exist)
};

// ── Generator functions ─────────────────────────────────────────────

function toEnvName(name) {
  return name.replace(/-/g, '_').toUpperCase();
}

function toPascal(name) {
  return name
    .split('-')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

function generatePackageJson(systemType, displayName) {
  return (
    JSON.stringify(
      {
        name: `@velanova/mcp-server-${systemType}`,
        version: '1.0.0',
        description: `MCP server for ${displayName}`,
        type: 'module',
        main: 'dist/index.js',
        scripts: {
          build: 'tsc',
          watch: 'tsc --watch',
          start: 'node dist/index.js',
        },
        dependencies: {
          '@modelcontextprotocol/sdk': '^1.0.0',
          axios: '^1.6.7',
        },
        devDependencies: {
          typescript: '^5.3.3',
        },
      },
      null,
      2
    ) + '\n'
  );
}

function generateTsConfig() {
  return (
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          outDir: './dist',
          rootDir: './src',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          declaration: true,
        },
        include: ['src/**/*'],
      },
      null,
      2
    ) + '\n'
  );
}

function generateIndexTs(systemType, config) {
  const envVars = config.env || [];
  const displayName = config.name;
  const tools = config.tools || [];

  // Build env check
  const envChecks = envVars
    .map(e => `  if (!process.env.${e}) console.error('Warning: ${e} not set');`)
    .join('\n');
  const envLog = envVars
    .map(e => `  console.error('  ${e}: ' + (process.env.${e} ? 'Set' : 'Not set'));`)
    .join('\n');

  // Primary env var for auth
  const primaryToken = envVars[0] || `${toEnvName(systemType)}_API_KEY`;

  // Build tool definitions
  const toolDefs = tools
    .map(t => {
      const properties = {};
      const required = [];
      if (t.params) {
        t.params.forEach(p => {
          properties[p] = { type: 'string', description: `The ${p}` };
          required.push(p);
        });
      }
      if (t.body) {
        t.body.forEach(p => {
          properties[p] = { type: 'string', description: `The ${p}` };
        });
      }
      return `    {
      name: '${t.name}',
      description: '${t.desc}',
      inputSchema: {
        type: 'object' as const,
        properties: ${JSON.stringify(properties)},
        ${required.length > 0 ? `required: ${JSON.stringify(required)},` : ''}
      },
    }`;
    })
    .join(',\n');

  // Build tool handlers
  const toolCases = tools
    .map(t => {
      const endpoint = t.endpoint || `/${t.name}`;
      const method = (t.method || 'GET').toLowerCase();

      if (method === 'get') {
        let ep = endpoint;
        if (t.params) {
          t.params.forEach(p => {
            ep = ep.replace('${' + p + '}', `\${a.${p}}`);
          });
        }
        return `      case '${t.name}':
        return safeCall(() => api.get(\`${ep}\`));`;
      } else {
        let ep = endpoint;
        if (t.params) {
          t.params.forEach(p => {
            ep = ep.replace('${' + p + '}', `\${a.${p}}`);
          });
        }
        const bodyArg = t.body ? `{ ${t.body.map(b => `${b}: a.${b}`).join(', ')} }` : '{}';
        return `      case '${t.name}':
        return safeCall(() => api.${method}(\`${ep}\`, ${bodyArg}));`;
      }
    })
    .join('\n');

  return `#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

let api: AxiosInstance;

function initConnection(): void {
${envChecks}

  api = axios.create({
    baseURL: process.env.${(envVars.length > 0 && envVars.find(e => e.includes('BASE_URL') || e.includes('HOST') || e.includes('URL') || e.includes('DOMAIN'))) || primaryToken} || 'https://api.example.com',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: \`Bearer \${process.env.${primaryToken} || ''}\`,
    },
    timeout: 30000,
  });
}

const tools = [
${toolDefs}
  ];

async function safeCall(fn: () => Promise<any>): Promise<{ content: { type: 'text'; text: string }[] }> {
  try {
    const response = await fn();
    return { content: [{ type: 'text' as const, text: JSON.stringify(response.data, null, 2) }] };
  } catch (err: any) {
    const msg = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
    return { content: [{ type: 'text' as const, text: \`Error: \${msg}\` }] };
  }
}

async function main(): Promise<void> {
  initConnection();

  const server = new Server(
    { name: '${systemType}-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const a = (args || {}) as Record<string, any>;
    switch (name) {
${toolCases}
      default:
        return { content: [{ type: 'text' as const, text: \`Unknown tool: \${name}\` }] };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('${displayName} MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
`;
}

// ── Main execution ──────────────────────────────────────────────────

let created = 0;
let skipped = 0;

for (const [systemType, config] of Object.entries(CONNECTORS)) {
  const dir = path.join(BASE, systemType);

  if (fs.existsSync(path.join(dir, 'src', 'index.ts'))) {
    skipped++;
    continue;
  }

  // Create directory structure
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true });

  // Write files
  fs.writeFileSync(path.join(dir, 'package.json'), generatePackageJson(systemType, config.name));
  fs.writeFileSync(path.join(dir, 'tsconfig.json'), generateTsConfig());
  fs.writeFileSync(path.join(dir, 'src', 'index.ts'), generateIndexTs(systemType, config));

  created++;
  process.stdout.write(`✅ ${systemType}\n`);
}

console.log(`\nDone! Created: ${created}, Skipped (already exist): ${skipped}`);
