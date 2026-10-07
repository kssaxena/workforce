import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Loader2,
  RefreshCw,
  TrendingUp,
  UserMinus,
  Users,
  XCircle,
} from "lucide-react";

import {
  getDailyAttendanceReport,
  getMonthlyAttendanceReport,
} from "../../../services/attendance";

const formatMinutes = (minutes = 0) => {
  const value = Number(minutes) || 0;

  const hours = Math.floor(value / 60);
  const mins = value % 60;

  return `${hours}h ${mins}m`;
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusClasses = (status) => {
  const styles = {
    PRESENT: "bg-emerald-50 text-emerald-700 border-emerald-200",

    ABSENT: "bg-rose-50 text-rose-700 border-rose-200",

    HALF_DAY: "bg-amber-50 text-amber-700 border-amber-200",

    ON_LEAVE: "bg-blue-50 text-blue-700 border-blue-200",

    HOLIDAY: "bg-purple-50 text-purple-700 border-purple-200",

    WEEK_OFF: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return styles[status] || "bg-slate-50 text-slate-600 border-slate-200";
};

const formatStatus = (status = "") =>
  status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconClass = "bg-blue-50 text-blue-600",
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>

          <p className="mt-1 text-[10px] text-slate-400">{description}</p>
        </div>

        <div
          className={`grid size-9 place-items-center rounded-xl ${iconClass}`}
        >
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
};

const AttendanceReports = () => {
  const currentDate = new Date();

  const initialMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1,
  ).padStart(2, "0")}`;

  const initialDate = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1,
  ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

  const [month, setMonth] = useState(initialMonth);

  const [date, setDate] = useState(initialDate);

  const [report, setReport] = useState(null);

  const [dailyReport, setDailyReport] = useState(null);

  const [loading, setLoading] = useState(true);

  const [dailyLoading, setDailyLoading] = useState(false);

  const [error, setError] = useState(null);

  const [activeView, setActiveView] = useState("monthly");

  const loadMonthlyReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getMonthlyAttendanceReport({
        month,
      });

      setReport(response?.data?.data ?? response?.data ?? null);
    } catch (requestError) {
      console.error("Failed to load monthly attendance report:", requestError);

      setError(
        requestError?.response?.data?.message ||
          "Unable to load monthly attendance report.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDailyReport = async () => {
    try {
      setDailyLoading(true);
      setError(null);

      const response = await getDailyAttendanceReport({
        date,
      });

      setDailyReport(response?.data?.data ?? response?.data ?? null);
    } catch (requestError) {
      console.error("Failed to load daily attendance report:", requestError);

      setError(
        requestError?.response?.data?.message ||
          "Unable to load daily attendance report.",
      );
    } finally {
      setDailyLoading(false);
    }
  };

  useEffect(() => {
    loadMonthlyReport();
  }, [month]);

  useEffect(() => {
    loadDailyReport();
  }, [date]);

  const summary = report?.summary || {};

  const dailySummary = dailyReport?.summary || {};

  const monthlyRate = Number(summary.attendanceRate || 0);

  const statusDistribution = useMemo(() => {
    const total = Number(summary.scheduledDays) || 0;

    if (!total) {
      return [];
    }

    return [
      {
        label: "Present",
        value: summary.present || 0,
        className: "bg-emerald-500",
      },
      {
        label: "Absent",
        value: summary.absent || 0,
        className: "bg-rose-500",
      },
      {
        label: "Half Day",
        value: summary.halfDay || 0,
        className: "bg-amber-500",
      },
      {
        label: "Leave",
        value: summary.onLeave || 0,
        className: "bg-blue-500",
      },
    ].map((item) => ({
      ...item,
      percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0,
    }));
  }, [summary]);

  const exportDailyCsv = () => {
    const employees = dailyReport?.employees || [];

    if (!employees.length) {
      return;
    }

    const headers = [
      "Employee Code",
      "Employee",
      "Department",
      "Designation",
      "Status",
      "Check In",
      "Check Out",
      "Worked Minutes",
      "Late Minutes",
      "Overtime Minutes",
    ];

    const rows = employees.map((employee) => [
      employee.employeeCode || "",
      [employee.firstName, employee.lastName].filter(Boolean).join(" "),

      employee.department?.name || employee.departmentId?.name || "",

      employee.designation || "",

      employee.status || "",

      employee.checkIn?.timestamp || "",

      employee.checkOut?.timestamp || "",

      employee.totalWorkedMinutes || 0,

      employee.lateMinutes || 0,

      employee.overtimeMinutes || 0,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `attendance-${date}.csv`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Hero */}

      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 p-6 text-white shadow-[0_30px_70px_-35px_rgba(37,99,235,.65)] sm:p-7">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-100">
              <TrendingUp size={12} />
              Attendance Intelligence
            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Attendance Reports
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Understand attendance performance across your workforce with daily
              and monthly reporting.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              loadMonthlyReport();
              loadDailyReport();
            }}
            disabled={loading || dailyLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/15 disabled:opacity-60"
          >
            <RefreshCw
              size={14}
              className={loading || dailyLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Controls */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveView("monthly")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                activeView === "monthly"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() => setActiveView("daily")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                activeView === "daily"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Daily
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <CalendarDays size={14} className="text-slate-400" />

              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-600 outline-none"
              />
            </label>

            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <CalendarDays size={14} className="text-slate-400" />

              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-600 outline-none"
              />
            </label>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      {activeView === "monthly" ? (
        <>
          {/* Monthly KPI */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Attendance Rate"
              value={`${monthlyRate}%`}
              description="Monthly workforce rate"
              icon={TrendingUp}
              iconClass="bg-blue-50 text-blue-600"
            />

            <StatCard
              title="Present"
              value={summary.present ?? 0}
              description="Recorded present days"
              icon={CheckCircle2}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              title="Absent"
              value={summary.absent ?? 0}
              description="Recorded absent days"
              icon={UserMinus}
              iconClass="bg-rose-50 text-rose-600"
            />

            <StatCard
              title="On Leave"
              value={summary.onLeave ?? 0}
              description="Approved leave days"
              icon={CalendarDays}
              iconClass="bg-amber-50 text-amber-600"
            />

            <StatCard
              title="Overtime"
              value={formatMinutes(summary.totalOvertimeMinutes)}
              description="Total overtime"
              icon={Clock3}
              iconClass="bg-violet-50 text-violet-600"
            />
          </div>

          {/* Progress */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-black text-slate-800">
                  Monthly attendance performance
                </p>

                <p className="mt-1 text-[11px] text-slate-400">{month}</p>
              </div>

              <p className="text-3xl font-black text-blue-600">
                {monthlyRate}%
              </p>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700"
                style={{
                  width: `${Math.min(monthlyRate, 100)}%`,
                }}
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {statusDistribution.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-2 rounded-full ${item.className}`}
                      />

                      <span className="text-[11px] font-semibold text-slate-500">
                        {item.label}
                      </span>
                    </div>

                    <span className="text-[11px] font-black text-slate-700">
                      {item.value}
                    </span>
                  </div>

                  <p className="mt-2 text-[10px] text-slate-400">
                    {item.percentage}%
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Monthly operational metrics */}

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black text-slate-800">Working Days</p>

              <p className="mt-3 text-3xl font-black text-slate-900">
                {summary.scheduledDays ?? 0}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Scheduled employee-days
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black text-slate-800">Worked Time</p>

              <p className="mt-3 text-3xl font-black text-slate-900">
                {formatMinutes(summary.totalWorkedMinutes)}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Total recorded working time
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black text-slate-800">Late Arrivals</p>

              <p className="mt-3 text-3xl font-black text-amber-600">
                {summary.late ?? 0}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                {summary.totalLateMinutes ?? 0} total late minutes
              </p>
            </div>
          </div>

          {/* Daily monthly trend */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-slate-800">
                    Daily Breakdown
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Attendance performance throughout the month.
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="h-14 animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {(report?.daily || []).map((day) => {
                  const daySummary = day.summary || {};

                  return (
                    <div
                      key={day.date}
                      className="grid gap-4 px-5 py-4 md:grid-cols-[140px_1fr_100px]"
                    >
                      <div>
                        <p className="text-xs font-black text-slate-700">
                          {formatDate(day.date)}
                        </p>

                        {day.holiday && (
                          <span className="mt-1 inline-block text-[9px] font-bold text-purple-600">
                            {day.holiday.name || "Holiday"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex h-7 flex-1 overflow-hidden rounded-lg bg-slate-100">
                          <div
                            className="bg-emerald-500"
                            style={{
                              width: `${
                                daySummary.total
                                  ? (daySummary.present / daySummary.total) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />

                          <div
                            className="bg-rose-400"
                            style={{
                              width: `${
                                daySummary.total
                                  ? (daySummary.absent / daySummary.total) * 100
                                  : 0
                              }%`,
                            }}
                          />

                          <div
                            className="bg-amber-400"
                            style={{
                              width: `${
                                daySummary.total
                                  ? (daySummary.halfDay / daySummary.total) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />

                          <div
                            className="bg-blue-400"
                            style={{
                              width: `${
                                daySummary.total
                                  ? (daySummary.onLeave / daySummary.total) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-black text-blue-600">
                          {daySummary.attendanceRate ?? 0}%
                        </p>

                        <p className="text-[9px] text-slate-400">
                          {daySummary.present ?? 0} present
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          {/* Daily KPI */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Total Employees"
              value={dailySummary.total ?? 0}
              description="Employees in report"
              icon={Users}
            />

            <StatCard
              title="Present"
              value={dailySummary.present ?? 0}
              description="Present today"
              icon={CheckCircle2}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              title="Absent"
              value={dailySummary.absent ?? 0}
              description="Absent today"
              icon={XCircle}
              iconClass="bg-rose-50 text-rose-600"
            />

            <StatCard
              title="Late"
              value={dailySummary.late ?? 0}
              description="Late arrivals"
              icon={Clock3}
              iconClass="bg-amber-50 text-amber-600"
            />

            <StatCard
              title="Attendance"
              value={`${dailySummary.attendanceRate ?? 0}%`}
              description="Daily attendance rate"
              icon={Activity}
              iconClass="bg-blue-50 text-blue-600"
            />
          </div>

          {/* Daily table */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-black text-slate-800">
                  Daily Attendance
                </p>

                <p className="mt-1 text-[11px] text-slate-400">{date}</p>
              </div>

              <button
                type="button"
                onClick={exportDailyCsv}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50"
              >
                <Download size={13} />
                Export CSV
              </button>
            </div>

            {dailyLoading ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      {[
                        "Employee",
                        "Department",
                        "Status",
                        "Check In",
                        "Check Out",
                        "Worked",
                        "Late",
                        "Overtime",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-[0.1em] text-slate-400"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {(dailyReport?.employees || []).map((employee) => {
                      const employeeName =
                        [employee.firstName, employee.lastName]
                          .filter(Boolean)
                          .join(" ") ||
                        employee.employeeCode ||
                        "Employee";

                      return (
                        <tr
                          key={employee._id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                        >
                          <td className="px-5 py-4">
                            <div>
                              <p className="text-xs font-black text-slate-700">
                                {employeeName}
                              </p>

                              <p className="mt-0.5 text-[9px] text-slate-400">
                                {employee.employeeCode || "—"}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-[11px] font-semibold text-slate-500">
                            {employee.department?.name ||
                              employee.departmentId?.name ||
                              "—"}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold ${getStatusClasses(
                                employee.status,
                              )}`}
                            >
                              {formatStatus(employee.status)}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-[11px] font-semibold text-slate-600">
                            {employee.checkIn?.timestamp
                              ? new Date(
                                  employee.checkIn.timestamp,
                                ).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </td>

                          <td className="px-5 py-4 text-[11px] font-semibold text-slate-600">
                            {employee.checkOut?.timestamp
                              ? new Date(
                                  employee.checkOut.timestamp,
                                ).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </td>

                          <td className="px-5 py-4 text-[11px] font-bold text-slate-600">
                            {formatMinutes(employee.totalWorkedMinutes)}
                          </td>

                          <td className="px-5 py-4 text-[11px] font-bold text-amber-600">
                            {employee.lateMinutes || 0}m
                          </td>

                          <td className="px-5 py-4 text-[11px] font-bold text-violet-600">
                            {employee.overtimeMinutes || 0}m
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default AttendanceReports;
