import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

export class ReportingService {
  /* ─── Templates ─── */
  async getTemplates(userId) {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async createTemplate(userId, payload) {
    const { data, error } = await supabase
      .from('report_templates')
      .insert({ ...payload, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /* ─── Reports ─── */
  async getReports(userId) {
    const { data, error } = await supabase
      .from('client_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getReport(userId, reportId) {
    const { data, error } = await supabase
      .from('client_reports')
      .select('*')
      .eq('id', reportId)
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  async createReport(userId, payload) {
    const { data, error } = await supabase
      .from('client_reports')
      .insert({ ...payload, user_id: userId, status: 'draft' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /* ─── AI Generation ─── */
  async generateReportContent(userId, reportId, aiProvider) {
    const report = await this.getReport(userId, reportId);
    const prompt = `You are a senior financial analyst generating a professional client report.

Report Title: ${report.title}
Report Type: ${report.report_type}
Client: ${report.client_name || 'Internal'}
Period: ${report.reporting_period}

Generate a comprehensive, data-driven executive summary. Include:
1. Performance overview with key metrics
2. Market context and analysis
3. Risk factors and mitigation
4. Forward-looking outlook
5. Actionable recommendations

Return JSON: { "executive_summary": string, "sections": [{ "title": string, "content": string, "data_highlights": string[] }], "key_metrics": [{ "name": string, "value": string, "trend": "up"|"down"|"stable" }] }`;

    if (!aiProvider) {
      return {
        executive_summary: 'AI provider not configured — please set up an API key.',
        sections: [],
        key_metrics: [],
      };
    }
    const result = await aiProvider.generateJSON(prompt);
    return result;
  }

  /* ─── Dashboard ─── */
  async getDashboard(userId) {
    const [templates, reports] = await Promise.all([
      this.getTemplates(userId),
      this.getReports(userId),
    ]);
    const published = reports.filter(r => r.status === 'published').length;
    const draft = reports.filter(r => r.status === 'draft').length;
    const inReview = reports.filter(r => r.status === 'in_review').length;

    return {
      total_templates: templates.length,
      total_reports: reports.length,
      published_reports: published,
      draft_reports: draft,
      in_review_reports: inReview,
      recent_reports: reports.slice(0, 10),
      templates: templates.slice(0, 10),
    };
  }
}

export default new ReportingService();
