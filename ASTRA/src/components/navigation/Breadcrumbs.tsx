/**
 * Breadcrumbs Navigation Component
 *
 * Dynamic breadcrumbs with fairy-themed styling and navigation
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';

// Route configurations for breadcrumb display
const routeConfig = {
  '/dashboard': { label: 'Dashboard', icon: '🏠' },
  '/library': { label: 'Library', icon: '📚' },
  '/wishlist': { label: 'Wishlist', icon: '⭐' },
  '/discovery': { label: 'Discovery', icon: '🔍' },
  '/onboarding': { label: 'Onboarding', icon: '🧚‍♀️' },
  '/auth': { label: 'Authentication', icon: '🔐' },
  '/auth/login': { label: 'Sign In', icon: '🚪' }
};

interface BreadcrumbItem {
  path: string;
  label: string;
  icon?: string;
  isLast?: boolean;
}

interface BreadcrumbsProps {
  className?: string;
  customItems?: BreadcrumbItem[];
  showIcons?: boolean;
  maxItems?: number;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  className,
  customItems,
  showIcons = true,
  maxItems = 4
}) => {
  const location = useLocation();

  // Generate breadcrumb items from current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always include home/dashboard as root
    if (location.pathname !== '/dashboard' && location.pathname !== '/') {
      breadcrumbs.push({
        path: '/dashboard',
        label: 'Dashboard',
        icon: '🏠'
      });
    }

    // Build breadcrumbs from path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const config = routeConfig[currentPath as keyof typeof routeConfig];

      if (config) {
        breadcrumbs.push({
          path: currentPath,
          label: config.label,
          icon: config.icon,
          isLast: index === pathSegments.length - 1
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Limit breadcrumbs if maxItems is set
  const displayedBreadcrumbs = maxItems && breadcrumbs.length > maxItems
    ? [
        breadcrumbs[0],
        { path: '', label: '...', icon: '⋯' },
        ...breadcrumbs.slice(-maxItems + 2)
      ]
    : breadcrumbs;

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav
      className={cn(
        "flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400",
        className
      )}
      aria-label="Breadcrumb navigation"
    >
      <ol className="flex items-center space-x-2">
        {displayedBreadcrumbs.map((item, index) => (
          <li key={`${item.path}-${index}`} className="flex items-center space-x-2">
            {/* Breadcrumb Item */}
            {item.path === '' ? (
              // Ellipsis for truncated breadcrumbs
              <span className="flex items-center space-x-1 text-gray-400 dark:text-gray-500">
                {showIcons && item.icon && (
                  <span className="text-sm opacity-70">{item.icon}</span>
                )}
                <span className="font-medium">{item.label}</span>
              </span>
            ) : item.isLast ? (
              // Current page (not a link)
              <span className="flex items-center space-x-1 text-purple-600 dark:text-purple-400 font-medium">
                {showIcons && item.icon && (
                  <span className="text-sm">{item.icon}</span>
                )}
                <span>{item.label}</span>
              </span>
            ) : (
              // Clickable breadcrumb link
              <Link
                to={item.path}
                className="flex items-center space-x-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
              >
                {showIcons && item.icon && (
                  <span className="text-sm group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                )}
                <span className="hover:underline">{item.label}</span>
              </Link>
            )}

            {/* Separator */}
            {index < displayedBreadcrumbs.length - 1 && (
              <span className="text-gray-400 dark:text-gray-500 select-none">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Utility hook for custom breadcrumb management
export const useBreadcrumbs = () => {
  const [customBreadcrumbs, setCustomBreadcrumbs] = React.useState<BreadcrumbItem[]>([]);

  const setBreadcrumbs = (items: BreadcrumbItem[]) => {
    setCustomBreadcrumbs(items);
  };

  const addBreadcrumb = (item: BreadcrumbItem) => {
    setCustomBreadcrumbs(prev => [...prev, item]);
  };

  const clearBreadcrumbs = () => {
    setCustomBreadcrumbs([]);
  };

  return {
    customBreadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
    clearBreadcrumbs
  };
};

export default Breadcrumbs;