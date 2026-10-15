import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { PublicHeader } from '../../components/public/PublicHeader';
import { PublicFooter } from '../../components/public/PublicFooter';
import { ProductGrid } from '../../components/public/ProductGrid';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { SEO } from '../../components/common/SEO';

export const CollectionDetailPage = () => {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const fetchCollectionData = async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const res = await publicApi.getCollectionBySlug(slug);
      setCollection(res.data.collection);
      setProducts(res.data.products || []);
    } catch (err) {
      if (err.status === 404) {
        setNotFound(true);
      } else {
        setError(err.message || 'Unable to load collection details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectionData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <SEO
          title="Loading Collection... | Prince Digital"
          canonicalUrl={`https://princedigitals.vercel.app/collection/${slug}`}
        />
        <PublicHeader showBack={true} />
        <main className="flex-1 flex items-center justify-center">
          <LoadingState message="Loading collection..." />
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <SEO
          title="Collection Not Found | Prince Digital"
          description="The collection you are looking for does not exist or may currently be unpublished."
          noindex={true}
        />
        <PublicHeader showBack={true} />
        <main className="flex-1 max-w-md w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4 border border-neutral-200">
            <ShoppingBag className="w-7 h-7 stroke-[1.4]" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 font-serif">Collection Not Found</h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2 mb-6">
            The collection you are looking for does not exist or may currently be unpublished.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-widest font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Browse All Collections</span>
          </Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <SEO
          title="Collection | Prince Digital"
          noindex={true}
        />
        <PublicHeader showBack={true} />
        <main className="flex-1 flex items-center justify-center px-4">
          <ErrorState
            title="Unable to load collection"
            message={error}
            onRetry={fetchCollectionData}
          />
        </main>
        <PublicFooter />
      </div>
    );
  }

  const collectionTitle = collection?.title
    ? `${collection.title} | Prince Digital`
    : 'Prince Digital Collection';
  const collectionDesc = collection?.description?.trim()
    ? collection.description.trim()
    : `Explore handpicked products and curated looks in the ${collection?.title || 'featured'} collection at Prince Digital.`;
  const canonicalUrl = `https://princedigitals.vercel.app/collection/${collection?.slug || slug}`;
  const ogImage = collection?.coverImageUrl || 'https://princedigitals.vercel.app/PD_logo.png';

  const collectionStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://princedigitals.vercel.app/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: collection?.title || 'Collection',
            item: canonicalUrl,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: collectionTitle,
        description: collectionDesc,
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://princedigitals.vercel.app/#website',
          url: 'https://princedigitals.vercel.app/',
          name: 'Prince Digital',
        },
        inLanguage: 'en',
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEO
        title={collectionTitle}
        description={collectionDesc}
        canonicalUrl={canonicalUrl}
        ogImage={ogImage}
        ogImageAlt={collection?.title || 'Collection'}
        structuredData={collectionStructuredData}
      />
      <PublicHeader showBack={true} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Compact luxury collection header */}
        <div className="mb-6 sm:mb-10 text-center max-w-xl mx-auto px-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-950 font-serif">
            {collection?.title}
          </h1>

          {collection?.description && (
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 font-normal leading-relaxed">
              {collection.description}
            </p>
          )}

          <div className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold text-neutral-400 tracking-widest uppercase">
            <span>{products.length} {products.length === 1 ? 'Product' : 'Products'} Available</span>
          </div>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="Products in this collection will be updated soon."
            actionLabel="Back to Collections"
            onAction={() => window.history.back()}
          />
        ) : (
          <ProductGrid products={products} itemsPerPage={16} />
        )}
      </main>

      <PublicFooter />
    </div>
  );
};
