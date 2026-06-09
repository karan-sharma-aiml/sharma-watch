import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FiSearch, FiShoppingCart, FiHeart, FiUser,
  FiMenu, FiX, FiLogOut, FiSettings, FiPackage,
} from 'react-icons/fi';
import { useAuth }     from '../context/AuthContext';
import { useCart }     from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const navigate  = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { cartCount, toggleCart }   = useCart();
  const { wishlistCount }           = useWishlist();

  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userMenuRef = useRef(null);
  const searchRef   = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/',         label: 'Home'     },
    { to: '/products', label: 'Products' },
    { to: '/contact',  label: 'Contact'  },
  ];

  const linkCls = ({ isActive }) => `
    text-sm font-medium transition-colors duration-200
    ${isActive ? 'text-gold-400' : 'text-gray-300 hover:text-white'}
  `;

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-30 transition-all duration-300
        ${scrolled
          ? 'bg-dark-400/95 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/30'
          : 'bg-transparent'}
      `}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <div className="flex flex-col leading-none">
              <span className="font-serif text-xl md:text-2xl font-bold text-gradient-gold tracking-wider group-hover:opacity-90 transition-opacity">
                SHARMA
              </span>
              <span className="text-[8px] md:text-[9px] tracking-[0.3em] text-gray-400 uppercase font-medium -mt-0.5">
                Watch Store
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} className={linkCls}>
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className={linkCls}>
                Admin
              </NavLink>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen((p) => !p)}
                className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-gold-400 transition-colors rounded-lg hover:bg-white/5"
              >
                <FiSearch size={18} />
              </button>
              {searchOpen && (
                <form
                  onSubmit={handleSearch}
                  className="absolute right-0 top-full mt-2 bg-dark-300 border border-white/10 rounded-xl shadow-xl shadow-black/30 overflow-hidden animate-fade-in"
                >
                  <div className="flex items-center px-3 py-2 gap-2">
                    <FiSearch className="text-gray-500 shrink-0" size={16} />
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search watches…"
                      className="w-56 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
                    />
                    <button type="submit" className="text-xs text-gold-400 font-medium hover:text-gold-300 shrink-0">
                      Go
                    </button>
                  </div>
                </form>
              )}
            </div>

            <NotificationBell />

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative w-9 h-9 flex items-center justify-center text-gray-300 hover:text-gold-400 transition-colors rounded-lg hover:bg-white/5"
            >
              <FiHeart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-400 text-black text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative w-9 h-9 flex items-center justify-center text-gray-300 hover:text-gold-400 transition-colors rounded-lg hover:bg-white/5"
            >
              <FiShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-400 text-black text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen((p) => !p)}
                  className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-400/30 flex items-center justify-center text-gold-400 font-bold text-sm hover:bg-gold-500/30 transition-colors"
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-dark-300 border border-white/10 rounded-xl shadow-xl shadow-black/40 overflow-hidden animate-fade-in z-50">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                      <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                    </div>
                    <div className="py-1.5">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-colors"
                      >
                        <FiUser size={14} /> My Profile
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-colors"
                      >
                        <FiPackage size={14} /> My Orders
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-gold-400 hover:text-gold-300 hover:bg-gold-400/5 text-sm transition-colors"
                        >
                          <FiSettings size={14} /> Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-white/5 py-1.5">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/5 text-sm transition-colors"
                      >
                        <FiLogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-medium rounded-lg hover:bg-gold-400 hover:text-black hover:border-gold-400 transition-all duration-200"
              >
                <FiUser size={14} />
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="md:hidden w-9 h-9 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
            >
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 bg-dark-400/95 backdrop-blur-xl animate-fade-in-up">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive ? 'bg-gold-400/10 text-gold-400' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                  `}
                >
                  {label}
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gold-400 hover:bg-gold-400/10 transition-colors"
                >
                  Admin Panel
                </NavLink>
              )}
            </div>

            <div className="px-4 pb-4 border-t border-white/5 pt-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-400/30 flex items-center justify-center text-gold-400 font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{user?.name}</p>
                      <p className="text-gray-500 text-xs">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
                  >
                    <FiLogOut size={14} /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2.5 bg-gold-400 text-black text-sm font-bold rounded-lg hover:bg-gold-300 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2.5 border border-gold-400/30 text-gold-400 text-sm font-medium rounded-lg hover:bg-gold-400/10 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}