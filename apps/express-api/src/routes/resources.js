/**
 * Resource Allocation & Capacity Routes
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateJwt } from '../middleware/auth.js';
import { ResourceService } from '../services/resource-service.js';
import { createLogger } from '../utils/logger.js';

const router = Router();
const logger = createLogger('resource-routes');

const createResourceSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  skills: z.array(z.string()).optional(),
  cost_rate: z.number().optional(),
  available_hours_week: z.number().optional(),
});

const createAllocationSchema = z.object({
  resource_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  project_name: z.string().min(1),
  allocated_hours: z.number().positive(),
  start_date: z.string(),
  end_date: z.string(),
  role_on_project: z.string().optional(),
});

/* Dashboard */
router.get('/dashboard', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ResourceService.getDashboard(req.user.id) }); } catch (err) { next(err); }
});

/* Resources */
router.get('/', validateJwt, async (req, res, next) => {
  try {
    const { status, department, role } = req.query;
    res.json({ success: true, data: await ResourceService.getResources(req.user.id, { status, department, role }) });
  } catch (err) { next(err); }
});

router.post('/', validateJwt, async (req, res, next) => {
  try {
    const body = createResourceSchema.parse(req.body);
    res.status(201).json({ success: true, data: await ResourceService.createResource(req.user.id, body) });
  } catch (err) { next(err); }
});

router.patch('/:id', validateJwt, async (req, res, next) => {
  try {
    const body = createResourceSchema.partial().parse(req.body);
    res.json({ success: true, data: await ResourceService.updateResource(req.user.id, req.params.id, body) });
  } catch (err) { next(err); }
});

router.delete('/:id', validateJwt, async (req, res, next) => {
  try { await ResourceService.deleteResource(req.user.id, req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});

/* Allocations */
router.get('/allocations', validateJwt, async (req, res, next) => {
  try {
    const { resource_id, project_id, status } = req.query;
    res.json({ success: true, data: await ResourceService.getAllocations(req.user.id, { resourceId: resource_id, projectId: project_id, status }) });
  } catch (err) { next(err); }
});

router.post('/allocations', validateJwt, async (req, res, next) => {
  try {
    const body = createAllocationSchema.parse(req.body);
    res.status(201).json({ success: true, data: await ResourceService.createAllocation(req.user.id, body) });
  } catch (err) { next(err); }
});

router.patch('/allocations/:id', validateJwt, async (req, res, next) => {
  try {
    const body = createAllocationSchema.partial().parse(req.body);
    res.json({ success: true, data: await ResourceService.updateAllocation(req.user.id, req.params.id, body) });
  } catch (err) { next(err); }
});

router.delete('/allocations/:id', validateJwt, async (req, res, next) => {
  try { await ResourceService.deleteAllocation(req.user.id, req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});

/* Utilization */
router.get('/utilization', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ResourceService.getUtilizationReport(req.user.id) }); } catch (err) { next(err); }
});

/* AI Optimize */
router.post('/optimize', validateJwt, async (req, res, next) => {
  try { res.json({ success: true, data: await ResourceService.optimizeAllocations(req.user.id) }); } catch (err) { next(err); }
});

export default router;
