const { verifyToken } = require("../config/jwt");
const User = require("../models/User");
const { sendError } = require("../utils/responseHandler");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return sendError(res, 401, "Access denied. No token provided.");
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return sendError(res, 401, "User belonging to this token no longer exists.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return sendError(res, 401, "Invalid token.");
    }
    if (error.name === "TokenExpiredError") {
      return sendError(res, 401, "Token has expired. Please login again.");
    }
    next(error);
  }
};

module.exports = { protect };