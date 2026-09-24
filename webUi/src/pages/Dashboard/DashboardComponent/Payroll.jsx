import React, { useEffect, useState } from "react";
import {
	FaCalendarAlt,
	FaChevronDown,
	FaChevronRight,
	FaDownload,
	FaFileInvoiceDollar,
	FaGift,
	FaMoneyBillWave,
	FaUsers,
	FaWallet,
	FaClock,
	FaCheckCircle,
} from "react-icons/fa";



const payrollEmployees = [
	{
		id: 1,
		employeeId: "EMP-1024",
		name: "Rahul Sharma",
		department: "Sales",
		designation: "Sales Executive",
		workingDays: 26,
		grossSalary: 45000,
		deductions: 8500,
		netSalary: 36500,
		status: "Paid",
	},
	{
		id: 2,
		employeeId: "EMP-1025",
		name: "Priya Singh",
		department: "HR",
		designation: "HR Manager",
		workingDays: 26,
		grossSalary: 65000,
		deductions: 11200,
		netSalary: 53800,
		status: "Paid",
	},
	{
		id: 3,
		employeeId: "EMP-1026",
		name: "Amit Kumar",
		department: "Operations",
		designation: "Team Leader",
		workingDays: 25,
		grossSalary: 50000,
		deductions: 9800,
		netSalary: 40200,
		status: "Paid",
	},
	{
		id: 4,
		employeeId: "EMP-1027",
		name: "Neha Gupta",
		department: "Marketing",
		designation: "Executive",
		workingDays: 26,
		grossSalary: 42000,
		deductions: 7900,
		netSalary: 34100,
		status: "Paid",
	},
	{
		id: 5,
		employeeId: "EMP-1028",
		name: "Rohan Mehta",
		department: "Finance",
		designation: "Manager",
		workingDays: 24,
		grossSalary: 72000,
		deductions: 12600,
		netSalary: 59400,
		status: "Processing",
	},
	{
		id: 6,
		employeeId: "EMP-1029",
		name: "Sneha Verma",
		department: "Support",
		designation: "Executive",
		workingDays: 26,
		grossSalary: 38000,
		deductions: 7200,
		netSalary: 30800,
		status: "Paid",
	},
];

const processingSteps = [
	{
		id: 1,
		name: "Attendance",
		status: "Completed",
	},
	{
		id: 2,
		name: "Working Days",
		status: "Completed",
	},
	{
		id: 3,
		name: "Leave / Absence",
		status: "Completed",
	},
	{
		id: 4,
		name: "Payroll Rules",
		status: "Completed",
	},
	{
		id: 5,
		name: "Salary Calculation",
		status: "In Progress",
	},
	{
		id: 6,
		name: "Payslip",
		status: "Pending",
	},
];

const recentPayslips = [
	{
		id: 1,
		name: "Rahul Sharma",
		period: "Sep 2026",
		amount: 36500,
		status: "Paid",
	},
	{
		id: 2,
		name: "Priya Singh",
		period: "Sep 2026",
		amount: 53800,
		status: "Paid",
	},
	{
		id: 3,
		name: "Amit Kumar",
		period: "Sep 2026",
		amount: 40200,
		status: "Paid",
	},
	{
		id: 4,
		name: "Neha Gupta",
		period: "Sep 2026",
		amount: 34100,
		status: "Paid",
	},
	{
		id: 5,
		name: "Rohan Mehta",
		period: "Sep 2026",
		amount: 59400,
		status: "Processing",
	},
];



const PAYROLL_SUMMARY_KEY = "payrollSummary";

//  MAIN COMPONENT

function Payroll() {
	const [summary, setSummary] = useState({
		totalPayroll: "",
		employeesPaid: "",
		pendingPayments: "",
		netSalary: "",
	});

	const [showInput, setShowInput] = useState(false);

	const [formData, setFormData] = useState({
		totalPayroll: "",
		employeesPaid: "",
		pendingPayments: "",
		netSalary: "",
	});

	//   LOAD LOCAL STORAGE

	useEffect(() => {
		localStorage.removeItem(PAYROLL_SUMMARY_KEY);
	}, []);



	const handleChange = (e) => {
		const { name, value } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};



	const handleSaveSummary = (e) => {
		e.preventDefault();

		localStorage.setItem(PAYROLL_SUMMARY_KEY, JSON.stringify(formData));

		setSummary(formData);
		setShowInput(false);
	};



	const formatCurrency = (value) => {
		if (!value) return "₹ 0";

		return `₹ ${Number(value).toLocaleString("en-IN")}`;
	};

	return (
		<div className="min-h-full overflow-y-auto bg-slate-50 p-4 text-slate-900 sm:p-5 lg:p-6">
			<div className="mx-auto max-w-[1600px]">
				{/* =================================================
				    HEADER
				================================================= */}

				<div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
							Payroll
						</h1>

						<p className="mt-1 text-sm text-slate-500">
							Automate salary processing and manage your workforce payments
							efficiently.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						{/* MONTH */}

						<div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 shadow-sm">
							<FaCalendarAlt className="text-blue-600" />

							<span>September 2026</span>

							<FaChevronDown size={11} className="ml-3 text-slate-400" />
						</div>

						{/* ENTER DATA */}

						<button
							type="button"
							onClick={() => setShowInput(!showInput)}
							className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700"
						>
							<FaMoneyBillWave />
							Enter Payroll Data
						</button>
					</div>
				</div>

				{/* =================================================
				    PAYROLL INPUT FORM
				================================================= */}

				{showInput && (
					<div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<div className="mb-5">
							<h2 className="text-lg font-semibold text-slate-900">
								Payroll Summary Data
							</h2>

							<p className="mt-1 text-xs text-slate-500">
								Enter the values you want to display in the payroll summary
								cards.
							</p>
						</div>

						<form
							onSubmit={handleSaveSummary}
							className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
						>
							<PayrollInput
								label="Total Payroll"
								name="totalPayroll"
								value={formData.totalPayroll}
								onChange={handleChange}
								placeholder="Enter total payroll"
							/>

							<PayrollInput
								label="Employees Paid"
								name="employeesPaid"
								value={formData.employeesPaid}
								onChange={handleChange}
								placeholder="Enter employees paid"
							/>

							<PayrollInput
								label="Pending Payments"
								name="pendingPayments"
								value={formData.pendingPayments}
								onChange={handleChange}
								placeholder="Enter pending payments"
							/>

							<PayrollInput
								label="Net Salary"
								name="netSalary"
								value={formData.netSalary}
								onChange={handleChange}
								placeholder="Enter net salary"
							/>

							<div className="flex items-end sm:col-span-2 xl:col-span-4">
								<button
									type="submit"
									className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
								>
									Save Payroll Data
								</button>
							</div>
						</form>
					</div>
				)}

			

				<div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<SummaryCard
						icon={<FaWallet />}
						title="Total Payroll"
						value={formatCurrency(summary.totalPayroll)}
					/>

					<SummaryCard
						icon={<FaUsers />}
						title="Employees Paid"
						value={summary.employeesPaid || "0"}
					/>

					<SummaryCard
						icon={<FaClock />}
						title="Pending Payments"
						value={summary.pendingPayments || "0"}
					/>

					<SummaryCard
						icon={<FaDownload />}
						title="Net Salary"
						value={formatCurrency(summary.netSalary)}
					/>
				</div>

				

				<div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
					<div className="mb-6 flex items-center justify-between">
						<h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
							<FaFileInvoiceDollar className="text-blue-600" />
							Salary Processing Flow
						</h2>

						<button
							type="button"
							className="flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700"
						>
							View Details
							<FaChevronRight size={10} />
						</button>
					</div>

					<div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-6">
						{processingSteps.map((step) => (
							<ProcessingStep key={step.id} step={step} />
						))}
					</div>
				</div>

			

				<div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
				

					<div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
						<div className="flex items-center justify-between border-b border-slate-100 p-5">
							<div>
								<h2 className="text-base font-semibold text-slate-900">
									Payroll Overview
								</h2>

								<p className="mt-1 text-xs text-slate-500">
									Employee salary and payment details
								</p>
							</div>
						</div>

						<div className="overflow-x-auto">
							<table className="w-full min-w-[850px] text-left">
								<thead>
									<tr className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
										<th className="px-5 py-4">Employee</th>

										<th className="px-4 py-4">Department</th>

										<th className="px-4 py-4">Designation</th>

										<th className="px-4 py-4">Working Days</th>

										<th className="px-4 py-4">Gross Salary</th>

										<th className="px-4 py-4">Deductions</th>

										<th className="px-4 py-4">Net Salary</th>

										<th className="px-4 py-4">Status</th>
									</tr>
								</thead>

								<tbody>
									{payrollEmployees.map((employee) => (
										<EmployeeRow
											key={employee.id}
											employee={employee}
											formatCurrency={formatCurrency}
										/>
									))}
								</tbody>
							</table>
						</div>

						<div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
							Showing 1 - {payrollEmployees.length} of {payrollEmployees.length}{" "}
							employees
						</div>
					</div>

				
					<div className="space-y-5">
						

						<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
							<div className="mb-5 flex items-center justify-between">
								<div>
									<h2 className="text-base font-semibold text-slate-900">
										Payroll Summary
									</h2>

									<p className="mt-1 text-xs text-slate-500">
										Current payroll breakdown
									</p>
								</div>

								<button
									type="button"
									className="text-xs font-medium text-blue-600 hover:text-blue-700"
								>
									View Report
								</button>
							</div>

							<div className="mx-auto mb-6 flex h-36 w-36 items-center justify-center rounded-full border-[18px] border-blue-100">
								<div className="text-center">
									<p className="text-lg font-bold text-slate-900">
										{formatCurrency(summary.totalPayroll)}
									</p>

									<p className="text-[10px] text-slate-500">Total Payroll</p>
								</div>
							</div>

							<div className="space-y-3">
								<SummaryLine label="Basic Salary" value={summary.netSalary} />

								<SummaryLine
									label="Employees Paid"
									value={summary.employeesPaid}
								/>

								<SummaryLine
									label="Pending Payments"
									value={summary.pendingPayments}
								/>
							</div>
						</div>

						{/* =================================================
						    QUICK ACTIONS
						================================================= */}

						<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
							<h2 className="mb-4 text-base font-semibold text-slate-900">
								Quick Actions
							</h2>

							<div className="grid grid-cols-2 gap-3">
								<QuickAction
									icon={<FaMoneyBillWave />}
									label="Process Payroll"
								/>

								<QuickAction
									icon={<FaFileInvoiceDollar />}
									label="Generate Payslips"
								/>

								<QuickAction icon={<FaGift />} label="Bonuses & Incentives" />

								<QuickAction icon={<FaWallet />} label="Payroll Reports" />
							</div>
						</div>


						<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
							<div className="mb-4 flex items-center justify-between">
								<h2 className="text-base font-semibold text-slate-900">
									Recent Payslips
								</h2>

								<button
									type="button"
									className="text-xs font-medium text-blue-600 hover:text-blue-700"
								>
									View All
								</button>
							</div>

							<div className="space-y-4">
								{recentPayslips.map((item) => (
									<div key={item.id} className="flex items-center gap-3">
										{/* AVATAR */}

										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
											{item.name
												.split(" ")
												.map((name) => name[0])
												.join("")}
										</div>

										{/* NAME */}

										<div className="min-w-0 flex-1">
											<p className="truncate text-xs font-medium text-slate-700">
												{item.name}
											</p>

											<p className="text-[10px] text-slate-400">
												{item.period}
											</p>
										</div>

										{/* AMOUNT */}

										<div className="text-right">
											<p className="text-xs font-medium text-slate-700">
												{formatCurrency(item.amount)}
											</p>

											<p
												className={`text-[9px] ${
													item.status === "Paid"
														? "text-emerald-600"
														: "text-amber-600"
												}`}
											>
												{item.status}
											</p>
										</div>

										<FaDownload size={11} className="shrink-0 text-slate-400" />
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				
			</div>
		</div>
	);
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({ icon, title, value }) {
	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
			<div className="flex items-center gap-4">
				<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
					{icon}
				</div>

				<div>
					<p className="text-xs text-slate-500">{title}</p>

					<h3 className="mt-1 text-xl font-semibold text-slate-900">{value}</h3>
				</div>
			</div>
		</div>
	);
}

/* =========================================================
   PAYROLL INPUT
========================================================= */

function PayrollInput({ label, name, value, onChange, placeholder }) {
	return (
		<div>
			<label className="mb-2 block text-xs font-medium text-slate-700">
				{label}
			</label>

			<input
				type="number"
				name={name}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				className=" h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10
				"
			/>
		</div>
	);
}

/* =========================================================
   PROCESSING STEP
========================================================= */

function ProcessingStep({ step }) {
	const completed = step.status === "Completed";
	const pending = step.status === "Pending";

	return (
		<div className="text-center">
			<div
				className={` mx-auto flex h-10 w-10 items-center justify-center rounded-full ${completed ? "bg-blue-50 text-blue-600" : pending ? "bg-amber-50 text-amber-600" : "bg-blue-600 text-white"}`}>
				{completed ? (
					<FaCheckCircle />
				) : pending ? (
					<FaClock />
				) : (
					<FaMoneyBillWave />
				)}
			</div>

			<p className="mt-3 text-xs font-medium text-slate-700">{step.name}</p>

			<span
				className={` mt-2 inline-block rounded-full px-2 py-1 text-[9px] ${completed ? "bg-blue-50 text-blue-600" : pending ? "bg-amber-50 text-amber-600" 	: "bg-blue-50 text-blue-600"}`}>
				{step.status}
			</span>
		</div>
	);
}

/* =========================================================
   EMPLOYEE ROW
========================================================= */

function EmployeeRow({ employee, formatCurrency }) {
	return (
		<tr className="border-b border-slate-100 transition hover:bg-blue-50/40">
			{/* EMPLOYEE */}

			<td className="px-5 py-4">
				<div className="flex items-center gap-3">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
						{employee.name
							.split(" ")
							.map((name) => name[0])
							.join("")}
					</div>

					<div>
						<p className="text-xs font-medium text-slate-800">
							{employee.name}
						</p>

						<p className="text-[10px] text-slate-400">{employee.employeeId}</p>
					</div>
				</div>
			</td>

			{/* DEPARTMENT */}

			<td className="px-4 py-4 text-xs text-slate-500">
				{employee.department}
			</td>

			{/* DESIGNATION */}

			<td className="px-4 py-4 text-xs text-slate-500">
				{employee.designation}
			</td>

			{/* WORKING DAYS */}

			<td className="px-4 py-4 text-xs text-slate-500">
				{employee.workingDays}
			</td>

			{/* GROSS */}

			<td className="px-4 py-4 text-xs font-medium text-slate-700">
				{formatCurrency(employee.grossSalary)}
			</td>

			{/* DEDUCTIONS */}

			<td className="px-4 py-4 text-xs text-slate-600">
				{formatCurrency(employee.deductions)}
			</td>

			{/* NET */}

			<td className="px-4 py-4 text-xs font-semibold text-slate-800">
				{formatCurrency(employee.netSalary)}
			</td>

			{/* STATUS */}

			<td className="px-4 py-4">
				<span
					className={`
						rounded-full
						px-2.5
						py-1
						text-[10px]
						font-medium
						${
							employee.status === "Paid"
								? "bg-emerald-50 text-emerald-600"
								: "bg-blue-50 text-blue-600"
						}
					`}
				>
					{employee.status}
				</span>
			</td>
		</tr>
	);
}

/* =========================================================
   SUMMARY LINE
========================================================= */

function SummaryLine({ label, value }) {
	return (
		<div className="flex items-center justify-between text-xs">
			<div className="flex items-center gap-2">
				<span className="h-2 w-2 rounded-full bg-blue-600" />

				<span className="text-slate-500">{label}</span>
			</div>

			<span className="font-medium text-slate-700">{value || 0}</span>
		</div>
	);
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({ icon, label }) {
	return (
		<button
			type="button"
			className=" flex min-h-[70px] flex-col items-start justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 transition hover:border-blue-200 hover:bg-blue-500">
			<span className="text-blue-600">{icon}</span>

			<span className="text-left text-xs font-medium text-slate-600">
				{label}
			</span>
		</button>
	);
}

export default Payroll;
