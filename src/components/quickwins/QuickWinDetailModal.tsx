// src/components/quickwins/QuickWinDetailModal.tsx
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  TrendingUp,
  DollarSign,
  Tag,
  Link as LinkIcon,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CommentSection } from '@/components/comments';
import { useQuickWin, useDeleteQuickWin } from '@/hooks/useQuickWins';
import { usePermissions } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface QuickWinDetailModalProps {
  quickWinId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (id: string) => void;
}

const statusColors: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  blocked: 'Blocked',
};

const investmentColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-red-100 text-red-700',
};

const roiColors: Record<string, string> = {
  LOW: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-green-100 text-green-700',
};

export function QuickWinDetailModal({
  quickWinId,
  open,
  onOpenChange,
  onEdit,
}: QuickWinDetailModalProps) {
  const { data: quickWin, isLoading } = useQuickWin(quickWinId);
  const deleteQuickWin = useDeleteQuickWin();
  const { canEdit } = usePermissions();

  const handleDelete = async () => {
    if (!quickWinId) return;
    if (confirm('Are you sure you want to delete this quick win?')) {
      await deleteQuickWin.mutateAsync(quickWinId);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : quickWin ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4 pr-8">
                <div className="space-y-1">
                  <DialogTitle className="text-xl">{quickWin.name}</DialogTitle>
                  {quickWin.capability && (
                    <DialogDescription className="flex items-center gap-1">
                      <LinkIcon className="h-3 w-3" />
                      {(quickWin.capability as any).name}
                    </DialogDescription>
                  )}
                </div>
                <Badge className={cn('shrink-0', statusColors[quickWin.status])}>
                  {statusLabels[quickWin.status]}
                </Badge>
              </div>
            </DialogHeader>

            {/* Description */}
            {quickWin.description && (
              <div className="text-sm text-muted-foreground">
                {quickWin.description}
              </div>
            )}

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{quickWin.progress_percent}%</span>
              </div>
              <Progress value={quickWin.progress_percent} className="h-2" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Timeline */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-blue-100">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Timeline</p>
                  <p className="font-medium">{quickWin.timeline_months} months</p>
                </div>
              </div>

              {/* Investment */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-purple-100">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Investment</p>
                  <Badge className={cn('mt-1', investmentColors[quickWin.investment || 'MEDIUM'])}>
                    {quickWin.investment || 'N/A'}
                  </Badge>
                </div>
              </div>

              {/* ROI */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-green-100">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ROI</p>
                  <Badge className={cn('mt-1', roiColors[quickWin.roi || 'MEDIUM'])}>
                    {quickWin.roi || 'N/A'}
                  </Badge>
                </div>
              </div>

              {/* Category */}
              {quickWin.category && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-full bg-orange-100">
                    <Tag className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-medium capitalize">{quickWin.category}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created: {format(new Date(quickWin.created_at), 'MMM d, yyyy')}
              </div>
              {quickWin.updated_at && quickWin.updated_at !== quickWin.created_at && (
                <div className="flex items-center gap-1">
                  Updated: {format(new Date(quickWin.updated_at), 'MMM d, yyyy')}
                </div>
              )}
            </div>

            {/* Actions */}
            {canEdit && (
              <>
                <Separator />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit?.(quickWin.id)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </>
            )}

            {/* Comments Section */}
            <Separator />
            <CommentSection entityType="quick_win" entityId={quickWin.id} />
          </>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Quick win not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
