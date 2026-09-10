import React from "react";
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

const Overview = (data) => {
	return (
		<div className="w-full h-full overflow-y-auto">
			<section className="p-4 sm:p-6 lg:p-8">
				{/* Greeting */}
				<div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<p className="text-sm text-slate-400">Monday, 8 September 2026</p>

						<h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
							Good Morning, {data.name}!
						</h1>

						<p className="mt-1 text-sm text-slate-500">
							Here's what's happening with your meetings today.
						</p>
					</div>

					<button className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
						<FaCalendarAlt />
						Book a Meeting
					</button>
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

									<h3 className="mt-2 text-2xl font-bold text-slate-900">
										{stat.value}
									</h3>
								</div>

								<div
									className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}
								>
									{stat.icon}
								</div>
							</div>

							<div className="mt-4 flex items-center gap-2">
								<span className="flex items-center gap-1 text-xs font-semibold text-green-600">
									<FaArrowUp className="text-[9px]" />
									{stat.change}
								</span>

								<span className="text-[11px] text-slate-400">
									vs. last week
								</span>
							</div>
						</div>
					))}
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

						{/* CSS Chart */}
						<div className="mt-8 flex h-56 items-end gap-3 border-b border-slate-100 px-2 sm:gap-6">
							{[
								["Mon", "45%"],
								["Tue", "58%"],
								["Wed", "72%"],
								["Thu", "61%"],
								["Fri", "84%"],
								["Sat", "52%"],
								["Sun", "68%"],
							].map(([day, height]) => (
								<div
									key={day}
									className="flex h-full flex-1 flex-col justify-end"
								>
									<div
										className="w-full rounded-t-xl bg-blue-500 transition hover:bg-blue-600"
										style={{ height }}
									/>

									<p className="py-3 text-center text-[10px] text-slate-400">
										{day}
									</p>
								</div>
							))}
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

				{/* ================= RECENT ACTIVITY ================= */}
				<div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="font-bold text-slate-900">Recent Activity</h2>

							<p className="mt-1 text-xs text-slate-400">
								Latest meetings and activities
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
									<th className="px-4 py-3">Date & Time</th>
									<th className="px-4 py-3">Client</th>
									<th className="px-4 py-3">Event</th>
									<th className="px-4 py-3">Status</th>
									<th className="px-4 py-3">Action</th>
								</tr>
							</thead>

							<tbody>
								{recentActivity.map((item) => (
									<tr
										key={`${item.date}-${item.client}`}
										className="border-b border-slate-100 last:border-0"
									>
										<td className="px-4 py-4 text-xs text-slate-500">
											{item.date}
										</td>

										<td className="px-4 py-4">
											<div className="flex items-center gap-2">
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
													{item.client.charAt(0)}
												</div>

												<span className="text-xs font-semibold text-slate-700">
													{item.client}
												</span>
											</div>
										</td>

										<td className="px-4 py-4 text-xs text-slate-500">
											{item.event}
										</td>

										<td className="px-4 py-4">
											<span
												className={`
														rounded-full px-3 py-1 text-[10px] font-semibold
														${
															item.status === "Completed"
																? "bg-green-50 text-green-600"
																: "bg-blue-50 text-blue-600"
														}
													`}
											>
												{item.status}
											</span>
										</td>

										<td className="px-4 py-4">
											<button className="text-slate-400 hover:text-blue-600">
												<FaChevronRight />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
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
