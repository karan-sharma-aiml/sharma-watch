import React from 'react';

export default function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`animate-pulse rounded-[26px] border border-white/10 bg-dark-300 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] ${className}`}>
      <div className="mb-5 h-6 w-2/5 rounded-full bg-white/5" />
      {[...Array(lines)].map((_, index) => (
        <div key={index} className="mb-3 h-3 rounded-full bg-white/5 last:mb-0" />
      ))}
    </div>
  );
}
