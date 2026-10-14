import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmDeleteDialog = ({
  isOpen,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemName,
  confirmLabel = 'Delete Permanently',
  isDeleting = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-semibold text-neutral-900 mb-1">{title}</h3>
        <p className="text-sm text-neutral-600 mb-2">{message}</p>
        {itemName && (
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-800 mb-6 truncate">
            {itemName}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
