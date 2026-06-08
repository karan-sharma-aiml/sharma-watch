import React from 'react';

export default function LoadingSpinner({ fullScreen = false, size = 'md', text = '' }) {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const borderMap = {
    sm: 'border-2', md: 'border-2', lg: 'border-[3px]',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`
          ${sizeMap[size] || sizeMap.md}
          ${borderMap[size] || borderMap.md}
          rounded-full border-white/10 border-t-gold-400
          animate-spin
        `}
      />
      {text && <p className="text-sm text-gray-400">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-500 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16 w-full">
      {spinner}
    </div>
  );
}