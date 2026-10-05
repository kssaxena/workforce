import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileText,
  LayoutDashboard,
  LocateFixed,
  LogOut,
  Menu,
  Network,
  Receipt,
  Route,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
  MapPinned,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";

import Overview from "./components/Overview";
import Employee from "./components/Employee";
import Attendance from "./components/Attendance";
import Payroll from "./components/Payroll";
import Access from "./components/Access";
import Department from "./components/Department";
import OrganizationUnit from "./components/OrganizationUnit";
import WorkSchedule from "./components/WorkSchedule";
import Hierarchy from "./components/Hierarchy";

const navigation = [
  {
    title: "Command Center",
    items: [
      {
        id: "overview",
        label: "Overview",
        icon: LayoutDashboard,
      },
      {
        id: "employees",
        label: "Employees",
        icon: Users,
      },
      {
        id: "attendance",
        label: "Attendance",
        icon: ClipboardCheck,
      },
      {
        id: "location",
        label: "Location Attendance",
        icon: LocateFixed,
      },
      {
        id: "field",
        label: "Field Workforce",
        icon: Route,
      },
      {
        id: "payroll",
        label: "Payroll",
        icon: Wallet,
      },
      {
        id: "hierarchy",
        label: "Hierarchy",
        icon: Network,
      },
      {
        id: "departments",
        label: "Departments",
        icon: Building2,
      },
      {
        id: "organizationUnits",
        label: "Organization Units",
        icon: MapPinned,
      },
      {
        id: "workSchedules",
        label: "Work Schedules",
        icon: Clock3,
      },
      {
        id: "expenses",
        label: "Expenses",
        icon: Receipt,
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        id: "access",
        label: "Access & Roles",
        icon: ShieldCheck,
      },
      {
        id: "work-schedules",
        label: "Work Schedules",
        icon: Clock3,
      },
      {
        id: "holidays",
        label: "Holidays",
        icon: CalendarDays,
      },
      {
        id: "policies",
        label: "Policies",
        icon: Settings,
      },
      {
        id: "company",
        label: "Company Settings",
        icon: Building2,
      },
    ],
  },
];

const pageTitles = {
  overview: {
    title: "Overview",
    description: "Your company's workforce command center.",
  },
  employees: {
    title: "Employees",
    description: "Manage your workforce and employee profiles.",
  },
  attendance: {
    title: "Attendance",
    description: "Monitor workforce attendance and daily activity.",
  },
  location: {
    title: "Location Attendance",
    description: "Monitor GPS-verified workforce attendance.",
  },
  field: {
    title: "Field Workforce",
    description: "Monitor employees working outside the office.",
  },
  payroll: {
    title: "Payroll",
    description: "Manage payroll and salary operations.",
  },
  hierarchy: {
    title: "Hierarchy",
    description: "Manage your organization's reporting structure.",
  },
  departments: {
    title: "Departments",
    description:
      "Manage your company's departments and organization structure.",
  },
  organizationUnits: {
    title: "Organization Units",
    description: "Manage branches, offices, regions and operating units.",
  },
  expenses: {
    title: "Expenses",
    description: "Review workforce expenses and reimbursements.",
  },
  analytics: {
    title: "Analytics",
    description: "Understand workforce performance and trends.",
  },
  access: {
    title: "Access & Roles",
    description: "Manage roles, permissions and platform access.",
  },
  "work-schedules": {
    title: "Work Schedules",
    description: "Configure working days and schedules.",
  },
  holidays: {
    title: "Holidays",
    description: "Manage company holidays.",
  },
  policies: {
    title: "Policies",
    description: "Configure company workforce policies.",
  },
  company: {
    title: "Company Settings",
    description: "Manage your company configuration.",
  },
  workSchedules: {
    title: "Work Schedules",
    description: "Configure your work schedules here",
  },
};

const Dashboard = () => {
  const { user, company, roleCodes, logout } = useAuth();

  const [activePage, setActivePage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const activeMeta = useMemo(
    () => pageTitles[activePage] || pageTitles.overview,
    [activePage],
  );

  const displayName =
    user?.firstName ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Administrator";

  const companyName = company?.name || company?.legalName || "Your Company";

  const roleLabel = roleCodes?.[0]?.replaceAll("_", " ") || "Administrator";

  const renderContent = () => {
    switch (activePage) {
      case "employees":
        return <Employee />;

      case "attendance":
        return <Attendance />;

      case "payroll":
        return <Payroll />;

      case "access":
        return <Access />;

      case "departments":
        return <Department />;

      case "organizationUnits":
        return <OrganizationUnit />;

      case "workSchedules":
        return <WorkSchedule />;

      case "hierarchy":
        return <Hierarchy />;

      case "overview":
      default:
        return <Overview />;
    }
  };

  const handleNavigation = (id) => {
    setActivePage(id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-900">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-5">
          <button
            type="button"
            onClick={() => handleNavigation("overview")}
            className="flex items-center gap-3"
          >
            <div className="grid size-10 place-items-center rounded-xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-600/20">
              W
            </div>

            <div className="text-left">
              <p className="text-[15px] font-black tracking-tight">
                Workforce OS
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Command Center
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          {navigation.map((group) => (
            <div key={group.title} className="mb-7">
              <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activePage === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigation(item.id)}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition ${
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        size={17}
                        strokeWidth={active ? 2.4 : 2}
                        className={
                          active
                            ? "text-blue-600"
                            : "text-slate-400 group-hover:text-slate-600"
                        }
                      />

                      <span>{item.label}</span>

                      {active && (
                        <span className="ml-auto size-1.5 rounded-full bg-blue-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Company */}
        <div className="border-t border-slate-100 p-3">
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm">
                <Building2 size={17} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-800">
                  {companyName}
                </p>
                <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-[270px]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {companyName}
              </p>

              <h1 className="mt-0.5 text-lg font-black tracking-tight sm:text-xl">
                {activeMeta.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
            >
              <Bell size={18} />

              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-blue-600" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2 transition hover:bg-slate-50"
              >
                <div className="grid size-8 place-items-center rounded-lg bg-blue-600 text-xs font-black text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="max-w-[130px] truncate text-xs font-bold text-slate-800">
                    {displayName}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400">
                    {roleLabel}
                  </p>
                </div>

                <ChevronDown size={15} className="text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mb-7">
            <p className="text-sm text-slate-500">{activeMeta.description}</p>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
