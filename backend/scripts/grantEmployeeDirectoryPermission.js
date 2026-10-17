import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../src/config/database.js";
import { seedPermissions } from "../src/modules/rbac/seeds/permission.seed.js";

import Role from "../src/modules/rbac/models/role.model.js";
import Permission from "../src/modules/rbac/models/permission.model.js";
import RolePermission from "../src/modules/rbac/models/rolePermission.model.js";

import { PERMISSIONS } from "../src/modules/rbac/constants/permission.js";
import { SYSTEM_ROLES } from "../src/modules/rbac/constants/roles.js";

const TARGET_PERMISSION = PERMISSIONS.EMPLOYEE_DIRECTORY_READ;

const TARGET_ROLES = Object.values(SYSTEM_ROLES);

const runMigration = async () => {
  try {
    await connectDB();

    // Ensure the new global permission exists.
    await seedPermissions();

    const permission = await Permission.findOne({
      code: TARGET_PERMISSION,
      isActive: true,
    }).lean();

    if (!permission) {
      throw new Error(`Active permission not found: ${TARGET_PERMISSION}`);
    }

    // Find only the predefined system roles.
    // Custom tenant roles are intentionally untouched.
    const roles = await Role.find({
      code: { $in: TARGET_ROLES },
      isSystemRole: true,
      isActive: true,
    })
      .select("_id companyId name code")
      .lean();

    const operations = [];
    let alreadyGranted = 0;

    for (const role of roles) {
      const existing = await RolePermission.findOne({
        roleId: role._id,
        permissionId: permission._id,
      })
        .select("granted")
        .lean();

      if (existing?.granted === true) {
        alreadyGranted++;
        continue;
      }

      operations.push({
        updateOne: {
          filter: {
            roleId: role._id,
            permissionId: permission._id,
          },
          update: {
            $set: { granted: true },
          },
          upsert: true,
        },
      });
    }

    console.log("\\nEmployee Directory Permission Migration");
    console.log("---------------------------------------");
    console.log(`Permission: ${TARGET_PERMISSION}`);
    console.log(`Active system roles found: ${roles.length}`);
    console.log(`Already granted: ${alreadyGranted}`);
    console.log(`Roles needing update: ${operations.length}`);

    // Dry run is the default.
    if (process.env.APPLY_DIRECTORY_PERMISSION !== "true") {
      console.log("\\nDRY RUN ONLY — no role permissions were changed.");
      console.log(
        "Review the counts, then set APPLY_DIRECTORY_PERMISSION=true to apply.",
      );
      return;
    }

    if (operations.length > 0) {
      const result = await RolePermission.bulkWrite(operations, {
        ordered: true,
      });

      console.log("\\nMigration applied.");
      console.log(`Matched: ${result.matchedCount}`);
      console.log(`Modified: ${result.modifiedCount}`);
      console.log(`Upserted: ${result.upsertedCount}`);
    } else {
      console.log("\\nNo permission changes were necessary.");
    }

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

runMigration();
