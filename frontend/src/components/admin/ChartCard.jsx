import React from 'react';

export default function ChartCard({ title, value, detail, children }) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-dark-300 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/30">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-gold-400/15 via-white/5 to-transparent blur-2xl opacity-80" />
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{title}</p>
            <p className="mt-3 text-3xl font-serif font-bold text-white">{value}</p>
          </div>
          {detail && <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-gray-300">{detail}</div>}
        </div>
        {children && <div className="mt-6 min-h-[170px]">{children}</div>}
      </div>
    </div>
  );
}
