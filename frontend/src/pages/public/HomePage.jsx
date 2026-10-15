import React, { useEffect, useState, useMemo } from 'react';
import { publicApi } from '../../services/api';
import { PublicHeader } from '../../components/public/PublicHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { CollectionCard } from '../../components/public/CollectionCard';
import { SearchBar } from '../../components/public/SearchBar';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ShoppingBag, Search } from 'lucide-react';
import { SEO } from '../../components/common/SEO';

const HOMEPAGE_STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://princedigitals.vercel.app/#website',
      url: 'https://princedigitals.vercel.app/',
      name: 'Prince Digital',
      description:
        "Discover curated fashion, men's formal wear, streetwear, gym essentials, and handpicked product collections at Prince Digital.",
      inLanguage: 'en',
      publisher: {
        '@id': 'https://princedigitals.vercel.app/#organization',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://princedigitals.vercel.app/#organization',
      name: 'Prince Digital',
      url: 'https://princedigitals.vercel.app/',
      logo: {
        '@type': 'ImageObject',
        '@id': 'https://princedigitals.vercel.app/#logo',
        url: 'https://princedigitals.vercel.app/PD_logo.png',
        caption: 'Prince Digital',
      },
      image: {
        '@id': 'https://princedigitals.vercel.app/#logo',
      },
    },
  ],
};

export const HomePage = () => {
  const [collections, setCollections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await publicApi.getCollections();
      setCollections(res.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // Real-time instant collection search filtering (recently published first)
  const filteredCollections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = !q
      ? collections
      : collections.filter((c) => {
          const matchTitle = c.title && c.title.toLowerCase().includes(q);
          const matchDesc = c.description && c.description.toLowerCase().includes(q);
          const matchSlug = c.slug && c.slug.toLowerCase().includes(q);
          return matchTitle || matchDesc || matchSlug;
        });

    return [...list].sort((a, b) => {
      const timeA = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [collections, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEO
        title="Prince Digital | Curated Fashion & Product Collections"
        description="Discover curated fashion, men's formal wear, streetwear, gym essentials, and handpicked product collections at Prince Digital."
        canonicalUrl="https://princedigitals.vercel.app/"
        structuredData={HOMEPAGE_STRUCTURED_DATA}
      />
      <PublicHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-12">
        {/* Brand Hero */}
        <section className="text-center max-w-xl mx-auto mb-6 sm:mb-8 px-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 font-serif">
            Discover Products.
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-neutral-500 mt-1.5 font-serif italic">
            Shop your favourites.
          </p>
        </section>

        {/* Real-time Collections Search Bar */}
        {!loading && !error && collections.length > 0 && (
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search collections (e.g. formals, casuals)..."
            totalResults={filteredCollections.length}
          />
        )}

        {/* Collections Catalog Content */}
        {loading ? (
          <LoadingState message="Loading collections..." />
        ) : error ? (
          <ErrorState
            title="Unable to load catalog"
            message={error}
            onRetry={fetchCollections}
          />
        ) : collections.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No collections available yet"
            description="We are currently updating our seasonal collections. Please check back shortly!"
          />
        ) : filteredCollections.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No collections found"
            description={`No collections matching "${searchQuery}". Try searching for something else.`}
            actionLabel="Clear Search"
            onAction={() => setSearchQuery('')}
          />
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {filteredCollections.map((collection) => (
              <CollectionCard key={collection._id} collection={collection} />
            ))}
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};
