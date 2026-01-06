// src/components/capabilities/MaturityIndicator.tsx
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MaturityIndicatorProps {
  currentLevel: number;
  targetLevel: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

const LEVEL_INFO = [
  { level: 1, name: 'Initial', description: 'Ad-hoc processes, limited visibility' },
  { level: 2, name: 'Managed', description: 'Defined processes, basic tracking' },
  { level: 3, name: 'Standardized', description: 'Integrated systems, real-time data' },
  { level: 4, name: 'Predictive', description: 'Analytics-driven, optimized operations' },
  { level: 5, name: 'Autonomous', description: 'AI-powered, self-optimizing systems' },
];

const LEVEL_COLORS = {
  completed: {
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-blue-500',
    5: 'bg-emerald-500',
  },
  target: 'bg-slate-300',
  future: 'bg-slate-100',
};

const SIZE_CLASSES = {
  sm: { dot: 'h-3 w-3', text: 'text-xs', gap: 'gap-1' },
  md: { dot: 'h-4 w-4', text: 'text-sm', gap: 'gap-2' },
  lg: { dot: 'h-6 w-6', text: 'text-base', gap: 'gap-3' },
};

export function MaturityIndicator({
  currentLevel,
  targetLevel,
  size = 'md',
  showLabels = false,
}: MaturityIndicatorProps) {
  const sizeClasses = SIZE_CLASSES[size];

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className={cn('flex items-center', sizeClasses.gap)}>
          {LEVEL_INFO.map((info) => {
            const isCompleted = info.level <= currentLevel;
            const isTarget = info.level <= targetLevel && info.level > currentLevel;
            const isFuture = info.level > targetLevel;

            let bgColor: string;
            if (isCompleted) {
              bgColor = LEVEL_COLORS.completed[info.level as keyof typeof LEVEL_COLORS.completed];
            } else if (isTarget) {
              bgColor = LEVEL_COLORS.target;
            } else {
              bgColor = LEVEL_COLORS.future;
            }

            return (
              <Tooltip key={info.level}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'rounded-full cursor-help transition-transform hover:scale-110',
                      sizeClasses.dot,
                      bgColor,
                      info.level === currentLevel && 'ring-2 ring-offset-2 ring-primary',
                      info.level === targetLevel && !isCompleted && 'ring-2 ring-offset-2 ring-slate-400'
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium">Level {info.level}: {info.name}</p>
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                    {info.level === currentLevel && (
                      <p className="text-xs text-primary mt-1">← Current</p>
                    )}
                    {info.level === targetLevel && info.level !== currentLevel && (
                      <p className="text-xs text-slate-500 mt-1">← Target</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        
        {showLabels && (
          <div className={cn('flex justify-between', sizeClasses.text, 'text-muted-foreground')}>
            <span>Level {currentLevel}</span>
            <span>→</span>
            <span>Level {targetLevel}</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
