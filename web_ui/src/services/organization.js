import api from "./api";

// Departments
export const getDepartments = (params = {}) =>
  api.get("/departments", { params });

export const getDepartment = (departmentId) =>
  api.get(`/departments/${departmentId}`);

export const createDepartment = (data) => api.post("/departments", data);

export const updateDepartment = (departmentId, data) =>
  api.patch(`/departments/${departmentId}`, data);

export const deactivateDepartment = (departmentId) =>
  api.delete(`/departments/${departmentId}`);

// Organization Units
export const getOrganizationUnits = (params = {}) =>
  api.get("/organization-units", { params });

export const getOrganizationUnit = (organizationUnitId) =>
  api.get(`/organization-units/${organizationUnitId}`);

export const createOrganizationUnit = (data) =>
  api.post("/organization-units", data);

export const updateOrganizationUnit = (organizationUnitId, data) =>
  api.patch(`/organization-units/${organizationUnitId}`, data);

export const deactivateOrganizationUnit = (organizationUnitId) =>
  api.delete(`/organization-units/${organizationUnitId}`);
