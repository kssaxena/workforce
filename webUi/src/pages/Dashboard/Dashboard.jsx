import React, { useState } from "react";
import { FaBars, FaHome, FaSignOutAlt, FaTimes } from "react-icons/fa";
import { dashboardSectionList } from "../../constant/constant";
import Overview from "./DashboardComponent/Overview";
import Designation from "./DashboardComponent/Designation";
import Employee from "./DashboardComponent/Employee";

const Dashboard = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [activeSection, setActiveSection] = useState("");

	return (
		<div className="flex w-full min-h-screen overflow-y-auto">
			{/* ================= SIDEBAR ================= */}
			<aside
				className={`fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-slate-200 bg-white transition-transform duration-300	md:sticky md:translate-x-0	${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
			>
				{/* ASidebar Header */}
				<div className="flex items-center justify-between p-4.5 border-b border-slate-200 bg-white">
					{/* Logo */}
					<a href="#top" className="flex items-center gap-2">
						<span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-[14px] font-black text-white">
							W
						</span>
						<span className="text-[12px] font-black tracking-tight text-slate-950">
							Workforce<span className="text-blue-600">OS</span>
						</span>
					</a>
					{/* Close Button - Mobile Only */}
					<button
						type="button"
						onClick={() => setSidebarOpen(false)}
						className="p-2 text-xl text-slate-600 hover:text-blue-600 md:hidden"
					>
						<FaTimes />
					</button>
				</div>

				{/* Sidebar Content */}
				<div className="flex-1 overflow-y-auto px-4 py-6">
					<p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
						Main Menu
					</p>

					<nav className="space-y-1">
						{dashboardSectionList.map((item, index) => {
							const active = activeSection === item.query;

							return (
								<button
									key={index}
									onClick={() => {
										setActiveSection(item.query);
										setSidebarOpen(false);
									}}
									className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${active ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"}`}
								>
									<span
										className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"}`}
									>
										{item.icon}
									</span>

									<span className="text-sm font-medium">{item.name}</span>
								</button>
							);
						})}
					</nav>

					{/* Quick Links */}
					<p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
						Quick Links
					</p>

					<div className="space-y-1">
						<button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-600 hover:bg-slate-50">
							<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
								<FaHome />
							</span>
							Home
						</button>

						<button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600">
							<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500">
								<FaSignOutAlt />
							</span>
							Logout
						</button>
					</div>
				</div>
				{/*Aside bottom */}
				<div className="border-t border-slate-100 p-4">
					<div className="rounded-xl bg-blue-50 p-4">
						<p className="text-xs font-semibold text-blue-900">Need Help?</p>

						<p className="mt-1 text-[11px] text-blue-600">
							Contact our support team
						</p>

						<button className="mt-3 text-xs font-semibold text-blue-700">
							Get Support →
						</button>
					</div>
				</div>
			</aside>

			{/* ================= OVERLAY ================= */}
			{sidebarOpen && (
				<div
					onClick={() => setSidebarOpen(false)}
					className="fixed inset-0 z-40 bg-black/40 md:hidden"
				/>
			)}

			{/* ================= MAIN CONTENT ================= */}
			<main className="flex min-w-0 flex-1 flex-col">
				{/* Header */}
				<header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white px-4 shadow-sm">
					{/* Hamburger - Mobile */}
					<button
						type="button"
						onClick={() => setSidebarOpen(true)}
						className="rounded-lg p-2 text-xl text-slate-700 hover:bg-slate-100 md:hidden"
					>
						<FaBars />
					</button>

					{/* Desktop Title */}
					<h2 className="hidden text-lg font-semibold text-slate-800 md:block">
						Dashboard
					</h2>

					{/* Right Side */}
					<div className="ml-auto flex items-center gap-3">
						<span className="hidden text-sm text-slate-600 sm:block">
							Welcome, Akanksha
						</span>

						<div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
							A
						</div>
					</div>
				</header>

				{/* Page Content */}
				{activeSection === "overview" && <Overview />}
				{activeSection === "designation" && <Designation />}
				{activeSection === "employee" && <Employee />}
			</main>
		</div>
	);
};

export default Dashboard;
