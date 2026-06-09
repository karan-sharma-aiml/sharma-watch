import React from 'react';
import { Link } from 'react-router-dom';

export default function SectionHeader({ title, description, actionLabel, actionTo, actionOnClick, icon }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="flex items-center gap-3">
          {icon && <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gold-400/10 text-gold-300 shadow-[0_12px_40px_rgba(212,175,55,0.12)]">{React.createElement(icon, { size: 18 })}</span>}
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">{title}</h2>
            {description && <p className="mt-1 text-sm text-gray-400 max-w-2xl">{description}</p>}
          </div>
        </div>
      </div>
      {actionLabel && (
        actionTo ? (
          <Link
            to={actionTo}
            className="inline-flex items-center justify-center rounded-2xl bg-gold-400 px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-gold-300"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            type="button"
            onClick={actionOnClick}
            className="inline-flex items-center justify-center rounded-2xl bg-gold-400 px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-gold-300"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
