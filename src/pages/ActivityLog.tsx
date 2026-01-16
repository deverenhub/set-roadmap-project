// src/pages/ActivityLog.tsx
import { useState, useMemo } from 'react';
import { History, Filter, RefreshCw, Plus, Edit, Trash2, ChevronDown, ChevronRight, User, Calendar, Table2, Activity, TrendingUp } from 'lucide-react';
import {
  useInfiniteActivityLog,
  useActivityStats,
  formatActivityDescription,
  formatTableName,
  getChangedFields,
  type ActivityLogFilters,
} from '@/hooks/useActivityLog';
import { useAllUsers } from '@/hooks/useUser';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatRelativeTime } from '@/lib/utils';
import type { ActivityLogWithUser } from '@/types';

const actionIcons = {
  INSERT: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
};

const actionColors = {
  INSERT: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  UPDATE: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  DELETE: 'text-red-600 bg-red-100 dark:bg-red-900/30',
};

const actionLabels = {
  INSERT: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
};

const tableOptions = [
  { value: 'capabilities', label: 'Capabilities' },
  { value: 'milestones', label: 'Milestones' },
  { value: 'quick_wins', label: 'Quick Wins' },
  { value: 'technology_options', label: 'Technology Options' },
  { value: 'comments', label: 'Comments' },
];

export default function ActivityLogPage() {
  const [filters, setFilters] = useState<ActivityLogFilters>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data: users } = useAllUsers();
  const { data: stats, isLoading: statsLoading } = useActivityStats();
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteActivityLog(filters);

  const activities = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v != null && v !== '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="h-8 w-8" />
            Activity Log
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all changes and modifications across the platform
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Changes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalChanges.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.changesThisWeek.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.changesToday.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contributors</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.mostActiveUsers.length}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Table</Label>
              <Select
                value={filters.tableName || 'all'}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, tableName: value === 'all' ? null : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All tables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tables</SelectItem>
                  {tableOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Action</Label>
              <Select
                value={filters.action || 'all'}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    action: value === 'all' ? null : (value as 'INSERT' | 'UPDATE' | 'DELETE'),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="INSERT">Created</SelectItem>
                  <SelectItem value="UPDATE">Updated</SelectItem>
                  <SelectItem value="DELETE">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>User</Label>
              <Select
                value={filters.userId || 'all'}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, userId: value === 'all' ? null : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate?.split('T')[0] || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    startDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                  }))
                }
              />
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-4">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>
            {activities.length} {activities.length === 1 ? 'entry' : 'entries'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-1">No activity found</h3>
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters
                  ? 'Try adjusting your filters'
                  : 'Changes to capabilities, milestones, and quick wins will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  isExpanded={expandedIds.has(activity.id)}
                  onToggle={() => toggleExpanded(activity.id)}
                />
              ))}
              {hasNextPage && (
                <div className="pt-4 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? 'Loading...' : 'Load more'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityItem({
  activity,
  isExpanded,
  onToggle,
}: {
  activity: ActivityLogWithUser;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const Icon = actionIcons[activity.action as keyof typeof actionIcons] || Edit;
  const colorClass = actionColors[activity.action as keyof typeof actionColors] || 'text-slate-600 bg-slate-100';
  const actionLabel = actionLabels[activity.action as keyof typeof actionLabels] || activity.action;
  const userName = activity.user?.full_name || activity.user?.email || 'System';
  const newValues = activity.new_values as Record<string, unknown> | null;
  const oldValues = activity.old_values as Record<string, unknown> | null;
  const itemName = (newValues?.name as string) || (oldValues?.name as string) || 'item';
  const changes = activity.action === 'UPDATE' ? getChangedFields(oldValues, newValues) : [];

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className={`p-2.5 rounded-full ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm">
                <span className="font-medium">{userName}</span>{' '}
                <span className="text-muted-foreground">{actionLabel.toLowerCase()}</span>{' '}
                <span className="font-medium">{itemName}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <Table2 className="h-3 w-3 mr-1" />
                  {formatTableName(activity.table_name)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(activity.created_at)}
                </span>
              </div>
            </div>
            {(changes.length > 0 || activity.action !== 'UPDATE') && (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            )}
          </div>
          <CollapsibleContent className="mt-3">
            {activity.action === 'UPDATE' && changes.length > 0 ? (
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">Changed fields:</p>
                {changes.map((change) => (
                  <div key={change.field} className="text-sm">
                    <span className="font-medium capitalize">
                      {change.field.replace(/_/g, ' ')}:
                    </span>{' '}
                    <span className="text-red-600 line-through">
                      {formatValue(change.oldValue)}
                    </span>{' '}
                    <span className="text-muted-foreground">→</span>{' '}
                    <span className="text-green-600">{formatValue(change.newValue)}</span>
                  </div>
                ))}
              </div>
            ) : activity.action === 'INSERT' && newValues ? (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Created with:</p>
                <pre className="text-xs overflow-auto max-h-48">
                  {JSON.stringify(filterDisplayValues(newValues), null, 2)}
                </pre>
              </div>
            ) : activity.action === 'DELETE' && oldValues ? (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Deleted item:</p>
                <pre className="text-xs overflow-auto max-h-48">
                  {JSON.stringify(filterDisplayValues(oldValues), null, 2)}
                </pre>
              </div>
            ) : null}
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'empty';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function filterDisplayValues(values: Record<string, unknown>): Record<string, unknown> {
  const ignore = ['id', 'created_at', 'updated_at'];
  return Object.fromEntries(
    Object.entries(values).filter(([key]) => !ignore.includes(key))
  );
}
