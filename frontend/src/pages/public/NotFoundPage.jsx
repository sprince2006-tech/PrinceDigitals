import React from 'react';
import { Link } from 'react-router-dom';
import { PublicHeader } from '../../components/public/PublicHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { ArrowLeft } from 'lucide-react';
import { SEO } from '../../components/common/SEO';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEO
        title="Page Not Found | Prince Digital"
        description="The page you requested could not be found on Prince Digital."
        noindex={true}
      />
      <PublicHeader />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <img
          src="/PD_logo.png"
          alt="Prince Digital"
          className="h-16 w-auto object-contain mb-4"
        />
        <h1 className="text-4xl font-serif font-bold text-neutral-900 mb-2">404</h1>
        <h2 className="text-lg font-medium text-neutral-800 mb-2">Page Not Found</h2>
        <p className="text-xs text-neutral-500 mb-6">
          The link you followed may be broken or the page may have been removed.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-widest font-semibold bg-neutral-950 text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Catalog</span>
        </Link>
      </main>
      <PublicFooter />
    </div>
  );
};
