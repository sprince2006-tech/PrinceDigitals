import React, { useState } from 'react';
import {
  PackageOpen,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Image as ImageIcon,
} from 'lucide-react';
import { ConfirmDeleteDialog } from '../common/ConfirmDeleteDialog';

export const ProductManager = ({
  products = [],
  onEdit,
  onDelete,
  onTogglePublish,
  onReorder,
  isActionLoading = false,
}) => {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteTarget._id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = (index, direction) => {
    const newProducts = [...products];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newProducts.length) return;

    const temp = newProducts[index];
    newProducts[index] = newProducts[targetIndex];
    newProducts[targetIndex] = temp;

    const orderedIds = newProducts.map((p) => p._id);
    if (onReorder) {
      onReorder(orderedIds);
    }
  };

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <PackageOpen className="w-10 h-10 text-neutral-400 mx-auto mb-3 stroke-[1.5]" />
        <h3 className="text-base font-semibold text-neutral-900">No products added yet</h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          Add products with their images and external shopping links to populate this collection.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
      <div className="divide-y divide-neutral-200">
        {products.map((product, index) => {
          const isFirst = index === 0;
          const isLast = index === products.length - 1;

          return (
            <div
              key={product._id}
              className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-neutral-50/50 transition-colors overflow-hidden"
            >
              {/* Product Info & Thumbnail */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 w-full flex-1">
                {/* Reorder Arrows */}
                <div className="flex flex-col gap-1 -my-1 text-neutral-400 flex-shrink-0">
                  <button
                    onClick={() => handleMove(index, -1)}
                    disabled={isFirst || isActionLoading}
                    className="p-1 hover:text-neutral-900 disabled:opacity-20 rounded"
                    title="Move up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 1)}
                    disabled={isLast || isActionLoading}
                    className="p-1 hover:text-neutral-900 disabled:opacity-20 rounded"
                    title="Move down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Thumbnail (4:5 ratio) */}
                <div className="w-12 h-14 sm:w-14 sm:h-16 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-neutral-900 truncate">
                      {product.title}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                        product.isPublished
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}
                    >
                      {product.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {/* Destination shopping URL */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <a
                      href={product.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 truncate max-w-[160px] sm:max-w-xs md:max-w-md font-mono"
                      title={product.productUrl}
                    >
                      <span className="truncate">{product.productUrl}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>

                  {product.description && (
                    <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                      {product.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1.5 sm:gap-2 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
                  {/* Publish Toggle */}
                  {onTogglePublish && (
                    <button
                      onClick={() => onTogglePublish(product._id, !product.isPublished)}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-md hover:bg-neutral-100"
                      title={product.isPublished ? 'Unpublish product' : 'Publish product'}
                    >
                      {product.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}

                  {/* Edit */}
                  <button
                    onClick={() => onEdit(product)}
                    className="p-1.5 text-neutral-600 hover:text-neutral-900 rounded-md hover:bg-neutral-100"
                    title="Edit product"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteTarget(product)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded-md hover:bg-rose-50"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Product?"
        message="Are you sure you want to permanently delete this product? Its Cloudinary image will also be cleaned up."
        itemName={deleteTarget?.title}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
