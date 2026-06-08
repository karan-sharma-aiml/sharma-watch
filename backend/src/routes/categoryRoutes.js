const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { validateCategory } = require("../validators/categoryValidator");

router.get("/", getAllCategories);

router.post("/", protect, adminOnly, validateCategory, createCategory);
router.put("/:id", protect, adminOnly, validateCategory, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;