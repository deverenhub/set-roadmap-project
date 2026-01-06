// src/components/diagrams/nodes/MilestoneNode.tsx
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CheckCircle2, Circle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MilestoneNodeData {
  id: string;
  name: string;
  status: string;
  fromLevel: number;
  toLevel: number;
  capabilityName?: string;
}

const statusConfig = {
  not_started: {
    icon: Circle,
    color: 'bg-slate-100 border-slate-300 text-slate-600',
    iconColor: 'text-slate-400',
  },
  in_progress: {
    icon: Clock,
    color: 'bg-blue-50 border-blue-300 text-blue-700',
    iconColor: 'text-blue-500',
  },
  completed: {
    icon: CheckCircle2,
    color: 'bg-green-50 border-green-300 text-green-700',
    iconColor: 'text-green-500',
  },
  blocked: {
    icon: AlertCircle,
    color: 'bg-red-50 border-red-300 text-red-700',
    iconColor: 'text-red-500',
  },
};

export const MilestoneNode = memo(({ data, selected }: NodeProps<MilestoneNodeData>) => {
  const config = statusConfig[data.status as keyof typeof statusConfig] || statusConfig.not_started;
  const Icon = config.icon;

  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-slate-400" />
      <div
        className={cn(
          'px-4 py-3 rounded-lg border-2 shadow-sm min-w-[180px] max-w-[220px] cursor-pointer transition-all',
          config.color,
          selected && 'ring-2 ring-primary ring-offset-2'
        )}
      >
        <div className="flex items-start gap-2">
          <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', config.iconColor)} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm leading-tight truncate">{data.name}</p>
            <p className="text-xs opacity-70 mt-1">
              Level {data.fromLevel} → {data.toLevel}
            </p>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-slate-400" />
    </>
  );
});

MilestoneNode.displayName = 'MilestoneNode';
