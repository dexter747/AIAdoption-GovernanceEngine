"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "How does AI Nexus connect to my legacy systems?",
    answer: "AI Nexus uses MCP (Model Context Protocol) servers that act as secure bridges between your systems and AI models. We support 64+ enterprise systems including Oracle, SAP, Salesforce, ServiceNow, and more. No migration required - we connect to your existing databases and APIs using industry-standard secure protocols."
  },
  {
    question: "Is my data secure? Do you store any sensitive information?",
    answer: "Your data security is our top priority. We use military-grade AES-256-GCM encryption, support BYOK (Bring Your Own Key) for AI providers, and never store your business data on our servers. All queries are processed in real-time with end-to-end encryption. We're SOC 2 Type II compliant and GDPR ready."
  },
  {
    question: "What's the typical implementation timeline?",
    answer: "Most customers are up and running within 24-48 hours. The process is simple: (1) Download the desktop app, (2) Configure your database connections, (3) Start querying with AI. No lengthy integration projects, no consultants needed. Our guided setup walks you through each step."
  },
  {
    question: "Which AI models does AI Nexus support?",
    answer: "We support all major AI providers: OpenAI (GPT-4, GPT-4 Turbo), Anthropic (Claude 3), Google (Gemini Pro), Groq, Mistral, and more. You can use our API keys or bring your own (BYOK). The system automatically selects the best model based on your query complexity and cost preferences."
  },
  {
    question: "Can I use AI Nexus with multiple databases simultaneously?",
    answer: "Absolutely! AI Nexus can connect to unlimited databases and systems simultaneously. Query across Oracle ERP, Salesforce CRM, and your data warehouse in a single natural language request. The AI understands context and automatically routes queries to the correct systems."
  },
  {
    question: "What kind of queries can I run?",
    answer: "AI Nexus handles everything from simple SELECT queries to complex multi-table joins, aggregations, and analytics. Ask questions like 'Show me customers who haven't purchased in 90 days' or 'What's our revenue trend by region?' The AI translates natural language into optimized SQL, REST API calls, or GraphQL queries depending on your system."
  },
  {
    question: "Do I need technical skills to use AI Nexus?",
    answer: "No! That's the beauty of AI Nexus. Business users can query enterprise systems using plain English. No SQL knowledge required. However, technical users can still write custom queries and use advanced features. The interface adapts to your skill level."
  },
  {
    question: "What happens if the AI query fails or produces wrong results?",
    answer: "AI Nexus includes built-in query validation and result verification. If a query might be ambiguous, the system asks for clarification before execution. You can always review the actual SQL/API calls being made. Plus, all queries are logged with full audit trails for compliance."
  },
  {
    question: "Can I export results and share reports?",
    answer: "Yes! Export results to CSV, JSON, or Excel with one click. Create scheduled reports that run automatically and email stakeholders. Build custom dashboards that refresh in real-time. Share queries with your team using our collaboration features."
  },
  {
    question: "What's your pricing model and is there a free trial?",
    answer: "We offer three plans: Free (personal projects, 100 queries/month), Professional ($49/user/month, unlimited queries, all AI models), and Enterprise (custom pricing, dedicated support, SSO, SLA). All plans include a 14-day free trial with full features - no credit card required."
  },
  {
    question: "Do you offer training and support?",
    answer: "Professional and Enterprise plans include: 24/7 priority support via chat and email, dedicated Slack channel, comprehensive documentation and video tutorials, quarterly strategy reviews, and custom training sessions for your team. Our average response time is under 2 hours."
  },
  {
    question: "Can AI Nexus handle compliance requirements (HIPAA, SOC 2, GDPR)?",
    answer: "Yes. We're SOC 2 Type II certified, GDPR compliant, and HIPAA ready. Our Enterprise plan includes: custom data residency, dedicated infrastructure, BAA agreements, audit logs, role-based access control (RBAC), and SSO via SAML/OAuth. We work with your compliance team to ensure all requirements are met."
  }
];

export default function FAQSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="faq-header text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-6">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Frequently Asked Questions
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-medium text-gray-900 dark:text-white mb-4">
            Everything You Need to Know
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have questions? We've got answers. Can't find what you're looking for?{' '}
            <a href="/contact" className="text-blue-600 hover:underline">Contact our team</a>.
          </p>
        </div>

        <div className="faq-container">
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="faq-item bg-white dark:bg-gray-800/50 rounded-xl px-6 border-none"
              >
                <AccordionTrigger className="text-lg font-medium text-gray-900 dark:text-white hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
            <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Our team is here to help. Get in touch and we'll respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Contact Sales
              </a>
              <a
                href="/docs"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-blue-600 text-blue-600 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                View Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
