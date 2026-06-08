const { body, validationResult } = require("express-validator");
const { sendError } = require("../utils/responseHandler");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, errors.array()[0].msg);
  }
  next();
};

const validateProduct = [
  body("name")
    .trim()
    .notEmpty().withMessage("Product name is required.")
    .isLength({ max: 100 }).withMessage("Product name cannot exceed 100 characters."),

  body("price")
    .notEmpty().withMessage("Price is required.")
    .isFloat({ min: 0 }).withMessage("Price must be a non-negative number."),

  body("stock")
    .notEmpty().withMessage("Stock is required.")
    .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer."),

  body("category")
    .notEmpty().withMessage("Category is required.")
    .isMongoId().withMessage("Invalid category ID."),

  body("description")
    .optional()
    .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters."),

  handleValidationErrors,
];

module.exports = { validateProduct };