// src/components/diagrams/TimelineGantt.tsx
import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useTimelineData } from '@/hooks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TimelineGanttProps {
  onMilestoneClick?: (id: string) => void;
}

const statusColors = {
  not_started: '#94a3b8',
  in_progress: '#3b82f6',
  completed: '#22c55e',
  blocked: '#ef4444',
};

export function TimelineGantt({ onMilestoneClick }: TimelineGanttProps) {
  const [selectedPath, setSelectedPath] = useState<'A' | 'B' | 'C'>('B');
  const { data: timelineData, isLoading } = useTimelineData(selectedPath);

  // Transform data for Gantt-style chart
  const chartData = useMemo(() => {
    if (!timelineData) return [];

    // Group by capability
    const byCapability: Record<string, typeof timelineData> = {};
    timelineData.forEach((item) => {
      if (!byCapability[item.capability]) {
        byCapability[item.capability] = [];
      }
      byCapability[item.capability].push(item);
    });

    // Calculate cumulative months for each capability
    const result: any[] = [];
    let startMonth = 0;

    Object.entries(byCapability).forEach(([capability, milestones]) => {
      let capStartMonth = startMonth;
      
      milestones.forEach((ms) => {
        result.push({
          id: ms.id,
          name: ms.name,
          capability,
          start: capStartMonth,
          duration: ms.duration,
          end: capStartMonth + ms.duration,
          status: ms.status,
          color: ms.capabilityColor,
        });
        capStartMonth += ms.duration;
      });
    });

    return result;
  }, [timelineData]);

  // Calculate total months for X axis
  const totalMonths = useMemo(() => {
    if (chartData.length === 0) return 24;
    return Math.max(...chartData.map((d) => d.end), 24);
  }, [chartData]);

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full rounded-lg" />;
  }

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
        <div className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
            >
              <XAxis
                type="number"
                domain={[0, totalMonths]}
                tickFormatter={(v) => `M${v}`}
                ticks={Array.from({ length: Math.ceil(totalMonths / 3) + 1 }, (_, i) => i * 3)}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border rounded-lg shadow-lg p-3">
                      <p className="font-semibold">{data.name}</p>
                      <p className="text-sm text-muted-foreground">{data.capability}</p>
                      <div className="mt-2 text-sm">
                        <p>Start: Month {data.start}</p>
                        <p>Duration: {data.duration} months</p>
                        <p>End: Month {data.end}</p>
                      </div>
                    </div>
                  );
                }}
              />
              {/* Current month indicator */}
              <ReferenceLine
                x={0}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{ value: 'Now', position: 'top' }}
              />
              {/* Bars */}
              <Bar
                dataKey="duration"
                radius={[4, 4, 4, 4]}
                onClick={(data) => onMilestoneClick?.(data.id)}
                cursor="pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={statusColors[entry.status as keyof typeof statusColors]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-muted-foreground capitalize">
                {status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
