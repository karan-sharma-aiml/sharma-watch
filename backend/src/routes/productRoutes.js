const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  bulkUpdateStatus,
  getDashboardStats,
} = require("../controllers/productController");

const { protect }         = require("../middleware/authMiddleware");
const { adminOnly }       = require("../middleware/adminMiddleware");
const { validateProduct } = require("../validators/productValidator");

// ── Public Routes ──────────────────────────
router.get("/dashboard-stats", protect, adminOnly, getDashboardStats);
router.get("/",                getAllProducts);
router.get("/:id",             getProductById);

// ── Admin Routes ───────────────────────────
router.post("/",           protect, adminOnly, validateProduct, createProduct);
router.put("/:id",         protect, adminOnly, updateProduct);
router.delete("/:id",      protect, adminOnly, deleteProduct);
router.post("/bulk-delete", protect, adminOnly, bulkDeleteProducts);
router.patch("/bulk-status", protect, adminOnly, bulkUpdateStatus);

module.exports = router;