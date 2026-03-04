import { supabase } from '../config/index.js';
import AIService from './ai-service.js';

class FraudDetectionService {
  /* ── Transactions ── */
  async getTransactions(userId, { limit = 50, offset = 0, status, flagged } = {}) {
    let q = supabase.from('transactions').select('*', { count: 'exact' }).eq('user_id', userId).order('timestamp', { ascending: false });
    if (status) q = q.eq('status', status);
    if (flagged !== undefined) q = q.eq('flagged', flagged);
    q = q.range(offset, offset + limit - 1);
    const { data, count, error } = await q;
    if (error) throw error;
    return { transactions: data, total: count };
  }

  async createTransaction(userId, payload) {
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...payload, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateTransaction(id, userId, updates) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /* ── Alerts ── */
  async getAlerts(userId, { status, severity } = {}) {
    let q = supabase.from('fraud_alerts').select('*, transactions(transaction_ref, amount, currency, counterparty)').eq('user_id', userId).order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    if (severity) q = q.eq('severity', severity);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  }

  async updateAlert(id, userId, updates) {
    const { data, error } = await supabase
      .from('fraud_alerts')
      .update({ ...updates, ...(updates.status === 'confirmed_fraud' || updates.status === 'false_positive' || updates.status === 'resolved' ? { resolved_at: new Date().toISOString() } : {}) })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /* ── Patterns ── */
  async getPatterns(userId) {
    const { data, error } = await supabase.from('fraud_patterns').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async createPattern(userId, payload) {
    const { data, error } = await supabase.from('fraud_patterns').insert({ ...payload, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  }

  async togglePattern(id, userId) {
    const { data: p } = await supabase.from('fraud_patterns').select('is_active').eq('id', id).eq('user_id', userId).single();
    const { data, error } = await supabase.from('fraud_patterns').update({ is_active: !p.is_active }).eq('id', id).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  }

  /* ── Investigations ── */
  async getInvestigations(userId) {
    const { data, error } = await supabase.from('fraud_investigations').select('*, fraud_alerts(title, severity, alert_type)').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async createInvestigation(userId, payload) {
    const num = `INV-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await supabase.from('fraud_investigations').insert({ ...payload, case_number: num, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  }

  async updateInvestigation(id, userId, updates) {
    const { data, error } = await supabase.from('fraud_investigations').update({ ...updates, ...(updates.status?.startsWith('closed') ? { closed_at: new Date().toISOString() } : {}) }).eq('id', id).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  }

  /* ── AI: Analyze Transaction ── */
  async analyzeTransaction(transactionId, userId) {
    const { data: txn, error } = await supabase.from('transactions').select('*').eq('id', transactionId).eq('user_id', userId).single();
    if (error) throw error;

    // Get recent transactions for context
    const { data: recent } = await supabase.from('transactions').select('amount, type, country_code, channel, timestamp').eq('user_id', userId).order('timestamp', { ascending: false }).limit(20);

    const prompt = `You are a fraud detection AI for Jersey financial services. Analyze this transaction for fraud indicators.

Transaction: ${JSON.stringify({ ref: txn.transaction_ref, type: txn.type, amount: txn.amount, currency: txn.currency, source: txn.source_account, dest: txn.destination_account, counterparty: txn.counterparty, country: txn.country_code, channel: txn.channel })}
Recent history (last 20): ${JSON.stringify(recent?.map(r => ({ amount: r.amount, type: r.type, country: r.country_code, channel: r.channel })) || [])}

Return JSON:
{
  "riskScore": 0-100,
  "fraudProbability": 0-1,
  "indicators": [{"type": "anomaly|pattern|velocity|amount|geographic", "description": "...", "severity": "low|medium|high|critical"}],
  "reasoning": "concise explanation",
  "recommendedAction": "allow|review|block|escalate",
  "alerts": [{"title": "alert title", "alertType": "anomaly|pattern|velocity|amount|geographic", "severity": "low|medium|high|critical", "description": "..."}]
}`;

    try {
      const response = await AIService.chat([
        { role: 'system', content: 'You are a fraud detection AI. Return valid JSON only.' },
        { role: 'user', content: prompt },
      ], { temperature: 0.1, userId });

      const text = response.choices?.[0]?.message?.content || response.content || '';
      const match = text.match(/\{[\s\S]*\}/);
      const result = match ? JSON.parse(match[0]) : { riskScore: 30, fraudProbability: 0.1, indicators: [], reasoning: 'AI analysis unavailable', recommendedAction: 'review', alerts: [] };

      // Update transaction risk
      await supabase.from('transactions').update({ risk_score: result.riskScore, flagged: result.riskScore > 60 }).eq('id', transactionId).eq('user_id', userId);

      // Create alerts
      for (const alert of (result.alerts || [])) {
        await supabase.from('fraud_alerts').insert({
          user_id: userId,
          transaction_id: transactionId,
          alert_type: alert.alertType || 'anomaly',
          severity: alert.severity || 'medium',
          title: alert.title,
          description: alert.description,
          ai_confidence: result.fraudProbability,
          ai_reasoning: result.reasoning,
          ai_recommended_action: result.recommendedAction,
          indicators: result.indicators,
        });
      }

      return result;
    } catch {
      // Fallback
      let score = 20;
      if (txn.amount > 10000) score += 20;
      if (txn.country_code !== 'JE' && txn.country_code !== 'GB') score += 15;
      if (txn.channel === 'wire') score += 10;
      return { riskScore: Math.min(score, 100), fraudProbability: score / 100, indicators: [], reasoning: 'Basic rule-based analysis', recommendedAction: score > 50 ? 'review' : 'allow', alerts: [] };
    }
  }

  /* ── AI: Detect Patterns ── */
  async detectPatterns(userId) {
    const { data: txns } = await supabase.from('transactions').select('type, amount, currency, country_code, channel, counterparty, timestamp, flagged').eq('user_id', userId).order('timestamp', { ascending: false }).limit(100);
    const { data: alerts } = await supabase.from('fraud_alerts').select('alert_type, severity, status').eq('user_id', userId).limit(50);

    const prompt = `You are a fraud pattern recognition AI. Analyze these transactions and alerts to detect fraud patterns.

Transactions (last 100): ${JSON.stringify(txns || [])}
Recent alerts: ${JSON.stringify(alerts || [])}

Return JSON:
{
  "patterns": [{"name": "pattern name", "patternType": "velocity|amount|geographic|temporal|network|behavioral", "description": "...", "severity": "low|medium|high|critical", "confidence": 0-1, "detectionRules": {"rule": "description"}}],
  "summary": "overall assessment",
  "trendAnalysis": "trend commentary"
}`;

    try {
      const response = await AIService.chat([
        { role: 'system', content: 'You are a fraud pattern detection AI. Return valid JSON only.' },
        { role: 'user', content: prompt },
      ], { temperature: 0.2, userId });

      const text = response.choices?.[0]?.message?.content || response.content || '';
      const match = text.match(/\{[\s\S]*\}/);
      const result = match ? JSON.parse(match[0]) : { patterns: [], summary: 'AI analysis unavailable', trendAnalysis: '' };

      // Save detected patterns
      for (const p of (result.patterns || [])) {
        await supabase.from('fraud_patterns').insert({
          user_id: userId,
          name: p.name,
          pattern_type: p.patternType || 'custom',
          description: p.description,
          detection_rules: p.detectionRules || {},
          ai_generated: true,
          severity: p.severity || 'medium',
        });
      }

      return result;
    } catch {
      return { patterns: [], summary: 'Pattern detection unavailable', trendAnalysis: '' };
    }
  }

  /* ── Dashboard ── */
  async getDashboard(userId) {
    const { data: txns } = await supabase.from('transactions').select('id, amount, status, flagged, risk_score, type, timestamp').eq('user_id', userId);
    const { data: alerts } = await supabase.from('fraud_alerts').select('id, severity, status, alert_type, created_at').eq('user_id', userId);
    const { data: investigations } = await supabase.from('fraud_investigations').select('id, status, priority, total_exposure').eq('user_id', userId);

    const t = txns || [];
    const a = alerts || [];
    const inv = investigations || [];

    return {
      totalTransactions: t.length,
      flaggedTransactions: t.filter(x => x.flagged).length,
      totalVolume: t.reduce((s, x) => s + Number(x.amount || 0), 0),
      avgRiskScore: t.filter(x => x.risk_score).length ? Math.round(t.filter(x => x.risk_score).reduce((s, x) => s + x.risk_score, 0) / t.filter(x => x.risk_score).length) : 0,
      alertsOpen: a.filter(x => x.status === 'open' || x.status === 'investigating').length,
      alertsCritical: a.filter(x => x.severity === 'critical').length,
      alertsBySeverity: { low: a.filter(x => x.severity === 'low').length, medium: a.filter(x => x.severity === 'medium').length, high: a.filter(x => x.severity === 'high').length, critical: a.filter(x => x.severity === 'critical').length },
      alertsByType: a.reduce((acc, x) => { acc[x.alert_type] = (acc[x.alert_type] || 0) + 1; return acc; }, {}),
      investigationsOpen: inv.filter(x => x.status === 'open' || x.status === 'in_progress').length,
      totalExposure: inv.reduce((s, x) => s + Number(x.total_exposure || 0), 0),
      byTxnType: t.reduce((acc, x) => { acc[x.type] = (acc[x.type] || 0) + 1; return acc; }, {}),
    };
  }
}

export default new FraudDetectionService();
