import { Route, Routes } from "react-router-dom";

import WorkforceOS from "../pages/landing/WorkforceOS.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";

import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
import Dashboard from "../pages/dashboard/Dashboard.jsx";
import About from "../components/landing/About.jsx";
import Features from "../components/landing/Features.jsx";
import Solutions from "../components/landing/Solutions.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import ClosingSection from "../components/landing/ClosingSection.jsx";
import Footer from "../components/layout/Footer.jsx";

const AppRoutes = () => {
  const hideRoutes = ["/dashboard", "/dashboard"];
  const hideFooter = hideRoutes.includes(location.pathname);
  // const hideHeader = hideRoutes.includes(location.pathname);

  return (
    <div>
      <Navbar />
      <Routes>
        {/* =========================
          PUBLIC
      ========================= */}

        <Route path="/" element={<WorkforceOS />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login/:type" element={<LoginPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/solutions" element={<Solutions />} />

        {/* =========================
          PROTECTED
      ========================= */}

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default AppRoutes;
