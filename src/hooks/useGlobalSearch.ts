// src/hooks/useGlobalSearch.ts
import { useState, useMemo, useCallback } from 'react';
import { useCapabilities, useMilestones, useQuickWins } from '@/hooks';

export interface SearchResult {
  id: string;
  type: 'capability' | 'milestone' | 'quick_win';
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  // For navigation
  path: string;
}

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const { data: capabilities = [] } = useCapabilities();
  const { data: milestones = [] } = useMilestones();
  const { data: quickWins = [] } = useQuickWins();

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search capabilities
    capabilities.forEach((cap) => {
      const nameMatch = cap.name?.toLowerCase().includes(searchTerm);
      const descMatch = cap.description?.toLowerCase().includes(searchTerm);
      const ownerMatch = cap.owner?.toLowerCase().includes(searchTerm);

      if (nameMatch || descMatch || ownerMatch) {
        results.push({
          id: cap.id,
          type: 'capability',
          name: cap.name,
          description: cap.description || undefined,
          status: undefined,
          priority: cap.priority,
          path: `/capabilities?id=${cap.id}`,
        });
      }
    });

    // Search milestones
    milestones.forEach((ms) => {
      const nameMatch = ms.name?.toLowerCase().includes(searchTerm);
      const descMatch = ms.description?.toLowerCase().includes(searchTerm);
      const notesMatch = ms.notes?.toLowerCase().includes(searchTerm);

      if (nameMatch || descMatch || notesMatch) {
        results.push({
          id: ms.id,
          type: 'milestone',
          name: ms.name,
          description: ms.description || undefined,
          status: ms.status,
          priority: undefined,
          path: `/timeline?milestone=${ms.id}`,
        });
      }
    });

    // Search quick wins
    quickWins.forEach((qw) => {
      const nameMatch = qw.name?.toLowerCase().includes(searchTerm);
      const descMatch = qw.description?.toLowerCase().includes(searchTerm);
      const ownerMatch = qw.owner?.toLowerCase().includes(searchTerm);

      if (nameMatch || descMatch || ownerMatch) {
        results.push({
          id: qw.id,
          type: 'quick_win',
          name: qw.name,
          description: qw.description || undefined,
          status: qw.status,
          priority: undefined,
          path: `/quick-wins?id=${qw.id}`,
        });
      }
    });

    // Sort by relevance (exact name matches first)
    return results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === searchTerm;
      const bExact = b.name.toLowerCase() === searchTerm;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStartsWith = a.name.toLowerCase().startsWith(searchTerm);
      const bStartsWith = b.name.toLowerCase().startsWith(searchTerm);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      return a.name.localeCompare(b.name);
    });
  }, [query, capabilities, milestones, quickWins]);

  const groupedResults = useMemo(() => {
    return {
      capabilities: results.filter((r) => r.type === 'capability'),
      milestones: results.filter((r) => r.type === 'milestone'),
      quickWins: results.filter((r) => r.type === 'quick_win'),
    };
  }, [results]);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    setQuery,
    results,
    groupedResults,
    clearSearch,
    hasResults: results.length > 0,
    totalResults: results.length,
  };
}
