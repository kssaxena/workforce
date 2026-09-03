import React from "react";
import { ArrowRight, Boxes, Check, Network, ShieldCheck, Sparkles } from "lucide-react";
import { CTA, Eyebrow, GlassCard } from "./ui";

export default function ClosingSection() {
  const cards = [
    ["One workforce layer", "Employees, attendance, payroll and field operations connected."],
    ["One data foundation", "A real-time operational source of truth for every team."],
    ["One intelligence layer", "Analytics and AI become more useful as workforce context compounds."],
  ];

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <Eyebrow>THE OPPORTUNITY</Eyebrow>
              <h2 className="max-w-lg text-4xl font-black leading-[0.95] tracking-[-0.05em] text-slate-950">
                We are not building another <span className="text-blue-600">HRMS.</span>
              </h2>
              <p className="mt-4 max-w-lg text-[10px] leading-5 text-slate-500">
                We are building the infrastructure layer for the modern workforce — a platform that starts with HR operations and expands into real-time workforce intelligence.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                [Boxes, "People"],
                [Network, "Operations"],
                [Sparkles, "Intelligence"],
                [ShieldCheck, "Security"],
                [Check, "Automation"],
                [ArrowRight, "Scale"],
              ].map(([Icon, title]) => (
                <GlassCard key={title} className="flex min-h-20 flex-col justify-between p-3">
                  <Icon size={16} className="text-blue-600"/>
                  <span className="text-[14px] font-black text-slate-800">{title}</span>
                </GlassCard>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[10px] font-black text-slate-950">An opportunity to build the workforce infrastructure layer.</div>
                <div className="mt-1 text-[12px] text-slate-400">Start with your core workforce workflows and expand from there.</div>
              </div>
              <CTA>Book a demo</CTA>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-7 text-[7px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2 text-[9px] font-black text-slate-900">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-white">W</span>
            WorkforceOS
          </div>
          <div className="flex gap-5 text-[12px]"><span>Platform</span><span>Company</span><span>Security</span><span>Contact</span></div>
          <div className="text-[10px]">© 2026 WorkforceOS</div>
        </div>
      </footer>
    </>
  );
}
