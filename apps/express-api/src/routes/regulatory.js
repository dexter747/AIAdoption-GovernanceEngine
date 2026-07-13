/**
 * Regulatory Intelligence Routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateJwt } from '../middleware/auth.js';
import { RegulatoryService } from '../services/regulatory-service.js';

const router = Router();

const createChangeSchema = z.object({
  title: z.string().min(1).max(500),
  summary: z.string().optional(),
  body: z.string().optional(),
  change_type: z.enum(['new_regulation', 'amendment', 'guidance', 'consultation', 'enforcement', 'update']).optional(),
  jurisdiction: z.string().optional(),
  sector: z.array(z.string()).optional(),
  effective_date: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  external_url: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
});

const createSourceSchema = z.object({
  name: z.string().min(1).max(200),
  url: z.string().url().optional(),
  type: z.enum(['website', 'rss', 'api', 'document', 'manual']).optional(),
  jurisdiction: z.string().optional(),
  sector: z.string().optional(),
  check_frequency: z.enum(['hourly', 'daily', 'weekly', 'manual']).optional(),
});

/* Dashboard */
router.get('/dashboard', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await RegulatoryService.getDashboard(req.user.id) }); } catch (err) { next(err); }
});

/* Sources */
router.get('/sources', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await RegulatoryService.getSources(req.user.id) }); } catch (err) { next(err); }
});

router.post('/sources', validateJwt, async (req, res, next) => {
  try {
    const body = createSourceSchema.parse(req.body);
    res.status(201).json({ success: true, data: await RegulatoryService.createSource(req.user.id, body) });
  } catch (err) { next(err); }
});

router.delete('/sources/:id', validateJwt, async (req, res, next) => {
  try { await RegulatoryService.deleteSource(req.user.id, req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});

/* Changes */
router.get('/changes', validateJwt, async (req, res, next) => {
  try {
    const { status, severity, sector, limit, offset } = req.query;
    res.json({ success: true, data: await RegulatoryService.getChanges(req.user.id, { status, severity, sector, limit: Number(limit) || 50, offset: Number(offset) || 0 }) });
  } catch (err) { next(err); }
});

router.get('/changes/:id', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await RegulatoryService.getChange(req.user.id, req.params.id) }); } catch (err) { next(err); }
});

router.post('/changes', validateJwt, async (req, res, next) => {
  try {
    const body = createChangeSchema.parse(req.body);
    res.status(201).json({ success: true, data: await RegulatoryService.createChange(req.user.id, body) });
  } catch (err) { next(err); }
});

router.patch('/changes/:id/status', validateJwt, async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(['new', 'under_review', 'assessed', 'implemented', 'dismissed']) }).parse(req.body);
    res.json({ success: true, data: await RegulatoryService.updateChangeStatus(req.user.id, req.params.id, status) });
  } catch (err) { next(err); }
});

/* AI Analysis */
router.post('/changes/:id/analyze', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await RegulatoryService.analyzeImpact(req.user.id, req.params.id) }); } catch (err) { next(err); }
});

router.post('/scan', validateJwt, async (req, res, next) => {
  try {
    const { text } = z.object({ text: z.string().min(1).max(10000) }).parse(req.body);
    res.json({ success: true, data: await RegulatoryService.scanForChanges(req.user.id, text) });
  } catch (err) { next(err); }
});

/* Assessments */
router.get('/changes/:id/assessments', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await RegulatoryService.getAssessments(req.user.id, req.params.id) }); } catch (err) { next(err); }
});

router.patch('/assessments/:id', validateJwt, async (req, res, next) => {
  try {
    const body = z.object({ status: z.enum(['pending', 'in_progress', 'completed']).optional(), current_compliance: z.enum(['compliant', 'partial', 'non_compliant', 'unknown']).optional(), assigned_to: z.string().optional() }).parse(req.body);
    res.json({ success: true, data: await RegulatoryService.updateAssessment(req.user.id, req.params.id, body) });
  } catch (err) { next(err); }
});

export default router;
