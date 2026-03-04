/**
 * Regulatory Change Intelligence Service \u2014 Static Analysis Tests
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const SERVICE_PATH = path.join(ROOT, 'apps', 'express-api', 'src', 'services', 'regulatory-service.js');

describe('RegulatoryService \u2013 static analysis', () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(SERVICE_PATH, 'utf-8');
  });

  test('service file exists', () => {
    expect(fs.existsSync(SERVICE_PATH)).toBe(true);
  });

  test('exports RegulatoryService as named const', () => {
    expect(content).toMatch(/export\s+const\s+RegulatoryService\s*=\s*\{/);
  });

  const expectedMethods = [
    'getSources', 'createSource', 'deleteSource',
    'getChanges', 'getChange', 'createChange', 'updateChangeStatus',
    'analyzeImpact', 'scanForChanges',
    'getAssessments', 'updateAssessment', 'getDashboard',
  ];

  expectedMethods.forEach((method) => {
    test(`defines method: ${method}`, () => {
      expect(content).toMatch(new RegExp(`(async\\s+)?${method}\\s*\\(`));
    });
  });

  const expectedTables = ['regulatory_sources', 'regulatory_changes', 'compliance_assessments'];
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

  test('calls AIService.chat', () => {
    expect(content).toMatch(/AIService\.chat\s*\(/);
  });

  test('analyzeImpact sends system + user messages', () => {
    expect(content).toMatch(/role:\s*['"]system['"]/);
    expect(content).toMatch(/role:\s*['"]user['"]/);
  });

  test('analyzeImpact AI prompt mentions regulatory compliance', () => {
    expect(content).toMatch(/regulatory compliance AI/i);
  });

  test('scanForChanges AI prompt mentions regulatory intelligence', () => {
    expect(content).toMatch(/regulatory intelligence scanner/i);
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
    const catchBlocks = content.match(/catch\s*\(/g);
    expect(catchBlocks && catchBlocks.length >= 2).toBe(true);
  });

  test('analyzeImpact returns fallback on AI failure', () => {
    expect(content).toMatch(/riskScore:\s*50/);
  });

  test('scanForChanges returns empty array on failure', () => {
    expect(content).toMatch(/return\s+\[\s*\]/);
  });

  test('parses JSON from AI response', () => {
    expect(content).toMatch(/JSON\.parse/);
  });

  test('analyzeImpact auto-creates compliance_assessments row', () => {
    // The analyzeImpact method inserts into compliance_assessments
    expect(content).toMatch(/compliance_assessments/);
    expect(content).toMatch(/\.insert\s*\(/);
  });

  test('getDashboard returns structured stats', () => {
    expect(content).toMatch(/totalChanges/);
    expect(content).toMatch(/newChanges/);
    expect(content).toMatch(/criticalChanges/);
    expect(content).toMatch(/avgRiskScore/);
    expect(content).toMatch(/changesByType/);
  });
});
