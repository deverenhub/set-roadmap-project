// src/components/dashboard/CriticalItems.tsx
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface CriticalItemsProps {
  onItemClick?: (id: string, type: 'capability' | 'milestone') => void;
}

export function CriticalItems({ onItemClick }: CriticalItemsProps) {
  // Fetch blocked milestones
  const { data: blockedMilestones, isLoading: loadingMs } = useQuery({
    queryKey: ['milestones', 'blocked'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milestones')
        .select(`
          id,
          name,
          capability:capabilities(id, name)
        `)
        .eq('status', 'blocked')
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  // Fetch critical capabilities
  const { data: criticalCaps, isLoading: loadingCaps } = useQuery({
    queryKey: ['capabilities', 'critical'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('capabilities')
        .select('id, name, current_level, target_level')
        .eq('priority', 'CRITICAL')
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const isLoading = loadingMs || loadingCaps;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Critical Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasItems = (blockedMilestones?.length || 0) > 0 || (criticalCaps?.length || 0) > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Critical Items
          {hasItems && (
            <Badge variant="destructive" className="ml-2">
              {(blockedMilestones?.length || 0) + (criticalCaps?.length || 0)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasItems ? (
          <p className="text-center text-muted-foreground py-4">
            No critical items - great job!
          </p>
        ) : (
          <div className="space-y-4">
            {/* Blocked milestones */}
            {blockedMilestones?.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50 cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => onItemClick?.(milestone.id, 'milestone')}
              >
                <div>
                  <p className="font-medium text-sm">{milestone.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(milestone.capability as any)?.name || 'Unknown capability'}
                  </p>
                </div>
                <Badge variant="blocked">Blocked</Badge>
              </div>
            ))}

            {/* Critical capabilities */}
            {criticalCaps?.map((cap) => (
              <div
                key={cap.id}
                className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50 cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => onItemClick?.(cap.id, 'capability')}
              >
                <div>
                  <p className="font-medium text-sm">{cap.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Level {cap.current_level} → {cap.target_level}
                  </p>
                </div>
                <Badge variant="critical">Critical</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
