// src/components/capabilities/CapabilityForm.tsx
import { useState } from 'react';
import { useCreateCapability, useUpdateCapability } from '@/hooks';
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
import type { Capability, Priority } from '@/types';

interface CapabilityFormProps {
  capability?: Capability;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const LEVEL_OPTIONS = [1, 2, 3, 4, 5];

const COLOR_OPTIONS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#ec4899', label: 'Pink' },
];

export function CapabilityForm({
  capability,
  onSuccess,
  onCancel,
}: CapabilityFormProps) {
  const isEditing = !!capability;

  const [formData, setFormData] = useState({
    name: capability?.name || '',
    description: capability?.description || '',
    priority: capability?.priority || 'MEDIUM',
    current_level: capability?.current_level || 1,
    target_level: capability?.target_level || 4,
    owner: capability?.owner || '',
    color: capability?.color || '#3b82f6',
    qol_impact: capability?.qol_impact || '',
  });

  const createCapability = useCreateCapability();
  const updateCapability = useUpdateCapability();

  const isSubmitting = createCapability.isPending || updateCapability.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && capability) {
        await updateCapability.mutateAsync({
          id: capability.id,
          ...formData,
        });
      } else {
        await createCapability.mutateAsync(formData);
      }
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Name */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Production Monitoring"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the capability and its objectives..."
            rows={3}
          />
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <Select
            value={formData.priority}
            onValueChange={(v) => handleChange('priority', v)}
          >
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Owner */}
        <div className="space-y-2">
          <Label htmlFor="owner">Owner / Department</Label>
          <Input
            id="owner"
            value={formData.owner}
            onChange={(e) => handleChange('owner', e.target.value)}
            placeholder="e.g., Operations"
          />
        </div>

        {/* Current Level */}
        <div className="space-y-2">
          <Label htmlFor="current_level">Current Level *</Label>
          <Select
            value={formData.current_level.toString()}
            onValueChange={(v) => handleChange('current_level', parseInt(v))}
          >
            <SelectTrigger id="current_level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map((level) => (
                <SelectItem key={level} value={level.toString()}>
                  Level {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Target Level */}
        <div className="space-y-2">
          <Label htmlFor="target_level">Target Level *</Label>
          <Select
            value={formData.target_level.toString()}
            onValueChange={(v) => handleChange('target_level', parseInt(v))}
          >
            <SelectTrigger id="target_level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.filter((l) => l >= formData.current_level).map((level) => (
                <SelectItem key={level} value={level.toString()}>
                  Level {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Color */}
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Select
            value={formData.color}
            onValueChange={(v) => handleChange('color', v)}
          >
            <SelectTrigger id="color">
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: formData.color }}
                />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {COLOR_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: option.value }}
                    />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* QoL Impact */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="qol_impact">Quality of Life Impact</Label>
          <Textarea
            id="qol_impact"
            value={formData.qol_impact}
            onChange={(e) => handleChange('qol_impact', e.target.value)}
            placeholder="Describe how this capability improves employee quality of life..."
            rows={2}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? 'Update Capability' : 'Create Capability'}
        </Button>
      </div>
    </form>
  );
}
