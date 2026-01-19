// src/components/layout/FacilitySelector.tsx
import { Building2, Check, ChevronDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useFacilityStore,
  useCurrentFacility,
  useFacilities,
  useFacilityLoading,
} from '@/stores/facilityStore';

interface FacilitySelectorProps {
  className?: string;
  showLocation?: boolean;
  compact?: boolean;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  planning: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  onboarding: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  inactive: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export function FacilitySelector({
  className,
  showLocation = true,
  compact = false,
}: FacilitySelectorProps) {
  const currentFacility = useCurrentFacility();
  const facilities = useFacilities();
  const isLoading = useFacilityLoading();
  const { setCurrentFacility } = useFacilityStore();

  // Show skeleton while loading
  if (isLoading) {
    return (
      <Skeleton className={cn('h-9 w-32', className)} />
    );
  }

  // Don't show if only one facility
  if (facilities.length <= 1 && currentFacility) {
    if (compact) {
      return (
        <div className={cn('flex items-center gap-1.5 text-sm', className)}>
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{currentFacility.code}</span>
        </div>
      );
    }

    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{currentFacility.name}</span>
        {showLocation && currentFacility.location_city && (
          <span className="text-muted-foreground">
            ({currentFacility.location_city}, {currentFacility.location_state})
          </span>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'gap-2',
            compact ? 'h-8 px-2' : '',
            className
          )}
        >
          <Building2 className="h-4 w-4" />
          {currentFacility ? (
            <>
              <span className={compact ? 'sr-only' : ''}>
                {compact ? currentFacility.code : currentFacility.name}
              </span>
              {compact && (
                <span className="font-medium">{currentFacility.code}</span>
              )}
            </>
          ) : (
            <span>Select Facility</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Switch Facility
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {facilities.map((membership) => {
          const facility = membership.facility;
          const isSelected = currentFacility?.id === facility.id;

          return (
            <DropdownMenuItem
              key={facility.id}
              onClick={() => setCurrentFacility(facility)}
              className={cn(
                'flex items-start gap-3 p-3 cursor-pointer',
                isSelected && 'bg-accent'
              )}
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{facility.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {facility.code}
                  </Badge>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary ml-auto" />
                  )}
                </div>
                {facility.location_city && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {facility.location_city}, {facility.location_state}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className={cn('text-xs capitalize', statusColors[facility.status])}
                  >
                    {facility.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Maturity: {facility.maturity_score?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    ({membership.role.replace('_', ' ')})
                  </span>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for sidebar header
export function FacilitySelectorCompact({ className }: { className?: string }) {
  return <FacilitySelector className={className} compact showLocation={false} />;
}

// Badge showing current facility code
export function FacilityBadge({ className }: { className?: string }) {
  const currentFacility = useCurrentFacility();
  const isLoading = useFacilityLoading();

  if (isLoading) {
    return <Skeleton className={cn('h-5 w-10', className)} />;
  }

  if (!currentFacility) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium',
        statusColors[currentFacility.status],
        className
      )}
    >
      {currentFacility.code}
    </Badge>
  );
}
