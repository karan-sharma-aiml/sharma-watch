const express = require('express');
const router  = express.Router();
const {
  subscribe,
  createNotification,
  getMyNotifications,
  markAsRead,
  getUnreadCount,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.post('/subscribe', subscribe);
router.post('/create', protect, adminOnly, createNotification);
router.get('/my', protect, getMyNotifications);
router.patch('/read/:id', protect, markAsRead);
router.get('/unread-count', protect, getUnreadCount);

module.exports = router;
