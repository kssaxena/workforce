import React from "react";
import {
	FaBriefcase,
	FaCalendarAlt,
	FaChevronRight,
	FaEnvelope,
	FaIdBadge,
	FaMapMarkerAlt,
	FaPhone,
	FaUser,
	FaUserAlt,
	FaAddressBook,
} from "react-icons/fa";
import Button from "../../../components/Button";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const EmployeeProfile = ({ data = {} }) => {
	// Employee data
	const {
		name = data.name || "Rahul Sharma",
		gender = data.gender || "Male",
		profileImage = "",
		status = "Active",
		designation = data.designation || "Sales Executive",
		department = data.department || "Sales Department",
		employeeId = data.employeeId || "EMP-1024",
		joiningDate = data.joiningDate || "15 Sep 2023",
		manager = data.manager || "Amit Kumar",
		managerDesignation = data.managerDesignation || "Manager",
		managerImage = "",
		phone = data.phone || "12345678",
		email = data.email || "12345678@gmail.com",
		location = data.location || "Noida, Uttar Pradesh",
	} = data;

	const performanceData = {
		labels: ["Completed", "In Progress", "Pending", "Overdue"],

		datasets: [
			{
				data: [
					data.completed || 0,
					data.inProgress || 0,
					data.pending || 0,
					data.overdue || 0,
				],

				backgroundColor: [
					"rgb(34, 197, 94)",
					"rgb(59, 130, 246)",
					"rgb(234, 179, 8)",
					"rgb(239, 68, 68)",
				],

				borderWidth: 0,
				hoverOffset: 6,
			},
		],
	};

	const options = {
		responsive: true,

		plugins: {
			legend: {
				position: "bottom",
				labels: {
					padding: 20,
					usePointStyle: true,
				},
			},
		},

		cutout: "65%",
	};

	// Status styling
	const statusStyle =
		{
			active: "bg-green-100 text-green-700",
			inactive: "bg-red-100 text-red-700",
			deactivated: "bg-yellow-100 text-yellow-700",
		}[status?.toLowerCase()] || "bg-slate-100 text-slate-700";

	return (
		<div className="w-full p-4 space-y-6">
			<section className="w-full rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
				<div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr_auto] xl:items-center">
					{/* PROFILE + EMPLOYEE INFORMATION */}

					<div className="flex flex-col gap-5 sm:flex-row sm:items-center">
						{/* Profile Image + Status */}

						<div className="flex shrink-0 flex-col items-center gap-2">
							<div className="h-24 w-24 overflow-hidden rounded-full bg-blue-600 ring-4 ring-blue-50">
								{profileImage ? (
									<img
										src={profileImage}
										alt={`${name} profile`}
										className="h-full w-full object-cover"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
										{name?.charAt(0)?.toUpperCase()}
									</div>
								)}
							</div>

							{/* Status */}

							<div
								className={`flex h-7 items-center gap-2 rounded-full px-3 text-xs font-semibold ${statusStyle}`}
							>
								<span
									className={`h-2 w-2 rounded-full ${
										status?.toLowerCase() === "active"
											? "bg-green-600"
											: status?.toLowerCase() === "inactive"
												? "bg-red-600"
												: "bg-yellow-500"
									}`}
								/>

								<span>{status}</span>
							</div>
						</div>

						{/* Employee Information */}

						<div className="min-w-0 flex-1">
							{/* Name */}

							<h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
								{name}
							</h1>

							{/* Designation */}

							<p className="mt-1 text-sm font-medium text-blue-600">
								{designation}
							</p>

							{/* Department */}

							<div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
								<FaBriefcase className="shrink-0 text-blue-600" />

								<span className="truncate">{department}</span>
							</div>

							{/* Employee Meta */}

							<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
								{/* Employee ID */}

								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
										<FaIdBadge className="text-sm text-blue-600" />
									</div>

									<div className="min-w-0">
										<p className="text-[11px] font-medium text-slate-400">
											Employee ID
										</p>

										<p className="truncate text-sm font-semibold text-slate-700">
											{employeeId}
										</p>
									</div>
								</div>

								{/* Joining Date */}

								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
										<FaCalendarAlt className="text-sm text-blue-600" />
									</div>

									<div className="min-w-0">
										<p className="text-[11px] font-medium text-slate-400">
											Joining Date
										</p>

										<p className="truncate text-sm font-semibold text-slate-700">
											{joiningDate}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					{/* CONTACT INFORMATION */}

					<div className="border-t border-slate-100 pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
						<div className="flex flex-col gap-4">
							{/* Phone */}

							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
									<FaPhone className="text-xs text-blue-600" />
								</div>

								<div className="min-w-0">
									<p className="text-[11px] font-medium text-slate-400">
										Phone
									</p>

									<p className="truncate text-sm font-medium text-slate-700">
										{phone}
									</p>
								</div>
							</div>

							{/* Email */}

							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
									<FaEnvelope className="text-xs text-blue-600" />
								</div>

								<div className="min-w-0">
									<p className="text-[11px] font-medium text-slate-400">
										Email
									</p>

									<p className="break-all text-sm font-medium text-slate-700">
										{email}
									</p>
								</div>
							</div>

							{/* Location */}

							<div className="flex items-start gap-3">
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
									<FaMapMarkerAlt className="text-xs text-blue-600" />
								</div>

								<div className="min-w-0">
									<p className="text-[11px] font-medium text-slate-400">
										Location
									</p>

									<p className="text-sm font-medium text-slate-700">
										{location}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* ACTIONS + REPORTING MANAGER */}

					<div className="border-t border-slate-100 pt-5 xl:min-w-[190px] xl:border-t-0 xl:pl-2 xl:pt-0">
						{/* Action Buttons */}

						<div className="flex flex-wrap gap-2">
							<Button
								LabelName="Edit"
								enableIcon
								className="border-blue-600 bg-blue-600 px-5 text-white"
							/>

							<Button
								LabelName="Delete"
								variant="secondary"
								className="border-red-200 bg-white px-5 text-red-600 hover:bg-red-50"
							/>
						</div>

						{/* Reporting Manager */}

						<div className="mt-5">
							<p className="mb-2 text-[11px] font-medium text-slate-400">
								Reporting To
							</p>

							<div className="flex items-center gap-3">
								{/* Manager Image */}

								<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50">
									{managerImage ? (
										<img
											src={managerImage}
											alt={`${manager} profile`}
											className="h-full w-full object-cover"
										/>
									) : (
										<span className="font-semibold text-blue-600">
											{manager?.charAt(0)?.toUpperCase()}
										</span>
									)}
								</div>

								{/* Manager Details */}

								<div className="min-w-0">
									<p className="truncate text-sm font-semibold text-slate-800">
										{manager}
									</p>

									<p className="truncate text-xs text-slate-500">
										{managerDesignation}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
			<section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 text-sm">
				{/* Personal Information */}
				<div className="w-full rounded-2xl bg-white p-6 shadow-xl">
					<div className="flex items-center justify-between border-b border-slate-100 pb-4">
						<div className="flex items-center gap-3">
							<FaUserAlt className="text-lg text-blue-600" />
							<h2 className="text-lg font-semibold text-slate-800">
								Personal Information
							</h2>
						</div>

						<Button
							variant="Secondary"
							enableIcon
							className="px-3 py-1 border-none"
						/>
					</div>

					<div className="flex flex-col gap-4 py-5">
						<div className="flex items-start justify-between gap-4">
							<span className="text-slate-500">Name</span>
							<p className="text-right font-medium text-slate-800">
								{name || "-"}
							</p>
						</div>

						<div className="flex items-start justify-between gap-4">
							<span className="text-slate-500">Email</span>
							<p className="break-all text-right font-medium text-slate-800">
								{email || "-"}
							</p>
						</div>

						<div className="flex items-start justify-between gap-4">
							<span className="text-slate-500">Contact Number</span>
							<p className="text-right font-medium text-slate-800">
								{phone || "-"}
							</p>
						</div>

						<div className="flex items-start justify-between gap-4">
							<span className="text-slate-500">Gender</span>
							<p className="text-right font-medium capitalize text-slate-800">
								{gender || "-"}
							</p>
						</div>

						<div className="flex items-start justify-between gap-4">
							<span className="text-slate-500">Address</span>
							<p className="max-w-[60%] text-right font-medium text-slate-800">
								{location || "-"}
							</p>
						</div>
					</div>
				</div>

				{/* Work Information */}
				<div className="w-full rounded-2xl bg-white p-6 shadow-xl">
					<div className="flex items-center justify-between border-b border-slate-100 pb-4">
						<div className="flex items-center gap-3">
							<FaBriefcase className="text-lg text-blue-600" />

							<h2 className="text-lg font-semibold text-slate-800">
								Work Information
							</h2>
						</div>

						<Button
							variant="Secondary"
							enableIcon
							className="px-3 py-1 border-none"
						/>
					</div>

					<div className="flex flex-col gap-4 py-5">
						<div className="flex items-start justify-between gap-4">
							<span className="text-slate-500">Employee ID</span>
							<p className="font-medium text-slate-800">{employeeId || "-"}</p>
						</div>

						<div className="flex items-start justify-between gap-4">
							<span className="text-slate-500">Designation</span>
							<p className="text-right font-medium text-slate-800">
								{designation || "-"}
							</p>
						</div>

						<div className="flex items-start justify-between gap-4">
							<span className="text-slate-500">Department</span>
							<p className="text-right font-medium text-slate-800">
								{department || "-"}
							</p>
						</div>

						<div className="flex items-start justify-between gap-4">
							<span className="text-slate-500">Joining Date</span>
							<p className="text-right font-medium text-slate-800">
								{joiningDate || "-"}
							</p>
						</div>

						<div className="flex items-start justify-between gap-4">
							<span className="text-slate-500">Manager</span>
							<p className="text-right font-medium text-slate-800">
								{manager || "-"}
							</p>
						</div>
					</div>
				</div>

				{/* Contact Information */}
				<div className="w-full rounded-2xl bg-white p-6 shadow-xl">
					<div className="mb-6">
						<h2 className="text-lg font-semibold text-slate-800">
							Performance Summary
						</h2>

						<p className="text-sm text-slate-500">
							Employee task performance overview
						</p>
					</div>

					<div className="mx-auto h-[300px] w-full max-w-[400px]">
						<Doughnut data={performanceData} options={options} />
					</div>
				</div>
			</section>
		</div>
	);
};

export default EmployeeProfile;
