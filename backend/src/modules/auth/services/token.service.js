import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateAccessToken = ({ userId, companyId }) => {
  return jwt.sign(
    {
      sub: userId.toString(),
      companyId: companyId.toString(),
      type: "access",
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    },
  );
};

export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

export const hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};
