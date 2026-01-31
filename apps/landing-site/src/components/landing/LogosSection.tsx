import { Database } from 'lucide-react';

const databases = ['PostgreSQL', 'MySQL', 'Oracle', 'MongoDB', 'SQL Server'];

export function LogosSection() {
  return (
    <section className="py-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm font-medium text-gray-500 mb-8">
          TRUSTED BY TEAMS AT LEADING COMPANIES
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
          {databases.map((name) => (
            <div key={name} className="flex items-center gap-2">
              <Database className="w-5 h-5 text-gray-400" />
              <span className="text-lg font-semibold text-gray-400">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
