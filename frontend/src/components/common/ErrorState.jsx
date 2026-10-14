import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'Unable to load content. Please verify your connection.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-sm mx-auto">
      <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
        <AlertCircle className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-medium text-neutral-900 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-semibold border border-neutral-300 rounded-md text-neutral-800 hover:bg-neutral-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </button>
      )}
    </div>
  );
};
