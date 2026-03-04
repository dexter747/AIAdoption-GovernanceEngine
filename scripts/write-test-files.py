#!/usr/bin/env python3
"""Write all 7 static-analysis service test files."""
import os

BASE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tests", "services")

files = {}

# ═══════════════════════════════════════════════════════════════════════════════
# 1. nl-to-sql-service.test.ts
# ═══════════════════════════════════════════════════════════════════════════════
files["nl-to-sql-service.test.ts"] = """/**
 * NL-to-SQL Service \u2014 Static Analysis Tests
 *
 * Validates source structure via file-content reading + regex assertions
 * (no dynamic imports, no module mocking).
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const SERVICE_PATH = path.join(ROOT, 'apps', 'express-api', 'src', 'services', 'nl-to-sql-service.js');

describe('NLToSQLService \\u2013 static analysis', () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(SERVICE_PATH, 'utf-8');
  });

  /* \\u2500\\u2500 File existence \\u2500 */

  test('service file exists', () => {
    expect(fs.existsSync(SERVICE_PATH)).toBe(true);
  });

  /* \\u2500\\u2500 Exports \\u2500 */

  test('exports NLToSQLService as named const', () => {
    expect(content).toMatch(/export\\s+const\\s+NLToSQLService\\s*=\\s*\\{/);
  });

  /* \\u2500\\u2500 Method definitions \\u2500 */

  const expectedMethods = [
    'generateSQL',
    'summarizeResults',
    'suggestVisualization',
    'saveQuery',
    'getSavedQueries',
    'toggleFavorite',
    'deleteSavedQuery',
    'recordHistory',
    'getHistory',
    'getHistoryStats',
  ];

  expectedMethods.forEach((method) => {
    test(`defines method: ${method}`, () => {
      const pattern = new RegExp(`(async\\\\s+)?${method}\\\\s*\\\\(`);
      expect(content).toMatch(pattern);
    });
  });

  /* \\u2500\\u2500 Supabase table references \\u2500 */

  const expectedTables = ['saved_queries', 'query_history'];

  expectedTables.forEach((table) => {
    test(`references Supabase table "${table}"`, () => {
      expect(content).toMatch(new RegExp(`from\\\\s*\\\\(\\\\s*['"]${table}['"]\\\\s*\\\\)`));
    });
  });

  test('imports supabase client', () => {
    expect(content).toMatch(/import\\s+\\{.*supabase.*\\}\\s+from/);
  });

  /* \\u2500\\u2500 AI integration \\u2500 */

  test('imports AIService', () => {
    expect(content).toMatch(/import\\s+\\{.*AIService.*\\}\\s+from/);
  });

  test('calls AIService.chat in generateSQL', () => {
    expect(content).toMatch(/AIService\\.chat\\s*\\(/);
  });

  test('generateSQL sends system + user messages', () => {
    expect(content).toMatch(/role:\\s*['"]system['"]/);
    expect(content).toMatch(/role:\\s*['"]user['"]/);
  });

  test('summarizeResults calls AIService.chat (at least 2 chat calls)', () => {
    const matches = content.match(/AIService\\.chat\\s*\\(/g);
    expect(matches && matches.length >= 2).toBe(true);
  });

  /* \\u2500\\u2500 Error handling \\u2500 */

  test('uses try/catch blocks', () => {
    const tryBlocks = content.match(/try\\s*\\{/g);
    expect(tryBlocks && tryBlocks.length >= 1).toBe(true);
  });

  test('has catch blocks for error handling', () => {
    const catchBlocks = content.match(/catch\\s*\\(/g);
    expect(catchBlocks && catchBlocks.length >= 1).toBe(true);
  });

  test('throws descriptive error on AI parse failure', () => {
    expect(content).toMatch(/throw\\s+new\\s+Error\\s*\\(/);
  });

  /* \\u2500\\u2500 AI system prompts \\u2500 */

  test('defines NL_TO_SQL_SYSTEM prompt', () => {
    expect(content).toMatch(/NL_TO_SQL_SYSTEM/);
  });

  test('defines RESULT_SUMMARY_SYSTEM prompt', () => {
    expect(content).toMatch(/RESULT_SUMMARY_SYSTEM/);
  });

  /* \\u2500\\u2500 suggestVisualization logic \\u2500 */

  test('suggestVisualization returns chart type objects', () => {
    expect(content).toMatch(/type:\\s*['"]line['"]/);
    expect(content).toMatch(/type:\\s*['"]pie['"]/);
    expect(content).toMatch(/type:\\s*['"]bar['"]/);
    expect(content).toMatch(/type:\\s*['"]table['"]/);
  });

  /* \\u2500\\u2500 Fallback / safety \\u2500 */

  test('generateSQL parses JSON from AI response', () => {
    expect(content).toMatch(/JSON\\.parse/);
  });

  test('recordHistory gracefully returns null on error', () => {
    expect(content).toMatch(/return\\s+null/);
  });
});
"""

# ═══════════════════════════════════════════════════════════════════════════════
# 2. project-intel-service.test.ts
# ═══════════════════════════════════════════════════════════════════════════════
files["project-intel-service.test.ts"] = """/**
 * Project Intelligence Service \\u2014 Static Analysis Tests
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const SERVICE_PATH = path.join(ROOT, 'apps', 'express-api', 'src', 'services', 'project-intel-service.js');

describe('ProjectIntelService \\u2013 static analysis', () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(SERVICE_PATH, 'utf-8');
  });

  test('service file exists', () => {
    expect(fs.existsSync(SERVICE_PATH)).toBe(true);
  });

  test('exports ProjectIntelService as named const', () => {
    expect(content).toMatch(/export\\s+const\\s+ProjectIntelService\\s*=\\s*\\{/);
  });

  const expectedMethods = [
    'getProjects', 'getProject', 'createProject', 'updateProject', 'deleteProject',
    'getTasks', 'createTask', 'updateTask', 'deleteTask',
    'getRisks', 'createRisk', 'updateRisk',
    'analyzeHealth', 'detectRisks',
    'getInsights', 'dismissInsight', 'getDashboardStats',
  ];

  expectedMethods.forEach((method) => {
    test(`defines method: ${method}`, () => {
      expect(content).toMatch(new RegExp(`(async\\\\s+)?${method}\\\\s*\\\\(`));
    });
  });

  const expectedTables = ['projects', 'project_tasks', 'project_risks', 'project_insights'];
  expectedTables.forEach((table) => {
    test(`references Supabase table "${table}"`, () => {
      expect(content).toMatch(new RegExp(`from\\\\s*\\\\(\\\\s*['"]${table}['"]\\\\s*\\\\)`));
    });
  });

  test('imports supabase client', () => {
    expect(content).toMatch(/import\\s+\\{.*supabase.*\\}\\s+from/);
  });

  test('imports AIService', () => {
    expect(content).toMatch(/import\\s+\\{.*AIService.*\\}\\s+from/);
  });

  test('calls AIService.chat', () => {
    expect(content).toMatch(/AIService\\.chat\\s*\\(/);
  });

  test('analyzeHealth sends system + user messages', () => {
    expect(content).toMatch(/role:\\s*['"]system['"]/);
    expect(content).toMatch(/role:\\s*['"]user['"]/);
  });

  test('analyzeHealth AI call exists (project management AI)', () => {
    expect(content).toMatch(/project management AI/i);
  });

  test('detectRisks AI call exists (risk analyst)', () => {
    expect(content).toMatch(/project risk analyst/i);
  });

  test('at least two AIService.chat calls', () => {
    const matches = content.match(/AIService\\.chat\\s*\\(/g);
    expect(matches && matches.length >= 2).toBe(true);
  });

  test('uses try/catch blocks', () => {
    const tryBlocks = content.match(/try\\s*\\{/g);
    expect(tryBlocks && tryBlocks.length >= 2).toBe(true);
  });

  test('has catch blocks for error handling', () => {
    const catchBlocks = content.match(/catch\\s*\\(/g);
    expect(catchBlocks && catchBlocks.length >= 2).toBe(true);
  });

  test('analyzeHealth has fallback algorithmic score', () => {
    expect(content).toMatch(/healthScore:\\s*score/);
  });

  test('detectRisks returns empty array on failure', () => {
    expect(content).toMatch(/return\\s+\\[\\s*\\]/);
  });

  test('parses JSON from AI response', () => {
    expect(content).toMatch(/JSON\\.parse/);
  });

  test('getDashboardStats returns structured stats', () => {
    expect(content).toMatch(/totalProjects/);
    expect(content).toMatch(/activeProjects/);
    expect(content).toMatch(/totalTasks/);
    expect(content).toMatch(/openRisks/);
  });

  test('getDashboardStats includes projectsByStatus breakdown', () => {
    expect(content).toMatch(/projectsByStatus/);
  });

  test('getDashboardStats includes tasksByStatus breakdown', () => {
    expect(content).toMatch(/tasksByStatus/);
  });
});
"""

# ═══════════════════════════════════════════════════════════════════════════════
# 3. resource-service.test.ts
# ═══════════════════════════════════════════════════════════════════════════════
files["resource-service.test.ts"] = """/**
 * Resource Allocation Service \\u2014 Static Analysis Tests
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const SERVICE_PATH = path.join(ROOT, 'apps', 'express-api', 'src', 'services', 'resource-service.js');

describe('ResourceService \\u2013 static analysis', () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(SERVICE_PATH, 'utf-8');
  });

  test('service file exists', () => {
    expect(fs.existsSync(SERVICE_PATH)).toBe(true);
  });

  test('exports ResourceService as named const', () => {
    expect(content).toMatch(/export\\s+const\\s+ResourceService\\s*=\\s*\\{/);
  });

  const expectedMethods = [
    'getResources', 'createResource', 'updateResource', 'deleteResource',
    'getAllocations', 'createAllocation', 'updateAllocation', 'deleteAllocation',
    'getUtilizationReport', 'optimizeAllocations', 'getDashboard',
  ];

  expectedMethods.forEach((method) => {
    test(`defines method: ${method}`, () => {
      expect(content).toMatch(new RegExp(`(async\\\\s+)?${method}\\\\s*\\\\(`));
    });
  });

  const expectedTables = ['resources', 'resource_allocations'];
  expectedTables.forEach((table) => {
    test(`references Supabase table "${table}"`, () => {
      expect(content).toMatch(new RegExp(`from\\\\s*\\\\(\\\\s*['"]${table}['"]\\\\s*\\\\)`));
    });
  });

  test('also references projects table for optimization context', () => {
    expect(content).toMatch(new RegExp(`from\\\\s*\\\\(\\\\s*['"]projects['"]\\\\s*\\\\)`));
  });

  test('imports supabase client', () => {
    expect(content).toMatch(/import\\s+\\{.*supabase.*\\}\\s+from/);
  });

  test('imports AIService', () => {
    expect(content).toMatch(/import\\s+\\{.*AIService.*\\}\\s+from/);
  });

  test('calls AIService.chat in optimizeAllocations', () => {
    expect(content).toMatch(/AIService\\.chat\\s*\\(/);
  });

  test('optimizeAllocations sends system + user messages', () => {
    expect(content).toMatch(/role:\\s*['"]system['"]/);
    expect(content).toMatch(/role:\\s*['"]user['"]/);
  });

  test('optimizeAllocations AI prompt mentions resource planning', () => {
    expect(content).toMatch(/resource planning AI/i);
  });

  test('uses try/catch block', () => {
    const tryBlocks = content.match(/try\\s*\\{/g);
    expect(tryBlocks && tryBlocks.length >= 1).toBe(true);
  });

  test('has catch block for error handling', () => {
    const catchBlocks = content.match(/catch\\s*\\(/g);
    expect(catchBlocks && catchBlocks.length >= 1).toBe(true);
  });

  test('optimizeAllocations has fallback recommendations', () => {
    expect(content).toMatch(/recommendations:/);
    expect(content).toMatch(/capacityForecast/);
  });

  test('parses JSON from AI response', () => {
    expect(content).toMatch(/JSON\\.parse/);
  });

  test('getUtilizationReport computes utilization percentages', () => {
    expect(content).toMatch(/utilization/);
    expect(content).toMatch(/over-allocated/);
    expect(content).toMatch(/under-utilized/);
    expect(content).toMatch(/idle/);
    expect(content).toMatch(/optimal/);
  });

  test('getDashboard returns structured stats', () => {
    expect(content).toMatch(/totalResources/);
    expect(content).toMatch(/activeResources/);
    expect(content).toMatch(/totalAllocations/);
    expect(content).toMatch(/departmentUtilization/);
    expect(content).toMatch(/topSkills/);
  });
});
"""

# ═══════════════════════════════════════════════════════════════════════════════
# 4. regulatory-service.test.ts
# ═══════════════════════════════════════════════════════════════════════════════
files["regulatory-service.test.ts"] = """/**
 * Regulatory Change Intelligence Service \\u2014 Static Analysis Tests
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const SERVICE_PATH = path.join(ROOT, 'apps', 'express-api', 'src', 'services', 'regulatory-service.js');

describe('RegulatoryService \\u2013 static analysis', () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(SERVICE_PATH, 'utf-8');
  });

  test('service file exists', () => {
    expect(fs.existsSync(SERVICE_PATH)).toBe(true);
  });

  test('exports RegulatoryService as named const', () => {
    expect(content).toMatch(/export\\s+const\\s+RegulatoryService\\s*=\\s*\\{/);
  });

  const expectedMethods = [
    'getSources', 'createSource', 'deleteSource',
    'getChanges', 'getChange', 'createChange', 'updateChangeStatus',
    'analyzeImpact', 'scanForChanges',
    'getAssessments', 'updateAssessment', 'getDashboard',
  ];

  expectedMethods.forEach((method) => {
    test(`defines method: ${method}`, () => {
      expect(content).toMatch(new RegExp(`(async\\\\s+)?${method}\\\\s*\\\\(`));
    });
  });

  const expectedTables = ['regulatory_sources', 'regulatory_changes', 'compliance_assessments'];
  expectedTables.forEach((table) => {
    test(`references Supabase table "${table}"`, () => {
      expect(content).toMatch(new RegExp(`from\\\\s*\\\\(\\\\s*['"]${table}['"]\\\\s*\\\\)`));
    });
  });

  test('imports supabase client', () => {
    expect(content).toMatch(/import\\s+\\{.*supabase.*\\}\\s+from/);
  });

  test('imports AIService', () => {
    expect(content).toMatch(/import\\s+\\{.*AIService.*\\}\\s+from/);
  });

  test('calls AIService.chat', () => {
    expect(content).toMatch(/AIService\\.chat\\s*\\(/);
  });

  test('analyzeImpact sends system + user messages', () => {
    expect(content).toMatch(/role:\\s*['"]system['"]/);
    expect(content).toMatch(/role:\\s*['"]user['"]/);
  });

  test('analyzeImpact AI prompt mentions regulatory compliance', () => {
    expect(content).toMatch(/regulatory compliance AI/i);
  });

  test('scanForChanges AI prompt mentions regulatory intelligence', () => {
    expect(content).toMatch(/regulatory intelligence scanner/i);
  });

  test('at least two AIService.chat calls', () => {
    const matches = content.match(/AIService\\.chat\\s*\\(/g);
    expect(matches && matches.length >= 2).toBe(true);
  });

  test('uses try/catch blocks', () => {
    const tryBlocks = content.match(/try\\s*\\{/g);
    expect(tryBlocks && tryBlocks.length >= 2).toBe(true);
  });

  test('has catch blocks', () => {
    const catchBlocks = content.match(/catch\\s*\\(/g);
    expect(catchBlocks && catchBlocks.length >= 2).toBe(true);
  });

  test('analyzeImpact returns fallback on AI failure', () => {
    expect(content).toMatch(/riskScore:\\s*50/);
  });

  test('scanForChanges returns empty array on failure', () => {
    expect(content).toMatch(/return\\s+\\[\\s*\\]/);
  });

  test('parses JSON from AI response', () => {
    expect(content).toMatch(/JSON\\.parse/);
  });

  test('analyzeImpact auto-creates compliance_assessments row', () => {
    // The analyzeImpact method inserts into compliance_assessments
    expect(content).toMatch(/compliance_assessments/);
    expect(content).toMatch(/\\.insert\\s*\\(/);
  });

  test('getDashboard returns structured stats', () => {
    expect(content).toMatch(/totalChanges/);
    expect(content).toMatch(/newChanges/);
    expect(content).toMatch(/criticalChanges/);
    expect(content).toMatch(/avgRiskScore/);
    expect(content).toMatch(/changesByType/);
  });
});
"""

# ═══════════════════════════════════════════════════════════════════════════════
# 5. procurement-service.test.ts
# ═══════════════════════════════════════════════════════════════════════════════
files["procurement-service.test.ts"] = """/**
 * Procurement & Contract Risk Service \\u2014 Static Analysis Tests
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const SERVICE_PATH = path.join(ROOT, 'apps', 'express-api', 'src', 'services', 'procurement-service.js');

describe('ProcurementService \\u2013 static analysis', () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(SERVICE_PATH, 'utf-8');
  });

  test('service file exists', () => {
    expect(fs.existsSync(SERVICE_PATH)).toBe(true);
  });

  test('exports ProcurementService as named const', () => {
    expect(content).toMatch(/export\\s+const\\s+ProcurementService\\s*=\\s*\\{/);
  });

  const expectedMethods = [
    'getContracts', 'getContract', 'createContract', 'updateContract', 'deleteContract',
    'getClauses', 'analyzeContract', 'getReviews', 'getDashboard',
  ];

  expectedMethods.forEach((method) => {
    test(`defines method: ${method}`, () => {
      expect(content).toMatch(new RegExp(`(async\\\\s+)?${method}\\\\s*\\\\(`));
    });
  });

  const expectedTables = ['contracts', 'contract_clauses', 'procurement_reviews'];
  expectedTables.forEach((table) => {
    test(`references Supabase table "${table}"`, () => {
      expect(content).toMatch(new RegExp(`from\\\\s*\\\\(\\\\s*['"]${table}['"]\\\\s*\\\\)`));
    });
  });

  test('imports supabase client', () => {
    expect(content).toMatch(/import\\s+\\{.*supabase.*\\}\\s+from/);
  });

  test('imports AIService', () => {
    expect(content).toMatch(/import\\s+\\{.*AIService.*\\}\\s+from/);
  });

  test('calls AIService.chat in analyzeContract', () => {
    expect(content).toMatch(/AIService\\.chat\\s*\\(/);
  });

  test('analyzeContract sends system + user messages', () => {
    expect(content).toMatch(/role:\\s*['"]system['"]/);
    expect(content).toMatch(/role:\\s*['"]user['"]/);
  });

  test('analyzeContract AI prompt mentions contract risk', () => {
    expect(content).toMatch(/contract risk analyst/i);
  });

  test('uses try/catch blocks', () => {
    const tryBlocks = content.match(/try\\s*\\{/g);
    expect(tryBlocks && tryBlocks.length >= 1).toBe(true);
  });

  test('has catch blocks', () => {
    const catchBlocks = content.match(/catch\\s*\\(/g);
    expect(catchBlocks && catchBlocks.length >= 1).toBe(true);
  });

  test('analyzeContract returns fallback on AI failure', () => {
    expect(content).toMatch(/riskScore:\\s*50/);
  });

  test('parses JSON from AI response', () => {
    expect(content).toMatch(/JSON\\.parse/);
  });

  test('analyzeContract inserts clause rows', () => {
    expect(content).toMatch(/contract_clauses/);
  });

  test('analyzeContract inserts procurement_reviews row', () => {
    expect(content).toMatch(/procurement_reviews/);
  });

  test('getDashboard returns structured stats', () => {
    expect(content).toMatch(/totalContracts/);
    expect(content).toMatch(/activeContracts/);
    expect(content).toMatch(/expiringContracts/);
    expect(content).toMatch(/totalValue/);
    expect(content).toMatch(/avgRiskScore/);
    expect(content).toMatch(/highRiskContracts/);
  });

  test('getDashboard includes breakdown by type', () => {
    expect(content).toMatch(/byType/);
  });
});
"""

# ═══════════════════════════════════════════════════════════════════════════════
# 6. kyc-service.test.ts
# ═══════════════════════════════════════════════════════════════════════════════
files["kyc-service.test.ts"] = """/**
 * KYC/AML Service \\u2014 Static Analysis Tests
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const SERVICE_PATH = path.join(ROOT, 'apps', 'express-api', 'src', 'services', 'kyc-service.js');

describe('KYCService \\u2013 static analysis', () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(SERVICE_PATH, 'utf-8');
  });

  test('service file exists', () => {
    expect(fs.existsSync(SERVICE_PATH)).toBe(true);
  });

  test('exports default instance (export default new KYCService())', () => {
    expect(content).toMatch(/export\\s+default\\s+new\\s+KYCService\\s*\\(\\s*\\)/);
  });

  test('defines KYCService class', () => {
    expect(content).toMatch(/class\\s+KYCService/);
  });

  const expectedMethods = [
    'getClients', 'getClient', 'createClient', 'updateClient', 'deleteClient',
    'getChecks', 'createCheck', 'updateCheck',
    'getDocuments', 'addDocument', 'updateDocument',
    'getWorkflows', 'createWorkflow', 'advanceWorkflow',
    'assessClientRisk', 'analyzeDocument',
    'getDashboard', '_generateSteps',
  ];

  expectedMethods.forEach((method) => {
    test(`defines method: ${method}`, () => {
      expect(content).toMatch(new RegExp(`(async\\\\s+)?${method.replace('_', '_')}\\\\s*\\\\(`));
    });
  });

  const expectedTables = ['clients', 'kyc_checks', 'kyc_documents', 'onboarding_workflows'];
  expectedTables.forEach((table) => {
    test(`references Supabase table "${table}"`, () => {
      expect(content).toMatch(new RegExp(`from\\\\s*\\\\(\\\\s*['"]${table}['"]\\\\s*\\\\)`));
    });
  });

  test('imports supabase client', () => {
    expect(content).toMatch(/import\\s+\\{.*supabase.*\\}\\s+from/);
  });

  test('imports AIService', () => {
    expect(content).toMatch(/AIService|ai-service/);
  });

  test('calls AIService.chat', () => {
    expect(content).toMatch(/AIService\\.chat\\s*\\(/);
  });

  test('assessClientRisk sends system + user messages', () => {
    expect(content).toMatch(/role:\\s*['"]system['"]/);
    expect(content).toMatch(/role:\\s*['"]user['"]/);
  });

  test('assessClientRisk AI prompt mentions KYC/AML compliance', () => {
    expect(content).toMatch(/KYC\\/AML compliance/i);
  });

  test('analyzeDocument AI prompt mentions document verification', () => {
    expect(content).toMatch(/document verification/i);
  });

  test('at least two AIService.chat calls', () => {
    const matches = content.match(/AIService\\.chat\\s*\\(/g);
    expect(matches && matches.length >= 2).toBe(true);
  });

  test('uses try/catch blocks', () => {
    const tryBlocks = content.match(/try\\s*\\{/g);
    expect(tryBlocks && tryBlocks.length >= 2).toBe(true);
  });

  test('has catch blocks', () => {
    const catchBlocks = content.match(/catch/g);
    expect(catchBlocks && catchBlocks.length >= 2).toBe(true);
  });

  test('assessClientRisk has fallback algorithmic scoring', () => {
    expect(content).toMatch(/pep_status/);
    expect(content).toMatch(/entity_type/);
    expect(content).toMatch(/Algorithmic risk score/i);
  });

  test('analyzeDocument returns fallback on failure', () => {
    expect(content).toMatch(/needs_review/);
  });

  test('parses JSON from AI response', () => {
    expect(content).toMatch(/JSON\\.parse/);
  });

  test('_generateSteps supports standard template', () => {
    expect(content).toMatch(/Client Information/);
    expect(content).toMatch(/Identity Verification/);
    expect(content).toMatch(/Compliance Review/);
  });

  test('_generateSteps supports enhanced template', () => {
    expect(content).toMatch(/enhanced/);
    expect(content).toMatch(/Source of Wealth/);
    expect(content).toMatch(/Enhanced Due Diligence/);
  });

  test('_generateSteps supports corporate template', () => {
    expect(content).toMatch(/corporate/);
    expect(content).toMatch(/UBO Identification/);
  });

  test('getDashboard returns structured stats', () => {
    expect(content).toMatch(/totalClients/);
    expect(content).toMatch(/byStatus/);
    expect(content).toMatch(/byRisk/);
    expect(content).toMatch(/checksTotal/);
    expect(content).toMatch(/checksPending/);
    expect(content).toMatch(/checksFailed/);
    expect(content).toMatch(/onboardingActive/);
    expect(content).toMatch(/avgCompletion/);
  });
});
"""

# ═══════════════════════════════════════════════════════════════════════════════
# 7. fraud-detection-service.test.ts
# ═══════════════════════════════════════════════════════════════════════════════
files["fraud-detection-service.test.ts"] = """/**
 * Fraud Detection Service \\u2014 Static Analysis Tests
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const SERVICE_PATH = path.join(ROOT, 'apps', 'express-api', 'src', 'services', 'fraud-detection-service.js');

describe('FraudDetectionService \\u2013 static analysis', () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(SERVICE_PATH, 'utf-8');
  });

  test('service file exists', () => {
    expect(fs.existsSync(SERVICE_PATH)).toBe(true);
  });

  test('exports default instance (export default new FraudDetectionService())', () => {
    expect(content).toMatch(/export\\s+default\\s+new\\s+FraudDetectionService\\s*\\(\\s*\\)/);
  });

  test('defines FraudDetectionService class', () => {
    expect(content).toMatch(/class\\s+FraudDetectionService/);
  });

  const expectedMethods = [
    'getTransactions', 'createTransaction', 'updateTransaction',
    'getAlerts', 'updateAlert',
    'getPatterns', 'createPattern', 'togglePattern',
    'getInvestigations', 'createInvestigation', 'updateInvestigation',
    'analyzeTransaction', 'detectPatterns', 'getDashboard',
  ];

  expectedMethods.forEach((method) => {
    test(`defines method: ${method}`, () => {
      expect(content).toMatch(new RegExp(`(async\\\\s+)?${method}\\\\s*\\\\(`));
    });
  });

  const expectedTables = ['transactions', 'fraud_alerts', 'fraud_patterns', 'fraud_investigations'];
  expectedTables.forEach((table) => {
    test(`references Supabase table "${table}"`, () => {
      expect(content).toMatch(new RegExp(`from\\\\s*\\\\(\\\\s*['"]${table}['"]\\\\s*\\\\)`));
    });
  });

  test('imports supabase client', () => {
    expect(content).toMatch(/import\\s+\\{.*supabase.*\\}\\s+from/);
  });

  test('imports AIService', () => {
    expect(content).toMatch(/AIService|ai-service/);
  });

  test('calls AIService.chat', () => {
    expect(content).toMatch(/AIService\\.chat\\s*\\(/);
  });

  test('analyzeTransaction sends system + user messages', () => {
    expect(content).toMatch(/role:\\s*['"]system['"]/);
    expect(content).toMatch(/role:\\s*['"]user['"]/);
  });

  test('analyzeTransaction AI prompt mentions fraud detection', () => {
    expect(content).toMatch(/fraud detection AI/i);
  });

  test('detectPatterns AI prompt mentions pattern recognition', () => {
    expect(content).toMatch(/fraud pattern (recognition|detection) AI/i);
  });

  test('at least two AIService.chat calls', () => {
    const matches = content.match(/AIService\\.chat\\s*\\(/g);
    expect(matches && matches.length >= 2).toBe(true);
  });

  test('uses try/catch blocks', () => {
    const tryBlocks = content.match(/try\\s*\\{/g);
    expect(tryBlocks && tryBlocks.length >= 2).toBe(true);
  });

  test('has catch blocks', () => {
    const catchBlocks = content.match(/catch/g);
    expect(catchBlocks && catchBlocks.length >= 2).toBe(true);
  });

  test('analyzeTransaction has fallback rule-based scoring', () => {
    expect(content).toMatch(/rule-based analysis/i);
  });

  test('detectPatterns returns fallback on failure', () => {
    expect(content).toMatch(/Pattern detection unavailable/i);
  });

  test('parses JSON from AI response', () => {
    expect(content).toMatch(/JSON\\.parse/);
  });

  test('analyzeTransaction inserts fraud_alerts on detection', () => {
    expect(content).toMatch(/fraud_alerts/);
    expect(content).toMatch(/\\.insert\\s*\\(/);
  });

  test('detectPatterns inserts fraud_patterns', () => {
    expect(content).toMatch(/fraud_patterns/);
  });

  test('getDashboard returns structured stats', () => {
    expect(content).toMatch(/totalTransactions/);
    expect(content).toMatch(/flaggedTransactions/);
    expect(content).toMatch(/totalVolume/);
    expect(content).toMatch(/avgRiskScore/);
    expect(content).toMatch(/alertsOpen/);
    expect(content).toMatch(/alertsCritical/);
    expect(content).toMatch(/alertsBySeverity/);
    expect(content).toMatch(/alertsByType/);
    expect(content).toMatch(/investigationsOpen/);
    expect(content).toMatch(/totalExposure/);
  });

  test('createInvestigation generates case number', () => {
    expect(content).toMatch(/INV-/);
    expect(content).toMatch(/case_number/);
  });
});
"""

# ═══════════════════════════════════════════════════════════════════════════════
# Write all files
# ═══════════════════════════════════════════════════════════════════════════════
for name, body in files.items():
    fpath = os.path.join(BASE, name)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(body.lstrip("\n"))
    lines = len(body.strip().splitlines())
    print(f"OK  {name} ({lines} lines)")

print("\nAll 7 test files written.")
