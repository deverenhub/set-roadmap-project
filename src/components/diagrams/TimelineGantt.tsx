// src/components/diagrams/TimelineGantt.tsx
import { useMemo, useState, useCallback } from 'react';
import { useTimelineData } from '@/hooks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TimelineGanttProps {
  onMilestoneClick?: (id: string) => void;
}

const statusColors = {
  not_started: { bg: 'bg-slate-400', text: 'text-slate-50', hex: '#94a3b8' },
  in_progress: { bg: 'bg-blue-500', text: 'text-blue-50', hex: '#3b82f6' },
  completed: { bg: 'bg-green-500', text: 'text-green-50', hex: '#22c55e' },
  blocked: { bg: 'bg-red-500', text: 'text-red-50', hex: '#ef4444' },
};

interface GanttItem {
  id: string;
  name: string;
  capability: string;
  capabilityColor: string;
  start: number;
  duration: number;
  end: number;
  status: string;
  priority: string;
}

export function TimelineGantt({ onMilestoneClick }: TimelineGanttProps) {
  const [selectedPath, setSelectedPath] = useState<'A' | 'B' | 'C'>('B');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { data: timelineData, isLoading } = useTimelineData(selectedPath);

  // Transform data for Gantt-style chart with proper positioning
  const { chartData, totalMonths, capabilityGroups } = useMemo(() => {
    if (!timelineData || timelineData.length === 0) {
      return { chartData: [], totalMonths: 24, capabilityGroups: [] };
    }

    // Group by capability and calculate start positions
    const byCapability: Record<string, typeof timelineData> = {};
    timelineData.forEach((item) => {
      if (!byCapability[item.capability]) {
        byCapability[item.capability] = [];
      }
      byCapability[item.capability].push(item);
    });

    // Sort capabilities by priority
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const sortedCapabilities = Object.entries(byCapability).sort((a, b) => {
      const aPriority = priorityOrder[a[1][0]?.priority as keyof typeof priorityOrder] ?? 2;
      const bPriority = priorityOrder[b[1][0]?.priority as keyof typeof priorityOrder] ?? 2;
      return aPriority - bPriority;
    });

    const result: GanttItem[] = [];
    const groups: Array<{ name: string; color: string; startIdx: number; count: number }> = [];

    sortedCapabilities.forEach(([capability, milestones]) => {
      groups.push({
        name: capability,
        color: milestones[0]?.capabilityColor || '#3b82f6',
        startIdx: result.length,
        count: milestones.length,
      });

      let capStartMonth = 0;
      milestones.forEach((ms) => {
        result.push({
          id: ms.id,
          name: ms.name,
          capability,
          capabilityColor: ms.capabilityColor,
          start: capStartMonth,
          duration: ms.duration,
          end: capStartMonth + ms.duration,
          status: ms.status,
          priority: ms.priority,
        });
        capStartMonth += ms.duration;
      });
    });

    const maxMonth = Math.max(...result.map((d) => d.end), 24);
    return { chartData: result, totalMonths: maxMonth, capabilityGroups: groups };
  }, [timelineData]);

  // Generate month ticks
  const monthTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let i = 0; i <= totalMonths; i += 3) {
      ticks.push(i);
    }
    return ticks;
  }, [totalMonths]);

  const handleBarClick = useCallback((id: string) => {
    onMilestoneClick?.(id);
  }, [onMilestoneClick]);

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full rounded-lg" />;
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Implementation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            No milestones found. Add milestones to see the timeline.
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartHeight = Math.max(400, chartData.length * 40 + 60);
  const barHeight = 28;
  const rowHeight = 40;
  const leftMargin = 180;
  const rightMargin = 30;
  const topMargin = 30;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Implementation Timeline</CardTitle>
        <Select
          value={selectedPath}
          onValueChange={(v) => setSelectedPath(v as 'A' | 'B' | 'C')}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">Path A (Aggressive)</SelectItem>
            <SelectItem value="B">Path B (Balanced)</SelectItem>
            <SelectItem value="C">Path C (Conservative)</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg
            width="100%"
            height={chartHeight}
            viewBox={`0 0 ${leftMargin + 600 + rightMargin} ${chartHeight}`}
            preserveAspectRatio="xMinYMin meet"
            className="min-w-[800px]"
          >
            {/* Grid lines */}
            {monthTicks.map((month) => {
              const x = leftMargin + (month / totalMonths) * 600;
              return (
                <g key={`tick-${month}`}>
                  <line
                    x1={x}
                    y1={topMargin}
                    x2={x}
                    y2={chartHeight - 20}
                    stroke="#e5e7eb"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={x}
                    y={topMargin - 10}
                    textAnchor="middle"
                    className="text-xs fill-muted-foreground"
                  >
                    M{month}
                  </text>
                </g>
              );
            })}

            {/* "Now" reference line */}
            <line
              x1={leftMargin}
              y1={topMargin}
              x2={leftMargin}
              y2={chartHeight - 20}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
            <text
              x={leftMargin}
              y={topMargin - 10}
              textAnchor="middle"
              className="text-xs fill-red-500 font-medium"
            >
              Now
            </text>

            {/* Capability group backgrounds */}
            {capabilityGroups.map((group, idx) => {
              const y = topMargin + group.startIdx * rowHeight;
              const height = group.count * rowHeight;
              return (
                <rect
                  key={`group-bg-${idx}`}
                  x={0}
                  y={y}
                  width={leftMargin - 10}
                  height={height}
                  fill={group.color}
                  fillOpacity={0.1}
                  rx={4}
                />
              );
            })}

            {/* Rows and bars */}
            <TooltipProvider>
              {chartData.map((item, idx) => {
                const y = topMargin + idx * rowHeight;
                const barY = y + (rowHeight - barHeight) / 2;
                const barX = leftMargin + (item.start / totalMonths) * 600;
                const barWidth = Math.max((item.duration / totalMonths) * 600, 20);
                const statusStyle = statusColors[item.status as keyof typeof statusColors] || statusColors.not_started;
                const isHovered = hoveredItem === item.id;

                return (
                  <g key={item.id}>
                    {/* Row background on hover */}
                    {isHovered && (
                      <rect
                        x={0}
                        y={y}
                        width={leftMargin + 600 + rightMargin}
                        height={rowHeight}
                        fill="#f3f4f6"
                      />
                    )}

                    {/* Milestone name (left side) */}
                    <text
                      x={leftMargin - 15}
                      y={y + rowHeight / 2}
                      textAnchor="end"
                      dominantBaseline="middle"
                      className={cn(
                        "text-xs",
                        isHovered ? "fill-foreground font-medium" : "fill-muted-foreground"
                      )}
                    >
                      {item.name.length > 22 ? item.name.slice(0, 22) + '...' : item.name}
                    </text>

                    {/* Gantt bar */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <rect
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={barHeight}
                          rx={4}
                          fill={statusStyle.hex}
                          className={cn(
                            "cursor-pointer transition-all duration-150",
                            isHovered && "filter brightness-110"
                          )}
                          onMouseEnter={() => setHoveredItem(item.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                          onClick={() => handleBarClick(item.id)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.capability}</p>
                          <div className="text-xs space-y-0.5 pt-1">
                            <p>Start: Month {item.start}</p>
                            <p>Duration: {item.duration} months</p>
                            <p>End: Month {item.end}</p>
                            <p className="capitalize">Status: {item.status.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    {/* Duration label inside bar (if wide enough) */}
                    {barWidth > 40 && (
                      <text
                        x={barX + barWidth / 2}
                        y={barY + barHeight / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs fill-white font-medium pointer-events-none"
                      >
                        {item.duration}mo
                      </text>
                    )}
                  </g>
                );
              })}
            </TooltipProvider>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 pt-4 border-t">
          {Object.entries(statusColors).map(([status, colors]) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded"
                style={{ backgroundColor: colors.hex }}
              />
              <span className="text-sm text-muted-foreground capitalize">
                {status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>

        {/* Path description */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {selectedPath === 'A' && 'Aggressive: Fastest implementation with maximum resource allocation'}
          {selectedPath === 'B' && 'Balanced: Moderate pace balancing speed and resources'}
          {selectedPath === 'C' && 'Conservative: Careful implementation with minimal risk'}
        </div>
      </CardContent>
    </Card>
  );
}
