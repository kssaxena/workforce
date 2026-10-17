import Employee from "../models/employee.model.js";

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const DIRECTORY_FIELDS = [
  "firstName",
  "lastName",
  "designation",
  "departmentId",
  "organizationUnitId",
  "reportsTo",
  "profileImage",
  "contact.workEmail",
].join(" ");

const populateDirectoryFields = (query) =>
  query
    .populate("departmentId", "name code")
    .populate("organizationUnitId", "name code level")
    .populate("reportsTo", "firstName lastName designation");

export const searchEmployeeDirectory = async ({
  companyId,
  search = "",
  departmentId,
  organizationUnitId,
  page = 1,
  limit = 20,
}) => {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 20));

  const filter = {
    companyId,
    isActive: true,
    employmentStatus: "ACTIVE",
  };

  if (departmentId) filter.departmentId = departmentId;
  if (organizationUnitId) filter.organizationUnitId = organizationUnitId;

  const normalizedSearch = String(search).trim().slice(0, 80);

  if (normalizedSearch) {
    const pattern = new RegExp(escapeRegex(normalizedSearch), "i");

    filter.$or = [
      { firstName: pattern },
      { lastName: pattern },
      { designation: pattern },
      { "contact.workEmail": pattern },
    ];
  }

  const [employees, total] = await Promise.all([
    populateDirectoryFields(
      Employee.find(filter)
        .select(DIRECTORY_FIELDS)
        .sort({ firstName: 1, lastName: 1, _id: 1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit),
    ).lean(),
    Employee.countDocuments(filter),
  ]);

  return {
    employees,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const getDirectoryProfile = async ({ companyId, employeeId }) => {
  const employee = await populateDirectoryFields(
    Employee.findOne({
      _id: employeeId,
      companyId,
      isActive: true,
      employmentStatus: "ACTIVE",
    }).select(DIRECTORY_FIELDS),
  ).lean();

  return employee;
};
