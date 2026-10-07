import React, { useEffect, useMemo, useState } from "react";

import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coffee,
  FileText,
  MapPin,
  RefreshCw,
  Search,
  Timer,
  UserCheck,
  UserMinus,
  Users,
  X,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  LogIn,
  LogOut,
  AlertCircle,
  Moon,
  CalendarOff,
} from "lucide-react";

import {
  getAttendanceDashboard,
  getAttendanceDetail,
} from "../../../services/attendance";

/* =========================================================
   HELPERS
========================================================= */

const formatTime = (timestamp, timezone = "Asia/Kolkata") => {
  if (!timestamp) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    }).format(new Date(timestamp));
  } catch {
    return "—";
  }
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "—";
  }
};

const formatMinutes = (minutes = 0) => {
  const totalMinutes = Math.max(0, Number(minutes) || 0);

  const hours = Math.floor(totalMinutes / 60);

  const remainingMinutes = totalMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

const formatDistance = (distance) => {
  if (distance === null || distance === undefined) {
    return "—";
  }

  const value = Number(distance);

  if (Number.isNaN(value)) {
    return "—";
  }

  if (value < 1000) {
    return `${Math.round(value)} m`;
  }

  return `${(value / 1000).toFixed(2)} km`;
};

const getEmployeeName = (employee) => {
  if (!employee) {
    return "Unknown Employee";
  }

  return [employee.firstName, employee.lastName].filter(Boolean).join(" ");
};

const getInitials = (employee) => {
  if (!employee) {
    return "?";
  }

  const first = employee.firstName?.charAt(0)?.toUpperCase() || "";

  const last = employee.lastName?.charAt(0)?.toUpperCase() || "";

  return `${first}${last}` || "?";
};

/* =========================================================
   STATUS
========================================================= */

const STATUS_CONFIG = {
  PRESENT: {
    label: "Present",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dotClass: "bg-emerald-500",
    icon: CheckCircle2,
  },

  ABSENT: {
    label: "Absent",
    className: "bg-rose-50 text-rose-700 border-rose-100",
    dotClass: "bg-rose-500",
    icon: UserMinus,
  },

  HALF_DAY: {
    label: "Half Day",
    className: "bg-amber-50 text-amber-700 border-amber-100",
    dotClass: "bg-amber-500",
    icon: Clock3,
  },

  ON_LEAVE: {
    label: "On Leave",
    className: "bg-blue-50 text-blue-700 border-blue-100",
    dotClass: "bg-blue-500",
    icon: CalendarDays,
  },

  HOLIDAY: {
    label: "Holiday",
    className: "bg-violet-50 text-violet-700 border-violet-100",
    dotClass: "bg-violet-500",
    icon: CalendarOff,
  },

  WEEK_OFF: {
    label: "Week Off",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    dotClass: "bg-slate-400",
    icon: Moon,
  },
};

/* =========================================================
   SMALL COMPONENTS
========================================================= */

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.ABSENT;

  const Icon = config.icon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-[10px] font-bold",
        config.className,
      ].join(" ")}
    >
      <span className={["size-1.5 rounded-full", config.dotClass].join(" ")} />

      <Icon size={11} />

      {config.label}
    </span>
  );
};

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconClass = "bg-slate-100 text-slate-600",
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-slate-800">
            {value}
          </p>

          <p className="mt-1 text-[10px] font-medium text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={[
            "grid size-9 shrink-0 place-items-center rounded-xl",
            iconClass,
          ].join(" ")}
        >
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, icon: Icon }) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={13} className="text-slate-400" />}

        <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-slate-400">
          {label}
        </p>
      </div>

      <p className="mt-1.5 text-xs font-bold text-slate-700">{value || "—"}</p>
    </div>
  );
};

const Section = ({ title, icon: Icon, children }) => {
  return (
    <section className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
      <div className="mb-3 flex items-center gap-2">
        {Icon && (
          <div className="grid size-7 place-items-center rounded-lg bg-slate-100 text-slate-500">
            <Icon size={14} />
          </div>
        )}

        <h3 className="text-xs font-black text-slate-800">{title}</h3>
      </div>

      {children}
    </section>
  );
};

/* =========================================================
   DETAIL DRAWER
========================================================= */

const AttendanceDetailDrawer = ({ detail, loading, error, onClose }) => {
  if (!detail && !loading && !error) {
    return null;
  }

  const employee = detail?.employee;

  const attendance = detail?.attendance;

  const schedule = detail?.schedule;

  const context = detail?.context;

  const timezone = detail?.timezone || "Asia/Kolkata";

  const status = detail?.status || attendance?.status || "ABSENT";

  const checkIn = attendance?.checkIn;

  const checkOut = attendance?.checkOut;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-sm font-black text-blue-600">
                {getInitials(employee)}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-sm font-black text-slate-800">
                    {getEmployeeName(employee)}
                  </h2>

                  <StatusBadge status={status} />
                </div>

                <p className="mt-1 truncate text-[11px] font-medium text-slate-400">
                  {employee?.employeeCode || "—"}
                  {" · "}
                  {employee?.designation || "Employee"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <X size={17} />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-slate-400" />

              <span className="text-[11px] font-semibold text-slate-500">
                {formatDate(detail?.date)}
              </span>
            </div>

            <span className="text-[10px] font-semibold text-slate-400">
              {timezone}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {loading && (
            <div className="space-y-4">
              <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />

              <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />

              <div className="grid grid-cols-2 gap-3">
                <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
              </div>

              <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
              <div className="flex items-start gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-rose-500">
                  <AlertCircle size={17} />
                </div>

                <div>
                  <p className="text-sm font-black text-rose-700">
                    Unable to load attendance
                  </p>

                  <p className="mt-1 text-xs leading-5 text-rose-600">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && detail && (
            <div className="space-y-6">
              {/* Employee */}
              <Section title="Employee" icon={UserCheck}>
                <div className="grid grid-cols-2 gap-3">
                  <DetailItem
                    label="Employee Code"
                    value={employee?.employeeCode}
                  />

                  <DetailItem
                    label="Designation"
                    value={employee?.designation}
                  />

                  <DetailItem
                    label="Department"
                    value={detail?.department?.name}
                    icon={Building2}
                  />

                  <DetailItem
                    label="Organization Unit"
                    value={detail?.organizationUnit?.name}
                  />

                  <DetailItem
                    label="Reporting Manager"
                    value={
                      detail?.reportsTo
                        ? getEmployeeName(detail.reportsTo)
                        : "No reporting manager"
                    }
                  />

                  <DetailItem
                    label="Employment Status"
                    value={employee?.employmentStatus}
                  />
                </div>
              </Section>

              {/* Schedule */}
              <Section title="Work Schedule" icon={BriefcaseBusiness}>
                {schedule ? (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-black text-slate-800">
                          {schedule.name}
                        </p>

                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                          {schedule.code}
                        </p>
                      </div>

                      {schedule.isDefault && (
                        <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-blue-600 shadow-sm">
                          Company Default
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <DetailItem
                        label="Working Day"
                        value={schedule.day?.isWorkingDay ? "Yes" : "No"}
                      />

                      <DetailItem
                        label="Scheduled Hours"
                        value={formatMinutes(
                          schedule.day?.scheduledWorkingMinutes,
                        )}
                      />

                      <DetailItem
                        label="Start Time"
                        value={schedule.day?.startTime}
                      />

                      <DetailItem
                        label="End Time"
                        value={schedule.day?.endTime}
                      />

                      <DetailItem
                        label="Break"
                        value={`${schedule.day?.breakMinutes || 0} min`}
                        icon={Coffee}
                      />

                      <DetailItem
                        label="Day"
                        value={
                          schedule.day?.isWorkingDay
                            ? "Working day"
                            : "Week off"
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                    <p className="text-xs font-bold text-amber-700">
                      No work schedule assigned
                    </p>

                    <p className="mt-1 text-[11px] text-amber-600">
                      This employee does not currently have a usable work
                      schedule.
                    </p>
                  </div>
                )}
              </Section>

              {/* Attendance */}
              <Section title="Attendance" icon={Activity}>
                <div className="grid grid-cols-2 gap-3">
                  <DetailItem
                    label="Status"
                    value={STATUS_CONFIG[status]?.label || status}
                  />

                  <DetailItem
                    label="Worked"
                    value={formatMinutes(attendance?.totalWorkedMinutes)}
                    icon={Timer}
                  />

                  <DetailItem
                    label="Scheduled"
                    value={formatMinutes(attendance?.scheduledWorkingMinutes)}
                  />

                  <DetailItem
                    label="Late"
                    value={
                      attendance?.isLate
                        ? `${formatMinutes(attendance.lateMinutes)} late`
                        : "On time"
                    }
                  />

                  <DetailItem
                    label="Early Checkout"
                    value={
                      attendance?.isEarlyCheckout
                        ? formatMinutes(attendance.earlyCheckoutMinutes)
                        : "No"
                    }
                  />

                  <DetailItem
                    label="Overtime"
                    value={formatMinutes(attendance?.overtimeMinutes)}
                  />
                </div>
              </Section>

              {/* Check In / Check Out */}
              <Section title="Check-in & Check-out" icon={Clock3}>
                <div className="space-y-3">
                  {/* Check in */}
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="grid size-8 place-items-center rounded-lg bg-emerald-100 text-emerald-600">
                          <LogIn size={15} />
                        </div>

                        <div>
                          <p className="text-xs font-black text-slate-800">
                            Check-in
                          </p>

                          <p className="text-[10px] text-slate-400">
                            Employee started work
                          </p>
                        </div>
                      </div>

                      <p className="text-lg font-black text-emerald-700">
                        {formatTime(checkIn?.timestamp, timezone)}
                      </p>
                    </div>

                    {checkIn && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <DetailItem
                          label="Verification"
                          value={checkIn.verification}
                        />

                        <DetailItem
                          label="Distance"
                          value={formatDistance(checkIn.distanceFromOffice)}
                          icon={MapPin}
                        />

                        <DetailItem
                          label="Latitude"
                          value={checkIn.location?.latitude}
                        />

                        <DetailItem
                          label="Longitude"
                          value={checkIn.location?.longitude}
                        />
                      </div>
                    )}
                  </div>

                  {/* Check out */}
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="grid size-8 place-items-center rounded-lg bg-blue-100 text-blue-600">
                          <LogOut size={15} />
                        </div>

                        <div>
                          <p className="text-xs font-black text-slate-800">
                            Check-out
                          </p>

                          <p className="text-[10px] text-slate-400">
                            Employee ended work
                          </p>
                        </div>
                      </div>

                      <p className="text-lg font-black text-blue-700">
                        {formatTime(checkOut?.timestamp, timezone)}
                      </p>
                    </div>

                    {checkOut && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <DetailItem
                          label="Verification"
                          value={checkOut.verification}
                        />

                        <DetailItem
                          label="Distance"
                          value={formatDistance(checkOut.distanceFromOffice)}
                          icon={MapPin}
                        />

                        <DetailItem
                          label="Latitude"
                          value={checkOut.location?.latitude}
                        />

                        <DetailItem
                          label="Longitude"
                          value={checkOut.location?.longitude}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Section>

              {/* Context */}
              <Section title="Attendance Context" icon={CalendarDays}>
                <div className="grid grid-cols-2 gap-3">
                  <DetailItem
                    label="Working Day"
                    value={context?.isWorkingDay ? "Yes" : "No"}
                  />

                  <DetailItem
                    label="Company Holiday"
                    value={context?.isCompanyHoliday ? "Yes" : "No"}
                  />

                  <DetailItem
                    label="Approved Leave"
                    value={context?.isOnApprovedLeave ? "Yes" : "No"}
                  />

                  <DetailItem
                    label="Attendance Record"
                    value={context?.hasAttendance ? "Recorded" : "No record"}
                  />
                </div>

                {detail?.holiday && (
                  <div className="mt-3 rounded-xl border border-violet-100 bg-violet-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-violet-500">
                      Holiday
                    </p>

                    <p className="mt-1 text-xs font-black text-violet-700">
                      {detail.holiday.name}
                    </p>
                  </div>
                )}

                {detail?.leave && (
                  <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-blue-500">
                      Approved Leave
                    </p>

                    <p className="mt-1 text-xs font-black text-blue-700">
                      {detail.leave?.leaveType?.name || "Leave"}
                    </p>

                    {detail.leave?.reason && (
                      <p className="mt-1 text-[11px] leading-5 text-blue-600">
                        {detail.leave.reason}
                      </p>
                    )}
                  </div>
                )}
              </Section>

              {/* Remarks */}
              <Section title="Remarks" icon={FileText}>
                {attendance?.remarks ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs leading-6 text-slate-600">
                      {attendance.remarks}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      No remarks recorded for this attendance.
                    </p>
                  </div>
                )}
              </Section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </aside>
    </>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const Attendance = () => {
  const today = useMemo(() => {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(now.getMonth() + 1).padStart(2, "0");

    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  const [date, setDate] = useState(today);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const [detail, setDetail] = useState(null);

  const [detailLoading, setDetailLoading] = useState(false);

  const [detailError, setDetailError] = useState("");

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAttendanceDashboard({
        date,
        search: search || undefined,
        status: status || undefined,
      });

      const data = response?.data?.data ?? response?.data ?? null;

      setDashboard(data);
    } catch (err) {
      console.error("Failed to load attendance dashboard:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load attendance dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     LOAD DETAIL
  ======================================================= */

  const loadEmployeeDetail = async (employeeId) => {
    try {
      setSelectedEmployeeId(employeeId);

      setDetail(null);
      setDetailError("");
      setDetailLoading(true);

      const response = await getAttendanceDetail(employeeId, {
        date,
      });

      const data = response?.data?.data ?? response?.data ?? null;

      setDetail(data);
    } catch (err) {
      console.error("Failed to load attendance detail:", err);

      setDetailError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load attendance detail.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  /* =======================================================
     INITIAL / FILTER LOAD
  ======================================================= */

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadDashboard();
    }, 250);

    return () => clearTimeout(timeout);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, status, search]);

  /* =======================================================
     CLOSE DETAIL
  ======================================================= */

  const closeDetail = () => {
    setSelectedEmployeeId(null);

    setDetail(null);
    setDetailError("");
    setDetailLoading(false);
  };

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = dashboard?.summary || {};

  const rows = dashboard?.employees || [];

  const attendanceRate = summary.attendanceRate || 0;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <div className="space-y-6">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 p-6 text-white shadow-[0_30px_70px_-35px_rgba(37,99,235,.65)] sm:p-7">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-100">
                <Activity size={12} />
                Workforce Attendance
              </div>

              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Attendance Command Center
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                Monitor daily attendance, schedules, check-ins, overtime and
                workforce availability from one place.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-200">
                Selected Date
              </p>

              <p className="mt-1 text-sm font-black">{formatDate(date)}</p>
            </div>
          </div>
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Date */}
            <div className="relative">
              <CalendarDays
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Search */}
            <div className="relative min-w-0 flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employee, code or designation..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Status */}
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Status</option>

              <option value="PRESENT">Present</option>

              <option value="ABSENT">Absent</option>

              <option value="HALF_DAY">Half Day</option>

              <option value="ON_LEAVE">On Leave</option>

              <option value="HOLIDAY">Holiday</option>

              <option value="WEEK_OFF">Week Off</option>
            </select>

            {/* Refresh */}
            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0 text-rose-500"
              />

              <div>
                <p className="text-xs font-black text-rose-700">
                  Attendance dashboard failed to load
                </p>

                <p className="mt-1 text-[11px] leading-5 text-rose-600">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Employees"
            value={loading ? "..." : (summary.totalEmployees ?? "—")}
            description="Active workforce"
            icon={Users}
          />

          <StatCard
            title="Present"
            value={loading ? "..." : (summary.present ?? "—")}
            description="Recorded attendance"
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Absent"
            value={loading ? "..." : (summary.absent ?? "—")}
            description="Scheduled but not present"
            icon={UserMinus}
            iconClass="bg-rose-50 text-rose-600"
          />

          <StatCard
            title="On Leave"
            value={loading ? "..." : (summary.onLeave ?? "—")}
            description="Approved leave"
            icon={CalendarDays}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Attendance Rate"
            value={loading ? "..." : `${attendanceRate}%`}
            description="Scheduled employees"
            icon={Activity}
            iconClass="bg-violet-50 text-violet-600"
          />
        </div>

        {/* =================================================
            SECONDARY SUMMARY
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Late"
            value={loading ? "..." : (summary.late ?? "—")}
            description="Employees arriving late"
            icon={Clock3}
            iconClass="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Checked Out"
            value={loading ? "..." : (summary.checkedOut ?? "—")}
            description="Completed workday"
            icon={LogOut}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Overtime"
            value={loading ? "..." : (summary.overtime ?? "—")}
            description="Employees with overtime"
            icon={Timer}
            iconClass="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Week Off"
            value={loading ? "..." : (summary.weekOff ?? "—")}
            description="Scheduled non-working"
            icon={Moon}
            iconClass="bg-slate-100 text-slate-600"
          />
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="text-sm font-black text-slate-800">
                Employee Attendance
              </h3>

              <p className="mt-1 text-[10px] font-medium text-slate-400">
                Click an employee to view complete attendance details.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-500">
              {rows.length} employee
              {rows.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {Array.from({
                length: 7,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-14 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="grid min-h-60 place-items-center px-5 py-10 text-center">
              <div>
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                  <Users size={20} />
                </div>

                <p className="mt-3 text-sm font-black text-slate-700">
                  No employees found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try changing the date, status or search query.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.06em] text-slate-400">
                      Employee
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.06em] text-slate-400">
                      Department
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.06em] text-slate-400">
                      Status
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.06em] text-slate-400">
                      Check In
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.06em] text-slate-400">
                      Check Out
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.06em] text-slate-400">
                      Worked
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.06em] text-slate-400">
                      Late
                    </th>

                    <th className="px-4 py-3" />
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => {
                    const employee = row.employee;

                    const attendance = row.attendance;

                    return (
                      <tr
                        key={employee._id}
                        onClick={() => loadEmployeeDetail(employee._id)}
                        className={[
                          "cursor-pointer border-b border-slate-100",
                          "transition hover:bg-blue-50/40",
                          selectedEmployeeId === employee._id
                            ? "bg-blue-50/50"
                            : "",
                        ].join(" ")}
                      >
                        {/* Employee */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-[10px] font-black text-slate-500">
                              {getInitials(employee)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-black text-slate-800">
                                {getEmployeeName(employee)}
                              </p>

                              <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
                                {employee.employeeCode}
                                {" · "}
                                {employee.designation}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-4">
                          <p className="text-xs font-semibold text-slate-600">
                            {row.department?.name || "—"}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <StatusBadge status={attendance.status} />
                        </td>

                        {/* Check In */}
                        <td className="px-4 py-4">
                          <p className="text-xs font-bold text-slate-700">
                            {formatTime(
                              attendance.checkIn?.timestamp,
                              dashboard?.timezone,
                            )}
                          </p>

                          {attendance.isLate && (
                            <p className="mt-0.5 text-[9px] font-bold text-amber-600">
                              {formatMinutes(attendance.lateMinutes)} late
                            </p>
                          )}
                        </td>

                        {/* Check Out */}
                        <td className="px-4 py-4">
                          <p className="text-xs font-bold text-slate-700">
                            {formatTime(
                              attendance.checkOut?.timestamp,
                              dashboard?.timezone,
                            )}
                          </p>

                          {attendance.isEarlyCheckout && (
                            <p className="mt-0.5 text-[9px] font-bold text-rose-600">
                              Early checkout
                            </p>
                          )}
                        </td>

                        {/* Worked */}
                        <td className="px-4 py-4">
                          <p className="text-xs font-bold text-slate-700">
                            {formatMinutes(attendance.totalWorkedMinutes)}
                          </p>

                          {attendance.overtimeMinutes > 0 && (
                            <p className="mt-0.5 text-[9px] font-bold text-violet-600">
                              +{formatMinutes(attendance.overtimeMinutes)} OT
                            </p>
                          )}
                        </td>

                        {/* Late */}
                        <td className="px-4 py-4">
                          <p
                            className={[
                              "text-xs font-bold",
                              attendance.isLate
                                ? "text-amber-600"
                                : "text-slate-400",
                            ].join(" ")}
                          >
                            {attendance.isLate
                              ? formatMinutes(attendance.lateMinutes)
                              : "—"}
                          </p>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-4 text-right">
                          <ChevronRight
                            size={16}
                            className="ml-auto text-slate-300 transition group-hover:text-blue-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          DETAIL DRAWER
      ================================================= */}

      <AttendanceDetailDrawer
        detail={detail}
        loading={detailLoading}
        error={detailError}
        onClose={closeDetail}
      />
    </>
  );
};

export default Attendance;
