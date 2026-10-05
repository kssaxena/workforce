import api from "./api";

export const getWorkSchedules = (params = {}) =>
  api.get("/work-schedules", { params });

export const getWorkSchedule = (scheduleId) =>
  api.get(`/work-schedules/${scheduleId}`);

export const createWorkSchedule = (data) => api.post("/work-schedules", data);

export const updateWorkSchedule = (scheduleId, data) =>
  api.patch(`/work-schedules/${scheduleId}`, data);

export const deactivateWorkSchedule = (scheduleId) =>
  api.delete(`/work-schedules/${scheduleId}`);
