// src/pages/Timeline.tsx
import { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useTimelineData,
  useUpdateMilestonePosition,
  useUpdateMilestoneDuration,
  usePermissions
} from '@/hooks';
import { TimelineHeader, TimelineChart, MilestoneDetailModal, type TimelineViewMode, type TimelinePath } from '@/components/timeline';
import type { TimelineItem } from '@/components/timeline/TimelineChart';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Info, Calendar, Target, TrendingUp, AlertCircle, Lock } from 'lucide-react';

export default function Timeline() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [viewMode, setViewMode] = useState<TimelineViewMode>('months');
  const [selectedPath, setSelectedPath] = useState<TimelinePath>('B');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Data fetching and mutations
  const { data: timelineData, isLoading } = useTimelineData(selectedPath);
  const updatePosition = useUpdateMilestonePosition();
  const updateDuration = useUpdateMilestoneDuration();
  const { canEdit } = usePermissions();

  // Project start date (could come from settings)
  const projectStartDate = useMemo(() => {
    const date = new Date();
    date.setDate(1); // Start of current month
    return date;
  }, []);

  // Transform API data to chart format
  const chartItems: TimelineItem[] = useMemo(() => {
    if (!timelineData) return [];

    // Track cumulative start positions per capability
    const capabilityOffsets: Record<string, number> = {};

    return timelineData.map((item: any) => {
      const capKey = item.capability;
      if (capabilityOffsets[capKey] === undefined) {
        capabilityOffsets[capKey] = 0;
      }

      // Base start month (sequential within capability)
      const baseStartMonth = capabilityOffsets[capKey];
      capabilityOffsets[capKey] += item.duration;

      // Apply custom offset if set
      const startMonth = Math.max(0, baseStartMonth + (item.timelineOffset || 0));

      return {
        id: item.id,
        name: item.name,
        capability: item.capability,
        capabilityId: item.capabilityId || item.id,
        capabilityColor: item.capabilityColor,
        priority: item.priority,
        duration: item.duration,
        status: item.status,
        startMonth,
        timelineOffset: item.timelineOffset || 0,
      };
    });
  }, [timelineData]);

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!chartItems.length) return null;

    const totalMilestones = chartItems.length;
    const completed = chartItems.filter(i => i.status === 'completed').length;
    const inProgress = chartItems.filter(i => i.status === 'in_progress').length;
    const blocked = chartItems.filter(i => i.status === 'blocked').length;
    const totalMonths = Math.max(...chartItems.map(i => i.startMonth + i.duration));

    return {
      totalMilestones,
      completed,
      inProgress,
      blocked,
      totalMonths,
      completionPercent: Math.round((completed / totalMilestones) * 100),
    };
  }, [chartItems]);

  // Handlers
  const handleMilestoneClick = useCallback((id: string) => {
    setSelectedMilestoneId(id);
    setIsDetailModalOpen(true);
  }, []);

  const handleMilestoneDrop = useCallback(async (id: string, newStartMonth: number) => {
    if (!canEdit) {
      toast.error('You do not have permission to edit milestones');
      return;
    }

    // Find the item to get its current offset
    const item = chartItems.find(i => i.id === id);
    if (!item) return;

    // Calculate the offset change based on the new position
    // The startMonth shown is baseStartMonth + offset, so newOffset = newStartMonth - baseStartMonth
    const baseStartMonth = item.startMonth - (item.timelineOffset || 0);
    const newOffset = newStartMonth - baseStartMonth;

    updatePosition.mutate(
      { id, timelineOffset: newOffset },
      {
        onSuccess: () => {
          toast.success('Milestone position updated');
        },
      }
    );
  }, [canEdit, chartItems, updatePosition]);

  const handleMilestoneResize = useCallback(async (id: string, newDuration: number) => {
    if (!canEdit) {
      toast.error('You do not have permission to edit milestones');
      return;
    }

    updateDuration.mutate(
      { id, path: selectedPath, duration: newDuration },
      {
        onSuccess: () => {
          toast.success(`Duration updated to ${newDuration} months`);
        },
      }
    );
  }, [canEdit, selectedPath, updateDuration]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  }, []);

  const handleScrollToToday = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, []);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'next' ? 300 : -300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  const pathDescriptions = {
    A: 'Aggressive timeline with parallel execution and maximum resource allocation',
    B: 'Balanced approach optimizing speed and resource efficiency',
    C: 'Conservative timeline prioritizing stability and thorough testing',
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Timeline</h1>
          <p className="text-muted-foreground mt-1">
            View implementation timeline across different paths
          </p>
        </div>
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Timeline</h1>
          <p className="text-muted-foreground mt-1">
            Interactive Gantt chart for implementation planning
          </p>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
              <Target className="h-3.5 w-3.5" />
              {stats.totalMilestones} milestones
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
              <TrendingUp className="h-3.5 w-3.5" />
              {stats.completionPercent}% complete
            </Badge>
            {stats.blocked > 0 && (
              <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="h-3.5 w-3.5" />
                {stats.blocked} blocked
              </Badge>
            )}
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
              <Calendar className="h-3.5 w-3.5" />
              ~{stats.totalMonths} months total
            </Badge>
          </div>
        )}
      </div>

      {/* Path Description */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-3 flex items-center gap-3">
          <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Path {selectedPath}:</span>{' '}
            {pathDescriptions[selectedPath]}
          </p>
        </CardContent>
      </Card>

      {/* Timeline Controls */}
      <TimelineHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedPath={selectedPath}
        onPathChange={setSelectedPath}
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onScrollToToday={handleScrollToToday}
        onNavigate={handleNavigate}
      />

      {/* Timeline Chart */}
      {chartItems.length > 0 ? (
        <>
          {canEdit && (
            <Card className="bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="py-3 flex items-center gap-3">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-medium">Edit Mode:</span>{' '}
                  Drag milestones to change start position • Drag right edge to resize duration
                </p>
              </CardContent>
            </Card>
          )}
          {!canEdit && (
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="py-3 flex items-center gap-3">
                <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">View Only:</span>{' '}
                  Admins and editors can drag milestones to adjust timing
                </p>
              </CardContent>
            </Card>
          )}
          <TimelineChart
            items={chartItems}
            viewMode={viewMode}
            zoomLevel={zoomLevel}
            projectStartDate={projectStartDate}
            onItemClick={handleMilestoneClick}
            onItemDrop={handleMilestoneDrop}
            onItemResize={handleMilestoneResize}
            scrollContainerRef={scrollContainerRef}
            canEdit={canEdit}
          />
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-[400px] text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">No milestones found</h3>
            <p className="text-sm text-muted-foreground">
              Add milestones to your capabilities to see them on the timeline.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              <span className="text-sm font-medium text-muted-foreground mr-2">Status:</span>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-slate-400" />
                <span className="text-sm">Not Started</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-blue-500" />
                <span className="text-sm">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-emerald-500" />
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-red-500" />
                <span className="text-sm">Blocked</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <span className="text-sm font-medium text-muted-foreground mr-2">Priority:</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-sm">Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-sm">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-sm">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-slate-400" />
                <span className="text-sm">Low</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestone Detail Modal */}
      <MilestoneDetailModal
        milestoneId={selectedMilestoneId}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
      />
    </div>
  );
}
