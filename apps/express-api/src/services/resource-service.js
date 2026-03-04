/**
 * Resource Allocation & Capacity Planning Service
 * AI-powered workforce optimization and utilization analysis
 */

import { supabase } from '../config/index.js';
import { AIService } from './ai/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('resource-service');

export const ResourceService = {
  /* ── RESOURCES CRUD ───────────────────────────────────────────────── */

  async getResources(userId, { status, department, role } = {}) {
    let q = supabase.from('resources').select('*').eq('user_id', userId).order('name');
    if (status) q = q.eq('status', status);
    if (department) q = q.eq('department', department);
    if (role) q = q.eq('role', role);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },

  async createResource(userId, resource) {
    const { data, error } = await supabase.from('resources').insert({ ...resource, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  },

  async updateResource(userId, resourceId, updates) {
    const { data, error } = await supabase.from('resources').update(updates).eq('id', resourceId).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  },

  async deleteResource(userId, resourceId) {
    const { error } = await supabase.from('resources').delete().eq('id', resourceId).eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  },

  /* ── ALLOCATIONS ──────────────────────────────────────────────────── */

  async getAllocations(userId, { resourceId, projectId, status } = {}) {
    let q = supabase.from('resource_allocations').select('*, resources(name, role)').eq('user_id', userId).order('start_date');
    if (resourceId) q = q.eq('resource_id', resourceId);
    if (projectId) q = q.eq('project_id', projectId);
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },

  async createAllocation(userId, allocation) {
    const { data, error } = await supabase.from('resource_allocations').insert({ ...allocation, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  },

  async updateAllocation(userId, allocId, updates) {
    const { data, error } = await supabase.from('resource_allocations').update(updates).eq('id', allocId).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  },

  async deleteAllocation(userId, allocId) {
    const { error } = await supabase.from('resource_allocations').delete().eq('id', allocId).eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  },

  /* ── UTILIZATION ANALYTICS ────────────────────────────────────────── */

  async getUtilizationReport(userId) {
    const resources = await this.getResources(userId, { status: 'active' });
    const allocations = await this.getAllocations(userId, { status: 'active' });
    const now = new Date();

    const report = resources.map(r => {
      const activeAllocs = allocations.filter(a =>
        a.resource_id === r.id &&
        new Date(a.start_date) <= now &&
        new Date(a.end_date) >= now
      );
      const totalAllocated = activeAllocs.reduce((s, a) => s + (a.allocated_hours || 0), 0);
      const utilization = r.available_hours_week > 0 ? Math.round((totalAllocated / r.available_hours_week) * 100) : 0;

      return {
        resource: { id: r.id, name: r.name, role: r.role, department: r.department, skills: r.skills },
        availableHours: r.available_hours_week,
        allocatedHours: totalAllocated,
        utilization: Math.min(utilization, 200),
        status: utilization > 100 ? 'over-allocated' : utilization > 80 ? 'optimal' : utilization > 0 ? 'under-utilized' : 'idle',
        activeProjects: activeAllocs.map(a => a.project_name),
      };
    });

    const avgUtil = report.length > 0 ? Math.round(report.reduce((s, r) => s + r.utilization, 0) / report.length) : 0;
    const overAllocated = report.filter(r => r.status === 'over-allocated').length;
    const idle = report.filter(r => r.status === 'idle').length;

    return { resources: report, summary: { totalResources: resources.length, avgUtilization: avgUtil, overAllocated, idle, optimalRange: report.filter(r => r.status === 'optimal').length } };
  },

  /* ── AI OPTIMIZATION ──────────────────────────────────────────────── */

  async optimizeAllocations(userId) {
    const utilReport = await this.getUtilizationReport(userId);
    const { data: projects } = await supabase.from('projects').select('id, name, status, priority, target_end_date').eq('user_id', userId).eq('status', 'active');

    const prompt = `Analyze resource allocation and recommend optimizations.

RESOURCES:
${utilReport.resources.map(r => `- ${r.resource.name} (${r.resource.role}): ${r.utilization}% utilized, ${r.allocatedHours}/${r.availableHours}h, skills: ${r.resource.skills?.join(', ') || 'N/A'}, status: ${r.status}`).join('\n')}

ACTIVE PROJECTS:
${(projects || []).map(p => `- ${p.name} (priority: ${p.priority}, due: ${p.target_end_date || 'N/A'})`).join('\n')}

SUMMARY: ${utilReport.summary.totalResources} people, ${utilReport.summary.avgUtilization}% avg util, ${utilReport.summary.overAllocated} over-allocated, ${utilReport.summary.idle} idle

Return ONLY valid JSON:
{
  "recommendations": [
    { "type": "rebalance|hire|upskill|reassign", "priority": "high|medium|low", "title": "<short>", "detail": "<action>", "affectedResources": ["name1"] }
  ],
  "riskAreas": ["<string>"],
  "capacityForecast": { "current": "<adequate|tight|insufficient>", "nextMonth": "<adequate|tight|insufficient>", "hiring_needed": <number> }
}`;

    try {
      const aiResult = await AIService.chat({
        messages: [{ role: 'system', content: 'You are a resource planning AI. Return JSON only.' }, { role: 'user', content: prompt }],
        userId, temperature: 0.3,
      });
      const text = aiResult.message?.content || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON');
      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      logger.error('AI optimization failed', err);
      return {
        recommendations: utilReport.resources.filter(r => r.status === 'over-allocated').map(r => ({
          type: 'rebalance', priority: 'high', title: `${r.resource.name} is over-allocated`,
          detail: `At ${r.utilization}% utilization. Consider reassigning some workload.`, affectedResources: [r.resource.name],
        })),
        riskAreas: utilReport.summary.overAllocated > 0 ? ['Team overallocation risk'] : [],
        capacityForecast: { current: utilReport.summary.avgUtilization > 85 ? 'tight' : 'adequate', nextMonth: 'adequate', hiring_needed: 0 },
      };
    }
  },

  /* ── DASHBOARD ────────────────────────────────────────────────────── */

  async getDashboard(userId) {
    const resources = await this.getResources(userId);
    const allocations = await this.getAllocations(userId);
    const utilReport = await this.getUtilizationReport(userId);

    const departments = [...new Set(resources.map(r => r.department).filter(Boolean))];
    const deptUtil = departments.map(dept => {
      const deptResources = utilReport.resources.filter(r => r.resource.department === dept);
      return {
        department: dept,
        avgUtilization: deptResources.length > 0 ? Math.round(deptResources.reduce((s, r) => s + r.utilization, 0) / deptResources.length) : 0,
        count: deptResources.length,
      };
    });

    const skillsMap = {};
    resources.forEach(r => (r.skills || []).forEach(s => { skillsMap[s] = (skillsMap[s] || 0) + 1; }));
    const topSkills = Object.entries(skillsMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([skill, count]) => ({ skill, count }));

    return {
      totalResources: resources.length,
      activeResources: resources.filter(r => r.status === 'active').length,
      totalAllocations: allocations.length,
      ...utilReport.summary,
      departmentUtilization: deptUtil,
      topSkills,
      utilizationBreakdown: utilReport.resources,
    };
  },
};
