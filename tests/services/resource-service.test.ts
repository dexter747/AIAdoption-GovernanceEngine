/**
 * Resource Allocation Service \u2014 Static Analysis Tests
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const SERVICE_PATH = path.join(ROOT, 'apps', 'express-api', 'src', 'services', 'resource-service.js');

describe('ResourceService \u2013 static analysis', () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(SERVICE_PATH, 'utf-8');
  });

  test('service file exists', () => {
    expect(fs.existsSync(SERVICE_PATH)).toBe(true);
  });

  test('exports ResourceService as named const', () => {
    expect(content).toMatch(/export\s+const\s+ResourceService\s*=\s*\{/);
  });

  const expectedMethods = [
    'getResources', 'createResource', 'updateResource', 'deleteResource',
    'getAllocations', 'createAllocation', 'updateAllocation', 'deleteAllocation',
    'getUtilizationReport', 'optimizeAllocations', 'getDashboard',
  ];

  expectedMethods.forEach((method) => {
    test(`defines method: ${method}`, () => {
      expect(content).toMatch(new RegExp(`(async\\s+)?${method}\\s*\\(`));
    });
  });

  const expectedTables = ['resources', 'resource_allocations'];
  expectedTables.forEach((table) => {
    test(`references Supabase table "${table}"`, () => {
      expect(content).toMatch(new RegExp(`from\\s*\\(\\s*['"]${table}['"]\\s*\\)`));
    });
  });

  test('also references projects table for optimization context', () => {
    expect(content).toMatch(new RegExp(`from\\s*\\(\\s*['"]projects['"]\\s*\\)`));
  });

  test('imports supabase client', () => {
    expect(content).toMatch(/import\s+\{.*supabase.*\}\s+from/);
  });

  test('imports AIService', () => {
    expect(content).toMatch(/import\s+\{.*AIService.*\}\s+from/);
  });

  test('calls AIService.chat in optimizeAllocations', () => {
    expect(content).toMatch(/AIService\.chat\s*\(/);
  });

  test('optimizeAllocations sends system + user messages', () => {
    expect(content).toMatch(/role:\s*['"]system['"]/);
    expect(content).toMatch(/role:\s*['"]user['"]/);
  });

  test('optimizeAllocations AI prompt mentions resource planning', () => {
    expect(content).toMatch(/resource planning AI/i);
  });

  test('uses try/catch block', () => {
    const tryBlocks = content.match(/try\s*\{/g);
    expect(tryBlocks && tryBlocks.length >= 1).toBe(true);
  });

  test('has catch block for error handling', () => {
    const catchBlocks = content.match(/catch\s*\(/g);
    expect(catchBlocks && catchBlocks.length >= 1).toBe(true);
  });

  test('optimizeAllocations has fallback recommendations', () => {
    expect(content).toMatch(/recommendations:/);
    expect(content).toMatch(/capacityForecast/);
  });

  test('parses JSON from AI response', () => {
    expect(content).toMatch(/JSON\.parse/);
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
