// src/pages/Timeline.tsx
import { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimelineData, useUpdateMilestone } from '@/hooks';
import { TimelineHeader, TimelineChart, MilestoneDetailModal, type TimelineViewMode, type TimelinePath } from '@/components/timeline';
import type { TimelineItem } from '@/components/timeline/TimelineChart';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Info, Calendar, Target, TrendingUp, AlertCircle } from 'lucide-react';

export default function Timeline() {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [viewMode, setViewMode] = useState<TimelineViewMode>('months');
  const [selectedPath, setSelectedPath] = useState<TimelinePath>('B');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Data fetching
  const { data: timelineData, isLoading } = useTimelineData(selectedPath);
  const updateMilestone = useUpdateMilestone();

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

      const startMonth = capabilityOffsets[capKey];
      capabilityOffsets[capKey] += item.duration;

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
    // In a real app, this would update the milestone's start date
    toast.info(`Milestone scheduling updated - Start month: ${newStartMonth}`);
    // Note: The current data model uses duration-based sequencing, not absolute dates
    // A full implementation would need to update the database schema
  }, []);

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
        <TimelineChart
          items={chartItems}
          viewMode={viewMode}
          zoomLevel={zoomLevel}
          projectStartDate={projectStartDate}
          onItemClick={handleMilestoneClick}
          onItemDrop={handleMilestoneDrop}
          scrollContainerRef={scrollContainerRef}
        />
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
