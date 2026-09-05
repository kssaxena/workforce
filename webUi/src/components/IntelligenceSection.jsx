import React, { useState } from "react";
import { motion } from "framer-motion";
import {
	BrainCircuit,
	Database,
	Gauge,
	LineChart,
	Sparkles,
} from "lucide-react";
import { Eyebrow, GlassCard, Pill } from "./ui";

const stages = [
	[
		"HRMS foundation",
		"Employee records, attendance, leave and payroll create the operational source of truth.",
	],
	[
		"Workforce network",
		"Connect roles, locations, teams, field operations and company structures.",
	],
	[
		"Workforce intelligence",
		"Turn operational data into trends, alerts, forecasts and recommendations.",
	],
	[
		"AI workforce platform",
		"Build proactive workforce experiences on top of real-time organizational context.",
	],
];

export default function IntelligenceSection() {
	const [active, setActive] = useState(2);

	return (
		<section id="intelligence" className="bg-white">
			<div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
				<div className="mb-8">
					<Eyebrow>THE EVOLUTION</Eyebrow>
					<h2 className="text-4xl font-black tracking-[-0.04em] text-slate-950">
						From HRMS to workforce intelligence platform.
					</h2>
					<p className="mt-3 max-w-xl text-[12px] leading-5 text-slate-500">
						The product compounds as more workforce activity flows through the
						platform.
					</p>
				</div>

				<div className="overflow-hidden rounded-2xl border border-slate-200">
					<div className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4">
						{stages.map(([title], i) => (
							<button
								key={title}
								onClick={() => setActive(i)}
								className={`border-r border-slate-200 p-4 text-left last:border-r-0 ${active === i ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`}
							>
								<div className="mb-3 flex items-center justify-between">
									<span className="text-[12px] font-black">
										{String(i + 1).padStart(2, "0")}
									</span>
									<Sparkles size={11} />
								</div>
								<div className="text-[12px] font-black leading-3">{title}</div>
							</button>
						))}
					</div>
					<div className="grid gap-4 bg-slate-50 p-4 sm:grid-cols-[1.2fr_.8fr]">
						<GlassCard className="p-5">
							<div className="flex items-center gap-2 text-[12px] font-black text-blue-600">
								<BrainCircuit size={12} /> INTELLIGENCE LAYER
							</div>
							<motion.div
								key={active}
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								className="mt-4 text-[18px] font-black text-slate-950"
							>
								{stages[active][0]}
							</motion.div>
							<p className="mt-2 text-[12px] leading-5 text-slate-500">
								{stages[active][1]}
							</p>
							<div className="mt-5 flex flex-wrap gap-1.5">
								{["Signals", "Forecasts", "Recommendations", "Automations"].map(
									(x) => (
										<Pill key={x}>{x}</Pill>
									),
								)}
							</div>
						</GlassCard>
						<div className="grid grid-cols-2 gap-2">
							{[
								[Database, "Single source", "Operational data"],
								[LineChart, "Live insights", "Performance trends"],
								[Gauge, "Forecasting", "Workforce demand"],
								[Sparkles, "AI actions", "Proactive workflows"],
							].map(([Icon, title, sub]) => (
								<GlassCard key={title} className="p-4">
									<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
										<Icon size={12} />
									</span>
									<div className="mt-3 text-[12px] font-black">{title}</div>
									<div className="mt-1 text-[12px] text-slate-400">{sub}</div>
								</GlassCard>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
