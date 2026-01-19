// src/components/capabilities/MissionFilter.tsx
import { Target } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Mission } from '@/types';

interface MissionFilterProps {
  value: Mission | null;
  onChange: (value: Mission | null) => void;
  className?: string;
}

// Mission display names and descriptions
export const missionInfo: Record<Mission, { name: string; description: string }> = {
  mission_1: {
    name: 'Mission I: Setting the Standard',
    description: 'Establishing baseline processes for vehicle processing excellence',
  },
  mission_2: {
    name: 'Mission II: Flexible, Resilient Operations',
    description: 'Building adaptable systems that respond to change',
  },
  mission_3: {
    name: 'Mission III: Evolving our Workforce',
    description: 'Developing people capabilities alongside technology',
  },
};

export function MissionFilter({ value, onChange, className }: MissionFilterProps) {
  return (
    <Select
      value={value || 'all'}
      onValueChange={(v) => onChange(v === 'all' ? null : (v as Mission))}
    >
      <SelectTrigger className={className || 'w-56'}>
        <Target className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Mission" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Missions</SelectItem>
        <SelectItem value="mission_1">
          <div className="flex flex-col">
            <span>Mission I</span>
            <span className="text-xs text-muted-foreground">Setting the Standard</span>
          </div>
        </SelectItem>
        <SelectItem value="mission_2">
          <div className="flex flex-col">
            <span>Mission II</span>
            <span className="text-xs text-muted-foreground">Flexible Operations</span>
          </div>
        </SelectItem>
        <SelectItem value="mission_3">
          <div className="flex flex-col">
            <span>Mission III</span>
            <span className="text-xs text-muted-foreground">Evolving Workforce</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

// Simple mission badge component
export function MissionBadge({ mission }: { mission: Mission | null }) {
  if (!mission) return null;

  const colors: Record<Mission, string> = {
    mission_1: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    mission_2: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    mission_3: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  };

  const labels: Record<Mission, string> = {
    mission_1: 'I',
    mission_2: 'II',
    mission_3: 'III',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[mission]}`}
      title={missionInfo[mission].name}
    >
      Mission {labels[mission]}
    </span>
  );
}
