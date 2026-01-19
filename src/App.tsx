// src/App.tsx
import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useRealtimeSync } from '@/hooks';
import { useApplyPreferences, usePreferencesStore } from '@/stores/preferencesStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { FacilityProvider } from '@/providers/FacilityProvider';
import { FullPageLoader, PageLoader } from '@/components/shared/LoadingSpinner';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { Session } from '@supabase/supabase-js';

// Keep Login static for immediate auth check
import Login from '@/pages/Login';

// Lazy load all other pages for code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Capabilities = lazy(() => import('@/pages/Capabilities'));
const Timeline = lazy(() => import('@/pages/Timeline'));
const Dependencies = lazy(() => import('@/pages/Dependencies'));
const QuickWins = lazy(() => import('@/pages/QuickWins'));
const Settings = lazy(() => import('@/pages/Settings'));
const AcceptInvitation = lazy(() => import('@/pages/AcceptInvitation'));
const MaturityDefinitions = lazy(() => import('@/pages/MaturityDefinitions'));
const TechnologyOptions = lazy(() => import('@/pages/TechnologyOptions'));
const QoLImpact = lazy(() => import('@/pages/QoLImpact'));
const RoadmapInventory = lazy(() => import('@/pages/RoadmapInventory'));
const RoadmapProduction = lazy(() => import('@/pages/RoadmapProduction'));
const RoadmapPlanning = lazy(() => import('@/pages/RoadmapPlanning'));
const ExecutiveDashboard = lazy(() => import('@/pages/ExecutiveDashboard'));
const ActivityLog = lazy(() => import('@/pages/ActivityLog'));
const Facilities = lazy(() => import('@/pages/Facilities'));
const CapabilityTemplates = lazy(() => import('@/pages/CapabilityTemplates'));

// Component to handle default view preference redirect
function DefaultViewRoute() {
  const defaultView = usePreferencesStore((state) => state.preferences.defaultDashboardView);

  switch (defaultView) {
    case 'capabilities':
      return <Navigate to="/capabilities" replace />;
    case 'timeline':
      return <Navigate to="/timeline" replace />;
    case 'overview':
    default:
      return (
        <Suspense fallback={<PageLoader />}>
          <Dashboard />
        </Suspense>
      );
  }
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Apply user preferences (theme, compact mode)
  useApplyPreferences();

  // Enable realtime sync when authenticated
  useRealtimeSync();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Public routes that don't require authentication
  const isPublicRoute = location.pathname === '/accept-invitation';

  if (loading) {
    return <FullPageLoader text="Loading..." />;
  }

  // Handle public routes (accept-invitation)
  if (isPublicRoute) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<FullPageLoader text="Loading..." />}>
          <Routes>
            <Route path="/accept-invitation" element={<AcceptInvitation />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <ErrorBoundary>
      <FacilityProvider>
        <MainLayout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<DefaultViewRoute />} />
              <Route path="/executive" element={<ExecutiveDashboard />} />
              <Route path="/capabilities" element={<Capabilities />} />
              <Route path="/capabilities/:id" element={<Capabilities />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/dependencies" element={<Dependencies />} />
              <Route path="/quick-wins" element={<QuickWins />} />
              <Route path="/maturity-definitions" element={<MaturityDefinitions />} />
              <Route path="/technology-options" element={<TechnologyOptions />} />
              <Route path="/qol-impact" element={<QoLImpact />} />
              <Route path="/roadmap/inventory" element={<RoadmapInventory />} />
              <Route path="/roadmap/production" element={<RoadmapProduction />} />
              <Route path="/roadmap/planning" element={<RoadmapPlanning />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/activity-log" element={<ActivityLog />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/templates" element={<CapabilityTemplates />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </MainLayout>
      </FacilityProvider>
    </ErrorBoundary>
  );
}

export default App;
