import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end   = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  const btnBase = `
    flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium
    transition-all duration-200 border
  `;
  const activeCls  = 'bg-gold-400 text-black border-gold-400';
  const inactiveCls = 'text-gray-400 border-white/10 hover:border-gold-400/40 hover:text-white bg-dark-400';
  const disabledCls = 'text-gray-600 border-white/5 cursor-not-allowed bg-dark-400';

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} ${currentPage === 1 ? disabledCls : inactiveCls}`}
      >
        <FiChevronLeft size={16} />
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={`${btnBase} ${inactiveCls}`}>1</button>
          {start > 2 && <span className="text-gray-600 text-sm px-1">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`${btnBase} ${p === currentPage ? activeCls : inactiveCls}`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-gray-600 text-sm px-1">…</span>}
          <button onClick={() => onPageChange(totalPages)} className={`${btnBase} ${inactiveCls}`}>
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} ${currentPage === totalPages ? disabledCls : inactiveCls}`}
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
}