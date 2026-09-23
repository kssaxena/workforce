import React from "react";
import InputBox from "./Input";
import Button from "./Button";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
	const navigate = useNavigate();

	const handleSubmit = (e) => {
		e.preventDefault();

		// Login API yahan call kar sakte ho

		// Example:
		// navigate("/dashboard");
	};
	return (
		<div className="min-h-screen bg-white text-slate-900">
			<div className="flex min-h-screen">
				{/* ================= LEFT PANEL ================= */}
				<section className="relative hidden min-h-screen overflow-hidden bg-blue-600 lg:flex lg:w-2/5">
					{/* Background shapes */}
					<div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500 opacity-40" />

					<div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-700 opacity-40" />

					{/* Content */}
					<div className="relative z-10 flex w-full flex-col items-center justify-center px-10 text-center">
						<div className="max-w-xl">
							{/* Small Badge */}
							<div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
								<span className="h-2 w-2 rounded-full bg-white" />

								<span className="text-xs font-medium text-white">
									Workforce Management Platform
								</span>
							</div>

							<h2 className="text-4xl font-semibold leading-tight text-white xl:text-5xl">
								Manage your workforce.
								<br />
								<span className="text-blue-100">Build better teams.</span>
							</h2>

							<p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-blue-100/80">
								Everything you need to manage employees, attendance, operations
								and workforce performance — all in one place.
							</p>

							{/* Dashboard Preview */}
							<div className="mx-auto mt-12 w-full max-w-lg rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-md">
								<div className="rounded-xl bg-white p-5 text-left">
									<div className="flex items-center justify-between">
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

									<div className="mt-6 grid grid-cols-3 gap-3">
										<div className="rounded-lg bg-slate-50 p-3">
											<p className="text-[9px] text-slate-400">Present</p>

											<p className="mt-1 text-sm font-bold text-slate-800">
												218
											</p>
										</div>

										<div className="rounded-lg bg-slate-50 p-3">
											<p className="text-[9px] text-slate-400">On Leave</p>

											<p className="mt-1 text-sm font-bold text-slate-800">
												18
											</p>
										</div>

										<div className="rounded-lg bg-slate-50 p-3">
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
				<section className="flex w-full items-center justify-center px-6 py-8 sm:px-10 lg:w-3/5  xl:px-4 ">
					<div className="w-full  px-10">
						{/* Logo */}
						<div className="flex justify-between items-center ">
							<div>
								<a href="/" className="inline-flex items-center gap-2">
									<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white shadow-sm">
										W
									</span>

									<span className="text-sm font-black tracking-tight text-slate-950">
										Workforce
										<span className="text-blue-600">OS</span>
									</span>
								</a>
							</div>
							<div className="flex items-center justify-center gap-2">
								<p className="text-sm text-blue-500">
									Already have an account?
								</p>
								<a href="/login" className="text-sm hover:text-blue-700">
									{" "}
									Sign In
								</a>
							</div>
						</div>

						{/* Heading */}
						<div className="">
							<h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
								Create Your Organization
							</h1>

							<p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
								Get started with your free account and build a smarter workforce
								management system for your business.
							</p>
						</div>

						{/* Login Form */}
						<form
							onSubmit={handleSubmit}
							className="space-y-1 grid grid-cols-2 gap-6"
						>
							{/* Email */}
							<InputBox
								labelName="Company name"
								name="companyName"
								type="text"
								placeholder="Enter your company name"
								required
							/>

							{/* Password */}
							<InputBox
								labelName="Industry"
								name="industry"
								type="select"
								placeholder="Select industry"
								required
								options={[
									{ label: "Technology", value: "technology" },
									{ label: "Healthcare", value: "healthcare" },
									{ label: "Finance & Banking", value: "finance_banking" },
									{ label: "Education", value: "education" },
									{ label: "Retail", value: "retail" },
									{ label: "Manufacturing", value: "manufacturing" },
									{ label: "Real Estate", value: "real_estate" },
									{ label: "Travel & Tourism", value: "travel_tourism" },
									{ label: "Beauty & Wellness", value: "beauty_wellness" },
									{
										label: "Marketing & Advertising",
										value: "marketing_advertising",
									},
									{ label: "IT & Software", value: "it_software" },
									{ label: "Other", value: "other" },
								]}
							/>
							<InputBox
								labelName="Company Size"
								name="companySize"
								type="select"
								placeholder="Select company size"
								required
								options={[
									{ label: "1–10 Employees", value: "1-10" },
									{ label: "11–50 Employees", value: "11-50" },
									{ label: "51–200 Employees", value: "51-200" },
									{ label: "201–500 Employees", value: "201-500" },
									{ label: "501–1,000 Employees", value: "501-1000" },
									{ label: "1,001–5,000 Employees", value: "1001-5000" },
									{ label: "5,001–10,000 Employees", value: "5001-10000" },
									{ label: "10,000+ Employees", value: "10000+" },
								]}
							/>
							<InputBox
								labelName="Executive name"
								name="executiveName"
								type="text"
								placeholder="Enter your name"
								required
							/>
							<InputBox
								labelName="Email"
								name="email"
								type="email"
								placeholder="Enter your email"
								required
							/>
							<InputBox
								labelName="Contact Number"
								name="number"
								type="text"
								placeholder="Enter your contact number"
								required
							/>
						</form>
						<div className="flex items-center justify-between">
							<div className="flex justify-center items-center gap-1">
								<div>
									<InputBox type="checkbox" className="" />
								</div>

								<span className="text-xs text-slate-500">
									I agree to the{" "}
									<span className="text-blue-500">Terms & Condition</span> and{" "}
									<span className="text-blue-500">Privacy Policy</span>{" "}
								</span>
							</div>
						</div>

						<div className="pt-3">
							<Button
								LabelName="Sign In"
								type="submit"
								className="w-full justify-center py-3"
							/>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};

export default Register;
