// src/components/quickwins/QuickWinForm.tsx
import { useState } from 'react';
import { useCreateQuickWin, useUpdateQuickWin, useCapabilities } from '@/hooks';
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
import type { QuickWin } from '@/types';

interface QuickWinFormProps {
  quickWin?: QuickWin;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CATEGORIES = ['Operations', 'Safety', 'HR', 'Technology', 'Process', 'Training'];
const INVESTMENT_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];
const ROI_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];

export function QuickWinForm({ quickWin, onSuccess, onCancel }: QuickWinFormProps) {
  const isEditing = !!quickWin;
  const { data: capabilities } = useCapabilities();

  const [formData, setFormData] = useState({
    name: quickWin?.name || '',
    description: quickWin?.description || '',
    capability_id: quickWin?.capability_id || '',
    timeline_months: quickWin?.timeline_months || 1,
    investment: quickWin?.investment || 'MEDIUM',
    roi: quickWin?.roi || 'MEDIUM',
    category: quickWin?.category || '',
  });

  const createQuickWin = useCreateQuickWin();
  const updateQuickWin = useUpdateQuickWin();

  const isSubmitting = createQuickWin.isPending || updateQuickWin.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        capability_id: formData.capability_id && formData.capability_id !== 'none' ? formData.capability_id : null,
      };

      if (isEditing && quickWin) {
        await updateQuickWin.mutateAsync({ id: quickWin.id, ...data });
      } else {
        await createQuickWin.mutateAsync(data);
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
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Daily Stand-up Dashboards"
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the quick win initiative..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(v) => handleChange('category', v)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="capability">Related Capability</Label>
          <Select
            value={formData.capability_id}
            onValueChange={(v) => handleChange('capability_id', v)}
          >
            <SelectTrigger id="capability">
              <SelectValue placeholder="Select capability (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {capabilities?.map((cap) => (
                <SelectItem key={cap.id} value={cap.id}>{cap.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline">Timeline (months) *</Label>
          <Input
            id="timeline"
            type="number"
            min={1}
            max={12}
            value={formData.timeline_months}
            onChange={(e) => handleChange('timeline_months', parseInt(e.target.value) || 1)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="investment">Investment Level</Label>
          <Select
            value={formData.investment}
            onValueChange={(v) => handleChange('investment', v)}
          >
            <SelectTrigger id="investment">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INVESTMENT_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="roi">Expected ROI</Label>
          <Select
            value={formData.roi}
            onValueChange={(v) => handleChange('roi', v)}
          >
            <SelectTrigger id="roi">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROI_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? 'Update Quick Win' : 'Create Quick Win'}
        </Button>
      </div>
    </form>
  );
}
