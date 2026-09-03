import React from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Route, ShieldCheck } from "lucide-react";
import { Eyebrow, GlassCard, LocationBadge } from "./ui";

export default function WorkforceOperationsSection() {
  return (
    <section id="workforce" className="bg-white">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>FIELD WORKFORCE</Eyebrow>
            <h2 className="max-w-md text-3xl font-black leading-[0.96] tracking-[-0.04em] text-slate-950">
              The same HRMS adapts to <span className="text-blue-600">how employees actually work.</span>
            </h2>
            <p className="mt-4 max-w-md text-[10px] leading-5 text-slate-500">
              Office employees, sales representatives and mobile teams can operate inside the same workforce system without losing the workflows unique to each role.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <GlassCard className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-[8px] font-black text-slate-800">WORKFORCE CHECK-IN</div>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[6px] font-bold text-emerald-600">VERIFIED</span>
              </div>
              <div className="relative mx-auto h-40 max-w-xs overflow-hidden rounded-xl bg-sky-50">
                <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "linear-gradient(#dbeafe 1px, transparent 1px), linear-gradient(90deg,#dbeafe 1px,transparent 1px)", backgroundSize: "22px 22px" }} />
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl">
                  <MapPin size={17} />
                </motion.div>
                <div className="absolute left-[24%] top-[22%] h-2 w-2 rounded-full bg-blue-400" />
                <div className="absolute right-[20%] bottom-[24%] h-2 w-2 rounded-full bg-cyan-400" />
                <LocationBadge />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[7px]">
                <div className="rounded-lg bg-slate-50 p-2"><div className="font-bold">Office</div><div className="mt-1 text-slate-400">200m geofence</div></div>
                <div className="rounded-lg bg-slate-50 p-2"><div className="font-bold">GPS</div><div className="mt-1 text-slate-400">Live location</div></div>
              </div>
            </GlassCard>

            <GlassCard className="bg-blue-700 p-4 text-black shadow-[0_30px_60px_rgba(37,99,235,.25)]">
              <div className="text-[10px] font-bold text-blue-600">SALES REPRESENTATIVE ROUTE</div>
              <div className="mt-1 text-[14px]">Today</div>
              <svg viewBox="0 0 240 130" className="mt-5 h-28 w-full overflow-visible">
                <path d="M8 105 C45 80, 42 35, 78 62 S130 112, 158 60 S205 32, 232 14" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="2" strokeDasharray="4 4"/>
                <circle cx="8" cy="105" r="5" fill="white"/><circle cx="78" cy="62" r="5" fill="white"/><circle cx="158" cy="60" r="5" fill="white"/><circle cx="232" cy="14" r="5" fill="#a5f3fc"/>
              </svg>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {["12 stops", "48 km", "8 visits"].map((x) => <div key={x} className="rounded-lg border border-white/10 bg-blue-600 p-2 text-[12px] text-white">{x}</div>)}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
