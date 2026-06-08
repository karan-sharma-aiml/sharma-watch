import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center mb-6">
          <Icon className="text-gold-400" size={28} />
        </div>
      )}
      <h3 className="font-serif text-xl font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 text-sm max-w-xs mb-8 leading-relaxed">{description}</p>
      )}
      {actionLabel && (
        actionTo ? (
          <Link
            to={actionTo}
            className="px-6 py-2.5 bg-gold-400 text-black text-sm font-semibold rounded-lg hover:bg-gold-300 transition-colors"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="px-6 py-2.5 bg-gold-400 text-black text-sm font-semibold rounded-lg hover:bg-gold-300 transition-colors"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}