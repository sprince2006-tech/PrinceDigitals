import React from 'react';
import { FolderKanban, ShoppingBag, EyeOff, CheckCircle2 } from 'lucide-react';

export const DashboardStats = ({ stats = {} }) => {
  const {
    totalCollections = 0,
    publishedCollections = 0,
    draftCollections = 0,
    totalProducts = 0,
    publishedProducts = 0,
    draftProducts = 0,
  } = stats;

  const statCards = [
    {
      title: 'Total Collections',
      value: totalCollections,
      subtitle: `${publishedCollections} published, ${draftCollections} draft`,
      icon: FolderKanban,
      color: 'bg-neutral-900 text-white',
    },
    {
      title: 'Published Products',
      value: publishedProducts,
      subtitle: 'Visible on live storefront',
      icon: ShoppingBag,
      color: 'bg-emerald-600 text-white',
    },
    {
      title: 'Draft Collections',
      value: draftCollections,
      subtitle: 'Hidden from public visitors',
      icon: EyeOff,
      color: 'bg-amber-600 text-white',
    },
    {
      title: 'Catalog Health',
      value: totalCollections > 0 ? 'Active' : 'Empty',
      subtitle: `${totalProducts} total products tracked`,
      icon: CheckCircle2,
      color: 'bg-blue-600 text-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {statCards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="bg-white rounded-xl p-4 sm:p-5 border border-neutral-200/90 shadow-xs flex flex-col justify-between min-w-0"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 truncate mr-2">
                {card.title}
              </span>
              <div className={`w-8 h-8 rounded-lg ${card.color} flex items-center justify-center shadow-xs flex-shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <p className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                {card.value}
              </p>
              <p className="text-xs text-neutral-500 mt-1 font-medium">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
