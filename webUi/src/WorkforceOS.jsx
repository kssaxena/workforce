import React from "react";
import { motion } from "framer-motion";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FragmentedSection from "./components/FragmentedSection";
import PlatformSection from "./components/PlatformSection";
import RealtimeSection from "./components/RealtimeSection";
import WorkforceOperationsSection from "./components/WorkforceOperationsSection";
import StructureSection from "./components/StructureSection";
import IntelligenceSection from "./components/IntelligenceSection";
import CompaniesSection from "./components/CompaniesSection";
import ClosingSection from "./components/ClosingSection";

export default function WorkforceOS() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-950 selection:bg-blue-100 selection:text-blue-700">
      <Navbar />
      <main>
        <HeroSection />
        <FragmentedSection />
        <PlatformSection />
        <RealtimeSection />
        <WorkforceOperationsSection />
        <StructureSection />
        <IntelligenceSection />
        <CompaniesSection />
        <ClosingSection />
      </main>
    </div>
  );
}
