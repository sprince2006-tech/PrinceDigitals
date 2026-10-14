import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Shield,
  Layers,
} from 'lucide-react';

export const AdminLayout = ({ children, title, subtitle, actions }) => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navLinks = [
    {
      to: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: location.pathname === '/admin/dashboard',
    },
    {
      to: '/admin/collections',
      label: 'Collections',
      icon: FolderKanban,
      active: location.pathname.startsWith('/admin/collections') && location.pathname !== '/admin/collections/new',
    },
    {
      to: '/admin/collections/new',
      label: 'New Collection',
      icon: PlusCircle,
      active: location.pathname === '/admin/collections/new',
    },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] md:h-screen md:h-[100dvh] bg-neutral-50 flex flex-col md:flex-row md:overflow-hidden">
      {/* Mobile Top Header (Sticky at top on mobile) */}
      <header className="sticky top-0 md:hidden bg-white border-b border-neutral-200 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between flex-shrink-0 z-40">
        <Link to="/admin/dashboard" className="flex items-center gap-2 min-w-0" aria-label="Admin Dashboard">
          <img
            src="/PD_logo.png"
            alt="Prince Digital"
            className="h-6 sm:h-7 w-auto object-contain flex-shrink-0"
          />
          <span className="font-serif font-bold tracking-[0.08em] sm:tracking-[0.14em] text-[11px] sm:text-sm uppercase text-neutral-900 whitespace-nowrap">
            PRINCE DIGITAL
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 flex-shrink-0">
            Admin
          </span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Navigation (Fixed on desktop) */}
      <aside
        className={`fixed md:static top-0 left-0 z-50 md:z-30 h-full w-64 bg-white border-r border-neutral-200 flex flex-col flex-shrink-0 transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <img
              src="/PD_logo.png"
              alt="Prince Digital Logo"
              className="h-8 w-auto object-contain"
            />
            <div>
              <span className="block font-serif font-bold tracking-widest text-sm uppercase text-neutral-900">
                PRINCE DIGITAL
              </span>
              <span className="block text-[10px] tracking-wider uppercase text-neutral-400 font-semibold">
                Admin Console
              </span>
            </div>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-neutral-400 hover:text-neutral-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs uppercase tracking-wider font-semibold transition-all ${
                  item.active
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[1.8]" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-6 pb-2">
            <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Live Website
            </span>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs uppercase tracking-wider font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <span className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4 stroke-[1.8]" />
              <span>View Public Catalog</span>
            </span>
          </a>
        </nav>

        {/* Admin User & Logout */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-neutral-200 border border-neutral-300 flex items-center justify-center text-neutral-600">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-neutral-900 truncate">
                {admin?.email || admin?.username || 'Administrator'}
              </p>
              <p className="text-[10px] text-neutral-400 font-medium">Authorized Admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs uppercase tracking-widest font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200/60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile navigation drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Main Content Area: Natural page flow on mobile, scrollable container on desktop */}
      <main className="flex-1 flex flex-col min-w-0 md:h-full md:overflow-hidden">
        {/* Top bar with title and actions */}
        {(title || actions) && (
          <header className="bg-white border-b border-neutral-200/80 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 flex-shrink-0 z-10">
            <div className="min-w-0 flex-1">
              {title && <h1 className="text-lg sm:text-2xl font-bold text-neutral-900 tracking-tight truncate">{title}</h1>}
              {subtitle && <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 sm:mt-1 truncate">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2 self-start sm:self-center flex-shrink-0">{actions}</div>}
          </header>
        )}

        {/* Content Viewport: natural flow on mobile with safe-area bottom clearance, scrollable on desktop */}
        <div className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-28 sm:pb-16 md:pb-8 md:overflow-y-auto overscroll-contain min-h-0">
          <div className="max-w-6xl w-full mx-auto min-w-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
