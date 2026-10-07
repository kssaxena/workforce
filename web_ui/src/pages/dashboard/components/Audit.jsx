import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileSearch,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";

import { getAuditLogs } from "../../../services/audit";

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAction = (action = "") =>
  action
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatModule = (module = "") =>
  module
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getActorName = (actor) =>
  [actor?.firstName, actor?.lastName].filter(Boolean).join(" ") ||
  actor?.email ||
  "System";

const getEmployeeName = (employee) =>
  [employee?.firstName, employee?.lastName].filter(Boolean).join(" ") ||
  employee?.employeeCode ||
  "Employee";

const ActionBadge = ({ action }) => {
  const styles = {
    REGULARIZATION_REQUESTED: "bg-amber-50 text-amber-700 border-amber-200",

    REGULARIZATION_APPROVED:
      "bg-emerald-50 text-emerald-700 border-emerald-200",

    REGULARIZATION_REJECTED: "bg-rose-50 text-rose-700 border-rose-200",

    CREATE: "bg-blue-50 text-blue-700 border-blue-200",

    UPDATE: "bg-indigo-50 text-indigo-700 border-indigo-200",

    DELETE: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        styles[action] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {formatAction(action)}
    </span>
  );
};

const JsonBlock = ({ value }) => {
  if (
    value === null ||
    value === undefined ||
    Object.keys(value || {}).length === 0
  ) {
    return (
      <div className="rounded-xl bg-slate-50 px-4 py-3 text-[11px] text-slate-400">
        No data
      </div>
    );
  }

  return (
    <pre className="max-h-64 overflow-auto rounded-xl bg-slate-950 p-4 text-[10px] leading-5 text-slate-200">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
};

const Audit = () => {
  const [logs, setLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [module, setModule] = useState("ALL");
  const [action, setAction] = useState("ALL");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [expandedId, setExpandedId] = useState(null);

  const loadAuditLogs = async ({ showLoader = true } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      const params = {
        limit: 100,
      };

      if (module !== "ALL") {
        params.module = module;
      }

      if (action !== "ALL") {
        params.action = action;
      }

      if (startDate) {
        params.startDate = startDate;
      }

      if (endDate) {
        params.endDate = `${endDate}T23:59:59.999`;
      }

      const response = await getAuditLogs(params);

      const data = response?.data?.data ?? response?.data ?? [];

      setLogs(Array.isArray(data) ? data : []);
    } catch (requestError) {
      console.error("Failed to load audit logs:", requestError);

      setError(
        requestError?.response?.data?.message || "Unable to load audit logs.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [module, action, startDate, endDate]);

  const filteredLogs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return logs;
    }

    return logs.filter((log) => {
      const actorName = getActorName(log.actorId);

      const employeeName = getEmployeeName(log.targetEmployeeId);

      const values = [
        actorName,
        employeeName,
        log.action,
        log.module,
        log.entityType,
        log.description,
      ];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [logs, search]);

  const stats = useMemo(() => {
    const today = new Date();

    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const todayLogs = logs.filter(
      (log) => new Date(log.createdAt) >= todayStart,
    );

    const regularizationLogs = logs.filter((log) =>
      String(log.action || "").startsWith("REGULARIZATION_"),
    );

    const attendanceLogs = logs.filter((log) => log.module === "attendance");

    return {
      total: logs.length,
      today: todayLogs.length,
      regularization: regularizationLogs.length,
      attendance: attendanceLogs.length,
    };
  }, [logs]);

  const clearFilters = () => {
    setSearch("");
    setModule("ALL");
    setAction("ALL");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 text-white shadow-[0_30px_70px_-35px_rgba(15,23,42,.65)] sm:p-7">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">
              <ShieldCheck size={12} />
              Security & Compliance
            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Audit Logs
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Review important workforce actions and attendance changes across
              your organization.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadAuditLogs({
                showLoader: false,
              })
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/15 disabled:opacity-60"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Events", stats.total, "Events in current result", Activity],
          ["Today", stats.today, "Events recorded today", CalendarDays],
          [
            "Regularization",
            stats.regularization,
            "Attendance correction events",
            FileSearch,
          ],
          ["Attendance", stats.attendance, "Attendance-related events", Clock3],
        ].map(([label, value, description, Icon]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {label}
                </p>

                <p className="mt-2 text-2xl font-black text-slate-900">
                  {value}
                </p>

                <p className="mt-1 text-[10px] text-slate-400">{description}</p>
              </div>

              <div className="grid size-9 place-items-center rounded-xl bg-slate-50 text-slate-600">
                <Icon size={17} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_220px_150px_150px_auto]">
          {/* Search */}

          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search audit activity..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Module */}

          <select
            value={module}
            onChange={(event) => setModule(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 outline-none focus:border-blue-500"
          >
            <option value="ALL">All Modules</option>

            <option value="attendance">Attendance</option>

            <option value="employee">Employee</option>

            <option value="organization">Organization</option>

            <option value="rbac">Access Control</option>
          </select>

          {/* Action */}

          <select
            value={action}
            onChange={(event) => setAction(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 outline-none focus:border-blue-500"
          >
            <option value="ALL">All Actions</option>

            <option value="REGULARIZATION_REQUESTED">
              Regularization Requested
            </option>

            <option value="REGULARIZATION_APPROVED">
              Regularization Approved
            </option>

            <option value="REGULARIZATION_REJECTED">
              Regularization Rejected
            </option>
          </select>

          {/* Start */}

          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 outline-none focus:border-blue-500"
          />

          {/* End */}

          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 outline-none focus:border-blue-500"
          />

          {/* Clear */}

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </section>

      {/* Error */}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* Audit timeline */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-sm font-black text-slate-800">Activity Timeline</p>

          <p className="mt-1 text-[11px] text-slate-400">
            {filteredLogs.length} audit event
            {filteredLogs.length === 1 ? "" : "s"} found
          </p>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="grid size-12 place-items-center rounded-2xl bg-slate-50 text-slate-400">
              <ShieldCheck size={21} />
            </div>

            <h3 className="mt-4 text-sm font-black text-slate-700">
              No audit events found
            </h3>

            <p className="mt-1 max-w-sm text-[11px] leading-5 text-slate-400">
              Try changing your filters or date range.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const expanded = expandedId === log._id;

              const actorName = getActorName(log.actorId);

              const employeeName = getEmployeeName(log.targetEmployeeId);

              return (
                <div
                  key={log._id}
                  className="px-5 py-5 transition hover:bg-slate-50/50"
                >
                  <div className="flex gap-4">
                    {/* Timeline dot */}

                    <div className="relative flex shrink-0 flex-col items-center">
                      <div className="grid size-9 place-items-center rounded-full border border-blue-100 bg-blue-50 text-blue-600">
                        <Activity size={15} />
                      </div>

                      <div className="absolute top-10 h-[calc(100%+1.25rem)] w-px bg-slate-100" />
                    </div>

                    {/* Content */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <ActionBadge action={log.action} />

                            <span className="text-[10px] font-semibold text-slate-400">
                              {formatModule(log.module)}
                            </span>
                          </div>

                          <h3 className="mt-2 text-sm font-black text-slate-800">
                            {log.description || formatAction(log.action)}
                          </h3>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-[10px] font-bold text-slate-500">
                            {formatTime(log.createdAt)}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {formatDateTime(log.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Meta */}

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500">
                          <User size={11} />

                          {employeeName}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500">
                          By {actorName}
                        </span>

                        <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500">
                          {log.entityType}
                        </span>
                      </div>

                      {/* Expand */}

                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : log._id)}
                        className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700"
                      >
                        {expanded ? (
                          <>
                            Hide details
                            <ChevronUp size={13} />
                          </>
                        ) : (
                          <>
                            View details
                            <ChevronDown size={13} />
                          </>
                        )}
                      </button>

                      {/* Details */}

                      {expanded && (
                        <div className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-2">
                          <div>
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Before
                            </p>

                            <JsonBlock value={log.before} />
                          </div>

                          <div>
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              After
                            </p>

                            <JsonBlock value={log.after} />
                          </div>

                          <div className="lg:col-span-2">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Metadata
                            </p>

                            <JsonBlock value={log.metadata} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Audit;
