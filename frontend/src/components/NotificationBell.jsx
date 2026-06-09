import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { notificationAPI } from '../services/notificationAPI';
import NotificationDrawer from './NotificationDrawer';

export default function NotificationBell() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const { data } = await notificationAPI.unreadCount();
      setUnreadCount(data.data.count || 0);
    } catch (err) {
      console.error('Failed to load notification count.', err);
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await notificationAPI.getMy();
      setNotifications(data.data.notifications || []);
      setUnreadCount((data.data.notifications || []).filter((note) => !note.isRead).length);
    } catch (err) {
      addToast(err.response?.data?.message || 'Unable to load notifications.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, isAuthenticated]);

  useEffect(() => {
    fetchCount();
    const timer = setInterval(fetchCount, 60000);
    return () => clearInterval(timer);
  }, [fetchCount]);

  const handleClick = () => {
    if (!isAuthenticated) {
      addToast('Please sign in to view notifications.', 'warning');
      navigate('/login');
      return;
    }
    if (!open) {
      fetchNotifications();
    }
    setOpen((prev) => !prev);
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications((current) => current.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
      setUnreadCount((current) => Math.max(current - 1, 0));
    } catch (err) {
      addToast(err.response?.data?.message || 'Unable to mark notification as read.', 'error');
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="relative w-9 h-9 flex items-center justify-center text-gray-300 hover:text-gold-400 transition-colors rounded-lg hover:bg-white/5"
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-gold-400 text-black text-[9px] font-bold flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <NotificationDrawer
        open={open}
        onClose={() => setOpen(false)}
        notifications={notifications}
        loading={loading}
        onMarkRead={handleMarkRead}
        unreadCount={unreadCount}
      />
    </>
  );
}
