import api from "./api";

export const generatePayrollRun = (data) =>
  api.post("/payroll/runs/generate", data);

export const getPayrollRuns = (params = {}) =>
  api.get("/payroll/runs", { params });

export const getPayrollRun = (runId) => api.get(`/payroll/runs/${runId}`);
