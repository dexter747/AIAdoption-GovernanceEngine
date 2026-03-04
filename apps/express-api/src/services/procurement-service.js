/**
 * Procurement & Contract Risk Service
 * AI-powered contract analysis, risk scoring, and vendor management
 */

import { supabase } from '../config/index.js';
import { AIService } from './ai/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('procurement-service');

export const ProcurementService = {
  /* ── CONTRACTS CRUD ───────────────────────────────────────────────── */

  async getContracts(userId, { status, vendor, limit = 50 } = {}) {
    let q = supabase.from('contracts').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(limit);
    if (status) q = q.eq('status', status);
    if (vendor) q = q.ilike('vendor', `%${vendor}%`);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },

  async getContract(userId, contractId) {
    const { data, error } = await supabase.from('contracts').select('*').eq('id', contractId).eq('user_id', userId).single();
    if (error) throw error;
    return data;
  },

  async createContract(userId, contract) {
    const { data, error } = await supabase.from('contracts').insert({ ...contract, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  },

  async updateContract(userId, contractId, updates) {
    const { data, error } = await supabase.from('contracts').update(updates).eq('id', contractId).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  },

  async deleteContract(userId, contractId) {
    const { error } = await supabase.from('contracts').delete().eq('id', contractId).eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  },

  /* ── CLAUSES ──────────────────────────────────────────────────────── */

  async getClauses(userId, contractId) {
    const { data, error } = await supabase.from('contract_clauses').select('*').eq('contract_id', contractId).eq('user_id', userId).order('created_at');
    if (error) throw error;
    return data;
  },

  /* ── AI ANALYSIS ──────────────────────────────────────────────────── */

  async analyzeContract(userId, contractId, contractText) {
    const contract = await this.getContract(userId, contractId);

    const prompt = `Analyze this contract for risks, compliance gaps, and key clause issues.

CONTRACT: ${contract.title}
Vendor: ${contract.vendor} | Type: ${contract.contract_type}
Value: ${contract.currency} ${contract.value || 'N/A'}
Start: ${contract.start_date || 'N/A'} | End: ${contract.end_date || 'N/A'}

${contractText ? `CONTRACT TEXT:\n${contractText.slice(0, 4000)}` : 'No contract text provided.'}

Return ONLY valid JSON:
{
  "riskScore": <0-100>,
  "overallRisk": "low|medium|high|critical",
  "summary": "<2-3 sentences>",
  "clauses": [
    { "type": "termination|liability|indemnity|sla|data_protection|ip|confidentiality|payment|force_majeure|general", "title": "<clause>", "riskLevel": "low|medium|high|critical", "assessment": "<issue>", "recommendation": "<action>" }
  ],
  "findings": [
    { "category": "risk|compliance|value|missing", "severity": "low|medium|high|critical", "title": "<finding>", "detail": "<detail>" }
  ],
  "recommendations": ["<action item>"],
  "missingClauses": ["<clause that should be present>"]
}`;

    try {
      const ai = await AIService.chat({
        messages: [{ role: 'system', content: 'You are a procurement and contract risk analyst for Jersey-based organizations. Return JSON only.' }, { role: 'user', content: prompt }],
        userId, temperature: 0.2,
      });
      const text = ai.message?.content || '';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON');
      const analysis = JSON.parse(match[0]);

      // Update contract risk score
      await supabase.from('contracts').update({ risk_score: analysis.riskScore }).eq('id', contractId);

      // Save clauses
      if (analysis.clauses?.length > 0) {
        const clauseRows = analysis.clauses.map(c => ({
          contract_id: contractId,
          user_id: userId,
          clause_type: c.type,
          title: c.title,
          risk_level: c.riskLevel,
          ai_assessment: c.assessment,
          ai_recommendation: c.recommendation,
          flagged: c.riskLevel === 'high' || c.riskLevel === 'critical',
        }));
        await supabase.from('contract_clauses').insert(clauseRows);
      }

      // Save review
      await supabase.from('procurement_reviews').insert({
        contract_id: contractId,
        user_id: userId,
        review_type: 'risk',
        overall_risk: analysis.overallRisk,
        findings: analysis.findings || [],
        recommendations: analysis.recommendations || [],
        ai_summary: analysis.summary,
        status: 'completed',
      });

      return analysis;
    } catch (err) {
      logger.error('Contract analysis failed', err);
      return { riskScore: 50, overallRisk: 'medium', summary: 'Analysis unavailable.', clauses: [], findings: [], recommendations: ['Review contract manually.'], missingClauses: [] };
    }
  },

  async getReviews(userId, contractId) {
    const { data, error } = await supabase.from('procurement_reviews').select('*').eq('contract_id', contractId).eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  /* ── DASHBOARD ────────────────────────────────────────────────────── */

  async getDashboard(userId) {
    const { data: contracts } = await supabase.from('contracts').select('*').eq('user_id', userId);
    const { data: reviews } = await supabase.from('procurement_reviews').select('*').eq('user_id', userId);
    const c = contracts || [];
    const r = reviews || [];
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 86400000);

    return {
      totalContracts: c.length,
      activeContracts: c.filter(x => x.status === 'active').length,
      expiringContracts: c.filter(x => x.end_date && new Date(x.end_date) <= thirtyDays && new Date(x.end_date) >= now).length,
      expiredContracts: c.filter(x => x.status === 'expired' || (x.end_date && new Date(x.end_date) < now)).length,
      totalValue: c.reduce((s, x) => s + (x.value || 0), 0),
      avgRiskScore: c.filter(x => x.risk_score).length > 0 ? Math.round(c.filter(x => x.risk_score).reduce((s, x) => s + x.risk_score, 0) / c.filter(x => x.risk_score).length) : 0,
      highRiskContracts: c.filter(x => x.risk_score && x.risk_score > 70).length,
      pendingReviews: r.filter(x => x.status === 'pending' || x.status === 'action_required').length,
      byType: {
        service: c.filter(x => x.contract_type === 'service').length,
        license: c.filter(x => x.contract_type === 'license').length,
        maintenance: c.filter(x => x.contract_type === 'maintenance').length,
        consulting: c.filter(x => x.contract_type === 'consulting').length,
        procurement: c.filter(x => x.contract_type === 'procurement').length,
      },
      recentContracts: c.slice(0, 10),
    };
  },
};
