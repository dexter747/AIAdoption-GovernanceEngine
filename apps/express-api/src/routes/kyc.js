import { Router } from 'express';
import { z } from 'zod';
import { validateJwt } from '../middleware/auth.js';
import kycService from '../services/kyc-service.js';

const router = Router();
router.use(validateJwt);

/* ── Clients ── */
router.get('/clients', async (req, res, next) => {
  try { res.json({ success: true, data: await kycService.getClients(req.user.id) }); }
  catch (err) { next(err); }
});

router.get('/clients/:id', async (req, res, next) => {
  try { res.json({ success: true, data: await kycService.getClient(req.params.id, req.user.id) }); }
  catch (err) { next(err); }
});

router.post('/clients', async (req, res, next) => {
  try {
    const schema = z.object({ name: z.string().min(1), entity_type: z.enum(['individual', 'corporate', 'trust', 'fund']).optional(), jurisdiction: z.string().optional(), email: z.string().email().optional(), phone: z.string().optional(), industry: z.string().optional(), pep_status: z.boolean().optional(), source_of_wealth: z.string().optional(), source_of_funds: z.string().optional() });
    const body = schema.parse(req.body);
    res.status(201).json({ success: true, data: await kycService.createClient(req.user.id, body) });
  } catch (err) { next(err); }
});

router.patch('/clients/:id', async (req, res, next) => {
  try { res.json({ success: true, data: await kycService.updateClient(req.params.id, req.user.id, req.body) }); }
  catch (err) { next(err); }
});

router.delete('/clients/:id', async (req, res, next) => {
  try { await kycService.deleteClient(req.params.id, req.user.id); res.json({ success: true }); }
  catch (err) { next(err); }
});

/* ── KYC Checks ── */
router.get('/clients/:clientId/checks', async (req, res, next) => {
  try { res.json({ success: true, data: await kycService.getChecks(req.params.clientId, req.user.id) }); }
  catch (err) { next(err); }
});

router.post('/clients/:clientId/checks', async (req, res, next) => {
  try {
    const schema = z.object({ check_type: z.enum(['identity', 'address', 'sanctions', 'pep', 'adverse_media', 'source_of_wealth', 'source_of_funds', 'ubo', 'enhanced_due_diligence']), notes: z.string().optional() });
    const body = schema.parse(req.body);
    res.status(201).json({ success: true, data: await kycService.createCheck(req.params.clientId, req.user.id, body) });
  } catch (err) { next(err); }
});

router.patch('/checks/:id', async (req, res, next) => {
  try { res.json({ success: true, data: await kycService.updateCheck(req.params.id, req.user.id, req.body) }); }
  catch (err) { next(err); }
});

/* ── Documents ── */
router.get('/clients/:clientId/documents', async (req, res, next) => {
  try { res.json({ success: true, data: await kycService.getDocuments(req.params.clientId, req.user.id) }); }
  catch (err) { next(err); }
});

router.post('/clients/:clientId/documents', async (req, res, next) => {
  try {
    const schema = z.object({ document_type: z.enum(['passport', 'national_id', 'driving_license', 'utility_bill', 'bank_statement', 'tax_return', 'incorporation_cert', 'shareholder_register', 'trust_deed', 'financial_statement', 'other']), file_name: z.string().min(1), file_url: z.string().optional(), notes: z.string().optional() });
    const body = schema.parse(req.body);
    res.status(201).json({ success: true, data: await kycService.addDocument(req.params.clientId, req.user.id, body) });
  } catch (err) { next(err); }
});

router.patch('/documents/:id', async (req, res, next) => {
  try { res.json({ success: true, data: await kycService.updateDocument(req.params.id, req.user.id, req.body) }); }
  catch (err) { next(err); }
});

/* ── AI Analysis ── */
router.post('/clients/:id/assess-risk', async (req, res, next) => {
  try { res.json({ success: true, data: await kycService.assessClientRisk(req.params.id, req.user.id) }); }
  catch (err) { next(err); }
});

router.post('/documents/:id/analyze', async (req, res, next) => {
  try {
    const { documentText } = z.object({ documentText: z.string().min(1) }).parse(req.body);
    res.json({ success: true, data: await kycService.analyzeDocument(req.params.id, req.user.id, documentText) });
  } catch (err) { next(err); }
});

/* ── Workflows ── */
router.get('/clients/:clientId/workflows', async (req, res, next) => {
  try { res.json({ success: true, data: await kycService.getWorkflows(req.params.clientId, req.user.id) }); }
  catch (err) { next(err); }
});

router.post('/clients/:clientId/workflows', async (req, res, next) => {
  try {
    const { template } = z.object({ template: z.enum(['standard', 'enhanced', 'corporate']).optional() }).parse(req.body);
    res.status(201).json({ success: true, data: await kycService.createWorkflow(req.params.clientId, req.user.id, template) });
  } catch (err) { next(err); }
});

router.post('/workflows/:id/advance', async (req, res, next) => {
  try { res.json({ success: true, data: await kycService.advanceWorkflow(req.params.id, req.user.id) }); }
  catch (err) { next(err); }
});

/* ── Dashboard ── */
router.get('/dashboard', async (req, res, next) => {
  try { res.json({ success: true, data: await kycService.getDashboard(req.user.id) }); }
  catch (err) { next(err); }
});

export default router;
