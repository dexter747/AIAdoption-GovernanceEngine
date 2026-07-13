/**
 * Natural Language to SQL Service
 * Converts natural language queries to SQL using AI, executes them,
 * and provides structured results with visualization suggestions.
 */

import { AIService } from './ai/index.js';
import { supabase } from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('nl-to-sql');

// ── System prompts ──────────────────────────────────────────────────────────

const NL_TO_SQL_SYSTEM = `You are an expert SQL query generator. Given a database schema and a natural language question, generate the most accurate SQL query.

RULES:
1. Output ONLY valid SQL — no markdown fences, no explanation in the SQL block.
2. Use standard SQL that works across PostgreSQL, MySQL, and SQL Server.
3. Always use explicit column names instead of SELECT *.
4. Add LIMIT 100 unless the user explicitly requests more.
5. Use aliases for readability.
6. For aggregations, always include GROUP BY.
7. Handle NULL values properly with COALESCE where appropriate.
8. Never generate DROP, DELETE, TRUNCATE, ALTER, or any DDL/DML that modifies data.
9. For date filters use ISO format and standard functions.

Respond in this exact JSON format:
{
  "sql": "<the generated SQL query>",
  "explanation": "<1-2 sentence explanation of what the query does>",
  "suggestedChart": "<bar|line|pie|area|table|null>",
  "columns": ["col1", "col2"]
}`;

const RESULT_SUMMARY_SYSTEM = `You are a data analyst. Given query results, provide a concise 1-3 sentence summary of the key findings. Be specific with numbers and trends. Do not repeat the query itself.`;

// ── Service ─────────────────────────────────────────────────────────────────

export const NLToSQLService = {
  /**
   * Convert natural language to SQL
   */
  async generateSQL({ naturalLanguage, schema, connectionType, userId }) {
    const schemaContext = schema
      ? `\nDATABASE SCHEMA:\n${schema}\n`
      : '\nNo schema provided — generate generic SQL.\n';

    const dbHint = connectionType
      ? `\nTarget database type: ${connectionType}. Use dialect-appropriate syntax.\n`
      : '';

    const response = await AIService.chat({
      provider: 'auto',
      model: 'auto',
      messages: [
        { role: 'system', content: NL_TO_SQL_SYSTEM + schemaContext + dbHint },
        { role: 'user', content: naturalLanguage },
      ],
      temperature: 0.1,
      maxTokens: 2048,
      userId,
    });

    try {
      const text = response.message?.content || response.message || '';
      // Try to parse as JSON first
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          sql: parsed.sql,
          explanation: parsed.explanation || '',
          suggestedChart: parsed.suggestedChart || 'table',
          columns: parsed.columns || [],
          aiModel: response.model,
          aiProvider: response.provider,
          tokensUsed: (response.usage?.inputTokens || 0) + (response.usage?.outputTokens || 0),
        };
      }
      // Fallback: treat entire response as SQL
      return {
        sql: text.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim(),
        explanation: '',
        suggestedChart: 'table',
        columns: [],
        aiModel: response.model,
        aiProvider: response.provider,
        tokensUsed: (response.usage?.inputTokens || 0) + (response.usage?.outputTokens || 0),
      };
    } catch (err) {
      logger.error({ error: err.message }, 'Failed to parse AI SQL response');
      throw new Error('Failed to generate SQL from natural language query');
    }
  },

  /**
   * Summarize query results using AI
   */
  async summarizeResults({ naturalLanguage, results, userId }) {
    if (!results || results.length === 0) return 'No results returned.';

    const preview = JSON.stringify(results.slice(0, 20), null, 2);
    const response = await AIService.chat({
      provider: 'auto',
      model: 'auto',
      messages: [
        { role: 'system', content: RESULT_SUMMARY_SYSTEM },
        {
          role: 'user',
          content: `Question: "${naturalLanguage}"\n\nResults (${results.length} rows, showing first 20):\n${preview}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 512,
      userId,
    });

    return response.message?.content || response.message || 'Query completed successfully.';
  },

  /**
   * Detect the best chart type for given data
   */
  suggestVisualization(columns, rows) {
    if (!rows || rows.length === 0) return { type: 'table', config: {} };
    if (rows.length === 1) return { type: 'table', config: {} };

    const hasDateCol = columns.some(c =>
      /date|time|created|updated|month|year|day|week/i.test(c)
    );
    const hasNumericCol = columns.some(c => {
      const sample = rows[0]?.[c];
      return typeof sample === 'number' || (!isNaN(Number(sample)) && sample !== null && sample !== '');
    });
    const numericCount = columns.filter(c => {
      const sample = rows[0]?.[c];
      return typeof sample === 'number';
    }).length;

    if (hasDateCol && hasNumericCol) return { type: 'line', config: { xKey: columns.find(c => /date|time|created|updated|month|year/i.test(c)), yKey: columns.find(c => typeof rows[0]?.[c] === 'number') } };
    if (numericCount === 1 && columns.length === 2 && rows.length <= 10) return { type: 'pie', config: { labelKey: columns.find(c => typeof rows[0]?.[c] !== 'number'), valueKey: columns.find(c => typeof rows[0]?.[c] === 'number') } };
    if (hasNumericCol && rows.length <= 30) return { type: 'bar', config: { xKey: columns[0], yKey: columns.find(c => typeof rows[0]?.[c] === 'number') } };
    return { type: 'table', config: {} };
  },

  // ── Saved Queries CRUD ──────────────────────────────────────────────────

  async saveQuery({ userId, connectionId, title, description, naturalLanguage, generatedSQL, connectionType, tags }) {
    if (!supabase) throw new Error('Database not configured');

    const { data, error } = await supabase
      .from('saved_queries')
      .insert({
        user_id: userId,
        connection_id: connectionId || null,
        title,
        description: description || null,
        natural_language: naturalLanguage,
        generated_sql: generatedSQL || null,
        connection_type: connectionType || null,
        tags: tags || [],
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSavedQueries(userId, { limit = 50, offset = 0, favorites = false } = {}) {
    if (!supabase) return [];

    let query = supabase
      .from('saved_queries')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (favorites) query = query.eq('is_favorite', true);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async toggleFavorite(userId, queryId) {
    if (!supabase) throw new Error('Database not configured');

    const { data: existing } = await supabase
      .from('saved_queries')
      .select('is_favorite')
      .eq('id', queryId)
      .eq('user_id', userId)
      .single();

    if (!existing) throw new Error('Query not found');

    const { data, error } = await supabase
      .from('saved_queries')
      .update({ is_favorite: !existing.is_favorite })
      .eq('id', queryId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSavedQuery(userId, queryId) {
    if (!supabase) throw new Error('Database not configured');

    const { error } = await supabase
      .from('saved_queries')
      .delete()
      .eq('id', queryId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // ── Query History ───────────────────────────────────────────────────────

  async recordHistory({ userId, connectionId, connectionName, connectionType, naturalLanguage, generatedSQL, resultSummary, rowCount, executionMs, aiModel, aiProvider, tokensUsed, status, errorMessage }) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('query_history')
      .insert({
        user_id: userId,
        connection_id: connectionId || null,
        connection_name: connectionName || null,
        connection_type: connectionType || null,
        natural_language: naturalLanguage,
        generated_sql: generatedSQL || null,
        result_summary: resultSummary || null,
        row_count: rowCount || 0,
        execution_ms: executionMs || 0,
        ai_model: aiModel || null,
        ai_provider: aiProvider || null,
        tokens_used: tokensUsed || 0,
        status: status || 'success',
        error_message: errorMessage || null,
      })
      .select()
      .single();

    if (error) {
      logger.error({ error: error.message }, 'Failed to record query history');
      return null;
    }
    return data;
  },

  async getHistory(userId, { limit = 50, offset = 0, status } = {}) {
    if (!supabase) return [];

    let query = supabase
      .from('query_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getHistoryStats(userId) {
    if (!supabase) return { total: 0, today: 0, avgExecMs: 0, topConnections: [] };

    const { data: all } = await supabase
      .from('query_history')
      .select('id, execution_ms, connection_name, created_at, status')
      .eq('user_id', userId);

    if (!all || all.length === 0) return { total: 0, today: 0, avgExecMs: 0, topConnections: [] };

    const today = new Date().toISOString().split('T')[0];
    const todayCount = all.filter(q => q.created_at?.startsWith(today)).length;
    const avgExecMs = Math.round(all.reduce((sum, q) => sum + (q.execution_ms || 0), 0) / all.length);

    const connCounts = {};
    all.forEach(q => {
      const name = q.connection_name || 'Unknown';
      connCounts[name] = (connCounts[name] || 0) + 1;
    });
    const topConnections = Object.entries(connCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      total: all.length,
      today: todayCount,
      avgExecMs,
      successRate: Math.round((all.filter(q => q.status === 'success').length / all.length) * 100),
      topConnections,
    };
  },
};
