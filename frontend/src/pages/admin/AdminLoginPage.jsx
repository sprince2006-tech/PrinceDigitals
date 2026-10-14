import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import { Shield, Lock, User, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export const AdminLoginPage = () => {
  const { isAuthenticated, loginWithPassword, authConfig, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check URL parameters for errors (e.g. from Google OAuth rejection)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const err = params.get('error');
    if (err) {
      setErrorMessage(decodeURIComponent(err));
    }
  }, [location.search]);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const result = await loginWithPassword(username, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      setErrorMessage(result.error);
    }
  };

  const handleGoogleLogin = () => {
    // Initiate server-side Google OAuth 2.0 flow
    window.location.href = authApi.getGoogleAuthUrl();
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Return to website link */}
      <div className="mb-4 sm:mb-0 sm:absolute sm:top-6 sm:left-6 max-w-md mx-auto sm:max-w-none w-full sm:w-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-900 font-semibold transition-colors py-1 px-2 rounded-md hover:bg-neutral-200/50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon & Heading */}
        <div className="text-center">
          <img
            src="/PD_logo.png"
            alt="Prince Digital Logo"
            className="h-14 w-auto object-contain mx-auto mb-2"
          />
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900 font-serif uppercase">
            PRINCE DIGITAL
          </h2>
          <p className="mt-1 text-xs uppercase tracking-widest text-neutral-500 font-medium">
            Administrator Portal
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-6 shadow-xl rounded-2xl border border-neutral-200/80 sm:px-10">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Option A: Google OAuth Button */}
          {authConfig?.googleAuthEnabled !== false && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-neutral-300 rounded-xl shadow-xs bg-white text-xs uppercase tracking-wider font-semibold text-neutral-700 hover:bg-neutral-50 active:scale-[0.99] transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-neutral-400 font-semibold tracking-wider">
                    Or password login
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Option B: Admin Username & Password Form */}
          {authConfig?.passwordAuthEnabled !== false ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Admin Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username or email"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-neutral-950 text-white text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 active:scale-[0.99] transition-all disabled:opacity-50 shadow-sm mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          ) : (
            <p className="text-center text-xs text-neutral-500 py-2">
              Password login is disabled. Please authenticate with your authorized Google administrator account.
            </p>
          )}

          {/* Security notice */}
          <div className="mt-8 pt-5 border-t border-neutral-100 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Designated administrator access only</span>
          </div>
        </div>
      </div>
    </div>
  );
};
