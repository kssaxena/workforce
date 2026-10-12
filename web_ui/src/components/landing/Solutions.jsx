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
						Workforce Solutions
					</span>
				</div>
				<h1 className="max-w-5xl text-2xl font-extrabold leading-[1.15] tracking-tight text-slate-950 sm:text-4xl md:text-5xl lg:text-[52px] text-center">
					Smarter Workforce Solutions for{" "}
					<span className="text-blue-600">Every Business.</span>
				</h1>

				{/* Description */}
				<p className="mt-5 text-center max-w-3xl text-sm leading-7 text-slate-500 sm:text-base md:text-lg">
					From office teams to distributed workforces, simplify operations,
					improve visibility, and empower your people with solutions built for
					the way your business works.
				</p>
			</div>

			<RealtimeSection />
            <CompaniesSection/>
			<WorkforceOperationsSection/>
		</div>
	);
};

export default Solutions;
