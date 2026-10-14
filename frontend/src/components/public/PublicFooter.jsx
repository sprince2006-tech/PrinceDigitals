import React from 'react';
import { Link } from 'react-router-dom';

export const PublicFooter = () => {
  return (
    <footer className="mt-auto border-t border-neutral-100 bg-neutral-50/50 py-8 sm:py-10 px-4">
      <div className="max-w-6xl mx-auto px-0 sm:px-2 lg:px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <img
              src="/PD_logo.png"
              alt="Prince Digital"
              className="h-5 w-auto object-contain"
            />
            <p className="text-xs uppercase tracking-widest font-serif font-bold text-neutral-800">
              PRINCE DIGITAL
            </p>
          </div>
          <p className="text-xs text-neutral-500">
            Curated product links & fashion collections.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <span>&copy; {new Date().getFullYear()} Prince Digital</span>
          <span>&bull;</span>
          <Link
            to="/login"
            className="hover:text-neutral-700 transition-colors underline-offset-4 hover:underline"
          >
            Account & Portal
          </Link>
        </div>
      </div>
    </footer>
  );
};
