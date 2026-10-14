import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { CollectionForm } from '../../components/admin/CollectionForm';
import { ArrowLeft } from 'lucide-react';

export const AdminCollectionNewPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await adminApi.createCollection(formData);
      // Navigate to product management for the newly created collection
      navigate(`/admin/collections/${res.data._id}/products`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title="Create Collection"
      subtitle="Add a new catalog category and upload its cover image"
      actions={
        <Link
          to="/admin/collections"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold text-neutral-600 hover:text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>
      }
    >
      <div className="max-w-2xl bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 shadow-xs">
        <CollectionForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create & Add Products"
        />
      </div>
    </AdminLayout>
  );
};
