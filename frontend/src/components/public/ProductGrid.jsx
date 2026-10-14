import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { ChevronDown } from 'lucide-react';

export const ProductGrid = ({ products = [], itemsPerPage = 12 }) => {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + itemsPerPage);
  };

  return (
    <div className="space-y-8">
      {/* 2 columns on mobile, 3 on tablet, 4 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {visibleProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Load More trigger */}
      {hasMore && (
        <div className="flex justify-center pt-4 pb-2">
          <button
            onClick={handleLoadMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs uppercase tracking-widest font-semibold border border-neutral-300 rounded-full text-neutral-800 bg-white hover:bg-neutral-50 active:scale-95 transition-all shadow-sm"
          >
            <span>Load More ({products.length - visibleCount} remaining)</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
