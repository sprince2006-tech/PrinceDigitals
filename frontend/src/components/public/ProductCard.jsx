import React, { useState } from 'react';
import { ExternalLink, Image as ImageIcon } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const { title, description, imageUrl, productUrl } = product;

  // Validate URL protocol safety
  const isValidUrl = Boolean(
    productUrl &&
    (productUrl.startsWith('http://') || productUrl.startsWith('https://'))
  );

  const handleCardClick = (e) => {
    if (!isValidUrl) return;
    // If clicked anywhere inside the card (except the button which handles its own click), open link
    if (e.target.closest('a')) return;
    window.open(productUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group bg-white rounded-xl overflow-hidden border border-neutral-200/90 hover:border-neutral-400 transition-all duration-300 flex flex-col h-full shadow-sm hover:shadow-md ${
        isValidUrl ? 'cursor-pointer' : ''
      }`}
    >
      {/* Product Image: 4:5 fashion aspect ratio */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
        {!imageError && imageUrl ? (
          <img
            src={imageUrl}
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
      </div>

      {/* Product Information */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-grow justify-between">
        <div className="mb-2 sm:mb-3">
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 tracking-tight line-clamp-2 group-hover:text-black">
            {title}
          </h3>
          {description && (
            <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 sm:mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div>
          {isValidUrl ? (
            <a
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2.5 sm:px-3 text-[11px] sm:text-xs uppercase tracking-wider font-semibold rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 active:scale-[0.98] transition-all duration-150 shadow-xs"
              aria-label={`Open ${title}`}
            >
              <span>Open</span>
              <ExternalLink className="w-3 h-3 stroke-[2.2] flex-shrink-0" />
            </a>
          ) : (
            <span className="w-full inline-flex items-center justify-center py-1.5 sm:py-2 px-2 text-[11px] sm:text-xs tracking-wider text-neutral-400 bg-neutral-100 rounded-lg cursor-not-allowed">
              Link unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
