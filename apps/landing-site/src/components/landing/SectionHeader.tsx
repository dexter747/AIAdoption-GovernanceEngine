interface SectionHeaderProps {
  badge: string;
  badgeColor?: 'blue' | 'purple' | 'emerald' | 'amber' | 'red' | 'indigo';
  title: string;
  description?: string;
}

const badgeStyles: Record<NonNullable<SectionHeaderProps['badgeColor']>, string> = {
  blue: 'bg-zinc-900/40 text-zinc-400',
  purple: 'bg-zinc-900/40 text-zinc-400',
  emerald: 'bg-zinc-900/40 text-zinc-400',
  amber: 'bg-zinc-900/40 text-zinc-400',
  red: 'bg-zinc-900/40 text-zinc-400',
  indigo: 'bg-zinc-900/40 text-zinc-400',
};

export function SectionHeader({
  badge,
  title,
  description,
  badgeColor = 'blue',
}: SectionHeaderProps) {
  return (
    <div className="text-center mb-14">
      <span
        className={`inline-block px-3 py-1 rounded-md font-medium uppercase tracking-wider mb-4 ${badgeStyles[badgeColor]}`}
      >
        {badge}
      </span>
      <h2 className="lg:text-4xl font-medium mb-4 text-white">{title}</h2>
      {description && (
        <p className="max-w-xl mx-auto font-medium text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
