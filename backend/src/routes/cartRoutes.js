const express = require("express");
const router = express.Router();
const { getCart, addToCart, updateCart, removeFromCart } = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCart);
router.delete("/remove/:productId", removeFromCart);

module.exports = router;