import React, { useState, useEffect } from 'react';
import { FiMail, FiChevronRight } from 'react-icons/fi';
import { contactAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState     from '../../components/EmptyState';
import Pagination     from '../../components/Pagination';

export default function AdminContacts() {
  const [contacts,   setContacts]   = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [selected,   setSelected]   = useState(null);

  useEffect(() => {
    setLoading(true);
    contactAPI.getAll({ page, limit: 20 })
      .then(({ data }) => {
        setContacts(data.data.contacts || []);
        setPagination(data.data.pagination || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white">Contact Messages</h1>
        <p className="text-gray-400 text-sm mt-1">{pagination.total || 0} messages received</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : contacts.length === 0 ? (
        <EmptyState icon={FiMail} title="No messages yet" description="Contact form submissions will appear here." />
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* List */}
          <div className="space-y-2">
            {contacts.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelected(c)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selected?._id === c._id
                    ? 'bg-gold-400/10 border-gold-400/30'
                    : 'bg-dark-300 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400 font-bold text-sm shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{c.name}</p>
                      <p className="text-gray-400 text-xs truncate">{c.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-gray-500 text-xs">{formatDate(c.createdAt)}</p>
                    <FiChevronRight className="text-gray-600" size={14} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:sticky lg:top-24">
            {selected ? (
              <div className="bg-dark-300 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/5">
                  <div className="w-12 h-12 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400 font-bold">
                    {selected.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{selected.name}</p>
                    <p className="text-gray-400 text-sm">{selected.email}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{formatDate(selected.createdAt)}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider">Subject</p>
                  <p className="text-white text-sm font-medium">{selected.subject}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">Message</p>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                  className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-medium rounded-xl hover:bg-gold-400/20 transition-colors"
                >
                  <FiMail size={15} /> Reply via Email
                </a>
              </div>
            ) : (
              <div className="bg-dark-300 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center min-h-48">
                <FiMail className="text-gray-600 mb-3" size={28} />
                <p className="text-gray-500 text-sm">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Pagination
        currentPage={pagination.currentPage || 1}
        totalPages={pagination.totalPages || 1}
        onPageChange={(pg) => { setPage(pg); window.scrollTo({ top: 0 }); }}
      />
    </div>
  );
}