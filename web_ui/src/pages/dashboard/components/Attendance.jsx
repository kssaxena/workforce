import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coffee,
  Crosshair,
  LogIn,
  LogOut,
  MapPin,
  RefreshCw,
  Timer,
  AlertCircle,
  History,
} from "lucide-react";

import {
  checkIn,
  checkOut,
  getMyAttendance,
} from "../../../services/attendance";

const formatTime = (date) => {
  if (!date) return "--";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
};

const formatDate = (date) => {
  if (!date) return "--";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const formatMinutes = (minutes = 0) => {
  if (!minutes) return "0m";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
};

const getTodayString = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDateBefore = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const Attendance = () => {
  const today = getTodayString();

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [startDate, setStartDate] = useState(getDateBefore(6));

  const [endDate, setEndDate] = useState(today);

  const fetchAttendance = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getMyAttendance({
          startDate,
          endDate,
        });

        setAttendance(response?.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch attendance:", err);

        setError(err?.response?.data?.message || "Unable to load attendance.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [startDate, endDate],
  );

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const todayAttendance = useMemo(() => {
    return attendance.find((item) => {
      if (!item?.date) return false;

      const date = new Date(item.date);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}` === today;
    });
  }, [attendance, today]);

  const isCheckedIn =
    Boolean(todayAttendance?.checkIn?.timestamp) &&
    !todayAttendance?.checkOut?.timestamp;

  const isCheckedOut = Boolean(todayAttendance?.checkOut?.timestamp);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationLoading(false);
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        setLocationLoading(false);
      },
      (geoError) => {
        setLocationLoading(false);

        let message = "Unable to retrieve your location.";

        if (geoError.code === 1) {
          message =
            "Location permission was denied. Please allow location access in your browser.";
        }

        if (geoError.code === 2) {
          message = "Your location could not be determined. Please try again.";
        }

        if (geoError.code === 3) {
          message = "Location request timed out. Please try again.";
        }

        setLocationError(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  const performAttendanceAction = async (action) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      let currentLocation = location;

      if (!currentLocation) {
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported by this browser.");
        }

        currentLocation = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              });
            },
            (geoError) => {
              if (geoError.code === 1) {
                reject(
                  new Error(
                    "Location permission was denied. Please allow location access.",
                  ),
                );
              } else if (geoError.code === 2) {
                reject(new Error("Your location could not be determined."));
              } else if (geoError.code === 3) {
                reject(new Error("Location request timed out."));
              } else {
                reject(new Error("Unable to retrieve your location."));
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0,
            },
          );
        });

        setLocation(currentLocation);
      }

      const payload = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy,
        source: "WEB",
      };

      if (action === "CHECK_IN") {
        const response = await checkIn(payload);

        setSuccess(response?.data?.message || "Check-in successful.");
      } else {
        const response = await checkOut(payload);

        setSuccess(response?.data?.message || "Check-out successful.");
      }

      await fetchAttendance({ refresh: true });
    } catch (err) {
      console.error("Attendance action failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Attendance action failed.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckIn = () => {
    performAttendanceAction("CHECK_IN");
  };

  const handleCheckOut = () => {
    performAttendanceAction("CHECK_OUT");
  };

  const handleDateRangeChange = () => {
    fetchAttendance();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>

        <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-gray-500">Workforce</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            Attendance
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Track your working hours and daily attendance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchAttendance({ refresh: true })}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main attendance card */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <CalendarDays className="h-4 w-4" />
                {new Intl.DateTimeFormat("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date())}
              </div>

              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                {isCheckedIn
                  ? "You are currently working"
                  : isCheckedOut
                    ? "Attendance completed"
                    : "Ready to start your day?"}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {isCheckedIn
                  ? "Your attendance session is active."
                  : isCheckedOut
                    ? "You have successfully completed today's attendance."
                    : "Check in to start recording your working hours."}
              </p>
            </div>

            <div
              className={`flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl ${
                isCheckedIn
                  ? "bg-green-50 text-green-700"
                  : isCheckedOut
                    ? "bg-gray-100 text-gray-600"
                    : "bg-gray-900 text-white"
              }`}
            >
              <Clock3 className="h-6 w-6" />

              <span className="mt-1 text-xs font-medium">
                {isCheckedIn ? "WORKING" : isCheckedOut ? "DONE" : "READY"}
              </span>
            </div>
          </div>

          {/* Today's timings */}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <LogIn className="h-4 w-4" />
                Check In
              </div>

              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatTime(todayAttendance?.checkIn?.timestamp)}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <LogOut className="h-4 w-4" />
                Check Out
              </div>

              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatTime(todayAttendance?.checkOut?.timestamp)}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Timer className="h-4 w-4" />
                Worked
              </div>

              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatMinutes(todayAttendance?.totalWorkedMinutes)}
              </p>
            </div>
          </div>

          {/* Action */}
          <div className="mt-6">
            {!todayAttendance ? (
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogIn className="h-5 w-5" />

                {actionLoading ? "Checking in..." : "Check In"}
              </button>
            ) : isCheckedIn ? (
              <button
                type="button"
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-5 w-5" />

                {actionLoading ? "Checking out..." : "Check Out"}
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 px-5 py-3.5 text-sm font-medium text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                Today's attendance is complete
              </div>
            )}
          </div>
        </div>

        {/* Location card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <MapPin className="h-5 w-5 text-gray-600" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Attendance Location
              </h3>

              <p className="text-xs text-gray-500">
                Required for attendance verification
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            {location ? (
              <>
                <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Location detected
                </div>

                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  <p>Latitude: {location.latitude.toFixed(6)}</p>

                  <p>Longitude: {location.longitude.toFixed(6)}</p>

                  {location.accuracy && (
                    <p>Accuracy: {Math.round(location.accuracy)}m</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Crosshair className="h-4 w-4" />
                  Location not detected
                </div>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Your location is used to verify attendance when GPS attendance
                  is enabled.
                </p>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={locationLoading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            <Crosshair
              className={`h-4 w-4 ${locationLoading ? "animate-spin" : ""}`}
            />

            {locationLoading ? "Detecting..." : "Detect My Location"}
          </button>

          {locationError && (
            <p className="mt-3 text-xs leading-5 text-red-600">
              {locationError}
            </p>
          )}
        </div>
      </div>

      {/* Today's metrics */}
      {todayAttendance && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Late</p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatMinutes(todayAttendance.lateMinutes)}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {todayAttendance.isLate ? "Late arrival" : "On time"}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Early Checkout</p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatMinutes(todayAttendance.earlyCheckoutMinutes)}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              {todayAttendance.isEarlyCheckout
                ? "Left early"
                : "No early checkout"}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Overtime</p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatMinutes(todayAttendance.overtimeMinutes)}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Additional working time
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Status</p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {todayAttendance.status || "--"}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Today's attendance status
            </p>
          </div>
        </div>
      )}

      {/* History */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-gray-500" />

              <h2 className="font-semibold text-gray-900">
                Attendance History
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Review your attendance records.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />

            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />

            <button
              type="button"
              onClick={handleDateRangeChange}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Apply
            </button>
          </div>
        </div>

        {attendance.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <CalendarDays className="h-5 w-5 text-gray-400" />
            </div>

            <p className="mt-3 text-sm font-medium text-gray-700">
              No attendance records
            </p>

            <p className="mt-1 text-xs text-gray-500">
              No attendance data was found for the selected period.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-3">Date</th>

                  <th className="px-5 py-3">Check In</th>

                  <th className="px-5 py-3">Check Out</th>

                  <th className="px-5 py-3">Worked</th>

                  <th className="px-5 py-3">Late</th>

                  <th className="px-5 py-3">Overtime</th>

                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {attendance.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-gray-800">
                      {formatDate(item.date)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatTime(item.checkIn?.timestamp)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatTime(item.checkOut?.timestamp)}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-800">
                      {formatMinutes(item.totalWorkedMinutes)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatMinutes(item.lateMinutes)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatMinutes(item.overtimeMinutes)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.status === "PRESENT"
                            ? "bg-green-50 text-green-700"
                            : item.status === "HALF_DAY"
                              ? "bg-yellow-50 text-yellow-700"
                              : item.status === "ON_LEAVE"
                                ? "bg-blue-50 text-blue-700"
                                : item.status === "HOLIDAY"
                                  ? "bg-purple-50 text-purple-700"
                                  : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.status || "--"}
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
  );
};

export default Attendance;
