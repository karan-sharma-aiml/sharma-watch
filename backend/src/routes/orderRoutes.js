const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { validateOrder } = require("../validators/orderValidator");

router.use(protect);

router.post("/", validateOrder, createOrder);
router.get("/my-orders", getMyOrders);

router.get("/", adminOnly, getAllOrders);
router.put("/:id/status", adminOnly, updateOrderStatus);

module.exports = router;