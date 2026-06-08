import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

export default function CategoryCard({ category, gradient, icon: Icon }) {
  return (
    <Link
      to={`/products?category=${category._id}`}
      className="group relative overflow-hidden rounded-2xl card-shadow border border-white/5 hover:border-gold-400/30 transition-all duration-300"
    >
      {/* Background */}
      <div className={`${gradient || 'bg-dark-300'} absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Gold shimmer overlay on hover */}
      <div className="absolute inset-0 bg-gold-500/0 group-hover:bg-gold-500/5 transition-colors duration-300" />

      {/* Content */}
      <div className="relative px-6 py-8 flex flex-col gap-3">
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center mb-1 group-hover:bg-gold-400/20 transition-colors">
            <Icon className="text-gold-400" size={22} />
          </div>
        )}
        <div>
          <h3 className="font-serif text-lg font-semibold text-white group-hover:text-gold-300 transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-gray-500 text-xs mt-1 leading-relaxed line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-gold-400 text-xs font-medium mt-1 group-hover:gap-3 transition-all duration-300">
          <span>Explore</span>
          <FiArrowRight size={12} />
        </div>
      </div>
    </Link>
  );
}