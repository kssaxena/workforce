import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Edit3,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Shield,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { getEmployees, createEmployee } from "../../../services/employee";
import {
  getDepartments,
  getOrganizationUnits,
} from "../../../services/organization";
import { getWorkSchedules } from "../../../services/workSchedule";
import { getRoles } from "../../../services/rbac";

const initialForm = {
  email: "",
  phone: "",
  password: "",

  firstName: "",
  lastName: "",
  employeeCode: "",

  dateOfBirth: "",
  gender: "",
  joiningDate: "",

  employmentType: "FULL_TIME",
  designation: "",

  departmentId: "",
  organizationUnitId: "",
  workScheduleId: "",
  reportsTo: "",
  roleId: "",

  contact: {
    alternatePhone: "",
    personalEmail: "",
    workEmail: "",
  },

  address: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    latitude: "",
    longitude: "",
  },
};

const employmentTypes = [
  {
    value: "FULL_TIME",
    label: "Full Time",
  },
  {
    value: "PART_TIME",
    label: "Part Time",
  },
  {
    value: "CONTRACT",
    label: "Contract",
  },
  {
    value: "INTERN",
    label: "Intern",
  },
  {
    value: "TEMPORARY",
    label: "Temporary",
  },
];

const genders = [
  {
    value: "MALE",
    label: "Male",
  },
  {
    value: "FEMALE",
    label: "Female",
  },
  {
    value: "OTHER",
    label: "Other",
  },
  {
    value: "PREFER_NOT_TO_SAY",
    label: "Prefer not to say",
  },
];

const Section = ({ icon: Icon, title, description, children }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Icon size={17} />
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-800">{title}</h3>

            {description && (
              <p className="mt-1 text-[11px] leading-5 text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
};

const Input = ({
  label,
  required = false,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[11px] font-bold text-slate-600">
        {label}

        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      <input
        {...props}
        className={`h-10 w-full rounded-xl border bg-white px-3 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-300 ${
          error
            ? "border-rose-300 focus:border-rose-400"
            : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
        }`}
      />

      {error && (
        <p className="mt-1 text-[10px] font-medium text-rose-500">{error}</p>
      )}
    </div>
  );
};

const Select = ({
  label,
  required = false,
  error,
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[11px] font-bold text-slate-600">
        {label}

        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      <div className="relative">
        <select
          {...props}
          className={`h-10 w-full appearance-none rounded-xl border bg-white px-3 pr-9 text-xs font-medium text-slate-700 outline-none transition ${
            error
              ? "border-rose-300 focus:border-rose-400"
              : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          }`}
        >
          {children}
        </select>

        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>

      {error && (
        <p className="mt-1 text-[10px] font-medium text-rose-500">{error}</p>
      )}
    </div>
  );
};

const EmptyState = ({ title, description }) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-slate-300 shadow-sm">
        <Users size={20} />
      </div>

      <h3 className="mt-4 text-sm font-black text-slate-700">{title}</h3>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
};

const Employee = () => {
  const [employees, setEmployees] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [organizationUnits, setOrganizationUnits] = useState([]);
  const [workSchedules, setWorkSchedules] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingDependencies, setLoadingDependencies] = useState(false);

  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [step, setStep] = useState(1);

  const loadEmployees = async () => {
    try {
      setLoading(true);

      const response = await getEmployees();

      setEmployees(response?.data?.data || []);
    } catch (error) {
      console.error("Failed to load employees:", error);

      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      setLoadingDependencies(true);

      const [
        departmentsResponse,
        organizationUnitsResponse,
        schedulesResponse,
        rolesResponse,
      ] = await Promise.all([
        getDepartments(),
        getOrganizationUnits(),
        getWorkSchedules(),
        getRoles(),
      ]);

      setDepartments(departmentsResponse?.data?.data || []);

      setOrganizationUnits(organizationUnitsResponse?.data?.data || []);

      setWorkSchedules(schedulesResponse?.data?.data || []);

      setRoles(rolesResponse?.data?.data || []);
    } catch (error) {
      console.error("Failed to load employee dependencies:", error);

      setSubmitError(
        "Some employee configuration data could not be loaded. Please refresh and try again.",
      );
    } finally {
      setLoadingDependencies(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadDependencies();
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return employees;
    }

    return employees.filter((employee) => {
      const fullName = [employee?.firstName, employee?.lastName]
        .filter(Boolean)
        .join(" ");

      return [
        fullName,
        employee?.employeeCode,
        employee?.email,
        employee?.phone,
        employee?.designation,
        employee?.employmentType,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [employees, search]);

  const stats = useMemo(() => {
    const active = employees.filter(
      (employee) =>
        employee?.employmentStatus === "ACTIVE" ||
        employee?.status === "ACTIVE" ||
        !employee?.employmentStatus,
    );

    const managers = employees.filter((employee) => employee?.reportsTo);

    return {
      total: employees.length,
      active: active.length,
      managers: managers.length,
      inactive: Math.max(employees.length - active.length, 0),
    };
  }, [employees]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  };

  const updateNestedField = (section, field, value) => {
    setForm((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));

    setErrors((current) => ({
      ...current,
      [`${section}.${field}`]: "",
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
    setSubmitError("");
    setSuccessMessage("");
    setStep(1);
  };

  const openCreateForm = async () => {
    resetForm();

    setShowForm(true);

    if (
      !departments.length &&
      !organizationUnits.length &&
      !workSchedules.length &&
      !roles.length
    ) {
      await loadDependencies();
    }
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    resetForm();
  };

  const validateStep = (currentStep) => {
    const nextErrors = {};

    if (currentStep === 1) {
      if (!form.firstName.trim()) {
        nextErrors.firstName = "First name is required.";
      } else if (form.firstName.trim().length < 2) {
        nextErrors.firstName = "First name must contain at least 2 characters.";
      }

      if (!form.lastName.trim()) {
        nextErrors.lastName = "Last name is required.";
      }

      if (!form.email.trim()) {
        nextErrors.email = "Email address is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        nextErrors.email = "Enter a valid email address.";
      }

      if (!form.phone.trim()) {
        nextErrors.phone = "Phone number is required.";
      }

      if (!form.password) {
        nextErrors.password = "Password is required.";
      } else if (form.password.length < 8) {
        nextErrors.password = "Password must contain at least 8 characters.";
      }

      if (!form.employeeCode.trim()) {
        nextErrors.employeeCode = "Employee code is required.";
      }

      if (!form.joiningDate) {
        nextErrors.joiningDate = "Joining date is required.";
      }
    }

    if (currentStep === 2) {
      if (!form.roleId) {
        nextErrors.roleId = "Role is required.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(step)) {
      return;
    }

    setStep((current) => Math.min(current + 1, 4));
  };

  const previousStep = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  const buildPayload = () => {
    return {
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      password: form.password,

      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      employeeCode: form.employeeCode.trim().toUpperCase(),

      dateOfBirth: form.dateOfBirth || null,

      gender: form.gender || null,

      joiningDate: form.joiningDate,

      employmentType: form.employmentType,

      designation: form.designation.trim() || null,

      departmentId: form.departmentId || null,

      organizationUnitId: form.organizationUnitId || null,

      workScheduleId: form.workScheduleId || null,

      reportsTo: form.reportsTo || null,

      roleId: form.roleId,

      contact: {
        alternatePhone: form.contact.alternatePhone.trim() || null,

        personalEmail: form.contact.personalEmail.trim().toLowerCase() || null,

        workEmail: form.contact.workEmail.trim().toLowerCase() || null,
      },

      address: {
        addressLine1: form.address.addressLine1.trim() || null,

        addressLine2: form.address.addressLine2.trim() || null,

        city: form.address.city.trim() || null,

        state: form.address.state.trim() || null,

        country: form.address.country.trim() || "India",

        postalCode: form.address.postalCode.trim() || null,

        latitude:
          form.address.latitude === "" ? null : Number(form.address.latitude),

        longitude:
          form.address.longitude === "" ? null : Number(form.address.longitude),
      },
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError("");
    setSuccessMessage("");

    for (let currentStep = 1; currentStep <= 2; currentStep += 1) {
      if (!validateStep(currentStep)) {
        setStep(currentStep);
        return;
      }
    }

    try {
      setSaving(true);

      const payload = buildPayload();

      await createEmployee(payload);

      setSuccessMessage("Employee created successfully.");

      await loadEmployees();

      setTimeout(() => {
        closeForm();
      }, 700);
    } catch (error) {
      console.error("Failed to create employee:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Unable to create employee. Please check the details and try again.";

      setSubmitError(message);
    } finally {
      setSaving(false);
    }
  };

  const getEmployeeName = (employee) => {
    const name = [employee?.firstName, employee?.lastName]
      .filter(Boolean)
      .join(" ");

    return name || "Unnamed Employee";
  };

  const getDepartmentName = (employee) => {
    if (!employee?.departmentId) {
      return "Unassigned";
    }

    if (typeof employee.departmentId === "object") {
      return employee.departmentId.name || "Unassigned";
    }

    return (
      departments.find(
        (department) => department?._id === employee.departmentId,
      )?.name || "Unassigned"
    );
  };

  const getRoleName = (employee) => {
    if (!employee?.roleId) {
      return "Unassigned";
    }

    if (typeof employee.roleId === "object") {
      return employee.roleId.name || employee.roleId.code || "Unassigned";
    }

    return (
      roles.find((role) => role?._id === employee.roleId)?.name || "Unassigned"
    );
  };

  const getScheduleName = (employee) => {
    if (!employee?.workScheduleId) {
      return "Company default";
    }

    if (typeof employee.workScheduleId === "object") {
      return employee.workScheduleId.name || "Company default";
    }

    return (
      workSchedules.find(
        (schedule) => schedule?._id === employee.workScheduleId,
      )?.name || "Company default"
    );
  };

  const getInitials = (employee) => {
    const first = employee?.firstName?.charAt(0) || "";

    const last = employee?.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "E";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={19} />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Employees
              </h1>

              <p className="mt-0.5 text-xs text-slate-400">
                Manage employee profiles, access, organization and reporting.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadEmployees}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:text-blue-600 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={15} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Employees",
            value: stats.total,
            icon: Users,
            className: "bg-blue-50 text-blue-600",
          },
          {
            label: "Active",
            value: stats.active,
            icon: Check,
            className: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Reporting Structure",
            value: stats.managers,
            icon: BriefcaseBusiness,
            className: "bg-violet-50 text-violet-600",
          },
          {
            label: "Inactive",
            value: stats.inactive,
            icon: X,
            className: "bg-rose-50 text-rose-600",
          },
        ].map(({ label, value, icon: Icon, className }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </p>

                <p className="mt-2 text-2xl font-black text-slate-800">
                  {value}
                </p>
              </div>

              <div
                className={`grid size-10 place-items-center rounded-xl ${className}`}
              >
                <Icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Directory */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-800">
              Employee Directory
            </h2>

            <p className="mt-1 text-[11px] text-slate-400">
              Search employees by name, code, email or designation.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employees..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title={search ? "No employees found" : "No employees yet"}
              description={
                search
                  ? "Try a different search term."
                  : "Create your first employee to start building the workforce directory."
              }
            />
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {[
                      "Employee",
                      "Code",
                      "Department",
                      "Role",
                      "Employment",
                      "Schedule",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee._id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-xs font-black text-blue-600">
                            {getInitials(employee)}
                          </div>

                          <div>
                            <p className="text-xs font-black text-slate-800">
                              {getEmployeeName(employee)}
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-600">
                          {employee.employeeCode || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                        {getDepartmentName(employee)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">
                          {getRoleName(employee)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                        {employee.employmentType?.replaceAll("_", " ") || "—"}
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                        {getScheduleName(employee)}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedEmployee(employee)}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="space-y-3 p-4 lg:hidden">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee._id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-xs font-black text-blue-600">
                        {getInitials(employee)}
                      </div>

                      <div>
                        <p className="text-xs font-black text-slate-800">
                          {getEmployeeName(employee)}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {employee.email}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedEmployee(employee)}
                      className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500"
                    >
                      <Eye size={14} />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase text-slate-400">
                        Code
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-700">
                        {employee.employeeCode || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-bold uppercase text-slate-400">
                        Role
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-700">
                        {getRoleName(employee)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-bold uppercase text-slate-400">
                        Department
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-700">
                        {getDepartmentName(employee)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-bold uppercase text-slate-400">
                        Employment
                      </p>

                      <p className="mt-1 text-xs font-bold text-slate-700">
                        {employee.employmentType?.replaceAll("_", " ") || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create employee modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <UserPlus size={17} />
                  </div>

                  <div>
                    <h2 className="text-base font-black text-slate-900">
                      Add Employee
                    </h2>

                    <p className="text-[10px] text-slate-400">
                      Create employee profile and system access.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </div>

            {/* Steps */}
            <div className="border-b border-slate-200 bg-white px-5 py-4">
              <div className="grid grid-cols-4 gap-2">
                {[
                  [1, "Personal", User],
                  [2, "Employment", BriefcaseBusiness],
                  [3, "Contact", Mail],
                  [4, "Address", MapPin],
                ].map(([number, label, Icon]) => {
                  const active = step === number;

                  const complete = step > number;

                  return (
                    <button
                      key={number}
                      type="button"
                      onClick={() => {
                        if (number < step) {
                          setStep(number);
                        }
                      }}
                      className="flex items-center gap-2 text-left"
                    >
                      <div
                        className={`grid size-8 shrink-0 place-items-center rounded-lg text-[10px] font-black ${
                          complete
                            ? "bg-emerald-500 text-white"
                            : active
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {complete ? <Check size={14} /> : <Icon size={14} />}
                      </div>

                      <div className="hidden sm:block">
                        <p
                          className={`text-[10px] font-black ${
                            active || complete
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {label}
                        </p>

                        <p className="text-[9px] text-slate-400">
                          Step {number}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal body */}
            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                {submitError && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
                    <AlertCircle
                      size={17}
                      className="mt-0.5 shrink-0 text-rose-500"
                    />

                    <div>
                      <p className="text-xs font-black text-rose-700">
                        Employee creation failed
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-rose-600">
                        {submitError}
                      </p>
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <Check size={17} className="text-emerald-600" />

                    <p className="text-xs font-bold text-emerald-700">
                      {successMessage}
                    </p>
                  </div>
                )}

                {loadingDependencies && (
                  <div className="mb-5 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-[11px] font-semibold text-blue-600">
                    <Loader2 size={14} className="animate-spin" />
                    Loading company configuration...
                  </div>
                )}

                {/* STEP 1 */}
                {step === 1 && (
                  <div className="space-y-5">
                    <Section
                      icon={User}
                      title="Personal Information"
                      description="Basic identity and account credentials."
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          label="First Name"
                          required
                          value={form.firstName}
                          onChange={(event) =>
                            updateField("firstName", event.target.value)
                          }
                          error={errors.firstName}
                          placeholder="Enter first name"
                        />

                        <Input
                          label="Last Name"
                          required
                          value={form.lastName}
                          onChange={(event) =>
                            updateField("lastName", event.target.value)
                          }
                          error={errors.lastName}
                          placeholder="Enter last name"
                        />

                        <Input
                          label="Email Address"
                          required
                          type="email"
                          value={form.email}
                          onChange={(event) =>
                            updateField("email", event.target.value)
                          }
                          error={errors.email}
                          placeholder="Enter email"
                        />

                        <Input
                          label="Phone Number"
                          required
                          value={form.phone}
                          onChange={(event) =>
                            updateField("phone", event.target.value)
                          }
                          error={errors.phone}
                          placeholder="Enter contact number"
                        />

                        <Input
                          label="Password"
                          required
                          type="password"
                          value={form.password}
                          onChange={(event) =>
                            updateField("password", event.target.value)
                          }
                          error={errors.password}
                          placeholder="Enter password"
                        />

                        <Input
                          label="Employee Code"
                          required
                          value={form.employeeCode}
                          onChange={(event) =>
                            updateField(
                              "employeeCode",
                              event.target.value.toUpperCase(),
                            )
                          }
                          error={errors.employeeCode}
                          placeholder="EMP001"
                        />

                        <Input
                          label="Date of Birth"
                          type="date"
                          value={form.dateOfBirth}
                          onChange={(event) =>
                            updateField("dateOfBirth", event.target.value)
                          }
                        />

                        <Select
                          label="Gender"
                          value={form.gender}
                          onChange={(event) =>
                            updateField("gender", event.target.value)
                          }
                        >
                          <option value="">Select gender</option>

                          {genders.map((gender) => (
                            <option key={gender.value} value={gender.value}>
                              {gender.label}
                            </option>
                          ))}
                        </Select>

                        <Input
                          label="Joining Date"
                          required
                          type="date"
                          value={form.joiningDate}
                          onChange={(event) =>
                            updateField("joiningDate", event.target.value)
                          }
                          error={errors.joiningDate}
                        />
                      </div>
                    </Section>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div className="space-y-5">
                    <Section
                      icon={BriefcaseBusiness}
                      title="Employment & Organization"
                      description="Assign the employee to the correct organizational structure and access role."
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Select
                          label="Employment Type"
                          required
                          value={form.employmentType}
                          onChange={(event) =>
                            updateField("employmentType", event.target.value)
                          }
                        >
                          {employmentTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </Select>

                        <Input
                          label="Designation"
                          value={form.designation}
                          onChange={(event) =>
                            updateField("designation", event.target.value)
                          }
                          placeholder="Software Engineer"
                        />

                        <Select
                          label="Role"
                          required
                          value={form.roleId}
                          onChange={(event) =>
                            updateField("roleId", event.target.value)
                          }
                          error={errors.roleId}
                        >
                          <option value="">Select role</option>

                          {roles.map((role) => (
                            <option key={role._id} value={role._id}>
                              {role.name}
                              {role.code ? ` (${role.code})` : ""}
                            </option>
                          ))}
                        </Select>

                        <Select
                          label="Department"
                          value={form.departmentId}
                          onChange={(event) =>
                            updateField("departmentId", event.target.value)
                          }
                        >
                          <option value="">No department</option>

                          {departments.map((department) => (
                            <option key={department._id} value={department._id}>
                              {department.name}
                            </option>
                          ))}
                        </Select>

                        <Select
                          label="Organization Unit"
                          value={form.organizationUnitId}
                          onChange={(event) =>
                            updateField(
                              "organizationUnitId",
                              event.target.value,
                            )
                          }
                        >
                          <option value="">No organization unit</option>

                          {organizationUnits.map((unit) => (
                            <option key={unit._id} value={unit._id}>
                              {unit.name}
                            </option>
                          ))}
                        </Select>

                        <Select
                          label="Work Schedule"
                          value={form.workScheduleId}
                          onChange={(event) =>
                            updateField("workScheduleId", event.target.value)
                          }
                        >
                          <option value="">Use company default</option>

                          {workSchedules.map((schedule) => (
                            <option key={schedule._id} value={schedule._id}>
                              {schedule.name}
                              {schedule.isDefault ? " — Default" : ""}
                            </option>
                          ))}
                        </Select>

                        <Select
                          label="Reports To"
                          value={form.reportsTo}
                          onChange={(event) =>
                            updateField("reportsTo", event.target.value)
                          }
                        >
                          <option value="">No reporting manager</option>

                          {employees.map((employee) => (
                            <option key={employee._id} value={employee._id}>
                              {getEmployeeName(employee)}
                              {employee.employeeCode
                                ? ` — ${employee.employeeCode}`
                                : ""}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                          <Shield
                            size={17}
                            className="mt-0.5 shrink-0 text-blue-600"
                          />

                          <div>
                            <p className="text-xs font-black text-blue-800">
                              Access is controlled by the assigned role
                            </p>

                            <p className="mt-1 text-[11px] leading-5 text-blue-600">
                              The login portal is only an entry point. The
                              employee's actual permissions are determined by
                              the RBAC role assigned here.
                            </p>
                          </div>
                        </div>
                      </div>
                    </Section>
                  </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <div className="space-y-5">
                    <Section
                      icon={Mail}
                      title="Contact Information"
                      description="Optional alternate and professional contact details."
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          label="Alternate Phone"
                          value={form.contact.alternatePhone}
                          onChange={(event) =>
                            updateNestedField(
                              "contact",
                              "alternatePhone",
                              event.target.value,
                            )
                          }
                          placeholder="Enter alternate contact number"
                        />

                        <Input
                          label="Personal Email"
                          type="email"
                          value={form.contact.personalEmail}
                          onChange={(event) =>
                            updateNestedField(
                              "contact",
                              "personalEmail",
                              event.target.value,
                            )
                          }
                          placeholder="Enter email"
                        />

                        <Input
                          label="Work Email"
                          type="email"
                          value={form.contact.workEmail}
                          onChange={(event) =>
                            updateNestedField(
                              "contact",
                              "workEmail",
                              event.target.value,
                            )
                          }
                          placeholder="employee@company.com"
                        />
                      </div>
                    </Section>
                  </div>
                )}

                {/* STEP 4 */}
                {step === 4 && (
                  <div className="space-y-5">
                    <Section
                      icon={MapPin}
                      title="Address"
                      description="Employee residential or contact address."
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          label="Address Line 1"
                          className="sm:col-span-2"
                          value={form.address.addressLine1}
                          onChange={(event) =>
                            updateNestedField(
                              "address",
                              "addressLine1",
                              event.target.value,
                            )
                          }
                          placeholder="House / street address"
                        />

                        <Input
                          label="Address Line 2"
                          className="sm:col-span-2"
                          value={form.address.addressLine2}
                          onChange={(event) =>
                            updateNestedField(
                              "address",
                              "addressLine2",
                              event.target.value,
                            )
                          }
                          placeholder="Apartment, landmark, etc."
                        />

                        <Input
                          label="City"
                          value={form.address.city}
                          onChange={(event) =>
                            updateNestedField(
                              "address",
                              "city",
                              event.target.value,
                            )
                          }
                          placeholder="Enter city"
                        />

                        <Input
                          label="State"
                          value={form.address.state}
                          onChange={(event) =>
                            updateNestedField(
                              "address",
                              "state",
                              event.target.value,
                            )
                          }
                          placeholder="Enter state"
                        />

                        <Input
                          label="Country"
                          value={form.address.country}
                          onChange={(event) =>
                            updateNestedField(
                              "address",
                              "country",
                              event.target.value,
                            )
                          }
                        />

                        <Input
                          label="Postal Code"
                          value={form.address.postalCode}
                          onChange={(event) =>
                            updateNestedField(
                              "address",
                              "postalCode",
                              event.target.value,
                            )
                          }
                          placeholder="Enter postal/pin code"
                        />

                        <Input
                          label="Latitude"
                          type="number"
                          step="any"
                          value={form.address.latitude}
                          onChange={(event) =>
                            updateNestedField(
                              "address",
                              "latitude",
                              event.target.value,
                            )
                          }
                          placeholder="28.6139"
                        />

                        <Input
                          label="Longitude"
                          type="number"
                          step="any"
                          value={form.address.longitude}
                          onChange={(event) =>
                            updateNestedField(
                              "address",
                              "longitude",
                              event.target.value,
                            )
                          }
                          placeholder="77.2090"
                        />
                      </div>
                    </Section>

                    {/* Review */}
                    <Section
                      icon={Check}
                      title="Review"
                      description="Confirm the main employee information before creating the account."
                    >
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                          [
                            "Employee",
                            [form.firstName, form.lastName]
                              .filter(Boolean)
                              .join(" "),
                          ],
                          ["Employee Code", form.employeeCode || "—"],
                          ["Email", form.email || "—"],
                          [
                            "Role",
                            roles.find((role) => role._id === form.roleId)
                              ?.name || "—",
                          ],
                          [
                            "Department",
                            departments.find(
                              (department) =>
                                department._id === form.departmentId,
                            )?.name || "Unassigned",
                          ],
                          [
                            "Organization Unit",
                            organizationUnits.find(
                              (unit) => unit._id === form.organizationUnitId,
                            )?.name || "Unassigned",
                          ],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                          >
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                              {label}
                            </p>

                            <p className="mt-1 truncate text-xs font-black text-slate-700">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Section>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-4">
                <button
                  type="button"
                  onClick={step === 1 ? closeForm : previousStep}
                  disabled={saving}
                  className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  {step === 1 ? "Cancel" : "Back"}
                </button>

                <div className="flex items-center gap-2">
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={loadingDependencies}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Continue
                      <ChevronDown size={14} className="-rotate-90" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} />
                          Create Employee
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee details modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-blue-50 text-sm font-black text-blue-600">
                  {getInitials(selectedEmployee)}
                </div>

                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    {getEmployeeName(selectedEmployee)}
                  </h2>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {selectedEmployee.employeeCode || "No employee code"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {[
                ["Email", selectedEmployee.email || "—", Mail],
                ["Phone", selectedEmployee.phone || "—", BriefcaseBusiness],
                ["Department", getDepartmentName(selectedEmployee), Building2],
                ["Role", getRoleName(selectedEmployee), Shield],
                ["Work Schedule", getScheduleName(selectedEmployee), Clock3],
                [
                  "Joining Date",
                  selectedEmployee.joiningDate
                    ? new Date(selectedEmployee.joiningDate).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : "—",
                  CalendarDays,
                ],
                [
                  "Designation",
                  selectedEmployee.designation || "—",
                  BriefcaseBusiness,
                ],
                [
                  "Employment Type",
                  selectedEmployee.employmentType?.replaceAll("_", " ") || "—",
                  User,
                ],
              ].map(([label, value, Icon]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-slate-400" />

                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      {label}
                    </p>
                  </div>

                  <p className="mt-2 text-xs font-black text-slate-700">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employee;
