import React from "react";
import { ChevronDown, GitBranch, Users2 } from "lucide-react";
import { Eyebrow, GlassCard, Pill } from "./ui";

const roles = ["CEO", "Operations", "Regional Manager", "Team Lead", "Employee", "Field Executive"];

export default function StructureSection() {
  return (
    <section className="border-y border-slate-100 bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <GlassCard className="p-6">
            <Eyebrow>ORGANIZATION DESIGN</Eyebrow>
            <h2 className="text-3xl font-black leading-[0.96] tracking-[-0.04em] text-slate-950">
              Every company can define its own <span className="text-blue-600">workforce structure.</span>
            </h2>
            <p className="mt-4 text-[10px] leading-5 text-slate-500">Configure departments, locations, reporting lines, roles and permission boundaries around the way the business actually operates.</p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {["Roles", "Teams", "Regions", "Departments"].map((x, i) => <Pill key={x} active={i === 0}>{x}</Pill>)}
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden bg-blue-600 p-5 text-white shadow-[0_30px_70px_rgba(37,99,235,.22)]">
            <div className="mb-5 flex items-center justify-between">
              <div><div className="text-[7px] font-bold text-blue-100">WORKFORCE STRUCTURE</div><div className="text-[13px] font-black">Reporting hierarchy</div></div>
              <GitBranch size={16} />
            </div>
            <div className="space-y-1.5">
              {roles.map((role, i) => (
                <div key={role}>
                  <div className={`ml-${Math.min(i, 5) * 3} flex items-center gap-2 rounded-lg border border-white/10 bg-blue-600 px-3 py-2`} style={{ marginLeft: `${Math.min(i, 5) * 12}px` }}>
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10"><Users2 size={10}/></span>
                    <span className="flex-1 text-[10px] font-semibold">{role}</span>
                    <ChevronDown size={9} className="opacity-50"/>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
