import React from "react";
import HeroSection from "./HeroSection";
import IntelligenceSection from "./IntelligenceSection";

const About = () => {
  return (
		<div className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-950 selection:bg-blue-100 selection:text-blue-700">
			<div className="py-4 px-5 sm:py-16 md:py-10">
				<div className="mb-6 flex items-center justify-center gap-2">
					<span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

					<span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
						About
					</span>
				</div>

				<div className="flex flex-col items-center justify-center text-center">
					<h1 className="max-w-6xl text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl md:text-3xl lg:text-4xl">
						Empowering People. Simplifying Business.
						{/* <span className="text-blue-600">Workforce</span> for the Future */}
					</h1>

					<p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base md:text-lg">
						Our intuitive SaaS platform helps businesses streamline operations,
						improve efficiency, simplify compliance, and achieve sustainable
						growth through smarter digital solutions.
					</p>

					<button
						type="button"
						className="mt-7 rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100"
					>
						Start Your Free Trial
					</button>
				</div>
			</div>

			<div>
				<IntelligenceSection />
			</div>
		</div>
	);
};

export default About;
