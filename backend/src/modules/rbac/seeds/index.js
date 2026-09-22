import { seedPermissions } from "./permission.seed.js";

export const initializeRBAC = async () => {
  await seedPermissions();

  console.log("RBAC initialized successfully");
};
