/**
 * Regulatory Change Intelligence Service
 * AI-powered regulatory monitoring, impact analysis, and compliance tracking
 */

import { supabase } from '../config/supabase.js';
import { AIService } from './ai/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('regulatory-service');

export const RegulatoryService = {
  /* ── SOURCES CRUD ─────────────────────────────────────────────────── */

  async getSources(userId) {
    const { data, error } = await supabase.from('regulatory_sources').select('*').eq('user_id', userId).order('name');
    if (error) throw error;
    return data;
  },

  async createSource(userId, source) {
    const { data, error } = await supabase.from('regulatory_sources').insert({ ...source, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  },

  async deleteSource(userId, sourceId) {
    const { error } = await supabase.from('regulatory_sources').delete().eq('id', sourceId).eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  },

  /* ── CHANGES CRUD ─────────────────────────────────────────────────── */

  async getChanges(userId, { status, severity, sector, limit = 50, offset = 0 } = {}) {
    let q = supabase.from('regulatory_changes').select('*').eq('user_id', userId).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (status) q = q.eq('status', status);
    if (severity) q = q.eq('severity', severity);
    if (sector) q = q.contains('sector', [sector]);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },

  async getChange(userId, changeId) {
    const { data, error } = await supabase.from('regulatory_changes').select('*').eq('id', changeId).eq('user_id', userId).single();
    if (error) throw error;
    return data;
  },

  async createChange(userId, change) {
    const { data, error } = await supabase.from('regulatory_changes').insert({ ...change, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  },

  async updateChangeStatus(userId, changeId, status) {
    const { data, error } = await supabase.from('regulatory_changes').update({ status }).eq('id', changeId).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  },

  /* ── AI ANALYSIS ──────────────────────────────────────────────────── */

  async analyzeImpact(userId, changeId) {
    const change = await this.getChange(userId, changeId);

    const prompt = `Analyze the regulatory impact of this change for a Jersey-based financial services / government organization.

REGULATION: ${change.title}
Type: ${change.change_type} | Jurisdiction: ${change.jurisdiction}
Sectors: ${change.sector?.join(', ') || 'General'}
Effective Date: ${change.effective_date || 'TBD'}

${change.body || change.summary || 'No additional detail provided.'}

Return ONLY valid JSON:
{
  "riskScore": <0-100>,
  "severity": "low|medium|high|critical",
  "impactSummary": "<2-3 sentences>",
  "affectedAreas": ["<area>"],
  "actionItems": ["<specific action>"],
  "complianceGaps": ["<gap>"],
  "deadline": "<ISO date or null>",
  "recommendations": ["<recommendation>"]
}`;

    try {
      const ai = await AIService.chat(
        [{ role: 'system', content: 'You are a regulatory compliance AI specializing in Jersey financial regulation (JFSC). Return JSON only.' }, { role: 'user', content: prompt }],
        { userId, temperature: 0.2 }
      );

      const text = ai.content || ai.message?.content || '';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON');
      const analysis = JSON.parse(match[0]);

      // Update the change with AI analysis
      await supabase.from('regulatory_changes').update({
        ai_impact_summary: analysis.impactSummary,
        ai_action_items: analysis.actionItems || [],
        ai_risk_score: analysis.riskScore,
        severity: analysis.severity,
      }).eq('id', changeId);

      // Auto-create compliance assessment
      await supabase.from('compliance_assessments').insert({
        user_id: userId,
        change_id: changeId,
        assessment_type: 'impact',
        current_compliance: 'unknown',
        required_actions: analysis.actionItems?.map(a => ({ action: a, status: 'pending' })) || [],
        deadline: analysis.deadline || change.effective_date || null,
        ai_analysis: analysis,
      });

      return analysis;
    } catch (err) {
      logger.error('AI impact analysis failed', err);
      return { riskScore: 50, severity: 'medium', impactSummary: 'Analysis unavailable — please review manually.', actionItems: [], recommendations: [] };
    }
  },

  async scanForChanges(userId, text) {
    const prompt = `Extract regulatory changes from this text. Focus on Jersey financial regulation, AML/KYC, data protection, and government compliance.

TEXT:
${text.slice(0, 3000)}

Return ONLY a valid JSON array:
[{
  "title": "<change title>",
  "summary": "<1-2 sentences>",
  "change_type": "new_regulation|amendment|guidance|consultation|enforcement|update",
  "jurisdiction": "Jersey",
  "sector": ["financial_services"],
  "severity": "low|medium|high|critical",
  "effective_date": "<ISO date or null>"
}]`;

    try {
      const ai = await AIService.chat(
        [{ role: 'system', content: 'You are a regulatory intelligence scanner. Return JSON only.' }, { role: 'user', content: prompt }],
        { userId, temperature: 0.2 }
      );
      const text2 = ai.content || ai.message?.content || '';
      const match = text2.match(/\[[\s\S]*\]/);
      if (!match) return [];
      const detected = JSON.parse(match[0]);

      // Save detected changes
      const rows = detected.map(c => ({ ...c, user_id: userId, status: 'new' }));
      if (rows.length > 0) {
        const { data } = await supabase.from('regulatory_changes').insert(rows).select();
        return data || [];
      }
      return [];
    } catch (err) {
      logger.error('Scan failed', err);
      return [];
    }
  },

  /* ── ASSESSMENTS ──────────────────────────────────────────────────── */

  async getAssessments(userId, changeId) {
    const { data, error } = await supabase.from('compliance_assessments').select('*').eq('change_id', changeId).eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateAssessment(userId, assessmentId, updates) {
    const { data, error } = await supabase.from('compliance_assessments').update(updates).eq('id', assessmentId).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  },

  /* ── DASHBOARD ────────────────────────────────────────────────────── */

  async getDashboard(userId) {
    const { data: changes } = await supabase.from('regulatory_changes').select('*').eq('user_id', userId);
    const { data: assessments } = await supabase.from('compliance_assessments').select('*').eq('user_id', userId);
    const { data: sources } = await supabase.from('regulatory_sources').select('*').eq('user_id', userId);

    const c = changes || [];
    const a = assessments || [];

    return {
      totalChanges: c.length,
      newChanges: c.filter(x => x.status === 'new').length,
      underReview: c.filter(x => x.status === 'under_review').length,
      criticalChanges: c.filter(x => x.severity === 'critical').length,
      highChanges: c.filter(x => x.severity === 'high').length,
      avgRiskScore: c.length > 0 ? Math.round(c.reduce((s, x) => s + (x.ai_risk_score || 0), 0) / c.filter(x => x.ai_risk_score).length) || 0 : 0,
      pendingAssessments: a.filter(x => x.status === 'pending').length,
      activeSources: (sources || []).filter(s => s.is_active).length,
      changesByType: {
        new_regulation: c.filter(x => x.change_type === 'new_regulation').length,
        amendment: c.filter(x => x.change_type === 'amendment').length,
        guidance: c.filter(x => x.change_type === 'guidance').length,
        enforcement: c.filter(x => x.change_type === 'enforcement').length,
      },
      recentChanges: c.slice(0, 10),
    };
  },
};
