// src/components/templates/CapabilityTemplateCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Edit2,
  Trash2,
  Globe,
  Building2,
  Target,
} from 'lucide-react';
import { MissionBadge } from '@/components/capabilities/MissionFilter';
import type { CapabilityTemplate } from '@/types';

interface CapabilityTemplateCardProps {
  template: CapabilityTemplate;
  onEdit?: (template: CapabilityTemplate) => void;
  onDelete?: (template: CapabilityTemplate) => void;
  showActions?: boolean;
}

const priorityColors: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  LOW: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const categoryColors: Record<string, string> = {
  operations: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  technology: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  process: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

export function CapabilityTemplateCard({
  template,
  onEdit,
  onDelete,
  showActions = true,
}: CapabilityTemplateCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate" title={template.name}>
              {template.name}
            </CardTitle>
            {template.mission && (
              <div className="mt-1">
                <MissionBadge mission={template.mission} />
              </div>
            )}
          </div>
          {showActions && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(template)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onEdit && onDelete && <DropdownMenuSeparator />}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(template)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {template.description && (
          <CardDescription className="line-clamp-2 mt-1">
            {template.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Badges Row */}
        <div className="flex flex-wrap gap-1.5">
          <Badge className={priorityColors[template.priority] || priorityColors.MEDIUM}>
            {template.priority}
          </Badge>
          {template.category && (
            <Badge className={categoryColors[template.category] || 'bg-gray-100 text-gray-700'}>
              {template.category}
            </Badge>
          )}
          {template.is_enterprise && (
            <Badge variant="outline" className="gap-1">
              <Globe className="h-3 w-3" />
              Enterprise
            </Badge>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>Target L{template.target_level}</span>
          </div>
          {template.owner && (
            <div className="flex items-center gap-1 truncate">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{template.owner}</span>
            </div>
          )}
        </div>

        {/* QoL Impact */}
        {template.qol_impact && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            <span className="font-medium">Impact: </span>
            <span className="line-clamp-2">{template.qol_impact}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CapabilityTemplateCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}
