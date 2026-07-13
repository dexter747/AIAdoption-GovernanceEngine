/**
 * User Database Connections Routes
 * CRUD operations for user's database connections (for MCP)
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateJwt } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { encrypt, decrypt, getKeyPreview } from '../services/encryption.js';
import { createSupabaseClient } from '../config/supabase.js';
import { createLogger } from '../utils/logger.js';

const router = Router();
const logger = createLogger('user-connections');

// Supported database types
const SUPPORTED_CONNECTION_TYPES = [
  'postgresql',
  'mysql',
  'mongodb',
  'sqlserver',
  'oracle',
  'sap_hana',
  'mariadb',
  'sqlite',
  'redis',
  'elasticsearch',
  'salesforce',
  'servicenow',
  'jira',
  'zendesk',
  'workday',
];

// Connection type info
const CONNECTION_TYPE_INFO = {
  postgresql: {
    name: 'PostgreSQL',
    icon: '🐘',
    defaultPort: 5432,
    fields: ['host', 'port', 'database', 'username', 'password', 'ssl'],
    mcpPackage: '@modelcontextprotocol/server-postgres',
  },
  mysql: {
    name: 'MySQL',
    icon: '🐬',
    defaultPort: 3306,
    fields: ['host', 'port', 'database', 'username', 'password', 'ssl'],
    mcpPackage: null, // TODO: Add MySQL MCP package
  },
  mongodb: {
    name: 'MongoDB',
    icon: '🍃',
    defaultPort: 27017,
    fields: ['connectionString'],
    mcpPackage: null,
  },
  sqlserver: {
    name: 'SQL Server',
    icon: '🗄️',
    defaultPort: 1433,
    fields: ['host', 'port', 'database', 'username', 'password', 'encrypt'],
    mcpPackage: null,
  },
  oracle: {
    name: 'Oracle',
    icon: '☀️',
    defaultPort: 1521,
    fields: ['host', 'port', 'serviceName', 'username', 'password'],
    mcpPackage: null,
  },
  sap_hana: {
    name: 'SAP HANA',
    icon: '💎',
    defaultPort: 30015,
    fields: ['host', 'port', 'schema', 'username', 'password'],
    mcpPackage: null,
  },
  mariadb: {
    name: 'MariaDB',
    icon: '🦭',
    defaultPort: 3306,
    fields: ['host', 'port', 'database', 'username', 'password', 'ssl'],
    mcpPackage: null,
  },
  sqlite: {
    name: 'SQLite',
    icon: '📦',
    defaultPort: null,
    fields: ['filePath'],
    mcpPackage: '@modelcontextprotocol/server-sqlite',
  },
  redis: {
    name: 'Redis',
    icon: '🔴',
    defaultPort: 6379,
    fields: ['host', 'port', 'password'],
    mcpPackage: null,
  },
  elasticsearch: {
    name: 'Elasticsearch',
    icon: '🔍',
    defaultPort: 9200,
    fields: ['host', 'port', 'username', 'password', 'ssl'],
    mcpPackage: null,
  },
  salesforce: {
    name: 'Salesforce',
    icon: '☁️',
    defaultPort: null,
    fields: ['instanceUrl', 'accessToken', 'refreshToken'],
    mcpPackage: null,
  },
  servicenow: {
    name: 'ServiceNow',
    icon: '🔧',
    defaultPort: null,
    fields: ['instanceUrl', 'username', 'password'],
    mcpPackage: null,
  },
  jira: {
    name: 'Jira',
    icon: '📋',
    defaultPort: null,
    fields: ['cloudId', 'email', 'apiToken'],
    mcpPackage: null,
  },
  zendesk: {
    name: 'Zendesk',
    icon: '🎫',
    defaultPort: null,
    fields: ['subdomain', 'email', 'apiToken'],
    mcpPackage: null,
  },
  workday: {
    name: 'Workday',
    icon: '📊',
    defaultPort: null,
    fields: ['tenant', 'clientId', 'clientSecret'],
    mcpPackage: null,
  },
};

// Validation schemas
const connectionConfigSchema = z
  .object({
    host: z.string().optional(),
    port: z.number().optional(),
    database: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    ssl: z.boolean().optional(),
    connectionString: z.string().optional(),
    filePath: z.string().optional(),
    // Add other fields as needed
  })
  .passthrough(); // Allow additional fields

const addConnectionSchema = z.object({
  name: z.string().min(1).max(100),
  connection_type: z.enum(SUPPORTED_CONNECTION_TYPES),
  config: connectionConfigSchema,
  mcp_server_type: z.enum(['npm', 'docker', 'custom']).optional().default('npm'),
});

const updateConnectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  config: connectionConfigSchema.optional(),
  is_active: z.boolean().optional(),
  mcp_server_type: z.enum(['npm', 'docker', 'custom']).optional(),
});

/**
 * GET /api/user/connections/types
 * List all supported connection types
 */
router.get('/types', (req, res) => {
  const types = SUPPORTED_CONNECTION_TYPES.map(id => ({
    id,
    ...CONNECTION_TYPE_INFO[id],
  }));

  res.json({
    success: true,
    data: types,
  });
});

/**
 * GET /api/user/connections
 * List all user's database connections (without sensitive data)
 */
router.get('/', validateJwt, async (req, res, next) => {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('user_connections')
      .select(
        'id, name, connection_type, is_active, is_connected, last_connected_at, last_error, mcp_server_type, created_at'
      )
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error({ error }, 'Failed to fetch user connections');
      throw new ApiError(500, 'Failed to fetch connections');
    }

    // Add connection type info to each connection
    const connectionsWithInfo = data.map(conn => ({
      ...conn,
      type_info: CONNECTION_TYPE_INFO[conn.connection_type],
    }));

    res.json({
      success: true,
      data: connectionsWithInfo,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/user/connections/:id
 * Get specific connection details (decrypted)
 */
router.get('/:id', validateJwt, async (req, res, next) => {
  try {
    const { id } = req.params;

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('user_connections')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error({ error }, 'Failed to fetch connection');
      throw new ApiError(500, 'Failed to fetch connection');
    }

    if (!data) {
      throw new ApiError(404, 'Connection not found');
    }

    // Decrypt config
    let decryptedConfig = {};
    try {
      decryptedConfig = JSON.parse(decrypt(data.encrypted_config));
      // Mask password for security
      if (decryptedConfig.password) {
        decryptedConfig.password_preview = '••••••••';
        delete decryptedConfig.password;
      }
      if (decryptedConfig.apiToken) {
        decryptedConfig.apiToken_preview = '••••••••';
        delete decryptedConfig.apiToken;
      }
      if (decryptedConfig.accessToken) {
        decryptedConfig.accessToken_preview = '••••••••';
        delete decryptedConfig.accessToken;
      }
    } catch (e) {
      logger.warn({ e }, 'Failed to decrypt config');
    }

    res.json({
      success: true,
      data: {
        ...data,
        encrypted_config: undefined, // Don't send encrypted config
        config: decryptedConfig,
        type_info: CONNECTION_TYPE_INFO[data.connection_type],
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/user/connections
 * Add a new database connection
 */
router.post('/', validateJwt, async (req, res, next) => {
  try {
    const validated = addConnectionSchema.parse(req.body);

    // Encrypt the config (contains sensitive data like passwords)
    const encryptedConfig = encrypt(JSON.stringify(validated.config));

    const supabase = createSupabaseClient();

    // Check if connection name already exists
    const { data: existing } = await supabase
      .from('user_connections')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('name', validated.name)
      .single();

    if (existing) {
      throw new ApiError(409, `Connection "${validated.name}" already exists`);
    }

    // Insert new connection
    const { data, error } = await supabase
      .from('user_connections')
      .insert({
        user_id: req.user.id,
        name: validated.name,
        connection_type: validated.connection_type,
        encrypted_config: encryptedConfig,
        mcp_server_type: validated.mcp_server_type,
        is_active: true,
        is_connected: false,
      })
      .select('id, name, connection_type, is_active, is_connected, mcp_server_type, created_at')
      .single();

    if (error) {
      logger.error({ error }, 'Failed to create connection');
      throw new ApiError(500, 'Failed to create connection');
    }

    logger.info(
      { connectionId: data.id, name: validated.name, type: validated.connection_type },
      'Connection created'
    );

    res.status(201).json({
      success: true,
      message: 'Connection created successfully',
      data: {
        ...data,
        type_info: CONNECTION_TYPE_INFO[data.connection_type],
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/user/connections/:id
 * Update a connection
 */
router.patch('/:id', validateJwt, async (req, res, next) => {
  try {
    const { id } = req.params;
    const validated = updateConnectionSchema.parse(req.body);

    const supabase = createSupabaseClient();

    // Check if connection exists and belongs to user
    const { data: existing } = await supabase
      .from('user_connections')
      .select('id, encrypted_config')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!existing) {
      throw new ApiError(404, 'Connection not found');
    }

    // Build update object
    const updateData = {};

    if (validated.name !== undefined) {
      updateData.name = validated.name;
    }

    if (validated.config !== undefined) {
      // Merge with existing config or replace
      let existingConfig = {};
      try {
        existingConfig = JSON.parse(decrypt(existing.encrypted_config));
      } catch (e) {
        // Ignore decrypt errors
      }

      const newConfig = { ...existingConfig, ...validated.config };
      updateData.encrypted_config = encrypt(JSON.stringify(newConfig));
    }

    if (validated.is_active !== undefined) {
      updateData.is_active = validated.is_active;
    }

    if (validated.mcp_server_type !== undefined) {
      updateData.mcp_server_type = validated.mcp_server_type;
    }

    // Perform update
    const { data, error } = await supabase
      .from('user_connections')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('id, name, connection_type, is_active, is_connected, mcp_server_type, created_at')
      .single();

    if (error) {
      logger.error({ error }, 'Failed to update connection');
      throw new ApiError(500, 'Failed to update connection');
    }

    logger.info({ connectionId: id }, 'Connection updated');

    res.json({
      success: true,
      message: 'Connection updated successfully',
      data: {
        ...data,
        type_info: CONNECTION_TYPE_INFO[data.connection_type],
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/user/connections/:id
 * Delete a connection
 */
router.delete('/:id', validateJwt, async (req, res, next) => {
  try {
    const { id } = req.params;

    const supabase = createSupabaseClient();

    // Check if connection exists and belongs to user
    const { data: existing } = await supabase
      .from('user_connections')
      .select('id, name')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!existing) {
      throw new ApiError(404, 'Connection not found');
    }

    // Delete connection
    const { error } = await supabase
      .from('user_connections')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      logger.error({ error }, 'Failed to delete connection');
      throw new ApiError(500, 'Failed to delete connection');
    }

    logger.info({ connectionId: id, name: existing.name }, 'Connection deleted');

    res.json({
      success: true,
      message: 'Connection deleted successfully',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/user/connections/:id/test
 * Test a database connection
 */
router.post('/:id/test', validateJwt, async (req, res, next) => {
  try {
    const { id } = req.params;

    const supabase = createSupabaseClient();

    // Get connection
    const { data: connection } = await supabase
      .from('user_connections')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!connection) {
      throw new ApiError(404, 'Connection not found');
    }

    // Decrypt config
    let config;
    try {
      config = JSON.parse(decrypt(connection.encrypted_config));
    } catch (e) {
      throw new ApiError(500, 'Failed to decrypt connection config');
    }

    // Test connection based on type
    let testResult = { success: false, message: 'Unknown connection type' };

    if (connection.connection_type === 'postgresql') {
      testResult = await testPostgresConnection(config);
    } else {
      testResult = {
        success: false,
        message: `Testing ${connection.connection_type} is not yet implemented`,
      };
    }

    // Update connection status
    await supabase
      .from('user_connections')
      .update({
        is_connected: testResult.success,
        last_connected_at: testResult.success
          ? new Date().toISOString()
          : connection.last_connected_at,
        last_error: testResult.success ? null : testResult.message,
      })
      .eq('id', id);

    res.json({
      success: testResult.success,
      message: testResult.message,
      data: testResult.details || null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/user/connections/:id/start-mcp
 * Start MCP server for this connection
 */
router.post('/:id/start-mcp', validateJwt, async (req, res, next) => {
  try {
    const { id } = req.params;

    // This will be handled by the MCP orchestrator
    // For now, return a placeholder
    res.json({
      success: true,
      message: 'MCP server start requested',
      data: {
        connectionId: id,
        status: 'pending',
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Test PostgreSQL connection
 */
async function testPostgresConnection(config) {
  // Dynamic import for pg
  try {
    const { default: pg } = await import('pg');
    const { Client } = pg;

    const client = new Client({
      host: config.host,
      port: config.port || 5432,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
    });

    await client.connect();

    // Run a simple query
    const result = await client.query('SELECT version(), current_database()');

    await client.end();

    return {
      success: true,
      message: 'Connection successful',
      details: {
        version: result.rows[0].version,
        database: result.rows[0].current_database,
      },
    };
  } catch (error) {
    logger.error({ error }, 'PostgreSQL connection test failed');
    return {
      success: false,
      message: error.message,
    };
  }
}

export default router;
