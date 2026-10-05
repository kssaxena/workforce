import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Edit3,
  Globe2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  getWorkSchedules,
  createWorkSchedule,
  updateWorkSchedule,
  deactivateWorkSchedule,
} from "../../../services/workSchedule";

const DAYS = [
  { dayOfWeek: 0, label: "Sunday", short: "Sun" },
  { dayOfWeek: 1, label: "Monday", short: "Mon" },
  { dayOfWeek: 2, label: "Tuesday", short: "Tue" },
  { dayOfWeek: 3, label: "Wednesday", short: "Wed" },
  { dayOfWeek: 4, label: "Thursday", short: "Thu" },
  { dayOfWeek: 5, label: "Friday", short: "Fri" },
  { dayOfWeek: 6, label: "Saturday", short: "Sat" },
];

const createDefaultDays = () =>
  DAYS.map((day) => ({
    dayOfWeek: day.dayOfWeek,
    isWorkingDay: day.dayOfWeek >= 1 && day.dayOfWeek <= 5,
    startTime: day.dayOfWeek >= 1 && day.dayOfWeek <= 5 ? "09:00" : "00:00",
    endTime: day.dayOfWeek >= 1 && day.dayOfWeek <= 5 ? "18:00" : "00:00",
    breakMinutes: day.dayOfWeek >= 1 && day.dayOfWeek <= 5 ? 60 : 0,
  }));

const initialForm = {
  name: "",
  code: "",
  description: "",
  timezone: "Asia/Kolkata",
  days: createDefaultDays(),
  isDefault: false,
};

const WorkSchedule = () => {
  const [schedules, setSchedules] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // FETCH
  // --------------------------------------------------

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getWorkSchedules({
        includeInactive: true,
      });

      const data = response?.data?.data;

      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch work schedules:", err);

      setError(
        err?.response?.data?.message || "Failed to fetch work schedules.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const filteredSchedules = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return schedules;

    return schedules.filter(
      (schedule) =>
        schedule?.name?.toLowerCase().includes(query) ||
        schedule?.code?.toLowerCase().includes(query) ||
        schedule?.description?.toLowerCase().includes(query) ||
        schedule?.timezone?.toLowerCase().includes(query),
    );
  }, [schedules, search]);

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      ...initialForm,
      days: createDefaultDays(),
    });
    setError("");
    setShowModal(true);
  };

  const handleOpenEdit = (schedule) => {
    const normalizedDays = DAYS.map((day) => {
      const existingDay = schedule?.days?.find(
        (item) => item.dayOfWeek === day.dayOfWeek,
      );

      return {
        dayOfWeek: day.dayOfWeek,
        isWorkingDay: existingDay?.isWorkingDay ?? false,
        startTime: existingDay?.startTime || "00:00",
        endTime: existingDay?.endTime || "00:00",
        breakMinutes: existingDay?.breakMinutes ?? 0,
      };
    });

    setEditingId(schedule._id);

    setForm({
      name: schedule.name || "",
      code: schedule.code || "",
      description: schedule.description || "",
      timezone: schedule.timezone || "Asia/Kolkata",
      days: normalizedDays,
      isDefault: Boolean(schedule.isDefault),
    });

    setError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingId(null);
    setForm({
      ...initialForm,
      days: createDefaultDays(),
    });
    setError("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // DAY UPDATE
  // --------------------------------------------------

  const updateDay = (dayOfWeek, field, value) => {
    setForm((previous) => ({
      ...previous,

      days: previous.days.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              [field]: value,
            }
          : day,
      ),
    }));
  };

  const toggleWorkingDay = (dayOfWeek) => {
    setForm((previous) => ({
      ...previous,

      days: previous.days.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;

        const nextWorkingState = !day.isWorkingDay;

        return {
          ...day,
          isWorkingDay: nextWorkingState,
          startTime: nextWorkingState
            ? day.startTime === "00:00"
              ? "09:00"
              : day.startTime
            : "00:00",
          endTime: nextWorkingState
            ? day.endTime === "00:00"
              ? "18:00"
              : day.endTime
            : "00:00",
          breakMinutes: nextWorkingState ? day.breakMinutes || 60 : 0,
        };
      }),
    }));
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Work schedule name is required.");
      return;
    }

    if (!form.code.trim()) {
      setError("Work schedule code is required.");
      return;
    }

    if (!form.timezone.trim()) {
      setError("Timezone is required.");
      return;
    }

    if (!Array.isArray(form.days) || form.days.length !== 7) {
      setError("A work schedule must contain all 7 days.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description?.trim() || "",
      timezone: form.timezone.trim(),

      days: DAYS.map((day) => {
        const currentDay = form.days.find(
          (item) => item.dayOfWeek === day.dayOfWeek,
        );

        const isWorkingDay = Boolean(currentDay?.isWorkingDay);

        return {
          dayOfWeek: day.dayOfWeek,
          isWorkingDay,

          // Backend accepts HH:mm strings.
          // For non-working days we intentionally send 00:00.
          startTime: isWorkingDay ? currentDay?.startTime || "09:00" : "00:00",

          endTime: isWorkingDay ? currentDay?.endTime || "18:00" : "00:00",

          breakMinutes: isWorkingDay
            ? Number(currentDay?.breakMinutes) || 0
            : 0,
        };
      }),

      isDefault: Boolean(form.isDefault),
    };

    try {
      setSubmitting(true);

      if (editingId) {
        await updateWorkSchedule(editingId, payload);
      } else {
        await createWorkSchedule(payload);
      }

      await fetchSchedules();

      handleCloseModal();
    } catch (err) {
      console.error("Failed to save work schedule:", err);

      setError(err?.response?.data?.message || "Failed to save work schedule.");
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // DEACTIVATE
  // --------------------------------------------------

  const handleDeactivate = async (schedule) => {
    if (schedule.isDefault) {
      setError(
        "The default work schedule cannot be deactivated. Assign another schedule as default first.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${schedule.name}"?`,
    );

    if (!confirmed) return;

    try {
      setError("");

      await deactivateWorkSchedule(schedule._id);

      await fetchSchedules();
    } catch (err) {
      console.error("Failed to deactivate work schedule:", err);

      setError(
        err?.response?.data?.message || "Failed to deactivate work schedule.",
      );
    }
  };

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------

  const totalSchedules = schedules.length;

  const activeSchedules = schedules.filter(
    (schedule) => schedule.isActive,
  ).length;

  const inactiveSchedules = schedules.filter(
    (schedule) => !schedule.isActive,
  ).length;

  const defaultSchedule = schedules.find((schedule) => schedule.isDefault);

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const getWorkingDays = (schedule) =>
    schedule?.days?.filter((day) => day.isWorkingDay).length || 0;

  const calculateDailyHours = (day) => {
    if (!day?.isWorkingDay) return 0;

    if (!day.startTime || !day.endTime) return 0;

    const [startHour, startMinute] = day.startTime.split(":").map(Number);

    const [endHour, endMinute] = day.endTime.split(":").map(Number);

    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    const totalMinutes = end - start - Number(day.breakMinutes || 0);

    if (totalMinutes <= 0) return 0;

    return totalMinutes / 60;
  };

  const calculateWeeklyHours = (schedule) =>
    (schedule?.days || []).reduce(
      (total, day) => total + calculateDailyHours(day),
      0,
    );

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Clock3 size={20} />
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900">
                Work Schedules
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Configure weekly working hours, breaks and attendance schedules.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          <Plus size={17} />
          Add Work Schedule
        </button>
      </div>

      {/* ERROR */}
      {error && !showModal && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex-1">{error}</div>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 text-red-500 hover:text-red-700"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={CalendarDays}
          label="Total Schedules"
          value={totalSchedules}
          description="Configured schedules"
        />

        <SummaryCard
          icon={Check}
          label="Active"
          value={activeSchedules}
          description="Currently available"
        />

        <SummaryCard
          icon={Trash2}
          label="Inactive"
          value={inactiveSchedules}
          description="Deactivated schedules"
        />

        <SummaryCard
          icon={Clock3}
          label="Default"
          value={defaultSchedule ? defaultSchedule.code : "—"}
          description={
            defaultSchedule ? defaultSchedule.name : "No default schedule"
          }
        />
      </div>

      {/* SEARCH */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search schedules by name, code or timezone..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Clock3 size={24} />
          </div>

          <h3 className="mt-4 text-lg font-black text-slate-900">
            No work schedules found
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {search
              ? "Try changing your search."
              : "Create your first work schedule to define your company's working hours."}
          </p>

          {!search && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"
            >
              <Plus size={16} />
              Create Schedule
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredSchedules.map((schedule) => (
            <ScheduleCard
              key={schedule._id}
              schedule={schedule}
              workingDays={getWorkingDays(schedule)}
              weeklyHours={calculateWeeklyHours(schedule)}
              onEdit={handleOpenEdit}
              onDeactivate={handleDeactivate}
            />
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Clock3 size={18} />
                  </div>

                  <h2 className="text-xl font-black text-slate-900">
                    {editingId ? "Edit Work Schedule" : "Create Work Schedule"}
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Define the company's weekly attendance schedule.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={submitting}
                className="grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {error && (
                  <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* BASIC INFORMATION */}
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField label="Schedule Name" required>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Standard Office Hours"
                      maxLength={100}
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Schedule Code" required>
                    <input
                      type="text"
                      name="code"
                      value={form.code}
                      onChange={handleInputChange}
                      placeholder="e.g. OFFICE-9-6"
                      maxLength={50}
                      className={`${inputClass} uppercase`}
                    />
                  </FormField>

                  <FormField label="Timezone" required>
                    <div className="relative">
                      <Globe2
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        name="timezone"
                        value={form.timezone}
                        onChange={handleInputChange}
                        placeholder="Asia/Kolkata"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </FormField>

                  <div className="flex items-end">
                    <label className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          Default Schedule
                        </div>

                        <div className="mt-0.5 text-xs text-slate-500">
                          Used automatically when no schedule is selected.
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={form.isDefault}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            isDefault: event.target.checked,
                          }))
                        }
                        className="size-5 accent-blue-600"
                      />
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <FormField label="Description">
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleInputChange}
                        placeholder="Describe when this schedule should be used..."
                        rows={3}
                        maxLength={500}
                        className={`${inputClass} resize-none`}
                      />
                    </FormField>
                  </div>
                </div>

                {/* WEEKLY SCHEDULE */}
                <div className="mt-8">
                  <div className="mb-4">
                    <h3 className="text-lg font-black text-slate-900">
                      Weekly Schedule
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Configure working hours and break duration for each day.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {DAYS.map((day) => {
                      const currentDay = form.days.find(
                        (item) => item.dayOfWeek === day.dayOfWeek,
                      );

                      if (!currentDay) return null;

                      return (
                        <div
                          key={day.dayOfWeek}
                          className={`rounded-2xl border p-4 transition ${
                            currentDay.isWorkingDay
                              ? "border-slate-200 bg-white"
                              : "border-slate-100 bg-slate-50"
                          }`}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                            {/* DAY */}
                            <div className="flex min-w-[180px] items-center gap-3">
                              <button
                                type="button"
                                onClick={() => toggleWorkingDay(day.dayOfWeek)}
                                className={`relative h-6 w-11 rounded-full transition ${
                                  currentDay.isWorkingDay
                                    ? "bg-blue-600"
                                    : "bg-slate-300"
                                }`}
                              >
                                <span
                                  className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition ${
                                    currentDay.isWorkingDay
                                      ? "left-6"
                                      : "left-1"
                                  }`}
                                />
                              </button>

                              <div>
                                <div className="text-sm font-black text-slate-800">
                                  {day.label}
                                </div>

                                <div className="text-xs text-slate-400">
                                  {currentDay.isWorkingDay
                                    ? "Working day"
                                    : "Non-working day"}
                                </div>
                              </div>
                            </div>

                            {currentDay.isWorkingDay ? (
                              <>
                                {/* START */}
                                <div className="flex-1">
                                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                    Start
                                  </label>

                                  <input
                                    type="time"
                                    value={currentDay.startTime}
                                    onChange={(event) =>
                                      updateDay(
                                        day.dayOfWeek,
                                        "startTime",
                                        event.target.value,
                                      )
                                    }
                                    className={inputClass}
                                  />
                                </div>

                                {/* END */}
                                <div className="flex-1">
                                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                    End
                                  </label>

                                  <input
                                    type="time"
                                    value={currentDay.endTime}
                                    onChange={(event) =>
                                      updateDay(
                                        day.dayOfWeek,
                                        "endTime",
                                        event.target.value,
                                      )
                                    }
                                    className={inputClass}
                                  />
                                </div>

                                {/* BREAK */}
                                <div className="flex-1">
                                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                    Break (minutes)
                                  </label>

                                  <input
                                    type="number"
                                    min="0"
                                    value={currentDay.breakMinutes}
                                    onChange={(event) =>
                                      updateDay(
                                        day.dayOfWeek,
                                        "breakMinutes",
                                        event.target.value,
                                      )
                                    }
                                    className={inputClass}
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-1 items-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-400">
                                No working hours configured
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      {editingId ? "Save Changes" : "Create Schedule"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ======================================================
// SUMMARY CARD
// ======================================================

const SummaryCard = ({ icon: Icon, label, value, description }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={19} />
        </div>
      </div>

      <div className="mt-4 text-2xl font-black text-slate-900">{value}</div>

      <div className="mt-1 text-sm font-bold text-slate-700">{label}</div>

      <div className="mt-1 text-xs text-slate-400">{description}</div>
    </div>
  );
};

// ======================================================
// SCHEDULE CARD
// ======================================================

const ScheduleCard = ({
  schedule,
  workingDays,
  weeklyHours,
  onEdit,
  onDeactivate,
}) => {
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
        schedule.isActive ? "border-slate-200" : "border-slate-200 opacity-70"
      }`}
    >
      {/* CARD HEADER */}
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-black text-slate-900">
                {schedule.name}
              </h3>

              {schedule.isDefault && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-600">
                  Default
                </span>
              )}

              {!schedule.isActive && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                  Inactive
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-bold text-slate-500">{schedule.code}</span>

              <span>•</span>

              <span className="flex items-center gap-1">
                <Globe2 size={12} />
                {schedule.timezone || "Asia/Kolkata"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(schedule)}
              className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              title="Edit schedule"
            >
              <Edit3 size={16} />
            </button>

            <button
              type="button"
              onClick={() => onDeactivate(schedule)}
              disabled={!schedule.isActive || schedule.isDefault}
              className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
              title={
                schedule.isDefault
                  ? "Default schedule cannot be deactivated"
                  : "Deactivate schedule"
              }
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {schedule.description && (
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
            {schedule.description}
          </p>
        )}
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
        <div className="p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Working Days
          </div>

          <div className="mt-1 text-xl font-black text-slate-900">
            {workingDays}
            <span className="ml-1 text-xs font-bold text-slate-400">/ 7</span>
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Weekly Hours
          </div>

          <div className="mt-1 text-xl font-black text-slate-900">
            {weeklyHours.toFixed(1)}
            <span className="ml-1 text-xs font-bold text-slate-400">hrs</span>
          </div>
        </div>
      </div>

      {/* WEEK */}
      <div className="p-5">
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day) => {
            const scheduleDay = schedule.days?.find(
              (item) => item.dayOfWeek === day.dayOfWeek,
            );

            const working = scheduleDay?.isWorkingDay;

            return (
              <div
                key={day.dayOfWeek}
                className={`rounded-xl p-2 text-center ${
                  working ? "bg-blue-50" : "bg-slate-50"
                }`}
              >
                <div
                  className={`text-[10px] font-black uppercase ${
                    working ? "text-blue-600" : "text-slate-400"
                  }`}
                >
                  {day.short}
                </div>

                <div className="mt-2">
                  {working ? (
                    <>
                      <div className="text-[10px] font-bold text-slate-700">
                        {scheduleDay.startTime}
                      </div>

                      <div className="my-0.5 text-[9px] text-slate-300">↓</div>

                      <div className="text-[10px] font-bold text-slate-700">
                        {scheduleDay.endTime}
                      </div>
                    </>
                  ) : (
                    <div className="py-2 text-[9px] font-bold text-slate-400">
                      OFF
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ======================================================
// FORM FIELD
// ======================================================

const FormField = ({ label, required, children }) => {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}
    </div>
  );
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50";

export default WorkSchedule;
