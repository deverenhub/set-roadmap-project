// src/components/search/GlobalSearch.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Target,
  Zap,
  Search,
  ArrowRight,
} from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { cn } from '@/lib/utils';

const typeIcons = {
  capability: Layers,
  milestone: Target,
  quick_win: Zap,
};

const typeLabels = {
  capability: 'Capability',
  milestone: 'Milestone',
  quick_win: 'Quick Win',
};

const statusColors: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
  active: 'bg-blue-100 text-blue-700',
  planned: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

const priorityColors: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  LOW: 'bg-gray-100 text-gray-700',
};

interface GlobalSearchProps {
  className?: string;
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { query, setQuery, groupedResults, clearSearch, totalResults } = useGlobalSearch();

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((path: string) => {
    setOpen(false);
    clearSearch();
    navigate(path);
  }, [navigate, clearSearch]);

  const handleOpenChange = useCallback((open: boolean) => {
    setOpen(open);
    if (!open) {
      clearSearch();
    }
  }, [clearSearch]);

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className={cn(
          'relative h-9 w-9 p-0 lg:h-10 lg:w-60 lg:justify-start lg:px-3 lg:py-2',
          className
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 lg:mr-2" />
        <span className="hidden lg:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 lg:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput
          placeholder="Search capabilities, milestones, quick wins..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {query ? 'No results found.' : 'Start typing to search...'}
          </CommandEmpty>

          {/* Capabilities */}
          {groupedResults.capabilities.length > 0 && (
            <CommandGroup heading="Capabilities">
              {groupedResults.capabilities.slice(0, 5).map((result) => {
                const Icon = typeIcons[result.type];
                return (
                  <CommandItem
                    key={result.id}
                    value={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result.path)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Icon className="h-4 w-4 text-set-teal-600" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium truncate">{result.name}</span>
                      {result.description && (
                        <span className="text-xs text-muted-foreground truncate">
                          {result.description}
                        </span>
                      )}
                    </div>
                    {result.priority && (
                      <Badge
                        variant="secondary"
                        className={cn('text-xs shrink-0', priorityColors[result.priority])}
                      >
                        {result.priority}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {groupedResults.capabilities.length > 0 && groupedResults.milestones.length > 0 && (
            <CommandSeparator />
          )}

          {/* Milestones */}
          {groupedResults.milestones.length > 0 && (
            <CommandGroup heading="Milestones">
              {groupedResults.milestones.slice(0, 5).map((result) => {
                const Icon = typeIcons[result.type];
                return (
                  <CommandItem
                    key={result.id}
                    value={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result.path)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Icon className="h-4 w-4 text-blue-600" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium truncate">{result.name}</span>
                      {result.description && (
                        <span className="text-xs text-muted-foreground truncate">
                          {result.description}
                        </span>
                      )}
                    </div>
                    {result.status && (
                      <Badge
                        variant="secondary"
                        className={cn('text-xs shrink-0', statusColors[result.status])}
                      >
                        {result.status.replace('_', ' ')}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {groupedResults.milestones.length > 0 && groupedResults.quickWins.length > 0 && (
            <CommandSeparator />
          )}

          {/* Quick Wins */}
          {groupedResults.quickWins.length > 0 && (
            <CommandGroup heading="Quick Wins">
              {groupedResults.quickWins.slice(0, 5).map((result) => {
                const Icon = typeIcons[result.type];
                return (
                  <CommandItem
                    key={result.id}
                    value={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result.path)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Icon className="h-4 w-4 text-amber-600" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium truncate">{result.name}</span>
                      {result.description && (
                        <span className="text-xs text-muted-foreground truncate">
                          {result.description}
                        </span>
                      )}
                    </div>
                    {result.status && (
                      <Badge
                        variant="secondary"
                        className={cn('text-xs shrink-0', statusColors[result.status])}
                      >
                        {result.status.replace('_', ' ')}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {/* Show total results if > 15 */}
          {totalResults > 15 && (
            <>
              <CommandSeparator />
              <div className="py-2 px-4 text-xs text-muted-foreground text-center">
                Showing top results. {totalResults} total matches found.
              </div>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
