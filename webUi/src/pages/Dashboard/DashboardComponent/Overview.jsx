import React, { useState } from "react";
import Button from "../../../components/Button";
import {
	FaCalendarAlt,
	FaUsers,
	FaChartLine,
	FaUser,
	FaArrowUp,
	FaChevronRight,
} from "react-icons/fa";

import { stats, meetings, recentActivity } from "../../../constant/constant";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Tooltip,
	Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import InputBox from "../../../components/Input";
import EmployeeProfile from "./EmployeeProfile";

const Overview = (data) => {
	const [totalEmployee, setTotalEmployee] = useState(null);
	const [presentToday, setPresentToday] = useState(null);
	const [onLeave, setOnLeave] = useState(null);
	const absent = totalEmployee-presentToday;
	const lateEntryEmployee = absent - onLeave;
	const [viewEmployeeProfile, setViewEmployeeProfile] = useState(false);
	const [activeSection, setActiveSection] =  useState(false);

	ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

	return (
		<div className="w-full h-full overflow-y-auto">
			<section className="p-6 lg:p-8">
				{/* Greeting */}
				<div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<p className="text-sm text-slate-400">Monday, 8 September 2026</p>

						<h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
							Good Morning, {data.name || "Akanksha"}!
						</h1>

						<p className="mt-1 text-sm text-slate-500">
							Here's what's happening with your Workforce today.
						</p>
					</div>
				</div>
				<div className="flex justify-start items-center mb-4 gap-4">
					<input
						onChange={(e) => setTotalEmployee(e.target.value)}
						type="text"
						placeholder="Enter total employee value"
						className="text-[10px] placeholder:text-black p-4 w-56 h-6 bg-blue-100 rounded-lg border-slate-100  "
					/>
					<input
						onChange={(e) => setPresentToday(e.target.value)}
						type="text"
						placeholder="Enter present employee value"
						className="text-[10px] placeholder:text-black p-4  w-56 h-6 bg-blue-100 rounded-lg border-slate-100  "
					/>
					<input
						onChange={(e) => setOnLeave(e.target.value)}
						type="text"
						placeholder="Enter present employee value"
						className="text-[10px] placeholder:text-black p-4  w-56 h-6 bg-blue-100 rounded-lg border-slate-100  "
					/>
					
				</div>

				{/* ================= STATS ================= */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{stats.map((stat) => (
						<div
							key={stat.title}
							className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
						>
							<div className="flex items-start justify-between">
								<div>
									<p className="text-xs font-medium text-slate-500">
										{stat.title}
									</p>

									<h3 className="mt-2 text-2xl font-bold text-slate-900 ">
										{stat.id === 1 ? totalEmployee : ""}
										{stat.id === 2 ? (
											<div className="text-green-800">{presentToday}</div>
										) : (
											""
										)}
										{stat.id === 3 ? (
											<div className="text-yellow-800">{onLeave}</div>
										) : (
											""
										)}
										{stat.id === 4 ? (
											<div className="text-green-800">{lateEntryEmployee}</div>
										) : (
											""
										)}
									</h3>
								</div>

								<div
									className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}
								>
									{stat.icon}
								</div>
							</div>

							<div className="mt-4 flex justify-between items-center gap-2">
								<div className="flex gap-1 items-center">
									<span className="flex items-center gap-1 text-xs font-semibold text-green-600">
										{/* <FaArrowUp className="text-[9px]" /> */}
										{stats.change}
										{stat.id === 2 ? (
											<div className="text-red-700">{absent}</div>
										) : (
											""
										)}
									</span>

									<span className="text-[11px] text-slate-400">
										{stat.id === 2 ? (
											<div className="text-slate-700">Absent</div>
										) : (
											""
										)}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Total Employee */}
				<div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="font-bold text-slate-900">Total Employees</h2>

							<p className="mt-1 text-xs text-slate-400">
								Manage your employees
							</p>
						</div>

						<button className="text-xs font-semibold text-blue-600">
							View All →
						</button>
					</div>

					<div className="mt-5 overflow-x-auto">
						<table className="w-full min-w-[700px] text-left">
							<thead>
								<tr className="border-y border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
									<th className="px-4 py-3">Serial Number</th>
									<th className="px-4 py-3">Name</th>
									<th className="px-4 py-3">Designation</th>
									<th className="px-4 py-3">present/Absent</th>
									<th className="px-4 py-3">Action</th>
								</tr>
							</thead>

							<tbody>
								{recentActivity.map((item) => (
									<tr
										key={`${item.serialNumber}-${item.name}`}
										className="border-b border-slate-100 last:border-0"
									>
										<td className="px-4 py-4 text-xs text-slate-500">
											{item.serialNumber}
										</td>

										<td className="px-4 py-4">
											<div className="flex items-center gap-2">
												{/* <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
													{item.name.charAt(0)}
												</div> */}

												<span className="text-xs font-semibold text-slate-700">
													{item.name}
												</span>
											</div>
										</td>

										<td className="px-4 py-4 text-xs text-slate-500">
											{item.designation}
										</td>

										<td className="px-4 py-4">
											<span
												className={`
														rounded-full px-3 py-1 text-[10px] font-semibold
														${
															item.status === "Present"
																? "bg-green-50 text-green-600"
																: "bg-blue-50 text-red-600"
														}
													`}
											>
												{item.status}
											</span>
										</td>

										<td className="px-4 py-4">
											<button onClick={() => setViewEmployeeProfile(true)}
											 className="flex gap-1 text-sm justify-center items-center text-slate-400 hover:text-blue-600">
												View
												<FaChevronRight />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						
					</div>
				</div>

				{/* ================= GRID ================= */}
				<div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
					{/* Meetings Chart */}
					<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="font-bold text-slate-900">
									Meetings & Appointments
								</h2>

								<p className="mt-1 text-xs text-slate-400">
									Weekly overview of your meetings
								</p>
							</div>

							<select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none">
								<option>This Week</option>
								<option>Last Week</option>
								<option>This Month</option>
							</select>
						</div>

						{/* Bar Chart */}
						<div className="mt-8 h-56">
							<Bar
								data={{
									labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],

									datasets: [
										{
											label: "Attendance",
											data: [45, 58, 72, 61, 84, 52, 68],

											backgroundColor: "#3b82f6",
											hoverBackgroundColor: "#2563eb",

											borderRadius: 8,

											borderSkipped: false,
										},
									],
								}}
								options={{
									responsive: true,

									maintainAspectRatio: false,

									plugins: {
										legend: {
											display: false,
										},

										tooltip: {
											callbacks: {
												label: function (context) {
													return `${context.raw}%`;
												},
											},
										},
									},

									scales: {
										x: {
											grid: {
												display: false,
											},

											border: {
												display: false,
											},

											ticks: {
												color: "#94a3b8",
												font: {
													size: 10,
												},
											},
										},

										y: {
											beginAtZero: true,

											max: 100,

											ticks: {
												stepSize: 20,

												color: "#94a3b8",

												font: {
													size: 10,
												},

												callback: function (value) {
													return `${value}%`;
												},
											},

											grid: {
												color: "#f1f5f9",
											},

											border: {
												display: false,
											},
										},
									},
								}}
							/>
						</div>
					</div>

					{/* Upcoming Meetings */}
					<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
									<FaCalendarAlt />
								</div>

								<div>
									<h2 className="font-bold text-slate-900">
										Upcoming Meetings
									</h2>

									<p className="text-[10px] text-slate-400">Your schedule</p>
								</div>
							</div>

							<button className="text-xs font-semibold text-blue-600">
								View All →
							</button>
						</div>

						<div className="mt-5 divide-y divide-slate-100">
							{meetings.map((meeting) => (
								<div key={meeting.title} className="flex gap-3 py-4">
									<div
										className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${meeting.color}`}
									/>

									<div className="min-w-0">
										<p className="text-[11px] text-slate-400">{meeting.time}</p>

										<h3 className="mt-1 text-xs font-bold text-slate-800">
											{meeting.title}
										</h3>

										<p className="mt-1 text-[10px] text-slate-400">
											{meeting.person} • {meeting.type}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* ================= QUICK ACTIONS ================= */}
				<div className="mt-6">
					<h2 className="mb-4 text-lg font-bold text-slate-900">
						Quick Actions
					</h2>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{[
							{
								title: "Book a Meeting",
								description: "Schedule a new meeting",
								icon: <FaCalendarAlt />,
							},
							{
								title: "View Calendar",
								description: "Check your schedule",
								icon: <FaCalendarAlt />,
							},
							{
								title: "View Reports",
								description: "See your performance",
								icon: <FaChartLine />,
							},
							{
								title: "Update Profile",
								description: "Manage your information",
								icon: <FaUser />,
							},
						].map((item) => (
							<button
								key={item.title}
								className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
							>
								<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
									{item.icon}
								</div>

								<div className="min-w-0 flex-1">
									<p className="text-xs font-bold text-slate-800">
										{item.title}
									</p>

									<p className="mt-1 text-[10px] text-slate-400">
										{item.description}
									</p>
								</div>

								<FaChevronRight className="text-xs text-slate-300 group-hover:text-blue-600" />
							</button>
						))}
					</div>
				</div>
			</section>
		</div>
	);
};

export default Overview;
