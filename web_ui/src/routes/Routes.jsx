import { Route, Routes } from "react-router-dom";

import WorkforceOS from "../pages/landing/WorkforceOS.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";

import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
// import Dashboard from "../pages/dashboard/Dashboard.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      {/* =========================
          PUBLIC
      ========================= */}

      <Route path="/" element={<WorkforceOS />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route path="/login/:type" element={<LoginPage />} />

      {/* =========================
          PROTECTED
      ========================= */}

      <Route element={<ProtectedRoute />}>
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
