import mongoose from "mongoose";

import Department from "../models/department.model.js";

export const createDepartment = async ({ companyId, userId, data }) => {
  const { name, code, description, parentDepartmentId } = data;

  // Prevent department from becoming its own parent
  if (
    parentDepartmentId &&
    parentDepartmentId.toString() === companyId.toString()
  ) {
    throw new Error("Invalid parent department");
  }

  // Verify parent belongs to the same company
  if (parentDepartmentId) {
    const parentDepartment = await Department.findOne({
      _id: parentDepartmentId,
      companyId,
      isActive: true,
    });

    if (!parentDepartment) {
      throw new Error("Parent department not found");
    }
  }

  const existingDepartment = await Department.findOne({
    companyId,
    code: code.toUpperCase(),
  });

  if (existingDepartment) {
    throw new Error("Department code already exists");
  }

  return Department.create({
    companyId,
    name,
    code: code.toUpperCase(),
    description,
    parentDepartmentId: parentDepartmentId || null,
    createdBy: userId,
    updatedBy: userId,
  });
};

export const getDepartments = async ({
  companyId,
  includeInactive = false,
}) => {
  const filter = {
    companyId,
  };

  if (!includeInactive) {
    filter.isActive = true;
  }

  return Department.find(filter)
    .populate("parentDepartmentId", "name code")
    .populate("managerId", "employeeCode firstName lastName designation")
    .sort({
      name: 1,
    });
};

export const getDepartmentById = async ({ companyId, departmentId }) => {
  if (!mongoose.Types.ObjectId.isValid(departmentId)) {
    throw new Error("Invalid department ID");
  }

  const department = await Department.findOne({
    _id: departmentId,
    companyId,
  })
    .populate("parentDepartmentId", "name code")
    .populate("managerId", "employeeCode firstName lastName designation");

  if (!department) {
    throw new Error("Department not found");
  }

  return department;
};

export const updateDepartment = async ({
  companyId,
  departmentId,
  userId,
  data,
}) => {
  if (!mongoose.Types.ObjectId.isValid(departmentId)) {
    throw new Error("Invalid department ID");
  }

  const department = await Department.findOne({
    _id: departmentId,
    companyId,
  });

  if (!department) {
    throw new Error("Department not found");
  }

  // Prevent department from being its own parent
  if (
    data.parentDepartmentId &&
    data.parentDepartmentId.toString() === departmentId.toString()
  ) {
    throw new Error("A department cannot be its own parent");
  }

  if (data.parentDepartmentId) {
    const parentDepartment = await Department.findOne({
      _id: data.parentDepartmentId,
      companyId,
      isActive: true,
    });

    if (!parentDepartment) {
      throw new Error("Parent department not found");
    }

    // // Prevent direct circular hierarchy
    // if (
    //   parentDepartment.parentDepartmentId?.toString() ===
    //   departmentId.toString()
    // ) {
    //   throw new Error("Invalid department hierarchy");
    // }
  }

  if (data.code) {
    const existingDepartment = await Department.findOne({
      companyId,
      code: data.code.toUpperCase(),
      _id: {
        $ne: departmentId,
      },
    });

    if (existingDepartment) {
      throw new Error("Department code already exists");
    }

    data.code = data.code.toUpperCase();
  }

  Object.assign(department, data);

  department.updatedBy = userId;

  await department.save();

  return department;
};

export const deactivateDepartment = async ({
  companyId,
  departmentId,
  userId,
}) => {
  const department = await Department.findOne({
    _id: departmentId,
    companyId,
  });

  if (!department) {
    throw new Error("Department not found");
  }

  // We use soft deletion because employees
  // may already belong to this department.
  department.isActive = false;
  department.updatedBy = userId;

  await department.save();

  return department;
};
