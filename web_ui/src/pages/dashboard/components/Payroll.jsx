import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileText,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  Users,
  Wallet,
} from "lucide-react";

import {
  generatePayrollRun,
  getPayrollRun,
  getPayrollRuns,
} from "../../../services/payroll";

const formatINR = (paise) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format((Number(paise) || 0) / 100);

const formatPeriod = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));

const errorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

const StatCard = ({ label, value, icon: Icon, hint }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 break-words text-2xl font-bold text-slate-900">
          {value}
        </p>
        {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
      </div>
      <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
        <Icon size={20} />
      </div>
    </div>
  </div>
);

const IssueList = ({ issues = [] }) => {
  if (!issues.length) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <CheckCircle2 size={18} />
        No blocking issues were reported by the current validation pass.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {issues.map((issue, index) => (
        <div
          key={`${issue.code}-${issue.employeeCode || ""}-${index}`}
          className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3"
        >
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-700" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-950">
              {issue.employeeCode ? `${issue.employeeCode}: ` : ""}
              {issue.code}
            </p>
            <p className="mt-1 text-sm text-amber-900">{issue.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const Payroll = () => {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);

  const [loadingRuns, setLoadingRuns] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [loadingRun, setLoadingRun] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadRuns = useCallback(async () => {
    setLoadingRuns(true);
    setError("");

    try {
      const response = await getPayrollRuns({ page: 1, limit: 50 });
      const items = response.data?.data?.items || [];
      setRuns(items);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoadingRuns(false);
    }
  }, []);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  const loadRun = async (runId) => {
    setLoadingRun(true);
    setError("");
    setNotice("");

    try {
      const response = await getPayrollRun(runId);
      setSelectedRun(response.data?.data || null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoadingRun(false);
    }
  };

  const handleGenerate = async (event) => {
    event.preventDefault();

    setGenerating(true);
    setError("");
    setNotice("");
    setSelectedRun(null);

    try {
      const response = await generatePayrollRun({ year, month });
      const result = response.data?.data;

      if (result?.payrollRun?._id) {
        setSelectedRun(result.payrollRun);
      }

      setNotice(
        result?.blockingIssues?.length
          ? `Draft created with ${result.blockingIssues.length} blocking issue(s). Review them before proceeding.`
          : "Payroll draft generated. Statutory calculations and compliance review are still required before finalization.",
      );

      await loadRuns();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const blockingIssues = useMemo(() => {
    const runIssues = selectedRun?.validationIssues || [];
    const employeeIssues = (selectedRun?.employees || []).flatMap((employee) =>
      (employee.validationIssues || []).map((issue) => ({
        ...issue,
        employeeCode: employee.employeeCode,
      })),
    );

    return [...runIssues, ...employeeIssues].filter(
      (issue) => issue.blocking !== false,
    );
  }, [selectedRun]);

  const canFinalize =
    selectedRun?.status === "REVIEW" &&
    blockingIssues.length === 0 &&
    (selectedRun?.employees || []).length > 0 &&
    selectedRun.employees.every((employee) =>
      ["PF", "ESI", "PROFESSIONAL_TAX", "TDS"].every((code) =>
        employee.statutoryResults?.some(
          (result) =>
            result.code === code &&
            result.verified === true &&
            Boolean(result.rulesetVersion),
        ),
      ),
    );

  return (
    <div className="space-y-6 pb-10">
      <section className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white md:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-white/10">
              <Wallet size={22} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
              Payroll operations
            </p>
            <h2 className="mt-2 text-3xl font-bold">Payroll management</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Generate monthly payroll from your company’s employee, attendance,
              leave and salary records. Resolve every validation issue before
              statutory review and finalization.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadRuns}
              disabled={loadingRuns}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900"
        >
          {notice}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
            <CalendarDays size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Generate monthly payroll
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Creates a draft using real employee and attendance records.
              Existing finalized periods cannot be regenerated.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleGenerate}
          className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto]"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Payroll month
            </span>
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            >
              {Array.from({ length: 12 }, (_, index) => {
                const value = index + 1;
                const label = new Intl.DateTimeFormat("en-IN", {
                  month: "long",
                  timeZone: "Asia/Kolkata",
                }).format(new Date(Date.UTC(2026, index, 1)));

                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Payroll year
            </span>
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            >
              {Array.from(
                { length: 7 },
                (_, index) => today.getFullYear() - 3 + index,
              ).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {generating ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <CircleDollarSign size={17} />
              )}
              {generating ? "Generating..." : "Generate draft"}
            </button>
          </div>
        </form>
      </section>

      {selectedRun && (
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-violet-700">
                Selected payroll run
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">
                {formatPeriod(selectedRun.periodStart)}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Status: {selectedRun.status}
              </p>
            </div>
            <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
              {canFinalize
                ? "Ready for authorized finalization"
                : "Not ready to finalize"}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Employees"
              value={selectedRun.totals?.employeeCount ?? 0}
              icon={Users}
            />
            <StatCard
              label="Gross earnings"
              value={formatINR(selectedRun.totals?.grossEarningsPaise)}
              icon={CircleDollarSign}
            />
            <StatCard
              label="Employee deductions"
              value={formatINR(selectedRun.totals?.employeeDeductionsPaise)}
              icon={FileText}
            />
            <StatCard
              label="Net payable"
              value={formatINR(selectedRun.totals?.netPayablePaise)}
              icon={Wallet}
              hint="Draft amount only; not an instruction to pay"
            />
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 font-bold text-slate-900">
              <ShieldAlert size={18} />
              Validation issues
            </h4>
            <IssueList issues={blockingIssues} />
          </div>

          <div>
            <h4 className="mb-3 font-bold text-slate-900">
              Employee payroll breakdown
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3 text-right">Paid days</th>
                    <th className="px-4 py-3 text-right">Unpaid days</th>
                    <th className="px-4 py-3 text-right">Gross</th>
                    <th className="px-4 py-3 text-right">Deductions</th>
                    <th className="px-4 py-3 text-right">Net pay</th>
                    <th className="px-4 py-3">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedRun.employees || []).map((employee) => (
                    <tr key={employee.employeeId} className="align-top">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">
                          {employee.employeeName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {employee.employeeCode}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums">
                        {employee.paidDays ?? "—"}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums">
                        {employee.unpaidDays ?? "—"}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums">
                        {formatINR(employee.grossEarningsPaise)}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums">
                        {formatINR(employee.totalDeductionsPaise)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold tabular-nums">
                        {formatINR(employee.netPayablePaise)}
                      </td>
                      <td className="px-4 py-4">
                        {employee.validationIssues?.some(
                          (item) => item.blocking,
                        ) ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                            <AlertCircle size={14} />
                            Review required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={14} />
                            No employee issues
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {!selectedRun.employees?.length && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        No employee payroll snapshots are available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Previous payroll runs
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Only records belonging to your company are shown.
            </p>
          </div>
          {loadingRuns && (
            <LoaderCircle size={18} className="animate-spin text-violet-700" />
          )}
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {!loadingRuns && runs.length === 0 && (
            <div className="py-8 text-center">
              <Clock3 size={24} className="mx-auto text-slate-400" />
              <p className="mt-3 font-semibold text-slate-700">
                No payroll runs yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Generate a draft after your company salary and policy records
                are configured.
              </p>
            </div>
          )}

          {runs.map((run) => (
            <button
              type="button"
              key={run._id}
              onClick={() => loadRun(run._id)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">
                  {formatPeriod(run.periodStart)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {run.totals?.employeeCount ?? 0} employees · {run.status}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-800">
                  {formatINR(run.totals?.netPayablePaise)}
                </span>
                <ChevronRight size={18} className="text-slate-400" />
              </div>
            </button>
          ))}
        </div>

        {loadingRun && (
          <p className="mt-3 text-sm text-slate-500">
            Loading payroll details...
          </p>
        )}
      </section>
    </div>
  );
};

export default Payroll;
