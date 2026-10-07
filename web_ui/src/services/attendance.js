import api from "./api";

export const checkIn = (data) => api.post("/attendance/check-in", data);

export const checkOut = (data) => api.post("/attendance/check-out", data);

export const getMyAttendance = (params = {}) =>
  api.get("/attendance/my", {
    params,
  });

export const getAttendanceDashboard = (params = {}) =>
  api.get("/attendance/admin", {
    params,
  });

export const getAttendanceDetail = (employeeId, params = {}) =>
  api.get(`/attendance/admin/${employeeId}`, {
    params,
  });

export const createAttendanceRegularization = (data) =>
  api.post("/attendance/regularization", data);

export const getMyAttendanceRegularizations = (params = {}) =>
  api.get("/attendance/regularization/my", { params });

export const getAttendanceRegularizations = (params = {}) =>
  api.get("/attendance/regularization/admin", { params });

export const reviewAttendanceRegularization = (requestId, data) =>
  api.patch(`/attendance/regularization/${requestId}/review`, data);
