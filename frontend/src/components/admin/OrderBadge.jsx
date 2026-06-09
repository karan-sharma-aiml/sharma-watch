import React from 'react';

const statuses = {
  Pending:   'bg-[#252525] text-[#fbbf24] border border-[#fbbf24]/20',
  Confirmed: 'bg-[#111111] text-[#60a5fa] border border-[#60a5fa]/20',
  Processing:'bg-[#111111] text-[#38bdf8] border border-[#38bdf8]/20',
  Shipped:   'bg-[#111111] text-[#f97316] border border-[#f97316]/20',
  Delivered: 'bg-[#111111] text-[#22c55e] border border-[#22c55e]/20',
  Cancelled: 'bg-[#111111] text-[#f87171] border border-[#f87171]/20',
};

export default function OrderBadge({ status }) {
  const normalized = (status || '').toString();
  const classes = statuses[normalized] || 'bg-[#111111] text-[#9ca3af] border border-[#9ca3af]/20';
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${classes}`}>
      {normalized}
    </span>
  );
}
