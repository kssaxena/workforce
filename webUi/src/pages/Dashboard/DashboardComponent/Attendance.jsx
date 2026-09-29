import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FaCamera,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaRedo,
  FaShieldAlt,
} from "react-icons/fa";

import {
  checkIn,
  checkOut,
  getMyAttendance,
} from "../../../services/attendance";

const Attendance = () => {
  /* =====================================================
	   STATE
	===================================================== */

  const [attendance, setAttendance] = useState(null);

  const [loading, setLoading] = useState(true);
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");

  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const [currentDate, setCurrentDate] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  /* =====================================================
	   CURRENT DATE
	===================================================== */

  useEffect(() => {
    const today = new Date();

    const date = today.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    setCurrentDate(date);
  }, []);

  /* =====================================================
	   STOP CAMERA
	===================================================== */

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  /* =====================================================
	   LOAD ATTENDANCE
	===================================================== */

  const loadAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyAttendance();

      setAttendance(response?.data || []);
    } catch (err) {
      console.error("Attendance fetch error:", err);

      setError(err?.message || "Unable to load attendance.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  /* =====================================================
	   TODAY'S ATTENDANCE
	===================================================== */

  const todayAttendance = useMemo(() => {
    if (!Array.isArray(attendance)) {
      return null;
    }

    const today = new Date();

    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    ).getTime();

    return (
      attendance.find((item) => {
        if (!item?.date) {
          return false;
        }

        const itemDate = new Date(item.date);

        const itemDay = new Date(
          itemDate.getFullYear(),
          itemDate.getMonth(),
          itemDate.getDate(),
        ).getTime();

        return itemDay === todayDate;
      }) || null
    );
  }, [attendance]);

  /* =====================================================
	   GPS LOCATION
	===================================================== */

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,

            longitude: position.coords.longitude,

            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let message = "Unable to determine your location.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              message =
                "Location permission was denied. Please allow location access in your browser.";
              break;

            case error.POSITION_UNAVAILABLE:
              message = "Your current location is unavailable.";
              break;

            case error.TIMEOUT:
              message = "Location request timed out. Please try again.";
              break;

            default:
              break;
          }

          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        },
      );
    });
  };

  /* =====================================================
	   VERIFY LOCATION
	===================================================== */

  const handleVerifyLocation = async () => {
    try {
      setCheckingLocation(true);
      setLocationError("");
      setError("");
      setSuccess("");

      const currentLocation = await getCurrentLocation();

      setLocation(currentLocation);

      setSuccess(
        "Your current location has been detected. The server will verify the office radius when you check in.",
      );
    } catch (err) {
      console.error("Location error:", err);

      setLocationError(err?.message || "Unable to get your location.");
    } finally {
      setCheckingLocation(false);
    }
  };

  /* =====================================================
	   CHECK IN
	===================================================== */

  const handleCheckIn = async () => {
    try {
      setError("");
      setSuccess("");

      let currentLocation = location;

      /*
       * Always fetch a fresh location before
       * submitting attendance.
       */
      if (!currentLocation) {
        currentLocation = await getCurrentLocation();

        setLocation(currentLocation);
      }

      setSubmitting(true);

      const response = await checkIn({
        latitude: currentLocation.latitude,

        longitude: currentLocation.longitude,

        accuracy: currentLocation.accuracy,
      });

      setSuccess(response?.message || "Attendance checked in successfully.");

      await loadAttendance();
    } catch (err) {
      console.error("Check-in error:", err);

      setError(err?.message || "Unable to check in.");
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
	   CHECK OUT
	===================================================== */

  const handleCheckOut = async () => {
    try {
      setError("");
      setSuccess("");

      const currentLocation = await getCurrentLocation();

      setLocation(currentLocation);

      setSubmitting(true);

      const response = await checkOut({
        latitude: currentLocation.latitude,

        longitude: currentLocation.longitude,

        accuracy: currentLocation.accuracy,
      });

      setSuccess(response?.message || "Attendance checked out successfully.");

      await loadAttendance();
    } catch (err) {
      console.error("Check-out error:", err);

      setError(err?.message || "Unable to check out.");
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
	   CAMERA
	===================================================== */

  const openCamera = async () => {
    try {
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera is not supported by this browser.");

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

      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch (err) {
      console.error("Camera error:", err);

      setError(
        "Camera permission is required to capture your attendance photo.",
      );
    }
  };

  /* =====================================================
	   CAPTURE PHOTO
	===================================================== */

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      setError("Camera is still loading. Please try again.");

      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photo = canvas.toDataURL("image/jpeg", 0.9);

    setCapturedPhoto(photo);

    stopCamera();
  };

  /* =====================================================
	   RETAKE PHOTO
	===================================================== */

  const retakePhoto = () => {
    setCapturedPhoto(null);
    openCamera();
  };

  /* =====================================================
	   FORMAT TIME
	===================================================== */

  const formatTime = (timestamp) => {
    if (!timestamp) {
      return "--";
    }

    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  /* =====================================================
	   FORMAT MINUTES
	===================================================== */

  const formatMinutes = (minutes) => {
    if (minutes === undefined || minutes === null) {
      return "--";
    }

    const hours = Math.floor(minutes / 60);

    const remainingMinutes = minutes % 60;

    if (!hours) {
      return `${remainingMinutes}m`;
    }

    return `${hours}h ${remainingMinutes}m`;
  };

  /* =====================================================
	   STATES
	===================================================== */

  const hasCheckedIn = Boolean(todayAttendance?.checkIn?.timestamp);

  const hasCheckedOut = Boolean(todayAttendance?.checkOut?.timestamp);

  const canCheckIn = !loading && !hasCheckedIn && !submitting;

  const canCheckOut = !loading && hasCheckedIn && !hasCheckedOut && !submitting;

  /* =====================================================
	   RENDER
	===================================================== */

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Attendance</h1>

          <p className="mt-1 text-sm text-slate-500">
            Verify your location and manage today's attendance.
          </p>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* MAIN CARD */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Today's Attendance
              </h2>

              <p className="mt-1 text-xs text-slate-400">{currentDate}</p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600">
              <FaMapMarkerAlt />
              GPS verified
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 p-5 sm:p-7 lg:grid-cols-2">
            {/* LOCATION */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    location
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
                    {location
                      ? "Your current location has been detected."
                      : "We need your current location before checking in."}
                  </p>
                </div>
              </div>

              {/* LOCATION DETAILS */}

              <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                {location ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Latitude</span>

                      <span className="text-sm font-medium text-slate-700">
                        {location.latitude.toFixed(6)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Longitude</span>

                      <span className="text-sm font-medium text-slate-700">
                        {location.longitude.toFixed(6)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Accuracy</span>

                      <span className="text-sm font-medium text-slate-700">
                        {Math.round(location.accuracy)} meters
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    Location has not been detected yet.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleVerifyLocation}
                disabled={checkingLocation}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaMapMarkerAlt />

                {checkingLocation ? "Detecting..." : "Detect My Location"}
              </button>

              {locationError && (
                <p className="mt-3 text-xs text-red-600">{locationError}</p>
              )}

              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
                <p className="text-xs leading-5 text-blue-700">
                  The server verifies your actual distance from the company's
                  configured attendance location. The browser cannot mark itself
                  "within radius."
                </p>
              </div>
            </div>

            {/* ATTENDANCE ACTIONS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FaClock />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Attendance Status
                  </h3>

                  <p className="text-xs text-slate-400">Live server status</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Check In</p>

                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {formatTime(todayAttendance?.checkIn?.timestamp)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Check Out</p>

                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {formatTime(todayAttendance?.checkOut?.timestamp)}
                  </p>
                </div>
              </div>

              {/* CHECK IN */}

              <button
                type="button"
                onClick={handleCheckIn}
                disabled={!canCheckIn}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                <FaCheckCircle />

                {submitting
                  ? "Processing..."
                  : hasCheckedIn
                    ? "Checked In"
                    : "Check In"}
              </button>

              {/* CHECK OUT */}

              <button
                type="button"
                onClick={handleCheckOut}
                disabled={!canCheckOut}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <FaClock />

                {hasCheckedOut ? "Checked Out" : "Check Out"}
              </button>

              {/* WORKED TIME */}

              {todayAttendance && (
                <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-green-700">
                      Worked Time
                    </span>

                    <span className="text-sm font-semibold text-green-800">
                      {formatMinutes(todayAttendance.totalWorkedMinutes)}
                    </span>
                  </div>

                  {todayAttendance.isLate && (
                    <p className="mt-2 text-xs text-orange-700">
                      Late by {todayAttendance.lateMinutes} minutes
                    </p>
                  )}

                  {todayAttendance.isEarlyCheckout && (
                    <p className="mt-2 text-xs text-orange-700">
                      Early checkout by {todayAttendance.earlyCheckoutMinutes}{" "}
                      minutes
                    </p>
                  )}

                  {todayAttendance.overtimeMinutes > 0 && (
                    <p className="mt-2 text-xs text-blue-700">
                      Overtime: {todayAttendance.overtimeMinutes} minutes
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* CAMERA */}

          <div className="border-t border-slate-100 p-5 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Attendance Photo
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Captured locally for the current session.
                </p>
              </div>

              {!cameraOpen && !capturedPhoto && (
                <button
                  type="button"
                  onClick={openCamera}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <FaCamera />
                  Open Camera
                </button>
              )}
            </div>

            {cameraOpen && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="mx-auto max-h-[420px] w-full object-cover"
                />

                <div className="flex justify-center gap-3 p-4">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Capture
                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {capturedPhoto && (
              <div className="mt-5">
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <img
                    src={capturedPhoto}
                    alt="Attendance"
                    className="mx-auto max-h-[420px] w-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={retakePhoto}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <FaRedo />
                  Retake Photo
                </button>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* SECURITY NOTE */}

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-7">
            <div className="flex items-start gap-3">
              <FaShieldAlt className="mt-0.5 text-blue-600" />

              <p className="text-xs leading-5 text-slate-500">
                Attendance is validated by the Workforce OS backend using your
                authenticated employee account, company attendance policy and
                GPS coordinates.
              </p>
            </div>
          </div>
        </div>

        {/* HISTORY */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Recent Attendance
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Attendance records from the server
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">
              Loading attendance...
            </div>
          ) : !attendance?.length ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No attendance records found.
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400">
                    <th className="px-3 py-3 font-medium">Date</th>

                    <th className="px-3 py-3 font-medium">Check In</th>

                    <th className="px-3 py-3 font-medium">Check Out</th>

                    <th className="px-3 py-3 font-medium">Worked</th>

                    <th className="px-3 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.slice(0, 10).map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {new Date(item.date).toLocaleDateString("en-IN")}
                      </td>

                      <td className="px-3 py-3 text-sm text-slate-600">
                        {formatTime(item.checkIn?.timestamp)}
                      </td>

                      <td className="px-3 py-3 text-sm text-slate-600">
                        {formatTime(item.checkOut?.timestamp)}
                      </td>

                      <td className="px-3 py-3 text-sm text-slate-600">
                        {formatMinutes(item.totalWorkedMinutes)}
                      </td>

                      <td className="px-3 py-3">
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
