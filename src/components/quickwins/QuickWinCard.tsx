// src/components/quickwins/QuickWinCard.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface QuickWinCardProps {
  item: {
    id: string;
    name: string;
    description?: string;
    timeline_months?: number;
    investment?: string;
    roi?: string;
    progress_percent?: number;
    category?: string;
    capability?: { name: string } | null;
  };
  isDragging?: boolean;
  onClick?: () => void;
}

const investmentColors = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-red-100 text-red-700',
};

const roiColors = {
  LOW: 'text-slate-500',
  MEDIUM: 'text-blue-500',
  HIGH: 'text-green-500',
};

export function QuickWinCard({ item, isDragging, onClick }: QuickWinCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSorting,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-pointer hover:shadow-md transition-shadow',
        (isDragging || isSorting) && 'opacity-50 shadow-lg rotate-2'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="mt-1 p-1 -ml-1 rounded hover:bg-slate-100 cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-slate-400" />
          </button>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm leading-tight">{item.name}</h4>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Progress bar */}
            {item.progress_percent !== undefined && item.progress_percent > 0 && (
              <div className="mt-2">
                <Progress value={item.progress_percent} className="h-1.5" />
              </div>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {item.timeline_months && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {item.timeline_months}mo
                </div>
              )}
              {item.investment && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs py-0',
                    investmentColors[item.investment as keyof typeof investmentColors]
                  )}
                >
                  <DollarSign className="h-3 w-3 mr-0.5" />
                  {item.investment}
                </Badge>
              )}
              {item.roi && (
                <div
                  className={cn(
                    'flex items-center gap-0.5 text-xs',
                    roiColors[item.roi as keyof typeof roiColors]
                  )}
                >
                  <TrendingUp className="h-3 w-3" />
                  {item.roi} ROI
                </div>
              )}
            </div>

            {/* Category/Capability */}
            <div className="flex items-center gap-2 mt-2">
              {item.category && (
                <Badge variant="secondary" className="text-xs py-0">
                  {item.category}
                </Badge>
              )}
              {item.capability && (
                <span className="text-xs text-muted-foreground truncate">
                  {item.capability.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
