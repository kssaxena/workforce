import React, { useState } from "react";
import {
	FaCheckCircle,
	FaClock,
	FaMapMarkerAlt,
	FaShieldAlt,
} from "react-icons/fa";
import Button from "../../../components/Button";

const Attendance = () => {
	const [isWithinRadius, setIsWithinRadius] = useState(false);
	const [isMarkedIn, setIsMarkedIn] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleMarkIn = () => {
		setIsMarkedIn(true);
	};

	const handleSubmit = () => {
		setIsSubmitted(true);
	};

	return (
		<div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-5xl">
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-2xl font-semibold text-slate-900">Attendance</h1>

					<p className="mt-1 text-sm text-slate-500">
						Mark your attendance by verifying your location within the office
						radius.
					</p>
				</div>

				{/* Main Card */}
				<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
					{/* Card Header */}
					<div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
						<div>
							<h2 className="text-base font-semibold text-slate-800">
								Today's Attendance
							</h2>

							<p className="mt-1 text-xs text-slate-400">
								Thursday, 24 September 2026
							</p>
						</div>

						<div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600">
							<FaMapMarkerAlt />
							Office Radius: 100 meters
						</div>
					</div>

					<div className="grid grid-cols-1 gap-5 p-5 sm:p-7 lg:grid-cols-2">
						{/* Location Card */}
						<div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
							<div className="flex items-start gap-4">
								<div
									className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
										isWithinRadius
											? "bg-green-100 text-green-600"
											: "bg-orange-100 text-orange-600"
									}`}
								>
									<FaMapMarkerAlt />
								</div>

								<div>
									<h3 className="text-sm font-semibold text-slate-800">
										Location Verification
									</h3>

									<p className="mt-1 text-sm leading-6 text-slate-500">
										{isWithinRadius
											? "You are within the office radius."
											: "You are outside the office radius."}
									</p>
								</div>
							</div>

							{/* Distance */}
							<div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs text-slate-400">
											Distance from office
										</p>

										<p className="mt-1 text-2xl font-semibold text-slate-900">
											{isWithinRadius ? "72" : "250"}{" "}
											<span className="text-sm font-medium text-slate-400">
												meters
											</span>
										</p>
									</div>

									<span
										className={`rounded-full px-3 py-1 text-xs font-medium ${
											isWithinRadius
												? "bg-green-50 text-green-600"
												: "bg-red-50 text-red-500"
										}`}
									>
										{isWithinRadius ? "Within Radius" : "Outside Radius"}
									</span>
								</div>
							</div>

							{/* Demo Toggle */}
							<button
								type="button"
								onClick={() => setIsWithinRadius(!isWithinRadius)}
								className="mt-4 text-xs font-medium text-blue-600 hover:text-blue-700"
							>
								Demo: Change Location Status
							</button>
						</div>

						{/* Attendance Card */}
						<div className="rounded-2xl border border-slate-200 bg-white p-5">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
									<FaClock />
								</div>

								<div>
									<h3 className="text-sm font-semibold text-slate-800">
										Mark Attendance
									</h3>

									<p className="mt-1 text-xs text-slate-400">
										Verify your location before marking attendance.
									</p>
								</div>
							</div>

							{/* Before Mark In */}
							{!isMarkedIn && !isSubmitted && (
								<div className="mt-8 text-center">
									<Button
										LabelName="Mark As In"
										disabled={!isWithinRadius}
										onClick={handleMarkIn}
										className="mx-auto min-w-40 justify-center"
									/>

									<p className="mt-3 text-xs text-slate-400">
										{isWithinRadius
											? "You can now mark your attendance."
											: "You must be within 100 meters of the office."}
									</p>
								</div>
							)}

							{/* After Mark In */}
							{isMarkedIn && !isSubmitted && (
								<div className="mt-6">
									<div className="rounded-xl border border-green-100 bg-green-50 p-4">
										<div className="flex items-center gap-3">
											<div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600">
												<FaCheckCircle />
											</div>

											<div>
												<p className="text-sm font-semibold text-green-700">
													Checked In Successfully
												</p>

												<p className="mt-1 text-xs text-green-600">
													Check-in time: 09:42 AM
												</p>
											</div>
										</div>
									</div>

									<div className="mt-5">
										<Button
											LabelName="Submit Attendance"
											onClick={handleSubmit}
											className="w-full justify-center"
										/>
									</div>
								</div>
							)}

							{/* Submitted */}
							{isSubmitted && (
								<div className="mt-6">
									<div className="rounded-xl border border-green-100 bg-green-50 p-5 text-center">
										<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
											<FaCheckCircle />
										</div>

										<h3 className="mt-3 text-sm font-semibold text-green-700">
											Attendance Submitted
										</h3>

										<p className="mt-1 text-xs text-green-600">
											Your attendance has been recorded successfully.
										</p>
									</div>

									<div className="mt-4 grid grid-cols-2 gap-3">
										<div className="rounded-xl bg-slate-50 p-3">
											<p className="text-[11px] text-slate-400">Check In</p>

											<p className="mt-1 text-sm font-semibold text-slate-800">
												09:42 AM
											</p>
										</div>

										<div className="rounded-xl bg-slate-50 p-3">
											<p className="text-[11px] text-slate-400">Status</p>

											<p className="mt-1 text-sm font-semibold text-green-600">
												Present
											</p>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Information Card */}
				<div className="mt-5 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
					<FaShieldAlt className="mt-0.5 shrink-0 text-blue-500" />

					<div>
						<p className="text-sm font-medium text-blue-800">
							Location-based attendance
						</p>

						<p className="mt-1 text-xs leading-5 text-blue-600">
							You can mark your attendance only when you are within 100 meters
							of the registered office location.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Attendance;
