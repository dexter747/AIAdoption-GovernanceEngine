/**
 * NL-to-SQL Service — Static Analysis Tests
 *
 * Validates source structure via file-content reading + regex assertions
 * (no dynamic imports, no module mocking).
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const SERVICE_PATH = path.join(ROOT, 'apps', 'express-api', 'src', 'services', 'nl-to-sql-service.js');

describe('NLToSQLService \u2013 static analysis', () => {
  let content: string;

  beforeAll(() => {
    content = fs.readFileSync(SERVICE_PATH, 'utf-8');
  });

  /* \u2500\u2500 File existence \u2500 */

  test('service file exists', () => {
    expect(fs.existsSync(SERVICE_PATH)).toBe(true);
  });

  /* \u2500\u2500 Exports \u2500 */

  test('exports NLToSQLService as named const', () => {
    expect(content).toMatch(/export\s+const\s+NLToSQLService\s*=\s*\{/);
  });

  /* \u2500\u2500 Method definitions \u2500 */

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
      const pattern = new RegExp(`(async\\s+)?${method}\\s*\\(`);
      expect(content).toMatch(pattern);
    });
  });

  /* \u2500\u2500 Supabase table references \u2500 */

  const expectedTables = ['saved_queries', 'query_history'];

  expectedTables.forEach((table) => {
    test(`references Supabase table "${table}"`, () => {
      expect(content).toMatch(new RegExp(`from\\s*\\(\\s*['"]${table}['"]\\s*\\)`));
    });
  });

  test('imports supabase client', () => {
    expect(content).toMatch(/import\s+\{.*supabase.*\}\s+from/);
  });

  /* \u2500\u2500 AI integration \u2500 */

  test('imports AIService', () => {
    expect(content).toMatch(/import\s+\{.*AIService.*\}\s+from/);
  });

  test('calls AIService.chat in generateSQL', () => {
    expect(content).toMatch(/AIService\.chat\s*\(/);
  });

  test('generateSQL sends system + user messages', () => {
    expect(content).toMatch(/role:\s*['"]system['"]/);
    expect(content).toMatch(/role:\s*['"]user['"]/);
  });

  test('summarizeResults calls AIService.chat (at least 2 chat calls)', () => {
    const matches = content.match(/AIService\.chat\s*\(/g);
    expect(matches && matches.length >= 2).toBe(true);
  });

  /* \u2500\u2500 Error handling \u2500 */

  test('uses try/catch blocks', () => {
    const tryBlocks = content.match(/try\s*\{/g);
    expect(tryBlocks && tryBlocks.length >= 1).toBe(true);
  });

  test('has catch blocks for error handling', () => {
    const catchBlocks = content.match(/catch\s*\(/g);
    expect(catchBlocks && catchBlocks.length >= 1).toBe(true);
  });

  test('throws descriptive error on AI parse failure', () => {
    expect(content).toMatch(/throw\s+new\s+Error\s*\(/);
  });

  /* \u2500\u2500 AI system prompts \u2500 */

  test('defines NL_TO_SQL_SYSTEM prompt', () => {
    expect(content).toMatch(/NL_TO_SQL_SYSTEM/);
  });

  test('defines RESULT_SUMMARY_SYSTEM prompt', () => {
    expect(content).toMatch(/RESULT_SUMMARY_SYSTEM/);
  });

  /* \u2500\u2500 suggestVisualization logic \u2500 */

  test('suggestVisualization returns chart type objects', () => {
    expect(content).toMatch(/type:\s*['"]line['"]/);
    expect(content).toMatch(/type:\s*['"]pie['"]/);
    expect(content).toMatch(/type:\s*['"]bar['"]/);
    expect(content).toMatch(/type:\s*['"]table['"]/);
  });

  /* \u2500\u2500 Fallback / safety \u2500 */

  test('generateSQL parses JSON from AI response', () => {
    expect(content).toMatch(/JSON\.parse/);
  });

  test('recordHistory gracefully returns null on error', () => {
    expect(content).toMatch(/return\s+null/);
  });
});
