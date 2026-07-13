#!/usr/bin/env node
/**
 * Register all MCP servers in the 4 config files.
 * Reads each server's src/index.ts to extract env vars and generates
 * the exact code additions needed.
 */

const fs = require('fs');
const path = require('path');

const MCP_DIR = path.join(__dirname, '..', 'packages', 'mcp-servers');

// Already registered servers (from reading the config files)
const ALREADY_REGISTERED = new Set([
  'postgresql',
  'mysql',
  'oracle',
  'sqlserver',
  'sap-hana',
  'mongodb',
  'mariadb',
  'redis',
  'elasticsearch',
  'cassandra',
  'couchdb',
  'neo4j',
  'dynamodb',
  'salesforce',
  'hubspot',
  'oracle-siebel',
  'dynamics365',
  'servicenow',
  'jira',
  'zendesk',
  'netsuite',
  'infor-cloudsuite',
  'jd-edwards',
  'epicor',
  'sage-intacct',
  'oracle-peoplesoft',
  'oracle-opera',
  'workday',
  'sap-successfactors',
  'adp',
  'ukg-kronos',
  'sap-concur',
  'epic-fhir',
  'cerner',
  'meditech',
  'allscripts',
  'guidewire',
  'duck-creek',
  'applied-epic',
  'manhattan-associates',
  'blue-yonder',
  'descartes',
  'fis',
  'finastra',
  'temenos',
  'blackline',
  'quickbooks',
  'shopify',
  'magento',
  'amdocs',
  'ericsson-bss',
  'sharepoint',
  'documentum',
  'ibm-filenet',
  'box',
  'cgi-momentum',
  'tyler-technologies',
  'ellucian-banner',
  'ibm-maximo',
  'ibm-tririga',
  'ge-predix',
  'sap-ariba',
  'coupa',
  'as400',
  'trello',
  'sqlite',
]);

// Get all server directories
const allServers = fs.readdirSync(MCP_DIR).filter(d => {
  const stat = fs.statSync(path.join(MCP_DIR, d));
  return stat.isDirectory() && fs.existsSync(path.join(MCP_DIR, d, 'dist', 'index.js'));
});

// Filter to only new (unregistered) servers
const newServers = allServers.filter(s => !ALREADY_REGISTERED.has(s));
console.log(`Found ${newServers.length} new servers to register:\n${newServers.join(', ')}\n`);

// Extract env vars from each server's src/index.ts
function extractEnvVars(serverName) {
  const srcPath = path.join(MCP_DIR, serverName, 'src', 'index.ts');
  if (!fs.existsSync(srcPath)) return [];
  const content = fs.readFileSync(srcPath, 'utf8');
  // Match process.env.SOMETHING
  const matches = content.match(/process\.env\.([A-Z_0-9]+)/g) || [];
  const envVars = [...new Set(matches.map(m => m.replace('process.env.', '')))];
  return envVars;
}

// Generate a camelCase field name from env var
function envToFieldName(envVar) {
  // e.g. SLACK_BOT_TOKEN -> botToken, ASANA_ACCESS_TOKEN -> accessToken
  const parts = envVar.split('_');
  // Remove prefix (first word or two)
  // Find the meaningful parts after the prefix
  const lower = parts.map((p, i) =>
    i === 0 ? p.toLowerCase() : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
  );
  return lower.join('');
}

// Smarter field name extraction - remove the server prefix from env var
function smartFieldName(envVar, serverName) {
  const prefix = serverName.toUpperCase().replace(/-/g, '_');
  let varName = envVar;

  // Common prefixes to strip
  const prefixes = [prefix + '_', 'AWS_', 'AZURE_', 'GOOGLE_', 'GCP_'];
  for (const p of prefixes) {
    if (varName.startsWith(p) && varName.length > p.length) {
      varName = varName.substring(p.length);
      break;
    }
  }

  // Convert to camelCase
  const parts = varName.toLowerCase().split('_');
  return parts.map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1))).join('');
}

// Build data for each new server
const serverData = newServers.map(name => {
  const envVars = extractEnvVars(name);
  const envMapping = {};
  envVars.forEach(ev => {
    const field = smartFieldName(ev, name);
    envMapping[field] = ev;
  });
  // Pick the first env var as the primary envKey for mcp-client.ts
  const primaryEnvKey = envVars[0] || `${name.toUpperCase().replace(/-/g, '_')}_API_KEY`;
  return { name, envVars, envMapping, primaryEnvKey };
});

// ═══════════════════════════════════════════════════════════════
// 1. Generate types.ts additions (LegacySystemType union members)
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 1. types.ts - LegacySystemType additions ═══\n');
// Group by category for readability
const categories = {
  'Project Management': [
    'asana',
    'monday-com',
    'clickup',
    'linear',
    'wrike',
    'smartsheet',
    'basecamp',
  ],
  Communication: [
    'slack',
    'ms-teams',
    'notion',
    'confluence',
    'zoom',
    'google-meet',
    'google-workspace',
    'dropbox-business',
  ],
  CRM: [
    'zoho-crm',
    'pipedrive',
    'freshsales',
    'sugarcrm',
    'insightly',
    'copper-crm',
    'close-crm',
    'capsule-crm',
    'apptivo',
    'bitrix24',
    'keap',
    'nimble',
    'creatio',
    'zendesk-sell',
    'peoplesoft-crm',
  ],
  HCM: ['bamboohr', 'gusto', 'rippling', 'deel'],
  'Cloud Databases': [
    'amazon-aurora',
    'aws-rds',
    'azure-sql',
    'google-cloud-sql',
    'cockroachdb',
    'neon',
    'planetscale',
    'supabase',
    'firestore',
    'influxdb',
  ],
  'Data Warehouses': [
    'snowflake',
    'bigquery',
    'redshift',
    'databricks',
    'azure-synapse',
    'teradata',
    'dremio',
    'starburst',
    'firebolt',
  ],
  'BI & Analytics': ['tableau', 'power-bi', 'looker', 'qlik', 'cognos', 'crystal-reports', 'brio'],
  Commerce: ['bigcommerce', 'woocommerce', 'squarespace', 'prestashop', 'stripe'],
  DevTools: ['github', 'gitlab', 'bitbucket', 'jenkins'],
  'Identity & Access': ['okta', 'active-directory', 'jumpcloud'],
  Finance: ['freshbooks', 'xero', 'hyperion'],
  'Financial Markets': [
    'bloomberg-terminal',
    'reuters-3000',
    'murex',
    'calypso',
    'frontarena',
    'simcorp',
    'charles-river',
    'blackrock-aladdin',
  ],
  ERP: ['sap-s4hana', 'sap-enterprise'],
  'Enterprise Consulting': [
    'accenture',
    'broadcom',
    'dxc-technology',
    'infosys',
    'micro-focus',
    'opentext',
    'progress-software',
    'tcs',
    'wipro',
  ],
  'Legacy/Mainframe': [
    'ach-mainframe',
    'chips-mainframe',
    'cobol-banking',
    'fis-profile',
    'fis-world',
    'ibm-cics',
    'ibm-ims',
    'jde-oneworld',
    'jde-world',
    'oracle-ebs',
    'peoplesoft-financials',
    'sap-r2',
    'sap-r3',
    'swift-fin',
    'temenos-t24',
    'unisys-clearpath',
  ],
};

let typesAddition = '';
for (const [cat, servers] of Object.entries(categories)) {
  typesAddition += `  // ${cat}\n`;
  for (const s of servers) {
    typesAddition += `  | '${s}'\n`;
  }
}

// ═══════════════════════════════════════════════════════════════
// 2. Generate connection-env-map.ts additions
// ═══════════════════════════════════════════════════════════════
console.log('═══ 2. connection-env-map.ts additions ═══\n');
let envMapAddition = '';
for (const { name, envMapping } of serverData) {
  const entries = Object.entries(envMapping);
  if (entries.length === 0) continue;
  if (entries.length <= 2) {
    envMapAddition += `  '${name}': { ${entries.map(([k, v]) => `${k}: '${v}'`).join(', ')} },\n`;
  } else {
    envMapAddition += `  '${name}': {\n`;
    for (const [field, envVar] of entries) {
      envMapAddition += `    ${field}: '${envVar}',\n`;
    }
    envMapAddition += `  },\n`;
  }
}

// ═══════════════════════════════════════════════════════════════
// 3. Generate mcp-client.ts additions (type union, serverPackages, localServerPaths)
// ═══════════════════════════════════════════════════════════════
console.log('═══ 3. mcp-client.ts additions ═══\n');

let typeUnionAddition = '';
for (const { name } of serverData) {
  typeUnionAddition += `    | '${name}'\n`;
}

let serverPackagesAddition = '';
for (const { name, primaryEnvKey } of serverData) {
  serverPackagesAddition += `    '${name}': { command: 'node', args: [], envKey: '${primaryEnvKey}' },\n`;
}

let localPathsAddition = '';
for (const { name } of serverData) {
  localPathsAddition += `    '${name}': '../../../../../packages/mcp-servers/${name}/dist/index.js',\n`;
}

// ═══════════════════════════════════════════════════════════════
// 4. Generate mcp-manager.ts additions
// ═══════════════════════════════════════════════════════════════
console.log('═══ 4. mcp-manager.ts additions ═══\n');
let managerAddition = '';
for (const { name } of serverData) {
  managerAddition += `    '${name}': {\n      type: 'npm',\n      localPath: '../../../../../packages/mcp-servers/${name}/dist/index.js',\n      available: true,\n    },\n`;
}

// ═══════════════════════════════════════════════════════════════
// Write the additions to temp files for review
// ═══════════════════════════════════════════════════════════════
const outputDir = path.join(__dirname, '..', 'scripts', 'config-additions');
fs.mkdirSync(outputDir, { recursive: true });

fs.writeFileSync(path.join(outputDir, 'types-addition.txt'), typesAddition);
fs.writeFileSync(path.join(outputDir, 'env-map-addition.txt'), envMapAddition);
fs.writeFileSync(path.join(outputDir, 'client-type-union.txt'), typeUnionAddition);
fs.writeFileSync(path.join(outputDir, 'client-server-packages.txt'), serverPackagesAddition);
fs.writeFileSync(path.join(outputDir, 'client-local-paths.txt'), localPathsAddition);
fs.writeFileSync(path.join(outputDir, 'manager-addition.txt'), managerAddition);

console.log(`\nGenerated config addition files in ${outputDir}/`);
console.log(`- types-addition.txt (${typesAddition.split('\n').length} lines)`);
console.log(`- env-map-addition.txt (${envMapAddition.split('\n').length} lines)`);
console.log(`- client-type-union.txt (${typeUnionAddition.split('\n').length} lines)`);
console.log(`- client-server-packages.txt (${serverPackagesAddition.split('\n').length} lines)`);
console.log(`- client-local-paths.txt (${localPathsAddition.split('\n').length} lines)`);
console.log(`- manager-addition.txt (${managerAddition.split('\n').length} lines)`);

// ═══════════════════════════════════════════════════════════════
// Now apply the changes directly to the config files
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ APPLYING CHANGES TO CONFIG FILES ═══\n');

// 1. Update types.ts
const typesPath = path.join(__dirname, '..', 'packages', 'shared', 'src', 'types.ts');
let typesContent = fs.readFileSync(typesPath, 'utf8');
const typesInsertPoint = "  | 'trello';";
typesContent = typesContent.replace(typesInsertPoint, `  | 'trello'\n${typesAddition.trimEnd()};`);
fs.writeFileSync(typesPath, typesContent);
console.log('✅ Updated types.ts');

// 2. Update connection-env-map.ts
const envMapPath = path.join(
  __dirname,
  '..',
  'apps',
  'desktop-app',
  'src',
  'main',
  'mcp',
  'connection-env-map.ts'
);
let envMapContent = fs.readFileSync(envMapPath, 'utf8');
const envMapInsertPoint = `  trello: {
    apiKey: 'TRELLO_API_KEY',
    apiToken: 'TRELLO_API_TOKEN',
  },
};`;
envMapContent = envMapContent.replace(
  envMapInsertPoint,
  `  trello: {
    apiKey: 'TRELLO_API_KEY',
    apiToken: 'TRELLO_API_TOKEN',
  },
  // ── New MCP Servers ──
${envMapAddition}};`
);
fs.writeFileSync(envMapPath, envMapContent);
console.log('✅ Updated connection-env-map.ts');

// 3. Update mcp-client.ts - type union
const clientPath = path.join(
  __dirname,
  '..',
  'apps',
  'desktop-app',
  'src',
  'main',
  'mcp',
  'mcp-client.ts'
);
let clientContent = fs.readFileSync(clientPath, 'utf8');

// Insert type union entries before the closing semicolon after trello
const clientTypeInsert = `    | 'trello';`;
clientContent = clientContent.replace(
  clientTypeInsert,
  `    | 'trello'\n    // ── New MCP Servers ──\n${typeUnionAddition.trimEnd()};`
);

// Insert serverPackages entries after trello
const clientPkgInsert = `    trello: { command: 'node', args: [], envKey: 'TRELLO_API_KEY' },
  };`;
clientContent = clientContent.replace(
  clientPkgInsert,
  `    trello: { command: 'node', args: [], envKey: 'TRELLO_API_KEY' },
    // ── New MCP Servers ──
${serverPackagesAddition}  };`
);

// Insert localServerPaths entries after trello
const clientPathInsert = `    trello: '../../../../../packages/mcp-servers/trello/dist/index.js',
  };`;
clientContent = clientContent.replace(
  clientPathInsert,
  `    trello: '../../../../../packages/mcp-servers/trello/dist/index.js',
    // ── New MCP Servers ──
${localPathsAddition}  };`
);

fs.writeFileSync(clientPath, clientContent);
console.log('✅ Updated mcp-client.ts');

// 4. Update mcp-manager.ts
const managerPath = path.join(
  __dirname,
  '..',
  'apps',
  'desktop-app',
  'src',
  'main',
  'mcp',
  'mcp-manager.ts'
);
let managerContent = fs.readFileSync(managerPath, 'utf8');
const managerInsertPoint = `    trello: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/trello/dist/index.js',
      available: true,
    },
  };`;
managerContent = managerContent.replace(
  managerInsertPoint,
  `    trello: {
      type: 'npm',
      localPath: '../../../../../packages/mcp-servers/trello/dist/index.js',
      available: true,
    },
    // ── New MCP Servers ──
${managerAddition}  };`
);
fs.writeFileSync(managerPath, managerContent);
console.log('✅ Updated mcp-manager.ts');

console.log('\n🎉 All 4 config files updated successfully!');
console.log(`Registered ${newServers.length} new MCP servers.`);
