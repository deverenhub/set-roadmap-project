// src/components/timeline/TimelineHeader.tsx
import { Calendar, LayoutGrid, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type TimelineViewMode = 'months' | 'quarters';
export type TimelinePath = 'A' | 'B' | 'C';

interface TimelineHeaderProps {
  viewMode: TimelineViewMode;
  onViewModeChange: (mode: TimelineViewMode) => void;
  selectedPath: TimelinePath;
  onPathChange: (path: TimelinePath) => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onScrollToToday: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function TimelineHeader({
  viewMode,
  onViewModeChange,
  selectedPath,
  onPathChange,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onScrollToToday,
  onNavigate,
}: TimelineHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b">
      <div className="flex items-center gap-4">
        {/* View Mode Toggle */}
        <div className="flex border rounded-lg p-1 bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('months')}
            className={cn(
              "px-3 h-8 text-sm rounded-md transition-all",
              viewMode === 'months' && "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            )}
          >
            <Calendar className="h-4 w-4 mr-1.5" />
            Months
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('quarters')}
            className={cn(
              "px-3 h-8 text-sm rounded-md transition-all",
              viewMode === 'quarters' && "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            )}
          >
            <LayoutGrid className="h-4 w-4 mr-1.5" />
            Quarters
          </Button>
        </div>

        {/* Path Selector */}
        <Select value={selectedPath} onValueChange={(v) => onPathChange(v as TimelinePath)}>
          <SelectTrigger className="w-52 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">
              <span className="font-medium">Path A (Aggressive)</span>
            </SelectItem>
            <SelectItem value="B">
              <span className="font-medium">Path B (Balanced)</span>
            </SelectItem>
            <SelectItem value="C">
              <span className="font-medium">Path C (Conservative)</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        {/* Navigation */}
        <div className="flex items-center border rounded-lg bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('prev')}
            className="rounded-r-none h-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onScrollToToday}
            className="px-3 text-sm font-medium h-8 border-x"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('next')}
            className="rounded-l-none h-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center border rounded-lg bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomOut}
            disabled={zoomLevel <= 50}
            className="rounded-r-none h-8"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="px-2 text-sm font-medium min-w-[3rem] text-center border-x h-8 flex items-center justify-center">
            {zoomLevel}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomIn}
            disabled={zoomLevel >= 200}
            className="rounded-l-none h-8"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
