// src/components/facilities/FacilityOnboarding.tsx
import { useState } from 'react';
import { Check, ChevronRight, Building2, Target, Users, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateFacility } from '@/hooks/useFacilities';
import { cn } from '@/lib/utils';
import type { Mission } from '@/types';
import { missionInfo } from '@/components/capabilities/MissionFilter';

interface OnboardingData {
  // Step 1: Basic Info
  code: string;
  name: string;
  location_city: string;
  location_state: string;
  description: string;
  timezone: string;
  // Step 2: Missions
  selectedMissions: Mission[];
  // Step 3: Templates (future - will use capability_templates)
  useEnterpriseTemplates: boolean;
  cloneFromFacility: string | null;
}

const STEPS = [
  { id: 1, name: 'Facility Info', icon: Building2 },
  { id: 2, name: 'Select Missions', icon: Target },
  { id: 3, name: 'Configure Templates', icon: Users },
  { id: 4, name: 'Review & Launch', icon: Rocket },
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
];

interface FacilityOnboardingProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function FacilityOnboarding({ onComplete, onCancel }: FacilityOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    code: '',
    name: '',
    location_city: '',
    location_state: '',
    description: '',
    timezone: 'America/New_York',
    selectedMissions: ['mission_1', 'mission_2', 'mission_3'],
    useEnterpriseTemplates: true,
    cloneFromFacility: null,
  });

  const createFacility = useCreateFacility();

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const toggleMission = (mission: Mission) => {
    setData((prev) => ({
      ...prev,
      selectedMissions: prev.selectedMissions.includes(mission)
        ? prev.selectedMissions.filter((m) => m !== mission)
        : [...prev.selectedMissions, mission],
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.code && data.name && data.location_city && data.location_state;
      case 2:
        return data.selectedMissions.length > 0;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLaunch = async () => {
    try {
      await createFacility.mutateAsync({
        code: data.code.toUpperCase(),
        name: data.name,
        location_city: data.location_city,
        location_state: data.location_state,
        description: data.description || null,
        timezone: data.timezone,
        status: 'onboarding',
      });
      onComplete();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <nav aria-label="Progress">
        <ol className="flex items-center justify-center space-x-4">
          {STEPS.map((step, index) => (
            <li key={step.id} className="flex items-center">
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                  currentStep === step.id && 'bg-primary text-primary-foreground',
                  currentStep > step.id && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                  currentStep < step.id && 'bg-muted text-muted-foreground'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
                <span className="text-sm font-medium hidden sm:inline">{step.name}</span>
              </div>
              {index < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && 'Facility Information'}
            {currentStep === 2 && 'Select Strategic Missions'}
            {currentStep === 3 && 'Configure Capability Templates'}
            {currentStep === 4 && 'Review & Launch'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Enter the basic information for your new facility.'}
            {currentStep === 2 && 'Choose which strategic missions this facility will focus on.'}
            {currentStep === 3 && 'Configure how capabilities will be set up for this facility.'}
            {currentStep === 4 && 'Review your configuration and launch the facility.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Facility Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g., CMR"
                  value={data.code}
                  onChange={(e) => updateData({ code: e.target.value.toUpperCase().slice(0, 5) })}
                  maxLength={5}
                />
                <p className="text-xs text-muted-foreground">3-5 character unique code</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Facility Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Commerce Georgia"
                  value={data.name}
                  onChange={(e) => updateData({ name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., Commerce"
                  value={data.location_city}
                  onChange={(e) => updateData({ location_city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select
                  value={data.location_state}
                  onValueChange={(v) => updateData({ location_state: v })}
                >
                  <SelectTrigger id="state">
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
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={data.timezone}
                  onValueChange={(v) => updateData({ timezone: v })}
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
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this facility..."
                  value={data.description}
                  onChange={(e) => updateData({ description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Mission Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {(['mission_1', 'mission_2', 'mission_3'] as Mission[]).map((mission) => (
                <Card
                  key={mission}
                  className={cn(
                    'cursor-pointer transition-all',
                    data.selectedMissions.includes(mission) && 'border-primary ring-1 ring-primary'
                  )}
                  onClick={() => toggleMission(mission)}
                >
                  <CardContent className="flex items-start gap-4 p-4">
                    <Checkbox
                      checked={data.selectedMissions.includes(mission)}
                      onCheckedChange={() => toggleMission(mission)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{missionInfo[mission].name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {missionInfo[mission].description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {mission === 'mission_1' && (
                          <>
                            <span className="text-xs px-2 py-1 bg-muted rounded">VSM</span>
                            <span className="text-xs px-2 py-1 bg-muted rounded">Production Monitoring</span>
                            <span className="text-xs px-2 py-1 bg-muted rounded">Quality Assurance</span>
                            <span className="text-xs px-2 py-1 bg-muted rounded">AutoCAD</span>
                            <span className="text-xs px-2 py-1 bg-muted rounded">Simio</span>
                          </>
                        )}
                        {mission === 'mission_2' && (
                          <>
                            <span className="text-xs px-2 py-1 bg-muted rounded">Vehicle Movement</span>
                            <span className="text-xs px-2 py-1 bg-muted rounded">Work Management</span>
                            <span className="text-xs px-2 py-1 bg-muted rounded">Digital Twin</span>
                          </>
                        )}
                        {mission === 'mission_3' && (
                          <>
                            <span className="text-xs px-2 py-1 bg-muted rounded">Workforce Training</span>
                            <span className="text-xs px-2 py-1 bg-muted rounded">Knowledge Management</span>
                            <span className="text-xs px-2 py-1 bg-muted rounded">Additive Manufacturing</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Step 3: Template Configuration */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <Checkbox
                  id="enterprise"
                  checked={data.useEnterpriseTemplates}
                  onCheckedChange={(checked) =>
                    updateData({ useEnterpriseTemplates: checked as boolean })
                  }
                />
                <div>
                  <Label htmlFor="enterprise" className="font-medium cursor-pointer">
                    Use Enterprise Capability Templates
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Automatically create capabilities from the standard enterprise templates
                    for your selected missions. This ensures consistency across all facilities.
                  </p>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Capabilities to be created:</h4>
                <div className="space-y-2 text-sm">
                  {data.selectedMissions.includes('mission_1') && (
                    <div>
                      <span className="font-medium text-blue-600 dark:text-blue-400">Mission I:</span>
                      <span className="text-muted-foreground ml-2">
                        Value Stream Mapping, Production Monitoring, Quality Assurance, Facility Design (AutoCAD), Process Simulation (Simio)
                      </span>
                    </div>
                  )}
                  {data.selectedMissions.includes('mission_2') && (
                    <div>
                      <span className="font-medium text-green-600 dark:text-green-400">Mission II:</span>
                      <span className="text-muted-foreground ml-2">
                        Vehicle Movement Optimization, Work Management Systems, Digital Twin Evolution
                      </span>
                    </div>
                  )}
                  {data.selectedMissions.includes('mission_3') && (
                    <div>
                      <span className="font-medium text-purple-600 dark:text-purple-400">Mission III:</span>
                      <span className="text-muted-foreground ml-2">
                        Workforce Training Systems, Knowledge Management, Additive Manufacturing
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Facility</h4>
                  <p className="text-lg font-semibold mt-1">{data.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.location_city}, {data.location_state}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Code</h4>
                  <p className="text-lg font-mono font-semibold mt-1">{data.code}</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Selected Missions</h4>
                <div className="flex flex-wrap gap-2">
                  {data.selectedMissions.map((mission) => (
                    <span
                      key={mission}
                      className={cn(
                        'px-3 py-1 rounded-full text-sm font-medium',
                        mission === 'mission_1' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                        mission === 'mission_2' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                        mission === 'mission_3' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      )}
                    >
                      {missionInfo[mission].name.split(':')[0]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/10">
                <h4 className="font-medium text-green-700 dark:text-green-300">Ready to Launch</h4>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  The facility will be created in "onboarding" status. You can change this to "active"
                  once setup is complete.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={currentStep === 1 ? onCancel : handleBack}>
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </Button>
        <div className="flex gap-2">
          {currentStep < 4 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleLaunch}
              disabled={createFacility.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createFacility.isPending ? 'Creating...' : 'Launch Facility'}
              <Rocket className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
