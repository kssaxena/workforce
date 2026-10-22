import mongoose from "mongoose";

import ApiError from "../../../core/errors/ApiError.js";
import Employee from "../../employee/models/employee.model.js";
import OrganizationUnit from "../models/organizationUnit.model.js";

const validateObjectId = (id, message) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, message);
  }
};

const findCompanyUnit = async ({ companyId, unitId }) =>
  OrganizationUnit.findOne({
    _id: unitId,
    companyId,
  });

const validateParentChain = async ({ companyId, unitId, parentUnitId }) => {
  if (!parentUnitId) return null;

  validateObjectId(parentUnitId, "Invalid parent organization unit");

  const visited = new Set([unitId.toString()]);
  let currentId = parentUnitId;
  let parent = null;

  while (currentId) {
    const currentKey = currentId.toString();

    if (visited.has(currentKey)) {
      throw new ApiError(
        400,
        "Invalid organization hierarchy: circular parent relationship detected",
      );
    }

    visited.add(currentKey);

    parent = await OrganizationUnit.findOne({
      _id: currentId,
      companyId,
    }).select("_id name code level parentUnitId isActive");

    if (!parent) {
      throw new ApiError(
        404,
        "Parent organization unit not found in this company",
      );
    }

    if (!parent.isActive) {
      throw new ApiError(400, "An inactive unit cannot be a parent");
    }

    currentId = parent.parentUnitId;
  }

  return OrganizationUnit.findOne({
    _id: parentUnitId,
    companyId,
  }).select("_id name code level parentUnitId isActive");
};

const recalculateDescendantLevels = async ({
  companyId,
  parentUnitId,
  parentLevel,
  visited = new Set(),
}) => {
  const parentKey = parentUnitId.toString();

  if (visited.has(parentKey)) {
    throw new ApiError(
      400,
      "Circular organization hierarchy detected during level recalculation",
    );
  }

  visited.add(parentKey);

  const children = await OrganizationUnit.find({
    companyId,
    parentUnitId,
  }).select("_id level");

  for (const child of children) {
    const expectedLevel = parentLevel + 1;

    if (child.level !== expectedLevel) {
      child.level = expectedLevel;
      await child.save();
    }

    await recalculateDescendantLevels({
      companyId,
      parentUnitId: child._id,
      parentLevel: expectedLevel,
      visited,
    });
  }

  visited.delete(parentKey);
};

export const createOrganizationUnit = async ({ companyId, userId, data }) => {
  const { name, code, description, parentUnitId } = data;

  let level = 0;

  if (parentUnitId) {
    const parent = await validateParentChain({
      companyId,
      unitId: "new-unit",
      parentUnitId,
    });

    level = parent.level + 1;
  }

  const normalizedCode = code.toUpperCase();

  const existingUnit = await OrganizationUnit.findOne({
    companyId,
    code: normalizedCode,
  }).select("_id");

  if (existingUnit) {
    throw new ApiError(409, "Organization unit code already exists");
  }

  try {
    return await OrganizationUnit.create({
      companyId,
      name,
      code: normalizedCode,
      description,
      parentUnitId: parentUnitId || null,
      level,
      createdBy: userId,
      updatedBy: userId,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Organization unit code already exists");
    }

    throw error;
  }
};

export const getOrganizationUnits = async ({
  companyId,
  includeInactive = false,
}) => {
  const filter = { companyId };

  if (!includeInactive) {
    filter.isActive = true;
  }

  return OrganizationUnit.find(filter)
    .populate("parentUnitId", "name code level")
    .sort({ level: 1, name: 1 });
};

export const getOrganizationUnitById = async ({ companyId, unitId }) => {
  validateObjectId(unitId, "Invalid organization unit ID");

  const unit = await findCompanyUnit({ companyId, unitId });

  if (!unit) {
    throw new ApiError(404, "Organization unit not found");
  }

  return unit.populate("parentUnitId", "name code level");
};

export const updateOrganizationUnit = async ({
  companyId,
  unitId,
  userId,
  data,
}) => {
  validateObjectId(unitId, "Invalid organization unit ID");

  const unit = await findCompanyUnit({ companyId, unitId });

  if (!unit) {
    throw new ApiError(404, "Organization unit not found");
  }

  if (data.parentUnitId !== undefined) {
    if (data.parentUnitId === null) {
      unit.parentUnitId = null;
      unit.level = 0;
    } else {
      const parent = await validateParentChain({
        companyId,
        unitId,
        parentUnitId: data.parentUnitId,
      });

      unit.parentUnitId = parent._id;
      unit.level = parent.level + 1;
    }
  }

  if (data.code !== undefined) {
    const normalizedCode = data.code.toUpperCase();

    const existingUnit = await OrganizationUnit.findOne({
      companyId,
      code: normalizedCode,
      _id: { $ne: unitId },
    }).select("_id");

    if (existingUnit) {
      throw new ApiError(409, "Organization unit code already exists");
    }

    unit.code = normalizedCode;
  }

  if (data.name !== undefined) unit.name = data.name;
  if (data.description !== undefined) unit.description = data.description;

  unit.updatedBy = userId;

  try {
    await unit.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Organization unit code already exists");
    }

    throw error;
  }

  await recalculateDescendantLevels({
    companyId,
    parentUnitId: unit._id,
    parentLevel: unit.level,
  });

  return unit;
};

export const deactivateOrganizationUnit = async ({
  companyId,
  unitId,
  userId,
}) => {
  validateObjectId(unitId, "Invalid organization unit ID");

  const unit = await findCompanyUnit({ companyId, unitId });

  if (!unit) {
    throw new ApiError(404, "Organization unit not found");
  }

  if (!unit.isActive) {
    return unit;
  }

  const childUnit = await OrganizationUnit.findOne({
    companyId,
    parentUnitId: unit._id,
  }).select("_id");

  if (childUnit) {
    throw new ApiError(
      409,
      "Cannot deactivate this unit while child organization units reference it. Reassign or remove the child units first.",
    );
  }

  const assignedEmployee = await Employee.findOne({
    companyId,
    organizationUnitId: unit._id,
    isActive: true,
    employmentStatus: {
      $nin: ["RESIGNED", "TERMINATED"],
    },
  }).select("_id");

  if (assignedEmployee) {
    throw new ApiError(
      409,
      "Cannot deactivate this unit while active employees are assigned to it. Reassign the employees first.",
    );
  }

  unit.isActive = false;
  unit.updatedBy = userId;

  await unit.save();

  return unit;
};
