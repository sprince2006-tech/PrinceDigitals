import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Edit,
  Trash2,
  ExternalLink,
  ShoppingBag,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Image as ImageIcon,
} from 'lucide-react';
import { ConfirmDeleteDialog } from '../common/ConfirmDeleteDialog';

export const CollectionManager = ({
  collections = [],
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
    const newCollections = [...collections];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newCollections.length) return;

    const temp = newCollections[index];
    newCollections[index] = newCollections[targetIndex];
    newCollections[targetIndex] = temp;

    const orderedIds = newCollections.map((c) => c._id);
    if (onReorder) {
      onReorder(orderedIds);
    }
  };

  if (!collections || collections.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <FolderKanban className="w-10 h-10 text-neutral-400 mx-auto mb-3 stroke-[1.5]" />
        <h3 className="text-base font-semibold text-neutral-900">No collections created yet</h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto mb-5">
          Start by creating your first collection, such as 'Peak Formals' or 'Casual Wear'.
        </p>
        <Link
          to="/admin/collections/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Create First Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
      {/* Table on tablet/desktop, card list on mobile */}
      <div className="divide-y divide-neutral-200">
        {collections.map((collection, index) => {
          const isFirst = index === 0;
          const isLast = index === collections.length - 1;

          return (
            <div
              key={collection._id}
              className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-neutral-50/50 transition-colors overflow-hidden"
            >
              {/* Collection info & thumbnail */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 w-full flex-1">
                {/* Reorder arrows */}
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

                {/* Cover Image */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
                  {collection.coverImageUrl ? (
                    <img
                      src={collection.coverImageUrl}
                      alt={collection.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                      <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  )}
                </div>

                {/* Title & metadata */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-neutral-900 truncate">
                      {collection.title}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase flex-shrink-0 ${
                        collection.isPublished
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}
                    >
                      {collection.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500 font-mono mt-0.5 truncate">
                    /collection/{collection.slug}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                    <span className="font-medium flex-shrink-0">
                      {collection.productsCount || 0} {(collection.productsCount === 1) ? 'product' : 'products'}
                    </span>
                    {collection.description && (
                      <>
                        <span>&bull;</span>
                        <span className="truncate max-w-[120px] sm:max-w-xs">{collection.description}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-neutral-100 flex-wrap">
                {/* Manage Products Link */}
                <Link
                  to={`/admin/collections/${collection._id}/products`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex-shrink-0"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Products</span>
                </Link>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Publish Toggle Button */}
                  {onTogglePublish && (
                    <button
                      onClick={() => onTogglePublish(collection._id, !collection.isPublished)}
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-md hover:bg-neutral-100"
                      title={collection.isPublished ? 'Unpublish collection' : 'Publish collection'}
                    >
                      {collection.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}

                  {/* View on live site */}
                  {collection.isPublished && (
                    <a
                      href={`/collection/${collection.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-md hover:bg-neutral-100"
                      title="View live"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {/* Edit */}
                  <Link
                    to={`/admin/collections/${collection._id}/edit`}
                    className="p-1.5 text-neutral-600 hover:text-neutral-900 rounded-md hover:bg-neutral-100"
                    title="Edit collection"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteTarget(collection)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded-md hover:bg-rose-50"
                    title="Delete collection"
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
        title="Delete Collection?"
        message="Deleting this collection will permanently remove the collection and all products inside it. Associated Cloudinary images will also be cleaned up."
        itemName={deleteTarget?.title}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
