import ClosingSection from "../../components/landing/ClosingSection";
import CompaniesSection from "../../components/landing/CompaniesSection";
import IntelligenceSection from "../../components/landing/IntelligenceSection";
import StructureSection from "../../components/landing/StructureSection";
import FragmentedSection from "../../components/landing/FragmentedSection";
import HeroSection from "../../components/landing/HeroSection";
import PlatformSection from "../../components/landing/PlatformSection";
import RealtimeSection from "../../components/landing/RealtimeSection";
import WorkforceOperationsSection from "../../components/landing/WorkforceOperationsSection";
import Navbar from "../../components/layout/Navbar";

const WorkforceOS = () => {
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
};

export default WorkforceOS;
