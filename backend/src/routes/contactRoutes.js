const express = require("express");
const router = express.Router();
const { submitContact, getAllContacts } = require("../controllers/contactController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

router.post("/", submitContact);
router.get("/", protect, adminOnly, getAllContacts);

module.exports = router;