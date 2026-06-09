import React from 'react';
import { FiX, FiCheckCircle } from 'react-icons/fi';

export default function NotificationDrawer({ open, onClose, notifications, loading, onMarkRead, unreadCount }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full lg:max-w-lg bg-dark-400 border-l border-white/10 shadow-2xl shadow-black/70 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '100vh',
          transform: 'translateX(0)',
          transition: 'transform 0.25s ease',
        }}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-[0.24em]">Notifications</p>
            <h2 className="text-xl font-semibold text-white">Your updates</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-sm text-gray-300">Unread</p>
          <p className="text-2xl font-semibold text-gold-400">{unreadCount || 0}</p>
        </div>

        <div className="px-5 py-4 space-y-4">
          {loading ? (
            <div className="text-gray-400 text-sm">Loading notifications…</div>
          ) : notifications.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-dark-300 p-6 text-center text-gray-400">
              No notifications yet. New product updates will appear here.
            </div>
          ) : (
            notifications.map((note) => (
              <div key={note.id} className="rounded-3xl border border-white/10 bg-dark-300 overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
                {note.image && (
                  <div className="h-44 overflow-hidden">
                    <img src={note.image} alt={note.title} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-base font-semibold text-white">{note.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                    </div>
                    {!note.isRead && (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] bg-gold-400/15 text-gold-300 px-2.5 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-6 text-gray-300 mb-4">{note.message}</p>
                  <button
                    onClick={() => onMarkRead(note.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                    disabled={note.isRead}
                  >
                    <FiCheckCircle size={16} />
                    {note.isRead ? 'Read' : 'Mark as read'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
