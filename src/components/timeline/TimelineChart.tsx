// src/components/timeline/TimelineChart.tsx
import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, addMonths, startOfMonth, differenceInDays, differenceInMonths, isSameMonth } from 'date-fns';
import type { TimelineViewMode } from './TimelineHeader';

export interface TimelineItem {
  id: string;
  name: string;
  capability: string;
  capabilityId: string;
  capabilityColor: string;
  priority: string;
  duration: number;
  status: string;
  startMonth: number; // Relative month from project start
}

interface TimelineChartProps {
  items: TimelineItem[];
  viewMode: TimelineViewMode;
  zoomLevel: number;
  projectStartDate: Date;
  onItemClick?: (id: string) => void;
  onItemDrop?: (id: string, newStartMonth: number) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  not_started: { bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-300 dark:border-slate-600', text: 'text-slate-700 dark:text-slate-300' },
  in_progress: { bg: 'bg-blue-100 dark:bg-blue-900/50', border: 'border-blue-400 dark:border-blue-500', text: 'text-blue-700 dark:text-blue-300' },
  completed: { bg: 'bg-emerald-100 dark:bg-emerald-900/50', border: 'border-emerald-400 dark:border-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
  blocked: { bg: 'bg-red-100 dark:bg-red-900/50', border: 'border-red-400 dark:border-red-500', text: 'text-red-700 dark:text-red-300' },
};

const priorityColors: Record<string, string> = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-slate-400',
};

interface DraggableMilestoneProps {
  item: TimelineItem;
  left: number;
  width: number;
  onClick?: () => void;
}

function DraggableMilestone({ item, left, width, onClick }: DraggableMilestoneProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: item,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    left,
    width: Math.max(width, 60),
  };

  const status = statusColors[item.status] || statusColors.not_started;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={cn(
              "absolute h-10 rounded-lg border-2 cursor-grab active:cursor-grabbing",
              "flex items-center px-3 gap-2 transition-all duration-150",
              "hover:shadow-lg hover:scale-[1.02] hover:z-20",
              status.bg,
              status.border,
              isDragging && "opacity-50 z-50 shadow-xl scale-105"
            )}
          >
            {/* Priority indicator */}
            <div className={cn("w-2 h-2 rounded-full flex-shrink-0", priorityColors[item.priority] || priorityColors.MEDIUM)} />

            {/* Milestone name */}
            <span className={cn("text-sm font-medium truncate", status.text)}>
              {width > 100 ? item.name : item.name.slice(0, 10) + (item.name.length > 10 ? '...' : '')}
            </span>

            {/* Duration badge */}
            {width > 80 && (
              <Badge variant="secondary" className="ml-auto text-xs flex-shrink-0">
                {item.duration}mo
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.capability}</p>
            <div className="flex gap-2 text-xs">
              <Badge variant="outline" className="capitalize">
                {item.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">
                {item.priority}
              </Badge>
            </div>
            <p className="text-xs">Duration: {item.duration} months</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function TimelineChart({
  items,
  viewMode,
  zoomLevel,
  projectStartDate,
  onItemClick,
  onItemDrop,
  scrollContainerRef,
}: TimelineChartProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Calculate timeline dimensions
  const { totalMonths, columnWidth, timelineWidth, columns } = useMemo(() => {
    const maxEndMonth = Math.max(...items.map(item => item.startMonth + item.duration), 24);
    const totalMonths = Math.ceil(maxEndMonth / 3) * 3 + 6; // Round up to quarters + buffer

    // Base column width depends on zoom and view mode
    const baseWidth = viewMode === 'months' ? 80 : 240;
    const columnWidth = baseWidth * (zoomLevel / 100);
    const columnsCount = viewMode === 'months' ? totalMonths : Math.ceil(totalMonths / 3);
    const timelineWidth = columnWidth * columnsCount;

    // Generate column headers
    const columns = [];
    if (viewMode === 'months') {
      for (let i = 0; i < totalMonths; i++) {
        const date = addMonths(projectStartDate, i);
        columns.push({
          index: i,
          label: format(date, 'MMM yyyy'),
          shortLabel: format(date, 'MMM'),
          date,
          isQuarterStart: date.getMonth() % 3 === 0,
        });
      }
    } else {
      for (let i = 0; i < Math.ceil(totalMonths / 3); i++) {
        const date = addMonths(projectStartDate, i * 3);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        columns.push({
          index: i,
          label: `Q${quarter} ${format(date, 'yyyy')}`,
          shortLabel: `Q${quarter}`,
          date,
          isQuarterStart: true,
        });
      }
    }

    return { totalMonths, columnWidth, timelineWidth, columns };
  }, [items, viewMode, zoomLevel, projectStartDate]);

  // Group items by capability
  const groupedItems = useMemo(() => {
    const groups: Record<string, TimelineItem[]> = {};
    items.forEach(item => {
      if (!groups[item.capability]) {
        groups[item.capability] = [];
      }
      groups[item.capability].push(item);
    });

    // Sort by priority
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return Object.entries(groups).sort((a, b) => {
      const aPriority = priorityOrder[a[1][0]?.priority as keyof typeof priorityOrder] ?? 2;
      const bPriority = priorityOrder[b[1][0]?.priority as keyof typeof priorityOrder] ?? 2;
      return aPriority - bPriority;
    });
  }, [items]);

  // Calculate row positions
  const rowHeight = 56;
  const headerHeight = 80;
  const groupHeaderHeight = 40;

  // Get pixel position for a month
  const getMonthPosition = useCallback((month: number) => {
    if (viewMode === 'months') {
      return month * columnWidth;
    }
    return (month / 3) * columnWidth;
  }, [viewMode, columnWidth]);

  // Handle drag end
  const handleDragEnd = useCallback((event: any) => {
    const { active, delta } = event;
    if (!active || !delta || !onItemDrop) return;

    const item = items.find(i => i.id === active.id);
    if (!item) return;

    // Calculate new start month based on drag delta
    const monthsPerPixel = viewMode === 'months' ? 1 / columnWidth : 3 / columnWidth;
    const monthDelta = Math.round(delta.x * monthsPerPixel);
    const newStartMonth = Math.max(0, item.startMonth + monthDelta);

    if (newStartMonth !== item.startMonth) {
      onItemDrop(active.id, newStartMonth);
    }

    setActiveId(null);
  }, [items, viewMode, columnWidth, onItemDrop]);

  // Today line position
  const todayPosition = useMemo(() => {
    const monthsFromStart = differenceInMonths(new Date(), projectStartDate);
    return getMonthPosition(monthsFromStart);
  }, [projectStartDate, getMonthPosition]);

  const activeItem = activeId ? items.find(i => i.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => setActiveId(event.active.id as string)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="relative overflow-hidden border rounded-xl bg-card">
        {/* Fixed left sidebar with capability names */}
        <div className="absolute left-0 top-0 bottom-0 w-52 z-30 bg-card border-r">
          {/* Header spacer */}
          <div className="h-20 border-b bg-muted/30 flex items-end px-4 pb-2">
            <span className="text-sm font-semibold text-muted-foreground">Capabilities</span>
          </div>

          {/* Capability groups */}
          {groupedItems.map(([capability, milestones], groupIndex) => {
            const topOffset = groupedItems.slice(0, groupIndex).reduce(
              (acc, [_, ms]) => acc + groupHeaderHeight + ms.length * rowHeight,
              headerHeight
            );

            return (
              <div key={capability} style={{ marginTop: groupIndex === 0 ? 0 : 0 }}>
                {/* Group header */}
                <div
                  className="h-10 flex items-center px-4 bg-muted/50 border-b sticky"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: milestones[0]?.capabilityColor || '#3b82f6'
                  }}
                >
                  <span className="font-medium text-sm truncate">{capability}</span>
                </div>

                {/* Milestone rows */}
                {milestones.map((ms, idx) => (
                  <div
                    key={ms.id}
                    className={cn(
                      "h-14 flex items-center px-4 border-b",
                      idx % 2 === 0 ? "bg-card" : "bg-muted/20"
                    )}
                  >
                    <span className="text-sm text-muted-foreground truncate">
                      {ms.name}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Scrollable chart area */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto ml-52"
        >
          <div
            ref={chartRef}
            className="relative"
            style={{ width: timelineWidth, minHeight: 400 }}
          >
            {/* Time header */}
            <div className="sticky top-0 z-20 bg-muted/30 border-b h-20">
              <div className="flex h-full">
                {columns.map((col, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex flex-col justify-end pb-2 px-2 border-r",
                      col.isQuarterStart && viewMode === 'months' && "border-l-2 border-l-primary/30"
                    )}
                    style={{ width: columnWidth }}
                  >
                    <span className="text-xs text-muted-foreground">
                      {viewMode === 'months' && col.isQuarterStart && (
                        <span className="block text-[10px] text-primary font-medium">
                          Q{Math.floor(col.date.getMonth() / 3) + 1}
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-medium">{col.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid and milestones */}
            <div className="relative">
              {/* Vertical grid lines */}
              {columns.map((col, idx) => (
                <div
                  key={`grid-${idx}`}
                  className={cn(
                    "absolute top-0 bottom-0 border-r",
                    col.isQuarterStart ? "border-border" : "border-border/50"
                  )}
                  style={{ left: idx * columnWidth, width: columnWidth }}
                />
              ))}

              {/* Today line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                style={{ left: todayPosition }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                  Today
                </div>
              </div>

              {/* Milestone rows */}
              {groupedItems.map(([capability, milestones], groupIndex) => {
                const topOffset = groupedItems.slice(0, groupIndex).reduce(
                  (acc, [_, ms]) => acc + groupHeaderHeight + ms.length * rowHeight,
                  0
                );

                return (
                  <div key={capability}>
                    {/* Group header row */}
                    <div
                      className="h-10 bg-muted/30 border-b"
                      style={{ marginTop: groupIndex === 0 ? 0 : 0 }}
                    />

                    {/* Milestone rows */}
                    {milestones.map((ms, idx) => {
                      const left = getMonthPosition(ms.startMonth);
                      const width = viewMode === 'months'
                        ? ms.duration * columnWidth
                        : (ms.duration / 3) * columnWidth;

                      return (
                        <div
                          key={ms.id}
                          className={cn(
                            "relative h-14 border-b",
                            idx % 2 === 0 ? "bg-card/50" : "bg-muted/10"
                          )}
                        >
                          <div className="absolute inset-y-2">
                            <DraggableMilestone
                              item={ms}
                              left={left}
                              width={width}
                              onClick={() => onItemClick?.(ms.id)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeItem && (
          <div className={cn(
            "h-10 rounded-lg border-2 shadow-2xl",
            "flex items-center px-3 gap-2",
            statusColors[activeItem.status]?.bg,
            statusColors[activeItem.status]?.border
          )}>
            <div className={cn("w-2 h-2 rounded-full", priorityColors[activeItem.priority])} />
            <span className={cn("text-sm font-medium", statusColors[activeItem.status]?.text)}>
              {activeItem.name}
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
