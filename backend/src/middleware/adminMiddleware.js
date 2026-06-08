const { sendError } = require("../utils/responseHandler");

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 401, "Authentication required.");
  }

  if (req.user.role !== "admin") {
    return sendError(res, 403, "Access denied. Admins only.");
  }

  next();
};

module.exports = { adminOnly };