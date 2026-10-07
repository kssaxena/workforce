import asyncHandler from "../../../core/middleware/asyncHandler.js";
import ApiResponse from "../../../core/utils/ApiResponse.js";

import { getAuditLogs, getAuditLogById } from "../services/audit.service.js";

export const getAuditLogsController = asyncHandler(async (req, res) => {
  const logs = await getAuditLogs({
    companyId: req.user.companyId,

    filters: {
      module: req.query.module,
      action: req.query.action,
      entityType: req.query.entityType,
      actorId: req.query.actorId,
      targetEmployeeId: req.query.targetEmployeeId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit ? Number(req.query.limit) : 100,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, logs, "Audit logs fetched successfully"));
});

export const getAuditLogController = asyncHandler(async (req, res) => {
  const log = await getAuditLogById({
    companyId: req.user.companyId,
    auditLogId: req.params.auditLogId,
  });

  if (!log) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Audit log not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, log, "Audit log fetched successfully"));
});
