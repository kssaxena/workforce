import React from "react";
import { ArrowUpRight, Building2, CheckCircle2, Globe2 } from "lucide-react";
import { CTA, Eyebrow, GlassCard, Pill } from "./ui";

const industries = [
	"Retail",
	"Healthcare",
	"Manufacturing",
	"Logistics",
	"Hospitality",
	"Field Services",
];

export default function CompaniesSection() {
	return (
		<section id="pricing" className="bg-blue-600 text-white">
			<div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
				<div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
					<div>
						<Eyebrow light>BUILT TO SCALE</Eyebrow>
						<h2 className="text-4xl font-black leading-[0.95] tracking-[-0.05em]">
							One platform.
							<br />
							Thousands of companies.
						</h2>
						<p className="mt-4 max-w-md text-[10px] leading-5 text-blue-100">
							Start with the core HRMS and grow into workforce operations,
							intelligence and AI as the organization scales.
						</p>
						<div className="mt-6">
							<CTA dark>Build your workforce</CTA>
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-3">
						{[
							["Startups", "Simple, fast, configurable", "From first hire"],
							["Growth", "Multi-team operations", "Across locations"],
							["Enterprise", "Governance + intelligence", "At scale"],
						].map(([title, sub, desc]) => (
							<GlassCard key={title} dark className="p-4">
								<div className="flex items-center justify-between">
									<Building2 size={14} />
									<ArrowUpRight size={11} />
								</div>
								<div className="mt-8 text-[13px] font-black">{title}</div>
								<div className="mt-1 text-[8px] text-blue-100">{sub}</div>
								<div className="mt-5 border-t border-white/10 pt-3 text-[7px] text-blue-100">
									{desc}
								</div>
							</GlassCard>
						))}
					</div>
				</div>

				<div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
					<div className="grid items-center gap-5 md:grid-cols-[1fr_auto]">
						<div>
							<div className="text-[7px] font-bold uppercase tracking-[.18em] text-cyan-200">
								ONE SYSTEM, MANY INDUSTRIES
							</div>
							<div className="mt-2 text-[14px] font-black">
								A workforce layer that adapts to the business.
							</div>
							<div className="mt-3 flex flex-wrap gap-1.5">
								{industries.map((x) => (
									<span
										key={x}
										className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[7px] font-semibold"
									>
										{x}
									</span>
								))}
							</div>
						</div>
						<div className="grid grid-cols-2 gap-2">
							<div className="rounded-xl bg-white/10 p-3">
								<div className="text-[17px] font-black">99.9%</div>
								<div className="text-[7px] text-blue-100">
									platform availability
								</div>
							</div>
							<div className="rounded-xl bg-white/10 p-3">
								<div className="text-[17px] font-black">24/7</div>
								<div className="text-[7px] text-blue-100">
									workforce visibility
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
