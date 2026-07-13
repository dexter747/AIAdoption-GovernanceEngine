import { Router } from 'express';
import { z } from 'zod';
import { validateJwt } from '../middleware/auth.js';
import fraudService from '../services/fraud-detection-service.js';

const router = Router();
router.use(validateJwt);

/* ── Transactions ── */
router.get('/transactions', async (req, res, next) => {
  try {
    const { limit, offset, status, flagged } = req.query;
    res.json({ success: true, data: await fraudService.getTransactions(req.user.id, { limit: limit ? Number(limit) : undefined, offset: offset ? Number(offset) : undefined, status, flagged: flagged === 'true' ? true : flagged === 'false' ? false : undefined }) });
  } catch (err) { next(err); }
});

router.post('/transactions', async (req, res, next) => {
  try {
    const schema = z.object({ transaction_ref: z.string().min(1), type: z.enum(['payment', 'transfer', 'withdrawal', 'deposit', 'refund', 'adjustment']).optional(), amount: z.number().positive(), currency: z.string().optional(), source_account: z.string().optional(), destination_account: z.string().optional(), counterparty: z.string().optional(), country_code: z.string().optional(), channel: z.enum(['online', 'mobile', 'branch', 'atm', 'wire', 'api']).optional() });
    const body = schema.parse(req.body);
    res.status(201).json({ success: true, data: await fraudService.createTransaction(req.user.id, body) });
  } catch (err) { next(err); }
});

router.patch('/transactions/:id', async (req, res, next) => {
  try { res.json({ success: true, data: await fraudService.updateTransaction(req.params.id, req.user.id, req.body) }); }
  catch (err) { next(err); }
});

/* ── AI Analysis ── */
router.post('/transactions/:id/analyze', async (req, res, next) => {
  try { res.json({ success: true, data: await fraudService.analyzeTransaction(req.params.id, req.user.id) }); }
  catch (err) { next(err); }
});

router.post('/detect-patterns', async (req, res, next) => {
  try { res.json({ success: true, data: await fraudService.detectPatterns(req.user.id) }); }
  catch (err) { next(err); }
});

/* ── Alerts ── */
router.get('/alerts', async (req, res, next) => {
  try {
    const { status, severity } = req.query;
    res.json({ success: true, data: await fraudService.getAlerts(req.user.id, { status, severity }) });
  } catch (err) { next(err); }
});

router.patch('/alerts/:id', async (req, res, next) => {
  try { res.json({ success: true, data: await fraudService.updateAlert(req.params.id, req.user.id, req.body) }); }
  catch (err) { next(err); }
});

/* ── Patterns ── */
router.get('/patterns', async (req, res, next) => {
  try { res.json({ success: true, data: await fraudService.getPatterns(req.user.id) }); }
  catch (err) { next(err); }
});

router.post('/patterns', async (req, res, next) => {
  try {
    const schema = z.object({ name: z.string().min(1), pattern_type: z.enum(['velocity', 'amount', 'geographic', 'temporal', 'network', 'behavioral', 'custom']), description: z.string().optional(), detection_rules: z.record(z.any()).optional(), severity: z.string().optional() });
    const body = schema.parse(req.body);
    res.status(201).json({ success: true, data: await fraudService.createPattern(req.user.id, body) });
  } catch (err) { next(err); }
});

router.patch('/patterns/:id/toggle', async (req, res, next) => {
  try { res.json({ success: true, data: await fraudService.togglePattern(req.params.id, req.user.id) }); }
  catch (err) { next(err); }
});

/* ── Investigations ── */
router.get('/investigations', async (req, res, next) => {
  try { res.json({ success: true, data: await fraudService.getInvestigations(req.user.id) }); }
  catch (err) { next(err); }
});

router.post('/investigations', async (req, res, next) => {
  try {
    const schema = z.object({ alert_id: z.string().uuid().optional(), title: z.string().min(1), summary: z.string().optional(), priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(), total_exposure: z.number().optional() });
    const body = schema.parse(req.body);
    res.status(201).json({ success: true, data: await fraudService.createInvestigation(req.user.id, body) });
  } catch (err) { next(err); }
});

router.patch('/investigations/:id', async (req, res, next) => {
  try { res.json({ success: true, data: await fraudService.updateInvestigation(req.params.id, req.user.id, req.body) }); }
  catch (err) { next(err); }
});

/* ── Dashboard ── */
router.get('/dashboard', async (req, res, next) => {
  try { res.json({ success: true, data: await fraudService.getDashboard(req.user.id) }); }
  catch (err) { next(err); }
});

export default router;
