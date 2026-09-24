import React, { useState } from "react";
import { FaBars, FaHome, FaSignOutAlt, FaTimes } from "react-icons/fa";

import { dashboardSectionList } from "../../constant/constant";

import Overview from "./DashboardComponent/Overview";
import Designation from "./DashboardComponent/Employee";
import EmployeeProfile from "./DashboardComponent/EmployeeProfile";
import Employee from "./DashboardComponent/Employee";
import Payroll from "./DashboardComponent/Payroll";
import Access from "./DashboardComponent/Access";
import Attendance from "./DashboardComponent/Attendance";

const Dashboard = (data) => {
	const role = localStorage.getItem("role") || "company";

	const [sidebarOpen, setSidebarOpen] = useState(false);

	const [activeSection, setActiveSection] = useState(
		() => localStorage.getItem("activeSection") || "overview",
	);
	const [selectedEmployee, setSelectedEmployee] = useState(null);

	const handleSectionClick = (query) => {
		localStorage.setItem("activeSection", query);
		setActiveSection(query);
		setSidebarOpen(false);
	};

	const handleLogout = () => {
		localStorage.removeItem("role");
		localStorage.removeItem("activeSection");
	};

	return (
		<div className="flex min-h-screen w-full overflow-y-auto bg-slate-50">
			{/* sidebar */}

			<aside
				className={`fixed left-0 top-0 z-50	flex h-screen w-[280px] flex-col  border-slate-200m bg-white transition-transform duration-300 md:sticky md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
			>
				{/* sidebar header */}

				<div className="flex items-center justify-between border-b border-slate-200 bg-white p-4">
					{/* Logo */}

					<a href="#top" className="flex items-center gap-2">
						<span className="flex h-8 w-7 items-center justify-center rounded-md bg-blue-600 text-[14px] font-black text-white">
							W
						</span>

						<span className="text-[12px] font-black tracking-tight text-slate-950">
							Workforce
							<span className="text-blue-600">OS</span>
						</span>
					</a>

					{/* Mobile Close */}

					<button
						type="button"
						onClick={() => setSidebarOpen(false)}
						className="p-2 text-xl text-slate-600 hover:text-blue-600 md:hidden"
					>
						<FaTimes />
					</button>
				</div>

				{/* sidebar content */}

				<div className="flex-1 overflow-y-auto px-4 py-6">
					<p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
						Main Menu
					</p>

					{/* Navigation */}

					<nav className="space-y-1">
						<ul className="flex flex-col gap-2">
							{dashboardSectionList.map((item, index) => {
								// Role check
								if (!item.roles?.includes(role)) {
									return null;
								}
								// Current active item
								const isActive = activeSection === item.query;

								return (
									<li key={item.query || index}>
										<button
											type="button"
											onClick={() => handleSectionClick(item.query)}
											className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200
												${
													isActive
														? "bg-blue-50 text-blue-600 shadow-sm"
														: "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
												}
											`}
										>
											{/* Icon */}

											<span
												className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
													${
														isActive
															? "bg-blue-600 text-white"
															: "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
													}
												`}
											>
												{item.icon}
											</span>

											{/* Name */}

											<span className="text-sm font-medium">{item.name}</span>
										</button>
									</li>
								);
							})}
						</ul>
					</nav>

					{/* quick links */}

					<p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
						Quick Links
					</p>

					<div className="space-y-1">
						{/* Home */}

						<button
							type="button"
							onClick={() => {
								window.location.href = "/";
							}}
							className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-600 hover:bg-slate-50"
						>
							<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
								<FaHome />
							</span>
							Home
						</button>

						{/* Logout */}

						<button
							type="button"
							onClick={handleLogout}
							className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600"
						>
							<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500">
								<FaSignOutAlt />
							</span>
							Logout
						</button>
					</div>
				</div>

				{/* =================================================
					SIDEBAR BOTTOM
				================================================= */}

				<div className="border-t border-slate-100 p-4">
					<div className="rounded-xl bg-blue-50 p-4">
						<p className="text-xs font-semibold text-blue-900">Need Help?</p>

						<p className="mt-1 text-[11px] text-blue-600">
							Contact our support team
						</p>

						<button
							type="button"
							className="mt-3 text-xs font-semibold text-blue-700"
						>
							Get Support →
						</button>
					</div>
				</div>
			</aside>
			{/* mobile Overlay */}

			{sidebarOpen && (
				<div
					onClick={() => setSidebarOpen(false)}
					className="fixed inset-0 z-40 bg-black/40 md:hidden"
				/>
			)}

			{/* Main content */}

			<main className="flex min-w-0 flex-1 flex-col">
				{/* Main header */}

				<header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white px-4 shadow-sm">
					{/* Mobile Menu */}

					<button
						type="button"
						onClick={() => setSidebarOpen(true)}
						className="rounded-lg p-2 text-xl text-slate-700 hover:bg-slate-100 md:hidden"
					>
						<FaBars />
					</button>

					{/* Desktop Title */}

					{/* <h2 className="hidden text-lg font-semibold capitalize text-slate-800 md:block">
						{activeSection}
					</h2> */}

					{/* User */}

					<div className="ml-auto flex items-center gap-3">
						<div className="h-9 w-9 overflow-hidden rounded-full bg-blue-600 ring-4 ring-blue-50">
							{data.profileImage ? (
								<img
									src={profileImage}
									alt={`${name} profile`}
									className="h-full w-full object-cover"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
									{data.name?.charAt(0)?.toUpperCase()}
								</div>
							)}
						</div>
					</div>
				</header>

				{/* =================================================
					PAGE CONTENT
				================================================= */}

				<div className="min-w-0 flex-1">
					{activeSection === "access" && <Access />}
					{activeSection === "attendance" && <Attendance />}
					{activeSection === "analytics" && (
						<Overview
							onViewEmployee={() => {
								setActiveSection("employee");
							}}
						/>
					)}
					{activeSection === "employee" && (
						<Employee
							onViewEmployeeProfile={(employee) => {
								setSelectedEmployee(employee);
								setActiveSection("employeeProfile");
							}}
						/>
					)}

					{activeSection === "employeeProfile" && selectedEmployee && (
						<EmployeeProfile data={selectedEmployee} />
					)}

					{activeSection === "payroll" && <Payroll />}
				</div>
			</main>
		</div>
	);
};

export default Dashboard;
