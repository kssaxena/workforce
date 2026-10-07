import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

import registerCompany from "../services/company.service.js";

import {
  getAttendanceSettings,
  updateAttendanceSettings,
} from "../services/companySettings.service.js";

const registerCompanyController = asyncHandler(async (req, res) => {
  const { company, representative } = req.body;

  const result = await registerCompany({
    companyData: company,
    representativeData: representative,
  });

  /*
   * Never return password/hash.
   */

  const responseData = {
    company: result.company,
    representative: result.representative,
    user: {
      _id: result.user._id,
      email: result.user.email,
      phone: result.user.phone,
      status: result.user.status,
    },
  };

  return res
    .status(201)
    .json(
      new ApiResponse(201, responseData, "Company registered successfully"),
    );
});

const getAttendanceSettingsController = asyncHandler(async (req, res) => {
  const settings = await getAttendanceSettings({
    companyId: req.user.companyId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        settings,
        "Attendance settings fetched successfully",
      ),
    );
});

const updateAttendanceSettingsController = asyncHandler(async (req, res) => {
  const settings = await updateAttendanceSettings({
    companyId: req.user.companyId,
    userId: req.user.userId,
    data: req.body,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        settings,
        "Attendance settings updated successfully",
      ),
    );
});

export {
  registerCompanyController,
  getAttendanceSettingsController,
  updateAttendanceSettingsController,
};

export default registerCompanyController;
