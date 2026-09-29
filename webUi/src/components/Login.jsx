import React, { useState } from "react";
import InputBox from "./Input";
import Button from "./Button";
import {
	Link,
	useNavigate,
	useParams,
	useSearchParams,
} from "react-router-dom";
import { loginHeader } from "../constant/constant";

const Login = () => {
	const navigate = useNavigate();
	const { type } = useParams();

	const [formData, setFormData] = useState({
		email: "",
		password: "",
		role: "",
		employeeId: "",
		companyId: "",
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

		console.log("Form Data:", formData);

		navigate("/dashboard");
	};

	return (
		<div className="min-h-screen bg-white text-slate-900">
			<div className="flex min-h-screen">
				{/* ================= LEFT PANEL ================= */}
				<section className="flex w-full items-center justify-center px-6 py-10 sm:px-10 lg:w-2/5 lg:px-12 xl:px-16 ">
					<div className="w-full max-w-md space-y-4 ">
						{/* Logo */}
						<div className="">
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

						{/* Heading */}
						<div>
							<h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
								{loginHeader[type]?.heading || "Welcome Back"}
							</h1>

							<p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
								{loginHeader[type]?.description ||
									"Sign in to your account and continue managing your workforce."}
							</p>
						</div>

						{/* Login Form */}
						<form onSubmit={handleSubmit} className="space-y-1">
							{/* ================= COMPANY LOGIN ================= */}
							{type === "company" && (
								<>
									<InputBox
										labelName="Company Email"
										name="email"
										type="email"
										placeholder="Enter your company email"
										value={formData.email}
										onChange={handleChange}
										required
									/>

									<InputBox
										labelName="Password"
										name="password"
										type="password"
										placeholder="Enter your password"
										value={formData.password}
										onChange={handleChange}
										required
									/>
								</>
							)}

							{/* ================= COMPANY TEAM LOGIN ================= */}
							{type === "companyTeam" && (
								<>
									<InputBox
										labelName="Company Id"
										name="companyId"
										type="text"
										placeholder="Enter your company Id"
										value={formData.companyId}
										onChange={handleChange}
										required
									/>

									<InputBox
										labelName="Role"
										name="role"
										type="select"
										value={formData.role}
										onChange={handleChange}
										options={[
											{
												label: "HR",
												value: "hr",
											},
											{
												label: "Executive",
												value: "executive",
											},
										]}
										required
									/>

									<InputBox
										labelName="Password"
										name="password"
										type="password"
										placeholder="Enter your password"
										value={formData.password}
										onChange={handleChange}
										required
									/>
								</>
							)}

							{/* ================= MANAGER / TEAM LEADER LOGIN ================= */}
							{type === "manager" && (
								<>
									<InputBox
										labelName="Company Id"
										name="companyId"
										type="text"
										placeholder="Enter your company id"
										value={formData.companyId}
										onChange={handleChange}
										required
									/>

									<InputBox
										labelName="Role"
										name="role"
										type="select"
										value={formData.role}
										onChange={handleChange}
										options={[
											{
												label: "Manager",
												value: "manager",
											},
											{
												label: "Team Leader",
												value: "teamLeader",
											},
										]}
										required
									/>

									<InputBox
										labelName="Password"
										name="password"
										type="password"
										placeholder="Enter your password"
										value={formData.password}
										onChange={handleChange}
										required
									/>
								</>
							)}

							{/* ================= EMPLOYEE LOGIN ================= */}
							{type === "employee" && (
								<>
									<InputBox
										labelName="Employee ID"
										name="employeeId"
										type="text"
										placeholder="Enter your employee ID"
										value={formData.employeeId}
										onChange={handleChange}
										required
									/>
									<InputBox
										labelName="Email"
										name="email"
										type="email"
										placeholder="Enter your employee ID"
										value={formData.email}
										onChange={handleChange}
										required
									/>
									<InputBox
										labelName="Contact number"
										name="contact"
										type="text"
										placeholder="Enter your contact number"
										value={formData.employeeId}
										onChange={handleChange}
										required
									/>

									<InputBox
										labelName="Password"
										name="password"
										type="password"
										placeholder="Enter your password"
										value={formData.password}
										onChange={handleChange}
										required
									/>
								</>
							)}

							{/* Remember + Forgot */}
							<div className="flex items-center justify-between">
								<div className="flex justify-center items-center gap-1">
									<div>
										<InputBox type="checkbox" className="" />
									</div>

									<span className="text-xs text-slate-500">Remember me</span>
								</div>

								<a
									href="#"
									className="text-xs font-medium text-blue-600 transition hover:text-blue-700"
								>
									Forgot Password?
								</a>
							</div>

							{/* Login Button */}
							<div className="pt-3">
								<Button
									LabelName="Sign In"
									type="submit"
									className="w-full justify-center py-3"
								/>
							</div>
						</form>

						{/* Register */}
						<div className="mt-8 text-center">
							<p className="text-xs text-slate-400">
								Don't have an account?{" "}
								<a
									href="/register"
									className="font-semibold text-blue-600 hover:text-blue-700"
								>
									Create account
								</a>
							</p>
						</div>
					</div>
				</section>

				{/* ================= RIGHT PANEL ================= */}
				<section className="relative hidden min-h-screen overflow-hidden bg-blue-600 lg:flex lg:w-3/5">
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
			</div>
		</div>
	);
};

export default Login;
