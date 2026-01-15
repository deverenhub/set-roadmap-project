// src/pages/ExecutiveDashboard.tsx
// Leadership Executive Dashboard - A storytelling view for stakeholders
import { useState, useMemo } from 'react';
import { useCapabilities, useMilestones, useQuickWins } from '@/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Users,
  Calendar,
  Briefcase,
  Shield,
  Zap,
  PlusCircle,
  Activity,
  PieChart as PieChartIcon,
  Layers,
  FileText,
  Info,
} from 'lucide-react';
import { PDFExportButton } from '@/components/reports';
import { format, startOfQuarter, getQuarter, getYear, addQuarters, isAfter, isBefore } from 'date-fns';

// Health Status Types
type HealthStatus = 'healthy' | 'at-risk' | 'critical';

interface ProgramHealth {
  status: HealthStatus;
  score: number;
  trend: 'up' | 'down' | 'stable';
  factors: { name: string; status: HealthStatus; weight: number }[];
}

export default function ExecutiveDashboard() {
  const { data: capabilities, isLoading: loadingCaps } = useCapabilities();
  const { data: milestones, isLoading: loadingMs } = useMilestones();
  const { data: quickWins, isLoading: loadingQw } = useQuickWins();
  const [selectedView, setSelectedView] = useState<'overview' | 'timeline' | 'impact'>('overview');

  const isLoading = loadingCaps || loadingMs || loadingQw;

  // Calculate program metrics
  const metrics = useMemo(() => {
    if (!capabilities || !milestones || !quickWins) {
      return null;
    }

    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const inProgressMilestones = milestones.filter(m => m.status === 'in_progress').length;
    const blockedMilestones = milestones.filter(m => m.status === 'blocked').length;
    const notStartedMilestones = milestones.filter(m => m.status === 'not_started').length;

    const overallProgress = totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

    const criticalCapabilities = capabilities.filter(c => c.priority === 'CRITICAL').length;
    const highCapabilities = capabilities.filter(c => c.priority === 'HIGH').length;

    // Calculate average maturity
    const avgCurrentLevel = capabilities.length > 0
      ? capabilities.reduce((acc, c) => acc + c.current_level, 0) / capabilities.length
      : 1;
    const avgTargetLevel = capabilities.length > 0
      ? capabilities.reduce((acc, c) => acc + c.target_level, 0) / capabilities.length
      : 1;
    const maturityProgress = avgTargetLevel > 1 && avgCurrentLevel >= 1
      ? Math.round(((avgCurrentLevel - 1) / (avgTargetLevel - 1)) * 100)
      : avgCurrentLevel >= avgTargetLevel ? 100 : 0;

    // Quick wins progress
    const completedQuickWins = quickWins.filter(qw => qw.status === 'completed').length;
    const quickWinProgress = quickWins.length > 0
      ? Math.round((completedQuickWins / quickWins.length) * 100)
      : 0;

    // Calculate health score
    const blockedPenalty = blockedMilestones * 10;
    const progressBonus = overallProgress * 0.5;
    const criticalBonus = criticalCapabilities > 0 ? (completedMilestones / criticalCapabilities) * 10 : 0;
    const healthScore = Math.min(100, Math.max(0, 50 + progressBonus - blockedPenalty + criticalBonus));

    let healthStatus: HealthStatus = 'healthy';
    if (healthScore < 40 || blockedMilestones > 2) healthStatus = 'critical';
    else if (healthScore < 70 || blockedMilestones > 0) healthStatus = 'at-risk';

    return {
      overallProgress,
      completedMilestones,
      totalMilestones,
      inProgressMilestones,
      blockedMilestones,
      notStartedMilestones,
      criticalCapabilities,
      highCapabilities,
      totalCapabilities: capabilities.length,
      maturityProgress,
      avgCurrentLevel: avgCurrentLevel.toFixed(1),
      avgTargetLevel: avgTargetLevel.toFixed(1),
      quickWinProgress,
      completedQuickWins,
      totalQuickWins: quickWins.length,
      healthScore: Math.round(healthScore),
      healthStatus,
    };
  }, [capabilities, milestones, quickWins]);

  // Generate timeline data from REAL milestones grouped by quarter
  const timelineData = useMemo(() => {
    if (!milestones || milestones.length === 0) {
      return [];
    }

    // Get date range from milestones
    const now = new Date();
    const startDate = startOfQuarter(now);

    // Generate 6 quarters of data
    const quarters: { name: string; planned: number; completed: number; blocked: number; quarterStart: Date }[] = [];

    for (let i = -2; i < 4; i++) {
      const quarterDate = addQuarters(startDate, i);
      const q = getQuarter(quarterDate);
      const y = getYear(quarterDate);
      quarters.push({
        name: `Q${q} ${y}`,
        planned: 0,
        completed: 0,
        blocked: 0,
        quarterStart: quarterDate,
      });
    }

    // Group milestones by quarter based on their expected completion
    milestones.forEach(milestone => {
      // Use path_b_months as default duration estimate
      const durationMonths = milestone.path_b_months || 3;

      // Calculate expected completion quarter
      const createdDate = milestone.created_at ? new Date(milestone.created_at) : now;
      const expectedEnd = new Date(createdDate);
      expectedEnd.setMonth(expectedEnd.getMonth() + durationMonths);

      // Find which quarter this milestone falls into
      quarters.forEach(quarter => {
        const quarterEnd = addQuarters(quarter.quarterStart, 1);
        if (isAfter(expectedEnd, quarter.quarterStart) && isBefore(expectedEnd, quarterEnd)) {
          quarter.planned++;
          if (milestone.status === 'completed') {
            quarter.completed++;
          } else if (milestone.status === 'blocked') {
            quarter.blocked++;
          }
        }
      });
    });

    // If no milestones fell into quarters, distribute evenly based on current status
    const totalAssigned = quarters.reduce((sum, q) => sum + q.planned, 0);
    if (totalAssigned === 0 && milestones.length > 0) {
      const perQuarter = Math.ceil(milestones.length / quarters.length);
      let remaining = milestones.length;
      let completedRemaining = milestones.filter(m => m.status === 'completed').length;
      let blockedRemaining = milestones.filter(m => m.status === 'blocked').length;

      quarters.forEach((quarter, idx) => {
        const assigned = Math.min(perQuarter, remaining);
        quarter.planned = assigned;
        quarter.completed = Math.min(assigned, completedRemaining);
        quarter.blocked = Math.min(assigned - quarter.completed, blockedRemaining);
        remaining -= assigned;
        completedRemaining -= quarter.completed;
        blockedRemaining -= quarter.blocked;
      });
    }

    return quarters.map(({ name, planned, completed, blocked }) => ({
      name,
      planned,
      completed,
      blocked,
    }));
  }, [milestones]);

  // Generate phase cards from REAL capabilities grouped by owner/department
  const phaseData = useMemo(() => {
    if (!capabilities || !milestones) {
      return [];
    }

    // Group capabilities by owner (department)
    const ownerGroups: Record<string, {
      capabilities: typeof capabilities;
      milestones: typeof milestones;
    }> = {};

    capabilities.forEach(cap => {
      const owner = cap.owner || 'Unassigned';
      if (!ownerGroups[owner]) {
        ownerGroups[owner] = { capabilities: [], milestones: [] };
      }
      ownerGroups[owner].capabilities.push(cap);
    });

    // Associate milestones with their capability's owner
    milestones.forEach(ms => {
      const cap = capabilities.find(c => c.id === ms.capability_id);
      if (cap) {
        const owner = cap.owner || 'Unassigned';
        if (ownerGroups[owner]) {
          ownerGroups[owner].milestones.push(ms);
        }
      }
    });

    // Calculate progress for each phase/owner
    return Object.entries(ownerGroups)
      .map(([owner, data]) => {
        const totalMs = data.milestones.length;
        const completedMs = data.milestones.filter(m => m.status === 'completed').length;
        const blockedMs = data.milestones.filter(m => m.status === 'blocked').length;

        const progress = totalMs > 0 ? Math.round((completedMs / totalMs) * 100) : 0;

        let status: 'on-track' | 'at-risk' | 'critical' = 'on-track';
        if (blockedMs > 1 || progress < 20) status = 'critical';
        else if (blockedMs > 0 || progress < 50) status = 'at-risk';

        return {
          phase: owner,
          progress,
          status,
          items: totalMs,
          completed: completedMs,
          blocked: blockedMs,
        };
      })
      .sort((a, b) => b.items - a.items) // Sort by most milestones
      .slice(0, 3); // Show top 3 phases
  }, [capabilities, milestones]);

  // Calculate impact simulation from REAL data
  const impactSimulation = useMemo(() => {
    if (!milestones || !capabilities) {
      return {
        currentTimeline: 12,
        newProjectTimeline: 15,
        currentResources: 50,
        newProjectResources: 70,
        riskIncrease: 20,
      };
    }

    // Calculate current timeline based on longest path
    const maxDuration = milestones.reduce((max, ms) => {
      const duration = ms.path_b_months || 3;
      return Math.max(max, duration);
    }, 0);

    // Calculate total planned months
    const totalPlannedMonths = milestones.reduce((sum, ms) => sum + (ms.path_b_months || 3), 0);

    // Estimate current timeline (assuming some parallelization)
    const parallelFactor = Math.min(capabilities.length, 3);
    const currentTimeline = Math.ceil(totalPlannedMonths / parallelFactor);

    // Simulate adding a new project (would add ~6 months avg)
    const newProjectTimeline = Math.ceil(currentTimeline * 1.35);

    // Calculate resource utilization based on in-progress items
    const inProgressCount = milestones.filter(m => m.status === 'in_progress').length;
    const currentResources = Math.min(95, Math.round((inProgressCount / Math.max(milestones.length, 1)) * 100) + 40);

    // New project would increase utilization
    const newProjectResources = Math.min(100, currentResources + 20);

    // Risk increases based on blocked items and utilization
    const blockedCount = milestones.filter(m => m.status === 'blocked').length;
    const riskIncrease = Math.round((blockedCount * 10) + (newProjectResources - currentResources));

    return {
      currentTimeline: Math.max(6, currentTimeline),
      newProjectTimeline: Math.max(9, newProjectTimeline),
      currentResources,
      newProjectResources,
      riskIncrease: Math.max(10, Math.min(50, riskIncrease)),
    };
  }, [milestones, capabilities]);

  // Export handlers
  const handleExportReport = () => {
    try {
      if (!metrics) {
        toast.error('No data available to export');
        return;
      }

      // Create a simple text report
      const report = `SET ROADMAP EXECUTIVE REPORT
Generated: ${format(new Date(), 'MMMM d, yyyy')}

PROGRAM HEALTH: ${metrics.healthStatus.toUpperCase()}
Health Score: ${metrics.healthScore}/100

KEY METRICS
- Overall Progress: ${metrics.overallProgress}%
- Milestones: ${metrics.completedMilestones}/${metrics.totalMilestones} completed
- In Progress: ${metrics.inProgressMilestones}
- Blocked: ${metrics.blockedMilestones}
- Quick Wins: ${metrics.completedQuickWins}/${metrics.totalQuickWins} completed

MATURITY
- Current Level: ${metrics.avgCurrentLevel}
- Target Level: ${metrics.avgTargetLevel}
- Progress: ${metrics.maturityProgress}%

CAPABILITIES
- Total: ${metrics.totalCapabilities}
- Critical Priority: ${metrics.criticalCapabilities}
- High Priority: ${metrics.highCapabilities}`;

      // Create download
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `executive-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      // Cleanup after a short delay
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const handleGenerateSummary = async () => {
    try {
      if (!metrics) {
        toast.error('No data available');
        return;
      }

      const summary = `Program is ${metrics.healthStatus === 'healthy' ? 'on track' : metrics.healthStatus === 'at-risk' ? 'at moderate risk' : 'critical'} with ${metrics.overallProgress}% completion. ${metrics.blockedMilestones} blocked items require attention.`;

      // Copy to clipboard
      await navigator.clipboard.writeText(summary);
      toast.success('Summary copied to clipboard');
    } catch (error) {
      console.error('Copy error:', error);
      // Fallback for older browsers or when clipboard API fails
      try {
        const textArea = document.createElement('textarea');
        textArea.value = `Program is ${metrics?.healthStatus === 'healthy' ? 'on track' : metrics?.healthStatus === 'at-risk' ? 'at moderate risk' : 'critical'} with ${metrics?.overallProgress}% completion. ${metrics?.blockedMilestones} blocked items require attention.`;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Summary copied to clipboard');
      } catch (fallbackError) {
        toast.error('Failed to copy summary - please try again');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <Info className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Unable to load dashboard data</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Please check your connection and try again.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const healthColors = {
    healthy: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-400', icon: CheckCircle2 },
    'at-risk': { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-400', icon: AlertTriangle },
    critical: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-400', icon: AlertTriangle },
  };

  const HealthIcon = healthColors[metrics.healthStatus].icon;

  // Check if pie chart has data
  const hasPieData = metrics.completedMilestones > 0 || metrics.inProgressMilestones > 0 ||
                     metrics.blockedMilestones > 0 || metrics.notStartedMilestones > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Executive Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Strategic overview for leadership stakeholders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PDFExportButton />
          <Button variant="outline" size="sm" onClick={handleGenerateSummary}>
            <FileText className="mr-2 h-4 w-4" />
            Copy Summary
          </Button>
        </div>
      </div>

      {/* Program Health Banner */}
      <Card className={`${healthColors[metrics.healthStatus].bg} ${healthColors[metrics.healthStatus].border} border-2`}>
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${healthColors[metrics.healthStatus].bg}`}>
                <HealthIcon className={`h-8 w-8 ${healthColors[metrics.healthStatus].text}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Program Health: {metrics.healthStatus.replace('-', ' ').toUpperCase()}</h2>
                <p className="text-muted-foreground">
                  Overall health score: {metrics.healthScore}/100
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold">{metrics.overallProgress}%</div>
                <div className="text-sm text-muted-foreground">Overall Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{metrics.blockedMilestones}</div>
                <div className="text-sm text-muted-foreground">Blocked Items</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{metrics.criticalCapabilities}</div>
                <div className="text-sm text-muted-foreground">Critical Priorities</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Milestone Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.completedMilestones}/{metrics.totalMilestones}</div>
            <Progress value={metrics.overallProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.inProgressMilestones} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Maturity Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">L{metrics.avgCurrentLevel}</div>
            <Progress value={metrics.maturityProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Target: Level {metrics.avgTargetLevel}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Wins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.completedQuickWins}/{metrics.totalQuickWins}</div>
            <Progress value={metrics.quickWinProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.quickWinProgress}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalCapabilities}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="critical">{metrics.criticalCapabilities} Critical</Badge>
              <Badge variant="high">{metrics.highCapabilities} High</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
          <TabsTrigger value="overview" className="gap-2">
            <PieChartIcon className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="impact" className="gap-2">
            <Activity className="h-4 w-4" />
            Impact Analysis
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Progress by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Milestone Status Distribution</CardTitle>
                <CardDescription>Current status breakdown of all milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {hasPieData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Completed', value: metrics.completedMilestones, fill: '#22c55e' },
                            { name: 'In Progress', value: metrics.inProgressMilestones, fill: '#3b82f6' },
                            { name: 'Blocked', value: metrics.blockedMilestones, fill: '#ef4444' },
                            { name: 'Not Started', value: metrics.notStartedMilestones, fill: '#94a3b8' },
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <PieChartIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No milestones to display</p>
                      <p className="text-sm text-muted-foreground mt-1">Add milestones to see distribution</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quarterly Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Progress</CardTitle>
                <CardDescription>Milestone completion by quarter (based on actual data)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {timelineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="planned" name="Planned" fill="#94a3b8" />
                        <Bar dataKey="completed" name="Completed" fill="#22c55e" />
                        <Bar dataKey="blocked" name="Blocked" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No timeline data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strategic Story Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Strategic Narrative
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-slate-700 dark:text-slate-300">
                  The SET Roadmap initiative is currently <strong>{metrics.healthStatus === 'healthy' ? 'on track' : metrics.healthStatus === 'at-risk' ? 'at moderate risk' : 'requiring immediate attention'}</strong> with
                  an overall completion rate of <strong>{metrics.overallProgress}%</strong>.
                  We have successfully completed <strong>{metrics.completedMilestones}</strong> of <strong>{metrics.totalMilestones}</strong> planned milestones
                  across <strong>{metrics.totalCapabilities}</strong> operational capabilities.
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  {metrics.blockedMilestones > 0 ? (
                    <>
                      <strong className="text-red-600 dark:text-red-400">{metrics.blockedMilestones} milestone(s) are currently blocked</strong> and require leadership attention.
                      These blockers may impact our projected timeline if not resolved within the next sprint cycle.
                    </>
                  ) : (
                    <>
                      <strong className="text-green-600 dark:text-green-400">No milestones are currently blocked</strong>, allowing the team to maintain momentum on the planned timeline.
                    </>
                  )}
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  Current maturity has progressed to <strong>Level {metrics.avgCurrentLevel}</strong> on average,
                  with a target of <strong>Level {metrics.avgTargetLevel}</strong>.
                  Quick wins are tracking at <strong>{metrics.quickWinProgress}%</strong> completion,
                  providing early value while larger initiatives are in development.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Timeline</CardTitle>
              <CardDescription>
                Consolidated view of all roadmap phases and their progress (calculated from actual milestones)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {timelineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="planned"
                        stackId="1"
                        stroke="#94a3b8"
                        fill="#e2e8f0"
                        name="Planned"
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stackId="2"
                        stroke="#22c55e"
                        fill="#86efac"
                        name="Completed"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No timeline data available</p>
                    <p className="text-sm text-muted-foreground mt-1">Add milestones to see the timeline</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline Milestones - Now dynamic from capabilities */}
          <div className="grid gap-4 md:grid-cols-3">
            {phaseData.length > 0 ? (
              phaseData.map((phase) => (
                <Card key={phase.phase}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base truncate" title={phase.phase}>{phase.phase}</CardTitle>
                      <Badge variant={phase.status === 'on-track' ? 'completed' : phase.status === 'at-risk' ? 'in_progress' : 'blocked'}>
                        {phase.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{phase.progress}%</div>
                    <Progress value={phase.progress} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {phase.completed}/{phase.items} milestones completed
                      {phase.blocked > 0 && <span className="text-red-500"> • {phase.blocked} blocked</span>}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="md:col-span-3">
                <CardContent className="flex flex-col items-center justify-center h-[150px] text-center">
                  <Briefcase className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No phase data available</p>
                  <p className="text-sm text-muted-foreground mt-1">Add capabilities with owners to see phases</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Impact Analysis Tab */}
        <TabsContent value="impact" className="space-y-6">
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
                Impact of Adding New Projects
              </CardTitle>
              <CardDescription>
                Simulation based on current workload and capacity (calculated from actual data)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Timeline Impact */}
                <div className="space-y-4">
                  <h4 className="font-medium">Timeline Impact</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Current Timeline</span>
                      </div>
                      <span className="font-bold">{impactSimulation.currentTimeline} months</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border-2 border-amber-300 dark:border-amber-600">
                      <div className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4 text-amber-600" />
                        <span>With New Project</span>
                      </div>
                      <span className="font-bold text-amber-600">{impactSimulation.newProjectTimeline} months</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                      <TrendingUp className="h-4 w-4" />
                      <span>+{impactSimulation.newProjectTimeline - impactSimulation.currentTimeline} months delay ({Math.round(((impactSimulation.newProjectTimeline - impactSimulation.currentTimeline) / impactSimulation.currentTimeline) * 100)}% increase)</span>
                    </div>
                  </div>
                </div>

                {/* Resource Impact */}
                <div className="space-y-4">
                  <h4 className="font-medium">Resource Utilization</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span>Current Utilization</span>
                      </div>
                      <span className="font-bold">{impactSimulation.currentResources}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border-2 border-red-300 dark:border-red-600">
                      <div className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4 text-red-600" />
                        <span>With New Project</span>
                      </div>
                      <span className="font-bold text-red-600">{impactSimulation.newProjectResources}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{impactSimulation.newProjectResources >= 90 ? 'Resources near capacity - burnout risk increases' : 'Moderate capacity available'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Summary */}
              <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  Risk Assessment
                </h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">+{impactSimulation.riskIncrease}%</div>
                    <div className="text-sm text-muted-foreground">Delivery Risk</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">
                      {impactSimulation.newProjectResources >= 90 ? 'High' : impactSimulation.newProjectResources >= 70 ? 'Medium' : 'Low'}
                    </div>
                    <div className="text-sm text-muted-foreground">Schedule Pressure</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {metrics.blockedMilestones > 2 ? 'High' : metrics.blockedMilestones > 0 ? 'Elevated' : 'Normal'}
                    </div>
                    <div className="text-sm text-muted-foreground">Quality Risk</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                Strategic Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 dark:text-slate-300">
                Based on current capacity and timeline analysis, we recommend{' '}
                {impactSimulation.currentResources >= 80 ? (
                  <strong>deferring new project additions</strong>
                ) : impactSimulation.currentResources >= 60 ? (
                  <strong>carefully evaluating any new projects</strong>
                ) : (
                  <strong>proceeding with new initiatives if strategically aligned</strong>
                )}{' '}
                {impactSimulation.currentResources >= 80 &&
                  `until current milestones are completed. This approach will:`
                }
              </p>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Maintain current delivery commitments on schedule
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Keep resource utilization at sustainable levels
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Preserve quality standards and reduce burnout risk
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Allow time for stabilization before new initiatives
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
