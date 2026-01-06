// src/components/quickwins/KanbanColumn.tsx
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { QuickWinCard } from './QuickWinCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  items: any[];
  onItemClick?: (id: string) => void;
  readOnly?: boolean;
}

export function KanbanColumn({
  id,
  title,
  color,
  items,
  onItemClick,
  readOnly = false,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-lg p-4 min-h-[500px] transition-colors',
        color,
        isOver && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-slate-600">
          {title}
        </h3>
        <span className="text-xs font-medium bg-white px-2 py-1 rounded-full text-slate-500">
          {items.length}
        </span>
      </div>

      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-3">
          {items.map((item) => (
            <QuickWinCard
              key={item.id}
              item={item}
              onClick={() => onItemClick?.(item.id)}
              readOnly={readOnly}
            />
          ))}
          {items.length === 0 && (
            <div className="flex items-center justify-center h-24 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-400">
              {readOnly ? 'No items' : 'Drop items here'}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
