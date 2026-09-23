import React from "react";
import { Routes, Route } from "react-router-dom";
import WorkforceOS from "../WorkforceOS";
import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../components/Login";
import Register from "../components/Register";

const AppRoutes = () => {

	return (
		<Routes>
			<Route path="/" element={<WorkforceOS />} />
			<Route path="/dashboard" element={<Dashboard />} />
			<Route path="/login/:type" element={<Login />} />
			<Route path="/register" element={<Register />} />
		</Routes>
	);
};

export default AppRoutes;
