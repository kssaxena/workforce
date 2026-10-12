import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Timer,
} from "lucide-react";

import useAuth from "../../../hooks/useAuth";
import {
  checkIn,
  checkOut,
  getMyAttendance,
} from "../../../services/attendance";

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;

const dateKey = (value, timezone = "Asia/Kolkata") => {
  if (!value) return "";

  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(value));

    const part = (type) => parts.find((item) => item.type === type)?.value;

    return `${part("year")}-${part("month")}-${part("day")}`;
  } catch {
    return "";
  }
};

const shiftDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatTime = (value, timezone) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(new Date(value));
};

const formatDate = (value, timezone) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: timezone,
  }).format(new Date(value));
};

const formatDuration = (minutes = 0) => {
  const value = Math.max(0, Number(minutes) || 0);
  const hours = Math.floor(value / 60);
  const remaining = value % 60;

  return `${hours}h ${remaining}m`;
};

const getBrowserLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("This browser does not support location access."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          source: "WEB",
        }),
      (error) => {
        const messages = {
          1: "Location permission was denied. Allow location access in your browser and try again.",
          2: "Your current location could not be determined. Try again in an area with a better GPS signal.",
          3: "Location lookup timed out. Please try again.",
        };

        reject(
          new Error(
            messages[error.code] || "Unable to retrieve your current location.",
          ),
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  });

const StatCard = ({ icon: Icon, label, value, description }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>

      <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const EmployeeAttendance = () => {
  const { employee, company, user } = useAuth();

  const timezone = company?.settings?.timezone || "Asia/Kolkata";
  const gpsEnabled = company?.settings?.gpsAttendanceEnabled === true;

  const today = useMemo(() => dateKey(new Date(), timezone), [timezone]);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAttendance = useCallback(async (quiet = false) => {
    try {
      if (quiet) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      // Include surrounding dates so business-day boundaries and
      // overnight check-ins are not accidentally excluded by UTC dates.
      const response = await getMyAttendance({
        startDate: shiftDate(-8),
        endDate: shiftDate(1),
      });

      const data = unwrap(response);

      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load your attendance. Please try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  // An overnight shift may have started on the previous business day.
  const openRecord = records.find(
    (record) => record.checkIn?.timestamp && !record.checkOut?.timestamp,
  );

  const todayRecord = records.find(
    (record) => dateKey(record.date, timezone) === today,
  );

  const currentRecord = openRecord || todayRecord || null;

  const isCheckedIn = Boolean(
    openRecord?.checkIn?.timestamp && !openRecord?.checkOut?.timestamp,
  );

  const alreadyCompleted = Boolean(
    todayRecord?.checkIn?.timestamp && todayRecord?.checkOut?.timestamp,
  );

  const handleAttendanceAction = async (action) => {
    if (submitting) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // GPS coordinates are required by the business rules only when
      // company GPS attendance is enabled.
      const payload = gpsEnabled
        ? await getBrowserLocation()
        : { source: "WEB" };

      if (action === "check-in") {
        await checkIn(payload);
        setSuccess("Your check-in has been recorded successfully.");
      } else {
        await checkOut(payload);
        setSuccess("Your check-out has been recorded successfully.");
      }

      await loadAttendance(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to record attendance. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const employeeName =
    [employee?.firstName, employee?.lastName].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "Employee";

  const history = [...records]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-6 text-white sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
              <Activity size={14} />
              My workspace
            </div>

            <h2 className="mt-4 text-2xl font-black sm:text-3xl">
              Hello, {employeeName}
            </h2>

            <p className="mt-2 text-sm text-blue-100">
              Manage today's attendance and review your recent records.
            </p>

            <p className="mt-3 text-xs text-blue-200">
              {new Intl.DateTimeFormat("en-IN", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
                timeZone: timezone,
              }).format(new Date())}
            </p>
          </div>

          <div className="min-w-[190px] rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-xs font-medium text-blue-100">
              Today's attendance
            </p>

            <p className="mt-2 text-lg font-black">
              {isCheckedIn
                ? "Currently checked in"
                : alreadyCompleted
                  ? "Day completed"
                  : currentRecord?.status?.replaceAll("_", " ") ||
                    "Not marked yet"}
            </p>

            <p className="mt-2 text-xs text-blue-100">
              {isCheckedIn
                ? `Since ${formatTime(openRecord.checkIn.timestamp, timezone)}`
                : alreadyCompleted
                  ? `Checked out at ${formatTime(todayRecord.checkOut.timestamp, timezone)}`
                  : "Record your attendance below"}
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {success}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Clock3}
          label="Check-in"
          value={formatTime(currentRecord?.checkIn?.timestamp, timezone)}
          description="Recorded start time"
        />

        <StatCard
          icon={Timer}
          label="Check-out"
          value={formatTime(currentRecord?.checkOut?.timestamp, timezone)}
          description="Recorded end time"
        />

        <StatCard
          icon={CheckCircle2}
          label="Worked time"
          value={formatDuration(currentRecord?.totalWorkedMinutes)}
          description="Total recorded work"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Mark your attendance
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {gpsEnabled
                ? "Location verification is enabled by your company."
                : "Attendance will be recorded without GPS verification."}
            </p>
          </div>

          {gpsEnabled && (
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
              <MapPin size={14} />
              GPS verification enabled
            </span>
          )}
        </div>

        {gpsEnabled && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-blue-600" size={18} />
            <p className="text-xs leading-5 text-blue-800">
              Allow location access when prompted. Your company’s configured
              attendance radius and office coordinates will be checked by the
              server.
            </p>
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleAttendanceAction("check-in")}
            disabled={loading || submitting || isCheckedIn || alreadyCompleted}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting && !isCheckedIn ? (
              <LoaderCircle className="animate-spin" size={17} />
            ) : (
              <CheckCircle2 size={17} />
            )}
            {submitting && !isCheckedIn ? "Recording..." : "Check In"}
          </button>

          <button
            type="button"
            onClick={() => handleAttendanceAction("check-out")}
            disabled={loading || submitting || !isCheckedIn}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting && isCheckedIn ? (
              <LoaderCircle className="animate-spin" size={17} />
            ) : (
              <Clock3 size={17} />
            )}
            {submitting && isCheckedIn ? "Recording..." : "Check Out"}
          </button>
        </div>

        {alreadyCompleted && (
          <p className="mt-3 text-xs text-emerald-700">
            Your attendance for today has already been completed.
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <h3 className="font-black text-slate-900">Recent attendance</h3>
            <p className="mt-1 text-xs text-slate-500">
              Your latest recorded attendance entries.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadAttendance(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-12 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarDays className="mx-auto text-slate-300" size={28} />
            <p className="mt-3 text-sm font-bold text-slate-700">
              No attendance records yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Your attendance history will appear here after you mark it.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  {["Date", "Status", "Check-in", "Check-out", "Worked"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {history.map((record) => (
                  <tr key={record._id} className="border-t border-slate-100">
                    <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                      {formatDate(record.date, timezone)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                        {record.status?.replaceAll("_", " ") || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-600">
                      {formatTime(record.checkIn?.timestamp, timezone)}
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-600">
                      {formatTime(record.checkOut?.timestamp, timezone)}
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                      {formatDuration(record.totalWorkedMinutes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default EmployeeAttendance;
