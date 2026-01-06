// src/pages/Timeline.tsx
import { TimelineGantt } from '@/components/diagrams';

export default function Timeline() {
  const handleMilestoneClick = (id: string) => {
    // Navigate to milestone detail or open modal
    console.log('Milestone clicked:', id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timeline</h1>
        <p className="text-muted-foreground mt-1">
          View implementation timeline across different paths
        </p>
      </div>

      <TimelineGantt onMilestoneClick={handleMilestoneClick} />
    </div>
  );
}
