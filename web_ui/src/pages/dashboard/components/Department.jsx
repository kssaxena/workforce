import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Building2,
  MoreHorizontal,
  Pencil,
  Power,
  X,
  Loader2,
  ChevronRight,
} from "lucide-react";

import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deactivateDepartment,
} from "../../../services/organization";

const emptyForm = {
  name: "",
  code: "",
  description: "",
  parentDepartmentId: "",
};

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState(null);

  const [error, setError] = useState("");

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDepartments({
        includeInactive: true,
      });

      setDepartments(response.data?.data || []);
    } catch (error) {
      console.error("Departments loading error:", error);

      setError(error.response?.data?.message || "Unable to load departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const filteredDepartments = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return departments;
    }

    return departments.filter((department) => {
      return (
        department.name?.toLowerCase().includes(value) ||
        department.code?.toLowerCase().includes(value) ||
        department.description?.toLowerCase().includes(value)
      );
    });
  }, [departments, search]);

  const openCreateModal = () => {
    setEditingDepartment(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (department) => {
    setEditingDepartment(department);

    setForm({
      name: department.name || "",
      code: department.code || "",
      description: department.description || "",
      parentDepartmentId:
        department.parentDepartmentId?._id ||
        department.parentDepartmentId ||
        "",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingDepartment(null);
    setForm(emptyForm);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        parentDepartmentId: form.parentDepartmentId || null,
      };

      if (editingDepartment) {
        await updateDepartment(editingDepartment._id, payload);
      } else {
        await createDepartment(payload);
      }

      await loadDepartments();

      closeModal();
    } catch (error) {
      console.error("Department save error:", error);

      setError(error.response?.data?.message || "Unable to save department.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (department) => {
    const confirmed = window.confirm(`Deactivate "${department.name}"?`);

    if (!confirmed) return;

    try {
      setDeactivatingId(department._id);
      setError("");

      await deactivateDepartment(department._id);

      await loadDepartments();
    } catch (error) {
      console.error("Department deactivation error:", error);

      setError(
        error.response?.data?.message || "Unable to deactivate department.",
      );
    } finally {
      setDeactivatingId(null);
    }
  };

  const activeCount = departments.filter(
    (department) => department.isActive,
  ).length;

  const inactiveCount = departments.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900">Departments</h2>

          <p className="mt-1 text-xs text-slate-400">
            Build and manage your company's organizational structure.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Department
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total Departments
              </p>

              <p className="mt-2 text-2xl font-black text-slate-900">
                {departments.length}
              </p>
            </div>

            <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Building2 size={19} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Active
          </p>

          <p className="mt-2 text-2xl font-black text-emerald-600">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Inactive
          </p>

          <p className="mt-2 text-2xl font-black text-slate-400">
            {inactiveCount}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && !showModal && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search departments..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
          />
        </div>
      </div>

      {/* Department table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Department
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Code
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Parent Department
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Manager
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Status
                </th>

                <th className="w-16 px-4" />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                      <Loader2 size={15} className="animate-spin" />
                      Loading departments...
                    </div>
                  </td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16">
                    <div className="flex flex-col items-center text-center">
                      <div className="grid size-12 place-items-center rounded-2xl bg-slate-50 text-slate-400">
                        <Building2 size={21} />
                      </div>

                      <p className="mt-4 text-sm font-black text-slate-700">
                        No departments found
                      </p>

                      <p className="mt-1 max-w-sm text-xs text-slate-400">
                        Create your first department to start building your
                        organization.
                      </p>

                      <button
                        type="button"
                        onClick={openCreateModal}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white"
                      >
                        <Plus size={14} />
                        Add Department
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((department) => (
                  <tr
                    key={department._id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                          <Building2 size={16} />
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {department.name}
                          </p>

                          {department.description && (
                            <p className="mt-0.5 max-w-[280px] truncate text-[10px] text-slate-400">
                              {department.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-black tracking-wide text-slate-600">
                        {department.code}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                      {department.parentDepartmentId?.name ? (
                        <span className="inline-flex items-center gap-1">
                          {department.parentDepartmentId.name}
                          <ChevronRight size={12} />
                        </span>
                      ) : (
                        "Root Department"
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                      {department.managerId
                        ? [
                            department.managerId.firstName,
                            department.managerId.lastName,
                          ]
                            .filter(Boolean)
                            .join(" ") ||
                          department.managerId.employeeCode ||
                          "Assigned"
                        : "Not assigned"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          department.isActive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {department.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    <td className="px-4">
                      <div className="relative flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(department)}
                          className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>

                        {department.isActive && (
                          <button
                            type="button"
                            disabled={deactivatingId === department._id}
                            onClick={() => handleDeactivate(department)}
                            className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            title="Deactivate"
                          >
                            {deactivatingId === department._id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Power size={15} />
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <MoreHorizontal size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-[10px] font-medium text-slate-400">
            Showing {filteredDepartments.length} of {departments.length}{" "}
            departments
          </p>
        </div>
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingDepartment ? "Edit Department" : "Add Department"}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {editingDepartment
                    ? "Update department information."
                    : "Create a department for your organization."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-6">
                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
                    {error}
                  </div>
                )}

                {/* Name + Code */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Department Name
                    </label>

                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Technology"
                      required
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Department Code
                    </label>

                    <input
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      placeholder="e.g. TECH"
                      required
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold uppercase outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Parent */}
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Parent Department
                  </label>

                  <select
                    name="parentDepartmentId"
                    value={form.parentDepartmentId}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 outline-none focus:border-blue-400 focus:bg-white"
                  >
                    <option value="">No Parent — Root Department</option>

                    {departments
                      .filter(
                        (department) =>
                          department.isActive &&
                          department._id !== editingDepartment?._id,
                      )
                      .map((department) => (
                        <option key={department._id} value={department._id}>
                          {department.name} ({department.code})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe the department..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-medium outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}

                  {editingDepartment ? "Save Changes" : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Department;
