import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  RiDashboardLine, RiProductHuntLine, RiLogoutCircleLine,
} from 'react-icons/ri';
import { BiBell, BiCategory, BiPackage, BiMessageDetail } from 'react-icons/bi';
import { FiMenu, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/admin/BottomNav';

const navItems = [
    { to: '/admin',            label: 'Dashboard',     icon: RiDashboardLine },
    { to: '/admin/products',   label: 'Products',      icon: RiProductHuntLine },
    { to: '/admin/categories', label: 'Categories',    icon: BiCategory },
    { to: '/admin/notifications', label: 'Notifications', icon: BiBell },
    { to: '/admin/orders',     label: 'Orders',        icon: BiPackage },
    { to: '/admin/contacts',   label: 'Contacts',      icon: BiMessageDetail },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [open, setOpen]  = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = ({ mobile = false }) => {
    const collapsedDesktop = !mobile && collapsed;
    return (
      <aside className={`
        ${mobile ? 'flex' : 'hidden lg:flex'}
        flex-col h-full bg-dark-400 border-r border-white/5
        ${mobile ? 'w-full pt-4' : collapsedDesktop ? 'w-24' : 'w-72'}
      `}>
      {/* Logo */}
      <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-gold-400/10 border border-gold-400/20 text-gold-300 font-bold text-lg">
            S
          </div>
          {!collapsedDesktop && (
            <div>
              <h1 className="font-serif text-xl text-gold-400 font-bold tracking-wide">SHARMA</h1>
              <p className="text-xs text-gray-500 mt-0.5 tracking-widest uppercase">Admin Panel</p>
            </div>
          )}
        </div>
        {!mobile && (
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-3xl border border-white/10 bg-dark-500 text-gray-300 transition-colors hover:border-gold-400 hover:text-gold-300"
          >
            {collapsedDesktop ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
          </button>
        )}
      </div>

      {!collapsedDesktop && (
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
      )}

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            onClick={() => setOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-3 ${collapsedDesktop ? 'justify-center' : ''} px-4 py-3 rounded-2xl text-sm font-medium
              transition-all duration-200
              ${isActive
                ? 'bg-gold-500/15 text-gold-400 border border-gold-400/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <Icon size={20} />
            {!collapsedDesktop && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`px-3 py-4 border-t border-white/5 ${collapsedDesktop ? 'hidden' : ''}`}>
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
};

  const sidebarWidthClass = collapsed ? 'lg:w-24' : 'lg:w-72';
  const contentOffsetClass = collapsed ? 'lg:ml-24' : 'lg:ml-72';

  return (
    <div className="min-h-screen bg-dark-500 flex">
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex ${sidebarWidthClass} lg:flex-col lg:fixed lg:inset-y-0`}>
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
      <div className={`flex-1 ${contentOffsetClass} flex flex-col min-h-screen`}>
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
        <main className="flex-1 p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>

        {/* Mobile bottom navigation */}
        <BottomNav items={navItems} />
      </div>
    </div>
  );
}