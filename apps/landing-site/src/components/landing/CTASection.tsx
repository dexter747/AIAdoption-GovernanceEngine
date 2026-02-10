import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 bg-blue-600 dark:bg-blue-700">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-4">
          Ready to transform your data workflow?
        </h2>
        <p className="text-base text-blue-100 mb-8 max-w-xl mx-auto font-medium">
          Join thousands of teams using AI Nexus to unlock insights from their legacy systems.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/download"
            className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm inline-flex items-center justify-center gap-2"
          >
            Download Now
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/docs"
            className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium text-sm inline-flex items-center justify-center gap-2 border border-white/20"
          >
            <FileText className="w-4 h-4" />
            Read the Docs
          </Link>
        </div>
      </div>
    </section>
  );
}
