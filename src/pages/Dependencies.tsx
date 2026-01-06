// src/pages/Dependencies.tsx
import { useNavigate } from 'react-router-dom';
import { DependencyFlow } from '@/components/diagrams';

export default function Dependencies() {
  const navigate = useNavigate();

  const handleNodeClick = (id: string, type: 'capability' | 'milestone') => {
    if (type === 'capability') {
      navigate(`/capabilities/${id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dependencies</h1>
        <p className="text-muted-foreground mt-1">
          Visualize capability and milestone dependencies
        </p>
      </div>

      <DependencyFlow onNodeClick={handleNodeClick} />
    </div>
  );
}
