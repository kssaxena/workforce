import { useEffect, useState } from "react";
import { getDashboardOverview } from "../../../services/dashboard";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  UserMinus,
  UserPlus,
  Users,
  Wallet,
  Settings,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  iconClass = "bg-blue-50 text-blue-600",
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_-25px_rgba(15,23,42,.35)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400">{title}</p>

          <p className="mt-3 text-2xl font-black tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-[11px] font-medium text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`grid size-10 shrink-0 place-items-center rounded-xl ${iconClass}`}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
};

const SectionCard = ({ title, description, children, action }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_35px_-25px_rgba(15,23,42,.35)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-black text-slate-900">{title}</h2>

          {description && (
            <p className="mt-1 text-[11px] font-medium text-slate-400">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
};

const EmptyState = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex min-h-[210px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
      <div className="grid size-11 place-items-center rounded-xl bg-white text-slate-400 shadow-sm">
        <Icon size={19} />
      </div>

      <h3 className="mt-4 text-xs font-black text-slate-700">{title}</h3>

      <p className="mt-1 max-w-sm text-[11px] leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
};

const Overview = () => {
  const { company } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getDashboardOverview();

        console.log("Dashboard overview response:", response.data);

        setDashboard(response.data?.data || null);
      } catch (error) {
        console.error("Dashboard overview error:", error);

        setError(
          error.response?.data?.message || "Unable to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const companyName = company?.name || company?.legalName || "your company";

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 p-6 text-white shadow-[0_30px_70px_-35px_rgba(37,99,235,.65)] sm:p-7">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-100">
              <Activity size={12} />
              Workforce Command Center
            </div>

            <h2 className="max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">
              Welcome to your workforce command center.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
              Monitor your people, attendance and workforce operations from one
              place.
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-200">
              Organization
            </p>

            <p className="mt-1 text-sm font-black">{companyName}</p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Employees"
          value={loading ? "..." : (dashboard?.employees?.total ?? "—")}
          description="Active workforce"
          icon={Users}
        />

        <StatCard
          title="Present Today"
          value={loading ? "..." : (dashboard?.attendance?.present ?? "—")}
          description="Attendance data"
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Absent Today"
          value={loading ? "..." : (dashboard?.attendance?.absent ?? "—")}
          description="Attendance data"
          icon={UserMinus}
          iconClass="bg-rose-50 text-rose-600"
        />

        <StatCard
          title="On Leave"
          value={loading ? "..." : (dashboard?.attendance?.onLeave ?? "—")}
          description="Approved leave"
          icon={CalendarDays}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Field Active"
          value={
            dashboard?.fieldWorkforce?.available
              ? dashboard.fieldWorkforce.active
              : "—"
          }
          description="Location workforce"
          icon={MapPin}
          iconClass="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <SectionCard
          title="Attendance Overview"
          description="Daily workforce attendance trends."
          action={
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600"
            >
              View details
              <ArrowUpRight size={13} />
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [
                "Present",
                dashboard?.attendance?.present ?? "—",
                "text-emerald-600",
                CheckCircle2,
              ],
              [
                "Absent",
                dashboard?.attendance?.absent ?? "—",
                "text-rose-600",
                UserMinus,
              ],
              [
                "Late",
                dashboard?.attendance?.late ?? "—",
                "text-amber-600",
                Clock3,
              ],
            ].map(([label, value, color, Icon]) => (
              <div
                key={label}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-center gap-2">
                  <Icon size={15} className={color} />
                  <span className="text-[11px] font-semibold text-slate-500">
                    {label}
                  </span>
                </div>

                <p className="mt-3 text-xl font-black text-slate-800">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700">
                  Today's attendance rate
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Based on today's recorded workforce attendance.
                </p>
              </div>

              <p className="text-2xl font-black text-blue-600">
                {dashboard?.attendance?.attendanceRate ?? 0}%
              </p>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-700"
                style={{
                  width: `${Math.min(
                    dashboard?.attendance?.attendanceRate ?? 0,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-5">
            <EmptyState
              icon={Activity}
              title="Attendance analytics will appear here"
              description="Once company-wide attendance records are available, this section will show daily and historical attendance trends."
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Employee Activity"
          description="Recent workforce activity."
        >
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Employee check-ins, leave requests and workforce events will appear here."
          />
        </SectionCard>
      </div>

      {/* Lower grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Department Performance"
          description="Workforce performance by department."
        >
          <div className="space-y-3">
            {dashboard?.departments?.length ? (
              dashboard.departments.slice(0, 6).map((department) => {
                const attendanceRate =
                  department.employees > 0
                    ? Math.round(
                        (department.present / department.employees) * 100,
                      )
                    : 0;

                return (
                  <div
                    key={department.name}
                    className="rounded-xl border border-slate-100 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-800">
                          {department.name}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {department.employees} employees
                        </p>
                      </div>

                      <p className="text-sm font-black text-blue-600">
                        {attendanceRate}%
                      </p>
                    </div>

                    <div className="mt-3 h-1.5 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${attendanceRate}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                icon={Users}
                title="No departments yet"
                description="Create departments and assign employees to see department-level attendance."
              />
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Quick Actions"
          description="Common company administration tasks."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                title: "Add Employee",
                description: "Create a new employee account.",
                icon: UserPlus,
              },
              {
                title: "Attendance",
                description: "Review today's attendance.",
                icon: CheckCircle2,
              },
              {
                title: "Payroll",
                description: "Open payroll operations.",
                icon: Wallet,
              },
              {
                title: "Company Settings",
                description: "Configure workforce policies.",
                icon: Settings,
              },
            ].map(({ title, description, icon: Icon }) => (
              <button
                key={title}
                type="button"
                className="group rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-lg bg-slate-50 text-slate-500 transition group-hover:bg-blue-100 group-hover:text-blue-600">
                    <Icon size={16} />
                  </div>

                  <div>
                    <p className="text-xs font-black text-slate-800">{title}</p>

                    <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                      {description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default Overview;
