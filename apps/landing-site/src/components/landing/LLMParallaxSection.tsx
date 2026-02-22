"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cpu } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const llmModels = [
  { name: "OpenAI GPT-4o", subtext: "gpt-4o · o3", logo: "/llm-logos/openai.svg", bg: "bg-white/[0.04]" },
  { name: "Claude 3.7", subtext: "Anthropic · Sonnet", logo: "/llm-logos/claude-ai.svg", bg: "bg-white/[0.04]" },
  { name: "Gemini 2.0", subtext: "Google · Flash Pro", logo: "/llm-logos/gemini-color.svg", bg: "bg-white/[0.04]" },
  { name: "Grok 3", subtext: "xAI · Colossus", logo: "/llm-logos/grok.svg", bg: "bg-white/[0.04]" },
  { name: "DeepSeek R1", subtext: "DeepSeek · V3", logo: "/llm-logos/deepseek-color.svg", bg: "bg-white/[0.04]" },
  { name: "Mistral Large", subtext: "Mistral AI · 2.1", logo: "/llm-logos/mistral-rainbow.svg", bg: "bg-white/[0.04]" },
  { name: "Llama 3.3", subtext: "Meta · 70B / 405B", logo: "/llm-logos/meta.svg", bg: "bg-white/[0.04]" },
  { name: "Groq Inference", subtext: "LPU · 800 tok/s", logo: "/llm-logos/groq.svg", bg: "bg-white/[0.04]" },
  { name: "Qwen 2.5", subtext: "Alibaba · 72B", logo: "/llm-logos/qwen.svg", bg: "bg-white/[0.04]" },
];

function ModelCard({ model }: { model: typeof llmModels[0] }) {
  return (
    <div className={`flex-shrink-0 flex items-center gap-4 px-6 py-4 rounded-2xl border border-white/[0.06] ${model.bg} min-w-[200px]`}>
      <div className="w-10 h-10 rounded-xl bg-white/[0.08] flex items-center justify-center flex-shrink-0 p-1.5">
        <img src={model.logo} alt={model.name} className="w-full h-full object-contain" />
      </div>
      <div>
        <div className="text-sm font-medium text-white leading-tight">{model.name}</div>
        <div className="text-xs text-zinc-500 mt-0.5">{model.subtext}</div>
      </div>
    </div>
  );
}

export function LLMParallaxSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Duplicate models for both rows with offset start
  const row1Models = [...llmModels, ...llmModels, ...llmModels];
  const row2Models = [...llmModels.slice(4), ...llmModels.slice(0, 4), ...llmModels.slice(4), ...llmModels.slice(0, 4), ...llmModels];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header entrance
      gsap.from(headerRef.current, {
        opacity: 0, y: 40, duration: 0.8, ease: "power3.out", immediateRender: false,
        scrollTrigger: { trigger: headerRef.current, start: "top 85%", once: true },
      });

      // Row 1: slides RIGHT as user scrolls (parallax left-to-right)
      gsap.fromTo(
        row1Ref.current,
        { x: -80 },
        {
          x: 80,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );

      // Row 2: slides LEFT as user scrolls (parallax right-to-left, bidirectional)
      gsap.fromTo(
        row2Ref.current,
        { x: 80 },
        {
          x: -80,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-zinc-950/70 overflow-hidden">
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-32 z-10 bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 z-10 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none" />

      {/* Header */}
      <div ref={headerRef} className="relative z-10 text-center mb-10 px-6">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-5 bg-white/[0.03] border-white/[0.08]">
          <Cpu className="w-4 h-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-500">Universal AI Integration</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white mb-4">
          Every Leading AI Model,{" "}
          <br className="hidden sm:block" />
          <span className="text-shimmer">Connected To Your Legacy Systems</span>
        </h2>
        <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
          Velanova bridges any LLM with your existing Oracle, SAP, Salesforce, or any enterprise system — no migration needed.
        </p>
      </div>

      {/* Row 1 — scrolls rightward */}
      <div ref={row1Ref} className="flex gap-4 mb-4 will-change-transform">
        <div className="flex gap-4 animate-marquee-slow">
          {row1Models.map((model, i) => (
            <ModelCard key={`r1-${i}`} model={model} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls leftward (bidirectional) */}
      <div ref={row2Ref} className="flex gap-4 will-change-transform">
        <div className="flex gap-4 animate-marquee-reverse-slow">
          {row2Models.map((model, i) => (
            <ModelCard key={`r2-${i}`} model={model} />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 text-center mt-14 px-6">
        <p className="text-sm text-zinc-500">
          Use your own API keys (BYOK) &mdash; switch models with one click, no code changes needed.
        </p>
      </div>
    </section>
  );
}

export default LLMParallaxSection;