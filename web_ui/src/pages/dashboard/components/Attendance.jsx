import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Filter,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  X,
} from "lucide-react";

import {
  getAttendanceSummary,
  getCompanyAttendance,
  regularizeAttendance,
} from "../../../services/attendance";

import {
  getDepartments,
  getOrganizationUnits,
} from "../../../services/organization";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "HALF_DAY", label: "Half Day" },
  { value: "ON_LEAVE", label: "On Leave" },
  { value: "HOLIDAY", label: "Holiday" },
  { value: "WEEK_OFF", label: "Week Off" },
];

const getDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatTime = (timestamp) => {
  if (!timestamp) return "—";

  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMinutes = (minutes = 0) => {
  if (!minutes) return "0h 0m";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
};

const getEmployeeName = (employee) => {
  if (!employee) return "Unknown Employee";

  return [employee.firstName, employee.lastName].filter(Boolean).join(" ");
};

const getInitials = (employee) => {
  if (!employee) return "?";

  const first = employee.firstName?.charAt(0) || "";
  const last = employee.lastName?.charAt(0) || "";

  return `${first}${last}`.toUpperCase() || "?";
};

const getStatusConfig = (status) => {
  switch (status) {
    case "PRESENT":
      return {
        label: "Present",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };

    case "ABSENT":
      return {
        label: "Absent",
        className: "bg-red-50 text-red-700 border-red-200",
      };

    case "HALF_DAY":
      return {
        label: "Half Day",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };

    case "ON_LEAVE":
      return {
        label: "On Leave",
        className: "bg-blue-50 text-blue-700 border-blue-200",
      };

    case "HOLIDAY":
      return {
        label: "Holiday",
        className: "bg-purple-50 text-purple-700 border-purple-200",
      };

    case "WEEK_OFF":
      return {
        label: "Week Off",
        className: "bg-slate-100 text-slate-600 border-slate-200",
      };

    default:
      return {
        label: status || "Unknown",
        className: "bg-slate-100 text-slate-600 border-slate-200",
      };
  }
};
const toDateTimeLocal = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");

  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const extractDate = (date) => {
  if (!date) return "";

  return new Date(date).toISOString().slice(0, 10);
};

const Attendance = () => {
  const today = getDateString();

  const [editingAttendance, setEditingAttendance] = useState(null);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [regularizationError, setRegularizationError] = useState("");
  const [regularizationSuccess, setRegularizationSuccess] = useState("");

  const [departments, setDepartments] = useState([]);
  const [organizationUnits, setOrganizationUnits] = useState([]);

  const [departmentId, setDepartmentId] = useState("");
  const [organizationUnitId, setOrganizationUnitId] = useState("");

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    halfDay: 0,
    onLeave: 0,
    holiday: 0,
    weekOff: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedAttendance, setSelectedAttendance] = useState(null);

  const fetchAttendance = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const params = {
          startDate,
          endDate,
        };

        if (status) {
          params.status = status;
        }

        if (departmentId) {
          params.departmentId = departmentId;
        }

        if (organizationUnitId) {
          params.organizationUnitId = organizationUnitId;
        }

        if (search.trim()) {
          params.search = search.trim();
        }

        const [summaryResponse, attendanceResponse] = await Promise.all([
          getAttendanceSummary({
            startDate,
            endDate,
            departmentId: departmentId || undefined,
            organizationUnitId: organizationUnitId || undefined,
          }),

          getCompanyAttendance(params),
        ]);

        setSummary(
          summaryResponse?.data?.data || {
            total: 0,
            present: 0,
            absent: 0,
            halfDay: 0,
            onLeave: 0,
            holiday: 0,
            weekOff: 0,
          },
        );

        setAttendance(attendanceResponse?.data?.data || []);
      } catch (err) {
        console.error("Attendance dashboard error:", err);

        setError(
          err?.response?.data?.message || "Unable to load attendance data.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [startDate, endDate, status, departmentId, organizationUnitId, search],
  );
  const handleRegularizeAttendance = async (formData) => {
    try {
      setSavingAttendance(true);
      setRegularizationError("");
      setRegularizationSuccess("");

      await regularizeAttendance(formData);

      setRegularizationSuccess("Attendance updated successfully.");

      setEditingAttendance(null);
      setSelectedAttendance(null);

      await fetchAttendance({ silent: true });
    } catch (err) {
      console.error("Attendance regularization failed:", err);

      setRegularizationError(
        err?.response?.data?.message || "Unable to update attendance.",
      );
    } finally {
      setSavingAttendance(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  useEffect(() => {
    const loadOrganizationFilters = async () => {
      try {
        const [departmentResponse, organizationUnitResponse] =
          await Promise.all([getDepartments(), getOrganizationUnits()]);

        setDepartments(departmentResponse?.data?.data || []);

        setOrganizationUnits(organizationUnitResponse?.data?.data || []);
      } catch (err) {
        console.error("Failed to load organization filters:", err);
      }
    };

    loadOrganizationFilters();
  }, []);

  const handleRefresh = () => {
    fetchAttendance({ silent: true });
  };

  const clearFilters = () => {
    setStartDate(today);
    setEndDate(today);
    setStatus("");
    setDepartmentId("");
    setOrganizationUnitId("");
    setSearch("");
  };

  const hasFilters = useMemo(() => {
    return (
      startDate !== today ||
      endDate !== today ||
      Boolean(status) ||
      Boolean(departmentId) ||
      Boolean(organizationUnitId) ||
      Boolean(search.trim())
    );
  }, [
    startDate,
    endDate,
    status,
    departmentId,
    organizationUnitId,
    search,
    today,
  ]);

  return (
    <div className="w-full space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-500">
            <Activity size={16} />
            Workforce Management
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Attendance
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor and manage employee attendance across your organization.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Error                                                              */}
      {/* ------------------------------------------------------------------ */}

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 transition hover:bg-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Summary Cards                                                      */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Present"
          value={summary.present}
          description="Employees present"
          icon={UserCheck}
          iconWrapper="bg-emerald-50 text-emerald-600"
        />

        <SummaryCard
          title="Absent"
          value={summary.absent}
          description="Employees absent"
          icon={UserX}
          iconWrapper="bg-red-50 text-red-600"
        />

        <SummaryCard
          title="Half Day"
          value={summary.halfDay}
          description="Partial attendance"
          icon={Clock3}
          iconWrapper="bg-amber-50 text-amber-600"
        />

        <SummaryCard
          title="On Leave"
          value={summary.onLeave}
          description="Approved leave"
          icon={CalendarDays}
          iconWrapper="bg-blue-50 text-blue-600"
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Additional Summary                                                 */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <MiniSummary label="Total Records" value={summary.total} />

        <MiniSummary label="Holidays" value={summary.holiday} />

        <MiniSummary label="Week Off" value={summary.weekOff} />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Filters                                                            */}
      {/* ------------------------------------------------------------------ */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={17} className="text-slate-500" />

            <h2 className="text-sm font-semibold text-slate-900">
              Attendance Filters
            </h2>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-slate-500 transition hover:text-slate-900"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Start Date */}

          <FilterField label="From">
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="filter-input"
            />
          </FilterField>

          {/* End Date */}

          <FilterField label="To">
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="filter-input"
            />
          </FilterField>

          {/* Status */}

          <FilterField label="Status">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="filter-input"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Department">
            <select
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              className="filter-input"
            >
              <option value="">All Departments</option>

              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Organization Unit">
            <select
              value={organizationUnitId}
              onChange={(event) => setOrganizationUnitId(event.target.value)}
              className="filter-input"
            >
              <option value="">All Organization Units</option>

              {organizationUnits.map((unit) => (
                <option key={unit._id} value={unit._id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </FilterField>

          {/* Search */}

          <FilterField label="Search Employee">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, code or designation"
                className="filter-input pl-9"
              />
            </div>
          </FilterField>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Attendance Table                                                   */}
      {/* ------------------------------------------------------------------ */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Attendance Records
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {attendance.length} record
              {attendance.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays size={14} />

            {formatDate(startDate)}

            {startDate !== endDate && (
              <>
                <span>—</span>
                {formatDate(endDate)}
              </>
            )}
          </div>
        </div>

        {loading ? (
          <AttendanceTableSkeleton />
        ) : attendance.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="table-heading">Employee</th>

                  <th className="table-heading">Department</th>

                  <th className="table-heading">Date</th>

                  <th className="table-heading">Status</th>

                  <th className="table-heading">Check In</th>

                  <th className="table-heading">Check Out</th>

                  <th className="table-heading">Worked</th>

                  <th className="table-heading">Attendance</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {attendance.map((record) => (
                  <AttendanceRow
                    key={record._id}
                    record={record}
                    onClick={() => setSelectedAttendance(record)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Attendance Detail Modal                                            */}
      {/* ------------------------------------------------------------------ */}

      {selectedAttendance && !editingAttendance && (
        <AttendanceDetailModal
          attendance={selectedAttendance}
          onClose={() => setSelectedAttendance(null)}
          onEdit={() => {
            setRegularizationError("");
            setRegularizationSuccess("");
            setEditingAttendance(selectedAttendance);
          }}
        />
      )}

      {editingAttendance && (
        <AttendanceRegularizationModal
          attendance={editingAttendance}
          loading={savingAttendance}
          error={regularizationError}
          success={regularizationSuccess}
          onClose={() => {
            if (!savingAttendance) {
              setEditingAttendance(null);
              setRegularizationError("");
            }
          }}
          onSubmit={handleRegularizeAttendance}
        />
      )}

      <style>{`
        .filter-input {
          width: 100%;
          height: 40px;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          background: white;
          padding: 0 0.75rem;
          font-size: 0.875rem;
          color: rgb(15 23 42);
          outline: none;
          transition: all 150ms ease;
        }

        .filter-input:focus {
          border-color: rgb(148 163 184);
          box-shadow: 0 0 0 3px rgb(241 245 249);
        }

        .table-heading {
          padding: 0.75rem 1.25rem;
          text-align: left;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgb(100 116 139);
        }
      `}</style>
    </div>
  );
};

const SummaryCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconWrapper,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconWrapper}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
};

const MiniSummary = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>

      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
};

const FilterField = ({ label, children }) => {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </span>

      {children}
    </label>
  );
};

const AttendanceRow = ({ record, onClick }) => {
  const employee = record.employeeId;

  const statusConfig = getStatusConfig(record.status);

  const workedMinutes = record.totalWorkedMinutes || 0;

  const hasLocation =
    record.checkIn?.location?.latitude != null &&
    record.checkIn?.location?.longitude != null;

  return (
    <tr
      onClick={onClick}
      className="cursor-pointer transition hover:bg-slate-50"
    >
      {/* Employee */}

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
            {getInitials(employee)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {getEmployeeName(employee)}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-500">
              {employee?.employeeCode || "—"}
              {employee?.designation ? ` · ${employee.designation}` : ""}
            </p>
          </div>
        </div>
      </td>

      {/* Department */}

      <td className="px-5 py-4">
        <p className="text-sm text-slate-700">
          {employee?.departmentId?.name || "—"}
        </p>

        {employee?.departmentId?.code && (
          <p className="mt-0.5 text-xs text-slate-400">
            {employee.departmentId.code}
          </p>
        )}
      </td>

      {/* Date */}

      <td className="px-5 py-4 text-sm text-slate-600">
        {formatDate(record.date)}
      </td>

      {/* Status */}

      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusConfig.className}`}
        >
          {statusConfig.label}
        </span>
      </td>

      {/* Check In */}

      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">
            {formatTime(record.checkIn?.timestamp)}
          </span>

          {record.isLate && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              Late
            </span>
          )}
        </div>
      </td>

      {/* Check Out */}

      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">
            {formatTime(record.checkOut?.timestamp)}
          </span>

          {record.isEarlyCheckout && (
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-700">
              Early
            </span>
          )}
        </div>
      </td>

      {/* Worked */}

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-700">
          {formatMinutes(workedMinutes)}
        </p>

        {record.overtimeMinutes > 0 && (
          <p className="mt-0.5 text-xs text-emerald-600">
            +{formatMinutes(record.overtimeMinutes)} OT
          </p>
        )}
      </td>

      {/* Attendance */}

      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          {hasLocation ? (
            <span
              title="GPS location captured"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
            >
              <MapPin size={14} />
            </span>
          ) : (
            <span
              title="No GPS location"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400"
            >
              <MapPin size={14} />
            </span>
          )}

          <span className="text-xs text-slate-400">View</span>
        </div>
      </td>
    </tr>
  );
};

const AttendanceDetailModal = ({ attendance, onClose, onEdit }) => {
  const employee = attendance.employeeId;
  const statusConfig = getStatusConfig(attendance.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}

        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
              {getInitials(employee)}
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {getEmployeeName(employee)}
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                {employee?.employeeCode || "—"}
                {employee?.designation ? ` · ${employee.designation}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
            >
              Edit Attendance
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}

        <div className="space-y-6 p-6">
          {/* Status */}

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Attendance Status
              </p>

              <p className="mt-1 text-sm font-medium text-slate-900">
                {formatDate(attendance.date)}
              </p>
            </div>

            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${statusConfig.className}`}
            >
              {statusConfig.label}
            </span>
          </div>

          {/* Timing */}

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              Working Hours
            </h4>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <DetailItem
                label="Check In"
                value={formatTime(attendance.checkIn?.timestamp)}
              />

              <DetailItem
                label="Check Out"
                value={formatTime(attendance.checkOut?.timestamp)}
              />

              <DetailItem
                label="Worked"
                value={formatMinutes(attendance.totalWorkedMinutes)}
              />

              <DetailItem
                label="Scheduled"
                value={formatMinutes(attendance.scheduledWorkingMinutes)}
              />
            </div>
          </div>

          {/* Performance */}

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              Attendance Metrics
            </h4>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <DetailItem
                label="Late"
                value={
                  attendance.isLate
                    ? `${attendance.lateMinutes || 0} min`
                    : "No"
                }
              />

              <DetailItem
                label="Early Checkout"
                value={
                  attendance.isEarlyCheckout
                    ? `${attendance.earlyCheckoutMinutes || 0} min`
                    : "No"
                }
              />

              <DetailItem
                label="Overtime"
                value={
                  attendance.overtimeMinutes
                    ? formatMinutes(attendance.overtimeMinutes)
                    : "0h 0m"
                }
              />

              <DetailItem label="Source" value={attendance.source || "—"} />
            </div>
          </div>

          {/* Location */}

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              Location Verification
            </h4>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <LocationCard
                title="Check-in Location"
                location={attendance.checkIn}
              />

              <LocationCard
                title="Check-out Location"
                location={attendance.checkOut}
              />
            </div>
          </div>

          {/* Remarks */}

          {attendance.remarks && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">
                Remarks
              </h4>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {attendance.remarks}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AttendanceRegularizationModal = ({
  attendance,
  loading,
  error,
  success,
  onClose,
  onSubmit,
}) => {
  const employee = attendance.employeeId;

  const initialCheckIn = attendance.checkIn?.timestamp
    ? toDateTimeLocal(attendance.checkIn.timestamp)
    : "";

  const initialCheckOut = attendance.checkOut?.timestamp
    ? toDateTimeLocal(attendance.checkOut.timestamp)
    : "";

  const [status, setStatus] = useState(attendance.status || "PRESENT");

  const [checkIn, setCheckIn] = useState(initialCheckIn);

  const [checkOut, setCheckOut] = useState(initialCheckOut);

  const [remarks, setRemarks] = useState(attendance.remarks || "");

  const [formError, setFormError] = useState("");

  const isWorkingStatus = status === "PRESENT" || status === "HALF_DAY";

  const handleSubmit = (event) => {
    event.preventDefault();

    setFormError("");

    if (!status) {
      setFormError("Please select an attendance status.");
      return;
    }

    if (isWorkingStatus && checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (checkOutDate <= checkInDate) {
        setFormError("Check-out must be later than check-in.");
        return;
      }
    }

    onSubmit({
      employeeId: employee._id,

      date: extractDate(attendance.date),

      status,

      checkIn:
        isWorkingStatus && checkIn ? new Date(checkIn).toISOString() : null,

      checkOut:
        isWorkingStatus && checkOut ? new Date(checkOut).toISOString() : null,

      remarks: remarks.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}

        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-medium text-slate-400">
              Attendance Regularization
            </p>

            <h3 className="mt-1 text-base font-semibold text-slate-900">
              {getEmployeeName(employee)}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {employee?.employeeCode || "—"} · {formatDate(attendance.date)}
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Status */}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Attendance Status
            </label>

            <select
              value={status}
              disabled={loading}
              onChange={(event) => setStatus(event.target.value)}
              className="filter-input"
            >
              <option value="PRESENT">Present</option>

              <option value="ABSENT">Absent</option>

              <option value="HALF_DAY">Half Day</option>

              <option value="ON_LEAVE">On Leave</option>

              <option value="HOLIDAY">Holiday</option>

              <option value="WEEK_OFF">Week Off</option>
            </select>
          </div>

          {/* Timing */}

          {isWorkingStatus && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Check-in
                </label>

                <input
                  type="datetime-local"
                  value={checkIn}
                  disabled={loading}
                  onChange={(event) => setCheckIn(event.target.value)}
                  className="filter-input"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Check-out
                </label>

                <input
                  type="datetime-local"
                  value={checkOut}
                  disabled={loading}
                  onChange={(event) => setCheckOut(event.target.value)}
                  className="filter-input"
                />
              </div>
            </div>
          )}

          {/* Explanation */}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Remarks
            </label>

            <textarea
              value={remarks}
              disabled={loading}
              onChange={(event) => setRemarks(event.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Explain why this attendance is being corrected..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />

            <div className="mt-1 text-right text-[11px] text-slate-400">
              {remarks.length}/1000
            </div>
          </div>

          {/* Warning */}

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs leading-5 text-amber-800">
              This change will be recorded as an <strong>ADMIN</strong>{" "}
              attendance regularization and will replace the existing attendance
              values for this employee and date.
            </p>
          </div>

          {/* Error */}

          {(formError || error) && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
              {formError || error}
            </div>
          )}

          {/* Success */}

          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-700">
              {success}
            </div>
          )}

          {/* Actions */}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}

              {loading ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
};

const LocationCard = ({ title, location }) => {
  const latitude = location?.location?.latitude;
  const longitude = location?.location?.longitude;
  const accuracy = location?.location?.accuracy;

  if (latitude == null || longitude == null) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-4">
        <div className="flex items-center gap-2 text-slate-400">
          <MapPin size={16} />

          <span className="text-sm font-medium">{title}</span>
        </div>

        <p className="mt-2 text-xs text-slate-400">Location not available</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <MapPin size={16} className="text-emerald-600" />

        <span className="text-sm font-medium text-slate-800">{title}</span>
      </div>

      <div className="mt-3 space-y-1 text-xs text-slate-500">
        <p>
          Latitude:{" "}
          <span className="font-medium text-slate-700">{latitude}</span>
        </p>

        <p>
          Longitude:{" "}
          <span className="font-medium text-slate-700">{longitude}</span>
        </p>

        {accuracy != null && (
          <p>
            Accuracy:{" "}
            <span className="font-medium text-slate-700">
              ±{Math.round(accuracy)}m
            </span>
          </p>
        )}

        {location.distanceFromOffice != null && (
          <p>
            Distance from office:{" "}
            <span className="font-medium text-slate-700">
              {Math.round(location.distanceFromOffice)}m
            </span>
          </p>
        )}

        {location.verification && (
          <p>
            Verification:{" "}
            <span className="font-medium text-slate-700">
              {location.verification}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ hasFilters, onClear }) => {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <CalendarDays size={21} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        No attendance records
      </h3>

      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {hasFilters
          ? "No attendance records match your current filters."
          : "There are no attendance records for the selected date."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Clear filters
        </button>
      )}
    </div>
  );
};

const AttendanceTableSkeleton = () => {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="flex min-w-[1000px] items-center gap-6 px-5 py-4"
        >
          <div className="flex w-[220px] items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100" />

            <div className="space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
              <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
            </div>
          </div>

          <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />

          <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />

          <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />

          <div className="h-3 w-14 animate-pulse rounded bg-slate-100" />

          <div className="h-3 w-14 animate-pulse rounded bg-slate-100" />

          <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />

          <div className="h-7 w-7 animate-pulse rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
};

export default Attendance;
