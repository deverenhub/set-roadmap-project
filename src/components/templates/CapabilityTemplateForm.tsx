// src/components/templates/CapabilityTemplateForm.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import {
  useCapabilityTemplate,
  useCreateCapabilityTemplate,
  useUpdateCapabilityTemplate,
} from '@/hooks';
import type { Mission, CapabilityTemplateInsert } from '@/types';

interface CapabilityTemplateFormProps {
  templateId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
const CATEGORIES = ['operations', 'technology', 'process'] as const;
const MISSIONS: { value: Mission; label: string }[] = [
  { value: 'mission_1', label: 'Mission I: Setting the Standard' },
  { value: 'mission_2', label: 'Mission II: Flexible, Resilient Operations' },
  { value: 'mission_3', label: 'Mission III: Evolving our Workforce' },
];

export function CapabilityTemplateForm({
  templateId,
  onSuccess,
  onCancel,
}: CapabilityTemplateFormProps) {
  const { data: existingTemplate, isLoading: loadingTemplate } = useCapabilityTemplate(templateId || null);
  const createMutation = useCreateCapabilityTemplate();
  const updateMutation = useUpdateCapabilityTemplate();

  const [formData, setFormData] = useState<CapabilityTemplateInsert>({
    name: '',
    description: '',
    priority: 'MEDIUM',
    target_level: 5,
    owner: '',
    qol_impact: '',
    color: '',
    is_enterprise: true,
    category: 'operations',
    mission: 'mission_1',
    order_index: 0,
  });

  // Populate form when editing
  useEffect(() => {
    if (existingTemplate) {
      setFormData({
        name: existingTemplate.name,
        description: existingTemplate.description || '',
        priority: existingTemplate.priority,
        target_level: existingTemplate.target_level,
        owner: existingTemplate.owner || '',
        qol_impact: existingTemplate.qol_impact || '',
        color: existingTemplate.color || '',
        is_enterprise: existingTemplate.is_enterprise,
        category: existingTemplate.category,
        mission: existingTemplate.mission,
        order_index: existingTemplate.order_index || 0,
      });
    }
  }, [existingTemplate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (templateId && existingTemplate) {
        await updateMutation.mutateAsync({
          id: templateId,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isEditing = !!templateId;

  if (loadingTemplate && isEditing) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Template Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Value Stream Mapping"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what this capability entails..."
          rows={3}
        />
      </div>

      {/* Mission & Category Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mission">Strategic Mission</Label>
          <Select
            value={formData.mission || ''}
            onValueChange={(value) => setFormData({ ...formData, mission: value as Mission })}
          >
            <SelectTrigger id="mission">
              <SelectValue placeholder="Select mission" />
            </SelectTrigger>
            <SelectContent>
              {MISSIONS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category || ''}
            onValueChange={(value) => setFormData({ ...formData, category: value as typeof CATEGORIES[number] })}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Priority & Target Level Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value as typeof PRIORITIES[number] })}
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target_level">Target Maturity Level</Label>
          <Select
            value={String(formData.target_level)}
            onValueChange={(value) => setFormData({ ...formData, target_level: parseInt(value) })}
          >
            <SelectTrigger id="target_level">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((level) => (
                <SelectItem key={level} value={String(level)}>
                  Level {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Owner */}
      <div className="space-y-2">
        <Label htmlFor="owner">Default Owner</Label>
        <Input
          id="owner"
          value={formData.owner || ''}
          onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
          placeholder="e.g., Process Excellence Team"
        />
      </div>

      {/* QoL Impact */}
      <div className="space-y-2">
        <Label htmlFor="qol_impact">Quality of Life Impact</Label>
        <Textarea
          id="qol_impact"
          value={formData.qol_impact || ''}
          onChange={(e) => setFormData({ ...formData, qol_impact: e.target.value })}
          placeholder="Describe the expected benefits..."
          rows={2}
        />
      </div>

      {/* Color & Order Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="color">Color (optional)</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              type="color"
              value={formData.color || '#3b82f6'}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-12 h-9 p-1 cursor-pointer"
            />
            <Input
              value={formData.color || ''}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="#3b82f6"
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="order_index">Display Order</Label>
          <Input
            id="order_index"
            type="number"
            min="0"
            value={formData.order_index || 0}
            onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Enterprise Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="is_enterprise" className="font-medium">
            Enterprise Template
          </Label>
          <p className="text-sm text-muted-foreground">
            Enterprise templates are automatically included when onboarding new facilities
          </p>
        </div>
        <Switch
          id="is_enterprise"
          checked={formData.is_enterprise}
          onCheckedChange={(checked) => setFormData({ ...formData, is_enterprise: checked })}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading || !formData.name}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
}
