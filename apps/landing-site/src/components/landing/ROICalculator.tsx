"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calculator, TrendingUp, Clock, DollarSign, Users } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function ROICalculator() {
  const ref = useRef<HTMLElement>(null);
  const [employees, setEmployees] = useState(50);
  const [hourlyRate, setHourlyRate] = useState(75);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);

  const weeklySavings = employees * hoursPerWeek * hourlyRate * 0.7;
  const monthlySavings = weeklySavings * 4;
  const yearlySavings = monthlySavings * 12;
  const yearlyROI = ((yearlySavings - (49 * 12 * employees)) / (49 * 12 * employees)) * 100;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".roi-header > *", {
        opacity: 0, y: 30, duration: 0.7, stagger: 0.12, immediateRender: false,
        scrollTrigger: { trigger: ".roi-header", start: "top 85%", once: true },
      });
      gsap.from(".roi-calc-card", {
        opacity: 0, x: -40, duration: 0.8, ease: "power3.out", immediateRender: false,
        scrollTrigger: { trigger: ".roi-grid", start: "top 85%", once: true },
      });
      gsap.from(".roi-result", {
        opacity: 0, x: 40, duration: 0.8, stagger: 0.12, ease: "power3.out", immediateRender: false,
        scrollTrigger: { trigger: ".roi-grid", start: "top 85%", once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="roi-header text-center mb-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border mb-5 bg-white/[0.03] border-white/[0.08]">
            <Calculator className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-500">ROI Calculator</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-medium tracking-tight mb-5 text-white">
            Calculate Your <span className="text-shimmer">Potential Savings</span>
          </h2>
          <p className="text-lg max-w-3xl mx-auto text-zinc-500">
            See how much time and money your team could save by querying legacy systems with AI
          </p>
        </div>

        <div className="roi-grid grid lg:grid-cols-2 gap-8">
          <div className="roi-calc-card p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <h3 className="flex items-center gap-2 text-lg font-medium text-white mb-6">
              <Users className="w-5 h-5 text-zinc-400" />
              Your Organization
            </h3>
            <div className="space-y-7">
              <div>
                <label className="block text-sm font-medium mb-3 text-zinc-400">Number of Employees Querying Data</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="10" max="500" value={employees} onChange={(e) => setEmployees(Number(e.target.value))} className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-800 accent-white" />
                  <span className="text-2xl font-medium text-white min-w-[80px] text-right tabular-nums">{employees}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3 text-zinc-400">Average Hourly Rate ($)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="30" max="250" step="5" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-800 accent-white" />
                  <span className="text-2xl font-medium text-white min-w-[80px] text-right tabular-nums">${hourlyRate}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3 text-zinc-400">Hours Spent on Data Queries per Week</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="1" max="40" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(Number(e.target.value))} className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-800 accent-white" />
                  <span className="text-2xl font-medium text-white min-w-[80px] text-right tabular-nums">{hoursPerWeek}h</span>
                </div>
              </div>
              <div className="pt-5 border-t border-white/[0.06]">
                <p className="text-sm text-zinc-500">
                  Based on industry averages, Velanova can reduce query time by <span className="font-medium text-white">70%</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="roi-result p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-3">
                <DollarSign className="w-5 h-5" />
                Projected Annual Savings
              </div>
              <div className="text-4xl font-medium text-white mb-1 tabular-nums tracking-tight">
                ${yearlySavings.toLocaleString("en-US")}
              </div>
              <p className="text-sm text-zinc-600">
                ${monthlySavings.toLocaleString("en-US")}/month &middot; ${weeklySavings.toLocaleString("en-US")}/week
              </p>
            </div>

            <div className="roi-result p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-3">
                <Clock className="w-5 h-5" />
                Time Saved
              </div>
              <div className="text-4xl font-medium text-white mb-1 tabular-nums tracking-tight">
                {(employees * hoursPerWeek * 52 * 0.7).toLocaleString("en-US")}h
              </div>
              <p className="text-sm text-zinc-600">Per year across your entire team</p>
            </div>

            <div className="roi-result p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-3">
                <TrendingUp className="w-5 h-5" />
                Return on Investment
              </div>
              <div className="text-4xl font-medium text-white mb-1 tabular-nums tracking-tight">
                {yearlyROI > 0 ? yearlyROI.toFixed(0) : "0"}%
              </div>
              <p className="text-sm text-zinc-600">ROI in the first 12 months</p>
            </div>

            <div className="roi-result p-7 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <h4 className="font-medium text-white mb-2">Ready to unlock these savings?</h4>
              <p className="text-sm mb-5 text-zinc-500">Start with a free 14-day trial. No credit card required.</p>
              <button className="w-full bg-white text-black py-3.5 rounded-xl font-medium hover:bg-zinc-200 transition-all shadow-lg shadow-white/5">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}