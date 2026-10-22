import mongoose from "mongoose";

import ApiError from "../../../core/errors/ApiError.js";
import Employee from "../../employee/models/employee.model.js";
import Department from "../models/department.model.js";

const validateObjectId = (id, message) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, message);
  }
};

const validateDepartmentParentChain = async ({
  companyId,
  departmentId,
  parentDepartmentId,
}) => {
  if (!parentDepartmentId) return null;

  validateObjectId(parentDepartmentId, "Invalid parent department ID");

  const visited = new Set(departmentId ? [departmentId.toString()] : []);

  let currentId = parentDepartmentId;
  let parent = null;

  while (currentId) {
    const currentKey = currentId.toString();

    if (visited.has(currentKey)) {
      throw new ApiError(
        400,
        "Invalid department hierarchy: circular parent relationship detected",
      );
    }

    visited.add(currentKey);

    parent = await Department.findOne({
      _id: currentId,
      companyId,
    }).select("_id name code parentDepartmentId isActive");

    if (!parent) {
      throw new ApiError(404, "Parent department not found in this company");
    }

    if (!parent.isActive) {
      throw new ApiError(400, "An inactive department cannot be a parent");
    }

    currentId = parent.parentDepartmentId;
  }

  return Department.findOne({
    _id: parentDepartmentId,
    companyId,
  }).select("_id name code parentDepartmentId isActive");
};

const validateDepartmentManager = async ({ companyId, managerId }) => {
  if (managerId === undefined || managerId === null) return null;

  validateObjectId(managerId, "Invalid department manager ID");

  const manager = await Employee.findOne({
    _id: managerId,
    companyId,
    isActive: true,
    employmentStatus: {
      $nin: ["SUSPENDED", "RESIGNED", "TERMINATED"],
    },
  }).select("_id");

  if (!manager) {
    throw new ApiError(
      400,
      "Department manager must be an active employee in the same company",
    );
  }

  return manager._id;
};

const findDuplicateDepartmentCode = async ({ companyId, code, excludeId }) => {
  const filter = {
    companyId,
    code: code.toUpperCase(),
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return Department.findOne(filter).select("_id");
};

export const createDepartment = async ({ companyId, userId, data }) => {
  const { name, code, description, parentDepartmentId, managerId } = data;

  if (parentDepartmentId) {
    await validateDepartmentParentChain({
      companyId,
      parentDepartmentId,
    });
  }

  const existingDepartment = await findDuplicateDepartmentCode({
    companyId,
    code,
  });

  if (existingDepartment) {
    throw new ApiError(409, "Department code already exists");
  }

  const validatedManagerId = await validateDepartmentManager({
    companyId,
    managerId,
  });

  try {
    return await Department.create({
      companyId,
      name,
      code: code.toUpperCase(),
      description,
      parentDepartmentId: parentDepartmentId || null,
      managerId: validatedManagerId || null,
      createdBy: userId,
      updatedBy: userId,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Department code already exists");
    }

    throw error;
  }
};

export const getDepartments = async ({
  companyId,
  includeInactive = false,
}) => {
  const filter = { companyId };

  if (!includeInactive) {
    filter.isActive = true;
  }

  return Department.find(filter)
    .populate("parentDepartmentId", "name code")
    .populate("managerId", "employeeCode firstName lastName designation")
    .sort({ name: 1 });
};

export const getDepartmentById = async ({ companyId, departmentId }) => {
  validateObjectId(departmentId, "Invalid department ID");

  const department = await Department.findOne({
    _id: departmentId,
    companyId,
  })
    .populate("parentDepartmentId", "name code")
    .populate("managerId", "employeeCode firstName lastName designation");

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  return department;
};

export const updateDepartment = async ({
  companyId,
  departmentId,
  userId,
  data,
}) => {
  validateObjectId(departmentId, "Invalid department ID");

  const department = await Department.findOne({
    _id: departmentId,
    companyId,
  });

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  if (data.parentDepartmentId !== undefined) {
    if (data.parentDepartmentId === null) {
      department.parentDepartmentId = null;
    } else {
      const parent = await validateDepartmentParentChain({
        companyId,
        departmentId,
        parentDepartmentId: data.parentDepartmentId,
      });

      department.parentDepartmentId = parent._id;
    }
  }

  if (data.code !== undefined) {
    const normalizedCode = data.code.toUpperCase();

    const existingDepartment = await findDuplicateDepartmentCode({
      companyId,
      code: normalizedCode,
      excludeId: departmentId,
    });

    if (existingDepartment) {
      throw new ApiError(409, "Department code already exists");
    }

    department.code = normalizedCode;
  }

  if (data.managerId !== undefined) {
    department.managerId = await validateDepartmentManager({
      companyId,
      managerId: data.managerId,
    });
  }

  if (data.name !== undefined) department.name = data.name;
  if (data.description !== undefined) {
    department.description = data.description;
  }

  department.updatedBy = userId;

  try {
    await department.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Department code already exists");
    }

    throw error;
  }

  return department;
};

export const deactivateDepartment = async ({
  companyId,
  departmentId,
  userId,
}) => {
  validateObjectId(departmentId, "Invalid department ID");

  const department = await Department.findOne({
    _id: departmentId,
    companyId,
  });

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  if (!department.isActive) {
    return department;
  }

  const childDepartment = await Department.findOne({
    companyId,
    parentDepartmentId: department._id,
  }).select("_id");

  if (childDepartment) {
    throw new ApiError(
      409,
      "Cannot deactivate this department while child departments reference it. Reassign the child departments first.",
    );
  }

  const assignedEmployee = await Employee.findOne({
    companyId,
    departmentId: department._id,
    isActive: true,
    employmentStatus: {
      $nin: ["RESIGNED", "TERMINATED"],
    },
  }).select("_id");

  if (assignedEmployee) {
    throw new ApiError(
      409,
      "Cannot deactivate this department while active employees are assigned to it. Reassign the employees first.",
    );
  }

  if (department.managerId) {
    throw new ApiError(
      409,
      "Remove the department manager before deactivating this department.",
    );
  }

  department.isActive = false;
  department.updatedBy = userId;

  await department.save();

  return department;
};
