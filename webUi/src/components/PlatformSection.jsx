import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	BriefcaseBusiness,
	CalendarCheck2,
	CircleDollarSign,
	MapPinned,
	UserRoundCog,
	UsersRound,
} from "lucide-react";
import { CTA, Eyebrow, GlassCard, MiniList } from "./ui";

const features = [
	[
		"Employee Management",
		UsersRound,
		"Build a clean employee directory with roles, departments, managers, documents and lifecycle actions.",
	],
	[
		"Attendance & Leave",
		CalendarCheck2,
		"Capture attendance, leave, shifts and policy rules in one operational layer.",
	],
	[
		"Field Workforce",
		MapPinned,
		"Track field teams, locations, routes, jobs and geofenced attendance from one live view.",
	],
	[
		"Payroll & Expenses",
		CircleDollarSign,
		"Connect attendance, compensation, reimbursements and payroll-ready calculations.",
	],
	[
		"Roles & Hierarchy",
		UserRoundCog,
		"Model reporting structures, permissions and organization-wide access.",
	],
	[
		"Workforce Operations",
		BriefcaseBusiness,
		"Bring day-to-day workforce activity, approvals and workflows into one platform.",
	],
];

export default function PlatformSection() {
	const [active, setActive] = useState(0);
	const [title, Icon, description] = features[active];

	return (
		<section id="platform" className="bg-white">
			<div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
				<div className="mb-10">
					<Eyebrow>THE PLATFORM</Eyebrow>
					<h2 className="text-4xl font-black tracking-[-0.04em] text-slate-950">
						One platform. Every workforce workflow.
					</h2>
					<p className="mt-3 max-w-xl text-[12px] leading-5 text-slate-500">
						A modular workforce operating system designed to work across
						offices, stores, factories and distributed field teams.
					</p>
				</div>

				<div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
					<div className="space-y-1.5">
						{features.map(([name, Icon], i) => (
							<button
								key={name}
								onClick={() => setActive(i)}
								className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all ${
									active === i
										? "border-blue-200 bg-cyan-50 shadow-sm"
										: "border-slate-100 bg-white hover:border-blue-100"
								}`}
							>
								<span
									className={`flex h-7 w-7 items-center justify-center rounded-lg ${active === i ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"}`}
								>
									<Icon size={12} />
								</span>
								<span className="flex-1 text-[12px] font-bold text-slate-700">
									{name}
								</span>
								<span className="text-[7px] text-slate-300">
									{String(i + 1).padStart(2, "0")}
								</span>
							</button>
						))}
					</div>

					<AnimatePresence mode="wait">
						<motion.div
							key={title}
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.3 }}
						>
							<GlassCard className="relative min-h-[330px] overflow-hidden border-blue-500 bg-blue-600 p-6 text-white shadow-[0_30px_70px_rgba(37,99,235,.28)]">
								<div className="absolute right-[-50px] top-[-60px] h-48 w-48 rounded-full border border-white/10" />
								<div className="absolute right-[-20px] top-[-30px] h-32 w-32 rounded-full border border-white/10" />
								<div className="relative">
									<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
										<Icon size={16} />
									</div>
									<div className="mt-5 text-[20px] text-black font-semibold tracking-tight">
										{title}
									</div>
									<p className="mt-2 max-w-md text-[9px] leading-5 text-blue-500">
										{description}
									</p>
									<div className="mt-7 grid grid-cols-2 gap-2">
										{[
											"Real-time data",
											"Configurable rules",
											"Role-based access",
											"Automated workflows",
										].map((x) => (
											<div
												key={x}
												className="flex items-center gap-2 rounded-lg border border-white/10 bg-blue-600 p-2.5 text-[10px] font-semibold"
											>
												<span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10">
													<span className="h-1.5 w-1.5 rounded-full bg-cyan-200" />
												</span>
												{x}
											</div>
										))}
									</div>
									<div className="mt-7">
										<CTA dark>Explore module</CTA>
									</div>
								</div>
							</GlassCard>
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
		</section>
	);
}
