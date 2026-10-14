import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'Products coming soon.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-sm mx-auto">
      <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4 border border-neutral-200">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-medium text-neutral-900 tracking-wide mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2 text-xs uppercase tracking-widest font-semibold bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
