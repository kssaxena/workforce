import api from "./api";

export const getAuditLogs = (params = {}) => api.get("/audit", { params });

export const getAuditLog = (auditLogId) => api.get(`/audit/${auditLogId}`);
