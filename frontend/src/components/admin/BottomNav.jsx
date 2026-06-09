import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav({ items }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="flex items-center justify-between gap-2 px-4 py-3 bg-dark-400/95 border-t border-white/10 backdrop-blur-md lg:hidden">
      {items.map(({ to, label, icon: Icon }) => {
        const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
        return (
          <button
            key={to}
            type="button"
            onClick={() => navigate(to)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-3xl border px-3 py-2 text-[11px] font-semibold transition-all duration-200 ${active ? 'border-gold-400 bg-gold-500/10 text-gold-300' : 'border-white/10 text-gray-300 hover:border-white/20 hover:text-white hover:bg-white/5'}`}
          >
            <Icon size={18} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
