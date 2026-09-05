import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function Navbar() {
	return (
		<header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
			<div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-5 sm:px-8">
				<a href="#top" className="flex items-center gap-2">
					<span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-[14px] font-black text-white">
						W
					</span>
					<span className="text-[12px] font-black tracking-tight text-slate-950">
						Workforce<span className="text-blue-600">OS</span>
					</span>
				</a>

				<nav className="hidden items-center gap-6 md:flex">
					{[
						"Platform",
						"Workforce",
						"Intelligence",
						"Pricing",
						"Resources",
					].map((item) => (
						<a
							key={item}
							href={`#${item.toLowerCase()}`}
							className="text-[12px] font-semibold text-slate-500 transition-colors hover:text-blue-600"
						>
							{item}
						</a>
					))}
				</nav>

				<div className="flex items-center gap-2">
					<button className="hidden text-[12px] font-bold text-slate-500 sm:block">
						Sign in
					</button>
					<button className="group inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-[12px] font-bold text-white shadow-md shadow-blue-200">
						Get started
						<ArrowUpRight
							size={9}
							className="transition-transform group-hover:translate-x-0.5"
						/>
					</button>
				</div>
			</div>
		</header>
	);
}
