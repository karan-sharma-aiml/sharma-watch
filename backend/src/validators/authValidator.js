const { body, validationResult } = require("express-validator");
const { sendError } = require("../utils/responseHandler");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, errors.array()[0].msg);
  }
  next();
};

const validateRegister = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters."),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email."),

  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),

  handleValidationErrors,
];

const validateLogin = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email."),

  body("password")
    .notEmpty().withMessage("Password is required."),

  handleValidationErrors,
];

module.exports = { validateRegister, validateLogin };