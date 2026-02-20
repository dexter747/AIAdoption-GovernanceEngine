'use client';

import { 
 Database, 
 Server, 
 Cloud, 
 Box,
 Boxes,
 Cpu,
 HardDrive,
 FileSpreadsheet,
 ShoppingCart,
 Users2,
 Building2,
 GitBranch,
 LucideIcon
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Integration {
 name: string;
 icon: LucideIcon;
 category: string;
}

const integrations: Integration[] = [
 // Databases
 { name: 'PostgreSQL', icon: Database, category: 'Databases' },
 { name: 'MySQL', icon: Database, category: 'Databases' },
 { name: 'Oracle', icon: Database, category: 'Databases' },
 { name: 'SQL Server', icon: Database, category: 'Databases' },
 { name: 'MongoDB', icon: Database, category: 'Databases' },
 { name: 'Redis', icon: Database, category: 'Databases' },
 
 // ERP Systems
 { name: 'SAP', icon: Box, category: 'ERP' },
 { name: 'Oracle EBS', icon: Boxes, category: 'ERP' },
 { name: 'NetSuite', icon: Building2, category: 'ERP' },
 
 // CRM Systems
 { name: 'Salesforce', icon: Cloud, category: 'CRM' },
 { name: 'HubSpot', icon: Users2, category: 'CRM' },
 { name: 'Dynamics 365', icon: Server, category: 'CRM' },
 
 // Data Warehouses
 { name: 'Snowflake', icon: HardDrive, category: 'Data Warehouse' },
 { name: 'BigQuery', icon: FileSpreadsheet, category: 'Data Warehouse' },
 { name: 'Redshift', icon: Server, category: 'Data Warehouse' },
 
 // E-commerce
 { name: 'Shopify', icon: ShoppingCart, category: 'E-commerce' },
 { name: 'Magento', icon: ShoppingCart, category: 'E-commerce' },
 
 // Version Control
 { name: 'GitHub', icon: GitBranch, category: 'Dev Tools' },
 { name: 'GitLab', icon: GitBranch, category: 'Dev Tools' },
 
 // Infrastructure
 { name: 'AWS RDS', icon: Cpu, category: 'Cloud' },
 { name: 'Azure SQL', icon: Cloud, category: 'Cloud' },
 { name: 'Google Cloud', icon: Cloud, category: 'Cloud' },
];

const categories = Array.from(new Set(integrations.map(i => i.category)));

export function IntegrationsSection() {
 return (
 <section 
 className="relative py-24 bg-background"
 >
 <div className="max-w-7xl mx-auto px-6">
 <div className="text-center max-w-3xl mx-auto mb-16">
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium mb-4 bg-blue-950 text-blue-400">
 <Boxes className="w-4 h-4" />
 64+ Integrations
 </div>
 <h2 className="md:text-5xl font-medium mb-4 text-white">
 Connect to{' '}
 <span className="text-blue-500">
 any system
 </span>
 </h2>
 <p className="text-muted-foreground">
 Pre-built connectors for databases, ERPs, CRMs, data warehouses, and more. 
 Add custom connectors via our SDK.
 </p>
 </div>

 {/* Category tabs */}
 <div className="flex flex-wrap justify-center gap-3 mb-10">
 {categories.map((category) => (
 <button
 key={category}
 className="px-4 py-2 rounded-full font-medium transition-colors bg-gray-900 border-gray-800 text-gray-300 hover:border-blue-400 hover:text-blue-400"
 >
 {category}
 </button>
 ))}
 </div>

 {/* Integration cards */}
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
 {integrations.map((integration) => {
 const Icon = integration.icon;
 return (
 <Card 
 key={integration.name}
 className="integration-card group relative transition-all duration-300 cursor-pointer border-gray-800 hover:border-blue-500"
 >
 <CardContent className="p-4 flex flex-col items-center text-center">
 {/* Icon */}
 <div className="w-14 h-14 rounded-lg bg-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
 <Icon className="w-7 h-7 text-white" />
 </div>

 {/* Name */}
 <h3 className="font-medium text-white">
 {integration.name}
 </h3>

 {/* Category badge */}
 <div className="mt-2 px-2 py-0.5 rounded-full bg-gray-900 text-muted-foreground">
 {integration.category}
 </div>
 </CardContent>
 </Card>
 );
 })}

 {/* "More coming soon" card */}
 <Card className="integration-card border-gray-700 bg-gray-900">
 <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
 <div className="w-14 h-14 rounded-lg bg-gray-400 flex items-center justify-center mb-3">
 <Box className="w-7 h-7 text-white" />
 </div>
 <h3 className="font-medium text-muted-foreground">
 +40 More
 </h3>
 <p className="text-xs text-muted-foreground mt-1">
 Coming soon
 </p>
 </CardContent>
 </Card>
 </div>

 {/* Bottom CTA */}
 <div className="mt-16 text-center">
 <p className="mb-4 text-muted-foreground">
 Don't see your system? We can build custom connectors.
 </p>
 <a 
 href="/integrations" 
 className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all duration-300"
 >
 <GitBranch className="w-5 h-5" />
 Explore All Integrations
 </a>
 </div>
 </div>
 </section>
 );
}

export default IntegrationsSection;
