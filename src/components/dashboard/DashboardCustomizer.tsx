// src/components/dashboard/DashboardCustomizer.tsx
// Component for customizing dashboard widget layout and visibility

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  usePreferencesStore,
  type DashboardWidget,
  type DashboardWidgetId,
} from '@/stores/preferencesStore';
import {
  GripVertical,
  Settings2,
  Eye,
  EyeOff,
  RotateCcw,
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
  BarChart3,
  Activity,
  PieChart,
  ListChecks,
} from 'lucide-react';

// Widget icon mapping
const widgetIcons: Record<DashboardWidgetId, React.ReactNode> = {
  'kpi-progress': <TrendingUp className="h-4 w-4" />,
  'kpi-milestones': <Target className="h-4 w-4" />,
  'kpi-quickwins': <Zap className="h-4 w-4" />,
  'kpi-critical': <AlertTriangle className="h-4 w-4" />,
  'capability-progress': <BarChart3 className="h-4 w-4" />,
  'overall-maturity': <PieChart className="h-4 w-4" />,
  'recent-activity': <Activity className="h-4 w-4" />,
  'critical-items': <ListChecks className="h-4 w-4" />,
  'qol-impact': <BarChart3 className="h-4 w-4" />,
};

// Sortable widget item component
function SortableWidgetItem({
  widget,
  onToggleVisibility,
}: {
  widget: DashboardWidget;
  onToggleVisibility: (id: DashboardWidgetId, visible: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-background border rounded-lg ${
        isDragging ? 'shadow-lg ring-2 ring-primary' : ''
      } ${!widget.visible ? 'opacity-60' : ''}`}
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 flex-1">
        <span className={`${widget.visible ? 'text-primary' : 'text-muted-foreground'}`}>
          {widgetIcons[widget.id]}
        </span>
        <div className="flex-1">
          <p className="font-medium text-sm">{widget.name}</p>
          <p className="text-xs text-muted-foreground">{widget.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">
          {widget.size}
        </span>
        <Switch
          checked={widget.visible}
          onCheckedChange={(checked) => onToggleVisibility(widget.id, checked)}
        />
        {widget.visible ? (
          <Eye className="h-4 w-4 text-muted-foreground" />
        ) : (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

interface DashboardCustomizerProps {
  trigger?: React.ReactNode;
}

export function DashboardCustomizer({ trigger }: DashboardCustomizerProps) {
  const [open, setOpen] = useState(false);

  const dashboardWidgets = usePreferencesStore(
    (state) => state.preferences.dashboardWidgets
  );
  const updateWidgetOrder = usePreferencesStore((state) => state.updateWidgetOrder);
  const updateWidgetVisibility = usePreferencesStore(
    (state) => state.updateWidgetVisibility
  );
  const resetDashboardWidgets = usePreferencesStore(
    (state) => state.resetDashboardWidgets
  );

  // Local state for editing (to allow cancel)
  const [localWidgets, setLocalWidgets] = useState<DashboardWidget[]>(dashboardWidgets);

  // Reset local state when dialog opens
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (isOpen) {
      setLocalWidgets([...dashboardWidgets]);
    }
    setOpen(isOpen);
  }, [dashboardWidgets]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update order property
        return newItems.map((item, index) => ({ ...item, order: index }));
      });
    }
  }, []);

  const handleToggleVisibility = useCallback(
    (id: DashboardWidgetId, visible: boolean) => {
      setLocalWidgets((items) =>
        items.map((item) => (item.id === id ? { ...item, visible } : item))
      );
    },
    []
  );

  const handleSave = useCallback(() => {
    updateWidgetOrder(localWidgets);
    setOpen(false);
  }, [localWidgets, updateWidgetOrder]);

  const handleReset = useCallback(() => {
    resetDashboardWidgets();
    setLocalWidgets([...dashboardWidgets]);
    // Re-fetch after reset
    setTimeout(() => {
      setLocalWidgets(usePreferencesStore.getState().preferences.dashboardWidgets);
    }, 0);
  }, [resetDashboardWidgets, dashboardWidgets]);

  const visibleCount = localWidgets.filter((w) => w.visible).length;
  const totalCount = localWidgets.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings2 className="h-4 w-4 mr-2" />
            Customize
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Customize Dashboard
          </DialogTitle>
          <DialogDescription>
            Drag to reorder widgets and toggle visibility. Changes are applied when you save.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 -mx-6 px-6">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-sm text-muted-foreground">
              {visibleCount} of {totalCount} widgets visible
            </Label>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localWidgets.map((w) => w.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {localWidgets.map((widget) => (
                  <SortableWidgetItem
                    key={widget.id}
                    widget={widget}
                    onToggleVisibility={handleToggleVisibility}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
