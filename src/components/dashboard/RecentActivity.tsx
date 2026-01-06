// src/components/dashboard/RecentActivity.tsx
import { useQuery } from '@tanstack/react-query';
import { Activity, Plus, Edit, Trash2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils';
import type { ActivityLog } from '@/types';

interface RecentActivityProps {
  limit?: number;
  onViewAll?: () => void;
}

const actionIcons = {
  INSERT: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
};

const actionColors = {
  INSERT: 'text-green-600 bg-green-100',
  UPDATE: 'text-blue-600 bg-blue-100',
  DELETE: 'text-red-600 bg-red-100',
};

export function RecentActivity({ limit = 5, onViewAll }: RecentActivityProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activityLog', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          user:users(id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as (ActivityLog & { user: { id: string; full_name: string; email: string } | null })[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {activities?.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No recent activity
          </p>
        ) : (
          <div className="space-y-4">
            {activities?.map((activity) => {
              const Icon = actionIcons[activity.action as keyof typeof actionIcons] || Edit;
              const colorClass = actionColors[activity.action as keyof typeof actionColors] || 'text-slate-600 bg-slate-100';
              const userName = activity.user?.full_name || activity.user?.email || 'System';
              const itemName = activity.new_values?.name || activity.old_values?.name || 'item';

              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{userName}</span>
                      {' '}
                      {activity.action === 'INSERT' && 'created'}
                      {activity.action === 'UPDATE' && 'updated'}
                      {activity.action === 'DELETE' && 'deleted'}
                      {' '}
                      <span className="font-medium">{itemName}</span>
                      {' in '}
                      <span className="text-muted-foreground">{activity.table_name}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
