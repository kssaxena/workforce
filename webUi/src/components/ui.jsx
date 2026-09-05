import React from "react";
import { motion } from "framer-motion";
import {
	ArrowUpRight,
	Check,
	ChevronRight,
	MapPin,
	Users,
	Clock3,
	WalletCards,
	Activity,
	ShieldCheck,
	Sparkles,
} from "lucide-react";

export const fadeUp = {
	hidden: { opacity: 0, y: 24 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
	},
};

export const stagger = {
	hidden: {},
	show: { transition: { staggerChildren: 0.08 } },
};

export function Section({ children, className = "", id }) {
	return (
		<section id={id} className={`relative overflow-hidden ${className}`}>
			{children}
		</section>
	);
}

export function Eyebrow({ children, light = false }) {
	return (
		<div
			className={`mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] ${light ? "text-cyan-200" : "text-blue-600"}`}
		>
			<span
				className={`h-1 w-1 rounded-full ${light ? "bg-cyan-200" : "bg-blue-600"}`}
			/>
			{children}
		</div>
	);
}

export function Pill({ children, active = false }) {
	return (
		<span
			className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-semibold ${
				active
					? "border-blue-500 bg-blue-600 text-white"
					: "border-slate-200 bg-white text-slate-600"
			}`}
		>
			{children}
		</span>
	);
}

export function CTA({ children = "Get started", dark = false }) {
	return (
		<button
			className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold shadow-lg transition-transform hover:-translate-y-0.5 ${
				dark
					? "bg-white text-blue-700 shadow-white/10"
					: "bg-blue-600 text-white shadow-blue-200"
			}`}
		>
			{children}
			<ArrowUpRight
				size={11}
				className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
			/>
		</button>
	);
}

export function GlassCard({ children, className = "", dark = false }) {
	return (
		<div
			className={`rounded-2xl border shadow-[0_18px_50px_rgba(15,92,180,0.10)] ${
				dark
					? "border-white/15 bg-white/10 backdrop-blur-xl"
					: "border-slate-200/80 bg-white"
			} ${className}`}
		>
			{children}
		</div>
	);
}

export function Stat({ icon: Icon, value, label, trend = "+12%" }) {
	return (
		<GlassCard className="p-3">
			<div className="mb-2 flex items-center justify-between">
				<div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
					<Icon size={12} />
				</div>
				<span className="text-[12px] font-bold text-emerald-500">{trend}</span>
			</div>
			<div className="text-[15px] font-black tracking-tight text-slate-950">
				{value}
			</div>
			<div className="mt-0.5 text-[7px] text-slate-400">{label}</div>
		</GlassCard>
	);
}

export function TinyBars({
	values = [18, 27, 24, 35, 44, 40, 56, 61, 68, 82, 76, 93],
}) {
	return (
		<div className="flex h-24 items-end gap-1.5">
			{values.map((v, i) => (
				<motion.div
					key={i}
					initial={{ height: 0 }}
					whileInView={{ height: `${v}%` }}
					viewport={{ once: true }}
					transition={{ delay: i * 0.035, duration: 0.45 }}
					className={`flex-1 rounded-t-sm ${i > values.length - 5 ? "bg-blue-600" : "bg-blue-200"}`}
				/>
			))}
		</div>
	);
}

export function MiniList({ items, blueLast = false }) {
	return (
		<div className="space-y-2">
			{items.map((item, i) => (
				<div
					key={i}
					className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[12px] ${
						blueLast && i === items.length - 1
							? "border-blue-600 bg-blue-600 text-white"
							: "border-slate-100 bg-white text-slate-600"
					}`}
				>
					<span
						className={`h-5 w-5 shrink-0 rounded-md ${blueLast && i === items.length - 1 ? "bg-white/15" : "bg-blue-50"}`}
					/>
					<span className="flex-1">{item}</span>
					<ChevronRight size={9} className="opacity-50" />
				</div>
			))}
		</div>
	);
}

export function LocationBadge() {
	return (
		<div className="absolute -bottom-3 left-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xl">
			<MapPin size={10} className="text-blue-600" />
			<span className="text-[12px] font-semibold text-slate-600">
				Within 200m geofence
			</span>
			<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
		</div>
	);
}
