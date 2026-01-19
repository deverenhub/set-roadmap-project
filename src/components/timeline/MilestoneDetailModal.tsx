// src/components/timeline/MilestoneDetailModal.tsx
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Layers,
  Target,
  ArrowRight,
  CheckCircle2,
  Pencil,
  Trash2,
  Link as LinkIcon,
  AlertTriangle,
  Paperclip,
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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommentSection } from '@/components/comments';
import { FileUpload, AttachmentsList } from '@/components/attachments';
import { useMilestone, useDeleteMilestone, useUpdateMilestone } from '@/hooks/useMilestones';
import { usePermissions, useAttachmentCount } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MilestoneDetailModalProps {
  milestoneId: string | null;
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

const statusIcons: Record<string, typeof CheckCircle2> = {
  not_started: Clock,
  in_progress: Clock,
  completed: CheckCircle2,
  blocked: AlertTriangle,
};

export function MilestoneDetailModal({
  milestoneId,
  open,
  onOpenChange,
  onEdit,
}: MilestoneDetailModalProps) {
  const { data: milestone, isLoading } = useMilestone(milestoneId);
  const { data: attachmentCount } = useAttachmentCount('milestone', milestoneId || '');
  const deleteMilestone = useDeleteMilestone();
  const updateMilestone = useUpdateMilestone();
  const { canEdit } = usePermissions();

  const handleStatusChange = (newStatus: string) => {
    if (!milestoneId || !milestone) return;
    updateMilestone.mutate({
      id: milestoneId,
      status: newStatus as any,
    });
  };

  const handleDelete = async () => {
    if (!milestoneId) return;
    if (confirm('Are you sure you want to delete this milestone?')) {
      await deleteMilestone.mutateAsync(milestoneId);
      onOpenChange(false);
    }
  };

  const StatusIcon = statusIcons[milestone?.status || 'not_started'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : milestone ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4 pr-8">
                <div className="space-y-1">
                  <DialogTitle className="text-xl">{milestone.name}</DialogTitle>
                  {milestone.capability && (
                    <DialogDescription className="flex items-center gap-1">
                      <LinkIcon className="h-3 w-3" />
                      {(milestone.capability as any).name}
                    </DialogDescription>
                  )}
                </div>
                <Badge className={cn('shrink-0 flex items-center gap-1', statusColors[milestone.status])}>
                  <StatusIcon className="h-3 w-3" />
                  {statusLabels[milestone.status]}
                </Badge>
              </div>
            </DialogHeader>

            {/* Status Change Buttons */}
            {canEdit && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground mr-2 self-center">Change status:</span>
                {['not_started', 'in_progress', 'completed', 'blocked'].map((status) => {
                  const Icon = statusIcons[status];
                  const isCurrentStatus = milestone.status === status;
                  return (
                    <Button
                      key={status}
                      variant={isCurrentStatus ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange(status)}
                      disabled={isCurrentStatus || updateMilestone.isPending}
                      className={cn(
                        isCurrentStatus && statusColors[status]
                      )}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {statusLabels[status]}
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Description */}
            {milestone.description && (
              <div className="text-sm text-muted-foreground">
                {milestone.description}
              </div>
            )}

            {/* Maturity Levels */}
            <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-gradient-to-r from-set-teal-50 to-set-teal-100">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">From Level</p>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm">
                  <span className="text-xl font-bold text-set-teal-600">{milestone.from_level}</span>
                </div>
              </div>
              <ArrowRight className="h-6 w-6 text-set-teal-500" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">To Level</p>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-set-teal-600 shadow-sm">
                  <span className="text-xl font-bold text-white">{milestone.to_level}</span>
                </div>
              </div>
            </div>

            {/* Timeline Paths */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { path: 'A', months: milestone.path_a_months, label: 'Accelerated' },
                { path: 'B', months: milestone.path_b_months, label: 'Standard' },
                { path: 'C', months: milestone.path_c_months, label: 'Extended' },
              ].map(({ path, months, label }) => (
                <div
                  key={path}
                  className={cn(
                    'p-3 rounded-lg border text-center',
                    path === 'B' ? 'border-set-teal-500 bg-set-teal-50' : 'border-gray-200'
                  )}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Path {path}</span>
                  </div>
                  <p className="font-semibold">{months || '-'} months</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* Deliverables */}
            {milestone.deliverables && milestone.deliverables.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Layers className="h-4 w-4" />
                  Deliverables
                </div>
                <ul className="space-y-1">
                  {milestone.deliverables.map((deliverable: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      {deliverable}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Notes */}
            {milestone.notes && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800">{milestone.notes}</p>
              </div>
            )}

            {/* Dates */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {milestone.start_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Started: {format(new Date(milestone.start_date), 'MMM d, yyyy')}
                </div>
              )}
              {milestone.end_date && (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed: {format(new Date(milestone.end_date), 'MMM d, yyyy')}
                </div>
              )}
              <div className="flex items-center gap-1">
                Created: {format(new Date(milestone.created_at), 'MMM d, yyyy')}
              </div>
            </div>

            {/* Actions */}
            {canEdit && (
              <>
                <Separator />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit?.(milestone.id)}
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

            {/* Comments & Attachments Section */}
            <Separator />
            <Tabs defaultValue="comments" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
                <TabsTrigger value="attachments" className="flex-1 flex items-center justify-center gap-1">
                  <Paperclip className="h-3.5 w-3.5" />
                  Attachments
                  {attachmentCount ? (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {attachmentCount}
                    </Badge>
                  ) : null}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="comments" className="mt-4">
                <CommentSection entityType="milestone" entityId={milestone.id} />
              </TabsContent>
              <TabsContent value="attachments" className="mt-4 space-y-4">
                {canEdit && (
                  <FileUpload
                    entityType="milestone"
                    entityId={milestone.id}
                  />
                )}
                <AttachmentsList
                  entityType="milestone"
                  entityId={milestone.id}
                />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Milestone not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
