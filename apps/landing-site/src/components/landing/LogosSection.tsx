const integrations = ['PostgreSQL', 'MySQL', 'Oracle', 'MongoDB', 'SQL Server', 'Redis', 'SQLite'];

export function LogosSection() {
  return (
    <section className="py-12 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-medium uppercase tracking-widest mb-6 text-muted-foreground">
          Works with your existing infrastructure
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {integrations.map(name => (
            <span key={name} className="font-medium text-muted-foreground">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
