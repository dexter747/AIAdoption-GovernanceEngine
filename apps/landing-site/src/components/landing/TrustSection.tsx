'use client';

import { Shield, Award, Lock, CheckCircle2, Globe, Users, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TrustBadge {
 icon: LucideIcon;
 title: string;
 description: string;
}

const trustBadges: TrustBadge[] = [
 {
 icon: Shield,
 title: 'SOC 2 Type II',
 description: 'Independently audited security controls',
 },
 {
 icon: Lock,
 title: 'GDPR Compliant',
 description: 'Full EU data protection compliance',
 },
 {
 icon: CheckCircle2,
 title: 'HIPAA Ready',
 description: 'Healthcare data protection certified',
 },
 {
 icon: Award,
 title: 'ISO 27001',
 description: 'International security standard',
 },
 {
 icon: Globe,
 title: '99.9% Uptime',
 description: 'Enterprise-grade reliability SLA',
 },
 {
 icon: Users,
 title: '2,500+ Enterprises',
 description: 'Trusted by Fortune 500 companies',
 },
];

// Mock company logos (in production, use actual logo images)
const companies = [
 'TechCorp Global',
 'SecureBank',
 'RetailCo',
 'FinanceHub',
 'HealthTech Solutions',
 'DataFlow Industries',
 'Enterprise Systems Inc',
 'Global Manufacturing Co',
];

export function TrustSection() {
 return (
 <section 
 className="relative py-20 bg-secondary"
 >
 <div className="max-w-7xl mx-auto px-6">
 {/* Trust badges */}
 <div className="mb-16">
 <div className="text-center mb-10">
 <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-3">
 Enterprise-grade{' '}
 <span className="text-blue-500">
 security & compliance
 </span>
 </h2>
 <p className="text-muted-foreground">
 Built for the world's most security-conscious organizations
 </p>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
 {trustBadges.map((badge) => {
 const Icon = badge.icon;
 return (
 <Card 
 key={badge.title}
 className="trust-badge transition-all duration-300 border-gray-800 hover:border-blue-500"
 >
 <CardContent className="p-4 text-center">
 <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center mx-auto mb-3">
 <Icon className="w-6 h-6 text-white" />
 </div>
 <h3 className="font-medium mb-1 text-white">
 {badge.title}
 </h3>
 <p className="leading-tight text-muted-foreground">
 {badge.description}
 </p>
 </CardContent>
 </Card>
 );
 })}
 </div>
 </div>

 {/* Company logos */}
 <div>
 <div className="text-center mb-8">
 <p className="font-medium uppercase tracking-wide text-muted-foreground">
 Trusted by leading enterprises
 </p>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
 {companies.map((company) => (
 <div 
 key={company}
 className="company-logo px-6 py-4 text-center"
 >
 <div className="font-medium text-gray-300">
 {company}
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Security statement */}
 <div className="mt-16 max-w-3xl mx-auto text-center">
 <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl border bg-blue-950 border-blue-800">
 <Lock className="w-6 h-6 text-blue-500" />
 <div className="text-left">
 <div className="font-medium text-white">
 Your data never leaves your infrastructure
 </div>
 <div className="text-muted-foreground">
 Zero-knowledge architecture with AES-256-GCM encryption. Air-gapped deployment available.
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>
 );
}

export default TrustSection;
