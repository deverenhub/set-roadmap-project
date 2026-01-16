// src/pages/Dashboard.tsx
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardKPIs } from '@/lib/api';
import {
  KPICard,
  ProgressRing,
  RecentActivity,
  CriticalItems,
  QoLImpactChart,
  DashboardCustomizer,
} from '@/components/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCapabilities } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import {
  usePreferencesStore,
  type DashboardWidgetId,
} from '@/stores/preferencesStore';

export default function Dashboard() {
  const navigate = useNavigate();

  // Get dashboard preferences
  const preferences = usePreferencesStore((state) => state.preferences);
  const { dashboardWidgets, dashboardRefreshInterval } = preferences;

  // Convert refresh interval to milliseconds (0 = disabled)
  const refetchInterval = dashboardRefreshInterval > 0 ? dashboardRefreshInterval * 1000 : false;

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboardKPIs'],
    queryFn: fetchDashboardKPIs,
    refetchInterval,
  });

  const { data: capabilities, isLoading: capsLoading } = useCapabilities();

  const handleItemClick = (id: string, type: 'capability' | 'milestone') => {
    if (type === 'capability') {
      navigate(`/capabilities/${id}`);
    }
  };

  // Get sorted visible widgets
  const sortedWidgets = useMemo(() => {
    return [...dashboardWidgets]
      .filter((w) => w.visible)
      .sort((a, b) => a.order - b.order);
  }, [dashboardWidgets]);

  // Helper to check if widget is visible
  const isWidgetVisible = (id: DashboardWidgetId) =>
    sortedWidgets.some((w) => w.id === id);

  // Get KPI widgets in order
  const kpiWidgets = useMemo(() => {
    return sortedWidgets.filter((w) => w.id.startsWith('kpi-'));
  }, [sortedWidgets]);

  // Get main content widgets (capability-progress, overall-maturity)
  const mainWidgets = useMemo(() => {
    return sortedWidgets.filter(
      (w) => w.id === 'capability-progress' || w.id === 'overall-maturity'
    );
  }, [sortedWidgets]);

  // Get bottom widgets (recent-activity, critical-items)
  const bottomWidgets = useMemo(() => {
    return sortedWidgets.filter(
      (w) => w.id === 'recent-activity' || w.id === 'critical-items'
    );
  }, [sortedWidgets]);

  // Render KPI widget
  const renderKPIWidget = (widgetId: DashboardWidgetId) => {
    switch (widgetId) {
      case 'kpi-progress':
        return (
          <KPICard
            key="kpi-progress"
            title="Overall Progress"
            value={`${kpis?.overallProgress || 0}%`}
            subtitle="across all capabilities"
            icon={TrendingUp}
            isLoading={kpisLoading}
            onClick={() => navigate('/capabilities')}
          />
        );
      case 'kpi-milestones':
        return (
          <KPICard
            key="kpi-milestones"
            title="Active Milestones"
            value={kpis?.activeMilestones || 0}
            subtitle="in progress"
            icon={Target}
            isLoading={kpisLoading}
            onClick={() => navigate('/timeline')}
          />
        );
      case 'kpi-quickwins':
        return (
          <KPICard
            key="kpi-quickwins"
            title="Quick Wins"
            value={`${kpis?.completedQuickWins || 0}/${kpis?.totalQuickWins || 0}`}
            subtitle="completed"
            icon={Zap}
            isLoading={kpisLoading}
            onClick={() => navigate('/quick-wins')}
          />
        );
      case 'kpi-critical':
        return (
          <KPICard
            key="kpi-critical"
            title="Critical Items"
            value={kpis?.blockedMilestones || 0}
            subtitle="need attention"
            icon={AlertTriangle}
            isLoading={kpisLoading}
            trend={
              kpis?.blockedMilestones && kpis.blockedMilestones > 0
                ? { value: kpis.blockedMilestones, direction: 'down' }
                : undefined
            }
          />
        );
      default:
        return null;
    }
  };

  // Render Capability Progress widget
  const renderCapabilityProgress = () => (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Capability Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {capsLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {capabilities?.slice(0, 5).map((cap) => {
              const progress = cap.target_level > 1
                ? Math.round(((cap.current_level - 1) / (cap.target_level - 1)) * 100)
                : 100;
              return (
                <div
                  key={cap.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-set-teal-50 hover:border-set-teal-200 cursor-pointer transition-colors"
                  onClick={() => navigate(`/capabilities/${cap.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cap.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          cap.priority === 'CRITICAL'
                            ? 'bg-red-100 text-red-700'
                            : cap.priority === 'HIGH'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {cap.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Level {cap.current_level} → {cap.target_level}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <div className="h-2 bg-set-teal-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-set-teal-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {progress}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Render Overall Maturity widget
  const renderOverallMaturity = () => (
    <Card>
      <CardHeader>
        <CardTitle>Overall Maturity</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6">
        {kpisLoading ? (
          <Skeleton className="h-32 w-32 rounded-full" />
        ) : (
          <>
            <ProgressRing
              value={kpis?.overallProgress || 0}
              size={140}
              color={
                (kpis?.overallProgress || 0) >= 75
                  ? 'success'
                  : (kpis?.overallProgress || 0) >= 50
                  ? 'primary'
                  : 'warning'
              }
              label="Complete"
            />
            <p className="text-sm text-muted-foreground mt-4 text-center">
              {kpis?.criticalCapabilities || 0} critical capabilities
              <br />
              require attention
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );

  // Calculate grid classes for main section
  const mainGridClass = useMemo(() => {
    const hasCapProgress = isWidgetVisible('capability-progress');
    const hasMaturity = isWidgetVisible('overall-maturity');

    if (hasCapProgress && hasMaturity) return 'lg:grid-cols-3';
    if (hasCapProgress || hasMaturity) return 'lg:grid-cols-1';
    return '';
  }, [sortedWidgets]);

  // Calculate grid classes for bottom section
  const bottomGridClass = useMemo(() => {
    const hasActivity = isWidgetVisible('recent-activity');
    const hasCritical = isWidgetVisible('critical-items');

    if (hasActivity && hasCritical) return 'lg:grid-cols-2';
    return 'lg:grid-cols-1';
  }, [sortedWidgets]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your VPC Operations Transformation
          </p>
        </div>
        <DashboardCustomizer />
      </div>

      {/* KPI Cards - render in configured order */}
      {kpiWidgets.length > 0 && (
        <div className={`grid gap-4 md:grid-cols-2 ${
          kpiWidgets.length === 1 ? 'lg:grid-cols-1' :
          kpiWidgets.length === 2 ? 'lg:grid-cols-2' :
          kpiWidgets.length === 3 ? 'lg:grid-cols-3' :
          'lg:grid-cols-4'
        }`}>
          {kpiWidgets.map((widget) => renderKPIWidget(widget.id))}
        </div>
      )}

      {/* Main content grid */}
      {mainWidgets.length > 0 && (
        <div className={`grid gap-6 ${mainGridClass}`}>
          {mainWidgets.map((widget) => {
            if (widget.id === 'capability-progress') {
              return <div key={widget.id}>{renderCapabilityProgress()}</div>;
            }
            if (widget.id === 'overall-maturity') {
              return <div key={widget.id}>{renderOverallMaturity()}</div>;
            }
            return null;
          })}
        </div>
      )}

      {/* Bottom grid */}
      {bottomWidgets.length > 0 && (
        <div className={`grid gap-6 ${bottomGridClass}`}>
          {bottomWidgets.map((widget) => {
            if (widget.id === 'recent-activity') {
              return <RecentActivity key={widget.id} limit={5} />;
            }
            if (widget.id === 'critical-items') {
              return <CriticalItems key={widget.id} onItemClick={handleItemClick} />;
            }
            return null;
          })}
        </div>
      )}

      {/* QoL Impact Section */}
      {isWidgetVisible('qol-impact') && (
        <div className="grid gap-6 lg:grid-cols-1">
          <QoLImpactChart limit={6} />
        </div>
      )}

      {/* Empty state when no widgets visible */}
      {sortedWidgets.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No widgets are currently visible. Click "Customize" to configure your dashboard.
          </p>
          <DashboardCustomizer
            trigger={
              <button className="text-primary hover:underline">
                Configure Dashboard
              </button>
            }
          />
        </Card>
      )}
    </div>
  );
}
