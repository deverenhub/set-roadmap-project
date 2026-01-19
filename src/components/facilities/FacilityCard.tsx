// src/components/facilities/FacilityCard.tsx
import { Building2, MapPin, Users, BarChart3, Edit2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { FacilityWithStats } from '@/types';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  planning: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  onboarding: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  inactive: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

interface FacilityCardProps {
  facility: FacilityWithStats;
  onEdit?: (facilityId: string) => void;
  onClick?: (facilityId: string) => void;
  showEditButton?: boolean;
}

export function FacilityCard({
  facility,
  onEdit,
  onClick,
  showEditButton = false,
}: FacilityCardProps) {
  const maturityPercent = ((facility.maturity_score || 0) / 5) * 100;

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-shadow",
        onClick && "cursor-pointer"
      )}
      onClick={() => onClick?.(facility.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              {facility.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {facility.location_city}, {facility.location_state}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {facility.code}
            </Badge>
            <Badge
              variant="outline"
              className={cn('capitalize', statusColors[facility.status])}
            >
              {facility.status}
            </Badge>
            {showEditButton && onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(facility.id);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Maturity Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Maturity Level</span>
            <span className="font-medium">
              {facility.maturity_score?.toFixed(1) || '0.0'} / 5.0
            </span>
          </div>
          <Progress value={maturityPercent} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-xs">Capabilities</p>
              <p className="font-medium">{facility.capability_count || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-xs">Users</p>
              <p className="font-medium">{facility.user_count || 0}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {facility.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {facility.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function FacilityCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-5 w-16 bg-muted animate-pulse rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-2 w-full bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-14 w-full bg-muted animate-pulse rounded" />
          <div className="h-14 w-full bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
