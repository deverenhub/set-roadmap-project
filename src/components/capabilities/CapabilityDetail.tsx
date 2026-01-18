// src/components/capabilities/CapabilityDetail.tsx
import { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Plus, ChevronRight, Paperclip } from 'lucide-react';
import { useCapability, useDeleteCapability, useMilestonesByCapability, usePermissions, useAttachmentCount } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, PriorityBadge, StatusBadge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CapabilityForm } from './CapabilityForm';
import { MaturityIndicator } from './MaturityIndicator';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CommentSection } from '@/components/comments';
import { MilestoneDetailModal } from '@/components/timeline';
import { QuickWinDetailModal } from '@/components/quickwins';
import { FileUpload, AttachmentsList } from '@/components/attachments';

interface CapabilityDetailProps {
  capabilityId: string;
  onBack?: () => void;
  onDeleted?: () => void;
}

export function CapabilityDetail({
  capabilityId,
  onBack,
  onDeleted,
}: CapabilityDetailProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [isMilestoneDetailOpen, setIsMilestoneDetailOpen] = useState(false);
  const [selectedQuickWinId, setSelectedQuickWinId] = useState<string | null>(null);
  const [isQuickWinDetailOpen, setIsQuickWinDetailOpen] = useState(false);

  const { data: capabilityData, isLoading } = useCapability(capabilityId);
  const capability = capabilityData as any;
  const { data: milestonesData } = useMilestonesByCapability(capabilityId);
  const milestones = milestonesData as any[];
  const { data: attachmentCount } = useAttachmentCount('capability', capabilityId);
  const deleteCapability = useDeleteCapability();
  const { canEdit, canDelete } = usePermissions();

  const handleDelete = async () => {
    await deleteCapability.mutateAsync(capabilityId);
    setIsDeleteOpen(false);
    onDeleted?.();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!capability) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium">Capability not found</p>
        <Button className="mt-4" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const progressPercent = capability.target_level > 1
    ? Math.round(((capability.current_level - 1) / (capability.target_level - 1)) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{capability.name}</h1>
              <PriorityBadge priority={capability.priority} />
            </div>
            {capability.owner && (
              <p className="text-muted-foreground">{capability.owner}</p>
            )}
          </div>
        </div>
        {(canEdit || canDelete) && (
          <div className="flex gap-2">
            {canEdit && (
              <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Maturity Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MaturityIndicator
              currentLevel={capability.current_level}
              targetLevel={capability.target_level}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{progressPercent}%</div>
            <Progress value={progressPercent} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {milestones?.filter((m) => m.status === 'completed').length || 0}/
              {milestones?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground">completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="milestones">
        <TabsList>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="quickwins">Quick Wins</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="attachments" className="flex items-center gap-1">
            <Paperclip className="h-3.5 w-3.5" />
            Attachments
            {attachmentCount ? (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {attachmentCount}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Milestones</h3>
            {canEdit && (
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Milestone
              </Button>
            )}
          </div>
          {milestones?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No milestones yet. Add one to track progress.
            </p>
          ) : (
            <div className="space-y-2">
              {milestones?.map((milestone) => (
                <Card
                  key={milestone.id}
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setSelectedMilestoneId(milestone.id);
                    setIsMilestoneDetailOpen(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{milestone.name}</span>
                        <StatusBadge status={milestone.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Level {milestone.from_level} → {milestone.to_level}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quickwins">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Wins</h3>
            {capability.quick_wins?.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No quick wins linked to this capability.
              </p>
            ) : (
              <div className="space-y-2">
                {capability.quick_wins?.map((qw: any) => (
                  <Card
                    key={qw.id}
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setSelectedQuickWinId(qw.id);
                      setIsQuickWinDetailOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{qw.name}</span>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={qw.status} />
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {capability.description && (
                <div>
                  <h4 className="font-medium mb-1">Description</h4>
                  <p className="text-muted-foreground">{capability.description}</p>
                </div>
              )}
              {capability.qol_impact && (
                <div>
                  <h4 className="font-medium mb-1">Quality of Life Impact</h4>
                  <p className="text-muted-foreground">{capability.qol_impact}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments">
          <Card>
            <CardContent className="pt-6 space-y-6">
              {canEdit && (
                <FileUpload
                  entityType="capability"
                  entityId={capabilityId}
                />
              )}
              <AttachmentsList
                entityType="capability"
                entityId={capabilityId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardContent className="pt-6">
              <CommentSection
                entityType="capability"
                entityId={capabilityId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Capability</DialogTitle>
            <DialogDescription>Update the capability details below.</DialogDescription>
          </DialogHeader>
          <CapabilityForm
            capability={capability}
            onSuccess={() => setIsEditOpen(false)}
            onCancel={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Capability"
        description={`Are you sure you want to delete "${capability.name}"? This will also delete all associated milestones.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteCapability.isPending}
      />

      {/* Milestone Detail Modal */}
      <MilestoneDetailModal
        milestoneId={selectedMilestoneId}
        open={isMilestoneDetailOpen}
        onOpenChange={setIsMilestoneDetailOpen}
      />

      {/* Quick Win Detail Modal */}
      <QuickWinDetailModal
        quickWinId={selectedQuickWinId}
        open={isQuickWinDetailOpen}
        onOpenChange={setIsQuickWinDetailOpen}
      />
    </div>
  );
}
