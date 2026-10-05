import api from "./api";

export const login = (data) => api.post("/auth/login", data);

export const getMe = () => api.get("/auth/me");

export const refreshSession = () => api.post("/auth/refresh");

export const logout = () => api.post("/auth/logout");

export const registerCompany = (data) => api.post("/companies/register", data);
