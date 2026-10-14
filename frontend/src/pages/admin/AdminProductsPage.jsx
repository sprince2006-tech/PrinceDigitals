import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProductManager } from '../../components/admin/ProductManager';
import { ProductForm } from '../../components/admin/ProductForm';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  PlusCircle,
  ArrowLeft,
  ExternalLink,
  Edit,
  X,
  RefreshCw,
  FolderKanban,
} from 'lucide-react';

export const AdminProductsPage = () => {
  const { id: collectionId } = useParams();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProductsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getProducts(collectionId);
      setCollection(res.data.collection);
      setProducts(res.data.products || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsData();
  }, [collectionId]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (formData, formValues) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        // Edit mode
        // 1. Update text metadata
        const updatePayload = {
          title: formValues.title,
          description: formValues.description,
          productUrl: formValues.productUrl,
          isPublished: formValues.isPublished,
        };
        const updatedRes = await adminApi.updateProduct(editingProduct._id, updatePayload);

        // 2. If new image file was provided, update image
        let finalProduct = updatedRes.data;
        if (formValues.productImageFile) {
          const imgFormData = new FormData();
          imgFormData.append('productImage', formValues.productImageFile);
          const imgRes = await adminApi.updateProductImage(editingProduct._id, imgFormData);
          finalProduct = imgRes.data;
        }

        // Refresh state locally without reload
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? finalProduct : p))
        );
      } else {
        // Add mode: create product
        const res = await adminApi.createProduct(collectionId, formData);
        setProducts((prev) => [...prev, res.data]);
      }

      handleCloseModal();
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    setActionLoading(true);
    try {
      await adminApi.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePublish = async (productId, newPublishedStatus) => {
    setActionLoading(true);
    try {
      await adminApi.updateProduct(productId, { isPublished: newPublishedStatus });
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, isPublished: newPublishedStatus } : p))
      );
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReorder = async (orderedIds) => {
    // Optimistic UI update
    const idMap = new Map(products.map((p) => [p._id, p]));
    const reordered = orderedIds.map((id) => idMap.get(id)).filter(Boolean);
    setProducts(reordered);

    try {
      await adminApi.reorderProducts(collectionId, orderedIds);
    } catch (err) {
      alert(`Failed to save product ordering: ${err.message}`);
      fetchProductsData(); // rollback
    }
  };

  return (
    <AdminLayout
      title={collection ? `Products: ${collection.title}` : 'Manage Products'}
      subtitle={
        collection ? (
          <span>
            Collection slug: <span className="font-mono text-neutral-800">/collection/{collection.slug}</span>
          </span>
        ) : (
          'Configure catalog items'
        )
      }
      actions={
        <div className="flex items-center gap-2">
          {collection?.isPublished && (
            <a
              href={`/collection/${collection.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              <span>View Live</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={fetchProductsData}
            disabled={loading}
            className="p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
            title="Refresh products"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs uppercase tracking-wider font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      }
    >
      {loading ? (
        <LoadingState message="Loading collection products..." />
      ) : error ? (
        <ErrorState title="Error Loading Products" message={error} onRetry={fetchProductsData} />
      ) : (
        <div className="space-y-6">
          {/* Back link & collection info banner */}
          <div className="flex items-center justify-between text-xs text-neutral-500 pb-2">
            <Link
              to="/admin/collections"
              className="inline-flex items-center gap-1 font-semibold text-neutral-600 hover:text-neutral-900 uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all collections</span>
            </Link>

            <span className="font-medium text-neutral-700">
              {products.length} {products.length === 1 ? 'Product total' : 'Products total'}
            </span>
          </div>

          {/* Products Manager List */}
          <ProductManager
            products={products}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteProduct}
            onTogglePublish={handleTogglePublish}
            onReorder={handleReorder}
            isActionLoading={actionLoading}
          />
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 md:p-7 shadow-2xl border border-neutral-200 my-auto max-h-[90dvh] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {collection?.title} collection
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ProductForm
              initialData={editingProduct || {}}
              onSubmit={handleSaveProduct}
              onCancel={handleCloseModal}
              isSubmitting={isSubmitting}
              submitLabel={editingProduct ? 'Save Product' : 'Add Product'}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
