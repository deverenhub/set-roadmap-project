// src/pages/MaturityDefinitions.tsx
import { useState } from 'react';
import { useMaturityDefinitions, useUpdateMaturityDefinition } from '@/hooks/useRoadmapData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Target,
  Settings,
  Database,
  Users,
  Edit2,
  Save,
  X,
  ChevronRight,
  Zap,
  TrendingUp,
} from 'lucide-react';
import type { MaturityDefinition } from '@/types';

const levelColors: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-blue-500',
  5: 'bg-green-500',
};

const levelBgColors: Record<number, string> = {
  1: 'bg-red-50 border-red-200',
  2: 'bg-orange-50 border-orange-200',
  3: 'bg-yellow-50 border-yellow-200',
  4: 'bg-blue-50 border-blue-200',
  5: 'bg-green-50 border-green-200',
};

export default function MaturityDefinitions() {
  const { data: definitions, isLoading } = useMaturityDefinitions();
  const updateMutation = useUpdateMaturityDefinition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MaturityDefinition>>({});
  const [selectedLevel, setSelectedLevel] = useState<MaturityDefinition | null>(null);

  const handleEdit = (definition: MaturityDefinition) => {
    setEditingId(definition.id);
    setEditForm({
      name: definition.name,
      description: definition.description,
      characteristics: definition.characteristics,
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    await updateMutation.mutateAsync({ id: editingId, updates: editForm });
    setEditingId(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maturity Definitions</h1>
          <p className="text-muted-foreground mt-1">
            Supply chain maturity framework - 5 levels of operational excellence
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Target className="w-4 h-4 mr-1" />
          Target: Level 4 (Predictable)
        </Badge>
      </div>

      {/* Progress Indicator */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {definitions?.map((def) => (
            <TooltipProvider key={def.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSelectedLevel(def)}
                    className={`relative z-10 flex flex-col items-center cursor-pointer transition-transform hover:scale-110 ${
                      def.level === 4 ? 'scale-110' : ''
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full ${levelColors[def.level]} flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                        def.level === 4 ? 'ring-4 ring-blue-300 ring-offset-2' : ''
                      }`}
                    >
                      {def.level}
                    </div>
                    <span className="mt-2 text-sm font-medium text-center max-w-24">
                      {def.name}
                    </span>
                    {def.level === 4 && (
                      <Badge className="mt-1 bg-blue-500">TARGET</Badge>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{def.name}</p>
                  <p className="text-xs text-muted-foreground max-w-48">{def.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        {/* Connection line */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 -z-0 rounded-full" />
      </div>

      {/* Level Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {definitions?.map((definition) => (
          <Card
            key={definition.id}
            className={`relative cursor-pointer transition-all hover:shadow-lg ${levelBgColors[definition.level]} ${
              definition.level === 4 ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedLevel(definition)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div
                  className={`w-8 h-8 rounded-full ${levelColors[definition.level]} flex items-center justify-center text-white font-bold`}
                >
                  {definition.level}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(definition);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg">{definition.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {definition.description}
              </p>
              <div className="mt-3 flex items-center text-xs text-muted-foreground">
                <ChevronRight className="w-4 h-4" />
                <span>{definition.characteristics.length} characteristics</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dimension Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Maturity Dimensions by Level
          </CardTitle>
          <CardDescription>
            Four dimensions of operational maturity across all levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Dimension</th>
                  {definitions?.map((def) => (
                    <th key={def.id} className="text-center py-3 px-2">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`w-6 h-6 rounded-full ${levelColors[def.level]} flex items-center justify-center text-white text-xs font-bold`}
                        >
                          {def.level}
                        </div>
                        <span className="text-xs">{def.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-blue-500" />
                      Process
                    </div>
                  </td>
                  {definitions?.map((def) => (
                    <td key={def.id} className="py-3 px-2 text-center text-xs">
                      {def.characteristics[0] || '-'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-500" />
                      Technology
                    </div>
                  </td>
                  {definitions?.map((def) => (
                    <td key={def.id} className="py-3 px-2 text-center text-xs">
                      {def.characteristics[1] || '-'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-green-500" />
                      Data
                    </div>
                  </td>
                  {definitions?.map((def) => (
                    <td key={def.id} className="py-3 px-2 text-center text-xs">
                      {def.characteristics[2] || '-'}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-500" />
                      Knowledge
                    </div>
                  </td>
                  {definitions?.map((def) => (
                    <td key={def.id} className="py-3 px-2 text-center text-xs">
                      {def.characteristics[3] || '-'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLevel} onOpenChange={() => setSelectedLevel(null)}>
        <DialogContent className="max-w-2xl">
          {selectedLevel && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full ${levelColors[selectedLevel.level]} flex items-center justify-center text-white font-bold text-xl`}
                  >
                    {selectedLevel.level}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{selectedLevel.name}</DialogTitle>
                    <p className="text-muted-foreground">{selectedLevel.description}</p>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <h4 className="font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Key Characteristics
                </h4>
                <div className="grid gap-2">
                  {selectedLevel.characteristics.map((char, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className={`w-2 h-2 mt-2 rounded-full ${levelColors[selectedLevel.level]}`} />
                      <span>{char}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingId} onOpenChange={() => handleCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Maturity Definition</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Characteristics (one per line)</label>
              <Textarea
                value={editForm.characteristics?.join('\n') || ''}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    characteristics: e.target.value.split('\n').filter(Boolean),
                  })
                }
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
