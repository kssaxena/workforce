import api from "./api";

export const checkIn = (data) => api.post("/attendance/check-in", data);

export const checkOut = (data) => api.post("/attendance/check-out", data);

export const getMyAttendance = (params = {}) =>
  api.get("/attendance/my", { params });

export const getAttendanceSummary = (params = {}) =>
  api.get("/attendance/summary", { params });

export const getCompanyAttendance = (params = {}) =>
  api.get("/attendance/company", { params });
