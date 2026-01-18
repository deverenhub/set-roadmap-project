// src/components/capabilities/CapabilityList.tsx
import { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { useCapabilities, usePermissions } from '@/hooks';
import { CapabilityCard } from './CapabilityCard';
import { CapabilityForm } from './CapabilityForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface CapabilityListProps {
  onCapabilityClick?: (id: string) => void;
}

export function CapabilityList({ onCapabilityClick }: CapabilityListProps) {
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { canEdit } = usePermissions();

  const { data: capabilities, isLoading } = useCapabilities({
    priority: priorityFilter,
  });

  // Filter by search term
  const filteredCapabilities = capabilities?.filter((cap) =>
    cap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cap.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cap.owner?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search capabilities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={priorityFilter || 'all'}
            onValueChange={(v) => setPriorityFilter(v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canEdit && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Capability
          </Button>
        )}
      </div>

      {/* Capability grid */}
      {filteredCapabilities?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium">No capabilities found</p>
          <p className="text-muted-foreground">
            {searchTerm || priorityFilter
              ? 'Try adjusting your filters'
              : 'Get started by adding your first capability'}
          </p>
          {!searchTerm && !priorityFilter && canEdit && (
            <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Capability
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCapabilities?.map((capability) => (
            <CapabilityCard
              key={capability.id}
              id={capability.id}
              name={capability.name}
              description={capability.description || undefined}
              priority={capability.priority}
              currentLevel={capability.current_level}
              targetLevel={capability.target_level}
              owner={capability.owner || undefined}
              milestoneCount={capability.milestone_count}
              completedMilestones={capability.completed_milestones}
              quickWinCount={capability.quick_win_count}
              color={capability.color || undefined}
              onClick={() => onCapabilityClick?.(capability.id)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Capability</DialogTitle>
            <DialogDescription>Create a new capability to track in the roadmap.</DialogDescription>
          </DialogHeader>
          <CapabilityForm onSuccess={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
