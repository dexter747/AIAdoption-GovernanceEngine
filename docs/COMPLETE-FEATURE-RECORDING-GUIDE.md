# Velanova AI Governance Engine — Complete Feature Recording Guide

> **Purpose:** Step-by-step guide to demonstrate every feature for video recording & documentation.  
> **Estimated total recording time:** 45–60 minutes (or split into module-specific clips).  
> **Date:** June 2025

---

## Pre-Recording Checklist

1. Start the desktop app: `cd apps/desktop-app && pnpm dev`
2. Start the API server: `cd apps/express-api && pnpm dev`
3. Start the landing site: `cd apps/landing-site && pnpm dev`
4. Start the admin dashboard: `cd apps/admin-dashboard && pnpm dev`
5. Log in with Google OAuth (your test account)
6. Ensure demo data is seeded: **Settings → General → Seed Demo Data**
7. Set screen resolution to 1920×1080 for consistent recordings
8. Close any browser devtools/overlays

---

## PART A — LANDING SITE (Next.js Marketing Site)

### A1. Homepage Tour (2 min)

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open `http://localhost:3000` | Hero section with animated background |
| 2 | Scroll down slowly | LLM parallax section showing 67+ supported models |
| 3 | Continue scrolling | Integrations section (64 MCP connectors) |
| 4 | Continue | Features grid — hover each card for animation |
| 5 | Continue | "How It Works" — 3-step flow |
| 6 | Continue | ROI Calculator — drag sliders to show real-time savings projections |
| 7 | Continue | Trust section (compliance badges, certifications) |
| 8 | Continue | Testimonials carousel |
| 9 | Continue | Pricing section — 4 tiers (Trial/Pro/Enterprise/Government) |
| 10 | Continue | FAQ accordion — click to expand |
| 11 | Continue | CTA section at bottom |

### A2. Authentication Flow (1 min)

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Click "Login" in nav | Login page with 3D animated card |
| 2 | Click "Sign up" | Registration form |
| 3 | Show "Forgot Password" link | Password reset flow |
| 4 | Navigate to `/download` | Desktop app download page |

### A3. Supporting Pages (1 min)

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Navigate to `/pricing` | Full pricing comparison |
| 2 | Navigate to `/integrations` | Integration showcase |
| 3 | Navigate to `/terms`, `/privacy`, `/cookies`, `/refund` | Legal pages |

---

## PART B — ADMIN DASHBOARD (Internal Management)

### B1. Dashboard Overview (1 min)

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open admin dashboard URL | Stats cards: total users, downloads, revenue, active users with growth % |
| 2 | Point out | Recent users table, recent payments table |
| 3 | Scroll | Overview charts |

### B2. User Management (2 min)

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Click "Users" in sidebar | User list with search + filter (by plan/status) |
| 2 | Type in search box | Real-time filtering |
| 3 | Use plan/status dropdowns | Filter by Professional/Enterprise etc. |
| 4 | Click a user row | User detail view |
| 5 | Show suspend/delete actions | Admin control buttons |
| 6 | Navigate pagination | Page through user list |

### B3. License Management (2 min)

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Click "Licenses" | License dashboard with stats (total/active/expired/by-tier) |
| 2 | Click "Create License" | License creation form — select tier |
| 3 | Show the created license | Copy license key button |
| 4 | Use search/filter | Search by key, filter by tier/status |
| 5 | Click actions menu on a license | Revoke option |

### B4. Analytics (1 min)

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Click "Analytics" | LineChart (users over time), BarChart (revenue), PieChart (platforms, plans) |
| 2 | Hover over charts | Tooltip data on each chart |

### B5. Downloads & Payments (1 min)

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Click "Downloads" | Download list, platform breakdown stats (Win/Mac/Linux) |
| 2 | Click "Payments" | Payment records, revenue summary (total/pending/refunded) |

### B6. Admin Settings (1 min)

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Click "Settings" | Tabs: General, Notifications, Security, Billing |
| 2 | Show General tab | Site name, description, social links |
| 3 | Show Security tab | Session timeout, 2FA settings |
| 4 | Show Billing tab | Stripe keys, plan pricing configuration |

---

## PART C — DESKTOP APP (Electron — Core Product)

### C1. Login & First Impression (1 min)

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Launch desktop app | Login screen with 3D animated card |
| 2 | Click "Sign in with Google" | OAuth flow, redirect back |
| 3 | Show the dashboard landing | Sidebar with all module categories, MCP status card "64 MCP Connectors" |
| 4 | Show user avatar in sidebar footer | Profile + logout |

### C2. AI Chat (ModernChatPage) — 5 min

> **Route:** `/` (default page)

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Show the chat interface | Message input, model selector, session list |
| 2 | **Create new session** | Click "+" → new session appears |
| 3 | **Rename session** | Right-click or use menu → rename |
| 4 | **Send a message** | Type a question, send it, show AI streaming response |
| 5 | **Switch AI models** | Open model dropdown — show 67+ LLMs (OpenAI, Anthropic, Google, Meta, Mistral…) |
| 6 | Send message with different model | Show response from different provider |
| 7 | **Show token & cost tracking** | Point out token count and cost in the response |
| 8 | **Pin a session** | Pin it — show it moves to top |
| 9 | **Archive a session** | Archive it — show it disappears from main list |
| 10 | **Delete a session** | Delete — confirm dialog |
| 11 | Show conversation history | Scroll through past messages |

### C3. Library & Connections (2 min)

> **Route:** `/library`, `/my-connections`, `/connections`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Click "Library" | Connection library with 64+ connector types |
| 2 | Browse categories | Databases, APIs, SaaS tools, file stores |
| 3 | Click "Add" on a connector | Configuration dialog |
| 4 | Go to "My Connections" | List of active connections |
| 5 | Show test/reconnect button | Test connection health |
| 6 | Show delete action | Remove a connection |
| 7 | Go to "Contexts" | AI context management |

### C4. Business Intelligence (3 min)

> **Route:** `/business-intel`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open BI page | Three tabs: Query, Saved, History |
| 2 | **Type natural language query** | e.g. "Show me revenue by quarter for 2025" |
| 3 | Show **NL-to-SQL generation** | AI converts English to SQL |
| 4 | Show **query results** | Table view of results |
| 5 | **Switch chart type** | Toggle between Bar, Line, Pie, Area charts + Table |
| 6 | Show **AI explanation** | AI explains what the query found |
| 7 | Show **AI result summarization** | Natural language summary of data |
| 8 | **Save a query** | Click save → give it a name |
| 9 | **Favorite a query** | Star/heart icon |
| 10 | Switch to "Saved" tab | View saved queries |
| 11 | Switch to "History" tab | View query history with stats |
| 12 | **Delete a saved query** | Remove from saved list |

### C5. Project Intelligence (2 min)

> **Route:** `/project-intel`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Project list with status indicators |
| 2 | **Add a new project** | Click "+" → fill in project details |
| 3 | Show project details | Expand a project → tasks, risks, timeline |
| 4 | Show **AI risk/health analysis** | AI analyses project health |
| 5 | Show **AI insights** | AI-generated strategic insights |
| 6 | Show **Bar chart** (by status) | Visual project status distribution |
| 7 | Show **Pie chart** (tasks) | Task breakdown |
| 8 | **Export PDF** | Click Export → PDF downloads |
| 9 | **Delete a project** | Remove from list |

### C6. Resource Planning (2 min)

> **Route:** `/resource-planning`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Three tabs: Overview, Team, Allocations |
| 2 | Show **Overview tab** | Department utilization bar chart, skills pie chart |
| 3 | Switch to **Team tab** | Team member list with skills, utilization % |
| 4 | **Add a resource** | Click "+" → fill in name, role, skills |
| 5 | Switch to **Allocations tab** | Current allocation assignments |
| 6 | **Add an allocation** | Assign a person to a project |
| 7 | Show **AI utilization insights** | AI recommendations for optimization |
| 8 | **Export PDF** | Download resource report |
| 9 | **Delete a resource** | Remove team member |

### C7. Regulatory Intelligence (2 min)

> **Route:** `/regulatory-intel`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Regulatory change feed with status indicators |
| 2 | Show existing regulatory items | Title, jurisdiction, effective date, impact level |
| 3 | **Add a regulatory change** | Click "+" → fill in regulation details |
| 4 | Show **AI impact summary** | AI analyses business impact |
| 5 | Show **AI action items** | Auto-generated compliance tasks |
| 6 | Show **AI risk scoring** | Risk level assessment with reasoning |
| 7 | **Update status** | Change from "draft" to "under_review" to "implemented" |
| 8 | Show **Bar chart** (by type) | Distribution of regulatory types |
| 9 | **Export PDF** | Download regulatory report |
| 10 | **Delete a change** | Remove from tracker |

### C8. Procurement & Contract Risk (2 min)

> **Route:** `/procurement`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Contract list with risk indicators |
| 2 | Show contract details | Vendor, value, expiry, clauses |
| 3 | **Add a contract** | Click "+" → fill in contract details |
| 4 | Show **AI risk analysis** | AI flags unusual clauses |
| 5 | Show **AI vendor assessment** | Vendor risk scoring |
| 6 | Show **AI cost analysis** | Cost optimization suggestions |
| 7 | Show **AI recommendations** | Actionable recommendations |
| 8 | Show **Bar chart** (by type) | Contract type distribution |
| 9 | **Export PDF** | Download procurement report |
| 10 | **Delete a contract** | Remove from list |

### C9. KYC Dashboard (3 min)

> **Route:** `/kyc`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Two tabs: Dashboard, Detail |
| 2 | Show **Dashboard tab** | KPI cards, Bar chart (by status), Pie chart (risk rating) |
| 3 | **Add a new client** | Click "+" → fill in client details |
| 4 | Switch to **Detail tab** | Client list with risk indicators |
| 5 | Expand a client | Document list, verification checks |
| 6 | Show **AI risk assessment** | AI evaluates client risk with confidence score |
| 7 | Show **AI document verification** | AI analyses uploaded documents |
| 8 | **Show AI Explainability Panel** | Click to expand — shows confidence %, reasoning, factors, weights, data sources, model info |
| 9 | Manage docs/checks | Add/remove verification items |
| 10 | **Export PDF** | Download KYC report |
| 11 | **Delete a client** | Remove client record |

### C10. Fraud Detection (4 min)

> **Route:** `/fraud-detection`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Four tabs: Overview, Transactions, Alerts, Investigations |
| 2 | Show **Overview tab** | 4 KPI cards (Transactions, Flagged, Open Alerts, Investigations) — all computed from live data |
| 3 | Show **Pie chart** (alerts by severity) | Critical/High/Medium/Low distribution |
| 4 | Show **Bar chart** (alerts by type) | Structuring, sanctions, velocity anomaly etc. |
| 5 | Click **"Detect Patterns"** | AI pattern detection runs — shows 3 detected patterns with severity |
| 6 | Switch to **Transactions tab** | Full transaction list with risk scores |
| 7 | **Add a transaction** | Click "Add Txn" → fill in type, amount, counterparty, country |
| 8 | Note: amount must be > 0 | Validation prevents £0 transactions |
| 9 | **Delete a transaction** | Remove — dashboard stats update immediately |
| 10 | Switch to **Alerts tab** | Alert list with AI confidence scores |
| 11 | Click an alert | Full detail view |
| 12 | **Show AI Explainability Panel** | Confidence %, reasoning, recommended action, contributing factors with weights, data sources, model info |
| 13 | **Resolve an alert** | Click Resolve — status changes, dashboard updates |
| 14 | **Delete an alert** | Remove from list |
| 15 | Switch to **Investigations tab** | Active investigations with exposure amounts |
| 16 | **Close an investigation** | Close case — exposure recalculates |
| 17 | **Delete an investigation** | Remove from list |
| 18 | **Export PDF** | Download complete fraud report |

### C11. AML & SAR Automation (5 min)

> **Route:** `/aml`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Six tabs: Overview, Transactions, Alerts, SARs, Rules, Accounts |
| 2 | Show **Overview tab** | 5 KPI cards (all computed from live state), charts |
| 3 | Show **Monthly AML Activity Trend** | Area chart (flagged + alerts over time) |
| 4 | Show **Risk Score Distribution** | Bar chart with color-coded risk ranges |
| 5 | Show **Alerts by Type** and **Severity** charts | Bar + Pie charts |
| 6 | Show **Recent Critical Alerts** panel | Click one to jump to alert detail |
| 7 | Switch to **Transactions tab** | Full transaction list with risk scores |
| 8 | Click **eye icon** on a transaction | Screening detail expands — account holder, risk assessment, screening flags, channel/timestamp |
| 9 | Show flagged transaction warning | Red alert box on flagged items |
| 10 | Switch to **Alerts tab** | Alert list with severity badges |
| 11 | Click an alert | Full detail + AI Explainability Panel |
| 12 | **Click "Escalate"** | Status changes to escalated |
| 13 | **Click "File SAR"** | Creates a new SAR and switches to SARs tab |
| 14 | **Click "Resolve"** | Alert resolved, dashboard updates |
| 15 | Switch to **SARs tab** | List of Suspicious Activity Reports |
| 16 | Click **"New SAR"** (toolbar or tab button) | Creates blank SAR draft |
| 17 | Click a SAR | Full detail: amount, account, reviewer, filing status |
| 18 | Show **SAR Narrative** | Human-written narrative |
| 19 | Show **AI-Generated Narrative** | AI-generated alternative narrative |
| 20 | Show **AI Narrative button** | AI writes compliance narrative |
| 21 | Show **"Submit to JFSC" button** | Filing workflow |
| 22 | Show **filed acknowledgement** | Green badge with JFSC reference |
| 23 | Switch to **Rules tab** | AML rules engine — 7 rules |
| 24 | Show rule details | Description, type, severity, match count, active/inactive toggle |
| 25 | Click **"Add Rule"** button | Rule creation |
| 26 | Switch to **Accounts tab** | 8 monitored accounts |
| 27 | Show account details | Risk tier, PEP/Sanctions/Adverse Media flags, next review date |
| 28 | Click **"Add Account"** | Account onboarding |
| 29 | **Export PDF** | Downloads comprehensive AML report |

### C12. ESG Reporting (3 min)

> **Route:** `/esg`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Six tabs: Overview, Metrics, Targets, Reports, Frameworks, Sources |
| 2 | Show **Overview tab** | KPI cards, RadarChart, AreaChart |
| 3 | Switch to **Metrics tab** | ESG metrics list with values |
| 4 | **Add a metric** | Create new metric entry |
| 5 | Switch to **Targets tab** | ESG targets with progress |
| 6 | **Add a target** | Set new sustainability target |
| 7 | Switch to **Reports tab** | Generated ESG reports |
| 8 | Show **AI executive summary** | AI-generated ESG narrative |
| 9 | Switch to **Frameworks tab** | TCFD, SFDR, GRI frameworks |
| 10 | Switch to **Sources tab** | Data source management |
| 11 | **Export PDF** | Download ESG report |

### C13. Client Reporting (3 min)

> **Route:** `/client-reporting`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Five tabs: Overview, Reports, Templates, Schedules, Sources |
| 2 | Show **Overview tab** | Reporting stats, charts (Bar, Pie, AreaChart) |
| 3 | Switch to **Reports tab** | Generated report list |
| 4 | **Create a report** | Add new report |
| 5 | Show **AI report section generation** | AI writes report content |
| 6 | Switch to **Templates tab** | Report templates |
| 7 | **Create a template** | Design new template |
| 8 | Switch to **Schedules tab** | Automated report schedules |
| 9 | **Add a schedule** | Set up recurring report |
| 10 | Switch to **Sources tab** | Data source management |
| 11 | **Export PDF** | Download client report |

### C14. Audit Trail (2 min)

> **Route:** `/audit-trail`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Immutable event log with toolbar stats |
| 2 | Show event list | Each event: actor, action, timestamp, module |
| 3 | **Search events** | Type "SAR" in search → filtered results |
| 4 | **Filter by severity** | Use severity dropdown |
| 5 | **Filter by category** | Use category dropdown |
| 6 | **Filter by module** | Use module dropdown |
| 7 | Click an event | Detail panel on the right with full event info |
| 8 | Point out | Time formatting: "2m ago", "5h ago", or formatted future dates |
| 9 | **Export PDF** | Download audit trail report |

### C15. Risk Heatmap (2 min)

> **Route:** `/risk-heatmap`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Geographic heatmap (Leaflet.js) |
| 2 | Zoom/pan the map | Interactive map navigation |
| 3 | Click on risk zones | Risk details for each geographic region |
| 4 | Show risk legend | Color-coded severity ranges |
| 5 | **Export PDF** | Download risk heatmap report |

### C16. Executive Summary (2 min)

> **Route:** `/executive-summary`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Idle state: "Generate Executive Summary" prompt |
| 2 | Click **"Generate Summary"** | Loading animation (2.8s AI generation simulation) |
| 3 | Show generated summary | Board-ready narrative with all module statuses |
| 4 | Show module health indicators | Healthy (green), Warning (amber), Critical (red) |
| 5 | Show key metrics | Numbers, trends (TrendingUp/TrendingDown icons with correct colors) |
| 6 | Show recommendations | AI-generated strategic recommendations |
| 7 | **Export PDF** | Download board briefing — classified "BOARD CONFIDENTIAL" |

### C17. Compliance Matrix (2 min)

> **Route:** `/compliance-matrix`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Compliance framework list with overall rate in toolbar |
| 2 | Show **category filters** | All, AML/CFT, Data Protection, etc. |
| 3 | Click a category | Filtered regulation list |
| 4 | **Search frameworks** | Type in search box |
| 5 | Show Pie chart | Status distribution (compliant/partially/non-compliant) |
| 6 | Show regulation detail | Requirements, status, last review |
| 7 | **Update compliance status** | Change an item's status |
| 8 | **Export PDF** | Download compliance matrix report |

### C18. Data Sovereignty (2 min)

> **Route:** `/data-sovereignty`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | JDPA/GDPR compliance badges in toolbar |
| 2 | Show **Data Stores view** (default) | Data store cards: location, encryption, compliance |
| 3 | Click **"Data Flows" tab** | Cross-border data flow visualization |
| 4 | Click **"Regulations" tab** | Applicable data protection regulations |
| 5 | Show Bar/Pie charts | Data distribution visualizations |
| 6 | **Export PDF** | Download data sovereignty report |

### C19. Multi-Jurisdiction Comparison (2 min)

> **Route:** `/multi-jurisdiction`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Jurisdiction selector: Jersey, UK, Switzerland, Singapore, EU |
| 2 | Click different jurisdictions | Compare regulatory frameworks |
| 3 | Show **RadarChart** | Multi-axis comparison visualization |
| 4 | Show **category filters** | All, Financial, Technology, Governance |
| 5 | Click a category | Filtered dimension cards |
| 6 | Show regulatory dimension cards | AML Framework, Data Protection, AI Regulation etc. |
| 7 | **Export PDF** | Download jurisdiction comparison report |

### C20. Workflow Automation (2 min)

> **Route:** `/workflows`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Workflow list with status indicators |
| 2 | Show workflow details | SAR Filing Pipeline, KYC Client Onboarding etc. |
| 3 | Show stats cards | Total Runs, Success Rate |
| 4 | Show filter buttons | Active, Paused |
| 5 | **Pause a workflow** | Toggle workflow state |
| 6 | **Resume a workflow** | Re-enable workflow |
| 7 | **Retry a failed step** | Retry mechanism |
| 8 | Show **automatable step indicators** | Steps that can be automated |
| 9 | **Export PDF** | Download workflow report |

### C21. AI Model Governance / BYOK Config (3 min)

> **Route:** `/ai-governance`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Three views: Models, API Keys, Governance |
| 2 | Show **Models view** (default) | Model cards: Fraud Detection Engine, AML Detection Engine etc. |
| 3 | Show model details | Version, type (ensemble/neural), status, request count |
| 4 | Show **Bar chart** (model requests) | Usage distribution |
| 5 | Click **"API Keys" tab** | API Key Management panel |
| 6 | Show key list | Provider, key (masked), status, last used |
| 7 | **Add an API key** | Add new BYOK key |
| 8 | Click **"Governance" tab** | AI Governance Framework panel |
| 9 | Show governance policies | Fairness, transparency, accountability policies |
| 10 | **Export PDF** | Download AI governance report |

### C22. Bias & Fairness Monitoring (2 min)

> **Route:** `/bias-monitoring`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Stats cards: Total Bias Reports |
| 2 | Show **bias dimension list** | Geographic Origin, Entity Type, Client Nationality etc. |
| 3 | Show **Disparate Impact ratio** | DI values with threshold indicators |
| 4 | Show **trend icons** | TrendingUp (green = improving), TrendingDown (red = worsening) |
| 5 | **Filter by bias level** | Click "significant" → filtered results |
| 6 | Show **Bar chart** (group rates) | How different groups are treated |
| 7 | Show **Line chart** (DI ratios) | Trends over time |
| 8 | Show **Disparate Impact explanation** | What DI means and thresholds |
| 9 | **Export PDF** | Download bias monitoring report |

### C23. Sanctions & PEP Screening (2 min)

> **Route:** `/sanctions-screening`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open page | Stats cards: Total Screened, Active Matches |
| 2 | Show **entity list** | Mikhail Petrov, Ahmad Al-Rashid etc. |
| 3 | Show **match scores** | 94%, 78% etc. with confidence indicators |
| 4 | **Search entities** | Type in search box |
| 5 | **Filter by status** | Click "confirmed", "potential", "cleared" |
| 6 | Show **Bar chart** (by list source) | OFSI, OFAC, EU, UN distributions |
| 7 | Show **Pie chart** | Status breakdown |
| 8 | Show **Consolidated Screening Sources** panel | OpenSanctions, OFSI, OFAC etc. |
| 9 | **Export PDF** | Download sanctions screening report |

### C24. Settings & Profile (2 min)

> **Routes:** `/settings`, `/profile-settings`, `/settings/api-keys`, `/subscription`, `/license`

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open **Settings** | 4 tabs: General, AI Provider, Notifications, Privacy |
| 2 | Show **General tab** | App configuration |
| 3 | Show **"Seed Demo Data"** button | Populates all modules with realistic data |
| 4 | Show **"Clear Demo Data"** button | Resets to empty state |
| 5 | Show **AI Provider tab** | Model provider configuration |
| 6 | Open **Profile Settings** | 3 tabs: Profile, Preferences, Security |
| 7 | Show avatar upload | Profile picture management |
| 8 | Show theme/language settings | UI preferences |
| 9 | Open **API Keys page** | BYOK key management: add/delete/validate, provider registry, usage stats |
| 10 | Open **Subscription** | Plan tiers (Trial/Pro/Enterprise/Government), Stripe integration |
| 11 | Open **License Activation** | License key entry and activation |

---

## PART D — API LAYER (Express.js Backend)

### D1. Health & Monitoring (1 min — show in Postman/browser)

| Endpoint | What to Show |
|----------|-------------|
| `GET /health` | Liveness check |
| `GET /health/ready` | Readiness (DB + AI connectivity) |
| `GET /health/metrics` | Runtime metrics |

### D2. AI Chat (1 min)

| Endpoint | What to Show |
|----------|-------------|
| `POST /api/ai/chat` | Send a message, get AI response |
| `GET /api/ai/models` | List all 67+ available models |
| `GET /api/ai/providers` | List connected AI providers |

### D3. Module APIs (show 2-3 examples, 2 min)

| Endpoint | What to Show |
|----------|-------------|
| `GET /api/kyc/dashboard` | KYC dashboard stats |
| `POST /api/kyc/clients` | Create a new client |
| `POST /api/kyc/clients/:id/ai-risk-assess` | AI risk assessment |
| `GET /api/fraud/dashboard` | Fraud detection dashboard |
| `POST /api/fraud/transactions` | Add a transaction |
| `POST /api/fraud/detect-patterns` | AI pattern detection |
| `GET /api/aml/dashboard` | AML dashboard stats |
| `POST /api/aml/sars` | Create a SAR |
| `POST /api/aml/sars/:id/ai-narrative` | AI-generated SAR narrative |

---

## PART E — CROSS-CUTTING FEATURES (demonstrate across modules)

### E1. PDF Export (1 min)

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Go to any module with Export button | e.g. Fraud Detection |
| 2 | Click **Export PDF** (compact icon in toolbar) | Button shows "Generating..." → "Downloaded!" |
| 3 | Open the downloaded PDF | Show: title, classification badge, stats, tables, headings, jurisdiction, timestamp |
| 4 | Show classification levels | OFFICIAL, OFFICIAL-SENSITIVE, BOARD CONFIDENTIAL |

### E2. AI Explainability Panel (2 min)

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open **KYC Dashboard** → expand a client | AI Explainability Panel |
| 2 | Show each section | **Confidence score** (94%), **Reasoning** (natural language), **Recommended action** |
| 3 | Expand **Contributing Factors** | Factor name, weight (high/medium/low), detail |
| 4 | Expand **Data Sources** | List of databases/APIs consulted |
| 5 | Expand **Model Information** | Model name, version, type (ensemble/neural/rule-engine) |
| 6 | Repeat on **Fraud Detection** | Show different factors for fraud scenario |
| 7 | Repeat on **AML Dashboard** | Show AML-specific explainability |

### E3. Real-Time Dashboard Updates (1 min)

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Open **Fraud Detection** Overview tab | Note the dashboard numbers |
| 2 | **Add a transaction** | Dashboard stats update immediately |
| 3 | **Resolve an alert** | Alert count drops, pie chart changes |
| 4 | **Delete a transaction** | All stats recalculate |
| 5 | Do same on **AML page** | Prove all dashboards are live, not static |

### E4. Notification System (1 min)

| Step | Action | What to Show |
|------|--------|-------------|
| 1 | Show **bell icon** in toolbar | Badge with unread count |
| 2 | Click bell | Notification dropdown |
| 3 | Show notification items | Title, description, timestamp, severity |
| 4 | Click "Mark all read" | Badge disappears |

---

## Summary of Key Feature Counts to Mention in Demo

| Metric | Count |
|--------|-------|
| Total frontend pages | 55+ |
| AI-powered modules | 15+ |
| Supported LLM models | 67+ |
| MCP connectors | 64 |
| PDF-exportable pages | 19 |
| AI explainability panels | 3 (KYC, Fraud, AML) |
| Chart types | 7 (Bar, Line, Pie, Area, Radar, Heatmap, Table) |
| API endpoints | 181 |
| Tabs/views in multi-tab pages | 7 pages with 3-6 tabs each |
| CRUD-enabled modules | 12+ |
| Database migrations | 12 |
| Unit + integration tests | 137 passing |
| Jurisdictions covered | Jersey, UK, Switzerland, Singapore, EU |
| Compliance frameworks | JFSC, POCL, JDPA, GDPR, TCFD, SFDR, GRI |

---

## Recommended Video Structure

| Video # | Title | Duration | Content |
|---------|-------|----------|---------|
| 1 | Platform Overview | 5 min | Login, sidebar tour, AI chat, quick module overview |
| 2 | Financial Crime Suite | 10 min | Fraud Detection + AML/SAR + Sanctions Screening |
| 3 | Compliance & Governance | 8 min | KYC + Audit Trail + Compliance Matrix + Data Sovereignty + Multi-Jurisdiction |
| 4 | AI Features Deep Dive | 6 min | AI Explainability + Bias Monitoring + BYOK Config + Executive Summary |
| 5 | Business Operations | 8 min | BI + Project Intel + Resource Planning + Procurement + ESG + Reporting |
| 6 | Workflow & Automation | 4 min | Workflow Automation + Risk Heatmap + Notifications |
| 7 | Admin & Infrastructure | 5 min | Admin Dashboard + API Layer + Settings + License Management |
| 8 | Landing Site & Onboarding | 3 min | Marketing site + Auth flow + Pricing + Download |
