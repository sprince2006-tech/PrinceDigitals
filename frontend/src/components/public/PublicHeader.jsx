import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Shield, User, LogOut, UserPlus, LogIn } from 'lucide-react';

export const PublicHeader = ({ showBack = false, backUrl = '/' }) => {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 transition-all">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Left Slot: Back Button or Catalog Navigation */}
        <div className="w-24 sm:w-44 flex items-center justify-start flex-shrink-0">
          {showBack ? (
            <Link
              to={backUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-950 uppercase tracking-wider transition-colors py-1.5 px-2 -ml-2 rounded-lg hover:bg-neutral-100/80 group"
              aria-label="Back to collections"
            >
              <ArrowLeft className="w-4 h-4 flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Collections</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest font-semibold text-neutral-500 hover:text-neutral-950 transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-neutral-100/60"
            >
              <span>Catalog</span>
            </Link>
          )}
        </div>

        {/* Center Slot: Brand Lockup (Always Centered) */}
        <div className="flex-1 flex items-center justify-center min-w-0 px-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 sm:gap-2.5 group select-none transition-opacity hover:opacity-85"
            aria-label="Prince Digital Home"
          >
            <img
              src="/PD_logo.png"
              alt="Prince Digital Logo"
              className="h-6 sm:h-7 md:h-8 w-auto object-contain flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
            />
            <span className="font-serif font-bold text-xs sm:text-base md:text-lg tracking-[0.12em] sm:tracking-[0.18em] text-neutral-950 uppercase whitespace-nowrap">
              PRINCE DIGITAL
            </span>
          </Link>
        </div>

        {/* Right Slot: Auth Navigation (Sign Up / Sign In / Account / Logout) */}
        <div className="w-24 sm:w-44 flex items-center justify-end gap-1.5 sm:gap-2 flex-shrink-0">
          {!isAuthenticated ? (
            <>
              {/* Unobtrusive Sign In Link */}
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center text-[11px] uppercase tracking-wider font-semibold text-neutral-600 hover:text-neutral-950 py-1.5 px-2 rounded-lg hover:bg-neutral-100/80 transition-colors"
              >
                Sign In
              </Link>

              {/* Visible but clean Sign Up Button */}
              <Link
                to="/login?mode=signup"
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-[11px] uppercase tracking-wider font-semibold hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5 sm:hidden" />
                <span>Sign Up</span>
              </Link>
            </>
          ) : (
            <>
              {/* Authenticated user: Admin or Normal User */}
              {isAdmin ? (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-neutral-950 font-semibold text-[11px] uppercase tracking-wider py-1.5 px-2 rounded-lg hover:bg-neutral-100/80 transition-colors"
                  title="Admin Dashboard"
                >
                  <Shield className="w-3.5 h-3.5 text-neutral-800" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              ) : (
                <Link
                  to="/user/dashboard"
                  className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-neutral-950 font-semibold text-[11px] uppercase tracking-wider py-1.5 px-2 rounded-lg hover:bg-neutral-100/80 transition-colors"
                  title="Customer Account"
                >
                  <User className="w-3.5 h-3.5 text-neutral-700" />
                  <span className="hidden sm:inline truncate max-w-[80px]">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                </Link>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
