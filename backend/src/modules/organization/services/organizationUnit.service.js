import mongoose from "mongoose";

import OrganizationUnit from "../models/organizationUnit.model.js";

const validateObjectId = (id, message) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(message);
  }
};

export const createOrganizationUnit = async ({ companyId, userId, data }) => {
  const { name, code, description, parentUnitId } = data;

  if (parentUnitId) {
    validateObjectId(parentUnitId, "Invalid parent organization unit");

    const parentUnit = await OrganizationUnit.findOne({
      _id: parentUnitId,
      companyId,
      isActive: true,
    });

    if (!parentUnit) {
      throw new Error("Parent organization unit not found");
    }
  }

  const existingUnit = await OrganizationUnit.findOne({
    companyId,
    code: code.toUpperCase(),
  });

  if (existingUnit) {
    throw new Error("Organization unit code already exists");
  }

  let level = 0;

  if (parentUnitId) {
    const parentUnit = await OrganizationUnit.findOne({
      _id: parentUnitId,
      companyId,
      isActive: true,
    }).select("level");

    level = parentUnit.level + 1;
  }

  return OrganizationUnit.create({
    companyId,
    name,
    code: code.toUpperCase(),
    description,
    parentUnitId: parentUnitId || null,
    level,
    createdBy: userId,
    updatedBy: userId,
  });
};

export const getOrganizationUnits = async ({
  companyId,
  includeInactive = false,
}) => {
  const filter = {
    companyId,
  };

  if (!includeInactive) {
    filter.isActive = true;
  }

  return OrganizationUnit.find(filter)
    .populate("parentUnitId", "name code level")
    .sort({
      level: 1,
      name: 1,
    });
};

export const getOrganizationUnitById = async ({ companyId, unitId }) => {
  validateObjectId(unitId, "Invalid organization unit ID");

  const unit = await OrganizationUnit.findOne({
    _id: unitId,
    companyId,
  }).populate("parentUnitId", "name code level");

  if (!unit) {
    throw new Error("Organization unit not found");
  }

  return unit;
};

export const updateOrganizationUnit = async ({
  companyId,
  unitId,
  userId,
  data,
}) => {
  validateObjectId(unitId, "Invalid organization unit ID");

  const unit = await OrganizationUnit.findOne({
    _id: unitId,
    companyId,
  });

  if (!unit) {
    throw new Error("Organization unit not found");
  }

  if (data.parentUnitId) {
    validateObjectId(data.parentUnitId, "Invalid parent organization unit");

    // Prevent self-parenting.
    if (data.parentUnitId.toString() === unitId.toString()) {
      throw new Error("An organization unit cannot be its own parent");
    }

    const parentUnit = await OrganizationUnit.findOne({
      _id: data.parentUnitId,
      companyId,
      isActive: true,
    });

    if (!parentUnit) {
      throw new Error("Parent organization unit not found");
    }

    // Prevent direct circular hierarchy.
    if (parentUnit.parentUnitId?.toString() === unitId.toString()) {
      throw new Error("Invalid organization hierarchy");
    }

    data.level = parentUnit.level + 1;
  }

  if (data.code) {
    const existingUnit = await OrganizationUnit.findOne({
      companyId,
      code: data.code.toUpperCase(),
      _id: {
        $ne: unitId,
      },
    });

    if (existingUnit) {
      throw new Error("Organization unit code already exists");
    }

    data.code = data.code.toUpperCase();
  }

  Object.assign(unit, data);

  unit.updatedBy = userId;

  await unit.save();

  return unit;
};

export const deactivateOrganizationUnit = async ({
  companyId,
  unitId,
  userId,
}) => {
  validateObjectId(unitId, "Invalid organization unit ID");

  const unit = await OrganizationUnit.findOne({
    _id: unitId,
    companyId,
  });

  if (!unit) {
    throw new Error("Organization unit not found");
  }

  unit.isActive = false;
  unit.updatedBy = userId;

  await unit.save();

  return unit;
};
