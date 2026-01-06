// src/components/quickwins/KanbanBoard.tsx
import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useQuickWinsGrouped, useMoveQuickWin } from '@/hooks';
import { KanbanColumn } from './KanbanColumn';
import { QuickWinCard } from './QuickWinCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Status } from '@/types';

interface KanbanBoardProps {
  onQuickWinClick?: (id: string) => void;
}

const COLUMNS: { id: Status; title: string; color: string }[] = [
  { id: 'not_started', title: 'Not Started', color: 'bg-slate-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'completed', title: 'Completed', color: 'bg-green-100' },
];

export function KanbanBoard({ onQuickWinClick }: KanbanBoardProps) {
  const { data: grouped, isLoading } = useQuickWinsGrouped();
  const moveQuickWin = useMoveQuickWin();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine target column
    let targetStatus: Status;
    let targetOrder: number;

    // Check if dropped on a column
    if (COLUMNS.some((col) => col.id === overId)) {
      targetStatus = overId as Status;
      // Place at end of column
      targetOrder = (grouped?.[targetStatus]?.length || 0);
    } else {
      // Dropped on another card - find its column
      const allItems = [
        ...(grouped?.not_started || []),
        ...(grouped?.in_progress || []),
        ...(grouped?.completed || []),
      ];
      const overItem = allItems.find((item) => item.id === overId);
      if (!overItem) return;

      targetStatus = overItem.status as Status;
      targetOrder = overItem.order || 0;
    }

    // Move the item
    moveQuickWin.mutate({
      id: activeId,
      status: targetStatus,
      order: targetOrder,
    });
  };

  // Find active item for overlay
  const activeItem = activeId
    ? [
        ...(grouped?.not_started || []),
        ...(grouped?.in_progress || []),
        ...(grouped?.completed || []),
      ].find((item) => item.id === activeId)
    : null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            items={grouped?.[column.id] || []}
            onItemClick={onQuickWinClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? (
          <QuickWinCard
            item={activeItem}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
