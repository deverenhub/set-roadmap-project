// src/components/dashboard/QoLImpactChart.tsx
import { useMemo } from 'react';
import { useCapabilities } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Users, Clock, DollarSign, Shield } from 'lucide-react';

// QoL impact categories with icons
const impactCategories: Record<string, { icon: typeof Sparkles; color: string; label: string }> = {
  efficiency: { icon: TrendingUp, color: '#22c55e', label: 'Efficiency' },
  productivity: { icon: Clock, color: '#3b82f6', label: 'Productivity' },
  cost_savings: { icon: DollarSign, color: '#eab308', label: 'Cost Savings' },
  employee_experience: { icon: Users, color: '#a855f7', label: 'Employee Experience' },
  reliability: { icon: Shield, color: '#06b6d4', label: 'Reliability' },
  default: { icon: Sparkles, color: '#f97316', label: 'Quality of Life' },
};

interface QoLImpactChartProps {
  limit?: number;
}

export function QoLImpactChart({ limit = 6 }: QoLImpactChartProps) {
  const navigate = useNavigate();
  const { data: capabilities, isLoading } = useCapabilities();

  // Process capabilities to extract QoL impact data
  const qolData = useMemo(() => {
    if (!capabilities) return [];

    return capabilities
      .filter((cap) => cap.qol_impact)
      .slice(0, limit)
      .map((cap) => {
        // Parse QoL impact to determine category
        const qolText = (cap.qol_impact || '').toLowerCase();
        let category = 'default';

        if (qolText.includes('efficien') || qolText.includes('streamlin')) {
          category = 'efficiency';
        } else if (qolText.includes('productiv') || qolText.includes('time') || qolText.includes('faster')) {
          category = 'productivity';
        } else if (qolText.includes('cost') || qolText.includes('sav') || qolText.includes('reduc')) {
          category = 'cost_savings';
        } else if (qolText.includes('employ') || qolText.includes('user') || qolText.includes('experience')) {
          category = 'employee_experience';
        } else if (qolText.includes('reliab') || qolText.includes('secur') || qolText.includes('safe')) {
          category = 'reliability';
        }

        // Calculate impact score based on priority and progress
        const progress = cap.target_level > 1
          ? ((cap.current_level - 1) / (cap.target_level - 1)) * 100
          : 100;
        const priorityMultiplier =
          cap.priority === 'CRITICAL' ? 1.5 :
          cap.priority === 'HIGH' ? 1.25 :
          cap.priority === 'MEDIUM' ? 1 : 0.75;
        const impactScore = Math.min(100, Math.round(progress * priorityMultiplier));

        return {
          id: cap.id,
          name: cap.name,
          qolImpact: cap.qol_impact,
          category,
          categoryInfo: impactCategories[category] || impactCategories.default,
          impactScore,
          progress,
          priority: cap.priority,
          currentLevel: cap.current_level,
          targetLevel: cap.target_level,
          color: cap.color || impactCategories[category]?.color || '#94a3b8',
        };
      })
      .sort((a, b) => b.impactScore - a.impactScore);
  }, [capabilities, limit]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>QoL Impact by Capability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (qolData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>QoL Impact by Capability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mb-4 opacity-50" />
            <p>No QoL impact data available</p>
            <p className="text-sm">Add QoL impact descriptions to capabilities</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-set-gold" />
          Quality of Life Impact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="space-y-4">
            {qolData.map((item) => {
              const Icon = item.categoryInfo.icon;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <div
                      className="group cursor-pointer rounded-lg border p-3 hover:bg-set-teal-50 hover:border-set-teal-200 transition-all"
                      onClick={() => navigate(`/capabilities/${item.id}`)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="p-2 rounded-lg shrink-0"
                          style={{ backgroundColor: `${item.categoryInfo.color}20` }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{ color: item.categoryInfo.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-medium text-sm truncate group-hover:text-set-teal-700">
                              {item.name}
                            </h4>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: `${item.categoryInfo.color}20`,
                                color: item.categoryInfo.color,
                              }}
                            >
                              {item.categoryInfo.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {item.qolImpact}
                          </p>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Impact Score</span>
                              <span className="font-medium">{item.impactScore}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${item.impactScore}%`,
                                  backgroundColor: item.categoryInfo.color,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs">{item.qolImpact}</p>
                      <div className="text-xs pt-1 border-t">
                        <p>Level: {item.currentLevel} → {item.targetLevel}</p>
                        <p>Priority: {item.priority}</p>
                        <p>Progress: {Math.round(item.progress)}%</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            {Object.entries(
              qolData.reduce((acc, item) => {
                acc[item.category] = (acc[item.category] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            )
              .slice(0, 3)
              .map(([category, count]) => {
                const info = impactCategories[category] || impactCategories.default;
                const Icon = info.icon;
                return (
                  <div key={category} className="flex flex-col items-center">
                    <Icon className="h-4 w-4 mb-1" style={{ color: info.color }} />
                    <span className="text-sm font-medium">{count}</span>
                    <span className="text-xs text-muted-foreground">{info.label}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
