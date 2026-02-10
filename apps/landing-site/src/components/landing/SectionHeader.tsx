interface SectionHeaderProps {
  badge: string;
  badgeColor?: 'blue' | 'purple' | 'green' | 'orange';
  title: string;
  description?: string;
}

export function SectionHeader({ badge, title, description }: SectionHeaderProps) {
  return (
    <div className="text-center mb-14">
      <span className="inline-block px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950 text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">
        {badge}
      </span>
      <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
      {description && (
        <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium">{description}</p>
      )}
    </div>
  );
}
