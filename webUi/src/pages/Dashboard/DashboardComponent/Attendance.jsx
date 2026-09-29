import React, { useEffect, useRef, useState } from "react";
import {
	FaCamera,
	FaCheckCircle,
	FaClock,
	FaMapMarkerAlt,
	FaRedo,
	FaShieldAlt,
} from "react-icons/fa";

const ATTENDANCE_KEY = "employeeAttendance";

const Attendance = () => {
	const [isWithinRadius, setIsWithinRadius] = useState(false);

	const [isMarkedIn, setIsMarkedIn] = useState(false);
	const [capturedPhoto, setCapturedPhoto] = useState(null);
	const [cameraOpen, setCameraOpen] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const [checkInTime, setCheckInTime] = useState("");
	const [submittedTime, setSubmittedTime] = useState("");
	const [currentDate, setCurrentDate] = useState("");

	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const streamRef = useRef(null);

	/* =====================================
	   CURRENT DATE
	===================================== */
	useEffect(() => {
		const today = new Date();

		const date = today.toLocaleDateString("en-IN", {
			weekday: "long",
			day: "2-digit",
			month: "long",
			year: "numeric",
		});

		setCurrentDate(date);

		// Check saved attendance
		const savedAttendance = JSON.parse(localStorage.getItem(ATTENDANCE_KEY));
		localStorage.removeItem("employeeAttendance");

		if (savedAttendance) {
			if (savedAttendance.markedIn) {
				setIsMarkedIn(true);
				setCheckInTime(savedAttendance.checkInTime || "");
			}

			if (savedAttendance.photo) {
				setCapturedPhoto(savedAttendance.photo);
			}

			if (savedAttendance.submitted) {
				setIsSubmitted(true);
				setSubmittedTime(savedAttendance.submittedTime || "");
			}
		}

		return () => {
			stopCamera();
		};
	}, []);

	/* =====================================
	   STOP CAMERA
	===================================== */
	const stopCamera = () => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => {
				track.stop();
			});

			streamRef.current = null;
		}

		if (videoRef.current) {
			videoRef.current.srcObject = null;
		}

		setCameraOpen(false);
	};

	/* =====================================
	   LOCATION DEMO
	===================================== */
	const toggleLocation = () => {
		setIsWithinRadius((prev) => !prev);
	};

	/* =====================================
	   MARK AS IN
	===================================== */
	const handleMarkIn = () => {
		const existingData =
			JSON.parse(localStorage.getItem("employeeAttendance")) || {};

		const now = new Date();

		const updatedData = {
			...existingData,
			markedIn: true,
			markedInAt: now.toISOString(),
		};

		localStorage.setItem("employeeAttendance", JSON.stringify(updatedData));

		setIsMarkedIn(true);
	};
	/* =====================================
	   OPEN CAMERA
	===================================== */
	const openCamera = async () => {
		try {
			if (!navigator.mediaDevices?.getUserMedia) {
				alert("Camera is not supported by this browser.");
				return;
			}

			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: "user",
				},
				audio: false,
			});

			streamRef.current = stream;
			setCameraOpen(true);

			setTimeout(() => {
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
				}
			}, 100);
		} catch (error) {
			console.error("Camera Error:", error);

			alert("Camera permission is required to capture your attendance photo.");
		}
	};

	/* =====================================
	   CAPTURE PHOTO
	===================================== */
	const capturePhoto = () => {
		const video = videoRef.current;
		const canvas = canvasRef.current;

		if (!video || !canvas) {
			return;
		}

		if (!video.videoWidth || !video.videoHeight) {
			alert("Camera is still loading. Please try again.");
			return;
		}

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		const context = canvas.getContext("2d");

		context.drawImage(video, 0, 0, canvas.width, canvas.height);

		const photo = canvas.toDataURL("image/jpeg", 0.9);

		/* Save photo in localStorage */
		const existingData = JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || {};

		const updatedData = {
			...existingData,
			photo: photo,
			photoCaptured: true,
		};

		localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(updatedData));

		setCapturedPhoto(photo);

		stopCamera();
	};

	/* =====================================
	   RETAKE PHOTO
	===================================== */
	const retakePhoto = () => {
		const existingData = JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || {};

		const updatedData = {
			...existingData,
			photo: null,
			photoCaptured: false,
		};

		localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(updatedData));

		setCapturedPhoto(null);

		openCamera();
	};

	/* =====================================
	   SUBMIT ATTENDANCE
	===================================== */
	const handleSubmit = () => {
		const savedAttendance = JSON.parse(localStorage.getItem(ATTENDANCE_KEY));

		if (!savedAttendance?.markedIn || !savedAttendance?.photo) {
			return;
		}

		const now = new Date();

		const exactTime = now.toLocaleTimeString("en-IN", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: true,
		});

		const updatedData = {
			...savedAttendance,
			submitted: true,
			submittedTime: exactTime,
		};

		localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(updatedData));

		setSubmittedTime(exactTime);
		setIsSubmitted(true);
	};

	/* =====================================
	   SUBMIT BUTTON STATUS
	===================================== */
	const canSubmit = isMarkedIn && Boolean(capturedPhoto) && !isSubmitted;

	return (
		<div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-5xl">
				{/* ================= HEADER ================= */}
				<div className="mb-6">
					<h1 className="text-2xl font-semibold text-slate-900">Attendance</h1>

					<p className="mt-1 text-sm text-slate-500">
						Mark your attendance by verifying your location and capturing your
						current photo.
					</p>
				</div>

				{/* ================= MAIN CARD ================= */}
				<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
					{/* Header */}
					<div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
						<div>
							<h2 className="text-base font-semibold text-slate-800">
								Today's Attendance
							</h2>

							<p className="mt-1 text-xs text-slate-400">{currentDate}</p>
						</div>

						<div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600">
							<FaMapMarkerAlt />
							Office Radius: 100 meters
						</div>
					</div>

					<div className="grid grid-cols-1 gap-5 p-5 sm:p-7 lg:grid-cols-2">
						{/* ================= LOCATION ================= */}
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
								<div className="flex items-center justify-between gap-3">
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

							{/* Demo */}
							<button
								type="button"
								onClick={toggleLocation}
								className="mt-4 text-xs font-medium text-blue-600 hover:text-blue-700"
							>
								Demo: Change Location Status
							</button>

							<div
								className={`mt-4 rounded-xl border p-3 ${
									isWithinRadius
										? "border-green-100 bg-green-50"
										: "border-orange-100 bg-orange-50"
								}`}
							>
								<p
									className={`text-xs font-medium ${
										isWithinRadius ? "text-green-700" : "text-orange-700"
									}`}
								>
									{isWithinRadius
										? "✓ Location verified. You can mark attendance."
										: "⚠ You must be within 100 meters to mark attendance."}
								</p>
							</div>
						</div>

						{/* ================= ATTENDANCE ================= */}
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
										Mark in and capture your current photo before submitting.
									</p>
								</div>
							</div>

							{/* ================= ACTION BUTTONS ================= */}
							{!isSubmitted && (
								<div className="mt-8">
									<div className="flex flex-col gap-3 sm:flex-row">
										{/* MARK IN */}
										<button
											type="button"
											onClick={handleMarkIn}
											className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition ${
												isMarkedIn
													? "bg-green-100 text-green-700"
													: "bg-blue-600 text-white hover:bg-blue-700"
											}`}
										>
											<FaCheckCircle />
											{isMarkedIn ? "Marked In" : "Mark As In"}
										</button>

										{/* OPEN CAMERA */}
										<button
											type="button"
											onClick={openCamera}
											// disabled={!isMarkedIn}
											className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition ${
												isMarkedIn
													? "bg-slate-900 text-white hover:bg-slate-800"
													: "cursor-not-allowed bg-slate-100 text-slate-400"
											}`}
										>
											<FaCamera />
											Open Camera
										</button>
									</div>

									<p className="mt-3 text-center text-xs text-slate-400">
										{!isWithinRadius
											? "Move within 100 meters to enable Mark As In."
											: !isMarkedIn
												? "First mark yourself in, then capture your photo."
												: "You can now capture your attendance photo."}
									</p>
								</div>
							)}

							{/* ================= CHECK-IN INFO ================= */}
							{isMarkedIn && !isSubmitted && (
								<div className="mt-5 rounded-xl border border-green-100 bg-green-50 p-4">
									<div className="flex items-center gap-3">
										<div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600">
											<FaCheckCircle />
										</div>

										<div>
											<p className="text-sm font-semibold text-green-700">
												Marked In Successfully
											</p>

											<p className="mt-1 text-xs text-green-600">
												Check-in recorded
											</p>
										</div>
									</div>
								</div>
							)}

							{/* ================= CAMERA ================= */}
							{cameraOpen && !isSubmitted && (
								<div className="mt-5">
									<div className="overflow-hidden rounded-xl bg-slate-900">
										<video
											ref={videoRef}
											autoPlay
											playsInline
											muted
											className="aspect-video w-full object-cover"
										/>
									</div>

									<canvas ref={canvasRef} className="hidden" />

									<div className="mt-4 flex justify-center">
										<button
											type="button"
											onClick={capturePhoto}
											className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
										>
											<FaCamera size={20} />
										</button>
									</div>

									<p className="mt-3 text-center text-xs text-slate-400">
										Capture your current photo.
									</p>

									<button
										type="button"
										onClick={stopCamera}
										className="mx-auto mt-3 block text-xs font-medium text-slate-500 hover:text-slate-700"
									>
										Close Camera
									</button>
								</div>
							)}

							{/* ================= PHOTO ================= */}
							{capturedPhoto && !isSubmitted && (
								<div className="mt-5">
									<div className="overflow-hidden rounded-xl border border-green-100 bg-green-50 p-3">
										<div className="relative overflow-hidden rounded-lg">
											<img
												src={capturedPhoto}
												alt="Attendance"
												className="aspect-video w-full object-cover"
											/>

											<div className="absolute right-3 top-3 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
												Photo Saved
											</div>
										</div>

										<button
											type="button"
											onClick={retakePhoto}
											className="mt-3 flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700"
										>
											<FaRedo />
											Retake Photo
										</button>
									</div>
								</div>
							)}

							{/* ================= SUBMIT ================= */}
							{!isSubmitted && (
								<div className="mt-5">
									<button
										type="button"
										onClick={handleSubmit}
										disabled={!canSubmit}
										className={`w-full rounded-xl px-5 py-3 text-sm font-semibold transition ${
											canSubmit
												? "bg-blue-600 text-white hover:bg-blue-700"
												: "cursor-not-allowed bg-slate-200 text-slate-400"
										}`}
									>
										Submit Attendance
									</button>

									{!canSubmit && (
										<p className="mt-3 text-center text-xs text-slate-400">
											Mark In and save your attendance photo to enable Submit
											Attendance.
										</p>
									)}
								</div>
							)}

							{/* ================= SUBMITTED ================= */}
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

										{/* Exact Submit Time */}
										<div className="mt-4 rounded-xl bg-white p-4">
											<p className="text-xs text-slate-400">Submitted At</p>

											<p className="mt-1 text-xl font-semibold text-slate-900">
												{submittedTime}
											</p>
										</div>
									</div>

									{/* Attendance Details */}
									<div className="mt-4 grid grid-cols-2 gap-3">
										<div className="rounded-xl bg-slate-50 p-3">
											<p className="text-[11px] text-slate-400">Check In</p>

											<p className="mt-1 text-sm font-semibold text-slate-800">
												{checkInTime}
											</p>
										</div>

										<div className="rounded-xl bg-slate-50 p-3">
											<p className="text-[11px] text-slate-400">Status</p>

											<p className="mt-1 text-sm font-semibold text-green-600">
												Present
											</p>
										</div>
									</div>

									{/* Submitted Photo */}
									{capturedPhoto && (
										<div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
											<img
												src={capturedPhoto}
												alt="Attendance verification"
												className="max-h-64 w-full object-cover"
											/>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* ================= INFORMATION ================= */}
				<div className="mt-5 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
					<FaShieldAlt className="mt-0.5 shrink-0 text-blue-500" />

					<div>
						<p className="text-sm font-medium text-blue-800">
							Location-based attendance
						</p>

						<p className="mt-1 text-xs leading-5 text-blue-600">
							Attendance can be marked only within 100 meters of the registered
							office. A live camera photo must also be saved before attendance
							can be submitted.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Attendance;
