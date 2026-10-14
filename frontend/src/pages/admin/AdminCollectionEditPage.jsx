import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { CollectionForm } from '../../components/admin/CollectionForm';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export const AdminCollectionEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchCollection = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getCollection(id);
      setCollection(res.data.collection);
    } catch (err) {
      setError(err.message || 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, [id]);

  const handleSubmit = async (formData, formValues) => {
    setIsSubmitting(true);
    try {
      // 1. Update text metadata (title, description, isPublished, slug)
      const updatePayload = {
        title: formValues.title,
        description: formValues.description,
        isPublished: formValues.isPublished,
      };
      if (formValues.slug) {
        updatePayload.slug = formValues.slug;
      }
      await adminApi.updateCollection(id, updatePayload);

      // 2. If new image was provided, upload to cover endpoint
      if (formValues.coverImageFile) {
        const coverFormData = new FormData();
        coverFormData.append('coverImage', formValues.coverImageFile);
        await adminApi.updateCollectionCover(id, coverFormData);
      }

      navigate('/admin/collections');
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title="Edit Collection"
      subtitle={collection ? `Editing: ${collection.title}` : 'Update collection details'}
      actions={
        <div className="flex items-center gap-2">
          {collection && (
            <Link
              to={`/admin/collections/${collection._id}/products`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Manage Products</span>
            </Link>
          )}
          <Link
            to="/admin/collections"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold text-neutral-600 hover:text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>
        </div>
      }
    >
      {loading ? (
        <LoadingState message="Loading collection details..." />
      ) : error ? (
        <ErrorState title="Error Loading Collection" message={error} onRetry={fetchCollection} />
      ) : (
        <div className="max-w-2xl bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 shadow-xs">
          <CollectionForm
            initialData={collection}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Save Changes"
          />
        </div>
      )}
    </AdminLayout>
  );
};
