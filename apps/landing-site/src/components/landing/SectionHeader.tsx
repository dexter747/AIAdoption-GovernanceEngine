interface SectionHeaderProps {
  badge: string;
  badgeColor?: 'blue' | 'purple' | 'green' | 'orange';
  title: string;
  description?: string;
}

const badgeColors = {
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
};

export function SectionHeader({ badge, badgeColor = 'blue', title, description }: SectionHeaderProps) {
  return (
    <div className="text-center mb-20">
      <span
        className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 ${badgeColors[badgeColor]}`}
      >
        {badge}
      </span>
      <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">{title}</h2>
      {description && (
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">{description}</p>
      )}
    </div>
  );
}
