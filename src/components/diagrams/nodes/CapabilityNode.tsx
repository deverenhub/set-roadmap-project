// src/components/diagrams/nodes/CapabilityNode.tsx
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';

interface CapabilityNodeData {
  id: string;
  name: string;
  priority: string;
  currentLevel: number;
  targetLevel: number;
  color?: string;
}

const priorityColors = {
  CRITICAL: 'border-red-500',
  HIGH: 'border-orange-500',
  MEDIUM: 'border-yellow-500',
  LOW: 'border-green-500',
};

export const CapabilityNode = memo(({ data, selected }: NodeProps<CapabilityNodeData>) => {
  const borderColor = priorityColors[data.priority as keyof typeof priorityColors] || 'border-slate-300';

  return (
    <>
      <div
        className={cn(
          'px-4 py-3 rounded-lg border-l-4 bg-white shadow-md min-w-[160px] cursor-pointer transition-all',
          borderColor,
          selected && 'ring-2 ring-primary ring-offset-2'
        )}
        style={{ borderLeftColor: data.color }}
      >
        <p className="font-semibold text-sm">{data.name}</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  'h-2 w-2 rounded-full',
                  level <= data.currentLevel
                    ? 'bg-primary'
                    : level <= data.targetLevel
                    ? 'bg-slate-300'
                    : 'bg-slate-100'
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {data.currentLevel}→{data.targetLevel}
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-slate-400" />
    </>
  );
});

CapabilityNode.displayName = 'CapabilityNode';
