// src/components/executive/CrossFacilityView.tsx
// Cross-facility comparison view for enterprise dashboards
import { useMemo } from 'react';
import { useAllFacilities, useCapabilities, useMilestones } from '@/hooks';
import { useFacilityStore } from '@/stores/facilityStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { missionInfo } from '@/components/capabilities/MissionFilter';
import type { Mission, Facility } from '@/types';

interface FacilityMetrics {
  facility: Facility;
  totalCapabilities: number;
  avgCurrentLevel: number;
  avgTargetLevel: number;
  maturityProgress: number;
  totalMilestones: number;
  completedMilestones: number;
  blockedMilestones: number;
  milestoneProgress: number;
  missionProgress: {
    mission_1: number;
    mission_2: number;
    mission_3: number;
  };
  healthStatus: 'healthy' | 'at-risk' | 'critical';
}

export function CrossFacilityView() {
  const { data: facilities, isLoading: loadingFacilities } = useAllFacilities();
  const { data: allCapabilities, isLoading: loadingCaps } = useCapabilities({ facilityId: null });
  const { data: allMilestones, isLoading: loadingMs } = useMilestones({ facilityId: null });
  const { setCurrentFacilityId } = useFacilityStore();

  const isLoading = loadingFacilities || loadingCaps || loadingMs;

  // Calculate metrics for each facility
  const facilityMetrics: FacilityMetrics[] = useMemo(() => {
    if (!facilities || !allCapabilities || !allMilestones) return [];

    return facilities.map((facility) => {
      // Filter data for this facility
      const capabilities = allCapabilities.filter(c => c.facility_id === facility.id);
      const milestones = allMilestones.filter(m => m.facility_id === facility.id);

      // Calculate capability metrics
      const totalCapabilities = capabilities.length;
      const avgCurrentLevel = totalCapabilities > 0
        ? capabilities.reduce((acc, c) => acc + c.current_level, 0) / totalCapabilities
        : 0;
      const avgTargetLevel = totalCapabilities > 0
        ? capabilities.reduce((acc, c) => acc + c.target_level, 0) / totalCapabilities
        : 5;
      const maturityProgress = avgTargetLevel > 1 && avgCurrentLevel >= 1
        ? Math.round(((avgCurrentLevel - 1) / (avgTargetLevel - 1)) * 100)
        : 0;

      // Calculate milestone metrics
      const totalMilestones = milestones.length;
      const completedMilestones = milestones.filter(m => m.status === 'completed').length;
      const blockedMilestones = milestones.filter(m => m.status === 'blocked').length;
      const milestoneProgress = totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;

      // Calculate mission progress
      const getMissionProgress = (mission: Mission) => {
        const missionCaps = capabilities.filter(c => c.mission === mission);
        if (missionCaps.length === 0) return 0;
        const avgLevel = missionCaps.reduce((acc, c) => acc + c.current_level, 0) / missionCaps.length;
        const avgTarget = missionCaps.reduce((acc, c) => acc + c.target_level, 0) / missionCaps.length;
        return avgTarget > 1 ? Math.round(((avgLevel - 1) / (avgTarget - 1)) * 100) : 0;
      };

      const missionProgress = {
        mission_1: getMissionProgress('mission_1'),
        mission_2: getMissionProgress('mission_2'),
        mission_3: getMissionProgress('mission_3'),
      };

      // Determine health status
      let healthStatus: 'healthy' | 'at-risk' | 'critical' = 'healthy';
      if (blockedMilestones > 2 || milestoneProgress < 20) healthStatus = 'critical';
      else if (blockedMilestones > 0 || milestoneProgress < 50) healthStatus = 'at-risk';

      return {
        facility,
        totalCapabilities,
        avgCurrentLevel,
        avgTargetLevel,
        maturityProgress,
        totalMilestones,
        completedMilestones,
        blockedMilestones,
        milestoneProgress,
        missionProgress,
        healthStatus,
      };
    });
  }, [facilities, allCapabilities, allMilestones]);

  // Prepare chart data for maturity comparison
  const maturityComparisonData = useMemo(() => {
    return facilityMetrics.map(fm => ({
      name: fm.facility.code,
      current: Number(fm.avgCurrentLevel.toFixed(1)),
      target: Number(fm.avgTargetLevel.toFixed(1)),
      progress: fm.maturityProgress,
    }));
  }, [facilityMetrics]);

  // Prepare radar chart data for mission comparison
  const missionComparisonData = useMemo(() => {
    return [
      {
        mission: 'Mission I',
        ...facilityMetrics.reduce((acc, fm) => ({
          ...acc,
          [fm.facility.code]: fm.missionProgress.mission_1,
        }), {}),
      },
      {
        mission: 'Mission II',
        ...facilityMetrics.reduce((acc, fm) => ({
          ...acc,
          [fm.facility.code]: fm.missionProgress.mission_2,
        }), {}),
      },
      {
        mission: 'Mission III',
        ...facilityMetrics.reduce((acc, fm) => ({
          ...acc,
          [fm.facility.code]: fm.missionProgress.mission_3,
        }), {}),
      },
    ];
  }, [facilityMetrics]);

  // Calculate enterprise-wide totals
  const enterpriseMetrics = useMemo(() => {
    if (facilityMetrics.length === 0) return null;

    const totalCapabilities = facilityMetrics.reduce((sum, fm) => sum + fm.totalCapabilities, 0);
    const totalMilestones = facilityMetrics.reduce((sum, fm) => sum + fm.totalMilestones, 0);
    const completedMilestones = facilityMetrics.reduce((sum, fm) => sum + fm.completedMilestones, 0);
    const blockedMilestones = facilityMetrics.reduce((sum, fm) => sum + fm.blockedMilestones, 0);

    const avgMaturity = facilityMetrics.reduce((sum, fm) => sum + fm.avgCurrentLevel, 0) / facilityMetrics.length;
    const avgProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    const activeFacilities = facilityMetrics.filter(fm => fm.facility.status === 'active').length;
    const facilitiesAtRisk = facilityMetrics.filter(fm => fm.healthStatus !== 'healthy').length;

    return {
      totalCapabilities,
      totalMilestones,
      completedMilestones,
      blockedMilestones,
      avgMaturity: avgMaturity.toFixed(1),
      avgProgress,
      totalFacilities: facilityMetrics.length,
      activeFacilities,
      facilitiesAtRisk,
    };
  }, [facilityMetrics]);

  const handleNavigateToFacility = (facilityId: string) => {
    setCurrentFacilityId(facilityId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!enterpriseMetrics || facilityMetrics.length === 0) {
    return (
      <Card className="py-12">
        <CardContent className="flex flex-col items-center justify-center text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No facility data available</h3>
          <p className="text-muted-foreground mt-1">
            Add facilities to see the cross-facility comparison view.
          </p>
        </CardContent>
      </Card>
    );
  }

  const healthColors = {
    healthy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'at-risk': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const facilityColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Enterprise Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Total Facilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{enterpriseMetrics.totalFacilities}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {enterpriseMetrics.activeFacilities} active • {enterpriseMetrics.facilitiesAtRisk} at risk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Enterprise Maturity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">L{enterpriseMetrics.avgMaturity}</div>
            <Progress value={Number(enterpriseMetrics.avgMaturity) * 20} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Average across all facilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Milestone Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{enterpriseMetrics.avgProgress}%</div>
            <Progress value={enterpriseMetrics.avgProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {enterpriseMetrics.completedMilestones}/{enterpriseMetrics.totalMilestones} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Blocked Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{enterpriseMetrics.blockedMilestones}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all facilities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Facility Comparison Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {facilityMetrics.map((fm, index) => (
          <Card
            key={fm.facility.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleNavigateToFacility(fm.facility.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: facilityColors[index % facilityColors.length] }}
                  />
                  <CardTitle className="text-lg">{fm.facility.name}</CardTitle>
                </div>
                <Badge className={healthColors[fm.healthStatus]}>
                  {fm.healthStatus.replace('-', ' ')}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {fm.facility.location_city}, {fm.facility.location_state}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Maturity */}
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Maturity</span>
                  <span className="font-medium">L{fm.avgCurrentLevel.toFixed(1)} / L{fm.avgTargetLevel.toFixed(1)}</span>
                </div>
                <Progress value={fm.maturityProgress} className="mt-1" />
              </div>

              {/* Milestones */}
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Milestones</span>
                  <span className="font-medium">{fm.completedMilestones}/{fm.totalMilestones}</span>
                </div>
                <Progress value={fm.milestoneProgress} className="mt-1" />
              </div>

              {/* Mission Progress Mini */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">M-I</div>
                  <div className="text-sm font-medium">{fm.missionProgress.mission_1}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">M-II</div>
                  <div className="text-sm font-medium">{fm.missionProgress.mission_2}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">M-III</div>
                  <div className="text-sm font-medium">{fm.missionProgress.mission_3}%</div>
                </div>
              </div>

              {/* View Details */}
              <Button variant="ghost" size="sm" className="w-full">
                View Details <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Maturity Comparison Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Maturity Level Comparison</CardTitle>
            <CardDescription>Current vs target maturity by facility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maturityComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" name="Current Level" fill="#3b82f6" />
                  <Bar dataKey="target" name="Target Level" fill="#e2e8f0" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mission Progress Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Mission Progress Comparison</CardTitle>
            <CardDescription>Progress by mission across facilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={missionComparisonData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="mission" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  {facilityMetrics.map((fm, index) => (
                    <Radar
                      key={fm.facility.id}
                      name={fm.facility.code}
                      dataKey={fm.facility.code}
                      stroke={facilityColors[index % facilityColors.length]}
                      fill={facilityColors[index % facilityColors.length]}
                      fillOpacity={0.2}
                    />
                  ))}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mission Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mission Progress by Facility</CardTitle>
          <CardDescription>Detailed breakdown of strategic mission completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Facility</th>
                  <th className="text-center py-3 px-4 font-medium">
                    <div className="flex flex-col items-center">
                      <span>Mission I</span>
                      <span className="text-xs text-muted-foreground font-normal">Setting the Standard</span>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    <div className="flex flex-col items-center">
                      <span>Mission II</span>
                      <span className="text-xs text-muted-foreground font-normal">Flexible Operations</span>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    <div className="flex flex-col items-center">
                      <span>Mission III</span>
                      <span className="text-xs text-muted-foreground font-normal">Evolving Workforce</span>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium">Overall</th>
                </tr>
              </thead>
              <tbody>
                {facilityMetrics.map((fm, index) => {
                  const overallProgress = Math.round(
                    (fm.missionProgress.mission_1 + fm.missionProgress.mission_2 + fm.missionProgress.mission_3) / 3
                  );
                  return (
                    <tr key={fm.facility.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: facilityColors[index % facilityColors.length] }}
                          />
                          <span className="font-medium">{fm.facility.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {fm.facility.code}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-medium">{fm.missionProgress.mission_1}%</span>
                          <Progress value={fm.missionProgress.mission_1} className="h-2 w-20" />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-medium">{fm.missionProgress.mission_2}%</span>
                          <Progress value={fm.missionProgress.mission_2} className="h-2 w-20" />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-medium">{fm.missionProgress.mission_3}%</span>
                          <Progress value={fm.missionProgress.mission_3} className="h-2 w-20" />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold">{overallProgress}%</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {overallProgress > 50 ? (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : overallProgress > 25 ? (
                              <Minus className="h-3 w-3 text-yellow-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
