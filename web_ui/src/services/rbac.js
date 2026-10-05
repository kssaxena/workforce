import api from "./api";

export const getRoles = (params = {}) => api.get("/rbac/roles", { params });
