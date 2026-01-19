// src/components/facilities/FacilityForm.tsx
import { useState, useEffect } from 'react';
import { useFacility, useCreateFacility, useUpdateFacility } from '@/hooks/useFacilities';
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
import { Skeleton } from '@/components/ui/skeleton';
import type { FacilityStatus } from '@/types';

interface FacilityFormProps {
  facilityId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const STATUS_OPTIONS: { value: FacilityStatus; label: string; description: string }[] = [
  { value: 'active', label: 'Active', description: 'Fully operational facility' },
  { value: 'planning', label: 'Planning', description: 'In planning phase' },
  { value: 'onboarding', label: 'Onboarding', description: 'Being set up' },
  { value: 'inactive', label: 'Inactive', description: 'Not currently active' },
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (AZ)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AK)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HI)' },
];

export function FacilityForm({
  facilityId,
  onSuccess,
  onCancel,
}: FacilityFormProps) {
  const isEditing = !!facilityId;

  const { data: facility, isLoading: isFetchingFacility } = useFacility(facilityId || null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    location_city: '',
    location_state: '',
    status: 'planning' as FacilityStatus,
    description: '',
    timezone: 'America/New_York',
  });

  // Populate form when editing
  useEffect(() => {
    if (facility) {
      setFormData({
        code: facility.code || '',
        name: facility.name || '',
        location_city: facility.location_city || '',
        location_state: facility.location_state || '',
        status: facility.status || 'planning',
        description: facility.description || '',
        timezone: facility.timezone || 'America/New_York',
      });
    }
  }, [facility]);

  const createFacility = useCreateFacility();
  const updateFacility = useUpdateFacility();

  const isSubmitting = createFacility.isPending || updateFacility.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && facilityId) {
        await updateFacility.mutateAsync({
          id: facilityId,
          ...formData,
        });
      } else {
        await createFacility.mutateAsync({
          ...formData,
          maturity_score: 0,
        });
      }
      onSuccess?.();
    } catch {
      // Error handled by mutation
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isEditing && isFetchingFacility) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Code */}
        <div className="space-y-2">
          <Label htmlFor="code">Facility Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
            placeholder="e.g., WLK"
            maxLength={10}
            required
            disabled={isEditing}
            className={isEditing ? 'bg-muted' : ''}
          />
          <p className="text-xs text-muted-foreground">
            Unique 3-4 character code (cannot be changed after creation)
          </p>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Facility Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Westlake Florida"
            required
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="location_city">City</Label>
          <Input
            id="location_city"
            value={formData.location_city}
            onChange={(e) => handleChange('location_city', e.target.value)}
            placeholder="e.g., Jacksonville"
          />
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label htmlFor="location_state">State</Label>
          <Select
            value={formData.location_state}
            onValueChange={(v) => handleChange('location_state', v)}
          >
            <SelectTrigger id="location_state">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => handleChange('status', v)}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            value={formData.timezone}
            onValueChange={(v) => handleChange('timezone', v)}
          >
            <SelectTrigger id="timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief description of the facility..."
            rows={3}
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Facility' : 'Create Facility'}
        </Button>
      </div>
    </form>
  );
}
