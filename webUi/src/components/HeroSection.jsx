import React from "react";
import { motion } from "framer-motion";
import { Activity, Clock3, Users } from "lucide-react";
import {
	CTA,
	Eyebrow,
	GlassCard,
	LocationBadge,
	Stat,
	TinyBars,
	fadeUp,
	stagger,
} from "./ui";

function DashboardPreview() {
	return (
		<motion.div
			initial={{ opacity: 0, rotateY: -10, rotateX: 6, y: 25 }}
			whileInView={{ opacity: 1, rotateY: -2, rotateX: 2, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 1 }}
			className="relative [perspective:1000px]"
		>
			<div className="absolute -inset-10 rounded-full bg-blue-100/60 blur-3xl" />
			<GlassCard className="relative overflow-hidden rounded-2xl p-2.5 shadow-[0_35px_80px_rgba(15,96,180,0.20)]">
				<div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2">
					<div className="mb-2 flex items-center justify-between">
						<div>
							<div className="text-[12px] font-bold text-slate-400">
								WORKFORCE OVERVIEW
							</div>
							<div className="text-[11px] font-black text-slate-900">
								Today at a glance
							</div>
						</div>
						<div className="rounded-md bg-white px-2 py-1 text-[6px] font-bold text-blue-600 shadow-sm">
							Live
						</div>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<GlassCard className="bg-white p-2">
							<div className="mb-1 flex justify-between text-[6px] text-slate-400">
								<span>Attendance</span>
								<span className="text-emerald-500">+8.4%</span>
							</div>
							<div className="text-[13px] font-black text-slate-950">92.4%</div>
							<TinyBars
								values={[24, 31, 29, 38, 45, 43, 58, 51, 67, 61, 77, 88]}
							/>
						</GlassCard>
						<div className="rounded-xl bg-blue-600 p-2 text-white shadow-lg shadow-blue-200">
							<div className="text-[6px] text-blue-100">Field workforce</div>
							<div className="mt-1 text-[17px] font-black">1,284</div>
							<div className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/20">
								<div className="h-full w-[72%] rounded-full bg-cyan-200" />
							</div>
							<div className="mt-1 flex justify-between text-[6px] text-blue-100">
								<span>On route</span>
								<span>72%</span>
							</div>
						</div>
					</div>
					<div className="mt-2 grid grid-cols-3 gap-2">
						{[
							["98.2%", "check-ins"],
							["86", "open shifts"],
							["₹4.2L", "payroll due"],
						].map(([v, l]) => (
							<div key={l} className="rounded-lg bg-white p-2 shadow-sm">
								<div className="text-[10px] font-black text-slate-900">{v}</div>
								<div className="text-[6px] text-slate-400">{l}</div>
							</div>
						))}
					</div>
				</div>
			</GlassCard>
			<LocationBadge />
		</motion.div>
	);
}

export default function HeroSection() {
	return (
		<section
			id="top"
			className="relative overflow-hidden bg-gradient-to-b from-cyan-50 via-white to-white"
		>
			<div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />
			<div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-24">
				<motion.div
					variants={stagger}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true }}
				>
					<motion.div variants={fadeUp}>
						<Eyebrow>THE WORKFORCE OPERATING SYSTEM</Eyebrow>
					</motion.div>
					<motion.h1
						variants={fadeUp}
						className="max-w-xl text-5xl font-black leading-[0.9] tracking-[-0.055em] text-slate-950 sm:text-6xl"
					>
						The workforce
						<br />
						<span className="text-blue-600">operating</span>
						<br />
						system.
					</motion.h1>
					<motion.p
						variants={fadeUp}
						className="mt-5 max-w-md text-[12px] leading-5 text-slate-500"
					>
						One intelligent platform to manage employees, attendance, payroll,
						field operations and workforce performance — in real time.
					</motion.p>
					<motion.div
						variants={fadeUp}
						className="mt-6 flex flex-wrap items-center gap-3"
					>
						<CTA>Start building</CTA>
						<button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[12px] font-bold text-slate-600">
							Explore platform
						</button>
					</motion.div>
					<motion.div
						variants={fadeUp}
						className="mt-5 flex items-center gap-4 text-[7px] font-semibold text-slate-400"
					>
						<span className="flex items-center gap-1.5">
							<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{" "}
							Real-time
						</span>
						<span className="flex items-center gap-1.5">
							<span className="h-1.5 w-1.5 rounded-full bg-blue-500" />{" "}
							Enterprise ready
						</span>
					</motion.div>
				</motion.div>
				<DashboardPreview />
			</div>
		</section>
	);
}
