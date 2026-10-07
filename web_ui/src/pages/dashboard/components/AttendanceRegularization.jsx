import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  RefreshCw,
  Search,
  User,
  X,
  XCircle,
} from "lucide-react";

import {
  getAttendanceRegularizations,
  reviewAttendanceRegularization,
} from "../../../services/attendance";

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

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

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }) => {
  const config = {
    PENDING: {
      label: "Pending",
      className: "border-amber-200 bg-amber-50 text-amber-700",
      icon: Clock3,
    },

    APPROVED: {
      label: "Approved",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    },

    REJECTED: {
      label: "Rejected",
      className: "border-rose-200 bg-rose-50 text-rose-700",
      icon: XCircle,
    },

    CANCELLED: {
      label: "Cancelled",
      className: "border-slate-200 bg-slate-50 text-slate-600",
      icon: X,
    },
  };

  const current = config[status] || config.PENDING;

  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${current.className}`}
    >
      <Icon size={11} />
      {current.label}
    </span>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  label,
  value,
  description,
  icon: Icon,
  className = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>

          <p className="mt-1 text-[10px] font-medium text-slate-400">
            {description}
          </p>
        </div>

        <div className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   DETAIL ROW
========================================================= */

const DetailRow = ({ label, value }) => {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-[11px] font-semibold text-slate-400">{label}</span>

      <span className="max-w-[60%] text-right text-xs font-bold text-slate-700">
        {value || "—"}
      </span>
    </div>
  );
};

/* =========================================================
   REVIEW DRAWER
========================================================= */

const ReviewDrawer = ({ request, onClose, onReview, loading }) => {
  const [decision, setDecision] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState("");

  useEffect(() => {
    setDecision(null);
    setReviewRemarks("");
  }, [request?._id]);

  if (!request) return null;

  const isPending = request.status === "PENDING";

  const employee = request.employeeId;

  const employeeName = employee
    ? [employee.firstName, employee.lastName].filter(Boolean).join(" ")
    : "Employee";

  const submitReview = async () => {
    if (!decision) return;

    await onReview(request._id, decision, reviewRemarks.trim());
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}

      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
      />

      {/* Drawer */}

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        {/* Header */}

        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <FileCheck2 size={17} />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                    Attendance Regularization
                  </p>

                  <h2 className="mt-0.5 text-lg font-black text-slate-900">
                    Review Request
                  </h2>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Body */}

        <div className="flex-1 overflow-y-auto p-5">
          {/* Employee */}

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                <User size={18} />
              </div>

              <div>
                <p className="text-sm font-black text-slate-900">
                  {employeeName}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {employee?.employeeCode || "Employee"}
                </p>
              </div>

              <div className="ml-auto">
                <StatusBadge status={request.status} />
              </div>
            </div>
          </section>

          {/* Request information */}

          <section className="mt-5">
            <div className="mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Request
              </p>

              <h3 className="mt-1 text-sm font-black text-slate-800">
                Request Information
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 px-4">
              <DetailRow
                label="Attendance Date"
                value={formatDate(request.date)}
              />

              <DetailRow
                label="Requested Status"
                value={request.requestedStatus}
              />

              <DetailRow
                label="Requested Check In"
                value={formatDateTime(request.requestedCheckIn)}
              />

              <DetailRow
                label="Requested Check Out"
                value={formatDateTime(request.requestedCheckOut)}
              />

              <DetailRow
                label="Submitted"
                value={formatDateTime(request.createdAt)}
              />
            </div>
          </section>

          {/* Reason */}

          <section className="mt-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Employee Reason
            </p>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs leading-6 text-slate-600">
                {request.reason || "No reason provided."}
              </p>
            </div>
          </section>

          {/* Review information */}

          {!isPending && (
            <section className="mt-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Review
              </p>

              <div className="rounded-2xl border border-slate-200 px-4">
                <DetailRow label="Decision" value={request.status} />

                <DetailRow
                  label="Reviewed At"
                  value={formatDateTime(request.reviewedAt)}
                />

                <DetailRow
                  label="Review Remarks"
                  value={request.reviewRemarks || "No review remarks."}
                />
              </div>
            </section>
          )}

          {/* Review controls */}

          {isPending && (
            <section className="mt-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Decision
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDecision("APPROVED")}
                  className={`rounded-xl border px-4 py-3 text-xs font-bold transition ${
                    decision === "APPROVED"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/50"
                  }`}
                >
                  <CheckCircle2 size={15} className="mx-auto mb-1" />
                  Approve
                </button>

                <button
                  type="button"
                  onClick={() => setDecision("REJECTED")}
                  className={`rounded-xl border px-4 py-3 text-xs font-bold transition ${
                    decision === "REJECTED"
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50/50"
                  }`}
                >
                  <XCircle size={15} className="mx-auto mb-1" />
                  Reject
                </button>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-[11px] font-bold text-slate-600">
                  Review Remarks
                </label>

                <textarea
                  value={reviewRemarks}
                  onChange={(event) => setReviewRemarks(event.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder={
                    decision === "REJECTED"
                      ? "Explain why this request is being rejected..."
                      : "Add an optional review note..."
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1 text-right text-[10px] text-slate-400">
                  {reviewRemarks.length}/1000
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}

        <div className="border-t border-slate-100 bg-white p-4">
          {isPending ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitReview}
                disabled={!decision || loading}
                className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  decision === "REJECTED"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading
                  ? "Processing..."
                  : decision === "REJECTED"
                    ? "Reject Request"
                    : "Approve Request"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              Close
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AttendanceRegularization = () => {
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);

  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);

  const [reviewLoading, setReviewLoading] = useState(false);

  const loadRequests = async ({ showLoader = true } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      const params = {};

      if (status !== "ALL") {
        params.status = status;
      }

      const response = await getAttendanceRegularizations(params);

      const data = response?.data?.data ?? response?.data ?? [];

      setRequests(Array.isArray(data) ? data : []);
    } catch (requestError) {
      console.error("Failed to load regularization requests:", requestError);

      setError(
        requestError?.response?.data?.message ||
          "Unable to load regularization requests.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [status]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return requests;
    }

    return requests.filter((request) => {
      const employee = request.employeeId;

      const employeeName = [employee?.firstName, employee?.lastName]
        .filter(Boolean)
        .join(" ");

      const values = [
        employeeName,
        employee?.employeeCode,
        request.reason,
        request.requestedStatus,
        request.status,
      ];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [requests, search]);

  const counts = useMemo(() => {
    return {
      total: requests.length,

      pending: requests.filter((request) => request.status === "PENDING")
        .length,

      approved: requests.filter((request) => request.status === "APPROVED")
        .length,

      rejected: requests.filter((request) => request.status === "REJECTED")
        .length,
    };
  }, [requests]);

  const handleReview = async (requestId, decision, reviewRemarks) => {
    try {
      setReviewLoading(true);
      setError(null);

      await reviewAttendanceRegularization(requestId, {
        decision,
        reviewRemarks,
      });

      setSelectedRequest(null);

      await loadRequests({
        showLoader: false,
      });
    } catch (reviewError) {
      console.error("Failed to review regularization request:", reviewError);

      setError(
        reviewError?.response?.data?.message ||
          "Unable to review regularization request.",
      );
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 p-6 text-white shadow-[0_30px_70px_-35px_rgba(37,99,235,.65)] sm:p-7">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-100">
              <FileCheck2 size={12} />
              Attendance Workflow
            </div>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Regularization Requests
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
              Review employee attendance correction requests and keep attendance
              records accurate.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadRequests({
                showLoader: false,
              })
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur transition hover:bg-white/15 disabled:opacity-60"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total"
          value={counts.total}
          description="Requests in current view"
          icon={FileCheck2}
        />

        <StatCard
          label="Pending"
          value={counts.pending}
          description="Awaiting review"
          icon={Clock3}
          className="border-amber-200"
        />

        <StatCard
          label="Approved"
          value={counts.approved}
          description="Accepted corrections"
          icon={CheckCircle2}
          className="border-emerald-200"
        />

        <StatCard
          label="Rejected"
          value={counts.rejected}
          description="Declined corrections"
          icon={XCircle}
          className="border-rose-200"
        />
      </div>

      {/* Controls */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employee, code or reason..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["PENDING", "Pending"],
              ["APPROVED", "Approved"],
              ["REJECTED", "Rejected"],
              ["ALL", "All"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={`rounded-xl px-3.5 py-2 text-[11px] font-bold transition ${
                  status === value
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Error */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />

          <div>
            <p className="text-xs font-bold">
              Unable to load regularization data
            </p>

            <p className="mt-1 text-[11px] leading-5">{error}</p>
          </div>
        </div>
      )}

      {/* Table */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-sm font-black text-slate-800">Requests</p>

          <p className="mt-1 text-[11px] text-slate-400">
            {filteredRequests.length} request
            {filteredRequests.length === 1 ? "" : "s"} shown
          </p>
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
        ) : filteredRequests.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
            <div className="grid size-12 place-items-center rounded-2xl bg-slate-50 text-slate-400">
              <FileCheck2 size={20} />
            </div>

            <h3 className="mt-4 text-sm font-black text-slate-700">
              No requests found
            </h3>

            <p className="mt-1 max-w-sm text-[11px] leading-5 text-slate-400">
              There are no attendance regularization requests matching the
              current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Employee
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Date
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Requested Status
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Check In
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Check Out
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map((request) => {
                  const employee = request.employeeId;

                  const employeeName = [employee?.firstName, employee?.lastName]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <tr
                      key={request._id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-xs font-black text-slate-800">
                            {employeeName || "Unknown employee"}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {employee?.employeeCode || "—"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                        {formatDate(request.date)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                          {request.requestedStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {formatTime(request.requestedCheckIn)}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {formatTime(request.requestedCheckOut)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={request.status} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(request)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={13} />
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Review drawer */}

      {selectedRequest && (
        <ReviewDrawer
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onReview={handleReview}
          loading={reviewLoading}
        />
      )}
    </div>
  );
};

export default AttendanceRegularization;
