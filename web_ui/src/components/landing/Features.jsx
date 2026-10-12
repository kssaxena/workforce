import React from "react";
import PlatformSection from "./PlatformSection";
// import OrganizationUnit from "../../pages/dashboard/components/OrganizationUnit";
import StructureSection from "./StructureSection";

const Features = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-950 selection:bg-blue-100 selection:text-blue-700">
      <div className="py-4 px-5 sm:py-16 md:py-10">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Workforce features
          </span>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="max-w-6xl text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl md:text-3xl lg:text-4xl">
            Everything You Need to Manage Your Workforce, All in One Platform.
            <span className="text-blue-600">Workforce</span> for the Future
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base md:text-lg">
            From employee management to attendance, payroll, and workforce
            operations — simplify every workflow with one connected platform.
            Copy heading
          </p>
        </div>
      </div>

      <div className="">
        <PlatformSection />
        <StructureSection />
      </div>
    </div>
  );
};

export default Features;
