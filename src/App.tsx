// src/App.tsx
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useRealtimeSync } from '@/hooks';
import { useApplyPreferences, usePreferencesStore } from '@/stores/preferencesStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { FullPageLoader } from '@/components/shared/LoadingSpinner';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import type { Session } from '@supabase/supabase-js';

// Lazy load pages for better performance
import Dashboard from '@/pages/Dashboard';
import Capabilities from '@/pages/Capabilities';
import Timeline from '@/pages/Timeline';
import Dependencies from '@/pages/Dependencies';
import QuickWins from '@/pages/QuickWins';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import MaturityDefinitions from '@/pages/MaturityDefinitions';
import TechnologyOptions from '@/pages/TechnologyOptions';
import QoLImpact from '@/pages/QoLImpact';
import RoadmapInventory from '@/pages/RoadmapInventory';
import RoadmapProduction from '@/pages/RoadmapProduction';
import RoadmapPlanning from '@/pages/RoadmapPlanning';
import ExecutiveDashboard from '@/pages/ExecutiveDashboard';

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
      return <Dashboard />;
  }
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <FullPageLoader text="Loading..." />;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <ErrorBoundary>
      <MainLayout>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </ErrorBoundary>
  );
}

export default App;
