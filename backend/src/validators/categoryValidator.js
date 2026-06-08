const { body, validationResult } = require("express-validator");
const { sendError } = require("../utils/responseHandler");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, errors.array()[0].msg);
  }
  next();
};

const validateCategory = [
  body("name")
    .trim()
    .notEmpty().withMessage("Category name is required.")
    .isLength({ max: 50 }).withMessage("Category name cannot exceed 50 characters."),

  body("description")
    .optional()
    .isLength({ max: 200 }).withMessage("Description cannot exceed 200 characters."),

  handleValidationErrors,
];

module.exports = { validateCategory };