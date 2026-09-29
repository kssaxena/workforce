import mongoose from "mongoose";

import User from "../../auth/models/user.model.js";
import Role from "../../rbac/models/role.model.js";
import UserRole from "../../rbac/models/userRole.model.js";

import Department from "../../organization/models/department.model.js";
import OrganizationUnit from "../../organization/models/organizationUnit.model.js";

import Employee from "../models/employee.model.js";

import { hashPassword } from "../../auth/services/password.service.js";

import { WorkSchedule } from "../../attendance/models/workSchedule.model.js";

import ApiError from "../../../core/errors/ApiError.js";

const validateObjectId = (id, message) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(message);
  }
};

export const createEmployee = async ({ companyId, createdBy, data }) => {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const {
        email,
        phone,
        password,
        firstName,
        lastName,
        employeeCode,
        dateOfBirth,
        gender,
        joiningDate,
        employmentType,
        designation,
        departmentId,
        workScheduleId,
        organizationUnitId,
        reportsTo,
        roleId,
        contact,
        address,
      } = data;

      /*
       * ----------------------------------------------------
       * 1. Validate department
       * ----------------------------------------------------
       */

      if (departmentId) {
        validateObjectId(departmentId, "Invalid department ID");

        const department = await Department.findOne({
          _id: departmentId,
          companyId,
          isActive: true,
        }).session(session);

        if (!department) {
          throw new Error("Department not found");
        }
      }

      /*
       * ----------------------------------------------------
       * 2. Validate organization unit
       * ----------------------------------------------------
       */

      if (organizationUnitId) {
        validateObjectId(organizationUnitId, "Invalid organization unit ID");

        const organizationUnit = await OrganizationUnit.findOne({
          _id: organizationUnitId,
          companyId,
          isActive: true,
        }).session(session);

        if (!organizationUnit) {
          throw new Error("Organization unit not found");
        }
      }

      /*
       * ----------------------------------------------------
       * 3. Validate reporting manager
       * ----------------------------------------------------
       */

      if (reportsTo) {
        validateObjectId(reportsTo, "Invalid reporting manager ID");

        const manager = await Employee.findOne({
          _id: reportsTo,
          companyId,
          isActive: true,
        }).session(session);

        if (!manager) {
          throw new Error("Reporting manager not found");
        }
      }

      /*
       * ----------------------------------------------------
       * 4. Validate role
       * ----------------------------------------------------
       */

      validateObjectId(roleId, "Invalid role ID");

      const role = await Role.findOne({
        _id: roleId,
        companyId,
        isActive: true,
      }).session(session);

      if (!role) {
        throw new Error("Role not found for this company");
      }

      /*
       * ----------------------------------------------------
       * 5. Check duplicate user
       * ----------------------------------------------------
       */

      const existingUser = await User.findOne({
        $or: [{ email }, { phone }],
      }).session(session);

      if (existingUser) {
        throw new Error("A user with this email or phone already exists");
      }

      /*
       * ----------------------------------------------------
       * 6. Check duplicate employee code
       * ----------------------------------------------------
       */

      const existingEmployee = await Employee.findOne({
        companyId,
        employeeCode: employeeCode.toUpperCase(),
      }).session(session);

      if (existingEmployee) {
        throw new Error("Employee code already exists");
      }

      /*
       * ----------------------------------------------------
       * 7. Hash password
       * ----------------------------------------------------
       */

      const hashedPassword = await hashPassword(password);

      /*
       * ----------------------------------------------------
       * 8. Create User
       * ----------------------------------------------------
       */

      const [user] = await User.create(
        [
          {
            email,
            phone,
            password: hashedPassword,
            status: "ACTIVE",
          },
        ],
        { session },
      );

      /*
       * ----------------------------------------------------
       * 9. Create Employee
       * ----------------------------------------------------
       */

      let assignedWorkScheduleId = data.workScheduleId;

      if (assignedWorkScheduleId) {
        validateObjectId(assignedWorkScheduleId, "Invalid work schedule ID");

        const schedule = await WorkSchedule.findOne({
          _id: assignedWorkScheduleId,
          companyId,
          isActive: true,
        }).session(session);

        if (!schedule) {
          throw new ApiError(400, "Invalid or inactive work schedule");
        }
      } else {
        const defaultSchedule = await WorkSchedule.findOne({
          companyId,
          isDefault: true,
          isActive: true,
        }).session(session);

        if (!defaultSchedule) {
          throw new ApiError(
            400,
            "Company does not have a default work schedule",
          );
        }

        assignedWorkScheduleId = defaultSchedule._id;
      }

      const [employee] = await Employee.create(
        [
          {
            companyId,

            userId: user._id,

            employeeCode: data.employeeCode,

            firstName: data.firstName,

            lastName: data.lastName,

            dateOfBirth: data.dateOfBirth,

            gender: data.gender,

            joiningDate: data.joiningDate,

            employmentType: data.employmentType,

            designation: data.designation,

            departmentId: data.departmentId,

            organizationUnitId: data.organizationUnitId,

            reportsTo: data.reportsTo,

            workScheduleId: assignedWorkScheduleId,

            contact: data.contact,

            address: data.address,

            createdBy: createdBy,

            updatedBy: createdBy,
          },
        ],
        {
          session,
        },
      );

      /*
       * ----------------------------------------------------
       * 10. Assign RBAC role
       * ----------------------------------------------------
       */

      await UserRole.create(
        [
          {
            userId: user._id,
            companyId,
            roleId: role._id,
            assignedBy: createdBy,
            assignedAt: new Date(),
            isActive: true,
          },
        ],
        { session },
      );

      result = {
        employee,
        userId: user._id,
        roleId: role._id,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};
