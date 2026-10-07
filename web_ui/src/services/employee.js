import api from "./api";

export const getEmployees = (params = {}) => api.get("/employees", { params });

export const getEmployee = (employeeId) => api.get(`/employees/${employeeId}`);

export const createEmployee = (data) => api.post("/employees", data);

export const getEmployeeHierarchy = () => api.get("/employees/hierarchy");

export const getDirectReports = (employeeId) =>
  api.get(`/employees/${employeeId}/direct-reports`);

export const updateEmployeeReportingManager = (employeeId, reportsTo) =>
  api.patch(`/employees/${employeeId}/reporting-manager`, { reportsTo });
