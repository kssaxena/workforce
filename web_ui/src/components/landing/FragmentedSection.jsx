import React from "react";
import { motion } from "framer-motion";
import {
	CalendarDays,
	FileSpreadsheet,
	MessageSquare,
	WalletCards,
} from "lucide-react";
import { Eyebrow, GlassCard } from "./Icons";
import Button from "../common/Button";
import { useState } from "react";
import InputBox from "../common/Input";
const nodes = [
	{ icon: CalendarDays, title: "Attendance", x: "left-0 top-1" },
	{ icon: FileSpreadsheet, title: "Payroll", x: "right-0 top-1" },
	{ icon: MessageSquare, title: "Communication", x: "left-4 bottom-1" },
	{ icon: WalletCards, title: "Expenses", x: "right-4 bottom-1" },
];

export default function FragmentedSection() {
	const [formData, setFormData] = useState({
		name: "",
		businessEmail: "",
		company: "",
		role: "",
		contactNumber: "",
		service: "",
		employeeCount: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log(formData);
	};
	return (
		<section className="border-y border-slate-100 bg-blue-50/70">
			<div className="mx-auto grid max-w-6xl items-center gap-16 px-5 py-14 sm:px-8 md:grid-cols-[0.9fr_1.1fr]">
				<div className="space-y-6  flex flex-col items-start">
					<div>
						<Eyebrow>OUR SOLUTION</Eyebrow>
						<h2 className="max-w-sm text-4xl font-black leading-[0.95] tracking-[-0.04em] text-slate-950">
							Everything your team needs, <span className="">in one place</span>
						</h2>
						<p className="mt-4 max-w-sm text-[12px] leading-5 text-slate-500">
							Teams bounce between spreadsheets, attendance tools, payroll
							systems and disconnected field apps. WorkforceOS brings every
							operational layer into one system.
						</p>
					</div>
					<div className="relative mx-auto  h-60 w-full max-w-md">
						<div className="absolute inset-8 rounded-full border border-dashed border-blue-200" />
						<div className="absolute inset-16 rounded-full bg-blue-50 shadow-inner" />
						<motion.div
							animate={{ rotate: 360 }}
							transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
							className="absolute inset-10 rounded-full border border-blue-100 border-dashed"
						/>
						<div className="absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-blue-200 bg-cyan-100 text-center text-[10px] font-black text-blue-700 shadow-xl">
							ONE
							<br />
							WORKFORCE
						</div>
						{nodes.map(({ icon: Icon, title, x }) => (
							<div
								key={title}
								className={`absolute ${x} flex w-44 items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg`}
							>
								<span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
									<Icon size={12} />
								</span>
								<span className="text-[14px] font-bold text-slate-700">
									{title}
								</span>
							</div>
						))}
					</div>
				</div>

				<div className="border px-6 py-8 bg-white border-neutral-200 shadow-xl rounded-xl">
					<div>
						<h1 className="font-bold text-xl">Get in Touch</h1>
						<p className="text-[11px] text-neutral-700">
							Share your requirements, and our team will help you find the right
							solution.
						</p>
					</div>
					<form className="">
						<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
							<InputBox
								labelName="Name"
								name="name"
								placeholder="Enter your name"
								value={formData.name}
								onChange={handleChange}
							/>
							<InputBox
								labelName="Business Email"
								name="businessEmail"
								type="email"
								placeholder="Enter your business email"
								value={formData.businessEmail}
								onChange={handleChange}
								required
							/>

							<InputBox
								labelName="Company"
								name="company"
								placeholder="Enter your company name"
								value={formData.company}
								onChange={handleChange}
								required
							/>

							<InputBox
								labelName="Number of Employees"
								name="employeeCount"
								type="select"
								placeholder="Select employee count"
								options={[
									{ label: "1–10 Employees", value: "1-10" },
									{ label: "11–50 Employees", value: "11-50" },
									{ label: "51–100 Employees", value: "51-100" },
									{ label: "101–250 Employees", value: "101-250" },
									{ label: "251–500 Employees", value: "251-500" },
									{ label: "501–1000 Employees", value: "501-1000" },
									{ label: "1000+ Employees", value: "1000+" },
								]}
								value={formData.employeeCount}
								onChange={handleChange}
								required
							/>

							{/* <InputBox
								labelName="Role"
								name="role"
								type="select"
								placeholder="Select your role"
								options={[
									{ label: "Founder / CEO", value: "founder" },
									{ label: "HR Manager", value: "hr_manager" },
									{ label: "Operations Manager", value: "operations_manager" },
									{ label: "Team Leader", value: "team_leader" },
									{ label: "IT Manager", value: "it_manager" },
									{ label: "Other", value: "other" },
								]}
								value={formData.role}
								onChange={handleChange}
								required
							/> */}

							<InputBox
								labelName="Contact Number"
								name="contactNumber"
								type="tel"
								placeholder="Enter your contact number"
								value={formData.contactNumber}
								onChange={handleChange}
								required
							/>

							<InputBox
								labelName="Service You're Interested In"
								name="service"
								type="select"
								placeholder="Select a service"
								options={[
									{
										label: "Workforce Management",
										value: "workforce_management",
									},
									{
										label: "Employee Management",
										value: "employee_management",
									},
									{
										label: "Attendance Management",
										value: "attendance_management",
									},
									{ label: "Payroll Management", value: "payroll_management" },
									{ label: "HR Analytics", value: "hr_analytics" },
									{
										label: "Complete WorkforceOS Platform",
										value: "complete_platform",
									},
									{ label: "Other", value: "other" },
								]}
								value={formData.service}
								onChange={handleChange}
								required
							/>
						</div>
						<Button LabelName="Get in Touch" className="w-full" />
					</form>
				</div>
			</div>
		</section>
	);
}
