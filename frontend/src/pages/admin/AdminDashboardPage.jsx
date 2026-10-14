import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DashboardStats } from '../../components/admin/DashboardStats';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  PlusCircle,
  FolderKanban,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getDashboard();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Dashboard — Prince Digital Admin';
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Admin Dashboard">
        <LoadingState message="Loading dashboard statistics..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Admin Dashboard">
        <ErrorState
          title="Dashboard Error"
          message={error}
          onRetry={fetchDashboard}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Overview of collections, product links, and storefront status"
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/admin/collections/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Collection</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Real Summary Metrics */}
        <DashboardStats stats={data?.stats} />

        {/* Quick Actions Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <Link
            to="/admin/collections/new"
            className="p-4 sm:p-5 bg-white rounded-xl border border-neutral-200 hover:border-neutral-400 transition-all flex items-center justify-between group shadow-2xs min-w-0"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800 group-hover:bg-neutral-900 group-hover:text-white transition-colors flex-shrink-0">
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-neutral-900 truncate">Add Collection</h4>
                <p className="text-xs text-neutral-500 truncate">Create new section</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
          </Link>

          <Link
            to="/admin/collections"
            className="p-4 sm:p-5 bg-white rounded-xl border border-neutral-200 hover:border-neutral-400 transition-all flex items-center justify-between group shadow-2xs min-w-0"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800 group-hover:bg-neutral-900 group-hover:text-white transition-colors flex-shrink-0">
                <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-neutral-900 truncate">Manage Collections</h4>
                <p className="text-xs text-neutral-500 truncate">Edit & organize</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
          </Link>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 sm:p-5 bg-white rounded-xl border border-neutral-200 hover:border-neutral-400 transition-all flex items-center justify-between group shadow-2xs min-w-0 sm:col-span-2 md:col-span-1"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800 group-hover:bg-neutral-900 group-hover:text-white transition-colors flex-shrink-0">
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-neutral-900 truncate">View Public Site</h4>
                <p className="text-xs text-neutral-500 truncate">Inspect bio catalog</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
          </a>
        </div>

        {/* Recent Collections */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6 shadow-2xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-neutral-100 gap-2 flex-shrink-0 mb-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-900 truncate">
                  Recent Collections
                </h3>
                {data?.recentCollections && data.recentCollections.length > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                    {data.recentCollections.length}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 truncate">
                Recently updated sections in Prince Digital
              </p>
            </div>
            <Link
              to="/admin/collections"
              className="text-xs font-semibold text-neutral-700 hover:text-black uppercase tracking-wider flex items-center gap-1 flex-shrink-0 hover:bg-neutral-100 py-1 px-2 rounded-md transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!data?.recentCollections || data.recentCollections.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs">
              No collections found. Click "Add Collection" to get started.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 max-h-[250px] sm:max-h-[300px] md:max-h-[320px] overflow-y-auto overscroll-contain pr-1 sm:pr-2">
              {data.recentCollections.map((col) => (
                <div
                  key={col._id}
                  className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 hover:bg-neutral-50/50 rounded-lg px-1 transition-colors"
                >
                  {/* Left: Thumbnail & Titles */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
                      {col.coverImageUrl ? (
                        <img src={col.coverImageUrl} alt={col.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{col.title}</p>
                      <p className="text-xs text-neutral-400 font-mono truncate">/collection/{col.slug}</p>
                    </div>
                  </div>

                  {/* Right: Status badge & Products button */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 self-start sm:self-center pl-13 sm:pl-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider flex-shrink-0 ${
                        col.isPublished
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}
                    >
                      {col.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <Link
                      to={`/admin/collections/${col._id}/products`}
                      className="text-xs font-semibold text-neutral-800 hover:text-black px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors flex-shrink-0"
                    >
                      Products
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
