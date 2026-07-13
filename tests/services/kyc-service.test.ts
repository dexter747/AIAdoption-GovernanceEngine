/**
 * KYC/AML Service \u2014 Static Analysis Tests
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const SERVICE_PATH = path.join(ROOT, 'apps', 'express-api', 'src', 'services', 'kyc-service.js');

describe('KYCService \u2013 static analysis', () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(SERVICE_PATH, 'utf-8');
  });

  test('service file exists', () => {
    expect(fs.existsSync(SERVICE_PATH)).toBe(true);
  });

  test('exports default instance (export default new KYCService())', () => {
    expect(content).toMatch(/export\s+default\s+new\s+KYCService\s*\(\s*\)/);
  });

  test('defines KYCService class', () => {
    expect(content).toMatch(/class\s+KYCService/);
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
      expect(content).toMatch(new RegExp(`(async\\s+)?${method.replace('_', '_')}\\s*\\(`));
    });
  });

  const expectedTables = ['clients', 'kyc_checks', 'kyc_documents', 'onboarding_workflows'];
  expectedTables.forEach((table) => {
    test(`references Supabase table "${table}"`, () => {
      expect(content).toMatch(new RegExp(`from\\s*\\(\\s*['"]${table}['"]\\s*\\)`));
    });
  });

  test('imports supabase client', () => {
    expect(content).toMatch(/import\s+\{.*supabase.*\}\s+from/);
  });

  test('imports AIService', () => {
    expect(content).toMatch(/AIService|ai-service/);
  });

  test('calls AIService.chat', () => {
    expect(content).toMatch(/AIService\.chat\s*\(/);
  });

  test('assessClientRisk sends system + user messages', () => {
    expect(content).toMatch(/role:\s*['"]system['"]/);
    expect(content).toMatch(/role:\s*['"]user['"]/);
  });

  test('assessClientRisk AI prompt mentions KYC/AML compliance', () => {
    expect(content).toMatch(/KYC\/AML compliance/i);
  });

  test('analyzeDocument AI prompt mentions document verification', () => {
    expect(content).toMatch(/document verification/i);
  });

  test('at least two AIService.chat calls', () => {
    const matches = content.match(/AIService\.chat\s*\(/g);
    expect(matches && matches.length >= 2).toBe(true);
  });

  test('uses try/catch blocks', () => {
    const tryBlocks = content.match(/try\s*\{/g);
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
    expect(content).toMatch(/JSON\.parse/);
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
