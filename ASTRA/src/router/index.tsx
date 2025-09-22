/**
 * Router Configuration
 *
 * Main router setup for BookFairy application with route protection
 */

import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Dashboard, Library, Wishlist, Discovery } from '../components';
import { BookFairyLanding } from '../components/BookFairyLanding';
import { GoogleOAuthPage } from '../components/GoogleOAuthPage';
import { OnboardingFlow } from '../components/OnboardingFlow';
import { LoadingFallback } from '../components/LoadingFallback';

// Protected Route Component
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Router Configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicRoute />,
    children: [
      {
        index: true,
        element: <BookFairyLanding />
      },
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            element: <GoogleOAuthPage />
          }
        ]
      }
    ]
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'library',
        element: <Library />
      },
      {
        path: 'wishlist',
        element: <Wishlist />
      },
      {
        path: 'discovery',
        element: <Discovery />
      },
      {
        path: 'onboarding',
        element: <OnboardingFlow />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export default router;