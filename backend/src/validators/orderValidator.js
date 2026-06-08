const { body, validationResult } = require("express-validator");
const { sendError } = require("../utils/responseHandler");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, errors.array()[0].msg);
  }
  next();
};

const validateOrder = [
  body("items")
    .isArray({ min: 1 }).withMessage("Order must contain at least one item."),

  body("items.*.product")
    .notEmpty().withMessage("Product ID is required for each item.")
    .isMongoId().withMessage("Invalid product ID."),

  body("items.*.quantity")
    .notEmpty().withMessage("Quantity is required for each item.")
    .isInt({ min: 1 }).withMessage("Quantity must be at least 1."),

  body("shippingAddress.street")
    .optional().isString(),

  body("shippingAddress.city")
    .optional().isString(),

  body("shippingAddress.state")
    .optional().isString(),

  body("shippingAddress.pincode")
    .optional().isString(),

  handleValidationErrors,
];

module.exports = { validateOrder };