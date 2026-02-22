import Link from 'next/link';
import { ArrowLeft, Boxes, GitBranch } from 'lucide-react';
import { Navbar } from '@/components/landing';
import { Footer } from '@/components/landing';

export const metadata = {
  title: 'All Integrations',
  description:
    'Connect to 64+ enterprise systems. Pre-built connectors for databases, ERPs, CRMs, data warehouses, and more.',
};

interface Integration {
  name: string;
  description: string;
  logo?: string;
  tag?: string;
}

interface Category {
  name: string;
  count: number;
  integrations: Integration[];
}

const categories: Category[] = [
  {
    name: 'Databases',
    count: 14,
    integrations: [
      {
        name: 'PostgreSQL',
        description: 'Open-source relational DB',
        logo: '/legacy/postgresql.png',
      },
      { name: 'MySQL', description: "World's most popular DB", logo: '/legacy/mysql.svg' },
      { name: 'MongoDB', description: 'NoSQL document database', logo: '/legacy/mongodb.svg' },
      { name: 'Oracle DB', description: 'Enterprise RDBMS', logo: '/legacy/oracle.svg' },
      { name: 'SQL Server', description: 'Microsoft enterprise DB', logo: '/legacy/sqlserver.svg' },
      { name: 'Redis', description: 'In-memory data store', logo: '/legacy/redis.svg' },
      {
        name: 'Elasticsearch',
        description: 'Search & analytics engine',
        logo: '/legacy/elasticsearch.svg',
      },
      { name: 'Cassandra', description: 'Distributed NoSQL DB', logo: '/legacy/cassandra.svg' },
      { name: 'DynamoDB', description: 'AWS serverless NoSQL', logo: '/legacy/dynamodb.svg' },
      { name: 'MariaDB', description: 'MySQL-compatible fork', logo: '/legacy/mariadb.svg' },
      { name: 'SQLite', description: 'Embedded SQL database', logo: '/legacy/sqlite.svg' },
      { name: 'CouchDB', description: 'Document-oriented DB', tag: 'NoSQL' },
      { name: 'InfluxDB', description: 'Time-series database', tag: 'Time Series' },
      { name: 'Firestore', description: 'Google Cloud NoSQL', tag: 'Cloud' },
    ],
  },
  {
    name: 'ERP',
    count: 8,
    integrations: [
      { name: 'SAP HANA', description: 'In-memory ERP platform', logo: '/legacy/saphana.svg' },
      { name: 'Oracle EBS', description: 'E-Business Suite', logo: '/legacy/oracle.svg' },
      { name: 'JD Edwards', description: 'Oracle ERP suite', logo: '/legacy/jdedwards.svg' },
      { name: 'Infor', description: 'Industry-specific ERP', logo: '/legacy/infor.svg' },
      { name: 'Epicor', description: 'Manufacturing ERP', logo: '/legacy/epicor.svg' },
      { name: 'SAP Ariba', description: 'Procurement platform', logo: '/legacy/sap-ariba.png' },
      { name: 'NetSuite', description: 'Cloud ERP platform', tag: 'Cloud' },
      {
        name: 'Microsoft Dynamics',
        description: 'Business applications suite',
        logo: '/legacy/dynamics365.svg',
      },
    ],
  },
  {
    name: 'CRM',
    count: 7,
    integrations: [
      { name: 'Salesforce', description: 'CRM & Sales Cloud', logo: '/legacy/salesforce.png' },
      { name: 'HubSpot', description: 'Inbound CRM platform', logo: '/legacy/hubspot.svg' },
      { name: 'Dynamics 365', description: 'Microsoft CRM & ERP', logo: '/legacy/dynamics365.svg' },
      { name: 'PeopleSoft', description: 'Oracle HR & CRM', logo: '/legacy/peoplesoft.svg' },
      { name: 'Zendesk', description: 'Customer support CRM', logo: '/legacy/zendesk.svg' },
      { name: 'Pipedrive', description: 'Sales pipeline CRM', tag: 'Sales' },
      { name: 'Zoho CRM', description: 'SMB-focused CRM', tag: 'Cloud' },
    ],
  },
  {
    name: 'Data Warehouse',
    count: 9,
    integrations: [
      { name: 'Snowflake', description: 'Cloud data platform', logo: '/legacy/snowflake.svg' },
      { name: 'BigQuery', description: 'Google serverless DW', logo: '/legacy/bigquery.svg' },
      {
        name: 'Amazon Redshift',
        description: 'AWS petabyte-scale DW',
        logo: '/legacy/redshift.svg',
      },
      {
        name: 'Databricks',
        description: 'Unified analytics platform',
        logo: '/legacy/databricks.svg',
      },
      { name: 'Azure Synapse', description: 'Microsoft analytics service', tag: 'Cloud' },
      { name: 'Teradata', description: 'Enterprise data warehouse', tag: 'Enterprise' },
      { name: 'Firebolt', description: 'Sub-second analytics', tag: 'Analytics' },
      { name: 'Dremio', description: 'Lakehouse platform', tag: 'Lakehouse' },
      { name: 'Starburst', description: 'Distributed SQL engine', tag: 'Analytics' },
    ],
  },
  {
    name: 'E-commerce',
    count: 6,
    integrations: [
      { name: 'Shopify', description: 'Leading e-commerce platform', logo: '/legacy/shopify.svg' },
      { name: 'Magento', description: 'Adobe Commerce platform', logo: '/legacy/magento.png' },
      { name: 'WooCommerce', description: 'WordPress commerce plugin', tag: 'WordPress' },
      { name: 'BigCommerce', description: 'SaaS commerce platform', tag: 'SaaS' },
      { name: 'Squarespace', description: 'Website & commerce builder', tag: 'Builder' },
      { name: 'PrestaShop', description: 'Open-source e-commerce', tag: 'Open Source' },
    ],
  },
  {
    name: 'Dev Tools',
    count: 5,
    integrations: [
      { name: 'Jira', description: 'Project & issue tracking', logo: '/legacy/jira.svg' },
      {
        name: 'SharePoint',
        description: 'Microsoft collaboration',
        logo: '/legacy/sharepoint.svg',
      },
      { name: 'GitHub', description: 'Code hosting & CI/CD', tag: 'DevOps' },
      { name: 'GitLab', description: 'DevOps lifecycle platform', tag: 'DevOps' },
      { name: 'Jenkins', description: 'Automation & CI server', tag: 'CI/CD' },
    ],
  },
  {
    name: 'Cloud',
    count: 8,
    integrations: [
      { name: 'AWS RDS', description: 'Amazon relational DB service', tag: 'AWS' },
      { name: 'Azure SQL', description: 'Microsoft cloud SQL', tag: 'Azure' },
      { name: 'Google Cloud SQL', description: 'Managed relational DB', tag: 'GCP' },
      { name: 'Amazon Aurora', description: 'AWS high-performance DB', tag: 'AWS' },
      { name: 'Supabase', description: 'Open-source Firebase alt', tag: 'Open Source' },
      { name: 'PlanetScale', description: 'MySQL-compatible serverless', tag: 'Serverless' },
      { name: 'CockroachDB', description: 'Distributed SQL database', tag: 'Distributed' },
      { name: 'Neon', description: 'Serverless Postgres', tag: 'Serverless' },
    ],
  },
  {
    name: 'Other',
    count: 7,
    integrations: [
      { name: 'ServiceNow', description: 'IT service management', logo: '/legacy/servicenow.svg' },
      { name: 'Workday', description: 'HR & finance platform', logo: '/legacy/workday.svg' },
      { name: 'Zendesk', description: 'Customer support & CRM', logo: '/legacy/zendesk.svg' },
      { name: 'Tableau', description: 'Business intelligence & viz', tag: 'BI' },
      { name: 'Power BI', description: 'Microsoft analytics tool', tag: 'BI' },
      { name: 'Looker', description: 'Google data platform', tag: 'Analytics' },
      { name: 'Qlik', description: 'Data analytics platform', tag: 'Analytics' },
    ],
  },
];

const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

function IntegrationCard({ item }: { item: Integration }) {
  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:border-white/[0.10] hover:bg-white/[0.04] transition-all duration-300">
      <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.06] flex items-center justify-center flex-shrink-0 p-1.5">
        {item.logo ? (
          <img src={item.logo} alt={item.name} className="w-full h-full object-contain" />
        ) : (
          <span className="text-xs font-semibold text-zinc-400 uppercase">
            {item.name.slice(0, 2)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">{item.name}</span>
          {item.tag && (
            <span className="flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/[0.05] text-zinc-600 border border-white/[0.04]">
              {item.tag}
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-600 mt-0.5 truncate">{item.description}</p>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-5 bg-white/[0.03] border-white/[0.08]">
              <Boxes className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-500">{totalCount}+ Integrations</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-5 text-white">
              Connect To <span className="text-shimmer">Any System</span>
            </h1>
            <p className="text-lg text-zinc-500 leading-relaxed">
              Pre-built connectors for databases, ERPs, CRMs, data warehouses, and more. Add custom
              connectors via our SDK.
            </p>
          </div>

          {/* Category sections */}
          <div className="space-y-14">
            {categories.map(category => (
              <div key={category.name}>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-lg font-medium text-white">{category.name}</h2>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/[0.05] text-zinc-500 border border-white/[0.06]">
                    {category.count}
                  </span>
                  <div className="flex-1 h-px bg-white/[0.05]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {category.integrations.map(item => (
                    <IntegrationCard key={item.name} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <div className="max-w-xl mx-auto p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <h3 className="text-xl font-medium text-white mb-2">Don&apos;t See Your System?</h3>
              <p className="text-zinc-500 mb-6 text-sm">
                We build custom connectors on request. Our SDK also lets your team add any
                integration.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-all text-sm shadow-lg shadow-white/5"
                >
                  <GitBranch className="w-4 h-4" />
                  Request An Integration
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.08] text-zinc-300 font-medium hover:border-white/[0.15] hover:bg-white/[0.03] transition-all text-sm"
                >
                  SDK Documentation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
