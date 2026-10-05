import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  getOrganizationUnits,
  createOrganizationUnit,
  updateOrganizationUnit,
  deactivateOrganizationUnit,
} from "../../../services/organization";

const initialForm = {
  name: "",
  code: "",
  description: "",
  parentUnitId: "",
  level: 0,
};

const OrganizationUnit = () => {
  const [organizationUnits, setOrganizationUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState("");

  /* =========================================================
     FETCH ORGANIZATION UNITS
  ========================================================= */

  const fetchOrganizationUnits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOrganizationUnits({
        includeInactive: true,
      });

      const data = response?.data?.data;

      setOrganizationUnits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch organization units:", err);

      setError(
        err?.response?.data?.message || "Failed to fetch organization units.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizationUnits();
  }, []);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredOrganizationUnits = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return organizationUnits;
    }

    return organizationUnits.filter((unit) => {
      return (
        unit?.name?.toLowerCase().includes(query) ||
        unit?.code?.toLowerCase().includes(query) ||
        unit?.description?.toLowerCase().includes(query)
      );
    });
  }, [organizationUnits, search]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const getParentUnit = (parentUnitId) => {
    if (!parentUnitId) return null;

    return organizationUnits.find((unit) => unit._id === parentUnitId);
  };

  /* =========================================================
     OPEN CREATE MODAL
  ========================================================= */

  const handleOpenCreate = () => {
    setEditingId(null);

    setForm({
      ...initialForm,
    });

    setError("");
    setShowModal(true);
  };

  /* =========================================================
     OPEN EDIT MODAL
  ========================================================= */

  const handleOpenEdit = (unit) => {
    setEditingId(unit._id);

    setForm({
      name: unit.name || "",
      code: unit.code || "",
      description: unit.description || "",
      parentUnitId: unit.parentUnitId || "",
      level: unit.level ?? 0,
    });

    setError("");
    setShowModal(true);
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const handleCloseModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingId(null);
    setForm(initialForm);
    setError("");
  };

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Organization unit name is required.");
      return;
    }

    if (!form.code.trim()) {
      setError("Organization unit code is required.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description?.trim() || "",
        parentUnitId: form.parentUnitId || null,
        level: Number(form.level) || 0,
      };

      if (editingId) {
        await updateOrganizationUnit(editingId, payload);
      } else {
        await createOrganizationUnit(payload);
      }

      await fetchOrganizationUnits();

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save organization unit:", err);

      setError(
        err?.response?.data?.message || "Failed to save organization unit.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     DEACTIVATE
  ========================================================= */

  const handleDeactivate = async (unit) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${unit.name}"?`,
    );

    if (!confirmed) return;

    try {
      setError("");

      await deactivateOrganizationUnit(unit._id);

      await fetchOrganizationUnits();
    } catch (err) {
      console.error("Failed to deactivate organization unit:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to deactivate organization unit.",
      );
    }
  };

  /* =========================================================
     SUMMARY
  ========================================================= */

  const totalUnits = organizationUnits.length;

  const activeUnits = organizationUnits.filter((unit) => unit.isActive).length;

  const inactiveUnits = organizationUnits.filter(
    (unit) => !unit.isActive,
  ).length;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Organization Units
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your organization's operational hierarchy.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <Plus size={18} />
          Add Organization Unit
        </button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && !showModal && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button type="button" onClick={() => setError("")} className="ml-4">
            <X size={18} />
          </button>
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Units</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {totalUnits}
              </p>
            </div>

            <div className="rounded-xl bg-gray-100 p-3">
              <Building2 size={20} className="text-gray-700" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Units</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {activeUnits}
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-3">
              <Building2 size={20} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inactive Units</p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {inactiveUnits}
              </p>
            </div>

            <div className="rounded-xl bg-gray-100 p-3">
              <Building2 size={20} className="text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Search */}
        <div className="border-b border-gray-100 p-4">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organization units..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Organization Unit
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Code
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Parent Unit
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Level
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    Loading organization units...
                  </td>
                </tr>
              ) : filteredOrganizationUnits.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-3 rounded-full bg-gray-100 p-4">
                        <Building2 size={24} className="text-gray-400" />
                      </div>

                      <p className="font-medium text-gray-900">
                        No organization units found
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {search
                          ? "Try changing your search."
                          : "Create your first organization unit."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrganizationUnits.map((unit) => {
                  const parent = getParentUnit(unit.parentUnitId);

                  return (
                    <tr
                      key={unit._id}
                      className="border-b border-gray-50 transition hover:bg-gray-50"
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                            <Building2 size={18} className="text-gray-600" />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {unit.name}
                            </p>

                            {unit.description && (
                              <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                                {unit.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                          {unit.code}
                        </span>
                      </td>

                      {/* Parent */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {parent ? (
                          <div>
                            <p className="font-medium text-gray-800">
                              {parent.name}
                            </p>

                            <p className="text-xs text-gray-400">
                              {parent.code}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">Root Unit</span>
                        )}
                      </td>

                      {/* Level */}
                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                          Level {unit.level ?? 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            unit.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {unit.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(unit)}
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                            title="Edit"
                          >
                            <Edit3 size={17} />
                          </button>

                          {unit.isActive && (
                            <button
                              type="button"
                              onClick={() => handleDeactivate(unit)}
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                              title="Deactivate"
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingId
                    ? "Edit Organization Unit"
                    : "Add Organization Unit"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingId
                    ? "Update the organization unit details."
                    : "Create a new organization unit."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
                {error && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Unit Name
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Delhi Regional Office"
                      required
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                    />
                  </div>

                  {/* Code */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Unit Code
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      placeholder="e.g. DEL-RO"
                      required
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-gray-900"
                    />
                  </div>

                  {/* Parent Unit */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Parent Unit
                    </label>

                    <div className="relative">
                      <select
                        name="parentUnitId"
                        value={form.parentUnitId}
                        onChange={handleChange}
                        className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-gray-900"
                      >
                        <option value="">No Parent — Root Unit</option>

                        {organizationUnits
                          .filter(
                            (unit) => unit._id !== editingId && unit.isActive,
                          )
                          .map((unit) => (
                            <option key={unit._id} value={unit._id}>
                              {unit.name} ({unit.code})
                            </option>
                          ))}
                      </select>

                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Level */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Hierarchy Level
                    </label>

                    <input
                      type="number"
                      name="level"
                      min="0"
                      step="1"
                      value={form.level}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                    />

                    <p className="mt-1.5 text-xs text-gray-400">
                      0 = top-level unit, 1 = child, 2 = deeper level, etc.
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe this organization unit..."
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                  />

                  <p className="mt-1.5 text-xs text-gray-400">
                    Maximum 500 characters.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingId
                      ? "Update Unit"
                      : "Create Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationUnit;
