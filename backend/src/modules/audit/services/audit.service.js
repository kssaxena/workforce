import AuditLog from "../models/audit.model.js";

export const createAuditLog = async ({
  companyId,
  actorId,
  action,
  module,
  entityType,
  entityId,
  targetEmployeeId,
  description,
  before = null,
  after = null,
  metadata = {},
  ipAddress,
  userAgent,
  session = null,
}) => {
  const [auditLog] = await AuditLog.create(
    [
      {
        companyId,
        actorId,
        action,
        module,
        entityType,
        entityId,
        targetEmployeeId,
        description,
        before,
        after,
        metadata,
        ipAddress,
        userAgent,
      },
    ],
    session ? { session } : undefined,
  );

  return auditLog;
};

export const getAuditLogs = async ({ companyId, filters = {} }) => {
  const query = {
    companyId,
  };

  if (filters.module) {
    query.module = filters.module;
  }

  if (filters.action) {
    query.action = filters.action;
  }

  if (filters.entityType) {
    query.entityType = filters.entityType;
  }

  if (filters.actorId) {
    query.actorId = filters.actorId;
  }

  if (filters.targetEmployeeId) {
    query.targetEmployeeId = filters.targetEmployeeId;
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};

    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      query.createdAt.$lte = new Date(filters.endDate);
    }
  }

  return AuditLog.find(query)
    .populate("actorId", "firstName lastName email")
    .populate("targetEmployeeId", "employeeCode firstName lastName")
    .sort({
      createdAt: -1,
    })
    .limit(filters.limit || 100)
    .lean();
};

export const getAuditLogById = async ({ companyId, auditLogId }) => {
  return AuditLog.findOne({
    _id: auditLogId,
    companyId,
  })
    .populate("actorId", "firstName lastName email")
    .populate("targetEmployeeId", "employeeCode firstName lastName")
    .lean();
};
