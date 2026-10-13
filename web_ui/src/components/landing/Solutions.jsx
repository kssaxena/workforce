import React from "react";
import RealtimeSection from "./RealtimeSection";
import CompaniesSection from "./CompaniesSection";
import WorkforceOperationsSection from "./WorkforceOperationsSection";

const Solutions = () => {
  return (
		<div className="min-h-screen overflow-x-hidden	bg-white font-sans text-slate-950 selection:bg-blue-100	selection:text-blue-700">
			<div className="flex flex-col justify-center items-center py-10 ">
				<div className="mb-5 flex items-center gap-2">
					<span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

					<span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
						Solutions
					</span>
				</div>
				<h1 className="max-w-6xl text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl md:text-3xl lg:text-4xl">
					Smarter Solutions for Every Business.
					{/* <span className="text-blue-600">Every Business.</span> */}
				</h1>

				{/* Description */}
				<p className="mt-5 text-center max-w-3xl text-sm leading-7 text-slate-500 sm:text-base md:text-lg">
					From customer management to sales and daily operations, streamline
					workflows, strengthen customer relationships, and drive business
					growth with solutions tailored to your needs.
				</p>
			</div>

			<RealtimeSection />
			<CompaniesSection />
			<WorkforceOperationsSection />
		</div>
	);
};

export default Solutions;
