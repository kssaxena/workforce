import api from "./api";

export const getEmployees = (params = {}) => api.get("/employees", { params });

export const getEmployee = (employeeId) => api.get(`/employees/${employeeId}`);

export const createEmployee = (data) => api.post("/employees", data);
