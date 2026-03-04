/**
 * Project Intelligence Routes
 * CRUD for projects, tasks, risks + AI health/risk analysis
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateJwt } from '../middleware/auth.js';
import { ProjectIntelService } from '../services/project-intel-service.js';
import { createLogger } from '../utils/logger.js';
import { ApiError } from '../utils/errors.js';

const router = Router();
const logger = createLogger('project-intel-routes');

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  start_date: z.string().optional(),
  target_end_date: z.string().optional(),
  budget: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

const updateProjectSchema = createProjectSchema.partial().extend({
  spent: z.number().optional(),
  actual_end_date: z.string().optional(),
});

const createTaskSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assignee: z.string().optional(),
  due_date: z.string().optional(),
  estimated_hours: z.number().optional(),
  actual_hours: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

const createRiskSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().optional(),
  category: z.enum(['technical', 'resource', 'schedule', 'budget', 'scope', 'external', 'general']).optional(),
  likelihood: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  impact: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  mitigation: z.string().optional(),
  owner: z.string().optional(),
});

/* ── Dashboard stats ──────────────────────────────────────────────── */
router.get('/dashboard', validateJwt, async (req, res, next) => {
  try {
    const stats = await ProjectIntelService.getDashboardStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
});

/* ── Projects CRUD ────────────────────────────────────────────────── */
router.get('/', validateJwt, async (req, res, next) => {
  try {
    const { status, priority, limit, offset } = req.query;
    const data = await ProjectIntelService.getProjects(req.user.id, {
      status, priority, limit: Number(limit) || 50, offset: Number(offset) || 0,
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/:id', validateJwt, async (req, res, next) => {
  try {
    const data = await ProjectIntelService.getProject(req.user.id, req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', validateJwt, async (req, res, next) => {
  try {
    const body = createProjectSchema.parse(req.body);
    const data = await ProjectIntelService.createProject(req.user.id, body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/:id', validateJwt, async (req, res, next) => {
  try {
    const body = updateProjectSchema.parse(req.body);
    const data = await ProjectIntelService.updateProject(req.user.id, req.params.id, body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/:id', validateJwt, async (req, res, next) => {
  try {
    await ProjectIntelService.deleteProject(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

/* ── Tasks ────────────────────────────────────────────────────────── */
router.get('/:id/tasks', validateJwt, async (req, res, next) => {
  try {
    const data = await ProjectIntelService.getTasks(req.user.id, req.params.id, { status: req.query.status });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/:id/tasks', validateJwt, async (req, res, next) => {
  try {
    const body = createTaskSchema.parse(req.body);
    const data = await ProjectIntelService.createTask(req.user.id, req.params.id, body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/tasks/:id', validateJwt, async (req, res, next) => {
  try {
    const body = createTaskSchema.partial().parse(req.body);
    const data = await ProjectIntelService.updateTask(req.user.id, req.params.id, body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/tasks/:id', validateJwt, async (req, res, next) => {
  try {
    await ProjectIntelService.deleteTask(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

/* ── Risks ────────────────────────────────────────────────────────── */
router.get('/:id/risks', validateJwt, async (req, res, next) => {
  try {
    const data = await ProjectIntelService.getRisks(req.user.id, req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/:id/risks', validateJwt, async (req, res, next) => {
  try {
    const body = createRiskSchema.parse(req.body);
    const data = await ProjectIntelService.createRisk(req.user.id, req.params.id, body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/risks/:id', validateJwt, async (req, res, next) => {
  try {
    const body = createRiskSchema.partial().parse(req.body);
    const data = await ProjectIntelService.updateRisk(req.user.id, req.params.id, body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

/* ── AI Analysis ──────────────────────────────────────────────────── */
router.post('/:id/analyze-health', validateJwt, async (req, res, next) => {
  try {
    const data = await ProjectIntelService.analyzeHealth(req.user.id, req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/:id/detect-risks', validateJwt, async (req, res, next) => {
  try {
    const data = await ProjectIntelService.detectRisks(req.user.id, req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

/* ── Insights ─────────────────────────────────────────────────────── */
router.get('/:id/insights', validateJwt, async (req, res, next) => {
  try {
    const { type, limit } = req.query;
    const data = await ProjectIntelService.getInsights(req.user.id, req.params.id, { type, limit: Number(limit) || 50 });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/insights/:id/dismiss', validateJwt, async (req, res, next) => {
  try {
    await ProjectIntelService.dismissInsight(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
