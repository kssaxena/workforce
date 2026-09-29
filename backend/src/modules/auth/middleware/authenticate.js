import ApiError from "../../../core/errors/ApiError.js";
import { verifyAccessToken } from "../services/token.service.js";

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication required"));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    const payload = verifyAccessToken(token);

    if (!payload || payload.type !== "access") {
      return next(new ApiError(401, "Invalid access token"));
    }

    if (!payload.sub || !payload.companyId) {
      return next(new ApiError(401, "Invalid access token payload"));
    }

    req.user = {
      userId: payload.sub,
      companyId: payload.companyId,
    };

    next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired access token"));
  }
};

export default authenticate;
