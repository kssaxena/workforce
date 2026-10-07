import api from "./api";

export const getAttendanceSettings = () =>
  api.get("/companies/settings/attendance");

export const updateAttendanceSettings = (data) =>
  api.patch("/companies/settings/attendance", data);
