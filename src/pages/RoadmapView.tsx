// src/pages/RoadmapView.tsx
import { useState, useMemo } from 'react';
import {
  useRoadmapPaths,
  useCreateRoadmapPath,
  useUpdateRoadmapPath,
  useDeleteRoadmapPath,
  groupPathsByLevel,
} from '@/hooks/useRoadmapData';
import { useCapabilities } from '@/hooks/useCapabilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Package,
  Factory,
  CalendarDays,
  ChevronRight,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Rocket,
  Scale,
  Shield,
  Clock,
  AlertTriangle,
  Zap,
  ListChecks,
  Cpu,
} from 'lucide-react';
import type { RoadmapPath, RoadmapPathInsert, RoadmapType } from '@/types';

interface RoadmapViewProps {
  type: RoadmapType;
}

const typeConfig: Record<RoadmapType, { title: string; description: string; icon: React.ReactNode; color: string }> = {
  inventory: {
    title: 'Inventory Management Roadmap',
    description: 'Path from ad-hoc inventory tracking to predictive inventory optimization',
    icon: <Package className="w-8 h-8" />,
    color: 'bg-blue-500',
  },
  production: {
    title: 'Production Monitoring Roadmap',
    description: 'Journey from manual production tracking to predictive manufacturing intelligence',
    icon: <Factory className="w-8 h-8" />,
    color: 'bg-purple-500',
  },
  planning: {
    title: 'Planning & Scheduling Roadmap',
    description: 'Evolution from reactive scheduling to AI-driven predictive planning',
    icon: <CalendarDays className="w-8 h-8" />,
    color: 'bg-green-500',
  },
};

const pathConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  A: {
    label: 'Aggressive',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200 hover:bg-red-100',
    icon: <Rocket className="w-4 h-4 text-red-500" />,
  },
  B: {
    label: 'Balanced',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    icon: <Scale className="w-4 h-4 text-yellow-500" />,
  },
  C: {
    label: 'Conservative',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200 hover:bg-green-100',
    icon: <Shield className="w-4 h-4 text-green-500" />,
  },
};

const levelColors: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-blue-500',
  5: 'bg-green-500',
};

const defaultPath: Partial<RoadmapPathInsert> = {
  roadmap_type: 'inventory',
  from_level: 1,
  to_level: 2,
  path_name: 'A',
  path_label: 'Aggressive',
  description: '',
  duration_months_min: 3,
  duration_months_max: 6,
  key_activities: [],
  technology_options: [],
  qol_impact: '',
  risks: [],
  capability_id: null,
  order_index: 0,
};

export default function RoadmapView({ type }: RoadmapViewProps) {
  const { data: paths, isLoading } = useRoadmapPaths(type);
  const { data: capabilities } = useCapabilities();
  const createMutation = useCreateRoadmapPath();
  const updateMutation = useUpdateRoadmapPath();
  const deleteMutation = useDeleteRoadmapPath();

  const [editingPath, setEditingPath] = useState<RoadmapPath | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<RoadmapPathInsert>>(defaultPath);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

  const config = typeConfig[type];
  const groupedPaths = useMemo(() => (paths ? groupPathsByLevel(paths) : {}), [paths]);

  const handleEdit = (path: RoadmapPath) => {
    setEditingPath(path);
    setFormData({
      roadmap_type: path.roadmap_type,
      from_level: path.from_level,
      to_level: path.to_level,
      path_name: path.path_name,
      path_label: path.path_label,
      description: path.description,
      duration_months_min: path.duration_months_min,
      duration_months_max: path.duration_months_max,
      key_activities: path.key_activities,
      technology_options: path.technology_options,
      qol_impact: path.qol_impact,
      risks: path.risks,
      capability_id: path.capability_id,
      order_index: path.order_index,
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({ ...defaultPath, roadmap_type: type });
  };

  const handleSave = async () => {
    if (editingPath) {
      await updateMutation.mutateAsync({
        id: editingPath.id,
        updates: formData,
      });
      setEditingPath(null);
    } else if (isCreating) {
      await createMutation.mutateAsync(formData as RoadmapPathInsert);
      setIsCreating(false);
    }
    setFormData(defaultPath);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteMutation.mutateAsync(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleCancel = () => {
    setEditingPath(null);
    setIsCreating(false);
    setFormData(defaultPath);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-80" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <Skeleton className="h-24" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl ${config.color} flex items-center justify-center text-white`}>
            {config.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{config.title}</h1>
            <p className="text-muted-foreground mt-1">{config.description}</p>
          </div>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Path
        </Button>
      </div>

      {/* Path Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Implementation Approaches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(pathConfig).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-2">
                {cfg.icon}
                <span className={`font-medium ${cfg.color}`}>Path {key}:</span>
                <span className="text-muted-foreground">{cfg.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Level Transitions */}
      <div className="space-y-4">
        {Object.entries(groupedPaths)
          .sort(([a], [b]) => {
            const [aFrom] = a.split('-').map(Number);
            const [bFrom] = b.split('-').map(Number);
            return aFrom - bFrom;
          })
          .map(([levelKey, levelPaths]) => {
            const [fromLevel, toLevel] = levelKey.split('-').map(Number);
            return (
              <Card key={levelKey} className="overflow-hidden">
                <Accordion
                  type="single"
                  collapsible
                  value={expandedLevel === levelKey ? levelKey : undefined}
                  onValueChange={(value) => setExpandedLevel(value || null)}
                >
                  <AccordionItem value={levelKey} className="border-0">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-4 w-full">
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 rounded-full ${levelColors[fromLevel]} flex items-center justify-center text-white font-bold`}>
                            {fromLevel}
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          <div className={`w-10 h-10 rounded-full ${levelColors[toLevel]} flex items-center justify-center text-white font-bold`}>
                            {toLevel}
                          </div>
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold">Level {fromLevel} to Level {toLevel}</h3>
                          <p className="text-sm text-muted-foreground">
                            {levelPaths.length} implementation path{levelPaths.length !== 1 ? 's' : ''} available
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        {levelPaths
                          .sort((a, b) => a.path_name.localeCompare(b.path_name))
                          .map((path) => {
                            const cfg = pathConfig[path.path_name] || pathConfig.A;
                            return (
                              <Card
                                key={path.id}
                                className={`relative border ${cfg.bgColor} transition-colors`}
                              >
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {cfg.icon}
                                      <CardTitle className={`text-lg ${cfg.color}`}>
                                        Path {path.path_name}: {path.path_label}
                                      </CardTitle>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleEdit(path)}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => setDeleteConfirm(path.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  {/* Duration */}
                                  <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>
                                      {path.duration_months_min}-{path.duration_months_max} months
                                    </span>
                                  </div>

                                  {/* Description */}
                                  {path.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {path.description}
                                    </p>
                                  )}

                                  {/* Key Activities */}
                                  {path.key_activities.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium flex items-center gap-1 mb-1">
                                        <ListChecks className="w-3 h-3" />
                                        Key Activities
                                      </p>
                                      <ul className="text-xs space-y-1">
                                        {path.key_activities.slice(0, 3).map((activity, i) => (
                                          <li key={i} className="flex items-start gap-1">
                                            <Zap className="w-3 h-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                                            <span className="line-clamp-1">{activity}</span>
                                          </li>
                                        ))}
                                        {path.key_activities.length > 3 && (
                                          <li className="text-muted-foreground">
                                            +{path.key_activities.length - 3} more
                                          </li>
                                        )}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Technology */}
                                  {path.technology_options.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium flex items-center gap-1 mb-1">
                                        <Cpu className="w-3 h-3" />
                                        Technology
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {path.technology_options.slice(0, 3).map((tech, i) => (
                                          <Badge key={i} variant="secondary" className="text-xs">
                                            {tech}
                                          </Badge>
                                        ))}
                                        {path.technology_options.length > 3 && (
                                          <Badge variant="outline" className="text-xs">
                                            +{path.technology_options.length - 3}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Risks */}
                                  {path.risks.length > 0 && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center gap-1 text-xs text-orange-600">
                                            <AlertTriangle className="w-3 h-3" />
                                            {path.risks.length} risk{path.risks.length !== 1 ? 's' : ''}
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                          <ul className="text-xs space-y-1">
                                            {path.risks.map((risk, i) => (
                                              <li key={i}>{risk}</li>
                                            ))}
                                          </ul>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            );
          })}
      </div>

      {paths?.length === 0 && (
        <Card className="py-12">
          <div className="text-center">
            <p className="text-muted-foreground">No roadmap paths defined for {type}.</p>
            <Button variant="outline" className="mt-4" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Path
            </Button>
          </div>
        </Card>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={!!editingPath || isCreating} onOpenChange={() => handleCancel()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPath ? 'Edit Roadmap Path' : 'Add Roadmap Path'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">From Level</label>
                <Select
                  value={String(formData.from_level)}
                  onValueChange={(v) => setFormData({ ...formData, from_level: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((l) => (
                      <SelectItem key={l} value={String(l)}>
                        Level {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">To Level</label>
                <Select
                  value={String(formData.to_level)}
                  onValueChange={(v) => setFormData({ ...formData, to_level: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5].map((l) => (
                      <SelectItem key={l} value={String(l)}>
                        Level {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Path</label>
                <Select
                  value={formData.path_name}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      path_name: v as 'A' | 'B' | 'C',
                      path_label: pathConfig[v]?.label || 'Aggressive',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A - Aggressive</SelectItem>
                    <SelectItem value="B">B - Balanced</SelectItem>
                    <SelectItem value="C">C - Conservative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Duration Min (months)</label>
                <Input
                  type="number"
                  min={1}
                  value={formData.duration_months_min || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, duration_months_min: parseInt(e.target.value) || null })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Duration Max (months)</label>
                <Input
                  type="number"
                  min={1}
                  value={formData.duration_months_max || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, duration_months_max: parseInt(e.target.value) || null })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Key Activities (one per line)</label>
              <Textarea
                value={formData.key_activities?.join('\n') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    key_activities: e.target.value.split('\n').filter(Boolean),
                  })
                }
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Technology Options (one per line)</label>
              <Textarea
                value={formData.technology_options?.join('\n') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    technology_options: e.target.value.split('\n').filter(Boolean),
                  })
                }
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">QoL Impact</label>
              <Input
                value={formData.qol_impact || ''}
                onChange={(e) => setFormData({ ...formData, qol_impact: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Risks (one per line)</label>
              <Textarea
                value={formData.risks?.join('\n') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    risks: e.target.value.split('\n').filter(Boolean),
                  })
                }
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Linked Capability (optional)</label>
              <Select
                value={formData.capability_id || 'none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, capability_id: value === 'none' ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a capability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {capabilities?.map((cap) => (
                    <SelectItem key={cap.id} value={cap.id}>
                      {cap.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending || createMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {editingPath ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Roadmap Path</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this roadmap path? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
