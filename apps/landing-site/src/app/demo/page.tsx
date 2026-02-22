import Link from 'next/link';
import { Play, ArrowLeft, Clock } from 'lucide-react';
import { Navbar } from '@/components/landing';
import { Footer } from '@/components/landing';

export const metadata = {
  title: 'Product Demo',
  description: 'Watch Velanova in action. See how AI connects to your legacy systems.',
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-32">
        {/* Back link */}
        <div className="w-full max-w-4xl mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-5 bg-white/[0.03] border-white/[0.08]">
            <Play className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-500">Product Demo</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-4">
            See Velanova In Action
          </h1>
          <p className="text-lg text-zinc-500">
            Watch how Velanova connects AI to your legacy systems in minutes.
          </p>
        </div>

        {/* Video placeholder */}
        <div className="w-full max-w-4xl">
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] aspect-video overflow-hidden flex flex-col items-center justify-center gap-6">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />

            {/* Play icon */}
            <div className="relative z-10 flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center">
                <Play className="w-8 h-8 text-white/60 ml-1" />
              </div>

              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-white/[0.08] bg-black/60 backdrop-blur-sm">
                <Clock className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-400">Video Coming Soon</span>
              </div>

              <p className="text-sm text-zinc-600 text-center max-w-xs">
                Our team is putting together a full walkthrough. Check back soon!
              </p>
            </div>

            {/* Corner labels */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 border border-white/[0.06] backdrop-blur-sm">
              <span className="text-xs font-medium text-zinc-500">
                Full Product Walkthrough · ~5 min
              </span>
            </div>
          </div>
        </div>

        {/* CTA below */}
        <div className="mt-12 text-center">
          <p className="text-zinc-500 mb-6">
            Ready to get started? No video needed — try it yourself.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/download"
              className="px-7 py-3.5 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-all text-sm shadow-lg shadow-white/5"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="px-7 py-3.5 rounded-xl border border-white/[0.08] text-zinc-300 font-medium hover:border-white/[0.15] hover:bg-white/[0.03] transition-all text-sm"
            >
              Request A Live Demo
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
