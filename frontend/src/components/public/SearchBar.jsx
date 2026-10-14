import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search collections...',
  totalResults,
}) => {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (onClear) onClear();
      inputRef.current?.blur();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mb-8 sm:mb-10">
      <div className="relative group">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-neutral-900 transition-colors">
          <Search className="w-4 h-4 stroke-[1.8]" />
        </div>

        {/* Real-time Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-full bg-neutral-50/80 hover:bg-neutral-50 focus:bg-white border border-neutral-200/90 focus:border-neutral-900 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-neutral-900/5 shadow-2xs transition-all"
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={() => {
              if (onClear) onClear();
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors"
            title="Clear search (Esc)"
            aria-label="Clear search"
          >
            <div className="w-5 h-5 rounded-full bg-neutral-200/70 hover:bg-neutral-300 flex items-center justify-center">
              <X className="w-3 h-3 stroke-[2]" />
            </div>
          </button>
        )}
      </div>

      {/* Real-time Result Count / Clear Link */}
      {value.trim() && typeof totalResults === 'number' && (
        <div className="flex items-center justify-between px-3 mt-2 text-[11px] text-neutral-500">
          <span>
            {totalResults} {totalResults === 1 ? 'collection' : 'collections'} found for{' '}
            <span className="font-semibold text-neutral-900">"{value.trim()}"</span>
          </span>
          <button
            onClick={onClear}
            className="text-neutral-400 hover:text-neutral-800 underline font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};
