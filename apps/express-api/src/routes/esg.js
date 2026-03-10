/**
 * ESG & Sustainability Reporting Routes
 * Environmental, Social, and Governance data management and report generation
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateJwt } from '../middleware/auth.js';
import { ESGService } from '../services/esg-service.js';
import { createLogger } from '../utils/logger.js';

const router = Router();
const logger = createLogger('esg-routes');

/* ── Schemas ── */
const createFrameworkSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  version: z.string().optional(),
  description: z.string().optional(),
  framework_type: z.enum(['reporting', 'regulation', 'standard', 'taxonomy', 'benchmark']).optional(),
  jurisdiction: z.string().optional(),
  compliance_deadline: z.string().optional(),
});

const createMetricSchema = z.object({
  metric_name: z.string().min(1),
  category: z.enum(['environmental', 'social', 'governance']),
  subcategory: z.string().optional(),
  unit: z.string().optional(),
  value: z.number().optional(),
  target_value: z.number().optional(),
  previous_value: z.number().optional(),
  reporting_year: z.number().optional(),
  data_source: z.string().optional(),
  data_quality: z.enum(['measured', 'calculated', 'estimated', 'third_party_verified']).optional(),
  framework_id: z.string().uuid().optional(),
  framework_ref: z.string().optional(),
});

const createReportSchema = z.object({
  title: z.string().min(1),
  report_type: z.enum(['annual', 'quarterly', 'ad_hoc', 'board_pack', 'regulatory_filing', 'investor_update']).optional(),
  framework_id: z.string().uuid().optional(),
  reporting_year: z.number().optional(),
});

const createTargetSchema = z.object({
  target_name: z.string().min(1),
  category: z.enum(['environmental', 'social', 'governance']),
  metric_name: z.string().optional(),
  baseline_value: z.number().optional(),
  baseline_year: z.number().optional(),
  target_value: z.number().optional(),
  target_year: z.number().optional(),
  current_value: z.number().optional(),
  description: z.string().optional(),
  science_based: z.boolean().optional(),
});

/* ── Dashboard ── */
router.get('/dashboard', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ESGService.getDashboard(req.user.id) }); } catch (err) { next(err); }
});

/* ── Frameworks ── */
router.get('/frameworks', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ESGService.getFrameworks(req.user.id) }); } catch (err) { next(err); }
});

router.post('/frameworks', validateJwt, async (req, res, next) => {
  try {
    const body = createFrameworkSchema.parse(req.body);
    res.status(201).json({ success: true, data: await ESGService.createFramework(req.user.id, body) });
  } catch (err) { next(err); }
});

router.delete('/frameworks/:id', validateJwt, async (req, res, next) => {
  try { await ESGService.deleteFramework(req.user.id, req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});

/* ── Metrics ── */
router.get('/metrics', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ESGService.getMetrics(req.user.id, req.query) }); } catch (err) { next(err); }
});

router.post('/metrics', validateJwt, async (req, res, next) => {
  try {
    const body = createMetricSchema.parse(req.body);
    res.status(201).json({ success: true, data: await ESGService.createMetric(req.user.id, body) });
  } catch (err) { next(err); }
});

router.patch('/metrics/:id', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ESGService.updateMetric(req.user.id, req.params.id, req.body) }); } catch (err) { next(err); }
});

router.delete('/metrics/:id', validateJwt, async (req, res, next) => {
  try { await ESGService.deleteMetric(req.user.id, req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});

/* ── Data Sources ── */
router.get('/data-sources', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ESGService.getDataSources(req.user.id) }); } catch (err) { next(err); }
});

router.post('/data-sources', validateJwt, async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await ESGService.createDataSource(req.user.id, req.body) }); } catch (err) { next(err); }
});

router.delete('/data-sources/:id', validateJwt, async (req, res, next) => {
  try { await ESGService.deleteDataSource(req.user.id, req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});

/* ── Reports ── */
router.get('/reports', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ESGService.getReports(req.user.id, req.query) }); } catch (err) { next(err); }
});

router.get('/reports/:id', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ESGService.getReport(req.user.id, req.params.id) }); } catch (err) { next(err); }
});

router.post('/reports', validateJwt, async (req, res, next) => {
  try {
    const body = createReportSchema.parse(req.body);
    res.status(201).json({ success: true, data: await ESGService.createReport(req.user.id, body) });
  } catch (err) { next(err); }
});

router.patch('/reports/:id', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ESGService.updateReport(req.user.id, req.params.id, req.body) }); } catch (err) { next(err); }
});

router.post('/reports/:id/generate', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ESGService.generateReport(req.user.id, req.params.id) }); } catch (err) { next(err); }
});

/* ── Targets ── */
router.get('/targets', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ESGService.getTargets(req.user.id) }); } catch (err) { next(err); }
});

router.post('/targets', validateJwt, async (req, res, next) => {
  try {
    const body = createTargetSchema.parse(req.body);
    res.status(201).json({ success: true, data: await ESGService.createTarget(req.user.id, body) });
  } catch (err) { next(err); }
});

router.patch('/targets/:id', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ESGService.updateTarget(req.user.id, req.params.id, req.body) }); } catch (err) { next(err); }
});

export default router;
