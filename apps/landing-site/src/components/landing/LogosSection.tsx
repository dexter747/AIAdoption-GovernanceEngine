const integrations = ['PostgreSQL', 'MySQL', 'Oracle', 'MongoDB', 'SQL Server', 'Redis', 'SQLite'];

export function LogosSection() {
  return (
    <section className="py-12 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
          Works with your existing infrastructure
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {integrations.map((name) => (
            <span key={name} className="text-sm font-medium text-gray-300 dark:text-gray-600">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
