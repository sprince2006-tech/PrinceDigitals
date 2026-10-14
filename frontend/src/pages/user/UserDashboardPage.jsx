import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PublicHeader } from '../../components/public/PublicHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import {
  Sparkles,
  ShoppingBag,
  User,
  Mail,
  ShieldCheck,
  LogOut,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const UserDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden mb-8">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-neutral-200 text-[11px] font-semibold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Customer Account</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight font-serif">
              Welcome back, {user?.name || 'Shopper'}!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
              Explore our verified fashion collections, seasonal lookbooks, and curated product links.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-neutral-950 text-xs uppercase tracking-widest font-semibold hover:bg-neutral-100 active:scale-[0.98] transition-all shadow-sm"
              >
                <ShoppingBag className="w-4 h-4 text-neutral-950" />
                <span>Explore Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-widest font-semibold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Account Details & Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-2 bg-neutral-50/80 rounded-2xl border border-neutral-200/80 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-neutral-500" />
              <span>Account Information</span>
            </h2>

            <div className="space-y-4 divide-y divide-neutral-200/60">
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Name</span>
                <span className="font-semibold text-neutral-900">{user?.name || 'Customer'}</span>
              </div>

              <div className="pt-3 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Email Address</span>
                <span className="font-semibold text-neutral-900 font-mono">{user?.email || '—'}</span>
              </div>

              <div className="pt-3 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Account Type</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                  <ShieldCheck className="w-3 h-3" />
                  Verified User
                </span>
              </div>
            </div>
          </div>

          {/* Quick Help / About */}
          <div className="bg-neutral-50/80 rounded-2xl border border-neutral-200/80 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 mb-2">
                Need Help?
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Have questions about outfit links, product availability, or your account? Feel free to reach out.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-200/60">
              <p className="text-[11px] font-mono text-neutral-500">
                Support: helloprincedigitals@gmail.com
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
