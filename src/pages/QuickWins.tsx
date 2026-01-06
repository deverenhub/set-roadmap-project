// src/pages/QuickWins.tsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { KanbanBoard, QuickWinForm } from '@/components/quickwins';
import { useQuickWinStats, usePermissions } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuickWins() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: stats, isLoading } = useQuickWinStats();
  const { canEdit } = usePermissions();

  const handleQuickWinClick = (id: string) => {
    // Open quick win detail modal
    console.log('Quick win clicked:', id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quick Wins</h1>
          <p className="text-muted-foreground mt-1">
            Track short-term initiatives and improvements
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Quick Win
          </Button>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.in_progress || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.completed || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">High ROI</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.high_roi || 0}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Kanban board */}
      <KanbanBoard onQuickWinClick={handleQuickWinClick} readOnly={!canEdit} />

      {/* Add form dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Quick Win</DialogTitle>
          </DialogHeader>
          <QuickWinForm
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
