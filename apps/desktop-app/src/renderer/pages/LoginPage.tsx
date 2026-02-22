import { useAuth } from '../hooks/useAuth';
import { Shield, Database, Zap, ArrowRight, Lock, Globe } from 'lucide-react';
import { useRef, useState } from 'react';

const FEATURES = [
  { icon: Database, label: 'Any Database', sub: 'MySQL · Postgres · Mongo' },
  { icon: Zap, label: 'AI-Powered', sub: 'Natural language queries' },
  { icon: Shield, label: 'Enterprise', sub: 'SOC 2 · encrypted' },
];

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: `${(i * 4.7 + 3) % 100}%`,
  top: `${(i * 7.3 + 8) % 100}%`,
  delay: `${(i * 0.41) % 6}s`,
  duration: `${7 + (i % 5)}s`,
  size: i % 3 === 0 ? 1.5 : 1,
}));

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${-y * 3.5}deg) rotateY(${x * 3.5}deg)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303] flex items-center justify-center overflow-hidden select-none">

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.065) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Noise texture */}
      <div className="absolute inset-0 login-noise pointer-events-none" />

      {/* Ambient orbs */}
      <div className="absolute top-[-15%] left-[-8%] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.045) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[280px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.018) 0%, transparent 70%)', filter: 'blur(70px)' }} />

      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white/25 pointer-events-none login-particle"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      {/* ── Main card area ── */}
      <div className="relative z-10 w-full max-w-[355px] px-4">

        {/* Logo + brand */}
        <div className="flex flex-col items-center mb-9">
          <div
            className="relative mb-5 cursor-default"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* Glow halo */}
            <div
              className="absolute -inset-2 rounded-[28px] transition-all duration-700 pointer-events-none"
              style={{
                boxShadow: hovered
                  ? '0 0 48px 16px rgba(255,255,255,0.10), 0 0 90px 30px rgba(255,255,255,0.04)'
                  : '0 0 20px 4px rgba(255,255,255,0.055)',
              }}
            />
            {/* Gradient border ring */}
            <div className="absolute -inset-px rounded-[22px] bg-gradient-to-br from-white/20 via-white/6 to-transparent" />
            <div className="relative w-[68px] h-[68px] rounded-[20px] overflow-hidden bg-black">
              <img src="/logo.png" alt="Velanova" className="w-full h-full object-cover" />
            </div>
          </div>

          <h1 className="text-[22px] font-medium tracking-tight text-white mb-1.5 font-sans">
            Velanova
          </h1>
          <p className="text-[13px] text-zinc-500 tracking-wide font-light">
            AI-powered data intelligence
          </p>

          {/* Live status pill */}
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border bg-white/[0.03] border-white/[0.07] text-[11px] text-zinc-500">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            All systems operational
          </div>
        </div>

        {/* ── Auth card ── */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative mb-5 transition-transform duration-200 ease-out"
          style={{ willChange: 'transform' }}
        >
          {/* Card gradient border */}
          <div className="absolute inset-0 rounded-2xl p-px pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.01) 100%)' }}>
            <div className="w-full h-full rounded-2xl" />
          </div>

          {/* Inner glass body */}
          <div className="relative rounded-2xl bg-white/[0.028] backdrop-blur-2xl px-6 py-7 border border-white/[0.06]">
            {/* Connector icons */}
            <div className="flex items-center justify-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.07] flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
              <div className="text-[10px] text-zinc-600 font-mono tracking-widest px-2">OAuth 2.0</div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
              <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.07] flex items-center justify-center">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
              </div>
            </div>

            <p className="text-center text-[13px] text-zinc-400 leading-relaxed mb-6">
              Authenticate securely via your browser.
              <br />
              <span className="text-zinc-600 text-[12px]">Session is saved for future use.</span>
            </p>

            {/* Sign-in button */}
            <button
              onClick={login}
              disabled={isLoading}
              className="group w-full relative flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl text-[14px] font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #ffffff 0%, #e2e2e2 100%)',
                color: '#080808',
                boxShadow: '0 1px 0 0 rgba(255,255,255,0.25) inset, 0 6px 28px -6px rgba(255,255,255,0.18)',
              }}
            >
              {/* Shimmer on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.5) 50%, transparent 65%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer-sweep 1.4s ease infinite',
                }}
              />
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>Opening browser…</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Sign in securely</span>
                  <ArrowRight className="w-4 h-4 relative z-10 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-[11px] text-zinc-600">
              By signing in you agree to our{' '}
              <a href="#" className="text-zinc-400 hover:text-zinc-200 transition-colors underline underline-offset-2">
                Terms
              </a>{' '}
              and{' '}
              <a href="#" className="text-zinc-400 hover:text-zinc-200 transition-colors underline underline-offset-2">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* ── Feature chips ── */}
        <div className="grid grid-cols-3 gap-2">
          {FEATURES.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="group flex flex-col items-center text-center py-4 px-2 rounded-xl border border-white/[0.05] bg-white/[0.018] hover:bg-white/[0.04] hover:border-white/[0.09] transition-all duration-200 cursor-default"
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] group-hover:bg-white/[0.08] flex items-center justify-center mb-2 transition-colors duration-200">
                <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-300 transition-colors" />
              </div>
              <p className="text-[11.5px] font-medium text-zinc-300 mb-0.5 leading-tight">{label}</p>
              <p className="text-[10px] text-zinc-600 leading-snug">{sub}</p>
            </div>
          ))}
        </div>

        {/* Footer version */}
        <p className="text-center mt-6 text-[10px] text-zinc-700 tracking-[0.15em] uppercase font-light">
          Velanova Desktop · v2.0
        </p>
      </div>
    </div>
  );
}
