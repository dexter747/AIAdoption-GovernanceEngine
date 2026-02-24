'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { HelpCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    question: 'How does Velanova connect to my legacy systems?',
    answer:
      'Velanova uses MCP (Model Context Protocol) servers that act as secure bridges between your systems and AI models. We support 200+ enterprise systems including Oracle, SAP, Salesforce, ServiceNow, and more. No migration required - we connect to your existing databases and APIs using industry-standard secure protocols.',
  },
  {
    question: 'Is my data secure? Do you store any sensitive information?',
    answer:
      'Your data security is our top priority. We use military-grade AES-256-GCM encryption, support BYOK (Bring Your Own Key) for AI providers, and never store your business data on our servers. All queries are processed in real-time with end-to-end encryption, and your data never leaves your own infrastructure.',
  },
  {
    question: "What's the typical implementation timeline?",
    answer:
      'Most customers are up and running within 24-48 hours. The process is simple: (1) Download the desktop app, (2) Configure your database connections, (3) Start querying with AI. No lengthy integration projects, no consultants needed.',
  },
  {
    question: 'Which AI models does Velanova support?',
    answer:
      'We support all major AI providers: OpenAI (GPT-4, GPT-4 Turbo), Anthropic (Claude 3), Google (Gemini Pro), Groq, Mistral, and more. You can use our API keys or bring your own (BYOK). The system automatically selects the best model based on your query complexity and cost preferences.',
  },
  {
    question: 'Can I use Velanova with multiple databases simultaneously?',
    answer:
      'Absolutely! Velanova can connect to unlimited databases and systems simultaneously. Query across Oracle ERP, Salesforce CRM, and your data warehouse in a single natural language request. The AI understands context and automatically routes queries to the correct systems.',
  },
  {
    question: 'What kind of queries can I run?',
    answer:
      "Velanova handles everything from simple SELECT queries to complex multi-table joins, aggregations, and analytics. Ask questions like 'Show me customers who haven't purchased in 90 days' or 'What's our revenue trend by region?' The AI translates natural language into optimized SQL, REST API calls, or GraphQL queries.",
  },
  {
    question: 'Do I need technical skills to use Velanova?',
    answer:
      'No! Business users can query enterprise systems using plain English. No SQL knowledge required. However, technical users can still write custom queries and use advanced features. The interface adapts to your skill level.',
  },
  {
    question: 'What happens if the AI query fails or produces wrong results?',
    answer:
      'Velanova includes built-in query validation and result verification. If a query might be ambiguous, the system asks for clarification before execution. You can always review the actual SQL/API calls being made. All queries are logged with full audit trails for accountability and debugging.',
  },
  {
    question: 'Can I export results and share reports?',
    answer:
      'Yes! Export results to CSV, JSON, or Excel with one click. Create scheduled reports that run automatically and email stakeholders. Build custom dashboards that refresh in real-time. Share queries with your team using our collaboration features.',
  },
  {
    question: "What's your pricing model and is there a free trial?",
    answer:
      'We offer three plans: Free (personal projects, 100 queries/month), Professional ($49/user/month, unlimited queries, all AI models), and Enterprise (custom pricing, dedicated support, SSO, SLA). All plans include a 14-day free trial with full features - no credit card required.',
  },
  {
    question: 'Do you offer training and support?',
    answer:
      'Professional and Enterprise plans include: 24/7 priority support via chat and email, dedicated Slack channel, comprehensive documentation and video tutorials, quarterly strategy reviews, and custom training sessions for your team.',
  },
  {
    question: 'How do you handle enterprise security requirements?',
    answer:
      'Velanova is built with enterprise security first. Our Enterprise plan includes: custom data residency, dedicated infrastructure, audit logs, role-based access control (RBAC), SSO via SAML/OAuth, and fully air-gapped on-premise deployment options.',
  },
];

export default function FAQSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.faq-header > *', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        immediateRender: false,
        scrollTrigger: { trigger: '.faq-header', start: 'top 88%', once: true },
      });
      gsap.from('.faq-container', {
        opacity: 0,
        y: 15,
        duration: 0.5,
        immediateRender: false,
        scrollTrigger: { trigger: '.faq-container', start: 'top 88%', once: true },
      });
      gsap.from('.faq-cta-box', {
        opacity: 0,
        y: 15,
        duration: 0.5,
        immediateRender: false,
        scrollTrigger: { trigger: '.faq-cta-box', start: 'top 92%', once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="faq" ref={ref} className="py-16 bg-zinc-950/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="faq-header text-center mb-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-5 bg-white/[0.03] border-white/[0.08]">
            <HelpCircle className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-500">FAQ</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-medium tracking-tight mb-5 text-white">
            Everything You Need To Know
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-zinc-500">
            Have questions? We&apos;ve got answers.{' '}
            <a
              href="/contact"
              className="text-zinc-400 hover:text-white transition-colors underline underline-offset-4"
            >
              Contact our team
            </a>
            .
          </p>
        </div>

        <div className="faq-container">
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={'item-' + index}
                className="faq-item rounded-xl px-6 border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] transition-colors data-[state=open]:border-white/[0.1]"
              >
                <AccordionTrigger className="text-sm font-medium hover:no-underline text-white py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-zinc-500 pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="faq-cta-box mt-16 text-center">
          <div className="rounded-2xl p-8 border bg-white/[0.02] border-white/[0.06]">
            <h3 className="text-lg font-medium mb-2 text-white">Still Have Questions?</h3>
            <p className="text-sm mb-6 text-zinc-500">
              Our team is here to help. Get in touch and we&apos;ll respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/contact"
                className="px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-all shadow-lg shadow-white/5 text-sm"
              >
                Contact Sales
              </a>
              <a
                href="/docs"
                className="px-6 py-3 rounded-xl border border-white/[0.08] text-zinc-300 font-medium transition-all hover:border-white/[0.15] hover:bg-white/[0.03] text-sm"
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
