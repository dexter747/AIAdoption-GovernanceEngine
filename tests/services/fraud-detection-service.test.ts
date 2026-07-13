/**
 * Fraud Detection Service \u2014 Static Analysis Tests
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const SERVICE_PATH = path.join(ROOT, 'apps', 'express-api', 'src', 'services', 'fraud-detection-service.js');

describe('FraudDetectionService \u2013 static analysis', () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(SERVICE_PATH, 'utf-8');
  });

  test('service file exists', () => {
    expect(fs.existsSync(SERVICE_PATH)).toBe(true);
  });

  test('exports default instance (export default new FraudDetectionService())', () => {
    expect(content).toMatch(/export\s+default\s+new\s+FraudDetectionService\s*\(\s*\)/);
  });

  test('defines FraudDetectionService class', () => {
    expect(content).toMatch(/class\s+FraudDetectionService/);
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
      expect(content).toMatch(new RegExp(`(async\\s+)?${method}\\s*\\(`));
    });
  });

  const expectedTables = ['transactions', 'fraud_alerts', 'fraud_patterns', 'fraud_investigations'];
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

  test('analyzeTransaction sends system + user messages', () => {
    expect(content).toMatch(/role:\s*['"]system['"]/);
    expect(content).toMatch(/role:\s*['"]user['"]/);
  });

  test('analyzeTransaction AI prompt mentions fraud detection', () => {
    expect(content).toMatch(/fraud detection AI/i);
  });

  test('detectPatterns AI prompt mentions pattern recognition', () => {
    expect(content).toMatch(/fraud pattern (recognition|detection) AI/i);
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

  test('analyzeTransaction has fallback rule-based scoring', () => {
    expect(content).toMatch(/rule-based analysis/i);
  });

  test('detectPatterns returns fallback on failure', () => {
    expect(content).toMatch(/Pattern detection unavailable/i);
  });

  test('parses JSON from AI response', () => {
    expect(content).toMatch(/JSON\.parse/);
  });

  test('analyzeTransaction inserts fraud_alerts on detection', () => {
    expect(content).toMatch(/fraud_alerts/);
    expect(content).toMatch(/\.insert\s*\(/);
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
