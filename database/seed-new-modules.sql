-- =============================================================================
-- Seed Data for AML, ESG, and Reporting modules
-- Uses the same test user: 00000000-0000-0000-0000-000000000001
-- =============================================================================
-- Valid enum values (from CHECK constraints):
-- aml_transactions.transaction_type: transfer|deposit|withdrawal|wire|cash|trade|currency_exchange|loan_payment|card_payment
-- aml_transactions.channel: online|branch|atm|wire|swift|mobile|api
-- aml_transactions.screening_status: pending|cleared|flagged|escalated|blocked
-- aml_rules.rule_type: threshold|velocity|pattern|geographic|behavioral|structuring|sanctions|pep
-- aml_alerts.alert_type: threshold_breach|velocity_anomaly|structuring|sanctions_match|pep_transaction|geographic_risk|behavioral_anomaly|cash_intensive|layering|round_tripping
-- sar_reports.report_type: SAR|STR|CTR|MLRO_escalation
-- sar_reports.priority: standard|urgent|critical
-- esg_frameworks.framework_type: reporting|regulation|standard|taxonomy|benchmark
-- esg_metrics.category: environmental|social|governance
-- esg_metrics.data_quality: measured|calculated|estimated|third_party_verified
-- esg_metrics.status: draft|reviewed|approved|published

-- ─── AML Seed Data ───

INSERT INTO public.aml_monitored_accounts (user_id, account_ref, account_holder, account_type, jurisdiction, risk_tier, pep_flag, sanctions_flag, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'ACC-2024-001', 'Meridian Holdings Ltd', 'corporate', 'JE', 'enhanced', false, false, 'active'),
  ('00000000-0000-0000-0000-000000000001', 'ACC-2024-002', 'John R. Whitfield', 'individual', 'UK', 'standard', false, false, 'active'),
  ('00000000-0000-0000-0000-000000000001', 'ACC-2024-003', 'Apex Capital Trust', 'trust', 'GG', 'high', true, false, 'under_review'),
  ('00000000-0000-0000-0000-000000000001', 'ACC-2024-004', 'Chen Wei Trading Co', 'corporate', 'HK', 'enhanced', false, false, 'active'),
  ('00000000-0000-0000-0000-000000000001', 'ACC-2024-005', 'Sarah M. Bennett', 'individual', 'JE', 'low', false, false, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO public.aml_transactions (user_id, account_id, transaction_ref, transaction_type, amount, currency, counterparty_name, counterparty_jurisdiction, originator_country, beneficiary_country, channel, risk_score, flagged, screening_status, timestamp) VALUES
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM public.aml_monitored_accounts WHERE account_ref='ACC-2024-001' LIMIT 1), 'TXN-A001', 'wire', 250000.00, 'GBP', 'Offshore Holdings BVI', 'VG', 'JE', 'VG', 'swift', 82, true, 'flagged', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM public.aml_monitored_accounts WHERE account_ref='ACC-2024-002' LIMIT 1), 'TXN-A002', 'deposit', 15000.00, 'GBP', 'HMRC Tax Refund', 'GB', 'GB', 'GB', 'online', 12, false, 'cleared', NOW() - INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM public.aml_monitored_accounts WHERE account_ref='ACC-2024-003' LIMIT 1), 'TXN-A003', 'wire', 500000.00, 'USD', 'Private Bank Zurich', 'CH', 'GG', 'CH', 'swift', 91, true, 'flagged', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM public.aml_monitored_accounts WHERE account_ref='ACC-2024-004' LIMIT 1), 'TXN-A004', 'transfer', 78000.00, 'HKD', 'Trade payment - invoice 4521', 'HK', 'HK', 'HK', 'wire', 45, false, 'cleared', NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM public.aml_monitored_accounts WHERE account_ref='ACC-2024-001' LIMIT 1), 'TXN-A005', 'wire', 125000.00, 'EUR', 'Luxembourg Fund Admin', 'LU', 'JE', 'LU', 'swift', 38, false, 'cleared', NOW() - INTERVAL '7 days')
ON CONFLICT DO NOTHING;

INSERT INTO public.aml_rules (user_id, rule_name, rule_type, description, conditions, severity, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Large Wire Transfer', 'threshold', 'Flag wire transfers above £100,000', '{"field": "amount", "operator": ">", "value": 100000}'::jsonb, 'high', true),
  ('00000000-0000-0000-0000-000000000001', 'High-Risk Jurisdiction', 'geographic', 'Flag transactions to/from high-risk countries', '{"countries": ["VG", "PA", "KY", "BS"]}'::jsonb, 'critical', true),
  ('00000000-0000-0000-0000-000000000001', 'PEP Transaction Monitor', 'pep', 'Monitor all PEP account activity', '{"attribute": "pep_flag", "value": true}'::jsonb, 'high', true),
  ('00000000-0000-0000-0000-000000000001', 'Structuring Detection', 'structuring', 'Detect potential structuring (multiple transactions just below threshold)', '{"pattern": "structuring", "window_hours": 24, "threshold": 9500}'::jsonb, 'critical', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.aml_alerts (user_id, account_id, transaction_id, rule_id, alert_type, severity, title, description, status) VALUES
  ('00000000-0000-0000-0000-000000000001',
   (SELECT id FROM public.aml_monitored_accounts WHERE account_ref='ACC-2024-001' LIMIT 1),
   (SELECT id FROM public.aml_transactions WHERE transaction_ref='TXN-A001' LIMIT 1),
   (SELECT id FROM public.aml_rules WHERE rule_name='Large Wire Transfer' LIMIT 1),
   'threshold_breach', 'high', 'Large outbound wire to BVI',
   '£250,000 wire transfer to Offshore Holdings BVI — exceeds £100K threshold and involves high-risk jurisdiction.',
   'open'),
  ('00000000-0000-0000-0000-000000000001',
   (SELECT id FROM public.aml_monitored_accounts WHERE account_ref='ACC-2024-003' LIMIT 1),
   (SELECT id FROM public.aml_transactions WHERE transaction_ref='TXN-A003' LIMIT 1),
   (SELECT id FROM public.aml_rules WHERE rule_name='PEP Transaction Monitor' LIMIT 1),
   'pep_transaction', 'critical', 'PEP trust distribution to Swiss bank',
   '$500,000 distribution from PEP-flagged trust to Private Bank Zurich — requires enhanced due diligence review.',
   'open')
ON CONFLICT DO NOTHING;

INSERT INTO public.sar_reports (user_id, report_ref, report_type, status, priority, subject_name, subject_type, total_suspicious_amount, currency, narrative, reporting_period_start, reporting_period_end) VALUES
  ('00000000-0000-0000-0000-000000000001',
   'SAR-2026-001', 'SAR', 'draft', 'urgent', 'Meridian Holdings Ltd', 'corporate',
   250000.00, 'GBP',
   'Suspicious outbound wire transfer of £250,000 to a British Virgin Islands entity. The transaction pattern suggests potential layering activity.',
   NOW() - INTERVAL '30 days', NOW())
ON CONFLICT DO NOTHING;

-- ─── ESG Seed Data ───

INSERT INTO public.esg_frameworks (user_id, name, code, version, description, framework_type, jurisdiction, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'TCFD Reporting', 'TCFD', '2024', 'Task Force on Climate-related Financial Disclosures', 'reporting', 'Global', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'GRI Standards', 'GRI', '2024', 'Global Reporting Initiative sustainability standards', 'standard', 'Global', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'SFDR', 'SFDR', '2023', 'Sustainable Finance Disclosure Regulation', 'regulation', 'EU', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'UN PRI', 'UNPRI', '2024', 'UN Principles for Responsible Investment', 'benchmark', 'Global', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO public.esg_metrics (user_id, framework_id, metric_name, category, unit, value, target_value, previous_value, reporting_year, data_source, data_quality, status) VALUES
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM public.esg_frameworks WHERE name='TCFD Reporting' LIMIT 1), 'Carbon Emissions (Scope 1+2)', 'environmental', 'tCO2e', 1250, 1000, 1420, 2025, 'Carbon Footprint API', 'measured', 'approved'),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM public.esg_frameworks WHERE name='TCFD Reporting' LIMIT 1), 'Climate Risk Exposure', 'environmental', '%', 18.5, 15.0, 21.3, 2025, 'Internal Analysis', 'estimated', 'reviewed'),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM public.esg_frameworks WHERE name='GRI Standards' LIMIT 1), 'Employee Diversity Index', 'social', '%', 34.2, 40.0, 31.0, 2025, 'HR System', 'measured', 'approved'),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM public.esg_frameworks WHERE name='GRI Standards' LIMIT 1), 'Water Usage Intensity', 'environmental', 'm3/M', 42.8, 35.0, 48.2, 2025, 'Facilities Management', 'calculated', 'reviewed'),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM public.esg_frameworks WHERE name='SFDR' LIMIT 1), 'PAI Indicator Compliance', 'governance', 'score', 87, 95, 82, 2025, 'Compliance System', 'measured', 'approved'),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM public.esg_frameworks WHERE name='UN PRI' LIMIT 1), 'Responsible Investment Score', 'governance', 'score', 78, 85, 72, 2025, 'PRI Assessment', 'third_party_verified', 'published')
ON CONFLICT DO NOTHING;

INSERT INTO public.esg_data_sources (user_id, source_name, source_type, category, connection_config, status, last_sync_at, sync_frequency, metrics_count) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Carbon Footprint API', 'api', 'environmental', '{"url": "https://api.carbonfootprint.com"}'::jsonb, 'active', NOW() - INTERVAL '1 hour', 'daily', 4),
  ('00000000-0000-0000-0000-000000000001', 'ESG Ratings Provider', 'api', 'governance', '{"url": "https://api.esgratings.com"}'::jsonb, 'active', NOW() - INTERVAL '6 hours', 'weekly', 12),
  ('00000000-0000-0000-0000-000000000001', 'Internal HR System', 'database', 'social', '{"system": "hr_platform"}'::jsonb, 'active', NOW() - INTERVAL '1 day', 'monthly', 6)
ON CONFLICT DO NOTHING;

INSERT INTO public.esg_reports (user_id, framework_id, title, report_type, reporting_year, status, overall_score, environmental_score, social_score, governance_score, ai_executive_summary) VALUES
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM public.esg_frameworks WHERE name='TCFD Reporting' LIMIT 1), 'TCFD Annual Report 2025', 'annual', 2025, 'published', 78, 82, 74, 80, 'Strong progress on climate targets with Scope 1+2 emissions reduced by 12% YoY.'),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM public.esg_frameworks WHERE name='GRI Standards' LIMIT 1), 'GRI Sustainability Report Q1 2026', 'quarterly', 2026, 'draft', 72, 68, 78, 71, 'Preliminary Q1 data shows progress across environmental and social indicators.')
ON CONFLICT DO NOTHING;

INSERT INTO public.esg_targets (user_id, target_name, category, metric_name, target_value, target_year, baseline_value, baseline_year, current_value, progress_pct, status, description, science_based) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Net Zero by 2040', 'environmental', 'Carbon Emissions (Scope 1+2)', 0, 2040, 1850, 2020, 1250, 32.4, 'on_track', 'Reduce net carbon emissions to zero by 2040', true),
  ('00000000-0000-0000-0000-000000000001', '40% Diversity Target', 'social', 'Employee Diversity Index', 40, 2027, 28, 2023, 34.2, 51.7, 'on_track', 'Achieve 40% representation from underrepresented groups', false)
ON CONFLICT DO NOTHING;

-- ─── Reporting Seed Data ───

INSERT INTO public.report_templates (user_id, name, description, type, format, frequency, sections, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Quarterly Client Performance Report', 'Full AUM performance, allocation breakdown, transaction summary, and outlook.', 'client_report', 'PDF', 'quarterly', 8, 'active'),
  ('00000000-0000-0000-0000-000000000001', 'Board Pack — Governance & Risk', 'Comprehensive board pack covering risk dashboard, compliance status, and KPIs.', 'board_pack', 'PPTX', 'quarterly', 12, 'active'),
  ('00000000-0000-0000-0000-000000000001', 'Monthly Fund NAV Report', 'Net Asset Value calculations, performance attribution, and fee reconciliation.', 'fund_report', 'PDF', 'monthly', 5, 'active'),
  ('00000000-0000-0000-0000-000000000001', 'Annual Investor Letter', 'Year-in-review investor communication with market commentary.', 'investor_letter', 'PDF', 'annually', 6, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO public.client_reports (user_id, template_id, title, report_type, client_name, reporting_period, status, pages, data_sources, ai_summary) VALUES
  ('00000000-0000-0000-0000-000000000001',
   (SELECT id FROM public.report_templates WHERE name='Quarterly Client Performance Report' LIMIT 1),
   'Q1 2026 Client Performance — Apex Growth Fund', 'client_report',
   'Apex Capital Partners', 'Q1 2026', 'published', 24,
   ARRAY['Portfolio Management System', 'Market Data Feed', 'Risk Engine'],
   'Apex Growth Fund returned +4.8% in Q1 2026, outperforming the benchmark by 160bps. AUM grew to £342M.'),
  ('00000000-0000-0000-0000-000000000001',
   (SELECT id FROM public.report_templates WHERE name='Board Pack — Governance & Risk' LIMIT 1),
   'Board Pack — March 2026', 'board_pack',
   'Internal — Board of Directors', 'Q1 2026', 'in_review', 48,
   ARRAY['Risk Engine', 'Compliance System', 'HR Platform', 'Finance System'],
   'Firm-wide AUM reached £2.4B (+8% YoY). Regulatory compliance score at 96%. Capital adequacy ratio at 142%.'),
  ('00000000-0000-0000-0000-000000000001',
   (SELECT id FROM public.report_templates WHERE name='Monthly Fund NAV Report' LIMIT 1),
   'Fund NAV Report — March 2026', 'fund_report',
   'All Funds', 'March 2026', 'draft', 12,
   ARRAY['Fund Accounting System', 'Market Data Feed'],
   NULL)
ON CONFLICT DO NOTHING;
