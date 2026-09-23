import React, { useState, useEffect } from "react";
import { EmployeeFieldCard } from "../../../constant/constant";
import { FaArrowUp, FaClock } from "react-icons/fa";
import InputBox from "../../../components/Input";
import Button from "../../../components/Button";
import Popup from "../../../components/Popup";

const days = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

const statusStyles = {
	present: "bg-emerald-50 text-emerald-600",
	late: "bg-amber-50 text-amber-600",
	leave: "bg-purple-50 text-purple-600",
	absent: "bg-red-50 text-red-500",
	active: "bg-emerald-50 text-emerald-600",
};

const Employee = ({ data = [] }) => {
	const [showForm, setShowForm] = useState(false);

	const [attendanceFields, setAttendanceFields] = useState({
		presentToday: "",
		presentRemaining: "",
		lateEntry: "",
		onTime: "",
		onLeave: "",
		approvedLeaves: "",
		absent: "",
		withoutInformation: "",
	});

	useEffect(() => {
		const navigation = performance.getEntriesByType("navigation")[0];

		// Agar page reload hua hai
		if (navigation?.type === "reload") {
			sessionStorage.removeItem("employeeAttendanceFields");

			setAttendanceFields({
				presentToday: "",
				presentRemaining: "",
				lateEntry: "",
				onTime: "",
				onLeave: "",
				approvedLeaves: "",
				absent: "",
				withoutInformation: "",
			});

			return;
		}

		const savedData = sessionStorage.getItem("employeeAttendanceFields");

		if (savedData) {
			try {
				setAttendanceFields(JSON.parse(savedData));
			} catch (error) {
				console.error("Invalid attendance data:", error);
				sessionStorage.removeItem("employeeAttendanceFields");
			}
		}
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;

		setAttendanceFields((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSave = () => {
		sessionStorage.setItem(
			"employeeAttendanceFields",
			JSON.stringify(attendanceFields),
		);

		setShowForm(false);
	};

	const getAttendanceTextColor = (presentToday, absentToday) => {
		const PT = Number(presentToday);
		const AT = Number(absentToday);

		if (PT > AT) {
			return "text-red-600";
		}

		if (PT === AT) {
			return "text-yellow-600";
		}
		

		return "text-green-600";
	};

	return (
		<div className="space-y-6 p-4">
			{/* Heading */}
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

			{/* Attendance Cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{EmployeeFieldCard?.map((item, index) => {
					const value =
						attendanceFields[item.key] !== ""
							? attendanceFields[item.key]
							: item.value;

					const remainingValue =
						attendanceFields[item.remainingKey] !== ""
							? attendanceFields[item.remainingKey]
							: item.remainingValue || item.change;

					const textColor = getAttendanceTextColor(
						attendanceFields.presentToday,
						attendanceFields.approvedLeaves,
						attendanceFields.lateEntry,
						attendanceFields.absent,
					);

					return (
						<div
							key={item?.id || index}
							className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
						>
							<div className="flex items-start justify-between">
								<div>
									<p className="text-xs font-medium text-slate-500">
										{item?.title || ""}
									</p>

									<h3 className="mt-2 text-2xl font-bold text-slate-900">
										{value}
									</h3>
								</div>

								<div
									className={`flex h-11 w-11 items-center justify-center rounded-xl ${
										item?.iconBg || "bg-slate-100"
									} ${item?.iconColor || "text-slate-500"}`}
								>
									{item?.icon || null}
								</div>
							</div>

							<div className="mt-4 flex items-center gap-2">
								<span
									className={`flex items-center gap-1 text-xs font-semibold ${textColor}`}
								>
									<FaArrowUp className="text-[9px]" />

									{remainingValue}
								</span>

								<span className="text-[11px] text-slate-400">
									{item?.message || ""}
								</span>
							</div>
						</div>
					);
				})}
			</div>

			{/* Attendance Table */}
			<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
				{/* Search + Filter */}
				<div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex w-full max-w-md items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
						<svg
							className="h-4 w-4 text-slate-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
							/>
						</svg>

						<InputBox placeholder="Search Anything......" />
					</div>

					<div className="flex gap-2">
						<Button LabelName="Filter" />

						<Button LabelName="08, August 2025" variant="Secondary" />
					</div>
				</div>

				{/* Filter Tags */}
				<div className="flex gap-2 border-b border-slate-100 px-4 py-3">
					{["Leave", "Absent", "Active"].map((filter) => (
						<button
							key={filter}
							className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] text-slate-500"
						>
							{filter} ×
						</button>
					))}
				</div>

				{/* Table */}
				<div className="w-full overflow-x-auto">
					<table className="w-full min-w-[950px] border-collapse">
						<thead>
							<tr className="border-b border-slate-200 bg-slate-50/50">
								<th className="sticky left-0 z-10 w-[190px] min-w-[190px] bg-slate-50 px-4 py-4 text-left text-[12px] font-semibold text-black">
									Employee
								</th>

								{days.map((day) => (
									<th
										key={day}
										className="min-w-[110px] border-l border-slate-100 px-3 py-4 text-left text-[11px] font-semibold text-slate-800"
									>
										{day}
									</th>
								))}
							</tr>
						</thead>

						<tbody>
							{data?.length > 0 ? (
								data.map((employee, index) => (
									<tr
										key={employee?.id || index}
										className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50"
									>
										{/* Employee */}
										<td className="sticky left-0 z-10 bg-blue-100 px-4 py-4">
											<div className="flex items-center gap-3">
												{employee?.avatar ? (
													<img
														src={employee.avatar}
														alt={employee?.employeeName || "Employee"}
														className="h-9 w-9 rounded-full object-cover"
													/>
												) : (
													<div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
														{(employee?.employeeName || "E")
															.charAt(0)
															.toUpperCase()}
													</div>
												)}

												<div>
													<p className="whitespace-nowrap text-xs font-semibold text-slate-800">
														{employee?.employeeName || "Employee"}
													</p>

													<p className="mt-0.5 whitespace-nowrap text-[9px] text-slate-400">
														{employee?.designation || "N/A"}
													</p>
												</div>
											</div>
										</td>

										{/* Attendance Days */}
										{days.map((day) => {
											const attendance = employee?.attendance?.[day] || {};

											const type = attendance?.type || "";

											return (
												<td
													key={day}
													className="border-l border-slate-100 px-3 py-3 align-top"
												>
													<div className="flex min-h-[55px] flex-col items-start gap-2">
														{/* Date */}
														<span className="text-[10px] font-medium text-slate-600">
															{attendance?.date || "-"}
														</span>

														{/* Status */}
														{attendance?.status && (
															<span
																className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-[9px] font-medium ${
																	statusStyles[type] ||
																	"bg-slate-50 text-slate-500"
																}`}
															>
																{type === "present" || type === "late" ? (
																	<FaClock className="text-[7px]" />
																) : (
																	<span className="h-1.5 w-1.5 rounded-full bg-current" />
																)}

																{attendance?.status || ""}
															</span>
														)}
													</div>
												</td>
											);
										})}
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={8}
										className="py-10 text-center text-sm text-slate-400"
									>
										No employee attendance records found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			<Popup
				isOpen={showForm}
				onClose={() => setShowForm(false)}
				title="Add Attendance Data"
			>
				<div className="space-y-4">
					{/* Present Today */}
					<h1 className="text-lg font-semibold">Present Today Field</h1>

					<div>
						<InputBox
							labelName="Value"
							name="presentToday"
							type="text"
							placeholder="Enter Value"
							value={attendanceFields.presentToday}
							onChange={handleChange}
						/>

						<InputBox
							labelName="Remaining Value"
							name="presentRemaining"
							type="text"
							placeholder="Enter remaining value"
							value={attendanceFields.presentRemaining}
							onChange={handleChange}
						/>
					</div>

					{/* Late Entry */}
					<h1 className="text-lg font-semibold">Late Entry Field</h1>

					<div>
						<InputBox
							labelName="Late Entry"
							name="lateEntry"
							type="text"
							placeholder="Enter late entry value"
							value={attendanceFields.lateEntry}
							onChange={handleChange}
						/>

						<InputBox
							labelName="On Time"
							name="onTime"
							type="text"
							placeholder="Enter on time Value"
							value={attendanceFields.onTime}
							onChange={handleChange}
						/>
					</div>

					{/* On Leave */}
					<h1 className="text-lg font-semibold">On Leave Field</h1>

					<div>
						<InputBox
							labelName="On leave"
							name="onLeave"
							type="text"
							placeholder="Enter late on leave value"
							value={attendanceFields.onLeave}
							onChange={handleChange}
						/>

						<InputBox
							labelName="Approved Leaves"
							name="approvedLeaves"
							type="text"
							placeholder="Enter approved leaves Value"
							value={attendanceFields.approvedLeaves}
							onChange={handleChange}
						/>
					</div>

					{/* Absent */}
					<h1 className="text-lg font-semibold">Absent Field</h1>

					<div>
						<InputBox
							labelName="Absent"
							name="absent"
							type="text"
							placeholder="Enter late absent value"
							value={attendanceFields.absent}
							onChange={handleChange}
						/>

						<InputBox
							labelName="Without Information"
							name="withoutInformation"
							type="text"
							placeholder="Enter without information Value"
							value={attendanceFields.withoutInformation}
							onChange={handleChange}
						/>
					</div>

					{/* Buttons */}
					<div className="flex justify-end gap-3">
						<Button
							LabelName="Cancel"
							variant="secondary"
							onClick={() => setShowForm(false)}
						/>

						<Button LabelName="Save" onClick={handleSave} />
					</div>
				</div>
			</Popup>
		</div>
	);
};

export default Employee;
