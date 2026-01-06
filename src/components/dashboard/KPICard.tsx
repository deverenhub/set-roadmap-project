// src/components/dashboard/KPICard.tsx
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  isLoading,
  onClick,
  className,
}: KPICardProps) {
  if (isLoading) {
    return (
      <Card className={className} data-testid="kpi-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        onClick && 'cursor-pointer transition-all hover:shadow-md hover:border-set-teal-300',
        className
      )}
      onClick={onClick}
      data-testid="kpi-card"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div
              className={cn(
                'flex items-center text-xs',
                trend.direction === 'up' && 'text-green-600',
                trend.direction === 'down' && 'text-red-600',
                trend.direction === 'neutral' && 'text-slate-500'
              )}
            >
              {trend.direction === 'up' && <TrendingUp className="h-3 w-3 mr-0.5" />}
              {trend.direction === 'down' && <TrendingDown className="h-3 w-3 mr-0.5" />}
              {trend.value}%
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
