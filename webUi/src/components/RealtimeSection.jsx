import React from "react";
import { Activity, ArrowDownRight, ArrowUpRight, Clock3, UsersRound } from "lucide-react";
import { Eyebrow, GlassCard, Stat, TinyBars } from "./ui";

export default function RealtimeSection() {
  return (
    <section className="bg-sky-50/50">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <Eyebrow>REAL-TIME OPERATIONS</Eyebrow>
            <h2 className="max-w-md text-4xl font-black leading-[0.96] tracking-[-0.04em] text-slate-950">
              One real-time view of the <span className="text-blue-600">company.</span>
            </h2>
            <p className="mt-4 max-w-md text-[12px] leading-5 text-slate-500">
              Replace disconnected reports with a live operating picture of attendance, people, field activity, payroll and workforce performance.
            </p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat icon={UsersRound} value="1,284" label="Active employees" trend="+12%" />
              <Stat icon={Activity} value="94.8%" label="Attendance today" trend="+4.8%" />
              <Stat icon={Clock3} value="86" label="Open shifts" trend="12%" />
              <Stat icon={ArrowUpRight} value="₹4.2L" label="Payroll due" trend="+7%" />
            </div>
            <div className="grid gap-3 sm:grid-cols-[1.25fr_.75fr]">
              <GlassCard className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div><div className="text-[10px] font-bold text-slate-400">ATTENDANCE TREND</div><div className="text-[10px] font-black">Last 12 working days</div></div>
                  <div className="flex items-center gap-1 text-[7px] text-emerald-500"><ArrowUpRight size={9}/> 8.4%</div>
                </div>
                <TinyBars />
              </GlassCard>
              <GlassCard className="p-4">
                <div className="text-[10px] font-bold text-slate-400">WORKFORCE STATUS</div>
                <div className="mt-3 space-y-3">
                  {[
                    ["On time", "78%", "bg-blue-600"],
                    ["Late", "12%", "bg-blue-300"],
                    ["Leave", "7%", "bg-cyan-300"],
                    ["Absent", "3%", "bg-slate-200"],
                  ].map(([x, v, c]) => (
                    <div key={x}>
                      <div className="mb-1 flex justify-between text-[10px]"><span>{x}</span><span className="font-bold">{v}</span></div>
                      <div className="h-1.5 rounded-full bg-slate-100"><div className={`h-full rounded-full ${c}`} style={{ width: v }} /></div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
