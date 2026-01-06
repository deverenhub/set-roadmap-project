// src/pages/TechnologyOptions.tsx
import { useState } from 'react';
import {
  useTechnologyOptions,
  useCreateTechnologyOption,
  useUpdateTechnologyOption,
  useDeleteTechnologyOption,
} from '@/hooks/useRoadmapData';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  Server,
  Factory,
  ClipboardCheck,
  Warehouse,
  Barcode,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Star,
  StarOff,
  Check,
  AlertCircle,
  Clock,
  DollarSign,
  Shield,
} from 'lucide-react';
import type { TechnologyOption, TechnologyOptionInsert } from '@/types';

const categoryIcons: Record<string, React.ReactNode> = {
  MES: <Server className="w-5 h-5" />,
  APS: <Factory className="w-5 h-5" />,
  QMS: <ClipboardCheck className="w-5 h-5" />,
  WMS: <Warehouse className="w-5 h-5" />,
  'Data Capture': <Barcode className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  MES: 'bg-blue-500',
  APS: 'bg-purple-500',
  QMS: 'bg-green-500',
  WMS: 'bg-orange-500',
  'Data Capture': 'bg-cyan-500',
};

const categoryDescriptions: Record<string, string> = {
  MES: 'Manufacturing Execution Systems - Real-time production monitoring and control',
  APS: 'Advanced Planning & Scheduling - Optimize production planning and resource allocation',
  QMS: 'Quality Management Systems - Ensure product quality and compliance',
  WMS: 'Warehouse Management Systems - Optimize inventory storage and movement',
  'Data Capture': 'Data Capture & Integration - Automated data collection from shop floor',
};

const defaultOption: Partial<TechnologyOptionInsert> = {
  name: '',
  category: 'MES',
  vendor: '',
  description: '',
  pros: [],
  cons: [],
  estimated_cost: '',
  survivability_score: 5,
  implementation_months: 6,
  integration_type: 'Standard',
  recommended: false,
  notes: '',
};

export default function TechnologyOptions() {
  const { data: options, isLoading } = useTechnologyOptions();
  const createMutation = useCreateTechnologyOption();
  const updateMutation = useUpdateTechnologyOption();
  const deleteMutation = useDeleteTechnologyOption();

  const [selectedCategory, setSelectedCategory] = useState<string>('MES');
  const [editingOption, setEditingOption] = useState<TechnologyOption | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<TechnologyOptionInsert>>(defaultOption);

  const categories = ['MES', 'APS', 'QMS', 'WMS', 'Data Capture'];

  const filteredOptions = options?.filter((opt) => opt.category === selectedCategory) || [];

  const handleEdit = (option: TechnologyOption) => {
    setEditingOption(option);
    setFormData({
      name: option.name,
      category: option.category,
      vendor: option.vendor,
      description: option.description,
      pros: option.pros,
      cons: option.cons,
      estimated_cost: option.estimated_cost,
      survivability_score: option.survivability_score,
      implementation_months: option.implementation_months,
      integration_type: option.integration_type,
      recommended: option.recommended,
      notes: option.notes,
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({ ...defaultOption, category: selectedCategory });
  };

  const handleSave = async () => {
    if (editingOption) {
      await updateMutation.mutateAsync({
        id: editingOption.id,
        updates: formData,
      });
      setEditingOption(null);
    } else if (isCreating) {
      await createMutation.mutateAsync(formData as TechnologyOptionInsert);
      setIsCreating(false);
    }
    setFormData(defaultOption);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteMutation.mutateAsync(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleCancel = () => {
    setEditingOption(null);
    setIsCreating(false);
    setFormData(defaultOption);
  };

  const toggleRecommended = async (option: TechnologyOption) => {
    await updateMutation.mutateAsync({
      id: option.id,
      updates: { recommended: !option.recommended },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72" />
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
          <h1 className="text-3xl font-bold">Technology Options</h1>
          <p className="text-muted-foreground mt-1">
            Evaluate and compare technology solutions for supply chain maturity
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Technology
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="flex items-center gap-2">
              {categoryIcons[category]}
              <span className="hidden sm:inline">{category}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            {/* Category Description */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${categoryColors[category]} flex items-center justify-center text-white`}>
                    {categoryIcons[category]}
                  </div>
                  <div>
                    <CardTitle>{category}</CardTitle>
                    <CardDescription>{categoryDescriptions[category]}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Options Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOptions.map((option) => (
                <Card
                  key={option.id}
                  className={`relative transition-all hover:shadow-lg ${
                    option.recommended ? 'ring-2 ring-green-500 bg-green-50/50' : ''
                  }`}
                >
                  {option.recommended && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-green-500">
                        <Star className="w-3 h-3 mr-1" />
                        Recommended
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{option.name}</CardTitle>
                        {option.vendor && (
                          <p className="text-sm text-muted-foreground">{option.vendor}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toggleRecommended(option)}
                              >
                                {option.recommended ? (
                                  <StarOff className="h-4 w-4" />
                                ) : (
                                  <Star className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {option.recommended ? 'Remove recommendation' : 'Mark as recommended'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(option)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteConfirm(option.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {option.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {option.description}
                      </p>
                    )}

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {option.estimated_cost && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="w-3 h-3" />
                          {option.estimated_cost}
                        </div>
                      )}
                      {option.implementation_months && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {option.implementation_months} months
                        </div>
                      )}
                      {option.survivability_score && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Shield className="w-3 h-3" />
                          Score: {option.survivability_score}/10
                        </div>
                      )}
                      {option.integration_type && (
                        <Badge variant="outline" className="text-xs w-fit">
                          {option.integration_type}
                        </Badge>
                      )}
                    </div>

                    {/* Pros */}
                    {option.pros.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-600 mb-1">Pros</p>
                        <div className="space-y-1">
                          {option.pros.slice(0, 2).map((pro, i) => (
                            <div key={i} className="flex items-start gap-1 text-xs">
                              <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-1">{pro}</span>
                            </div>
                          ))}
                          {option.pros.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{option.pros.length - 2} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cons */}
                    {option.cons.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-red-600 mb-1">Cons</p>
                        <div className="space-y-1">
                          {option.cons.slice(0, 2).map((con, i) => (
                            <div key={i} className="flex items-start gap-1 text-xs">
                              <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-1">{con}</span>
                            </div>
                          ))}
                          {option.cons.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{option.cons.length - 2} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredOptions.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No technology options in this category.</p>
                  <Button variant="outline" className="mt-4" onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Option
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit/Create Dialog */}
      <Dialog open={!!editingOption || isCreating} onOpenChange={() => handleCancel()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOption ? 'Edit Technology Option' : 'Add Technology Option'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Technology name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Vendor</label>
                <Input
                  value={formData.vendor || ''}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="Vendor name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Estimated Cost</label>
                <Input
                  value={formData.estimated_cost || ''}
                  onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                  placeholder="e.g., $50K-100K/year"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Brief description of the technology"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Survivability Score (1-10)</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.survivability_score || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, survivability_score: parseInt(e.target.value) || null })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Implementation (months)</label>
                <Input
                  type="number"
                  min={1}
                  value={formData.implementation_months || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, implementation_months: parseInt(e.target.value) || null })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Integration Type</label>
                <Select
                  value={formData.integration_type || 'Standard'}
                  onValueChange={(value) => setFormData({ ...formData, integration_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Complex">Complex</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                    <SelectItem value="Cloud">Cloud</SelectItem>
                    <SelectItem value="On-Premise">On-Premise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Pros (one per line)</label>
              <Textarea
                value={formData.pros?.join('\n') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pros: e.target.value.split('\n').filter(Boolean),
                  })
                }
                rows={3}
                placeholder="Enter pros, one per line"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Cons (one per line)</label>
              <Textarea
                value={formData.cons?.join('\n') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cons: e.target.value.split('\n').filter(Boolean),
                  })
                }
                rows={3}
                placeholder="Enter cons, one per line"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="Additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || updateMutation.isPending || createMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {editingOption ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Technology Option</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this technology option? This action cannot be undone.
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
