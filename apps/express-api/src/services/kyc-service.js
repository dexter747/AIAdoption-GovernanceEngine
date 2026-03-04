import { supabase } from '../config/index.js';
import AIService from './ai-service.js';

class KYCService {
  /* ── Clients ── */
  async getClients(userId) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getClient(id, userId) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  async createClient(userId, payload) {
    const { data, error } = await supabase
      .from('clients')
      .insert({ ...payload, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateClient(id, userId, updates) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteClient(id, userId) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
  }

  /* ── KYC Checks ── */
  async getChecks(clientId, userId) {
    const { data, error } = await supabase
      .from('kyc_checks')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async createCheck(clientId, userId, payload) {
    const { data, error } = await supabase
      .from('kyc_checks')
      .insert({ ...payload, client_id: clientId, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateCheck(id, userId, updates) {
    const { data, error } = await supabase
      .from('kyc_checks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /* ── Documents ── */
  async getDocuments(clientId, userId) {
    const { data, error } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async addDocument(clientId, userId, payload) {
    const { data, error } = await supabase
      .from('kyc_documents')
      .insert({ ...payload, client_id: clientId, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateDocument(id, userId, updates) {
    const { data, error } = await supabase
      .from('kyc_documents')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /* ── Onboarding Workflows ── */
  async getWorkflows(clientId, userId) {
    const { data, error } = await supabase
      .from('onboarding_workflows')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async createWorkflow(clientId, userId, template = 'standard') {
    const steps = this._generateSteps(template);
    const { data, error } = await supabase
      .from('onboarding_workflows')
      .insert({
        client_id: clientId,
        user_id: userId,
        template,
        total_steps: steps.length,
        steps: JSON.stringify(steps),
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async advanceWorkflow(workflowId, userId) {
    const { data: wf, error: fe } = await supabase
      .from('onboarding_workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', userId)
      .single();
    if (fe) throw fe;

    const steps = typeof wf.steps === 'string' ? JSON.parse(wf.steps) : wf.steps;
    const nextStep = wf.current_step + 1;
    if (nextStep < steps.length) steps[wf.current_step].completed = true;
    const isComplete = nextStep >= wf.total_steps;

    const { data, error } = await supabase
      .from('onboarding_workflows')
      .update({
        current_step: isComplete ? wf.total_steps : nextStep,
        steps: JSON.stringify(steps),
        completion_pct: Math.round(((isComplete ? wf.total_steps : nextStep) / wf.total_steps) * 100),
        status: isComplete ? 'completed' : 'in_progress',
        completed_at: isComplete ? new Date().toISOString() : null,
      })
      .eq('id', workflowId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /* ── AI Risk Assessment ── */
  async assessClientRisk(clientId, userId) {
    const client = await this.getClient(clientId, userId);
    const checks = await this.getChecks(clientId, userId);
    const docs = await this.getDocuments(clientId, userId);

    const prompt = `You are a KYC/AML compliance expert for Jersey financial services.
Assess the risk profile of this client and return JSON only.

Client: ${JSON.stringify({ name: client.name, entity_type: client.entity_type, jurisdiction: client.jurisdiction, pep_status: client.pep_status, industry: client.industry, source_of_wealth: client.source_of_wealth, source_of_funds: client.source_of_funds })}
KYC checks: ${JSON.stringify(checks.map(c => ({ type: c.check_type, status: c.status, flags: c.ai_risk_flags })))}
Documents: ${JSON.stringify(docs.map(d => ({ type: d.document_type, status: d.status })))}

Return JSON:
{
  "riskScore": 0-100,
  "riskRating": "low|standard|enhanced|high|pep",
  "factors": [{"factor": "...", "impact": "high|medium|low", "detail": "..."}],
  "missingChecks": ["check_type needed"],
  "missingDocuments": ["document_type needed"],
  "recommendations": ["action items"],
  "summary": "Brief risk assessment summary"
}`;

    try {
      const response = await AIService.chat([
        { role: 'system', content: 'You are a KYC/AML compliance risk assessor. Return valid JSON only.' },
        { role: 'user', content: prompt },
      ], { temperature: 0.2, userId });

      const text = response.choices?.[0]?.message?.content || response.content || '';
      const match = text.match(/\{[\s\S]*\}/);
      const result = match ? JSON.parse(match[0]) : { riskScore: 50, riskRating: 'standard', factors: [], recommendations: ['AI analysis unavailable'], summary: 'Manual review required' };

      // Update client risk
      await supabase
        .from('clients')
        .update({ risk_rating: result.riskRating, overall_risk_score: result.riskScore })
        .eq('id', clientId)
        .eq('user_id', userId);

      return result;
    } catch (err) {
      // Fallback algorithmic scoring
      let score = 30;
      if (client.pep_status) score += 30;
      if (client.entity_type === 'trust' || client.entity_type === 'fund') score += 15;
      if (client.jurisdiction !== 'JE' && client.jurisdiction !== 'GB') score += 10;
      const failedChecks = checks.filter(c => c.status === 'failed').length;
      score += failedChecks * 10;
      score = Math.min(score, 100);

      const rating = score > 75 ? 'high' : score > 55 ? 'enhanced' : score > 35 ? 'standard' : 'low';
      await supabase.from('clients').update({ risk_rating: rating, overall_risk_score: score }).eq('id', clientId).eq('user_id', userId);

      return { riskScore: score, riskRating: rating, factors: [], recommendations: ['Manual risk assessment recommended'], summary: `Algorithmic risk score: ${score}` };
    }
  }

  /* ── AI Document Analysis ── */
  async analyzeDocument(documentId, userId, documentText) {
    const { data: doc, error: de } = await supabase
      .from('kyc_documents')
      .select('*, clients(name, entity_type)')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();
    if (de) throw de;

    const prompt = `You are a KYC document verification specialist. Analyze this ${doc.document_type} document.

Document text/OCR content:
${documentText}

Client: ${doc.clients?.name} (${doc.clients?.entity_type})

Return JSON:
{
  "extractedData": {"name": "...", "dateOfBirth": "...", "address": "...", "documentNumber": "...", "expiryDate": "...", "other": {}},
  "verificationResult": {"authentic": true/false, "confidence": 0-1, "issues": ["any issues found"], "matchesClient": true/false},
  "recommendation": "verified|needs_review|rejected",
  "notes": "explanation"
}`;

    try {
      const response = await AIService.chat([
        { role: 'system', content: 'You are a KYC document verification AI. Return valid JSON only.' },
        { role: 'user', content: prompt },
      ], { temperature: 0.1, userId });

      const text = response.choices?.[0]?.message?.content || response.content || '';
      const match = text.match(/\{[\s\S]*\}/);
      const result = match ? JSON.parse(match[0]) : { extractedData: {}, verificationResult: { authentic: false, confidence: 0 }, recommendation: 'needs_review', notes: 'AI parsing failed' };

      await supabase
        .from('kyc_documents')
        .update({
          ai_extracted_data: result.extractedData,
          ai_verification_result: result.verificationResult,
          status: result.recommendation === 'verified' ? 'verified' : result.recommendation === 'rejected' ? 'rejected' : 'pending',
        })
        .eq('id', documentId)
        .eq('user_id', userId);

      return result;
    } catch {
      return { extractedData: {}, verificationResult: { authentic: false, confidence: 0 }, recommendation: 'needs_review', notes: 'AI analysis unavailable' };
    }
  }

  /* ── Dashboard ── */
  async getDashboard(userId) {
    const { data: clients } = await supabase.from('clients').select('id, status, risk_rating, overall_risk_score, entity_type, created_at').eq('user_id', userId);
    const { data: checks } = await supabase.from('kyc_checks').select('id, status, check_type').eq('user_id', userId);
    const { data: workflows } = await supabase.from('onboarding_workflows').select('id, status, completion_pct').eq('user_id', userId);

    const c = clients || [];
    const ch = checks || [];
    const w = workflows || [];

    return {
      totalClients: c.length,
      byStatus: { prospect: c.filter(x => x.status === 'prospect').length, onboarding: c.filter(x => x.status === 'onboarding').length, active: c.filter(x => x.status === 'active').length, suspended: c.filter(x => x.status === 'suspended').length },
      byRisk: { low: c.filter(x => x.risk_rating === 'low').length, standard: c.filter(x => x.risk_rating === 'standard').length, enhanced: c.filter(x => x.risk_rating === 'enhanced').length, high: c.filter(x => x.risk_rating === 'high').length, pep: c.filter(x => x.risk_rating === 'pep').length },
      checksTotal: ch.length,
      checksPending: ch.filter(x => x.status === 'pending' || x.status === 'in_progress').length,
      checksFailed: ch.filter(x => x.status === 'failed').length,
      onboardingActive: w.filter(x => x.status === 'in_progress').length,
      avgCompletion: w.length ? Math.round(w.reduce((s, x) => s + Number(x.completion_pct || 0), 0) / w.length) : 0,
      recentClients: c.slice(0, 10),
    };
  }

  /* ── Helpers ── */
  _generateSteps(template) {
    const base = [
      { name: 'Client Information', description: 'Collect basic client details', completed: false },
      { name: 'Identity Verification', description: 'Verify identity documents', completed: false },
      { name: 'Address Verification', description: 'Verify proof of address', completed: false },
      { name: 'Risk Assessment', description: 'AI-powered risk scoring', completed: false },
      { name: 'Compliance Review', description: 'Sanctions & PEP screening', completed: false },
      { name: 'Approval', description: 'Final review and approval', completed: false },
    ];
    if (template === 'enhanced') {
      base.splice(4, 0,
        { name: 'Source of Wealth', description: 'Verify source of wealth documentation', completed: false },
        { name: 'Source of Funds', description: 'Verify source of funds', completed: false },
        { name: 'Enhanced Due Diligence', description: 'Additional scrutiny for high-risk clients', completed: false },
      );
    }
    if (template === 'corporate') {
      base.splice(1, 0,
        { name: 'Corporate Structure', description: 'Map corporate ownership structure', completed: false },
        { name: 'UBO Identification', description: 'Identify ultimate beneficial owners', completed: false },
      );
    }
    return base;
  }
}

export default new KYCService();
