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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Left Side: Brand Element (Logo + Brand Name, with optional Back button on detail pages) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {showBack && (
            <Link
              to={backUrl}
              className="inline-flex items-center justify-center p-1.5 -ml-1 text-neutral-600 hover:text-neutral-950 rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0"
              aria-label="Back to collections"
              title="Back to collections"
            >
              <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </Link>
          )}

          <Link
            to="/"
            className="inline-flex items-center gap-2 sm:gap-2.5 group select-none transition-opacity hover:opacity-85 min-w-0"
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

        {/* Right Side: Auth Navigation (Sign Up / Sign In / Account / Logout) */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-shrink-0">
          {!isAuthenticated ? (
            <>
              {/* Unobtrusive Sign In Link */}
              <Link
                to="/login"
                className="inline-flex items-center text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-neutral-600 hover:text-neutral-950 py-1.5 px-2 rounded-lg hover:bg-neutral-100/80 transition-colors"
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
