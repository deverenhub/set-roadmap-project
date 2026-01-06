// src/pages/QoLImpact.tsx
import { useState } from 'react';
import {
  useQoLImpacts,
  useCreateQoLImpact,
  useUpdateQoLImpact,
  useDeleteQoLImpact,
} from '@/hooks/useRoadmapData';
import { useCapabilities } from '@/hooks/useCapabilities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
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
  Heart,
  TrendingUp,
  BarChart3,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Target,
  Gauge,
  LineChart,
  PieChart,
  Activity,
  Zap,
  Users,
  Clock,
} from 'lucide-react';
import type { QoLImpact, QoLImpactInsert } from '@/types';
import {
  PieChart as RechartsProPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const categoryIcons: Record<string, React.ReactNode> = {
  'Inventory Accuracy': <BarChart3 className="w-5 h-5" />,
  'Cycle Time': <Clock className="w-5 h-5" />,
  'Quality Defects': <Activity className="w-5 h-5" />,
  'Delivery Performance': <TrendingUp className="w-5 h-5" />,
  'Customer Satisfaction': <Heart className="w-5 h-5" />,
  'Employee Productivity': <Users className="w-5 h-5" />,
  'Cost Reduction': <Zap className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  'Inventory Accuracy': '#3b82f6',
  'Cycle Time': '#8b5cf6',
  'Quality Defects': '#ef4444',
  'Delivery Performance': '#10b981',
  'Customer Satisfaction': '#f59e0b',
  'Employee Productivity': '#06b6d4',
  'Cost Reduction': '#ec4899',
};

const defaultCategories = [
  'Inventory Accuracy',
  'Cycle Time',
  'Quality Defects',
  'Delivery Performance',
  'Customer Satisfaction',
  'Employee Productivity',
  'Cost Reduction',
];

const defaultImpact: Partial<QoLImpactInsert> = {
  category: 'Inventory Accuracy',
  description: '',
  metrics: [],
  target: '',
  capability_id: null,
  impact_score: 5,
};

export default function QoLImpactPage() {
  const { data: impacts, isLoading } = useQoLImpacts();
  const { data: capabilities } = useCapabilities();
  const createMutation = useCreateQoLImpact();
  const updateMutation = useUpdateQoLImpact();
  const deleteMutation = useDeleteQoLImpact();

  const [editingImpact, setEditingImpact] = useState<QoLImpact | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<QoLImpactInsert>>(defaultImpact);

  // Chart data
  const chartData = impacts?.map((impact) => ({
    name: impact.category,
    value: impact.impact_score,
    fill: categoryColors[impact.category] || '#6b7280',
  })) || [];

  const handleEdit = (impact: QoLImpact) => {
    setEditingImpact(impact);
    setFormData({
      category: impact.category,
      description: impact.description,
      metrics: impact.metrics,
      target: impact.target,
      capability_id: impact.capability_id,
      impact_score: impact.impact_score,
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData(defaultImpact);
  };

  const handleSave = async () => {
    if (editingImpact) {
      await updateMutation.mutateAsync({
        id: editingImpact.id,
        updates: formData,
      });
      setEditingImpact(null);
    } else if (isCreating) {
      await createMutation.mutateAsync(formData as QoLImpactInsert);
      setIsCreating(false);
    }
    setFormData(defaultImpact);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteMutation.mutateAsync(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleCancel = () => {
    setEditingImpact(null);
    setIsCreating(false);
    setFormData(defaultImpact);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const totalScore = impacts?.reduce((sum, i) => sum + i.impact_score, 0) || 0;
  const maxPossibleScore = (impacts?.length || 0) * 10;
  const overallProgress = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-500" />
            Quality of Life Impact
          </h1>
          <p className="text-muted-foreground mt-1">
            Measure and track the impact of supply chain improvements on operations
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Impact Metric
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Impact Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{impacts?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Impact Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalScore}</div>
            <p className="text-xs text-muted-foreground">out of {maxPossibleScore}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {impacts?.length ? (totalScore / impacts.length).toFixed(1) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">out of 10</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallProgress.toFixed(0)}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Impact Distribution
            </CardTitle>
            <CardDescription>
              Relative impact scores across all categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsProPie>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name.split(' ')[0]}: ${value}`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsProPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              Impact Scores by Category
            </CardTitle>
            <CardDescription>
              Detailed view of impact scores (1-10 scale)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 10]} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {impacts?.map((impact) => (
          <Card
            key={impact.id}
            className="relative group hover:shadow-lg transition-all"
            style={{ borderTopColor: categoryColors[impact.category], borderTopWidth: '4px' }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: categoryColors[impact.category] || '#6b7280' }}
                  >
                    {categoryIcons[impact.category] || <Gauge className="w-5 h-5" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{impact.category}</CardTitle>
                    <Badge
                      variant="outline"
                      className="mt-1"
                      style={{ color: categoryColors[impact.category] }}
                    >
                      Score: {impact.impact_score}/10
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(impact)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteConfirm(impact.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{impact.description}</p>

              {/* Target */}
              {impact.target && (
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Target:</span>
                  <span className="text-muted-foreground">{impact.target}</span>
                </div>
              )}

              {/* Metrics */}
              {impact.metrics.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Key Metrics</p>
                  <div className="flex flex-wrap gap-1">
                    {impact.metrics.map((metric, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Capability */}
              {impact.capability && (
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Linked to: <span className="font-medium">{impact.capability.name}</span>
                </div>
              )}

              {/* Progress bar */}
              <Progress
                value={impact.impact_score * 10}
                className="h-2"
                style={
                  {
                    '--progress-background': categoryColors[impact.category],
                  } as React.CSSProperties
                }
              />
            </CardContent>
          </Card>
        ))}

        {impacts?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No impact metrics defined yet.</p>
            <Button variant="outline" className="mt-4" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Impact Metric
            </Button>
          </div>
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={!!editingImpact || isCreating} onOpenChange={() => handleCancel()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingImpact ? 'Edit Impact Metric' : 'Add Impact Metric'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Category *</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {defaultCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Describe the impact area"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Impact Score (1-10)</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.impact_score || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, impact_score: parseInt(e.target.value) || 5 })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Target</label>
                <Input
                  value={formData.target || ''}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  placeholder="e.g., 99% accuracy"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Key Metrics (one per line)</label>
              <Textarea
                value={formData.metrics?.join('\n') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metrics: e.target.value.split('\n').filter(Boolean),
                  })
                }
                rows={3}
                placeholder="Enter metrics, one per line"
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
              disabled={
                !formData.category ||
                !formData.description ||
                updateMutation.isPending ||
                createMutation.isPending
              }
            >
              <Save className="w-4 h-4 mr-2" />
              {editingImpact ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Impact Metric</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this impact metric? This action cannot be undone.
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
