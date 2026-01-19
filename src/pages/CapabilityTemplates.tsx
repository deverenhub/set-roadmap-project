// src/pages/CapabilityTemplates.tsx
// Admin page for managing capability templates
import { useState } from 'react';
import { Plus, FileStack, Filter, Search } from 'lucide-react';
import {
  useCapabilityTemplates,
  useDeleteCapabilityTemplate,
  usePermissions,
} from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CapabilityTemplateCard,
  CapabilityTemplateCardSkeleton,
  CapabilityTemplateForm,
} from '@/components/templates';
import { missionInfo } from '@/components/capabilities/MissionFilter';
import type { CapabilityTemplate, Mission } from '@/types';

export default function CapabilityTemplates() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CapabilityTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<CapabilityTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [missionFilter, setMissionFilter] = useState<Mission | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: templates, isLoading } = useCapabilityTemplates();
  const deleteMutation = useDeleteCapabilityTemplate();
  const { isAdmin } = usePermissions();

  // Filter templates
  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch = !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMission = missionFilter === 'all' || template.mission === missionFilter;
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesMission && matchesCategory;
  });

  // Group by mission for tabs view
  const templatesByMission = {
    mission_1: filteredTemplates?.filter(t => t.mission === 'mission_1') || [],
    mission_2: filteredTemplates?.filter(t => t.mission === 'mission_2') || [],
    mission_3: filteredTemplates?.filter(t => t.mission === 'mission_3') || [],
    uncategorized: filteredTemplates?.filter(t => !t.mission) || [],
  };

  const handleEdit = (template: CapabilityTemplate) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingTemplate) return;
    try {
      await deleteMutation.mutateAsync(deletingTemplate.id);
      setDeletingTemplate(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTemplate(null);
  };

  const renderTemplateGrid = (templates: CapabilityTemplate[]) => {
    if (templates.length === 0) {
      return (
        <Card className="py-8">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <FileStack className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No templates found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery || missionFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first capability template'}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <CapabilityTemplateCard
            key={template.id}
            template={template}
            onEdit={isAdmin ? handleEdit : undefined}
            onDelete={isAdmin ? setDeletingTemplate : undefined}
            showActions={isAdmin}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Capability Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage standardized capability templates for facility onboarding
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{templates?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Total Templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {templates?.filter(t => t.is_enterprise).length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Enterprise Templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">
              {templates?.filter(t => t.priority === 'CRITICAL').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Critical Priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(templates?.map(t => t.mission).filter(Boolean)).size || 0}
            </div>
            <p className="text-sm text-muted-foreground">Missions Covered</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={missionFilter} onValueChange={(v) => setMissionFilter(v as Mission | 'all')}>
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by mission" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Missions</SelectItem>
            <SelectItem value="mission_1">Mission I</SelectItem>
            <SelectItem value="mission_2">Mission II</SelectItem>
            <SelectItem value="mission_3">Mission III</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="process">Process</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates by Mission Tabs */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <CapabilityTemplateCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All ({filteredTemplates?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="mission_1">
              Mission I ({templatesByMission.mission_1.length})
            </TabsTrigger>
            <TabsTrigger value="mission_2">
              Mission II ({templatesByMission.mission_2.length})
            </TabsTrigger>
            <TabsTrigger value="mission_3">
              Mission III ({templatesByMission.mission_3.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {renderTemplateGrid(filteredTemplates || [])}
          </TabsContent>

          <TabsContent value="mission_1">
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-blue-700 dark:text-blue-400">
                {missionInfo.mission_1.name}
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                {missionInfo.mission_1.description}
              </p>
            </div>
            {renderTemplateGrid(templatesByMission.mission_1)}
          </TabsContent>

          <TabsContent value="mission_2">
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium text-green-700 dark:text-green-400">
                {missionInfo.mission_2.name}
              </h3>
              <p className="text-sm text-green-600 dark:text-green-300">
                {missionInfo.mission_2.description}
              </p>
            </div>
            {renderTemplateGrid(templatesByMission.mission_2)}
          </TabsContent>

          <TabsContent value="mission_3">
            <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h3 className="font-medium text-purple-700 dark:text-purple-400">
                {missionInfo.mission_3.name}
              </h3>
              <p className="text-sm text-purple-600 dark:text-purple-300">
                {missionInfo.mission_3.description}
              </p>
            </div>
            {renderTemplateGrid(templatesByMission.mission_3)}
          </TabsContent>
        </Tabs>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? 'Update the capability template details below.'
                : 'Create a new capability template that can be used when onboarding facilities.'}
            </DialogDescription>
          </DialogHeader>
          <CapabilityTemplateForm
            templateId={editingTemplate?.id}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTemplate} onOpenChange={() => setDeletingTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTemplate?.name}"? This action cannot be
              undone. This will not affect capabilities that have already been created from this
              template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
