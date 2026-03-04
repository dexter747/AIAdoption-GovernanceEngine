/**
 * Project Intelligence Service \u2014 Static Analysis Tests
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const SERVICE_PATH = path.join(ROOT, 'apps', 'express-api', 'src', 'services', 'project-intel-service.js');

describe('ProjectIntelService \u2013 static analysis', () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(SERVICE_PATH, 'utf-8');
  });

  test('service file exists', () => {
    expect(fs.existsSync(SERVICE_PATH)).toBe(true);
  });

  test('exports ProjectIntelService as named const', () => {
    expect(content).toMatch(/export\s+const\s+ProjectIntelService\s*=\s*\{/);
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
      expect(content).toMatch(new RegExp(`(async\\s+)?${method}\\s*\\(`));
    });
  });

  const expectedTables = ['projects', 'project_tasks', 'project_risks', 'project_insights'];
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

  test('analyzeHealth sends system + user messages', () => {
    expect(content).toMatch(/role:\s*['"]system['"]/);
    expect(content).toMatch(/role:\s*['"]user['"]/);
  });

  test('analyzeHealth AI call exists (project management AI)', () => {
    expect(content).toMatch(/project management AI/i);
  });

  test('detectRisks AI call exists (risk analyst)', () => {
    expect(content).toMatch(/project risk analyst/i);
  });

  test('at least two AIService.chat calls', () => {
    const matches = content.match(/AIService\.chat\s*\(/g);
    expect(matches && matches.length >= 2).toBe(true);
  });

  test('uses try/catch blocks', () => {
    const tryBlocks = content.match(/try\s*\{/g);
    expect(tryBlocks && tryBlocks.length >= 2).toBe(true);
  });

  test('has catch blocks for error handling', () => {
    const catchBlocks = content.match(/catch\s*\(/g);
    expect(catchBlocks && catchBlocks.length >= 2).toBe(true);
  });

  test('analyzeHealth has fallback algorithmic score', () => {
    expect(content).toMatch(/healthScore:\s*score/);
  });

  test('detectRisks returns empty array on failure', () => {
    expect(content).toMatch(/return\s+\[\s*\]/);
  });

  test('parses JSON from AI response', () => {
    expect(content).toMatch(/JSON\.parse/);
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
