import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

import {
  createOrganizationUnit,
  getOrganizationUnits,
  getOrganizationUnitById,
  updateOrganizationUnit,
  deactivateOrganizationUnit,
} from "../services/organizationUnit.service.js";

export const createOrganizationUnitController = asyncHandler(
  async (req, res) => {
    const unit = await createOrganizationUnit({
      companyId: req.user.companyId,
      userId: req.user.userId,
      data: req.body,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(201, unit, "Organization unit created successfully"),
      );
  },
);

export const getOrganizationUnitsController = asyncHandler(async (req, res) => {
  const units = await getOrganizationUnits({
    companyId: req.user.companyId,
    includeInactive: req.query.includeInactive === "true",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, units, "Organization units fetched successfully"),
    );
});

export const getOrganizationUnitController = asyncHandler(async (req, res) => {
  const unit = await getOrganizationUnitById({
    companyId: req.user.companyId,
    unitId: req.params.unitId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, unit, "Organization unit fetched successfully"));
});

export const updateOrganizationUnitController = asyncHandler(
  async (req, res) => {
    const unit = await updateOrganizationUnit({
      companyId: req.user.companyId,
      unitId: req.params.unitId,
      userId: req.user.userId,
      data: req.body,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, unit, "Organization unit updated successfully"),
      );
  },
);

export const deactivateOrganizationUnitController = asyncHandler(
  async (req, res) => {
    const unit = await deactivateOrganizationUnit({
      companyId: req.user.companyId,
      unitId: req.params.unitId,
      userId: req.user.userId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          unit,
          "Organization unit deactivated successfully",
        ),
      );
  },
);
