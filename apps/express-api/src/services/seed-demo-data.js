/**
 * Seed Demo Data Service
 * Inserts comprehensive, realistic mock data for all 6 modules:
 *   Projects, Resources, Regulatory, Procurement, KYC, Fraud Detection
 *
 * Designed for demo / showcase purposes — data is realistic but fictional.
 * Uses the Supabase service-key client so RLS is bypassed.
 */

import { supabase } from '../config/index.js';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simple UUID v4 generator */
const uuid = () => crypto.randomUUID();

/** Return a date string offset from today by `days` (negative = past) */
const dateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

const tsOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const _pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---------------------------------------------------------------------------
// 1. PROJECTS  (projects, project_tasks, project_risks, project_insights)
// ---------------------------------------------------------------------------

function buildProjects(userId) {
  const projectIds = [uuid(), uuid(), uuid(), uuid(), uuid()];

  const projects = [
    {
      id: projectIds[0],
      user_id: userId,
      name: 'AI Governance Framework v2.0',
      description: 'Enterprise-wide AI governance framework covering model risk, bias testing, and compliance automation for regulated industries.',
      status: 'active',
      priority: 'critical',
      start_date: dateOffset(-60),
      target_end_date: dateOffset(30),
      budget: 250000,
      spent: 142000,
      health_score: 78,
      tags: ['governance', 'ai', 'compliance', 'enterprise'],
    },
    {
      id: projectIds[1],
      user_id: userId,
      name: 'KYC Automation Pipeline',
      description: 'Automated client onboarding pipeline with AI-powered identity verification, sanctions screening, and risk scoring.',
      status: 'active',
      priority: 'high',
      start_date: dateOffset(-45),
      target_end_date: dateOffset(60),
      budget: 180000,
      spent: 67500,
      health_score: 92,
      tags: ['kyc', 'automation', 'onboarding'],
    },
    {
      id: projectIds[2],
      user_id: userId,
      name: 'Regulatory Change Monitoring',
      description: 'Real-time regulatory change detection and impact assessment system for Jersey Financial Services Commission and global bodies.',
      status: 'planning',
      priority: 'high',
      start_date: dateOffset(-10),
      target_end_date: dateOffset(120),
      budget: 95000,
      spent: 8200,
      health_score: 100,
      tags: ['regulatory', 'monitoring', 'jersey'],
    },
    {
      id: projectIds[3],
      user_id: userId,
      name: 'Fraud Detection ML Models',
      description: 'Next-generation fraud detection using graph neural networks and anomaly detection for transaction monitoring.',
      status: 'active',
      priority: 'critical',
      start_date: dateOffset(-90),
      target_end_date: dateOffset(15),
      budget: 320000,
      spent: 298000,
      health_score: 55,
      tags: ['fraud', 'ml', 'detection', 'urgent'],
    },
    {
      id: projectIds[4],
      user_id: userId,
      name: 'Procurement Analytics Dashboard',
      description: 'Centralised contract management and AI-driven spend analysis for vendor portfolio optimisation.',
      status: 'completed',
      priority: 'medium',
      start_date: dateOffset(-180),
      target_end_date: dateOffset(-15),
      actual_end_date: dateOffset(-10),
      budget: 75000,
      spent: 71200,
      health_score: 95,
      tags: ['procurement', 'analytics', 'dashboard'],
    },
  ];

  // Tasks — spread across projects with varied statuses
  const tasks = [
    // Project 0 — AI Governance
    { project_id: projectIds[0], user_id: userId, title: 'Define model risk taxonomy', status: 'done', priority: 'high', assignee: 'Sarah Chen', due_date: dateOffset(-30), estimated_hours: 40, actual_hours: 38 },
    { project_id: projectIds[0], user_id: userId, title: 'Implement bias testing framework', status: 'in_progress', priority: 'critical', assignee: 'James Wilson', due_date: dateOffset(5), estimated_hours: 120, actual_hours: 80 },
    { project_id: projectIds[0], user_id: userId, title: 'Compliance audit report generator', status: 'in_progress', priority: 'high', assignee: 'Maria Lopez', due_date: dateOffset(14), estimated_hours: 60, actual_hours: 25 },
    { project_id: projectIds[0], user_id: userId, title: 'Board presentation materials', status: 'todo', priority: 'medium', assignee: 'David Park', due_date: dateOffset(20), estimated_hours: 16, actual_hours: 0 },
    { project_id: projectIds[0], user_id: userId, title: 'Data lineage mapping', status: 'blocked', priority: 'high', assignee: 'James Wilson', due_date: dateOffset(-5), estimated_hours: 80, actual_hours: 45, tags: ['blocked-by-vendor'] },
    { project_id: projectIds[0], user_id: userId, title: 'Stakeholder review sign-off', status: 'review', priority: 'medium', assignee: 'Sarah Chen', due_date: dateOffset(10), estimated_hours: 8, actual_hours: 6 },

    // Project 1 — KYC Automation
    { project_id: projectIds[1], user_id: userId, title: 'Identity verification API integration', status: 'done', priority: 'critical', assignee: 'Alex Turner', due_date: dateOffset(-20), estimated_hours: 80, actual_hours: 72 },
    { project_id: projectIds[1], user_id: userId, title: 'Sanctions screening module', status: 'done', priority: 'high', assignee: 'Priya Sharma', due_date: dateOffset(-10), estimated_hours: 60, actual_hours: 55 },
    { project_id: projectIds[1], user_id: userId, title: 'Risk scoring algorithm', status: 'in_progress', priority: 'high', assignee: 'Alex Turner', due_date: dateOffset(15), estimated_hours: 100, actual_hours: 40 },
    { project_id: projectIds[1], user_id: userId, title: 'Document OCR pipeline', status: 'todo', priority: 'medium', assignee: 'Priya Sharma', due_date: dateOffset(30), estimated_hours: 40, actual_hours: 0 },

    // Project 2 — Regulatory
    { project_id: projectIds[2], user_id: userId, title: 'RSS feed parser for JFSC', status: 'in_progress', priority: 'high', assignee: 'Tom Richards', due_date: dateOffset(20), estimated_hours: 30, actual_hours: 12 },
    { project_id: projectIds[2], user_id: userId, title: 'NLP impact analysis model', status: 'todo', priority: 'critical', assignee: 'Maria Lopez', due_date: dateOffset(45), estimated_hours: 100, actual_hours: 0 },

    // Project 3 — Fraud Detection
    { project_id: projectIds[3], user_id: userId, title: 'Graph neural network training', status: 'done', priority: 'critical', assignee: 'James Wilson', due_date: dateOffset(-30), estimated_hours: 160, actual_hours: 175 },
    { project_id: projectIds[3], user_id: userId, title: 'Real-time scoring API', status: 'in_progress', priority: 'critical', assignee: 'Alex Turner', due_date: dateOffset(-2), estimated_hours: 80, actual_hours: 70 },
    { project_id: projectIds[3], user_id: userId, title: 'Alert triage dashboard', status: 'blocked', priority: 'high', assignee: 'David Park', due_date: dateOffset(-10), estimated_hours: 60, actual_hours: 30 },
    { project_id: projectIds[3], user_id: userId, title: 'Model validation report', status: 'todo', priority: 'high', assignee: 'Sarah Chen', due_date: dateOffset(10), estimated_hours: 40, actual_hours: 0 },

    // Project 4 — Procurement (completed)
    { project_id: projectIds[4], user_id: userId, title: 'Contract data migration', status: 'done', priority: 'high', assignee: 'Tom Richards', due_date: dateOffset(-60), estimated_hours: 40, actual_hours: 35 },
    { project_id: projectIds[4], user_id: userId, title: 'Spend analysis dashboards', status: 'done', priority: 'medium', assignee: 'Priya Sharma', due_date: dateOffset(-30), estimated_hours: 60, actual_hours: 58 },
    { project_id: projectIds[4], user_id: userId, title: 'Vendor risk scoring', status: 'done', priority: 'high', assignee: 'Maria Lopez', due_date: dateOffset(-20), estimated_hours: 50, actual_hours: 48 },
  ];

  // Risks
  const risks = [
    { project_id: projectIds[0], user_id: userId, title: 'Vendor API breaking changes', category: 'external', likelihood: 'high', impact: 'critical', status: 'mitigating', mitigation: 'Maintain compatibility layer and pin API versions', owner: 'James Wilson', ai_detected: true },
    { project_id: projectIds[0], user_id: userId, title: 'Regulatory deadline pressure', category: 'schedule', likelihood: 'medium', impact: 'high', status: 'open', mitigation: 'Phased rollout plan with minimum viable compliance set', owner: 'Sarah Chen', ai_detected: false },
    { project_id: projectIds[0], user_id: userId, title: 'Model bias in credit decisions', category: 'technical', likelihood: 'medium', impact: 'critical', status: 'open', mitigation: 'Implement fairness metrics and regular bias audits', owner: 'Maria Lopez', ai_detected: true },
    { project_id: projectIds[1], user_id: userId, title: 'Data quality issues in legacy CRM', category: 'technical', likelihood: 'high', impact: 'medium', status: 'mitigating', mitigation: 'Data cleansing pipeline with validation rules', owner: 'Alex Turner', ai_detected: false },
    { project_id: projectIds[3], user_id: userId, title: 'Model drift in production', category: 'technical', likelihood: 'high', impact: 'critical', status: 'open', mitigation: 'Automated monitoring and retraining triggers', owner: 'James Wilson', ai_detected: true },
    { project_id: projectIds[3], user_id: userId, title: 'Budget overrun risk', category: 'budget', likelihood: 'high', impact: 'high', status: 'open', mitigation: 'Seek additional funding; prioritise critical features only', owner: 'David Park', ai_detected: true },
    { project_id: projectIds[2], user_id: userId, title: 'Data source reliability', category: 'external', likelihood: 'medium', impact: 'medium', status: 'open', mitigation: 'Implement redundant source monitoring', owner: 'Tom Richards', ai_detected: false },
  ];

  // Insights
  const insights = [
    { project_id: projectIds[0], user_id: userId, type: 'risk', severity: 'critical', title: 'Budget burn rate exceeding plan', body: 'At current velocity, the AI Governance project will exhaust its budget 3 weeks before the target end date. Consider re-prioritising lower-value tasks or requesting a budget increase.', ai_model: 'gpt-4o', ai_provider: 'openai', is_dismissed: false },
    { project_id: projectIds[0], user_id: userId, type: 'recommendation', severity: 'warning', title: 'Blocked task requires attention', body: 'The "Data lineage mapping" task has been blocked for 5 days. AI analysis suggests the vendor dependency can be mitigated with an alternative open-source tool.', ai_model: 'claude-3.5-sonnet', ai_provider: 'anthropic', is_dismissed: false },
    { project_id: projectIds[1], user_id: userId, type: 'health', severity: 'info', title: 'KYC project on track', body: 'All milestones achieved within 5% of estimated effort. Team velocity is stable at 45 story points per sprint.', ai_model: 'gpt-4o', ai_provider: 'openai', is_dismissed: false },
    { project_id: projectIds[3], user_id: userId, type: 'anomaly', severity: 'critical', title: 'Fraud Detection nearing deadline with open blockers', body: 'Project is 93% of budget spent with 2 blocked tasks and overdue items. Target end date is in 15 days. Recommend immediate escalation and scope review.', ai_model: 'claude-3.5-sonnet', ai_provider: 'anthropic', is_dismissed: false },
    { project_id: projectIds[3], user_id: userId, type: 'forecast', severity: 'warning', title: 'Delivery at risk without intervention', body: 'Based on current task completion rate and remaining effort, there is a 72% probability of missing the target delivery date by 2-3 weeks.', ai_model: 'gpt-4o', ai_provider: 'openai', is_dismissed: false },
    { project_id: projectIds[4], user_id: userId, type: 'health', severity: 'info', title: 'Procurement project completed successfully', body: 'All tasks delivered on time and within 5% of budget. Recommended as a template for future analytics projects.', ai_model: 'gpt-4o', ai_provider: 'openai', is_dismissed: false },
  ];

  return { projects, tasks, risks, insights, projectIds };
}

// ---------------------------------------------------------------------------
// 2. RESOURCES  (resources, resource_allocations)
// ---------------------------------------------------------------------------

function buildResources(userId, projectIds) {
  const resourceIds = [uuid(), uuid(), uuid(), uuid(), uuid(), uuid(), uuid(), uuid()];

  const resources = [
    { id: resourceIds[0], user_id: userId, name: 'Sarah Chen', email: 'sarah.chen@velanova.io', role: 'Lead Data Scientist', department: 'AI & Analytics', skills: ['python', 'machine-learning', 'tensorflow', 'governance'], cost_rate: 125.00, available_hours_week: 40, status: 'active' },
    { id: resourceIds[1], user_id: userId, name: 'James Wilson', email: 'james.wilson@velanova.io', role: 'Senior ML Engineer', department: 'AI & Analytics', skills: ['python', 'pytorch', 'mlops', 'kubernetes'], cost_rate: 115.00, available_hours_week: 40, status: 'active' },
    { id: resourceIds[2], user_id: userId, name: 'Maria Lopez', email: 'maria.lopez@velanova.io', role: 'Compliance Analyst', department: 'Compliance', skills: ['regulatory-analysis', 'risk-assessment', 'reporting', 'aml'], cost_rate: 95.00, available_hours_week: 40, status: 'active' },
    { id: resourceIds[3], user_id: userId, name: 'Alex Turner', email: 'alex.turner@velanova.io', role: 'Full Stack Developer', department: 'Engineering', skills: ['react', 'node.js', 'typescript', 'postgresql', 'api-design'], cost_rate: 105.00, available_hours_week: 40, status: 'active' },
    { id: resourceIds[4], user_id: userId, name: 'Priya Sharma', email: 'priya.sharma@velanova.io', role: 'Data Engineer', department: 'Engineering', skills: ['python', 'sql', 'etl', 'airflow', 'spark'], cost_rate: 100.00, available_hours_week: 40, status: 'active' },
    { id: resourceIds[5], user_id: userId, name: 'David Park', email: 'david.park@velanova.io', role: 'Product Manager', department: 'Product', skills: ['product-strategy', 'agile', 'stakeholder-management', 'roadmapping'], cost_rate: 110.00, available_hours_week: 35, status: 'active' },
    { id: resourceIds[6], user_id: userId, name: 'Tom Richards', email: 'tom.richards@velanova.io', role: 'DevOps Engineer', department: 'Engineering', skills: ['docker', 'kubernetes', 'terraform', 'ci-cd', 'monitoring'], cost_rate: 108.00, available_hours_week: 40, status: 'active' },
    { id: resourceIds[7], user_id: userId, name: 'Emma White', email: 'emma.white@velanova.io', role: 'UX Designer', department: 'Product', skills: ['figma', 'user-research', 'design-systems', 'prototyping'], cost_rate: 90.00, available_hours_week: 32, status: 'on_leave' },
  ];

  const allocations = [
    { user_id: userId, resource_id: resourceIds[0], project_id: projectIds[0], project_name: 'AI Governance Framework v2.0', allocated_hours: 120, start_date: dateOffset(-60), end_date: dateOffset(30), role_on_project: 'Technical Lead', utilization_pct: 75, status: 'active' },
    { user_id: userId, resource_id: resourceIds[1], project_id: projectIds[0], project_name: 'AI Governance Framework v2.0', allocated_hours: 160, start_date: dateOffset(-60), end_date: dateOffset(30), role_on_project: 'ML Engineer', utilization_pct: 90, status: 'active' },
    { user_id: userId, resource_id: resourceIds[1], project_id: projectIds[3], project_name: 'Fraud Detection ML Models', allocated_hours: 200, start_date: dateOffset(-90), end_date: dateOffset(15), role_on_project: 'Lead ML Engineer', utilization_pct: 95, status: 'active' },
    { user_id: userId, resource_id: resourceIds[2], project_id: projectIds[0], project_name: 'AI Governance Framework v2.0', allocated_hours: 60, start_date: dateOffset(-45), end_date: dateOffset(30), role_on_project: 'Compliance Advisor', utilization_pct: 40, status: 'active' },
    { user_id: userId, resource_id: resourceIds[2], project_id: projectIds[2], project_name: 'Regulatory Change Monitoring', allocated_hours: 80, start_date: dateOffset(-10), end_date: dateOffset(120), role_on_project: 'Regulatory Lead', utilization_pct: 50, status: 'active' },
    { user_id: userId, resource_id: resourceIds[3], project_id: projectIds[1], project_name: 'KYC Automation Pipeline', allocated_hours: 200, start_date: dateOffset(-45), end_date: dateOffset(60), role_on_project: 'Backend Developer', utilization_pct: 85, status: 'active' },
    { user_id: userId, resource_id: resourceIds[3], project_id: projectIds[3], project_name: 'Fraud Detection ML Models', allocated_hours: 80, start_date: dateOffset(-30), end_date: dateOffset(15), role_on_project: 'API Developer', utilization_pct: 60, status: 'active' },
    { user_id: userId, resource_id: resourceIds[4], project_id: projectIds[1], project_name: 'KYC Automation Pipeline', allocated_hours: 150, start_date: dateOffset(-30), end_date: dateOffset(60), role_on_project: 'Data Pipeline Engineer', utilization_pct: 70, status: 'active' },
    { user_id: userId, resource_id: resourceIds[5], project_id: projectIds[0], project_name: 'AI Governance Framework v2.0', allocated_hours: 40, start_date: dateOffset(-60), end_date: dateOffset(30), role_on_project: 'Product Owner', utilization_pct: 30, status: 'active' },
    { user_id: userId, resource_id: resourceIds[5], project_id: projectIds[3], project_name: 'Fraud Detection ML Models', allocated_hours: 30, start_date: dateOffset(-30), end_date: dateOffset(15), role_on_project: 'Product Manager', utilization_pct: 25, status: 'active' },
    { user_id: userId, resource_id: resourceIds[6], project_id: projectIds[1], project_name: 'KYC Automation Pipeline', allocated_hours: 60, start_date: dateOffset(-20), end_date: dateOffset(60), role_on_project: 'DevOps', utilization_pct: 35, status: 'active' },
    { user_id: userId, resource_id: resourceIds[6], project_id: projectIds[2], project_name: 'Regulatory Change Monitoring', allocated_hours: 40, start_date: dateOffset(-10), end_date: dateOffset(60), role_on_project: 'Infrastructure', utilization_pct: 25, status: 'active' },
    // Completed allocations
    { user_id: userId, resource_id: resourceIds[4], project_id: projectIds[4], project_name: 'Procurement Analytics Dashboard', allocated_hours: 120, start_date: dateOffset(-180), end_date: dateOffset(-15), role_on_project: 'Data Engineer', utilization_pct: 60, status: 'completed' },
    { user_id: userId, resource_id: resourceIds[2], project_id: projectIds[4], project_name: 'Procurement Analytics Dashboard', allocated_hours: 80, start_date: dateOffset(-120), end_date: dateOffset(-15), role_on_project: 'Compliance Review', utilization_pct: 40, status: 'completed' },
  ];

  return { resources, allocations };
}

// ---------------------------------------------------------------------------
// 3. REGULATORY  (regulatory_sources, regulatory_changes, compliance_assessments)
// ---------------------------------------------------------------------------

function buildRegulatory(userId) {
  const sourceIds = [uuid(), uuid(), uuid(), uuid()];
  const changeIds = [uuid(), uuid(), uuid(), uuid(), uuid(), uuid()];

  const sources = [
    { id: sourceIds[0], user_id: userId, name: 'Jersey Financial Services Commission (JFSC)', url: 'https://www.jerseyfsc.org', type: 'website', jurisdiction: 'Jersey', sector: 'financial_services', is_active: true, check_frequency: 'daily', last_checked_at: tsOffset(0) },
    { id: sourceIds[1], user_id: userId, name: 'UK Financial Conduct Authority (FCA)', url: 'https://www.fca.org.uk/news', type: 'rss', jurisdiction: 'UK', sector: 'financial_services', is_active: true, check_frequency: 'daily', last_checked_at: tsOffset(0) },
    { id: sourceIds[2], user_id: userId, name: 'EU AI Act Updates', url: 'https://artificialintelligenceact.eu', type: 'website', jurisdiction: 'EU', sector: 'technology', is_active: true, check_frequency: 'weekly', last_checked_at: tsOffset(-3) },
    { id: sourceIds[3], user_id: userId, name: 'Basel Committee Publications', url: 'https://www.bis.org/bcbs', type: 'rss', jurisdiction: 'International', sector: 'banking', is_active: true, check_frequency: 'weekly', last_checked_at: tsOffset(-5) },
  ];

  const changes = [
    { id: changeIds[0], user_id: userId, source_id: sourceIds[0], title: 'JFSC Updates AML/CFT Handbook — New CDD Requirements', summary: 'The JFSC has published amendments to the AML/CFT Handbook requiring enhanced customer due diligence for high-risk jurisdictions and PEPs.', change_type: 'amendment', jurisdiction: 'Jersey', sector: ['financial_services', 'banking'], effective_date: dateOffset(30), severity: 'high', status: 'under_review', ai_impact_summary: 'Significant impact on KYC processes. Enhanced due diligence requirements will affect approximately 15% of existing client profiles. Recommend updating risk scoring models and CDD checklists within 30 days.', ai_action_items: ['Update CDD questionnaire for high-risk jurisdictions', 'Retrain risk scoring model', 'Review existing PEP client files', 'Update onboarding workflows'], ai_risk_score: 78, tags: ['aml', 'cdd', 'pep'], external_url: 'https://www.jerseyfsc.org/industry/aml-cft' },
    { id: changeIds[1], user_id: userId, source_id: sourceIds[1], title: 'FCA Consumer Duty — AI in Financial Advice', summary: 'New guidance on the use of AI in automated financial advice, emphasising explainability, fairness, and consumer outcomes monitoring.', change_type: 'guidance', jurisdiction: 'UK', sector: ['financial_services'], effective_date: dateOffset(60), severity: 'critical', status: 'new', ai_impact_summary: 'Critical impact for any AI-driven advisory services. Requires model explainability documentation and ongoing outcome monitoring. Cross-jurisdictional relevance for Jersey-domiciled entities serving UK clients.', ai_action_items: ['Audit existing AI advisory models for explainability', 'Implement outcome monitoring dashboards', 'Update model documentation', 'Assess cross-border applicability'], ai_risk_score: 92, tags: ['ai', 'consumer-duty', 'explainability'], external_url: 'https://www.fca.org.uk/publications' },
    { id: changeIds[2], user_id: userId, source_id: sourceIds[2], title: 'EU AI Act — High-Risk AI System Classification', summary: 'Updated technical standards for classification of high-risk AI systems, including financial services applications for credit scoring and fraud detection.', change_type: 'new_regulation', jurisdiction: 'EU', sector: ['technology', 'financial_services'], effective_date: dateOffset(90), severity: 'critical', status: 'assessed', ai_impact_summary: 'Our fraud detection and credit scoring models likely qualify as high-risk under the new classification. Mandatory conformity assessment, risk management system, and human oversight requirements.', ai_action_items: ['Classify all AI models against high-risk criteria', 'Establish conformity assessment process', 'Implement human oversight mechanisms', 'Create risk management documentation'], ai_risk_score: 88, tags: ['eu-ai-act', 'high-risk', 'classification'] },
    { id: changeIds[3], user_id: userId, source_id: sourceIds[0], title: 'JFSC Technology Risk Requirements — Cloud Computing', summary: 'Updated guidance on cloud computing risk management for regulated entities, including data residency and third-party oversight.', change_type: 'guidance', jurisdiction: 'Jersey', sector: ['financial_services', 'technology'], effective_date: dateOffset(45), severity: 'medium', status: 'new', ai_impact_summary: 'Moderate impact. Current Supabase deployment is EU-hosted which aligns with guidance. May need formal cloud risk assessment documentation and vendor due diligence updates.', ai_action_items: ['Complete cloud risk assessment template', 'Update vendor due diligence for Supabase', 'Review data residency compliance', 'Document business continuity plans'], ai_risk_score: 55, tags: ['cloud', 'technology-risk', 'data-residency'] },
    { id: changeIds[4], user_id: userId, source_id: sourceIds[3], title: 'Basel III.1 — Operational Risk Capital Requirements', summary: 'Final standards for operational risk capital requirements with specific provisions for technology and cyber risk in banking institutions.', change_type: 'new_regulation', jurisdiction: 'International', sector: ['banking'], effective_date: dateOffset(180), severity: 'medium', status: 'new', ai_impact_summary: 'Impacts capital allocation for operational risk. AI/technology risk should be factored into operational risk models. Timeline allows for phased implementation.', ai_action_items: ['Review current operational risk capital calculations', 'Include technology risk components', 'Update internal capital adequacy assessment'], ai_risk_score: 42, tags: ['basel', 'operational-risk', 'capital'] },
    { id: changeIds[5], user_id: userId, source_id: sourceIds[1], title: 'FCA Crypto-Asset Promotions — New Requirements', summary: 'Updated rules for crypto-asset promotions ensuring clear risk warnings and alignment with financial promotions regime.', change_type: 'enforcement', jurisdiction: 'UK', sector: ['financial_services'], effective_date: dateOffset(-10), severity: 'low', status: 'implemented', ai_impact_summary: 'Low direct impact. Our platform does not currently handle crypto-asset promotions. Filed for awareness and monitoring.', ai_action_items: ['Monitor for any product expansion into crypto', 'Update regulatory mapping notes'], ai_risk_score: 15, tags: ['crypto', 'promotions'] },
  ];

  const assessments = [
    { user_id: userId, change_id: changeIds[0], assessment_type: 'impact', current_compliance: 'partial', required_actions: JSON.stringify([{ action: 'Update CDD processes', priority: 'high', deadline: dateOffset(25) }, { action: 'Retrain staff on new requirements', priority: 'medium', deadline: dateOffset(28) }]), deadline: dateOffset(28), assigned_to: 'Maria Lopez', ai_analysis: JSON.stringify({ confidence: 0.87, key_gaps: ['PEP screening frequency', 'High-risk jurisdiction list outdated'], estimated_effort_hours: 120 }), status: 'in_progress' },
    { user_id: userId, change_id: changeIds[1], assessment_type: 'gap', current_compliance: 'non_compliant', required_actions: JSON.stringify([{ action: 'Implement model explainability module', priority: 'critical', deadline: dateOffset(55) }, { action: 'Build outcome monitoring dashboard', priority: 'high', deadline: dateOffset(50) }]), deadline: dateOffset(55), assigned_to: 'Sarah Chen', ai_analysis: JSON.stringify({ confidence: 0.91, key_gaps: ['No explainability framework', 'Missing outcome tracking'], estimated_effort_hours: 200 }), status: 'pending' },
    { user_id: userId, change_id: changeIds[2], assessment_type: 'action_plan', current_compliance: 'partial', required_actions: JSON.stringify([{ action: 'AI model classification audit', priority: 'high', deadline: dateOffset(60) }, { action: 'Conformity assessment preparation', priority: 'medium', deadline: dateOffset(80) }]), deadline: dateOffset(85), assigned_to: 'David Park', ai_analysis: JSON.stringify({ confidence: 0.82, key_gaps: ['Model registry incomplete', 'Bias testing not formalised'], estimated_effort_hours: 160 }), status: 'in_progress' },
  ];

  return { sources, changes, assessments };
}

// ---------------------------------------------------------------------------
// 4. PROCUREMENT  (contracts, contract_clauses, procurement_reviews)
// ---------------------------------------------------------------------------

function buildProcurement(userId) {
  const contractIds = [uuid(), uuid(), uuid(), uuid(), uuid(), uuid()];

  const contracts = [
    { id: contractIds[0], user_id: userId, title: 'Supabase Enterprise — Database & Auth', vendor: 'Supabase Inc.', contract_type: 'license', value: 48000, currency: 'USD', start_date: dateOffset(-365), end_date: dateOffset(0), renewal_date: dateOffset(-5), auto_renew: true, status: 'expiring', risk_score: 35, department: 'Engineering', owner: 'Tom Richards', tags: ['saas', 'database', 'critical-infrastructure'] },
    { id: contractIds[1], user_id: userId, title: 'AWS Cloud Hosting — Production Environment', vendor: 'Amazon Web Services', contract_type: 'service', value: 180000, currency: 'USD', start_date: dateOffset(-180), end_date: dateOffset(185), renewal_date: dateOffset(170), auto_renew: true, status: 'active', risk_score: 20, department: 'Engineering', owner: 'Tom Richards', tags: ['cloud', 'infrastructure', 'hosting'] },
    { id: contractIds[2], user_id: userId, title: 'OpenAI API Access — GPT-4 Enterprise', vendor: 'OpenAI', contract_type: 'license', value: 96000, currency: 'USD', start_date: dateOffset(-90), end_date: dateOffset(275), renewal_date: dateOffset(245), auto_renew: false, status: 'active', risk_score: 55, department: 'AI & Analytics', owner: 'Sarah Chen', tags: ['ai', 'llm', 'api'] },
    { id: contractIds[3], user_id: userId, title: 'Anthropic Claude API — Enterprise', vendor: 'Anthropic', contract_type: 'license', value: 72000, currency: 'USD', start_date: dateOffset(-60), end_date: dateOffset(305), renewal_date: dateOffset(275), auto_renew: false, status: 'active', risk_score: 45, department: 'AI & Analytics', owner: 'Sarah Chen', tags: ['ai', 'llm', 'api'] },
    { id: contractIds[4], user_id: userId, title: 'Deloitte — Regulatory Advisory Services', vendor: 'Deloitte LLP', contract_type: 'consulting', value: 250000, currency: 'GBP', start_date: dateOffset(-120), end_date: dateOffset(60), renewal_date: dateOffset(30), auto_renew: false, status: 'active', risk_score: 30, department: 'Compliance', owner: 'Maria Lopez', tags: ['consulting', 'regulatory', 'advisory'] },
    { id: contractIds[5], user_id: userId, title: 'Office Space Lease — St. Helier', vendor: 'Jersey Property Co.', contract_type: 'lease', value: 85000, currency: 'GBP', start_date: dateOffset(-365), end_date: dateOffset(365), renewal_date: dateOffset(300), auto_renew: true, status: 'active', risk_score: 15, department: 'Operations', owner: 'David Park', tags: ['property', 'lease'] },
  ];

  const clauses = [
    // Supabase contract
    { contract_id: contractIds[0], user_id: userId, clause_type: 'data_protection', title: 'Data Processing Agreement', content: 'Processor shall implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk.', risk_level: 'medium', ai_assessment: 'Standard DPA but lacks specific reference to Jersey data protection laws. Recommend addendum.', ai_recommendation: 'Add Jersey-specific data protection compliance clause referencing the Data Protection (Jersey) Law 2018.', flagged: true },
    { contract_id: contractIds[0], user_id: userId, clause_type: 'termination', title: 'Termination for Convenience', content: 'Either party may terminate with 30 days written notice.', risk_level: 'low', ai_assessment: 'Standard termination clause with reasonable notice period.', ai_recommendation: 'Acceptable as-is. Consider negotiating data export assistance clause.' },
    { contract_id: contractIds[0], user_id: userId, clause_type: 'sla', title: 'Service Level Agreement', content: '99.9% uptime guarantee with credits for downtime exceeding SLA.', risk_level: 'low', ai_assessment: 'Industry standard SLA for database services.' },
    // OpenAI contract
    { contract_id: contractIds[2], user_id: userId, clause_type: 'ip', title: 'Intellectual Property — Model Outputs', content: 'Customer retains all rights to outputs generated using the API. Provider retains rights to model weights and training data.', risk_level: 'medium', ai_assessment: 'IP ownership of outputs is clear, but usage of outputs for model training is ambiguous.', ai_recommendation: 'Clarify that customer data and outputs will not be used for model training. Add explicit opt-out clause.', flagged: true },
    { contract_id: contractIds[2], user_id: userId, clause_type: 'liability', title: 'Limitation of Liability', content: 'Total liability limited to fees paid in the 12 months preceding the claim.', risk_level: 'high', ai_assessment: 'Standard limitation but may be insufficient given the criticality of AI outputs in regulated decisions.', ai_recommendation: 'Negotiate higher cap or carve-out for data breaches and regulatory penalties.', flagged: true },
    // Deloitte contract
    { contract_id: contractIds[4], user_id: userId, clause_type: 'confidentiality', title: 'Confidentiality & Non-Disclosure', content: 'Both parties agree to maintain strict confidentiality of all shared information for a period of 5 years post-termination.', risk_level: 'low', ai_assessment: 'Comprehensive confidentiality clause with appropriate duration.' },
    { contract_id: contractIds[4], user_id: userId, clause_type: 'payment', title: 'Payment Terms', content: 'Monthly invoicing with 30-day payment terms. Late payments accrue interest at 2% above base rate.', risk_level: 'low', ai_assessment: 'Standard payment terms.' },
    // AWS contract
    { contract_id: contractIds[1], user_id: userId, clause_type: 'force_majeure', title: 'Force Majeure', content: 'Neither party liable for failure to perform due to events beyond reasonable control including natural disasters, war, and government actions.', risk_level: 'low', ai_assessment: 'Standard force majeure clause. Note: does not explicitly cover pandemic or cyber-attack scenarios.' },
    { contract_id: contractIds[1], user_id: userId, clause_type: 'data_protection', title: 'EU Data Residency Addendum', content: 'All data to be stored and processed within EU data centres. Customer may select specific regions.', risk_level: 'low', ai_assessment: 'Strong data residency commitment aligning with Jersey regulatory guidance.' },
  ];

  const reviews = [
    { contract_id: contractIds[0], user_id: userId, review_type: 'renewal', overall_risk: 'medium', findings: JSON.stringify([{ finding: 'Contract expiring in 5 days', severity: 'high' }, { finding: 'Missing Jersey data protection addendum', severity: 'medium' }, { finding: 'Auto-renew at same terms', severity: 'low' }]), recommendations: ['Negotiate Jersey data protection addendum before renewal', 'Review pricing against market alternatives', 'Add data export SLA clause'], ai_summary: 'Supabase contract due for renewal. Overall good value but needs Jersey-specific data protection updates. Recommend renewing with addendum.', status: 'action_required' },
    { contract_id: contractIds[2], user_id: userId, review_type: 'risk', overall_risk: 'high', findings: JSON.stringify([{ finding: 'IP clause ambiguity on training data usage', severity: 'high' }, { finding: 'Liability cap may be insufficient for regulated use', severity: 'high' }, { finding: 'No explicit AI model versioning commitment', severity: 'medium' }]), recommendations: ['Negotiate explicit opt-out from training data usage', 'Increase liability cap for regulated outputs', 'Add model version pinning clause'], ai_summary: 'OpenAI contract has elevated risk for regulated financial services use. Key concerns around IP, liability, and model stability. Recommend renegotiation.', status: 'action_required' },
    { contract_id: contractIds[4], user_id: userId, review_type: 'value', overall_risk: 'low', findings: JSON.stringify([{ finding: 'Deliverables on track with agreed milestones', severity: 'low' }, { finding: 'Strong expertise in Jersey regulatory landscape', severity: 'low' }]), recommendations: ['Continue engagement', 'Consider extending scope to EU AI Act advisory'], ai_summary: 'Deloitte advisory engagement delivering strong value. On track and within budget. Consider scope expansion for EU AI Act preparedness.', status: 'completed' },
  ];

  return { contracts, clauses, reviews };
}

// ---------------------------------------------------------------------------
// 5. KYC  (clients, kyc_checks, kyc_documents, onboarding_workflows)
// ---------------------------------------------------------------------------

function buildKYC(userId) {
  const clientIds = [uuid(), uuid(), uuid(), uuid(), uuid(), uuid(), uuid()];

  const clients = [
    { id: clientIds[0], user_id: userId, name: 'Meridian Capital Partners Ltd', entity_type: 'corporate', jurisdiction: 'JE', email: 'compliance@meridiancapital.je', risk_rating: 'standard', overall_risk_score: 35, status: 'active', source_of_wealth: 'Investment management fees', source_of_funds: 'Client management fees and carried interest', industry: 'Investment Management', pep_status: false, sanctions_checked: true, adverse_media_checked: true, last_review_date: tsOffset(-30), next_review_date: tsOffset(335) },
    { id: clientIds[1], user_id: userId, name: 'Sir Richard Thornton', entity_type: 'individual', jurisdiction: 'GB', email: 'r.thornton@thorntongroup.com', risk_rating: 'pep', overall_risk_score: 82, status: 'active', source_of_wealth: 'Family trust and political career', source_of_funds: 'Trust distributions and consulting fees', industry: 'Government / Consulting', pep_status: true, sanctions_checked: true, adverse_media_checked: true, last_review_date: tsOffset(-15), next_review_date: tsOffset(75) },
    { id: clientIds[2], user_id: userId, name: 'Nordic Heritage Trust', entity_type: 'trust', jurisdiction: 'JE', email: 'admin@nordictrustees.je', risk_rating: 'enhanced', overall_risk_score: 68, status: 'active', source_of_wealth: 'Inherited wealth — Nordic shipping family', source_of_funds: 'Trust corpus and investment returns', industry: 'Family Office / Trust', pep_status: false, sanctions_checked: true, adverse_media_checked: true, last_review_date: tsOffset(-90), next_review_date: tsOffset(0) },
    { id: clientIds[3], user_id: userId, name: 'TechBridge Ventures Fund I', entity_type: 'fund', jurisdiction: 'JE', email: 'ops@techbridgevc.com', risk_rating: 'standard', overall_risk_score: 28, status: 'onboarding', source_of_wealth: 'Institutional investor commitments', source_of_funds: 'Capital calls from limited partners', industry: 'Venture Capital', pep_status: false, sanctions_checked: true, adverse_media_checked: false },
    { id: clientIds[4], user_id: userId, name: 'Al-Rashid Holdings SARL', entity_type: 'corporate', jurisdiction: 'LU', email: 'legal@alrashidholdings.lu', risk_rating: 'high', overall_risk_score: 76, status: 'onboarding', source_of_wealth: 'Real estate and construction conglomerate', source_of_funds: 'Operating revenue and asset disposals', industry: 'Real Estate / Construction', pep_status: false, sanctions_checked: false, adverse_media_checked: false },
    { id: clientIds[5], user_id: userId, name: 'Green Energy Transition Fund', entity_type: 'fund', jurisdiction: 'IE', email: 'compliance@getfund.ie', risk_rating: 'low', overall_risk_score: 12, status: 'active', source_of_wealth: 'ESG-focused institutional investments', source_of_funds: 'Capital commitments from pension funds', industry: 'Sustainable Finance', pep_status: false, sanctions_checked: true, adverse_media_checked: true, last_review_date: tsOffset(-60), next_review_date: tsOffset(305) },
    { id: clientIds[6], user_id: userId, name: 'Phoenix Trading Corp', entity_type: 'corporate', jurisdiction: 'HK', email: 'admin@phoenixtrading.hk', risk_rating: 'high', overall_risk_score: 85, status: 'suspended', source_of_wealth: 'Commodities trading', source_of_funds: 'Trading profits — investigating adverse media', industry: 'Commodities Trading', pep_status: false, sanctions_checked: true, adverse_media_checked: true, last_review_date: tsOffset(-5), next_review_date: tsOffset(25), notes: 'Suspended due to adverse media hits. Pending enhanced due diligence review.' },
  ];

  const checks = [
    // Meridian Capital
    { client_id: clientIds[0], user_id: userId, check_type: 'identity', status: 'passed', result: JSON.stringify({ verified: true, match_score: 0.98 }), ai_assessment: 'Corporate documents verified against Jersey registry. All directors confirmed.', ai_confidence: 0.96, provider: 'Onfido', completed_at: tsOffset(-30) },
    { client_id: clientIds[0], user_id: userId, check_type: 'sanctions', status: 'passed', result: JSON.stringify({ hits: 0, lists_checked: 42 }), ai_assessment: 'No sanctions matches across 42 global lists.', ai_confidence: 0.99, provider: 'ComplyAdvantage', completed_at: tsOffset(-30) },
    { client_id: clientIds[0], user_id: userId, check_type: 'adverse_media', status: 'passed', result: JSON.stringify({ articles_found: 2, risk_level: 'low' }), ai_assessment: '2 neutral media mentions found. No adverse content.', ai_confidence: 0.94, provider: 'ComplyAdvantage', completed_at: tsOffset(-29) },
    // Sir Richard Thornton (PEP)
    { client_id: clientIds[1], user_id: userId, check_type: 'identity', status: 'passed', result: JSON.stringify({ verified: true, match_score: 0.99 }), ai_assessment: 'Identity verified via government-issued passport.', ai_confidence: 0.98, provider: 'Onfido', completed_at: tsOffset(-20) },
    { client_id: clientIds[1], user_id: userId, check_type: 'pep', status: 'passed', result: JSON.stringify({ pep_match: true, level: 'national', role: 'Former Cabinet Minister' }), ai_assessment: 'Confirmed PEP — Former UK Cabinet Minister (2015-2020). Enhanced monitoring required.', ai_risk_flags: ['pep-tier-1', 'government-official', 'enhanced-monitoring-required'], ai_confidence: 0.99, provider: 'World-Check', completed_at: tsOffset(-20) },
    { client_id: clientIds[1], user_id: userId, check_type: 'source_of_wealth', status: 'needs_review', result: JSON.stringify({ declared: 'Family trust and political career', ai_concerns: ['Large unexplained deposits in 2019'] }), ai_assessment: 'Source of wealth partially verified. AI flagged unusual deposit pattern during political tenure requiring further investigation.', ai_risk_flags: ['unexplained-wealth', 'investigation-recommended'], ai_confidence: 0.72, provider: 'Internal AI' },
    { client_id: clientIds[1], user_id: userId, check_type: 'enhanced_due_diligence', status: 'in_progress', result: JSON.stringify({}), ai_assessment: 'EDD in progress. Awaiting enhanced documentation and source of wealth verification.', ai_confidence: 0.50, provider: 'Internal' },
    // Nordic Heritage Trust
    { client_id: clientIds[2], user_id: userId, check_type: 'identity', status: 'passed', result: JSON.stringify({ verified: true }), ai_confidence: 0.95, provider: 'Onfido', completed_at: tsOffset(-90) },
    { client_id: clientIds[2], user_id: userId, check_type: 'ubo', status: 'passed', result: JSON.stringify({ ubos_identified: 3, fully_verified: true }), ai_assessment: '3 UBOs identified and verified. All beneficial owners above 25% threshold documented.', ai_confidence: 0.91, provider: 'Internal AI', completed_at: tsOffset(-88) },
    { client_id: clientIds[2], user_id: userId, check_type: 'sanctions', status: 'expired', result: JSON.stringify({ hits: 0, lists_checked: 42 }), ai_assessment: 'Previous sanctions check clear but expired. Re-screening required.', ai_confidence: 0.85, provider: 'ComplyAdvantage', completed_at: tsOffset(-365), expires_at: tsOffset(-1) },
    // TechBridge (onboarding)
    { client_id: clientIds[3], user_id: userId, check_type: 'identity', status: 'in_progress', result: JSON.stringify({}), ai_assessment: 'Document upload pending for fund formation documents.', ai_confidence: 0.30, provider: 'Onfido' },
    // Al-Rashid (onboarding)
    { client_id: clientIds[4], user_id: userId, check_type: 'identity', status: 'pending', result: JSON.stringify({}), provider: 'Onfido' },
    { client_id: clientIds[4], user_id: userId, check_type: 'sanctions', status: 'pending', result: JSON.stringify({}), provider: 'ComplyAdvantage' },
    // Phoenix (suspended)
    { client_id: clientIds[6], user_id: userId, check_type: 'adverse_media', status: 'failed', result: JSON.stringify({ articles_found: 8, risk_level: 'high', keywords: ['fraud investigation', 'regulatory action', 'sanctions evasion'] }), ai_assessment: 'Multiple high-severity adverse media hits. Articles reference fraud investigation and potential sanctions evasion. Recommend suspension and enhanced review.', ai_risk_flags: ['adverse-media-high', 'fraud-investigation', 'sanctions-evasion-risk'], ai_confidence: 0.93, provider: 'ComplyAdvantage', completed_at: tsOffset(-5) },
  ];

  const documents = [
    { client_id: clientIds[0], user_id: userId, document_type: 'incorporation_cert', file_name: 'meridian_cert_of_incorporation.pdf', file_size: 245000, mime_type: 'application/pdf', status: 'verified', verified_by: 'Maria Lopez', verified_at: tsOffset(-30) },
    { client_id: clientIds[0], user_id: userId, document_type: 'shareholder_register', file_name: 'meridian_shareholders_2024.pdf', file_size: 180000, mime_type: 'application/pdf', status: 'verified', verified_by: 'Maria Lopez', verified_at: tsOffset(-29) },
    { client_id: clientIds[1], user_id: userId, document_type: 'passport', file_name: 'thornton_passport.jpg', file_size: 2100000, mime_type: 'image/jpeg', status: 'verified', ai_extracted_data: JSON.stringify({ name: 'Richard Arthur Thornton', dob: '1958-03-15', nationality: 'British', expiry: '2029-06-20' }), verified_by: 'AI + Maria Lopez', verified_at: tsOffset(-20) },
    { client_id: clientIds[1], user_id: userId, document_type: 'bank_statement', file_name: 'thornton_bank_statements_q4.pdf', file_size: 890000, mime_type: 'application/pdf', status: 'pending', ai_extracted_data: JSON.stringify({ bank: 'HSBC UK', period: 'Q4 2024', total_credits: 485000, total_debits: 312000 }) },
    { client_id: clientIds[2], user_id: userId, document_type: 'trust_deed', file_name: 'nordic_trust_deed_2019.pdf', file_size: 1500000, mime_type: 'application/pdf', status: 'verified', verified_by: 'Maria Lopez', verified_at: tsOffset(-88) },
    { client_id: clientIds[3], user_id: userId, document_type: 'financial_statement', file_name: 'techbridge_fund_prospectus.pdf', file_size: 3200000, mime_type: 'application/pdf', status: 'pending' },
  ];

  const workflows = [
    { client_id: clientIds[3], user_id: userId, template: 'fund_onboarding', status: 'in_progress', current_step: 2, total_steps: 6, steps: JSON.stringify([{ step: 1, name: 'Initial Application', status: 'completed' }, { step: 2, name: 'Document Collection', status: 'in_progress' }, { step: 3, name: 'Identity Verification', status: 'pending' }, { step: 4, name: 'Risk Assessment', status: 'pending' }, { step: 5, name: 'Compliance Review', status: 'pending' }, { step: 6, name: 'Account Activation', status: 'pending' }]), completion_pct: 33.33, ai_recommendations: ['Remind client to upload fund formation documents', 'Pre-screen directors for sanctions'], started_at: tsOffset(-7), deadline: tsOffset(14) },
    { client_id: clientIds[4], user_id: userId, template: 'corporate_enhanced', status: 'not_started', current_step: 0, total_steps: 8, steps: JSON.stringify([{ step: 1, name: 'Initial Application', status: 'pending' }, { step: 2, name: 'Document Collection', status: 'pending' }, { step: 3, name: 'Identity Verification', status: 'pending' }, { step: 4, name: 'UBO Identification', status: 'pending' }, { step: 5, name: 'Sanctions & PEP', status: 'pending' }, { step: 6, name: 'Source of Wealth', status: 'pending' }, { step: 7, name: 'Enhanced Due Diligence', status: 'pending' }, { step: 8, name: 'Compliance Approval', status: 'pending' }]), completion_pct: 0, ai_recommendations: ['High-risk jurisdiction — recommend assigning senior compliance officer', 'Request audited financial statements for last 3 years'], deadline: tsOffset(21) },
    { client_id: clientIds[0], user_id: userId, template: 'standard', status: 'completed', current_step: 5, total_steps: 5, steps: JSON.stringify([{ step: 1, name: 'Application', status: 'completed' }, { step: 2, name: 'Documents', status: 'completed' }, { step: 3, name: 'Verification', status: 'completed' }, { step: 4, name: 'Risk Assessment', status: 'completed' }, { step: 5, name: 'Activation', status: 'completed' }]), completion_pct: 100, started_at: tsOffset(-45), completed_at: tsOffset(-30) },
  ];

  return { clients, checks, documents, workflows };
}

// ---------------------------------------------------------------------------
// 6. FRAUD DETECTION  (transactions, fraud_alerts, fraud_patterns, fraud_investigations)
// ---------------------------------------------------------------------------

function buildFraud(userId) {
  const txnIds = [];
  const alertIds = [uuid(), uuid(), uuid(), uuid(), uuid(), uuid()];
  const investigationIds = [uuid(), uuid()];

  // Generate 25 transactions with varied profiles
  const txnTemplates = [
    { transaction_ref: 'TXN-2024-00142', type: 'payment', amount: 15750.00, currency: 'GBP', source_account: 'GB82WEST12345698765432', destination_account: 'JE98CITI00010001234567', counterparty: 'Meridian Capital Partners', country_code: 'JE', channel: 'wire', status: 'completed', risk_score: 12, flagged: false },
    { transaction_ref: 'TXN-2024-00143', type: 'transfer', amount: 245000.00, currency: 'GBP', source_account: 'JE98CITI00010001234567', destination_account: 'CH9300762011623852957', counterparty: 'Swiss Private Bank SA', country_code: 'CH', channel: 'wire', status: 'completed', risk_score: 68, flagged: true },
    { transaction_ref: 'TXN-2024-00144', type: 'payment', amount: 3200.00, currency: 'GBP', source_account: 'GB82WEST12345698765432', destination_account: 'JE98CITI00010001234567', counterparty: 'TechBridge Ventures', country_code: 'JE', channel: 'online', status: 'completed', risk_score: 8, flagged: false },
    { transaction_ref: 'TXN-2024-00145', type: 'withdrawal', amount: 98500.00, currency: 'USD', source_account: 'JE98CITI00010007654321', destination_account: 'HK67HSBC62112345678901', counterparty: 'Phoenix Trading Corp', country_code: 'HK', channel: 'wire', status: 'flagged', risk_score: 92, flagged: true },
    { transaction_ref: 'TXN-2024-00146', type: 'deposit', amount: 500000.00, currency: 'GBP', source_account: 'GB29NWBK60161234567890', destination_account: 'JE98CITI00010001234567', counterparty: 'Sir Richard Thornton Trust', country_code: 'GB', channel: 'wire', status: 'completed', risk_score: 75, flagged: true },
    { transaction_ref: 'TXN-2024-00147', type: 'payment', amount: 8900.00, currency: 'EUR', source_account: 'JE98CITI00010001234567', destination_account: 'DE89370400440532013000', counterparty: 'Software License GmbH', country_code: 'DE', channel: 'online', status: 'completed', risk_score: 5, flagged: false },
    { transaction_ref: 'TXN-2024-00148', type: 'transfer', amount: 175000.00, currency: 'USD', source_account: 'JE98CITI00010007654321', destination_account: 'AE07033312345678901234', counterparty: 'Al-Rashid Holdings', country_code: 'AE', channel: 'wire', status: 'blocked', risk_score: 88, flagged: true },
    { transaction_ref: 'TXN-2024-00149', type: 'refund', amount: 2340.00, currency: 'GBP', source_account: 'GB82WEST12345698765432', destination_account: 'JE98CITI00010001234567', counterparty: 'Cloud Services Ltd', country_code: 'GB', channel: 'online', status: 'completed', risk_score: 3, flagged: false },
    { transaction_ref: 'TXN-2024-00150', type: 'payment', amount: 45000.00, currency: 'GBP', source_account: 'JE98CITI00010001234567', destination_account: 'GB15BARC20730112345678', counterparty: 'Deloitte LLP', country_code: 'GB', channel: 'wire', status: 'completed', risk_score: 10, flagged: false },
    { transaction_ref: 'TXN-2024-00151', type: 'deposit', amount: 12500.00, currency: 'GBP', source_account: 'IE29AIBK93115212345678', destination_account: 'JE98CITI00010001234567', counterparty: 'Green Energy Transition Fund', country_code: 'IE', channel: 'wire', status: 'completed', risk_score: 7, flagged: false },
    { transaction_ref: 'TXN-2024-00152', type: 'payment', amount: 9999.00, currency: 'GBP', source_account: 'JE98CITI00010007654321', destination_account: 'HK67HSBC62112345678901', counterparty: 'Phoenix Trading Corp', country_code: 'HK', channel: 'online', status: 'flagged', risk_score: 85, flagged: true },
    { transaction_ref: 'TXN-2024-00153', type: 'payment', amount: 9998.00, currency: 'GBP', source_account: 'JE98CITI00010007654321', destination_account: 'HK67HSBC62119876543210', counterparty: 'Phoenix Asia Ltd', country_code: 'HK', channel: 'online', status: 'flagged', risk_score: 87, flagged: true, metadata: JSON.stringify({ structuring_alert: true }) },
    { transaction_ref: 'TXN-2024-00154', type: 'transfer', amount: 1200000.00, currency: 'USD', source_account: 'KY27CIBC0000112345678', destination_account: 'JE98CITI00010007654321', counterparty: 'Cayman Offshore Fund Ltd', country_code: 'KY', channel: 'wire', status: 'completed', risk_score: 72, flagged: true },
    { transaction_ref: 'TXN-2024-00155', type: 'payment', amount: 750.00, currency: 'GBP', source_account: 'JE98CITI00010001234567', destination_account: 'GB82WEST99876543210987', counterparty: 'Office Supplies Co', country_code: 'GB', channel: 'online', status: 'completed', risk_score: 2, flagged: false },
    { transaction_ref: 'TXN-2024-00156', type: 'payment', amount: 32000.00, currency: 'EUR', source_account: 'JE98CITI00010001234567', destination_account: 'LU280019400644750000', counterparty: 'Luxembourg Admin Services', country_code: 'LU', channel: 'wire', status: 'completed', risk_score: 18, flagged: false },
    { transaction_ref: 'TXN-2024-00157', type: 'withdrawal', amount: 50000.00, currency: 'GBP', source_account: 'JE98CITI00010007654321', destination_account: null, counterparty: 'Cash Withdrawal', country_code: 'JE', channel: 'branch', status: 'completed', risk_score: 55, flagged: false },
    { transaction_ref: 'TXN-2024-00158', type: 'deposit', amount: 89000.00, currency: 'GBP', source_account: 'NO9386011117947', destination_account: 'JE98CITI00010001234567', counterparty: 'Nordic Heritage Trustees', country_code: 'NO', channel: 'wire', status: 'completed', risk_score: 22, flagged: false },
    { transaction_ref: 'TXN-2024-00159', type: 'adjustment', amount: -1500.00, currency: 'GBP', source_account: 'JE98CITI00010001234567', destination_account: 'JE98CITI00010001234567', counterparty: 'Fee Adjustment', country_code: 'JE', channel: 'api', status: 'completed', risk_score: 1, flagged: false },
    { transaction_ref: 'TXN-2024-00160', type: 'transfer', amount: 420000.00, currency: 'GBP', source_account: 'JE98CITI00010001234567', destination_account: 'GB82WEST12345698765999', counterparty: 'UK Real Estate SPV', country_code: 'GB', channel: 'wire', status: 'completed', risk_score: 40, flagged: false },
    { transaction_ref: 'TXN-2024-00161', type: 'payment', amount: 25000.00, currency: 'USD', source_account: 'JE98CITI00010001234567', destination_account: 'US33CITI00010008765432', counterparty: 'AWS Cloud Services', country_code: 'US', channel: 'api', status: 'completed', risk_score: 6, flagged: false },
  ];

  const transactions = txnTemplates.map((t, i) => {
    const id = uuid();
    txnIds.push(id);
    return {
      id,
      user_id: userId,
      ...t,
      timestamp: tsOffset(-20 + i),
      metadata: t.metadata || JSON.stringify({}),
    };
  });

  const alerts = [
    { id: alertIds[0], user_id: userId, transaction_id: txnIds[1], alert_type: 'amount', severity: 'high', status: 'investigating', title: 'Large cross-border transfer to Switzerland', description: '£245,000 wire transfer to Swiss private bank. Amount exceeds normal transaction pattern for this account by 340%. Destination is a known private banking jurisdiction.', ai_confidence: 0.88, ai_reasoning: 'Transaction amount is 3.4x the 90-day average for this account. Destination country has elevated financial secrecy risk. Combined with PEP counterparty connection, recommend investigation.', ai_recommended_action: 'Review source of funds documentation. Verify relationship with Swiss counterparty. File SAR if concerned.', indicators: JSON.stringify([{ type: 'amount_anomaly', score: 0.85 }, { type: 'cross_border_risk', score: 0.72 }, { type: 'private_banking', score: 0.65 }]), assigned_to: 'Maria Lopez' },
    { id: alertIds[1], user_id: userId, transaction_id: txnIds[3], alert_type: 'geographic', severity: 'critical', status: 'open', title: 'Flagged counterparty — Phoenix Trading Corp', description: 'Transaction to Hong Kong entity that has been suspended due to adverse media hits linking to fraud investigation and potential sanctions evasion.', ai_confidence: 0.95, ai_reasoning: 'Counterparty Phoenix Trading Corp has active adverse media alerts for fraud and sanctions evasion. Entity is currently suspended in KYC system. Transaction should be blocked and investigated immediately.', ai_recommended_action: 'Block transaction. Escalate to MLRO. Prepare SAR filing.', indicators: JSON.stringify([{ type: 'adverse_media', score: 0.95 }, { type: 'suspended_counterparty', score: 1.0 }, { type: 'high_risk_jurisdiction', score: 0.70 }]), assigned_to: 'Maria Lopez' },
    { id: alertIds[2], user_id: userId, transaction_id: txnIds[4], alert_type: 'behavioral', severity: 'high', status: 'investigating', title: 'PEP deposit — Unusual amount pattern', description: '£500,000 deposit from PEP-linked trust. Amount significantly exceeds declared income pattern. Source of wealth verification incomplete.', ai_confidence: 0.82, ai_reasoning: 'Depositor is a Tier-1 PEP with incomplete source of wealth verification. Amount inconsistent with declared income profile. Enhanced monitoring triggered.', ai_recommended_action: 'Request updated source of wealth documentation. Review trust account activity for last 12 months.', indicators: JSON.stringify([{ type: 'pep_transaction', score: 0.90 }, { type: 'amount_vs_income', score: 0.78 }, { type: 'incomplete_sow', score: 0.85 }]) },
    { id: alertIds[3], user_id: userId, transaction_id: txnIds[6], alert_type: 'sanctions', severity: 'critical', status: 'open', title: 'Blocked transfer to high-risk jurisdiction', description: '$175,000 attempted transfer to UAE entity Al-Rashid Holdings. Entity in onboarding and not yet cleared by compliance. Auto-blocked by rules engine.', ai_confidence: 0.91, ai_reasoning: 'Destination entity has not completed KYC onboarding. Transfer attempted before compliance approval. Auto-blocked per policy. High-risk jurisdiction flag for UAE.', ai_recommended_action: 'Maintain block. Notify compliance team. Expedite or reject Al-Rashid KYC application.', indicators: JSON.stringify([{ type: 'incomplete_kyc', score: 1.0 }, { type: 'high_risk_jurisdiction', score: 0.75 }, { type: 'large_amount', score: 0.68 }]) },
    { id: alertIds[4], user_id: userId, transaction_id: txnIds[10], alert_type: 'velocity', severity: 'high', status: 'open', title: 'Potential structuring — Multiple sub-threshold payments', description: 'Two payments of £9,999 and £9,998 to related Hong Kong entities within 24 hours. Pattern consistent with structuring to avoid reporting thresholds.', ai_confidence: 0.89, ai_reasoning: 'Two near-identical sub-£10,000 payments to related entities in Hong Kong within 24 hours. Classic structuring pattern to avoid automated reporting. Combined amount £19,997.', ai_recommended_action: 'Aggregate transactions for reporting. File SAR for potential structuring. Review full transaction history with Phoenix entities.', indicators: JSON.stringify([{ type: 'structuring', score: 0.92 }, { type: 'velocity', score: 0.88 }, { type: 'related_entities', score: 0.85 }]) },
    { id: alertIds[5], user_id: userId, transaction_id: txnIds[12], alert_type: 'pattern', severity: 'medium', status: 'false_positive', title: 'Large inbound from Cayman Islands', description: '$1,200,000 inbound wire from Cayman Islands fund entity. High value from secrecy jurisdiction.', ai_confidence: 0.65, ai_reasoning: 'Large incoming wire from Cayman Islands. While jurisdiction has elevated risk, the counterparty is a known regulated fund entity with established relationship.', ai_recommended_action: 'Review counterparty documentation. If known and verified, mark as false positive.', indicators: JSON.stringify([{ type: 'secrecy_jurisdiction', score: 0.70 }, { type: 'large_amount', score: 0.60 }]), assigned_to: 'Maria Lopez', resolved_at: tsOffset(-2) },
  ];

  const patterns = [
    { user_id: userId, name: 'Sub-threshold structuring', pattern_type: 'velocity', description: 'Detects multiple transactions just below reporting thresholds within a short time window.', detection_rules: JSON.stringify({ threshold: 10000, window_hours: 48, min_transactions: 2, currency: 'GBP', tolerance_pct: 2 }), ai_generated: true, severity: 'high', is_active: true, matches_count: 3, false_positive_rate: 15.00, last_triggered: tsOffset(-1) },
    { user_id: userId, name: 'Cross-border velocity spike', pattern_type: 'geographic', description: 'Flags accounts with sudden increase in cross-border transaction frequency or volume.', detection_rules: JSON.stringify({ baseline_period_days: 90, spike_multiplier: 3, min_amount: 50000 }), ai_generated: true, severity: 'high', is_active: true, matches_count: 7, false_positive_rate: 22.50, last_triggered: tsOffset(-3) },
    { user_id: userId, name: 'PEP transaction monitoring', pattern_type: 'behavioral', description: 'Enhanced monitoring for all transactions involving PEP-linked accounts.', detection_rules: JSON.stringify({ pep_tiers: ['tier-1', 'tier-2'], min_amount: 10000, alert_all_cross_border: true }), ai_generated: false, severity: 'medium', is_active: true, matches_count: 12, false_positive_rate: 30.00, last_triggered: tsOffset(-1) },
    { user_id: userId, name: 'Dormant account activation', pattern_type: 'temporal', description: 'Detects sudden activity on accounts dormant for over 90 days.', detection_rules: JSON.stringify({ dormancy_days: 90, min_activation_amount: 5000 }), ai_generated: true, severity: 'medium', is_active: true, matches_count: 2, false_positive_rate: 40.00, last_triggered: tsOffset(-15) },
    { user_id: userId, name: 'Network analysis — related entities', pattern_type: 'network', description: 'Identifies clusters of transactions between entities with shared directors, addresses, or beneficial owners.', detection_rules: JSON.stringify({ min_shared_attributes: 2, min_transactions: 3, time_window_days: 30 }), ai_generated: true, severity: 'high', is_active: true, matches_count: 4, false_positive_rate: 18.00, last_triggered: tsOffset(-5) },
    { user_id: userId, name: 'Large cash transactions', pattern_type: 'amount', description: 'Flags all cash transactions above local reporting threshold.', detection_rules: JSON.stringify({ threshold_gbp: 10000, threshold_eur: 15000, threshold_usd: 10000, channels: ['branch', 'atm'] }), ai_generated: false, severity: 'medium', is_active: true, matches_count: 1, false_positive_rate: 5.00, last_triggered: tsOffset(-8) },
  ];

  const investigations = [
    { id: investigationIds[0], user_id: userId, alert_id: alertIds[1], case_number: 'INV-2024-0031', status: 'in_progress', priority: 'urgent', title: 'Phoenix Trading Corp — Fraud & Sanctions Investigation', summary: 'Comprehensive investigation into Phoenix Trading Corp following adverse media hits linking the entity to fraud and potential sanctions evasion. Multiple flagged transactions identified.', findings: JSON.stringify([{ date: dateOffset(-4), finding: 'Adverse media confirmed — Hong Kong regulatory action against related entity', severity: 'critical' }, { date: dateOffset(-3), finding: 'Two sub-threshold payments identified — potential structuring', severity: 'high' }, { date: dateOffset(-2), finding: 'Counterparty "Phoenix Asia Ltd" shares director with Phoenix Trading Corp', severity: 'high' }]), total_exposure: 118497.00, ai_analysis: 'High-risk investigation with multiple corroborating indicators. Phoenix Trading Corp and related entities show patterns consistent with layering and potential sanctions evasion. The structuring pattern (two £9,999 payments) combined with adverse media and shared directorship suggests coordinated activity. Recommend SAR filing and account closure.', ai_risk_assessment: JSON.stringify({ overall_risk: 'critical', confidence: 0.92, recommended_actions: ['File SAR immediately', 'Freeze all related accounts', 'Notify JFSC', 'Close client relationship'] }), assigned_to: 'Maria Lopez' },
    { id: investigationIds[1], user_id: userId, alert_id: alertIds[2], case_number: 'INV-2024-0032', status: 'open', priority: 'high', title: 'Sir Richard Thornton — PEP Enhanced Review', summary: 'Enhanced investigation triggered by PEP deposit of £500,000 from family trust. Source of wealth verification incomplete. Unusual deposit pattern detected.', findings: JSON.stringify([{ date: dateOffset(-1), finding: 'Deposit pattern inconsistent with declared income from consulting fees', severity: 'medium' }]), total_exposure: 500000.00, ai_analysis: 'PEP with Tier-1 classification. The £500,000 deposit from an affiliated trust requires enhanced scrutiny. Source of wealth verification remains incomplete with an unexplained deposit pattern during the client\'s political tenure flagged by AI. Recommend requesting full trust accounts and independent source of wealth verification.', ai_risk_assessment: JSON.stringify({ overall_risk: 'high', confidence: 0.78, recommended_actions: ['Request full trust account history', 'Obtain independent source of wealth verification', 'Review all transactions over £50k in last 12 months'] }), assigned_to: 'Maria Lopez' },
  ];

  return { transactions, alerts, patterns, investigations };
}

// ---------------------------------------------------------------------------
// MAIN SEED FUNCTION
// ---------------------------------------------------------------------------

export async function seedDemoData(userId) {
  const errors = [];
  const results = {};

  console.log(`🌱 Seeding demo data for user: ${userId}`);

  // ── 0. Ensure user exists in auth.users (required for FK constraints) ─────
  try {
    const { data: existingUser } = await supabase.auth.admin.getUserById(userId);
    if (!existingUser?.user) {
      console.log(`📝 Creating auth user ${userId} for demo data...`);
      const { error: createError } = await supabase.auth.admin.createUser({
        id: userId,
        email: `demo-${userId.slice(0, 8)}@velanova.io`,
        email_confirm: true,
        user_metadata: { name: 'Demo User', demo: true },
      });
      if (createError) {
        console.warn(`⚠️  Could not create auth user: ${createError.message}`);
        // Try to continue anyway — user might already exist
      } else {
        console.log('✅ Auth user created');
      }
    } else {
      console.log('✅ Auth user already exists');
    }
  } catch (e) {
    console.warn(`⚠️  Auth user check/create failed: ${e.message}`);
    // Don't block — try seeding anyway
  }

  // ── 1. Clear existing demo data for this user (in child-first order) ──────
  const tablesToClear = [
    'project_insights', 'project_risks', 'project_tasks',
    'resource_allocations',
    'compliance_assessments', 'regulatory_changes', 'regulatory_sources',
    'contract_clauses', 'procurement_reviews',
    'kyc_checks', 'kyc_documents', 'onboarding_workflows',
    'fraud_investigations', 'fraud_alerts', 'fraud_patterns', 'transactions',
    'projects',         // after tasks/risks/insights/allocations
    'resources',        // after allocations
    'contracts',        // after clauses/reviews
    'clients',          // after checks/docs/workflows
  ];

  for (const table of tablesToClear) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId);
    if (error) {
      console.warn(`⚠️  Could not clear ${table}: ${error.message}`);
      // Don't block — table might not exist yet
    }
  }

  // ── 2. Build data ─────────────────────────────────────────────────────────
  const { projects, tasks, risks, insights, projectIds } = buildProjects(userId);
  const { resources, allocations } = buildResources(userId, projectIds);
  const { sources, changes, assessments } = buildRegulatory(userId);
  const { contracts, clauses, reviews } = buildProcurement(userId);
  const { clients, checks, documents, workflows } = buildKYC(userId);
  const { transactions, alerts, patterns, investigations } = buildFraud(userId);

  // ── 3. Insert in dependency order ─────────────────────────────────────────
  const inserts = [
    // Projects module
    ['projects', projects],
    ['project_tasks', tasks],
    ['project_risks', risks],
    ['project_insights', insights],

    // Resources module
    ['resources', resources],
    ['resource_allocations', allocations],

    // Regulatory module
    ['regulatory_sources', sources],
    ['regulatory_changes', changes],
    ['compliance_assessments', assessments],

    // Procurement module
    ['contracts', contracts],
    ['contract_clauses', clauses],
    ['procurement_reviews', reviews],

    // KYC module
    ['clients', clients],
    ['kyc_checks', checks],
    ['kyc_documents', documents],
    ['onboarding_workflows', workflows],

    // Fraud Detection module
    ['transactions', transactions],
    ['fraud_alerts', alerts],
    ['fraud_patterns', patterns],
    ['fraud_investigations', investigations],
  ];

  for (const [table, rows] of inserts) {
    const { data, error } = await supabase.from(table).insert(rows).select('id');
    if (error) {
      console.error(`❌ ${table}: ${error.message}`);
      errors.push({ table, error: error.message });
    } else {
      console.log(`✅ ${table}: ${data.length} rows inserted`);
      results[table] = data.length;
    }
  }

  return { success: errors.length === 0, results, errors };
}
