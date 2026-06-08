import React from 'react';
import { MdStar } from 'react-icons/md';

export default function ReviewCard({ name, location, rating = 5, review, avatar }) {
  return (
    <div className="glass gold-border rounded-2xl p-6 hover:border-gold-400/40 transition-all duration-300 hover:-translate-y-1 card-shadow">
      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <MdStar
            key={i}
            size={16}
            className={i < rating ? 'text-gold-400' : 'text-gray-700'}
          />
        ))}
      </div>

      {/* Review Text */}
      <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">
        "{review}"
      </p>

      {/* Reviewer */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gold-500/20 border border-gold-400/30 flex items-center justify-center text-gold-400 font-bold text-sm shrink-0">
          {avatar || name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-white font-medium text-sm">{name}</p>
          <p className="text-gray-500 text-xs">{location}</p>
        </div>
      </div>
    </div>
  );
}