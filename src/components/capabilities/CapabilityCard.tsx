// src/components/capabilities/CapabilityCard.tsx
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge, PriorityBadge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CapabilityCardProps {
  id: string;
  name: string;
  description?: string;
  priority: string;
  currentLevel: number;
  targetLevel: number;
  owner?: string;
  milestoneCount?: number;
  completedMilestones?: number;
  quickWinCount?: number;
  color?: string;
  onClick?: () => void;
  className?: string;
}

export function CapabilityCard({
  id,
  name,
  description,
  priority,
  currentLevel,
  targetLevel,
  owner,
  milestoneCount = 0,
  completedMilestones = 0,
  quickWinCount = 0,
  color,
  onClick,
  className,
}: CapabilityCardProps) {
  const progressPercent = targetLevel > 1
    ? Math.round(((currentLevel - 1) / (targetLevel - 1)) * 100)
    : 100;

  const levelColors: Record<number, string> = {
    1: 'bg-red-500',
    2: 'bg-orange-500',
    3: 'bg-yellow-500',
    4: 'bg-blue-500',
    5: 'bg-emerald-500',
  };

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <PriorityBadge priority={priority} />
              {owner && (
                <span className="text-xs text-muted-foreground">{owner}</span>
              )}
            </div>
            <h3 className="font-semibold text-lg leading-tight">{name}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        {/* Maturity Level Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Maturity Level</span>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{currentLevel}</span>
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="font-semibold">{targetLevel}</span>
            </div>
          </div>
          
          {/* Level dots */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  'h-2 flex-1 rounded-full transition-colors',
                  level <= currentLevel
                    ? levelColors[level]
                    : level <= targetLevel
                    ? 'bg-muted-foreground/30'
                    : 'bg-muted'
                )}
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Milestones:</span>
            <span className="font-medium">
              {completedMilestones}/{milestoneCount}
            </span>
          </div>
          {quickWinCount > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Quick Wins:</span>
              <span className="font-medium">{quickWinCount}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
