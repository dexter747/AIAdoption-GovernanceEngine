import { Router } from 'express';
import { validateJwt } from '../middleware/auth.js';
import reportingService from '../services/reporting-service.js';

const router = Router();
router.use(validateJwt);

// Dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const data = await reportingService.getDashboard(req.user.id);
    res.json(data);
  } catch (err) { next(err); }
});

// Templates
router.get('/templates', async (req, res, next) => {
  try {
    const data = await reportingService.getTemplates(req.user.id);
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/templates', async (req, res, next) => {
  try {
    const data = await reportingService.createTemplate(req.user.id, req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
});

// Reports
router.get('/reports', async (req, res, next) => {
  try {
    const data = await reportingService.getReports(req.user.id);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/reports/:id', async (req, res, next) => {
  try {
    const data = await reportingService.getReport(req.user.id, req.params.id);
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/reports', async (req, res, next) => {
  try {
    const data = await reportingService.createReport(req.user.id, req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
});

router.post('/reports/:id/generate', async (req, res, next) => {
  try {
    const data = await reportingService.generateReportContent(req.user.id, req.params.id, req.aiProvider);
    res.json(data);
  } catch (err) { next(err); }
});

export default router;
