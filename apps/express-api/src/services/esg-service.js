/**
 * ESG & Sustainability Reporting Service
 * Environmental, Social, and Governance data aggregation,
 * metrics tracking, report generation, and target monitoring.
 */

import { supabase } from '../config/index.js';
import { AIService } from './ai/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('esg-service');

export const ESGService = {
  /* ── FRAMEWORKS ── */

  async getFrameworks(userId) {
    const { data, error } = await supabase.from('esg_frameworks').select('*').eq('user_id', userId).order('name');
    if (error) throw error;
    return data;
  },

  async createFramework(userId, fw) {
    const { data, error } = await supabase.from('esg_frameworks').insert({ ...fw, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  },

  async deleteFramework(userId, id) {
    const { error } = await supabase.from('esg_frameworks').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  },

  /* ── METRICS ── */

  async getMetrics(userId, { category, status, year, frameworkId } = {}) {
    let q = supabase.from('esg_metrics').select('*, esg_frameworks(name, code)').eq('user_id', userId).order('created_at', { ascending: false });
    if (category) q = q.eq('category', category);
    if (status) q = q.eq('status', status);
    if (year) q = q.eq('reporting_year', year);
    if (frameworkId) q = q.eq('framework_id', frameworkId);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },

  async createMetric(userId, metric) {
    const { data, error } = await supabase.from('esg_metrics').insert({ ...metric, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  },

  async updateMetric(userId, id, updates) {
    const { data, error } = await supabase.from('esg_metrics').update(updates).eq('id', id).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  },

  async deleteMetric(userId, id) {
    const { error } = await supabase.from('esg_metrics').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  },

  /* ── DATA SOURCES ── */

  async getDataSources(userId) {
    const { data, error } = await supabase.from('esg_data_sources').select('*').eq('user_id', userId).order('source_name');
    if (error) throw error;
    return data;
  },

  async createDataSource(userId, ds) {
    const { data, error } = await supabase.from('esg_data_sources').insert({ ...ds, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  },

  async deleteDataSource(userId, id) {
    const { error } = await supabase.from('esg_data_sources').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  },

  /* ── REPORTS ── */

  async getReports(userId, { status } = {}) {
    let q = supabase.from('esg_reports').select('*, esg_frameworks(name, code)').eq('user_id', userId).order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },

  async getReport(userId, id) {
    const { data, error } = await supabase.from('esg_reports').select('*, esg_frameworks(name, code)').eq('id', id).eq('user_id', userId).single();
    if (error) throw error;
    return data;
  },

  async createReport(userId, report) {
    const { data, error } = await supabase.from('esg_reports').insert({ ...report, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  },

  async updateReport(userId, id, updates) {
    const extra = {};
    if (updates.status === 'approved') extra.approved_at = new Date().toISOString();
    if (updates.status === 'published') extra.published_at = new Date().toISOString();
    const { data, error } = await supabase.from('esg_reports').update({ ...updates, ...extra }).eq('id', id).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  },

  /* ── TARGETS ── */

  async getTargets(userId) {
    const { data, error } = await supabase.from('esg_targets').select('*').eq('user_id', userId).order('target_year');
    if (error) throw error;
    return data;
  },

  async createTarget(userId, target) {
    const { data, error } = await supabase.from('esg_targets').insert({ ...target, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  },

  async updateTarget(userId, id, updates) {
    const { data, error } = await supabase.from('esg_targets').update(updates).eq('id', id).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  },

  /* ── AI: GENERATE REPORT ── */

  async generateReport(userId, reportId) {
    const report = await this.getReport(userId, reportId);
    const metrics = await this.getMetrics(userId, { year: report.reporting_year });
    const targets = await this.getTargets(userId);

    const envMetrics = metrics.filter(m => m.category === 'environmental');
    const socMetrics = metrics.filter(m => m.category === 'social');
    const govMetrics = metrics.filter(m => m.category === 'governance');

    const prompt = `Generate an ESG sustainability report analysis.

REPORT: ${report.title} (${report.report_type}, Year: ${report.reporting_year})
Framework: ${report.esg_frameworks?.name || 'General'}

ENVIRONMENTAL METRICS (${envMetrics.length}):
${envMetrics.map(m => `- ${m.metric_name}: ${m.value} ${m.unit || ''} (target: ${m.target_value || 'N/A'}, prev: ${m.previous_value || 'N/A'})`).join('\n')}

SOCIAL METRICS (${socMetrics.length}):
${socMetrics.map(m => `- ${m.metric_name}: ${m.value} ${m.unit || ''} (target: ${m.target_value || 'N/A'}, prev: ${m.previous_value || 'N/A'})`).join('\n')}

GOVERNANCE METRICS (${govMetrics.length}):
${govMetrics.map(m => `- ${m.metric_name}: ${m.value} ${m.unit || ''} (target: ${m.target_value || 'N/A'}, prev: ${m.previous_value || 'N/A'})`).join('\n')}

TARGETS:
${targets.map(t => `- ${t.target_name} (${t.category}): ${t.current_value}/${t.target_value} by ${t.target_year}, progress: ${t.progress_pct}%`).join('\n')}

Return ONLY valid JSON:
{
  "executiveSummary": "<2-3 paragraph summary>",
  "environmentalScore": <0-100>,
  "socialScore": <0-100>,
  "governanceScore": <0-100>,
  "overallScore": <0-100>,
  "recommendations": [{ "area": "<E/S/G>", "priority": "high|medium|low", "recommendation": "<text>" }],
  "riskAreas": ["<risk1>", "<risk2>"],
  "improvements": ["<improvement from last period>"],
  "complianceGaps": ["<gap1>"]
}`;

    try {
      const aiResult = await AIService.chat({
        messages: [{ role: 'system', content: 'You are an ESG reporting analyst. Return JSON only.' }, { role: 'user', content: prompt }],
        userId, temperature: 0.3,
      });
      const text = aiResult.message?.content || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON');
      const result = JSON.parse(jsonMatch[0]);

      await supabase.from('esg_reports').update({
        overall_score: result.overallScore,
        environmental_score: result.environmentalScore,
        social_score: result.socialScore,
        governance_score: result.governanceScore,
        ai_executive_summary: result.executiveSummary,
        ai_recommendations: result.recommendations,
        ai_risk_areas: result.riskAreas,
      }).eq('id', reportId).eq('user_id', userId);

      return result;
    } catch (err) {
      logger.error('AI ESG report generation failed', err);
      return {
        executiveSummary: 'AI report generation unavailable. Please review metrics manually.',
        environmentalScore: 0, socialScore: 0, governanceScore: 0, overallScore: 0,
        recommendations: [], riskAreas: ['AI analysis unavailable'], improvements: [], complianceGaps: [],
      };
    }
  },

  /* ── DASHBOARD ── */

  async getDashboard(userId) {
    const [frameworks, metrics, sources, reports, targets] = await Promise.all([
      this.getFrameworks(userId),
      this.getMetrics(userId, {}),
      this.getDataSources(userId),
      this.getReports(userId, {}),
      this.getTargets(userId),
    ]);

    const env = metrics.filter(m => m.category === 'environmental');
    const soc = metrics.filter(m => m.category === 'social');
    const gov = metrics.filter(m => m.category === 'governance');

    const onTrack = targets.filter(t => t.status === 'on_track').length;
    const atRisk = targets.filter(t => t.status === 'at_risk').length;
    const behind = targets.filter(t => t.status === 'behind').length;

    return {
      totalFrameworks: frameworks.length,
      totalMetrics: metrics.length,
      environmentalMetrics: env.length,
      socialMetrics: soc.length,
      governanceMetrics: gov.length,
      dataSources: sources.length,
      activeDataSources: sources.filter(s => s.status === 'active').length,
      totalReports: reports.length,
      publishedReports: reports.filter(r => r.status === 'published').length,
      draftReports: reports.filter(r => r.status === 'draft').length,
      totalTargets: targets.length,
      targetsOnTrack: onTrack,
      targetsAtRisk: atRisk,
      targetsBehind: behind,
      recentReports: reports.slice(0, 5),
    };
  },
};
