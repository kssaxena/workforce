import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Crown,
  LoaderCircle,
  RefreshCw,
  Users,
  X,
} from "lucide-react";

import {
  getAvailablePlans,
  getCurrentSubscription,
} from "../../../services/subscription";

const FEATURE_LABELS = {
  employeeDirectory: "Employee directory",
  attendance: "Attendance management",
  leaveManagement: "Leave management",
  holidays: "Holiday management",
  basicReports: "Basic reports",
  workSchedules: "Custom work schedules",
  gpsAttendance: "GPS attendance",
  expenseManagement: "Expense management",
  advancedReports: "Advanced reports",
  auditLogAccess: "Audit log access",
  advancedApprovals: "Advanced approval workflows",
  dataExports: "Data exports",
};

const PLAN_ORDER = ["FREE", "BEGINNER", "INTERMEDIATE", "PRO"];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const formatDate = (value) => {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

const StatCard = ({ icon: Icon, label, value, hint }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <div className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={18} />
      </div>
    </div>

    <p className="mt-4 text-2xl font-black tracking-tight text-slate-900">
      {value}
    </p>

    {hint && <p className="mt-1 text-xs leading-5 text-slate-400">{hint}</p>}
  </div>
);

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [plansError, setPlansError] = useState("");
  const [summaryError, setSummaryError] = useState("");

  const loadSubscriptionData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setPlansError("");
    setSummaryError("");

    const [plansResult, summaryResult] = await Promise.allSettled([
      getAvailablePlans(),
      getCurrentSubscription(),
    ]);

    if (plansResult.status === "fulfilled") {
      const result = plansResult.value?.data?.data;
      setPlans(Array.isArray(result) ? result : []);
    } else {
      setPlansError(
        getErrorMessage(
          plansResult.reason,
          "Unable to load available subscription plans.",
        ),
      );
    }

    if (summaryResult.status === "fulfilled") {
      setSummary(summaryResult.value?.data?.data ?? null);
    } else {
      setSummaryError(
        getErrorMessage(
          summaryResult.reason,
          "Unable to load your current subscription.",
        ),
      );
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const orderedPlans = [...plans].sort((a, b) => {
    const aIndex = PLAN_ORDER.indexOf(a.code);
    const bIndex = PLAN_ORDER.indexOf(b.code);

    return (
      (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
      (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
    );
  });

  const currentPlanCode = summary?.plan?.code;
  const usage = summary?.usage;

  const activeEmployees = usage?.activeEmployees ?? 0;
  const employeeLimit = usage?.employeeLimit ?? 0;
  const remainingSeats = usage?.remainingSeats ?? 0;

  const usagePercentage =
    employeeLimit > 0
      ? Math.min(100, (activeEmployees / employeeLimit) * 100)
      : 0;

  if (loading) {
    return (
      <div className="flex min-h-72 items-center justify-center gap-3 text-sm font-medium text-slate-500">
        <LoaderCircle size={20} className="animate-spin" />
        Loading subscription details...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard size={22} className="text-blue-600" />
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              Subscription & Plans
            </h1>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review your current subscription, monitor employee usage, and
            compare the plans available for your organization.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadSubscriptionData(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {summaryError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Subscription details unavailable</p>
            <p className="mt-1 leading-6">{summaryError}</p>
            <p className="mt-2 text-xs leading-5">
              Check that the current-subscription endpoint is mounted and that
              your account has company-read permission.
            </p>
          </div>
        </div>
      )}

      {plansError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>{plansError}</p>
        </div>
      )}

      {/* Current subscription */}
      {summary && (
        <>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
              <div className="flex items-start gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  <Crown size={23} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Current plan
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                      {summary.plan?.name || "Unknown plan"}
                    </h2>

                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700">
                      {summary.subscription?.status || "Unknown"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {summary.companyStatus === "ACTIVE"
                      ? "Your organization is active."
                      : `Company status: ${summary.companyStatus || "Unknown"}`}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 px-5 py-4 sm:min-w-52">
                <p className="text-xs font-semibold text-slate-500">
                  Employee capacity
                </p>

                <p className="mt-1 text-xl font-black text-slate-900">
                  {activeEmployees.toLocaleString("en-IN")}
                  <span className="text-sm font-semibold text-slate-400">
                    {" "}
                    / {employeeLimit.toLocaleString("en-IN")}
                  </span>
                </p>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usagePercentage >= 100
                        ? "bg-rose-500"
                        : usagePercentage >= 80
                          ? "bg-amber-500"
                          : "bg-blue-600"
                    }`}
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>

                <p className="mt-2 text-[11px] font-semibold text-slate-500">
                  {remainingSeats.toLocaleString("en-IN")} seats remaining
                </p>
              </div>
            </div>

            <div className="grid gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-3">
              <div className="bg-white px-5 py-4 sm:px-7">
                <p className="text-[11px] font-semibold text-slate-400">
                  Plan employee limit
                </p>
                <p className="mt-1 text-lg font-black text-slate-800">
                  {employeeLimit.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="bg-white px-5 py-4 sm:px-7">
                <p className="text-[11px] font-semibold text-slate-400">
                  Trial ends
                </p>
                <p className="mt-1 text-lg font-black text-slate-800">
                  {summary.subscription?.status === "TRIAL"
                    ? formatDate(summary.subscription.trialEndsAt)
                    : "Not applicable"}
                </p>
              </div>

              <div className="bg-white px-5 py-4 sm:px-7">
                <p className="text-[11px] font-semibold text-slate-400">
                  Subscription expiry
                </p>
                <p className="mt-1 text-lg font-black text-slate-800">
                  {formatDate(summary.subscription?.expiresAt)}
                </p>
              </div>
            </div>
          </div>

          {usage?.limitReached && (
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-amber-600"
                />
                <div>
                  <p className="text-sm font-bold text-amber-900">
                    Employee limit reached
                  </p>
                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Your company is using all available employee seats. Compare
                    plans below to find a suitable capacity.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              icon={Users}
              label="Active employees"
              value={activeEmployees.toLocaleString("en-IN")}
              hint="Based on active employee records."
            />

            <StatCard
              icon={CheckCircle2}
              label="Remaining seats"
              value={remainingSeats.toLocaleString("en-IN")}
              hint="Available before reaching the current plan limit."
            />

            <StatCard
              icon={CreditCard}
              label="Included features"
              value={
                Object.values(summary.plan?.features || {}).filter(Boolean)
                  .length
              }
              hint="Features marked as included in your current plan."
            />
          </div>
        </>
      )}

      {/* Plan catalogue */}
      <div className="space-y-2">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900">
            Compare plans
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Proposed pricing per active employee, in Indian rupees. Annual
            prices are monthly equivalents billed annually.
          </p>
        </div>

        {!plansError && orderedPlans.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            No plans were returned by the API.
          </div>
        )}

        <div className="grid items-stretch gap-4 pt-3 sm:grid-cols-2 xl:grid-cols-4">
          {orderedPlans.map((plan) => {
            const isCurrent = currentPlanCode === plan.code;
            const includedFeatures = Object.entries(plan.features || {})
              .filter(([, included]) => included)
              .map(([key]) => key);

            const monthlyPrice = plan.pricing?.monthlyPerEmployee ?? 0;
            const annualPrice =
              plan.pricing?.annualPerEmployeeMonthlyEquivalent ?? 0;

            return (
              <article
                key={plan.code}
                className={`relative flex flex-col rounded-2xl border bg-white p-5 transition ${
                  isCurrent
                    ? "border-blue-500 ring-2 ring-blue-100"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {isCurrent && (
                  <span className="absolute right-4 top-4 rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-blue-700">
                    Current plan
                  </span>
                )}

                <div className="pr-2">
                  <h3 className="text-base font-black text-slate-900">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Up to {plan.employeeLimit.toLocaleString("en-IN")} active
                    employees
                  </p>
                </div>

                <div className="mt-5">
                  {plan.code === "FREE" ? (
                    <p className="text-3xl font-black tracking-tight text-slate-900">
                      Free
                    </p>
                  ) : (
                    <>
                      <p className="text-3xl font-black tracking-tight text-slate-900">
                        {formatCurrency(annualPrice)}
                        <span className="ml-1 text-xs font-semibold text-slate-400">
                          / employee / mo
                        </span>
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {formatCurrency(monthlyPrice)} per employee/month with
                        monthly billing
                      </p>
                    </>
                  )}
                </div>

                <div className="my-5 h-px bg-slate-100" />

                <div className="flex-1 space-y-3">
                  {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                    const included = plan.features?.[key] === true;

                    return (
                      <div key={key} className="flex items-start gap-2.5">
                        <span
                          className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${
                            included
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-300"
                          }`}
                        >
                          {included ? <Check size={11} /> : <X size={11} />}
                        </span>

                        <span
                          className={`text-xs leading-5 ${
                            included
                              ? "font-medium text-slate-700"
                              : "text-slate-400"
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled
                  title={
                    isCurrent
                      ? "This is your current plan."
                      : "Plan upgrades will be enabled after billing is integrated."
                  }
                  className={`mt-6 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold ${
                    isCurrent
                      ? "bg-blue-50 text-blue-700"
                      : "border border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  {isCurrent ? "Current plan" : "Upgrade unavailable"}
                  {!isCurrent && <ArrowRight size={14} />}
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">
        Pricing shown here is indicative. Plan changes, billing, invoices, and
        payment processing are not enabled by this screen.
      </p>
    </div>
  );
};

export default Subscription;
