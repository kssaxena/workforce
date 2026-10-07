import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiCheck,
  FiMapPin,
  FiRefreshCw,
  FiSave,
  FiShield,
  FiTarget,
} from "react-icons/fi";

import {
  getAttendanceSettings,
  updateAttendanceSettings,
} from "../../../services/company";

const AttendanceSettings = () => {
  const [settings, setSettings] = useState({
    attendanceEnabled: true,
    gpsAttendanceEnabled: false,
    attendanceRadius: 200,
    attendanceLocation: {
      latitude: "",
      longitude: "",
    },
    timezone: "Asia/Kolkata",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await getAttendanceSettings();

      const data = response?.data?.data;

      if (!data) {
        throw new Error("Attendance settings could not be loaded");
      }

      setSettings({
        attendanceEnabled: data.attendanceEnabled ?? true,
        gpsAttendanceEnabled: data.gpsAttendanceEnabled ?? false,
        attendanceRadius: data.attendanceRadius ?? 200,
        attendanceLocation: {
          latitude: data.attendanceLocation?.latitude ?? "",
          longitude: data.attendanceLocation?.longitude ?? "",
        },
        timezone: data.timezone || "Asia/Kolkata",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load attendance settings",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateField = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateLocation = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      attendanceLocation: {
        ...prev.attendanceLocation,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        attendanceEnabled: settings.attendanceEnabled,
        gpsAttendanceEnabled: settings.gpsAttendanceEnabled,
        attendanceRadius: Number(settings.attendanceRadius),
        attendanceLocation:
          settings.gpsAttendanceEnabled &&
          settings.attendanceLocation.latitude !== "" &&
          settings.attendanceLocation.longitude !== ""
            ? {
                latitude: Number(settings.attendanceLocation.latitude),
                longitude: Number(settings.attendanceLocation.longitude),
              }
            : null,
      };

      const response = await updateAttendanceSettings(payload);

      const data = response?.data?.data;

      if (data) {
        setSettings((prev) => ({
          ...prev,
          attendanceEnabled: data.attendanceEnabled ?? prev.attendanceEnabled,
          gpsAttendanceEnabled:
            data.gpsAttendanceEnabled ?? prev.gpsAttendanceEnabled,
          attendanceRadius: data.attendanceRadius ?? prev.attendanceRadius,
          attendanceLocation: {
            latitude: data.attendanceLocation?.latitude ?? "",
            longitude: data.attendanceLocation?.longitude ?? "",
          },
          timezone: data.timezone || prev.timezone,
        }));
      }

      setSuccess("Attendance settings saved successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save attendance settings",
      );
    } finally {
      setSaving(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSettings((prev) => ({
          ...prev,
          attendanceLocation: {
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          },
        }));

        setSuccess("Current location captured.");
      },
      (locationError) => {
        setError(
          locationError?.message || "Unable to retrieve your current location.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-64 rounded-lg bg-slate-200 animate-pulse" />
        <div className="h-4 w-96 max-w-full rounded bg-slate-200 animate-pulse" />

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="space-y-5">
            <div className="h-14 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-14 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Attendance Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Configure how employees check in and out of the workplace.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          disabled={loading || saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiRefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          <FiCheck />
          {success}
        </motion.div>
      )}

      {/* Main Settings */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* General */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FiShield size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Attendance Control
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Control whether attendance tracking is available to employees.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Attendance enabled */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Enable attendance
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Employees can check in and check out when this is enabled.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateField("attendanceEnabled", !settings.attendanceEnabled)
                }
                className={`relative h-7 w-12 rounded-full transition ${
                  settings.attendanceEnabled ? "bg-slate-900" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    settings.attendanceEnabled ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* GPS */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  GPS verification
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Restrict attendance to employees physically near the office.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateField(
                    "gpsAttendanceEnabled",
                    !settings.gpsAttendanceEnabled,
                  )
                }
                className={`relative h-7 w-12 rounded-full transition ${
                  settings.gpsAttendanceEnabled
                    ? "bg-slate-900"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    settings.gpsAttendanceEnabled ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <FiTarget size={19} />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Attendance status
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {settings.attendanceEnabled ? "Active" : "Disabled"}
          </p>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">GPS</span>

              <span className="font-medium text-slate-900">
                {settings.gpsAttendanceEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Timezone</span>

              <span className="font-medium text-slate-900">
                {settings.timezone}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GPS configuration */}
      {settings.gpsAttendanceEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FiMapPin size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Workplace Location
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Employees must be within this radius when GPS verification is
                enabled.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Latitude */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Latitude
              </label>

              <input
                type="number"
                step="any"
                value={settings.attendanceLocation.latitude}
                onChange={(e) => updateLocation("latitude", e.target.value)}
                placeholder="28.613900"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Longitude
              </label>

              <input
                type="number"
                step="any"
                value={settings.attendanceLocation.longitude}
                onChange={(e) => updateLocation("longitude", e.target.value)}
                placeholder="77.209000"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Radius */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Allowed radius (meters)
              </label>

              <input
                type="number"
                min="50"
                max="5000"
                step="10"
                value={settings.attendanceRadius}
                onChange={(e) =>
                  updateField("attendanceRadius", e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />

              <p className="mt-1 text-xs text-slate-400">
                Minimum 50m · Maximum 5000m
              </p>
            </div>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={useCurrentLocation}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <FiMapPin size={16} />
              Use current location
            </button>
          </div>
        </motion.div>
      )}

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <FiRefreshCw className="animate-spin" size={16} />
              Saving...
            </>
          ) : (
            <>
              <FiSave size={16} />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AttendanceSettings;
