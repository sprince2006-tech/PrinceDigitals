import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Image as ImageIcon } from 'lucide-react';

export const CollectionCard = ({ collection }) => {
  const [imageError, setImageError] = useState(false);
  const { title, slug, description, coverImageUrl, productCount = 0 } = collection;

  return (
    <Link
      to={`/collection/${slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-neutral-200/80 hover:border-neutral-400 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
    >
      {/* Cover Image Container with 4:5 fashion aspect ratio */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
        {!imageError && coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-50 p-4">
            <img
              src="/PD_logo.png"
              alt="Prince Digital"
              className="w-10 h-10 object-contain opacity-50 grayscale hover:grayscale-0 transition-all"
            />
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 mt-2 font-medium">
              Prince Digital
            </span>
          </div>
        )}

        {/* Subtle count badge */}
        {typeof productCount === 'number' && (
          <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow-sm tracking-wide">
            {productCount} {productCount === 1 ? 'item' : 'items'}
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="p-4 sm:p-5 flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight group-hover:text-black truncate">
            {title}
          </h2>
          {description && (
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 line-clamp-1 font-normal">
              {description}
            </p>
          )}
        </div>

        <div className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-200/60 flex items-center justify-center text-neutral-400 group-hover:text-neutral-900 group-hover:bg-neutral-100 transition-colors flex-shrink-0">
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
};
