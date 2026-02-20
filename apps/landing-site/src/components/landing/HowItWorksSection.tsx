"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Download, Database, MessageSquare } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { step: "1", icon: Download, title: "Download the App", description: "Install Velanova on Windows, macOS, or Linux. No complex setup required." },
  { step: "2", icon: Database, title: "Connect Your Database", description: "Add your database credentials. We support 10+ database types out of the box." },
  { step: "3", icon: MessageSquare, title: "Start Asking Questions", description: "Type your questions in plain English. AI generates and executes the perfect SQL." },
];

export function HowItWorksSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hiw-header > *", {
        opacity: 0, y: 30, duration: 0.7, stagger: 0.12,
        scrollTrigger: { trigger: ".hiw-header", start: "top 85%", once: true },
      });
      gsap.from(".hiw-step", {
        opacity: 0, y: 40, duration: 0.7, stagger: 0.2, ease: "power3.out",
        scrollTrigger: { trigger: ".hiw-grid", start: "top 85%", once: true },
      });
      gsap.from(".hiw-connector", {
        scaleX: 0, duration: 0.8, stagger: 0.3, ease: "power2.out",
        scrollTrigger: { trigger: ".hiw-grid", start: "top 80%", once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="py-28 bg-black relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="hiw-header text-center mb-20">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-5 bg-white/[0.03] border-white/[0.08]">
            <span className="text-sm font-medium text-zinc-500">How It Works</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-5 text-white">
            Get started in <span className="text-shimmer">minutes</span>
          </h2>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto">
            Three simple steps to unlock AI-powered insights from your data
          </p>
        </div>

        <div className="hiw-grid grid md:grid-cols-3 gap-12 relative">
          {/* Connectors between steps */}
          <div className="hidden md:block absolute top-16 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px">
            <div className="hiw-connector absolute left-0 w-1/2 h-px bg-gradient-to-r from-zinc-700 to-zinc-800 origin-left" />
            <div className="hiw-connector absolute right-0 w-1/2 h-px bg-gradient-to-l from-zinc-700 to-zinc-800 origin-right" />
          </div>

          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="hiw-step text-center group">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-white/[0.04] border border-white/[0.08] group-hover:border-white/[0.15] group-hover:bg-white/[0.06] transition-all duration-500">
                  <Icon className="w-7 h-7 text-zinc-400 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <span className="text-xs font-medium text-zinc-300">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2 text-white">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-xs mx-auto">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}