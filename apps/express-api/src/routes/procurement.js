/**
 * Procurement & Contract Risk Routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateJwt } from '../middleware/auth.js';
import { ProcurementService } from '../services/procurement-service.js';

const router = Router();

const createContractSchema = z.object({
  title: z.string().min(1).max(300),
  vendor: z.string().min(1).max(200),
  contract_type: z.enum(['service', 'license', 'maintenance', 'consulting', 'procurement', 'lease', 'other']).optional(),
  value: z.number().optional(),
  currency: z.string().max(3).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  renewal_date: z.string().optional(),
  auto_renew: z.boolean().optional(),
  department: z.string().optional(),
  owner: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/* Dashboard */
router.get('/dashboard', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ProcurementService.getDashboard(req.user.id) }); } catch (err) { next(err); }
});

/* Contracts CRUD */
router.get('/contracts', validateJwt, async (req, res, next) => {
  try {
    const { status, vendor, limit } = req.query;
    res.json({ success: true, data: await ProcurementService.getContracts(req.user.id, { status, vendor, limit: Number(limit) || 50 }) });
  } catch (err) { next(err); }
});

router.get('/contracts/:id', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ProcurementService.getContract(req.user.id, req.params.id) }); } catch (err) { next(err); }
});

router.post('/contracts', validateJwt, async (req, res, next) => {
  try {
    const body = createContractSchema.parse(req.body);
    res.status(201).json({ success: true, data: await ProcurementService.createContract(req.user.id, body) });
  } catch (err) { next(err); }
});

router.patch('/contracts/:id', validateJwt, async (req, res, next) => {
  try {
    const body = createContractSchema.partial().parse(req.body);
    res.json({ success: true, data: await ProcurementService.updateContract(req.user.id, req.params.id, body) });
  } catch (err) { next(err); }
});

router.delete('/contracts/:id', validateJwt, async (req, res, next) => {
  try { await ProcurementService.deleteContract(req.user.id, req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});

/* Clauses */
router.get('/contracts/:id/clauses', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ProcurementService.getClauses(req.user.id, req.params.id) }); } catch (err) { next(err); }
});

/* AI Analysis */
router.post('/contracts/:id/analyze', validateJwt, async (req, res, next) => {
  try {
    const { contractText } = z.object({ contractText: z.string().max(10000).optional() }).parse(req.body);
    res.json({ success: true, data: await ProcurementService.analyzeContract(req.user.id, req.params.id, contractText) });
  } catch (err) { next(err); }
});

/* Reviews */
router.get('/contracts/:id/reviews', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ProcurementService.getReviews(req.user.id, req.params.id) }); } catch (err) { next(err); }
});

export default router;
