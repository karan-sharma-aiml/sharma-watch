import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-500 flex items-center justify-center px-4">
      <div className="text-center animate-fade-in-up">
        <p className="font-serif text-8xl font-bold text-gradient-gold mb-4">404</p>
        <h1 className="font-serif text-3xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold-400 text-black text-sm font-bold rounded-xl hover:bg-gold-300 transition-colors"
        >
          <FiArrowLeft size={15} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}