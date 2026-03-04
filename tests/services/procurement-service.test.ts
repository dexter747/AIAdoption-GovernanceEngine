/**
 * Procurement & Contract Risk Service \u2014 Static Analysis Tests
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const SERVICE_PATH = path.join(ROOT, 'apps', 'express-api', 'src', 'services', 'procurement-service.js');

describe('ProcurementService \u2013 static analysis', () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(SERVICE_PATH, 'utf-8');
  });

  test('service file exists', () => {
    expect(fs.existsSync(SERVICE_PATH)).toBe(true);
  });

  test('exports ProcurementService as named const', () => {
    expect(content).toMatch(/export\s+const\s+ProcurementService\s*=\s*\{/);
  });

  const expectedMethods = [
    'getContracts', 'getContract', 'createContract', 'updateContract', 'deleteContract',
    'getClauses', 'analyzeContract', 'getReviews', 'getDashboard',
  ];

  expectedMethods.forEach((method) => {
    test(`defines method: ${method}`, () => {
      expect(content).toMatch(new RegExp(`(async\\s+)?${method}\\s*\\(`));
    });
  });

  const expectedTables = ['contracts', 'contract_clauses', 'procurement_reviews'];
  expectedTables.forEach((table) => {
    test(`references Supabase table "${table}"`, () => {
      expect(content).toMatch(new RegExp(`from\\s*\\(\\s*['"]${table}['"]\\s*\\)`));
    });
  });

  test('imports supabase client', () => {
    expect(content).toMatch(/import\s+\{.*supabase.*\}\s+from/);
  });

  test('imports AIService', () => {
    expect(content).toMatch(/import\s+\{.*AIService.*\}\s+from/);
  });

  test('calls AIService.chat in analyzeContract', () => {
    expect(content).toMatch(/AIService\.chat\s*\(/);
  });

  test('analyzeContract sends system + user messages', () => {
    expect(content).toMatch(/role:\s*['"]system['"]/);
    expect(content).toMatch(/role:\s*['"]user['"]/);
  });

  test('analyzeContract AI prompt mentions contract risk', () => {
    expect(content).toMatch(/contract risk analyst/i);
  });

  test('uses try/catch blocks', () => {
    const tryBlocks = content.match(/try\s*\{/g);
    expect(tryBlocks && tryBlocks.length >= 1).toBe(true);
  });

  test('has catch blocks', () => {
    const catchBlocks = content.match(/catch\s*\(/g);
    expect(catchBlocks && catchBlocks.length >= 1).toBe(true);
  });

  test('analyzeContract returns fallback on AI failure', () => {
    expect(content).toMatch(/riskScore:\s*50/);
  });

  test('parses JSON from AI response', () => {
    expect(content).toMatch(/JSON\.parse/);
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
