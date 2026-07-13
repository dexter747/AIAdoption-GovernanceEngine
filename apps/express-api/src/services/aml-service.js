/**
 * AML & SAR Automation Service
 * Anti-Money Laundering monitoring, Suspicious Activity Report generation,
 * rule-based alert engine, and compliance workflow management.
 */

import { supabase } from '../config/index.js';
import { AIService } from './ai/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('aml-service');

export const AMLService = {
  /* ── MONITORED ACCOUNTS ── */

  async getAccounts(userId, { status, riskTier } = {}) {
    let q = supabase.from('aml_monitored_accounts').select('*').eq('user_id', userId).order('account_holder');
    if (status) q = q.eq('status', status);
    if (riskTier) q = q.eq('risk_tier', riskTier);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },

  async createAccount(userId, account) {
    const { data, error } = await supabase.from('aml_monitored_accounts').insert({ ...account, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  },

  async updateAccount(userId, id, updates) {
    const { data, error } = await supabase.from('aml_monitored_accounts').update(updates).eq('id', id).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  },

  async deleteAccount(userId, id) {
    const { error } = await supabase.from('aml_monitored_accounts').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  },

  /* ── TRANSACTIONS ── */

  async getTransactions(userId, { accountId, flagged, limit = 50, offset = 0 } = {}) {
    let q = supabase.from('aml_transactions').select('*, aml_monitored_accounts(account_holder, account_ref)', { count: 'exact' }).eq('user_id', userId).order('timestamp', { ascending: false });
    if (accountId) q = q.eq('account_id', accountId);
    if (flagged !== undefined) q = q.eq('flagged', flagged);
    q = q.range(offset, offset + limit - 1);
    const { data, count, error } = await q;
    if (error) throw error;
    return { transactions: data, total: count };
  },

  async createTransaction(userId, txn) {
    const { data, error } = await supabase.from('aml_transactions').insert({ ...txn, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  },

  /* ── RULES ── */

  async getRules(userId) {
    const { data, error } = await supabase.from('aml_rules').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createRule(userId, rule) {
    const { data, error } = await supabase.from('aml_rules').insert({ ...rule, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  },

  async toggleRule(userId, id) {
    const { data: r } = await supabase.from('aml_rules').select('is_active').eq('id', id).eq('user_id', userId).single();
    const { data, error } = await supabase.from('aml_rules').update({ is_active: !r.is_active }).eq('id', id).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  },

  /* ── ALERTS ── */

  async getAlerts(userId, { status, severity } = {}) {
    let q = supabase.from('aml_alerts').select('*, aml_transactions(transaction_ref, amount, currency, counterparty_name), aml_monitored_accounts(account_holder, account_ref)').eq('user_id', userId).order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    if (severity) q = q.eq('severity', severity);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },

  async updateAlert(userId, id, updates) {
    const { data, error } = await supabase.from('aml_alerts').update({
      ...updates,
      ...(updates.status === 'resolved' || updates.status === 'false_positive' ? { resolved_at: new Date().toISOString() } : {}),
    }).eq('id', id).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  },

  /* ── SAR REPORTS ── */

  async getSARReports(userId, { status } = {}) {
    let q = supabase.from('sar_reports').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  },

  async getSARReport(userId, id) {
    const { data, error } = await supabase.from('sar_reports').select('*').eq('id', id).eq('user_id', userId).single();
    if (error) throw error;
    return data;
  },

  async createSAR(userId, sar) {
    const ref = `SAR-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await supabase.from('sar_reports').insert({ ...sar, report_ref: ref, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  },

  async updateSAR(userId, id, updates) {
    const extra = {};
    if (updates.status === 'approved') { extra.approved_at = new Date().toISOString(); }
    if (updates.status === 'submitted') { extra.filed_at = new Date().toISOString(); }
    const { data, error } = await supabase.from('sar_reports').update({ ...updates, ...extra }).eq('id', id).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  },

  /* ── AI: Screen Transaction ── */

  async screenTransaction(userId, txnId) {
    const { data: txn } = await supabase.from('aml_transactions').select('*, aml_monitored_accounts(account_holder, account_type, risk_tier, pep_flag, sanctions_flag, jurisdiction)').eq('id', txnId).eq('user_id', userId).single();
    if (!txn) throw new Error('Transaction not found');

    const prompt = `You are an AML compliance officer. Screen this transaction for money laundering indicators.

TRANSACTION:
- Ref: ${txn.transaction_ref}
- Type: ${txn.transaction_type} | Amount: ${txn.amount} ${txn.currency}
- Counterparty: ${txn.counterparty_name || 'N/A'} (${txn.counterparty_jurisdiction || 'Unknown'})
- Channel: ${txn.channel}
- Originator: ${txn.originator_country || 'N/A'} → Beneficiary: ${txn.beneficiary_country || 'N/A'}

ACCOUNT:
- Holder: ${txn.aml_monitored_accounts?.account_holder || 'N/A'}
- Type: ${txn.aml_monitored_accounts?.account_type || 'N/A'}
- Risk Tier: ${txn.aml_monitored_accounts?.risk_tier || 'standard'}
- PEP: ${txn.aml_monitored_accounts?.pep_flag ? 'YES' : 'No'}
- Sanctions: ${txn.aml_monitored_accounts?.sanctions_flag ? 'YES' : 'No'}

Return ONLY valid JSON:
{
  "riskScore": <0-100>,
  "riskFactors": ["<factor1>", "<factor2>"],
  "recommendation": "clear|monitor|escalate|block",
  "reasoning": "<explanation>",
  "suggestedAlertType": "threshold_breach|velocity_anomaly|structuring|sanctions_match|pep_transaction|geographic_risk|behavioral_anomaly|cash_intensive|layering|round_tripping|null"
}`;

    try {
      const aiResult = await AIService.chat({
        messages: [{ role: 'system', content: 'You are an AML compliance AI. Return JSON only.' }, { role: 'user', content: prompt }],
        userId, temperature: 0.2,
      });
      const text = aiResult.message?.content || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in AI response');
      const result = JSON.parse(jsonMatch[0]);

      // Update the transaction
      await supabase.from('aml_transactions').update({
        risk_score: result.riskScore,
        flagged: result.riskScore > 60,
        screening_status: result.recommendation === 'clear' ? 'cleared' : result.recommendation === 'block' ? 'blocked' : result.riskScore > 60 ? 'flagged' : 'cleared',
        ai_risk_factors: result.riskFactors,
      }).eq('id', txnId).eq('user_id', userId);

      // Auto-create alert if risk is high
      if (result.riskScore > 60 && result.suggestedAlertType) {
        await supabase.from('aml_alerts').insert({
          user_id: userId,
          transaction_id: txnId,
          account_id: txn.account_id,
          alert_type: result.suggestedAlertType,
          severity: result.riskScore > 80 ? 'critical' : 'high',
          title: `AML alert: ${result.suggestedAlertType.replace(/_/g, ' ')} on ${txn.transaction_ref}`,
          description: result.reasoning,
          ai_confidence: result.riskScore,
          ai_reasoning: result.reasoning,
          ai_recommended_action: result.recommendation,
        });
      }

      return result;
    } catch (err) {
      logger.error('AI screening failed', err);
      return { riskScore: 50, riskFactors: ['AI screening unavailable'], recommendation: 'monitor', reasoning: 'Automated screening failed — manual review required.' };
    }
  },

  /* ── AI: Generate SAR Narrative ── */

  async generateSARNarrative(userId, sarId) {
    const sar = await this.getSARReport(userId, sarId);
    const alerts = await this.getAlerts(userId, {});
    const relatedAlerts = alerts.filter(a => sar.supporting_alerts?.includes(a.id));

    const prompt = `Generate a formal Suspicious Activity Report (SAR) narrative for filing with the Jersey Financial Services Commission (JFSC).

SUBJECT: ${sar.subject_name} (${sar.subject_type})
Account: ${sar.subject_account || 'N/A'}
Period: ${sar.reporting_period_start || 'N/A'} to ${sar.reporting_period_end || 'N/A'}
Total suspicious amount: ${sar.total_suspicious_amount} ${sar.currency}

RELATED ALERTS:
${relatedAlerts.map(a => `- ${a.title} (${a.severity}) — ${a.ai_reasoning || a.description || 'No detail'}`).join('\n')}

Write a professional SAR narrative covering:
1. Subject identification
2. Suspicious activity description
3. Supporting evidence and transaction patterns
4. Why activity is suspicious
5. Steps already taken

Return ONLY valid JSON:
{
  "narrative": "<formal SAR narrative text>",
  "riskAssessment": { "overallRisk": "high|critical", "primaryIndicators": ["<indicator>"], "secondaryIndicators": ["<indicator>"] },
  "recommendations": ["<action1>", "<action2>"]
}`;

    try {
      const aiResult = await AIService.chat({
        messages: [{ role: 'system', content: 'You are an AML compliance officer. Write formal SAR narratives. Return JSON only.' }, { role: 'user', content: prompt }],
        userId, temperature: 0.2,
      });
      const text = aiResult.message?.content || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON');
      const result = JSON.parse(jsonMatch[0]);

      await supabase.from('sar_reports').update({
        ai_generated_narrative: result.narrative,
        ai_risk_assessment: result.riskAssessment,
      }).eq('id', sarId).eq('user_id', userId);

      return result;
    } catch (err) {
      logger.error('SAR narrative generation failed', err);
      return { narrative: 'AI narrative generation failed. Please draft manually.', riskAssessment: {}, recommendations: ['Manual review required'] };
    }
  },

  /* ── DASHBOARD ── */

  async getDashboard(userId) {
    const [accounts, txnResult, alerts, rules, sars] = await Promise.all([
      this.getAccounts(userId),
      this.getTransactions(userId, { limit: 500 }),
      this.getAlerts(userId, {}),
      this.getRules(userId),
      this.getSARReports(userId, {}),
    ]);

    const txns = txnResult.transactions || [];
    const flaggedTxns = txns.filter(t => t.flagged);
    const openAlerts = alerts.filter(a => a.status === 'open' || a.status === 'investigating' || a.status === 'escalated');
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const highRiskAccounts = accounts.filter(a => a.risk_tier === 'high' || a.risk_tier === 'enhanced');
    const pendingSARs = sars.filter(s => s.status === 'draft' || s.status === 'in_review');
    const filedSARs = sars.filter(s => s.status === 'submitted' || s.status === 'acknowledged');

    const alertsBySeverity = { low: 0, medium: 0, high: 0, critical: 0 };
    alerts.forEach(a => { alertsBySeverity[a.severity] = (alertsBySeverity[a.severity] || 0) + 1; });

    const alertsByType = {};
    alerts.forEach(a => { alertsByType[a.alert_type] = (alertsByType[a.alert_type] || 0) + 1; });

    const totalVolume = txns.reduce((s, t) => s + Number(t.amount || 0), 0);
    const avgRiskScore = txns.length > 0 ? Math.round(txns.reduce((s, t) => s + (t.risk_score || 0), 0) / txns.length) : 0;

    return {
      totalAccounts: accounts.length,
      highRiskAccounts: highRiskAccounts.length,
      totalTransactions: txnResult.total || txns.length,
      flaggedTransactions: flaggedTxns.length,
      totalVolume,
      avgRiskScore,
      openAlerts: openAlerts.length,
      criticalAlerts: criticalAlerts.length,
      activeRules: rules.filter(r => r.is_active).length,
      totalRules: rules.length,
      pendingSARs: pendingSARs.length,
      filedSARs: filedSARs.length,
      totalSARs: sars.length,
      alertsBySeverity,
      alertsByType,
    };
  },
};
