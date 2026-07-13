/**
 * Business Intelligence & Query Routes
 * NL-to-SQL generation, saved queries, query history, cross-system BI
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateJwt } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import { NLToSQLService } from '../services/nl-to-sql-service.js';
import { createLogger } from '../utils/logger.js';

const router = Router();
const logger = createLogger('bi-routes');

// ── Validation Schemas ──────────────────────────────────────────────────────

const generateSQLSchema = z.object({
  naturalLanguage: z.string().min(3).max(2000),
  schema: z.string().optional(),
  connectionId: z.string().uuid().optional(),
  connectionType: z.string().optional(),
});

const saveQuerySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  naturalLanguage: z.string().min(1),
  generatedSQL: z.string().optional(),
  connectionId: z.string().uuid().optional(),
  connectionType: z.string().optional(),
  tags: z.array(z.string()).max(10).optional(),
});

const historyQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(200).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
  status: z.enum(['success', 'error', 'timeout']).optional(),
});

const summarizeSchema = z.object({
  naturalLanguage: z.string().min(1),
  results: z.array(z.record(z.unknown())).min(1),
});

const visualizationSchema = z.object({
  columns: z.array(z.string()).min(1),
  sampleRow: z.record(z.unknown()),
  rowCount: z.number(),
});

// ── NL-to-SQL ───────────────────────────────────────────────────────────────

/**
 * POST /api/bi/generate-sql
 * Convert natural language to SQL
 */
router.post('/generate-sql', validateJwt, async (req, res, next) => {
  try {
    const validated = generateSQLSchema.parse(req.body);
    const userId = req.user.id;

    logger.info({ userId, query: validated.naturalLanguage.slice(0, 80) }, 'Generating SQL');

    const startMs = Date.now();
    const result = await NLToSQLService.generateSQL({
      naturalLanguage: validated.naturalLanguage,
      schema: validated.schema,
      connectionType: validated.connectionType,
      userId,
    });
    const executionMs = Date.now() - startMs;

    // Record history
    await NLToSQLService.recordHistory({
      userId,
      connectionId: validated.connectionId,
      connectionType: validated.connectionType,
      naturalLanguage: validated.naturalLanguage,
      generatedSQL: result.sql,
      executionMs,
      aiModel: result.aiModel,
      aiProvider: result.aiProvider,
      tokensUsed: result.tokensUsed,
      status: 'success',
    });

    res.json({
      success: true,
      data: {
        sql: result.sql,
        explanation: result.explanation,
        suggestedChart: result.suggestedChart,
        columns: result.columns,
        executionMs,
        model: result.aiModel,
        provider: result.aiProvider,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/bi/summarize
 * Summarize query results in natural language
 */
router.post('/summarize', validateJwt, async (req, res, next) => {
  try {
    const validated = summarizeSchema.parse(req.body);
    const userId = req.user.id;

    const summary = await NLToSQLService.summarizeResults({
      naturalLanguage: validated.naturalLanguage,
      results: validated.results,
      userId,
    });

    res.json({ success: true, data: { summary } });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/bi/suggest-chart
 * Suggest best visualization for given data shape
 */
router.post('/suggest-chart', validateJwt, async (req, res, next) => {
  try {
    const validated = visualizationSchema.parse(req.body);
    const rows = [validated.sampleRow];
    const suggestion = NLToSQLService.suggestVisualization(validated.columns, rows);

    res.json({ success: true, data: suggestion });
  } catch (err) {
    next(err);
  }
});

// ── Saved Queries ───────────────────────────────────────────────────────────

/**
 * GET /api/bi/saved
 * List saved queries
 */
router.get('/saved', validateJwt, async (req, res, next) => {
  try {
    const { limit, offset } = historyQuerySchema.parse(req.query);
    const favorites = req.query.favorites === 'true';
    const userId = req.user.id;

    const queries = await NLToSQLService.getSavedQueries(userId, { limit, offset, favorites });
    res.json({ success: true, data: queries });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/bi/saved
 * Save a query
 */
router.post('/saved', validateJwt, async (req, res, next) => {
  try {
    const validated = saveQuerySchema.parse(req.body);
    const userId = req.user.id;

    const saved = await NLToSQLService.saveQuery({ userId, ...validated });
    logger.info({ userId, queryId: saved.id }, 'Query saved');

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/bi/saved/:id/favorite
 * Toggle favorite status
 */
router.patch('/saved/:id/favorite', validateJwt, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const queryId = req.params.id;

    const updated = await NLToSQLService.toggleFavorite(userId, queryId);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/bi/saved/:id
 * Delete a saved query
 */
router.delete('/saved/:id', validateJwt, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const queryId = req.params.id;

    await NLToSQLService.deleteSavedQuery(userId, queryId);
    res.json({ success: true, message: 'Query deleted' });
  } catch (err) {
    next(err);
  }
});

// ── Query History ───────────────────────────────────────────────────────────

/**
 * GET /api/bi/history
 * Get query history
 */
router.get('/history', validateJwt, async (req, res, next) => {
  try {
    const validated = historyQuerySchema.parse(req.query);
    const userId = req.user.id;

    const history = await NLToSQLService.getHistory(userId, validated);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/bi/history/stats
 * Get query history statistics
 */
router.get('/history/stats', validateJwt, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await NLToSQLService.getHistoryStats(userId);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

export default router;
