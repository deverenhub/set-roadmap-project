// src/hooks/useRealtime.ts
import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName = 'capabilities' | 'milestones' | 'quick_wins' | 'activity_log' | 'users';
type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface RealtimeConfig {
  tables: TableName[];
  events?: EventType[];
  onMessage?: (payload: RealtimePostgresChangesPayload<any>) => void;
}

// Generic realtime hook for multiple tables
export function useRealtime(config: RealtimeConfig) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const { tables, events = ['*'], onMessage } = config;

  useEffect(() => {
    // Create a unique channel name
    const channelName = `realtime-${tables.join('-')}-${Date.now()}`;
    
    // Subscribe to changes
    let channel = supabase.channel(channelName);

    tables.forEach((table) => {
      events.forEach((event) => {
        channel = channel.on(
          'postgres_changes' as any,
          {
            event,
            schema: 'public',
            table,
          } as any,
          (payload: any) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: [table] });

            // Call custom handler if provided
            onMessage?.(payload);
          }
        );
      });
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [tables.join(','), events.join(','), queryClient]);

  return channelRef.current;
}

// Convenience hook for single table
export function useRealtimeTable(
  table: TableName,
  events: EventType[] = ['*'],
  onMessage?: (payload: RealtimePostgresChangesPayload<any>) => void
) {
  return useRealtime({
    tables: [table],
    events,
    onMessage,
  });
}

// Hook for activity log realtime updates
export function useRealtimeActivity(
  onNewActivity?: (payload: RealtimePostgresChangesPayload<any>) => void
) {
  return useRealtimeTable('activity_log', ['INSERT'], onNewActivity);
}

// Hook for watching a specific record
export function useRealtimeRecord(
  table: TableName,
  recordId: string,
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void
) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!recordId) return;

    const channelName = `realtime-${table}-${recordId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `id=eq.${recordId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: [table, 'detail', recordId] });
          onUpdate?.(payload);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, recordId, queryClient]);

  return channelRef.current;
}

// Hook for app-level realtime sync (all main tables)
export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('app-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'capabilities' },
        () => queryClient.invalidateQueries({ queryKey: ['capabilities'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'milestones' },
        () => queryClient.invalidateQueries({ queryKey: ['milestones'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quick_wins' },
        () => queryClient.invalidateQueries({ queryKey: ['quickWins'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
