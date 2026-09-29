import { api } from "./api";

export const getMyAttendance = async ({ startDate, endDate } = {}) => {
  const params = new URLSearchParams();

  if (startDate) {
    params.set("startDate", startDate);
  }

  if (endDate) {
    params.set("endDate", endDate);
  }

  const query = params.toString();

  return api.get(`/attendance/my${query ? `?${query}` : ""}`);
};

export const checkIn = async ({ latitude, longitude, accuracy }) => {
  return api.post("/attendance/check-in", {
    latitude,
    longitude,
    accuracy,
    source: "WEB",
  });
};

export const checkOut = async ({ latitude, longitude, accuracy }) => {
  return api.post("/attendance/check-out", {
    latitude,
    longitude,
    accuracy,
    source: "WEB",
  });
};
