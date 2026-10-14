import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { CollectionManager } from '../../components/admin/CollectionManager';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { PlusCircle, RefreshCw } from 'lucide-react';

export const AdminCollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getCollections();
      setCollections(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Collections — Prince Digital Admin';
    fetchCollections();
  }, []);

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await adminApi.deleteCollection(id);
      setCollections((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(`Failed to delete collection: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePublish = async (id, newPublishedStatus) => {
    setActionLoading(true);
    try {
      await adminApi.updateCollection(id, { isPublished: newPublishedStatus });
      setCollections((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isPublished: newPublishedStatus } : c))
      );
    } catch (err) {
      alert(`Failed to update publication status: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReorder = async (orderedIds) => {
    // Optimistic update in UI
    const idMap = new Map(collections.map((c) => [c._id, c]));
    const reordered = orderedIds.map((id) => idMap.get(id)).filter(Boolean);
    setCollections(reordered);

    try {
      await adminApi.reorderCollections(orderedIds);
    } catch (err) {
      alert(`Failed to save collection order: ${err.message}`);
      fetchCollections(); // rollback
    }
  };

  return (
    <AdminLayout
      title="Collections"
      subtitle="Manage, reorder, and configure product collections"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCollections}
            disabled={loading}
            className="p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/admin/collections/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs uppercase tracking-wider font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Collection</span>
          </Link>
        </div>
      }
    >
      {loading ? (
        <LoadingState message="Loading collections..." />
      ) : error ? (
        <ErrorState
          title="Error Loading Collections"
          message={error}
          onRetry={fetchCollections}
        />
      ) : (
        <CollectionManager
          collections={collections}
          onDelete={handleDelete}
          onTogglePublish={handleTogglePublish}
          onReorder={handleReorder}
          isActionLoading={actionLoading}
        />
      )}
    </AdminLayout>
  );
};
