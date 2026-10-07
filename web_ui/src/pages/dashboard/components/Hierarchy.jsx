import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Users,
  UserRound,
  Search,
  Building2,
  BriefcaseBusiness,
  RefreshCw,
  MoreVertical,
  GitBranch,
  X,
  Check,
} from "lucide-react";

import {
  getEmployeeHierarchy,
  updateEmployeeReportingManager,
} from "../../../services/employee";

const buildHierarchy = (employees) => {
  const employeeMap = new Map();

  employees.forEach((employee) => {
    employeeMap.set(employee._id, {
      ...employee,
      children: [],
    });
  });

  const roots = [];

  employees.forEach((employee) => {
    const current = employeeMap.get(employee._id);

    const managerId =
      typeof employee.reportsTo === "object"
        ? employee.reportsTo?._id
        : employee.reportsTo;

    if (managerId && employeeMap.has(managerId)) {
      employeeMap.get(managerId).children.push(current);
    } else {
      roots.push(current);
    }
  });

  return roots;
};

const HierarchyNode = ({ employee, level = 0, employees, onChangeManager }) => {
  const [expanded, setExpanded] = useState(level < 2);
  const [menuOpen, setMenuOpen] = useState(false);

  const hasChildren = employee.children?.length > 0;

  return (
    <div className="relative">
      <div
        className="flex items-start gap-3"
        style={{ marginLeft: `${level * 34}px` }}
      >
        {level > 0 && (
          <div className="absolute -left-5 top-6 h-px w-5 bg-gray-200" />
        )}

        <div className="flex-1">
          <motion.div
            layout
            className="group relative flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow-md"
          >
            {/* Avatar */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
              {employee.profileImage ? (
                <img
                  src={employee.profileImage}
                  alt={`${employee.firstName} ${employee.lastName || ""}`}
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <UserRound className="h-5 w-5 text-gray-500" />
              )}
            </div>

            {/* Employee information */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-gray-900">
                  {employee.firstName} {employee.lastName || ""}
                </h3>

                {employee.employeeCode && (
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                    {employee.employeeCode}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {employee.designation || "Employee"}
              </p>

              <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400">
                {employee.departmentId?.name && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {employee.departmentId.name}
                  </span>
                )}

                {employee.organizationUnitId?.name && (
                  <span className="flex items-center gap-1">
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    {employee.organizationUnitId.name}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="relative flex shrink-0 items-center gap-2">
              {hasChildren && (
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  title={expanded ? "Collapse team" : "Expand team"}
                >
                  {expanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                title="Employee actions"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.96,
                      y: -4,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.96,
                      y: -4,
                    }}
                    className="absolute right-0 top-11 z-30 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onChangeManager(employee);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      <GitBranch className="h-4 w-4 text-gray-500" />

                      <span>Change Reporting Manager</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Children */}
          <AnimatePresence initial={false}>
            {expanded && hasChildren && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                className="mt-3 space-y-3 overflow-hidden border-l border-gray-200 pl-4"
              >
                {employee.children.map((child) => (
                  <HierarchyNode
                    key={child._id}
                    employee={child}
                    level={level + 1}
                    employees={employees}
                    onChangeManager={onChangeManager}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const ChangeManagerModal = ({ employee, employees, onClose, onSuccess }) => {
  const currentManagerId =
    typeof employee?.reportsTo === "object"
      ? employee.reportsTo?._id
      : employee?.reportsTo;

  const [selectedManager, setSelectedManager] = useState(
    currentManagerId || "",
  );

  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /*
   * Employees who are inside this employee's downstream
   * hierarchy cannot become their manager.
   *
   * We calculate this from the flat employee list.
   */
  const invalidManagerIds = useMemo(() => {
    const descendants = new Set();

    const findChildren = (managerId) => {
      employees.forEach((item) => {
        const reportsTo =
          typeof item.reportsTo === "object"
            ? item.reportsTo?._id
            : item.reportsTo;

        if (reportsTo === managerId) {
          if (!descendants.has(item._id)) {
            descendants.add(item._id);
            findChildren(item._id);
          }
        }
      });
    };

    if (employee?._id) {
      findChildren(employee._id);
      descendants.add(employee._id);
    }

    return descendants;
  }, [employee, employees]);

  const availableManagers = useMemo(() => {
    const value = search.toLowerCase().trim();

    return employees.filter((manager) => {
      if (invalidManagerIds.has(manager._id)) {
        return false;
      }

      if (!value) {
        return true;
      }

      const fullName = `${manager.firstName || ""} ${
        manager.lastName || ""
      }`.toLowerCase();

      return (
        fullName.includes(value) ||
        manager.employeeCode?.toLowerCase().includes(value) ||
        manager.designation?.toLowerCase().includes(value)
      );
    });
  }, [employees, invalidManagerIds, search]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      await updateEmployeeReportingManager(
        employee._id,
        selectedManager || null,
      );

      onSuccess();
    } catch (err) {
      console.error("Failed to update reporting manager:", err);

      setError(
        err?.response?.data?.message || "Unable to update reporting manager.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 10,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Change Reporting Manager
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {employee.firstName} {employee.lastName || ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 p-6">
          {/* Current manager */}
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Current Manager
            </p>

            <p className="mt-1 text-sm font-medium text-gray-800">
              {employee.reportsTo
                ? `${employee.reportsTo.firstName || ""} ${
                    employee.reportsTo.lastName || ""
                  }`
                : "No reporting manager"}
            </p>
          </div>

          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              New Reporting Manager
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employees..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400"
              />
            </div>
          </div>

          {/* No manager */}
          <button
            type="button"
            onClick={() => setSelectedManager("")}
            className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
              selectedManager === ""
                ? "border-gray-900 bg-gray-50"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div>
              <p className="text-sm font-medium text-gray-800">
                No Reporting Manager
              </p>

              <p className="mt-0.5 text-xs text-gray-500">
                Make this employee a top-level employee
              </p>
            </div>

            {selectedManager === "" && (
              <Check className="h-4 w-4 text-gray-700" />
            )}
          </button>

          {/* Manager list */}
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {availableManagers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
                <p className="text-sm font-medium text-gray-700">
                  No managers found
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Try another search.
                </p>
              </div>
            ) : (
              availableManagers.map((manager) => {
                const selected = selectedManager === manager._id;

                return (
                  <button
                    key={manager._id}
                    type="button"
                    onClick={() => setSelectedManager(manager._id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      selected
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <UserRound className="h-4 w-4 text-gray-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {manager.firstName} {manager.lastName || ""}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {manager.designation || "Employee"}
                        {manager.employeeCode
                          ? ` • ${manager.employeeCode}`
                          : ""}
                      </p>
                    </div>

                    {selected && (
                      <Check className="h-4 w-4 shrink-0 text-gray-700" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Hierarchy = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchHierarchy = async ({ refresh = false } = {}) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getEmployeeHierarchy();

      setEmployees(response?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch employee hierarchy:", err);

      setError(
        err?.response?.data?.message || "Unable to load employee hierarchy.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) {
      return employees;
    }

    const value = search.toLowerCase().trim();

    return employees.filter((employee) => {
      const fullName = `${employee.firstName || ""} ${
        employee.lastName || ""
      }`.toLowerCase();

      return (
        fullName.includes(value) ||
        employee.employeeCode?.toLowerCase().includes(value) ||
        employee.designation?.toLowerCase().includes(value) ||
        employee.departmentId?.name?.toLowerCase().includes(value)
      );
    });
  }, [employees, search]);

  const hierarchy = useMemo(
    () => buildHierarchy(filteredEmployees),
    [filteredEmployees],
  );

  const totalEmployees = employees.length;

  const managers = employees.filter((employee) =>
    employees.some((child) => {
      const reportsTo =
        typeof child.reportsTo === "object"
          ? child.reportsTo?._id
          : child.reportsTo;

      return reportsTo === employee._id;
    }),
  ).length;

  const topLevelEmployees = employees.filter((employee) => {
    const managerId =
      typeof employee.reportsTo === "object"
        ? employee.reportsTo?._id
        : employee.reportsTo;

    return !managerId || !employees.some((item) => item._id === managerId);
  }).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-56 animate-pulse rounded-lg bg-gray-200" />
          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-gray-500">Organization</p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            Reporting Hierarchy
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Understand who reports to whom across your organization.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchHierarchy({ refresh: true })}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {totalEmployees}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Managers</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {managers}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
              <UserRound className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Top Level</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {topLevelEmployees}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
              <BriefcaseBusiness className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search employee, code, designation or department..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
          />
        </div>

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Hierarchy */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 shadow-sm sm:p-6">
        {hierarchy.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <Users className="h-6 w-6 text-gray-400" />
            </div>

            <h3 className="mt-4 font-semibold text-gray-800">
              No hierarchy found
            </h3>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              {search
                ? "No employees matched your search."
                : "Create employees and assign reporting managers to build the hierarchy."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {hierarchy.map((employee) => (
              <HierarchyNode
                key={employee._id}
                employee={employee}
                employees={employees}
                onChangeManager={setSelectedEmployee}
              />
            ))}
          </div>
        )}
      </div>

      {/* Change manager modal */}
      {selectedEmployee && (
        <ChangeManagerModal
          employee={selectedEmployee}
          employees={employees}
          onClose={() => setSelectedEmployee(null)}
          onSuccess={async () => {
            setSelectedEmployee(null);
            await fetchHierarchy({ refresh: true });
          }}
        />
      )}
    </div>
  );
};

export default Hierarchy;
