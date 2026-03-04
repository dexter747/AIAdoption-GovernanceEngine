/**
 * Project Intelligence Service
 * AI-powered project health analysis, risk detection, and forecasting
 */

import { supabase } from '../config/supabase.js';
import { AIService } from './ai/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('project-intel-service');

export const ProjectIntelService = {
  /* ── PROJECTS CRUD ────────────────────────────────────────────────── */

  async getProjects(userId, { status, priority, limit = 50, offset = 0 } = {}) {
    let query = supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getProject(userId, projectId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async createProject(userId, project) {
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...project, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateProject(userId, projectId, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProject(userId, projectId) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  },

  /* ── TASKS ────────────────────────────────────────────────────────── */

  async getTasks(userId, projectId, { status } = {}) {
    let query = supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createTask(userId, projectId, task) {
    const { data, error } = await supabase
      .from('project_tasks')
      .insert({ ...task, project_id: projectId, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTask(userId, taskId, updates) {
    const { data, error } = await supabase
      .from('project_tasks')
      .update(updates)
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTask(userId, taskId) {
    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  },

  /* ── RISKS ────────────────────────────────────────────────────────── */

  async getRisks(userId, projectId) {
    const { data, error } = await supabase
      .from('project_risks')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createRisk(userId, projectId, risk) {
    const { data, error } = await supabase
      .from('project_risks')
      .insert({ ...risk, project_id: projectId, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateRisk(userId, riskId, updates) {
    const { data, error } = await supabase
      .from('project_risks')
      .update(updates)
      .eq('id', riskId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /* ── AI ANALYSIS ──────────────────────────────────────────────────── */

  async analyzeHealth(userId, projectId) {
    const project = await this.getProject(userId, projectId);
    const tasks = await this.getTasks(userId, projectId);
    const risks = await this.getRisks(userId, projectId);

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;
    const openRisks = risks.filter(r => r.status === 'open' || r.status === 'mitigating').length;
    const criticalRisks = risks.filter(r => (r.likelihood === 'critical' || r.impact === 'critical') && r.status === 'open').length;

    const budgetUtil = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;

    const prompt = `Analyze this project's health and provide structured insights.

PROJECT: ${project.name}
Status: ${project.status} | Priority: ${project.priority}
Start: ${project.start_date || 'N/A'} | Target End: ${project.target_end_date || 'N/A'}
Budget: ${project.budget || 'N/A'} | Spent: ${project.spent || 0} (${budgetUtil.toFixed(1)}%)

TASKS: ${totalTasks} total, ${doneTasks} done, ${blockedTasks} blocked, ${overdueTasks} overdue
RISKS: ${risks.length} total, ${openRisks} open, ${criticalRisks} critical

Respond ONLY with valid JSON:
{
  "healthScore": <0-100>,
  "status": "on_track" | "at_risk" | "off_track",
  "summary": "<2-sentence summary>",
  "insights": [
    { "type": "health|risk|recommendation|forecast|anomaly", "severity": "info|warning|critical", "title": "<short title>", "body": "<actionable detail>" }
  ],
  "forecasts": {
    "estimatedCompletion": "<ISO date or null>",
    "budgetForecast": "<on_budget|over_budget|under_budget>",
    "riskTrend": "<increasing|stable|decreasing>"
  }
}`;

    try {
      const aiResult = await AIService.chat({
        messages: [{ role: 'system', content: 'You are a project management AI that analyzes projects and provides structured JSON analysis.' }, { role: 'user', content: prompt }],
        userId, temperature: 0.2,
      });

      const text = aiResult.message?.content || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in AI response');
      const analysis = JSON.parse(jsonMatch[0]);

      // Update project health score
      await supabase.from('projects').update({ health_score: analysis.healthScore }).eq('id', projectId);

      // Store insights
      if (analysis.insights?.length > 0) {
        const insightRows = analysis.insights.map(i => ({
          project_id: projectId,
          user_id: userId,
          type: i.type,
          severity: i.severity,
          title: i.title,
          body: i.body,
          ai_model: aiResult.model || 'unknown',
          ai_provider: aiResult.provider || 'unknown',
        }));
        await supabase.from('project_insights').insert(insightRows);
      }

      return analysis;
    } catch (err) {
      logger.error('AI health analysis failed', err);
      // Fallback algorithmic score
      let score = 100;
      if (overdueTasks > 0) score -= overdueTasks * 8;
      if (blockedTasks > 0) score -= blockedTasks * 5;
      if (criticalRisks > 0) score -= criticalRisks * 15;
      if (budgetUtil > 90) score -= 10;
      score = Math.max(0, Math.min(100, score));
      await supabase.from('projects').update({ health_score: score }).eq('id', projectId);

      return {
        healthScore: score,
        status: score > 70 ? 'on_track' : score > 40 ? 'at_risk' : 'off_track',
        summary: `Project has ${totalTasks} tasks (${doneTasks} done, ${overdueTasks} overdue) and ${openRisks} open risks.`,
        insights: [],
        forecasts: null,
      };
    }
  },

  async detectRisks(userId, projectId) {
    const project = await this.getProject(userId, projectId);
    const tasks = await this.getTasks(userId, projectId);

    const prompt = `Detect project risks from these tasks.

PROJECT: ${project.name} (${project.status}, due ${project.target_end_date || 'no date'})
TASKS:
${tasks.slice(0, 50).map(t => `- [${t.status}] ${t.title} (due: ${t.due_date || 'N/A'}, est: ${t.estimated_hours || '?'}h, actual: ${t.actual_hours || '?'}h)`).join('\n')}

Return ONLY valid JSON array:
[{ "title": "<risk>", "description": "<detail>", "category": "technical|resource|schedule|budget|scope|external", "likelihood": "low|medium|high|critical", "impact": "low|medium|high|critical", "mitigation": "<suggested action>" }]`;

    try {
      const aiResult = await AIService.chat({
        messages: [{ role: 'system', content: 'You are a project risk analyst. Return JSON only.' }, { role: 'user', content: prompt }],
        userId, temperature: 0.3,
      });
      const text = aiResult.message?.content || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];
      const detected = JSON.parse(jsonMatch[0]);

      // Save detected risks
      const riskRows = detected.map(r => ({
        project_id: projectId,
        user_id: userId,
        title: r.title,
        description: r.description,
        category: r.category,
        likelihood: r.likelihood,
        impact: r.impact,
        mitigation: r.mitigation,
        ai_detected: true,
      }));
      if (riskRows.length > 0) {
        await supabase.from('project_risks').insert(riskRows);
      }
      return detected;
    } catch (err) {
      logger.error('AI risk detection failed', err);
      return [];
    }
  },

  /* ── INSIGHTS ─────────────────────────────────────────────────────── */

  async getInsights(userId, projectId, { type, dismissed = false, limit = 50 } = {}) {
    let query = supabase
      .from('project_insights')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .eq('is_dismissed', dismissed)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async dismissInsight(userId, insightId) {
    const { error } = await supabase
      .from('project_insights')
      .update({ is_dismissed: true })
      .eq('id', insightId)
      .eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  },

  /* ── DASHBOARD STATS ──────────────────────────────────────────────── */

  async getDashboardStats(userId) {
    const { data: projects } = await supabase.from('projects').select('*').eq('user_id', userId);
    const { data: tasks } = await supabase.from('project_tasks').select('*').eq('user_id', userId);
    const { data: risks } = await supabase.from('project_risks').select('*').eq('user_id', userId).eq('status', 'open');
    const { data: insights } = await supabase.from('project_insights').select('*').eq('user_id', userId).eq('is_dismissed', false).order('created_at', { ascending: false }).limit(10);

    const p = projects || [];
    const t = tasks || [];
    const r = risks || [];

    return {
      totalProjects: p.length,
      activeProjects: p.filter(x => x.status === 'active').length,
      avgHealth: p.length > 0 ? Math.round(p.reduce((s, x) => s + (x.health_score || 0), 0) / p.length) : 0,
      totalTasks: t.length,
      completedTasks: t.filter(x => x.status === 'done').length,
      blockedTasks: t.filter(x => x.status === 'blocked').length,
      overdueTasks: t.filter(x => x.due_date && new Date(x.due_date) < new Date() && x.status !== 'done').length,
      openRisks: r.length,
      criticalRisks: r.filter(x => x.likelihood === 'critical' || x.impact === 'critical').length,
      recentInsights: insights || [],
      projectsByStatus: {
        planning: p.filter(x => x.status === 'planning').length,
        active: p.filter(x => x.status === 'active').length,
        on_hold: p.filter(x => x.status === 'on_hold').length,
        completed: p.filter(x => x.status === 'completed').length,
      },
      tasksByStatus: {
        todo: t.filter(x => x.status === 'todo').length,
        in_progress: t.filter(x => x.status === 'in_progress').length,
        review: t.filter(x => x.status === 'review').length,
        done: t.filter(x => x.status === 'done').length,
        blocked: t.filter(x => x.status === 'blocked').length,
      },
    };
  },
};
