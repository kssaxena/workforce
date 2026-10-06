import mongoose from "mongoose";

import Attendance from "../models/attendance.model.js";
import AttendanceRegularization from "../models/attendanceRegularization.model.js";
import Employee from "../../employee/models/employee.model.js";
import Company from "../../company/models/company.model.js";

import ApiError from "../../../core/errors/ApiError.js";

import { calculateWorkedMinutes } from "../../../core/utils/dateTime.js";

const createBusinessDate = (date) => {
  const [year, month, day] = date.split("-").map(Number);

  const result = new Date(Date.UTC(year, month - 1, day));

  if (Number.isNaN(result.getTime())) {
    throw new ApiError(400, "Invalid attendance date");
  }

  return result;
};

const validateTimeRange = ({ requestedCheckIn, requestedCheckOut }) => {
  if (
    requestedCheckIn &&
    requestedCheckOut &&
    new Date(requestedCheckOut) <= new Date(requestedCheckIn)
  ) {
    throw new ApiError(400, "Check-out must be later than check-in");
  }
};

export const createAttendanceRegularizationRequest = async ({
  userId,
  companyId,
  date,
  requestedStatus,
  requestedCheckIn,
  requestedCheckOut,
  reason,
}) => {
  const employee = await Employee.findOne({
    userId,
    companyId,
    isActive: true,
  }).select("_id employeeCode firstName lastName");

  if (!employee) {
    throw new ApiError(404, "Employee profile not found");
  }

  const company = await Company.findById(companyId).select("settings.timezone");

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  validateTimeRange({
    requestedCheckIn,
    requestedCheckOut,
  });

  const attendanceDate = createBusinessDate(date);

  /*
   * Prevent multiple active requests for the same
   * employee/date combination.
   */
  const existingRequest = await AttendanceRegularization.findOne({
    companyId,
    employeeId: employee._id,
    date: attendanceDate,
    status: "PENDING",
  });

  if (existingRequest) {
    throw new ApiError(
      409,
      "A pending regularization request already exists for this date",
    );
  }

  /*
   * If attendance already exists, keep its reference.
   * If it doesn't exist, the reference remains null and
   * approval will create the attendance record.
   */
  const attendance = await Attendance.findOne({
    companyId,
    employeeId: employee._id,
    date: attendanceDate,
  }).select("_id");

  const request = await AttendanceRegularization.create({
    companyId,
    employeeId: employee._id,

    attendanceId: attendance?._id || null,

    date: attendanceDate,

    requestedStatus,

    requestedCheckIn: requestedCheckIn ? new Date(requestedCheckIn) : null,

    requestedCheckOut: requestedCheckOut ? new Date(requestedCheckOut) : null,

    reason,

    status: "PENDING",

    createdBy: userId,
    updatedBy: userId,
  });

  return AttendanceRegularization.findById(request._id)
    .populate("employeeId", "employeeCode firstName lastName designation")
    .populate(
      "attendanceId",
      "date status checkIn checkOut totalWorkedMinutes",
    );
};

export const getMyAttendanceRegularizationRequests = async ({
  userId,
  companyId,
  status,
}) => {
  const employee = await Employee.findOne({
    userId,
    companyId,
    isActive: true,
  }).select("_id");

  if (!employee) {
    throw new ApiError(404, "Employee profile not found");
  }

  const query = {
    companyId,
    employeeId: employee._id,
  };

  if (status) {
    query.status = status;
  }

  return AttendanceRegularization.find(query)
    .populate("attendanceId", "date status checkIn checkOut totalWorkedMinutes")
    .populate("reviewedBy", "email")
    .sort({
      createdAt: -1,
    });
};

export const getCompanyAttendanceRegularizationRequests = async ({
  companyId,
  status,
  employeeId,
}) => {
  const query = {
    companyId,
  };

  if (status) {
    query.status = status;
  }

  if (employeeId) {
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      throw new ApiError(400, "Invalid employee ID");
    }

    query.employeeId = employeeId;
  }

  return AttendanceRegularization.find(query)
    .populate(
      "employeeId",
      "employeeCode firstName lastName designation departmentId organizationUnitId",
    )
    .populate("attendanceId", "date status checkIn checkOut totalWorkedMinutes")
    .populate("reviewedBy", "email")
    .sort({
      status: 1,
      createdAt: -1,
    });
};

export const reviewAttendanceRegularization = async ({
  requestId,
  companyId,
  reviewerId,
  decision,
  reviewRemarks,
}) => {
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new ApiError(400, "Invalid regularization request ID");
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      /*
       * Lock the logical workflow by reading the request
       * inside the transaction.
       */
      const request = await AttendanceRegularization.findOne({
        _id: requestId,
        companyId,
      }).session(session);

      if (!request) {
        throw new ApiError(404, "Regularization request not found");
      }

      if (request.status !== "PENDING") {
        throw new ApiError(
          409,
          `This request has already been ${request.status.toLowerCase()}`,
        );
      }

      /*
       * REJECTION
       *
       * Nothing should be changed in Attendance.
       */
      if (decision === "REJECTED") {
        request.status = "REJECTED";
        request.reviewedBy = reviewerId;
        request.reviewedAt = new Date();
        request.reviewRemarks = reviewRemarks || "";
        request.updatedBy = reviewerId;

        await request.save({ session });

        result = request;
        return;
      }

      /*
       * APPROVAL
       */

      const employee = await Employee.findOne({
        _id: request.employeeId,
        companyId,
        isActive: true,
      })
        .select("_id")
        .session(session);

      if (!employee) {
        throw new ApiError(404, "Employee no longer exists or is inactive");
      }

      const checkIn = request.requestedCheckIn || null;

      const checkOut = request.requestedCheckOut || null;

      if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
        throw new ApiError(
          400,
          "Requested check-out must be later than check-in",
        );
      }

      const isWorkingStatus =
        request.requestedStatus === "PRESENT" ||
        request.requestedStatus === "HALF_DAY";

      const finalCheckIn = isWorkingStatus ? checkIn : null;

      const finalCheckOut = isWorkingStatus ? checkOut : null;

      const totalWorkedMinutes = calculateWorkedMinutes({
        checkIn: finalCheckIn,
        checkOut: finalCheckOut,
      });

      /*
       * If an attendance record already exists, update it.
       *
       * Otherwise create one.
       */
      let attendance;

      if (request.attendanceId) {
        attendance = await Attendance.findOne({
          _id: request.attendanceId,
          companyId,
          employeeId: request.employeeId,
          date: request.date,
        }).session(session);

        /*
         * The request references an attendance record that
         * no longer exists. We create a replacement rather
         * than leaving the request approved without attendance.
         */
        if (!attendance) {
          attendance = new Attendance({
            companyId,
            employeeId: request.employeeId,
            date: request.date,
            createdBy: reviewerId,
          });
        }
      } else {
        attendance = await Attendance.findOne({
          companyId,
          employeeId: request.employeeId,
          date: request.date,
        }).session(session);

        if (!attendance) {
          attendance = new Attendance({
            companyId,
            employeeId: request.employeeId,
            date: request.date,
            createdBy: reviewerId,
          });
        }
      }

      /*
       * Apply the approved attendance.
       */
      attendance.status = request.requestedStatus;

      attendance.checkIn = {
        timestamp: finalCheckIn,
        location: undefined,
        verification: finalCheckIn ? "MANUAL" : undefined,
        distanceFromOffice: undefined,
      };

      attendance.checkOut = {
        timestamp: finalCheckOut,
        location: undefined,
        verification: finalCheckOut ? "MANUAL" : undefined,
        distanceFromOffice: undefined,
      };

      attendance.totalWorkedMinutes = isWorkingStatus ? totalWorkedMinutes : 0;

      attendance.source = "ADMIN";

      /*
       * Manual approval does not fabricate schedule
       * metrics.
       */
      attendance.isLate = false;
      attendance.lateMinutes = 0;

      attendance.isEarlyCheckout = false;
      attendance.earlyCheckoutMinutes = 0;

      attendance.overtimeMinutes = 0;

      attendance.remarks = request.reason || "";

      attendance.updatedBy = reviewerId;

      await attendance.save({ session });

      /*
       * Link the request to the final attendance record.
       */
      request.attendanceId = attendance._id;
      request.status = "APPROVED";
      request.reviewedBy = reviewerId;
      request.reviewedAt = new Date();
      request.reviewRemarks = reviewRemarks || "";
      request.updatedBy = reviewerId;

      await request.save({ session });

      result = {
        request,
        attendance,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};
