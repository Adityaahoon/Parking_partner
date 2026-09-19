import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { ActiveSessionBar } from './components/session/ActiveSessionBar';
import { AuthModal } from './components/auth/AuthModal';

// Customer Pages
import { LandingPage } from './pages/customer/LandingPage';
import { DashboardPage } from './pages/customer/DashboardPage';
import { SearchPage } from './pages/customer/SearchPage';
import { ParkingDetailPage } from './pages/customer/ParkingDetailPage';
import { BookingsPage } from './pages/customer/BookingsPage';
import { HistoryPage } from './pages/customer/HistoryPage';
import { FavoritesPage } from './pages/customer/FavoritesPage';
import { ProfilePage } from './pages/customer/ProfilePage';

// Partner Pages & Layout
import { PartnerLayout } from './layouts/PartnerLayout';
import { PartnerOverviewPage } from './pages/partner/PartnerOverviewPage';
import { PartnerLocationsPage } from './pages/partner/PartnerLocationsPage';
import { PartnerSlotsPage } from './pages/partner/PartnerSlotsPage';
import { PartnerBookingsPage } from './pages/partner/PartnerBookingsPage';
import { PartnerPricingPage } from './pages/partner/PartnerPricingPage';
import { PartnerAnalyticsPage } from './pages/partner/PartnerAnalyticsPage';
import { PartnerReviewsPage } from './pages/partner/PartnerReviewsPage';
import { PartnerSettingsPage } from './pages/partner/PartnerSettingsPage';

// Admin Pages & Layout
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminPartnersPage } from './pages/admin/AdminPartnersPage';
import { AdminComplaintsPage } from './pages/admin/AdminComplaintsPage';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: ('CUSTOMER' | 'PARTNER' | 'ADMIN')[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const location = useLocation();
  const isPartnerRoute = location.pathname.startsWith('/partner');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDedicatedPortal = isPartnerRoute || isAdminRoute;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-16 md:pb-0">
      {/* Show Standard Navbar only on customer/public pages */}
      {!isDedicatedPortal && <Navbar />}

      <div className="flex-1">
        <Routes>
          {/* Customer & Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/parking/:id" element={<ParkingDetailPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Partner Portal Routes */}
          <Route
            path="/partner"
            element={
              <ProtectedRoute allowedRoles={['PARTNER', 'ADMIN']}>
                <PartnerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/partner/overview" replace />} />
            <Route path="overview" element={<PartnerOverviewPage />} />
            <Route path="locations" element={<PartnerLocationsPage />} />
            <Route path="slots" element={<PartnerSlotsPage />} />
            <Route path="bookings" element={<PartnerBookingsPage />} />
            <Route path="pricing" element={<PartnerPricingPage />} />
            <Route path="analytics" element={<PartnerAnalyticsPage />} />
            <Route path="reviews" element={<PartnerReviewsPage />} />
            <Route path="settings" element={<PartnerSettingsPage />} />
          </Route>

          {/* Admin Control Center Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="partners" element={<AdminPartnersPage />} />
            <Route path="complaints" element={<AdminComplaintsPage />} />
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Global Modals & Overlays */}
      <AuthModal />
      {!isDedicatedPortal && <ActiveSessionBar />}
      {!isDedicatedPortal && <MobileBottomNav />}
    </div>
  );
};
