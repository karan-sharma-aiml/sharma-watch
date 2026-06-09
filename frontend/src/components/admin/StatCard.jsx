import React from 'react';
import { Link } from 'react-router-dom';

export default function StatCard({ icon: Icon, label, value, delta, to, accent = 'from-gold-400/15 via-white/5 to-black', children }) {
  const Card = to ? Link : 'div';

  return (
    <Card
      to={to}
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-dark-300 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/30 hover:bg-white/5"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r from-gold-400/15 via-white/5 to-transparent blur-2xl opacity-80" />
      <div className="relative flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br ${accent} text-gold-300 shadow-[0_20px_70px_rgba(212,175,55,0.06)]`}> 
          {Icon && <Icon size={22} />}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-serif font-bold text-white">{value}</p>
        </div>
      </div>
      {delta && (
        <span className="mt-4 inline-flex rounded-full border border-gold-400/20 bg-gold-400/10 px-3 py-1 text-xs font-semibold text-gold-300">
          {delta}
        </span>
      )}
      {children && <div className="mt-5 text-sm text-gray-400">{children}</div>}
    </Card>
  );
}
