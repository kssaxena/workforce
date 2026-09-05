import React from "react";
import { motion } from "framer-motion";
import {
	CalendarDays,
	FileSpreadsheet,
	MessageSquare,
	WalletCards,
} from "lucide-react";
import { Eyebrow, GlassCard } from "./ui";

const nodes = [
	{ icon: CalendarDays, title: "Attendance", x: "left-0 top-1" },
	{ icon: FileSpreadsheet, title: "Payroll", x: "right-0 top-1" },
	{ icon: MessageSquare, title: "Communication", x: "left-4 bottom-1" },
	{ icon: WalletCards, title: "Expenses", x: "right-4 bottom-1" },
];

export default function FragmentedSection() {
	return (
		<section className="border-y border-slate-100 bg-slate-50/70">
			<div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-14 sm:px-8 md:grid-cols-[0.9fr_1.1fr]">
				<div>
					<Eyebrow>THE PROBLEM</Eyebrow>
					<h2 className="max-w-sm text-4xl font-black leading-[0.95] tracking-[-0.04em] text-slate-950">
						Managing a workforce is{" "}
						<span className="text-blue-600">still fragmented.</span>
					</h2>
					<p className="mt-4 max-w-sm text-[12px] leading-5 text-slate-500">
						Teams bounce between spreadsheets, attendance tools, payroll systems
						and disconnected field apps. WorkforceOS brings every operational
						layer into one system.
					</p>
				</div>

				<div className="relative mx-auto h-60 w-full max-w-md">
					<div className="absolute inset-8 rounded-full border border-dashed border-blue-200" />
					<div className="absolute inset-16 rounded-full bg-blue-50 shadow-inner" />
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
						className="absolute inset-10 rounded-full border border-blue-100 border-dashed"
					/>
					<div className="absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-blue-200 bg-cyan-100 text-center text-[10px] font-black text-blue-700 shadow-xl">
						ONE
						<br />
						WORKFORCE
					</div>
					{nodes.map(({ icon: Icon, title, x }) => (
						<div
							key={title}
							className={`absolute ${x} flex w-44 items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg`}
						>
							<span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
								<Icon size={12} />
							</span>
							<span className="text-[14px] font-bold text-slate-700">
								{title}
							</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
