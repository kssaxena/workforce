import api from "./api";

export const checkIn = (data) => api.post("/attendance/check-in", data);

export const checkOut = (data) => api.post("/attendance/check-out", data);

export const getMyAttendance = (params = {}) =>
  api.get("/attendance/my", { params });
