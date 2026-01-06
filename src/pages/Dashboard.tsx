// src/pages/Dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
  Calendar,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardKPIs } from '@/lib/api';
import { KPICard, ProgressRing, RecentActivity, CriticalItems } from '@/components/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCapabilities } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboardKPIs'],
    queryFn: fetchDashboardKPIs,
  });

  const { data: capabilities, isLoading: capsLoading } = useCapabilities();

  const handleItemClick = (id: string, type: 'capability' | 'milestone') => {
    if (type === 'capability') {
      navigate(`/capabilities/${id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your VPC Operations Transformation
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Overall Progress"
          value={`${kpis?.overallProgress || 0}%`}
          subtitle="across all capabilities"
          icon={TrendingUp}
          isLoading={kpisLoading}
          onClick={() => navigate('/capabilities')}
        />
        <KPICard
          title="Active Milestones"
          value={kpis?.activeMilestones || 0}
          subtitle="in progress"
          icon={Target}
          isLoading={kpisLoading}
          onClick={() => navigate('/timeline')}
        />
        <KPICard
          title="Quick Wins"
          value={`${kpis?.completedQuickWins || 0}/${kpis?.totalQuickWins || 0}`}
          subtitle="completed"
          icon={Zap}
          isLoading={kpisLoading}
          onClick={() => navigate('/quick-wins')}
        />
        <KPICard
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
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress Overview */}
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

        {/* Overall Progress Ring */}
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
      </div>

      {/* Bottom grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity limit={5} />
        <CriticalItems onItemClick={handleItemClick} />
      </div>
    </div>
  );
}
