import React from "react";
import InputBox from "./Input";
import Button from "./Button";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
	const navigate = useNavigate();

	const handleSubmit = (e) => {
		e.preventDefault();

		// Register API yahan call kar sakte ho

		// Example:
		// navigate("/dashboard");
	};

	return (
		<div className="min-h-screen bg-white text-slate-900">
			<div className="flex min-h-screen flex-col lg:flex-row">
				{/* ================= LEFT PANEL ================= */}
				<section className="relative hidden min-h-screen overflow-hidden bg-blue-600 lg:flex lg:w-[40%] xl:w-[42%]">
					{/* Background Shapes */}
					<div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500 opacity-40" />

					<div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-700 opacity-40" />

					{/* Content */}
					<div className="relative z-10 flex w-full items-center justify-center px-8 py-12 xl:px-12">
						<div className="w-full max-w-xl text-center">
							{/* Badge */}
							<div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
								<span className="h-2 w-2 rounded-full bg-white" />

								<span className="text-xs font-medium text-white">
									Workforce Management Platform
								</span>
							</div>

							{/* Heading */}
							<h2 className="text-3xl font-semibold leading-tight text-white xl:text-5xl">
								Manage your workforce.
								<br />
								<span className="text-blue-100">Build better teams.</span>
							</h2>

							<p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-blue-100/80">
								Everything you need to manage employees, attendance, operations
								and workforce performance — all in one place.
							</p>

							{/* Dashboard Preview */}
							<div className="mx-auto mt-10 w-full max-w-lg rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-md">
								<div className="rounded-xl bg-white p-4 text-left sm:p-5">
									<div className="flex items-center justify-between gap-4">
										<div>
											<p className="text-[10px] text-slate-400">
												Total Employees
											</p>

											<p className="mt-1 text-2xl font-bold text-slate-900">
												248
											</p>
										</div>

										<div className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600">
											+12.5%
										</div>
									</div>

									<div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
										<div className="rounded-lg bg-slate-50 p-2 sm:p-3">
											<p className="text-[9px] text-slate-400">Present</p>

											<p className="mt-1 text-sm font-bold text-slate-800">
												218
											</p>
										</div>

										<div className="rounded-lg bg-slate-50 p-2 sm:p-3">
											<p className="text-[9px] text-slate-400">On Leave</p>

											<p className="mt-1 text-sm font-bold text-slate-800">
												18
											</p>
										</div>

										<div className="rounded-lg bg-slate-50 p-2 sm:p-3">
											<p className="text-[9px] text-slate-400">Absent</p>

											<p className="mt-1 text-sm font-bold text-slate-800">
												12
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* ================= RIGHT PANEL ================= */}
				<section className="flex min-h-screen w-full items-center justify-center px-4 py-6 sm:px-6 sm:py-10 md:px-10 lg:w-[60%] lg:px-10 xl:w-[58%] xl:px-14">
					<div className="w-full max-w-3xl">
						{/* Logo + Sign In */}
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<Link to="/" className="inline-flex items-center gap-2">
									<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white shadow-sm">
										W
									</span>

									<span className="text-sm font-black tracking-tight text-slate-950">
										Workforce
										<span className="text-blue-600">OS</span>
									</span>
								</Link>
							</div>

							<div className="flex items-center gap-2">
								<p className="text-xs text-slate-500 sm:text-sm">
									Already have an account?
								</p>

								<a href="/" className="text-sm hover:text-blue-700">
									{" "}
									Sign In{" "}
								</a>
							</div>
						</div>

						{/* Heading */}
						<div className="mt-10 sm:mt-12">
							<h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
								Create Your Organization
							</h1>

							<p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
								Get started with your free account and build a smarter workforce
								management system for your business.
							</p>
						</div>

						{/* ================= FORM ================= */}
						<form
							onSubmit={handleSubmit}
							className="mt-8 grid grid-cols-1 gap-x-5 gap-y-1 sm:mt-10 md:grid-cols-2"
						>
							{/* Company Name */}
							<InputBox
								labelName="Company Name"
								name="companyName"
								type="text"
								placeholder="Enter your company name"
								required
							/>

							{/* Industry */}
							<InputBox
								labelName="Industry"
								name="industry"
								type="select"
								placeholder="Select industry"
								required
								options={[
									{
										label: "Technology",
										value: "technology",
									},
									{
										label: "Healthcare",
										value: "healthcare",
									},
									{
										label: "Finance & Banking",
										value: "finance_banking",
									},
									{
										label: "Education",
										value: "education",
									},
									{
										label: "Retail",
										value: "retail",
									},
									{
										label: "Manufacturing",
										value: "manufacturing",
									},
									{
										label: "Real Estate",
										value: "real_estate",
									},
									{
										label: "Travel & Tourism",
										value: "travel_tourism",
									},
									{
										label: "Beauty & Wellness",
										value: "beauty_wellness",
									},
									{
										label: "Marketing & Advertising",
										value: "marketing_advertising",
									},
									{
										label: "IT & Software",
										value: "it_software",
									},
									{
										label: "Other",
										value: "other",
									},
								]}
							/>

							{/* Company Size */}
							<InputBox
								labelName="Company Size"
								name="companySize"
								type="select"
								placeholder="Select company size"
								required
								options={[
									{
										label: "1–10 Employees",
										value: "1-10",
									},
									{
										label: "11–50 Employees",
										value: "11-50",
									},
									{
										label: "51–200 Employees",
										value: "51-200",
									},
									{
										label: "201–500 Employees",
										value: "201-500",
									},
									{
										label: "501–1,000 Employees",
										value: "501-1000",
									},
									{
										label: "1,001–5,000 Employees",
										value: "1001-5000",
									},
									{
										label: "5,001–10,000 Employees",
										value: "5001-10000",
									},
									{
										label: "10,000+ Employees",
										value: "10000+",
									},
								]}
							/>

							{/* Executive Name */}
							<InputBox
								labelName="Executive Name"
								name="executiveName"
								type="text"
								placeholder="Enter your name"
								required
							/>

							{/* Email */}
							<InputBox
								labelName="Email"
								name="email"
								type="email"
								placeholder="Enter your email"
								required
							/>

							{/* Contact Number */}
							<InputBox
								labelName="Contact Number"
								name="number"
								type="text"
								placeholder="Enter your contact number"
								required
							/>

							{/* Terms */}
							<div className=" flex items-center justify-start gap-2 md:col-span-2">
								<div>
									<InputBox
										type="checkbox"
										name="terms"
										required
										className="mt-1 "
									/>
								</div>

								<span className="text-xs text-slate-500 ">
									I agree to the{" "}
									<span className="cursor-pointer text-blue-500 hover:text-blue-600">
										Terms & Condition
									</span>{" "}
									and{" "}
									<span className="cursor-pointer text-blue-500 hover:text-blue-600">
										Privacy Policy
									</span>
								</span>
							</div>

							{/* Submit */}
							<div className="pt-3 md:col-span-2">
								<Button
									LabelName="Create Organization"
									type="submit"
									className="w-full justify-center py-3"
								/>
							</div>
						</form>
					</div>
				</section>
			</div>
		</div>
	);
};

export default Register;
