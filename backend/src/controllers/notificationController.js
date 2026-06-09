const User = require('../models/User');
const Subscriber = require('../models/Subscriber');
const Notification = require('../models/Notification');
const UserNotification = require('../models/UserNotification');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const isValidEmail = (email) => {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const subscribe = async (req, res, next) => {
  try {
    const email = (req.user?.email || req.body.email || '').trim().toLowerCase();
    if (!email || !isValidEmail(email)) {
      return sendError(res, 400, 'A valid email is required to subscribe.');
    }

    const existingUser = req.user || await User.findOne({ email }).select('_id email');
    const filter = req.user
      ? { $or: [{ user: req.user._id }, { email }] }
      : { email };

    let subscriber = await Subscriber.findOne(filter);
    if (subscriber) {
      if (subscriber.subscribed) {
        return sendSuccess(res, 200, 'Already subscribed.', { subscribed: true });
      }
      subscriber.subscribed = true;
      if (existingUser) subscriber.user = existingUser._id;
      await subscriber.save();
      return sendSuccess(res, 200, 'Subscription restored.', { subscribed: true });
    }

    subscriber = await Subscriber.create({
      user: existingUser?._id || null,
      email,
      subscribed: true,
    });

    return sendSuccess(res, 201, 'Subscribed successfully.', { subscribed: subscriber.subscribed });
  } catch (error) {
    if (error.code === 11000) {
      return sendSuccess(res, 200, 'Already subscribed.', { subscribed: true });
    }
    next(error);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const { title, message, image } = req.body;

    if (!title || !title.trim()) {
      return sendError(res, 400, 'Notification title is required.');
    }
    if (!message || !message.trim()) {
      return sendError(res, 400, 'Notification message is required.');
    }

    const notification = await Notification.create({
      title: title.trim(),
      message: message.trim(),
      image: image?.trim() || null,
      createdBy: req.user._id,
    });

    const subscribers = await Subscriber.find({ subscribed: true, user: { $ne: null } }).select('user');
    const userNotifications = subscribers
      .filter((s) => s.user)
      .map((subscriber) => ({
        user: subscriber.user,
        notification: notification._id,
      }));

    if (userNotifications.length > 0) {
      await UserNotification.insertMany(userNotifications, { ordered: false });
    }

    return sendSuccess(res, 201, 'Notification published to subscribed users.', {
      notificationId: notification._id,
      deliveredTo: userNotifications.length,
    });
  } catch (error) {
    next(error);
  }
};

const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await UserNotification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'notification',
        select: 'title message image createdAt',
      });

    const formatted = notifications.map((item) => ({
      id: item._id,
      isRead: item.isRead,
      createdAt: item.createdAt,
      title: item.notification?.title || '',
      message: item.notification?.message || '',
      image: item.notification?.image || null,
    }));

    return sendSuccess(res, 200, 'Notifications retrieved.', { notifications: formatted });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await UserNotification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 404, 'Notification not found.');
    }

    return sendSuccess(res, 200, 'Notification marked as read.', { id: notification._id });
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await UserNotification.countDocuments({ user: req.user._id, isRead: false });
    return sendSuccess(res, 200, 'Unread count retrieved.', { count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  subscribe,
  createNotification,
  getMyNotifications,
  markAsRead,
  getUnreadCount,
};
