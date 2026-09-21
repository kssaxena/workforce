import mongoose from "mongoose";

import Company from "../models/company.model.js";
import User from "../../auth/models/user.model.js";
import CompanyRepresentative from "../../representative/models/companyRepresentative.model.js";

import { hashPassword } from "../../auth/services/password.service.js";
import ApiError from "../../../core/errors/ApiError.js";

const registerCompany = async ({ companyData, representativeData }) => {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      /*
       * ==========================================
       * 1. CHECK EXISTING USER
       * ==========================================
       */

      const existingUser = await User.findOne({
        $or: [
          {
            email: representativeData.email,
          },
          {
            phone: representativeData.phone,
          },
        ],
      }).session(session);

      if (existingUser) {
        throw new ApiError(
          409,
          "A user with this email or phone already exists",
        );
      }

      /*
       * ==========================================
       * 2. CHECK EXISTING COMPANY
       * ==========================================
       */

      const existingCompany = await Company.findOne({
        email: companyData.email,
      }).session(session);

      if (existingCompany) {
        throw new ApiError(409, "A company with this email already exists");
      }

      /*
       * ==========================================
       * 3. HASH PASSWORD
       * ==========================================
       */

      const hashedPassword = await hashPassword(representativeData.password);

      /*
       * ==========================================
       * 4. CREATE USER
       * ==========================================
       */

      const [user] = await User.create(
        [
          {
            email: representativeData.email,
            phone: representativeData.phone,
            password: hashedPassword,
            status: "ACTIVE",
            emailVerified: false,
            phoneVerified: false,
          },
        ],
        {
          session,
        },
      );

      /*
       * ==========================================
       * 5. CREATE COMPANY
       * ==========================================
       */

      const [company] = await Company.create(
        [
          {
            ...companyData,

            status: "ACTIVE",

            subscription: {
              plan: "STARTER",
              status: "TRIAL",
              trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              startsAt: new Date(),
            },
          },
        ],
        {
          session,
        },
      );

      /*
       * ==========================================
       * 6. CREATE REPRESENTATIVE
       * ==========================================
       */

      const [representative] = await CompanyRepresentative.create(
        [
          {
            userId: user._id,
            companyId: company._id,

            firstName: representativeData.firstName,

            lastName: representativeData.lastName,

            designation: representativeData.designation,

            representativeType: "OWNER",

            status: "ACTIVE",

            isPrimary: true,
          },
        ],
        {
          session,
        },
      );

      /*
       * ==========================================
       * 7. UPDATE COMPANY CREATED BY
       * ==========================================
       */

      company.createdBy = user._id;

      await company.save({
        session,
        validateBeforeSave: false,
      });

      result = {
        user,
        company,
        representative,
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

export default registerCompany;
