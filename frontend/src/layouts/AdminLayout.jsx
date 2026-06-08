import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  RiDashboardLine, RiProductHuntLine, RiLogoutCircleLine,
} from 'react-icons/ri';
import { BiCategory, BiPackage, BiMessageDetail } from 'react-icons/bi';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin',            label: 'Dashboard',  icon: RiDashboardLine },
  { to: '/admin/products',   label: 'Products',   icon: RiProductHuntLine },
  { to: '/admin/categories', label: 'Categories', icon: BiCategory },
  { to: '/admin/orders',     label: 'Orders',     icon: BiPackage },
  { to: '/admin/contacts',   label: 'Contacts',   icon: BiMessageDetail },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [open, setOpen]  = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = ({ mobile = false }) => (
    <aside className={`
      ${mobile ? 'flex' : 'hidden lg:flex'}
      flex-col h-full bg-dark-400 border-r border-white/5
      ${mobile ? 'w-full pt-4' : 'w-64'}
    `}>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <h1 className="font-serif text-xl text-gold-400 font-bold tracking-wide">
          SHARMA
        </h1>
        <p className="text-xs text-gray-500 mt-0.5 tracking-widest uppercase">
          Admin Panel
        </p>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-400/30 flex items-center justify-center text-gold-400 font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            onClick={() => setOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-200
              ${isActive
                ? 'bg-gold-500/15 text-gold-400 border border-gold-400/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200"
        >
          <RiLogoutCircleLine size={18} />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-dark-500 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-64 h-full flex flex-col animate-slide-in-left">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-dark-400/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <FiMenu size={22} />
          </button>
          <h2 className="text-white font-medium text-sm lg:text-base">
            Admin Dashboard
          </h2>
          <span className="text-xs text-gold-400 font-medium border border-gold-400/20 bg-gold-400/10 px-2 py-1 rounded-full">
            Admin
          </span>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}