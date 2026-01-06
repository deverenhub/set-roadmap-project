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
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Users,
  DollarSign,
  Calendar,
  ArrowRight,
  Briefcase,
  Shield,
  Zap,
  PlusCircle,
  MinusCircle,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
  FileText,
  Download,
} from 'lucide-react';

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
    const avgCurrentLevel = capabilities.reduce((acc, c) => acc + c.current_level, 0) / (capabilities.length || 1);
    const avgTargetLevel = capabilities.reduce((acc, c) => acc + c.target_level, 0) / (capabilities.length || 1);
    const maturityProgress = avgTargetLevel > 1
      ? Math.round(((avgCurrentLevel - 1) / (avgTargetLevel - 1)) * 100)
      : 100;

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

  // Generate timeline data for roadmap phases
  const timelineData = useMemo(() => {
    const phases = [
      { name: 'Q1 2024', planned: 4, completed: 4, blocked: 0 },
      { name: 'Q2 2024', planned: 6, completed: 5, blocked: 1 },
      { name: 'Q3 2024', planned: 5, completed: 3, blocked: 0 },
      { name: 'Q4 2024', planned: 7, completed: 2, blocked: 1 },
      { name: 'Q1 2025', planned: 8, completed: 0, blocked: 0 },
      { name: 'Q2 2025', planned: 6, completed: 0, blocked: 0 },
    ];
    return phases;
  }, []);

  // Capacity impact data (simulated)
  const capacityData = useMemo(() => {
    return [
      { name: 'Current Load', value: 75, fill: '#3b82f6' },
      { name: 'Available', value: 25, fill: '#e2e8f0' },
    ];
  }, []);

  // Project impact simulation data
  const impactSimulation = useMemo(() => {
    return {
      currentTimeline: 18, // months
      newProjectTimeline: 24, // months
      currentResources: 75, // percentage utilized
      newProjectResources: 95,
      riskIncrease: 35, // percentage
    };
  }, []);

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
    return <div>Unable to load dashboard data</div>;
  }

  const healthColors = {
    healthy: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: CheckCircle2 },
    'at-risk': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: AlertTriangle },
    critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: AlertTriangle },
  };

  const HealthIcon = healthColors[metrics.healthStatus].icon;

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
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Generate Summary
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
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: metrics.completedMilestones, fill: '#22c55e' },
                          { name: 'In Progress', value: metrics.inProgressMilestones, fill: '#3b82f6' },
                          { name: 'Blocked', value: metrics.blockedMilestones, fill: '#ef4444' },
                          { name: 'Not Started', value: metrics.notStartedMilestones, fill: '#94a3b8' },
                        ]}
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
                </div>
              </CardContent>
            </Card>

            {/* Quarterly Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Progress</CardTitle>
                <CardDescription>Milestone completion by quarter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strategic Story Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Strategic Narrative
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p className="text-slate-700">
                  The SET Roadmap initiative is currently <strong>{metrics.healthStatus === 'healthy' ? 'on track' : metrics.healthStatus === 'at-risk' ? 'at moderate risk' : 'requiring immediate attention'}</strong> with
                  an overall completion rate of <strong>{metrics.overallProgress}%</strong>.
                  We have successfully completed <strong>{metrics.completedMilestones}</strong> of <strong>{metrics.totalMilestones}</strong> planned milestones
                  across <strong>{metrics.totalCapabilities}</strong> operational capabilities.
                </p>
                <p className="text-slate-700">
                  {metrics.blockedMilestones > 0 ? (
                    <>
                      <strong className="text-red-600">{metrics.blockedMilestones} milestone(s) are currently blocked</strong> and require leadership attention.
                      These blockers may impact our projected timeline if not resolved within the next sprint cycle.
                    </>
                  ) : (
                    <>
                      <strong className="text-green-600">No milestones are currently blocked</strong>, allowing the team to maintain momentum on the planned timeline.
                    </>
                  )}
                </p>
                <p className="text-slate-700">
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
                Consolidated view of all roadmap phases and their progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
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
              </div>
            </CardContent>
          </Card>

          {/* Timeline Milestones */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { phase: 'Inventory Management', progress: 75, status: 'on-track' as const, items: 4 },
              { phase: 'Production Monitoring', progress: 45, status: 'at-risk' as const, items: 6 },
              { phase: 'Planning & Scheduling', progress: 20, status: 'on-track' as const, items: 5 },
            ].map((roadmap) => (
              <Card key={roadmap.phase}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{roadmap.phase}</CardTitle>
                    <Badge variant={roadmap.status === 'on-track' ? 'completed' : 'in_progress'}>
                      {roadmap.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{roadmap.progress}%</div>
                  <Progress value={roadmap.progress} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {roadmap.items} milestones in this phase
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Impact Analysis Tab */}
        <TabsContent value="impact" className="space-y-6">
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
                Impact of Adding New Projects
              </CardTitle>
              <CardDescription>
                Simulation showing how additional projects affect current roadmap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Timeline Impact */}
                <div className="space-y-4">
                  <h4 className="font-medium">Timeline Impact</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Current Timeline</span>
                      </div>
                      <span className="font-bold">{impactSimulation.currentTimeline} months</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-amber-300">
                      <div className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4 text-amber-600" />
                        <span>With New Project</span>
                      </div>
                      <span className="font-bold text-amber-600">{impactSimulation.newProjectTimeline} months</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-700">
                      <TrendingUp className="h-4 w-4" />
                      <span>+{impactSimulation.newProjectTimeline - impactSimulation.currentTimeline} months delay ({Math.round(((impactSimulation.newProjectTimeline - impactSimulation.currentTimeline) / impactSimulation.currentTimeline) * 100)}% increase)</span>
                    </div>
                  </div>
                </div>

                {/* Resource Impact */}
                <div className="space-y-4">
                  <h4 className="font-medium">Resource Utilization</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span>Current Utilization</span>
                      </div>
                      <span className="font-bold">{impactSimulation.currentResources}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-red-300">
                      <div className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4 text-red-600" />
                        <span>With New Project</span>
                      </div>
                      <span className="font-bold text-red-600">{impactSimulation.newProjectResources}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Resources near capacity - burnout risk increases</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Summary */}
              <div className="mt-6 p-4 bg-white rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  Risk Assessment
                </h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">+{impactSimulation.riskIncrease}%</div>
                    <div className="text-sm text-muted-foreground">Delivery Risk</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">High</div>
                    <div className="text-sm text-muted-foreground">Schedule Pressure</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">Elevated</div>
                    <div className="text-sm text-muted-foreground">Quality Risk</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                Strategic Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                Based on current capacity and timeline analysis, we recommend <strong>deferring new project additions</strong> until
                Q2 2025 when current Phase 2 milestones are expected to complete. This approach will:
              </p>
              <ul className="space-y-2 text-slate-700">
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
