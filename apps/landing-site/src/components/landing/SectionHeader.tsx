interface SectionHeaderProps {
 badge: string;
 badgeColor?: 'blue' | 'purple' | 'green' | 'orange';
 title: string;
 description?: string;
}

export function SectionHeader({ badge, title, description }: SectionHeaderProps) {
 return (
 <div className="text-center mb-14">
 <span className="inline-block px-3 py-1 rounded-md font-medium uppercase tracking-wider mb-4 bg-blue-950 text-blue-400">
 {badge}
 </span>
 <h2 className="lg:text-4xl font-medium mb-4 text-white">{title}</h2>
 {description && (
 <p className="max-w-xl mx-auto font-medium text-muted-foreground">{description}</p>
 )}
 </div>
 );
}
