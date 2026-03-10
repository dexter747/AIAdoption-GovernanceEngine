/**
 * AML & SAR Automation Routes
 * Anti-Money Laundering monitoring and Suspicious Activity Reporting
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateJwt } from '../middleware/auth.js';
import { AMLService } from '../services/aml-service.js';
import { createLogger } from '../utils/logger.js';

const router = Router();
const logger = createLogger('aml-routes');

/* ── Schemas ── */
const createAccountSchema = z.object({
  account_ref: z.string().min(1),
  account_holder: z.string().min(1),
  account_type: z.enum(['individual', 'corporate', 'trust', 'joint', 'correspondent']).optional(),
  jurisdiction: z.string().optional(),
  risk_tier: z.enum(['low', 'standard', 'enhanced', 'high', 'prohibited']).optional(),
  pep_flag: z.boolean().optional(),
  sanctions_flag: z.boolean().optional(),
});

const createTxnSchema = z.object({
  account_id: z.string().uuid().optional(),
  transaction_ref: z.string().min(1),
  transaction_type: z.enum(['transfer', 'deposit', 'withdrawal', 'wire', 'cash', 'trade', 'currency_exchange', 'loan_payment', 'card_payment']).optional(),
  amount: z.number().positive(),
  currency: z.string().optional(),
  counterparty_name: z.string().optional(),
  counterparty_jurisdiction: z.string().optional(),
  channel: z.enum(['online', 'branch', 'atm', 'wire', 'swift', 'mobile', 'api']).optional(),
});

const createRuleSchema = z.object({
  rule_name: z.string().min(1),
  rule_type: z.enum(['threshold', 'velocity', 'pattern', 'geographic', 'behavioral', 'structuring', 'sanctions', 'pep']).optional(),
  description: z.string().optional(),
  conditions: z.object({}).passthrough().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

const createSARSchema = z.object({
  subject_name: z.string().min(1),
  subject_account: z.string().optional(),
  subject_type: z.enum(['individual', 'corporate', 'trust']).optional(),
  report_type: z.enum(['SAR', 'STR', 'CTR', 'MLRO_escalation']).optional(),
  priority: z.enum(['standard', 'urgent', 'critical']).optional(),
  total_suspicious_amount: z.number().optional(),
  narrative: z.string().optional(),
  supporting_alerts: z.array(z.string()).optional(),
});

/* ── Dashboard ── */
router.get('/dashboard', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await AMLService.getDashboard(req.user.id) }); } catch (err) { next(err); }
});

/* ── Accounts ── */
router.get('/accounts', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await AMLService.getAccounts(req.user.id, req.query) }); } catch (err) { next(err); }
});

router.post('/accounts', validateJwt, async (req, res, next) => {
  try {
    const body = createAccountSchema.parse(req.body);
    res.status(201).json({ success: true, data: await AMLService.createAccount(req.user.id, body) });
  } catch (err) { next(err); }
});

router.patch('/accounts/:id', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await AMLService.updateAccount(req.user.id, req.params.id, req.body) }); } catch (err) { next(err); }
});

router.delete('/accounts/:id', validateJwt, async (req, res, next) => {
  try { await AMLService.deleteAccount(req.user.id, req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});

/* ── Transactions ── */
router.get('/transactions', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await AMLService.getTransactions(req.user.id, req.query) }); } catch (err) { next(err); }
});

router.post('/transactions', validateJwt, async (req, res, next) => {
  try {
    const body = createTxnSchema.parse(req.body);
    res.status(201).json({ success: true, data: await AMLService.createTransaction(req.user.id, body) });
  } catch (err) { next(err); }
});

router.post('/transactions/:id/screen', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await AMLService.screenTransaction(req.user.id, req.params.id) }); } catch (err) { next(err); }
});

/* ── Rules ── */
router.get('/rules', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await AMLService.getRules(req.user.id) }); } catch (err) { next(err); }
});

router.post('/rules', validateJwt, async (req, res, next) => {
  try {
    const body = createRuleSchema.parse(req.body);
    res.status(201).json({ success: true, data: await AMLService.createRule(req.user.id, body) });
  } catch (err) { next(err); }
});

router.post('/rules/:id/toggle', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await AMLService.toggleRule(req.user.id, req.params.id) }); } catch (err) { next(err); }
});

/* ── Alerts ── */
router.get('/alerts', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await AMLService.getAlerts(req.user.id, req.query) }); } catch (err) { next(err); }
});

router.patch('/alerts/:id', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await AMLService.updateAlert(req.user.id, req.params.id, req.body) }); } catch (err) { next(err); }
});

/* ── SARs ── */
router.get('/sars', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await AMLService.getSARReports(req.user.id, req.query) }); } catch (err) { next(err); }
});

router.get('/sars/:id', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await AMLService.getSARReport(req.user.id, req.params.id) }); } catch (err) { next(err); }
});

router.post('/sars', validateJwt, async (req, res, next) => {
  try {
    const body = createSARSchema.parse(req.body);
    res.status(201).json({ success: true, data: await AMLService.createSAR(req.user.id, body) });
  } catch (err) { next(err); }
});

router.patch('/sars/:id', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await AMLService.updateSAR(req.user.id, req.params.id, req.body) }); } catch (err) { next(err); }
});

router.post('/sars/:id/generate-narrative', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await AMLService.generateSARNarrative(req.user.id, req.params.id) }); } catch (err) { next(err); }
});

export default router;
