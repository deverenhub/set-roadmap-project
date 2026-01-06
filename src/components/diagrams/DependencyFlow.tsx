// src/components/diagrams/DependencyFlow.tsx
import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useMilestones, useCapabilities } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { MilestoneNode } from './nodes/MilestoneNode';
import { CapabilityNode } from './nodes/CapabilityNode';

// Register custom node types
const nodeTypes = {
  milestone: MilestoneNode,
  capability: CapabilityNode,
};

interface DependencyFlowProps {
  onNodeClick?: (id: string, type: 'milestone' | 'capability') => void;
}

export function DependencyFlow({ onNodeClick }: DependencyFlowProps) {
  const { data: milestones, isLoading: loadingMs } = useMilestones();
  const { data: capabilities, isLoading: loadingCaps } = useCapabilities();

  // Build nodes and edges from data
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!milestones || !capabilities) {
      return { initialNodes: [], initialEdges: [] };
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const capabilityPositions: Record<string, { x: number; y: number }> = {};

    // Create capability nodes (vertical layout)
    capabilities.forEach((cap, index) => {
      const x = 50;
      const y = index * 200 + 50;
      capabilityPositions[cap.id] = { x, y };

      nodes.push({
        id: `cap-${cap.id}`,
        type: 'capability',
        position: { x, y },
        data: {
          id: cap.id,
          name: cap.name,
          priority: cap.priority,
          currentLevel: cap.current_level,
          targetLevel: cap.target_level,
          color: cap.color,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
    });

    // Create milestone nodes and edges
    const milestonesByCapability: Record<string, typeof milestones> = {};
    milestones.forEach((ms) => {
      if (!ms.capability_id) return;
      if (!milestonesByCapability[ms.capability_id]) {
        milestonesByCapability[ms.capability_id] = [];
      }
      milestonesByCapability[ms.capability_id].push(ms);
    });

    Object.entries(milestonesByCapability).forEach(([capId, msList]) => {
      const capPos = capabilityPositions[capId];
      if (!capPos) return;

      // Sort by level
      const sorted = [...msList].sort((a, b) => a.from_level - b.from_level);

      sorted.forEach((ms, idx) => {
        const nodeId = `ms-${ms.id}`;
        const x = capPos.x + 300 + idx * 250;
        const y = capPos.y;

        nodes.push({
          id: nodeId,
          type: 'milestone',
          position: { x, y },
          data: {
            id: ms.id,
            name: ms.name,
            status: ms.status,
            fromLevel: ms.from_level,
            toLevel: ms.to_level,
            capabilityName: ms.capability?.name,
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        });

        // Edge from capability to first milestone
        if (idx === 0) {
          edges.push({
            id: `edge-cap-${capId}-ms-${ms.id}`,
            source: `cap-${capId}`,
            target: nodeId,
            type: 'smoothstep',
            animated: ms.status === 'in_progress',
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed },
          });
        }

        // Edge from previous milestone
        if (idx > 0) {
          const prevMs = sorted[idx - 1];
          edges.push({
            id: `edge-ms-${prevMs.id}-ms-${ms.id}`,
            source: `ms-${prevMs.id}`,
            target: nodeId,
            type: 'smoothstep',
            animated: ms.status === 'in_progress',
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed },
          });
        }

        // Cross-capability dependencies
        if (ms.dependencies?.length) {
          ms.dependencies.forEach((depId: string) => {
            edges.push({
              id: `edge-dep-${depId}-${ms.id}`,
              source: `ms-${depId}`,
              target: nodeId,
              type: 'smoothstep',
              animated: false,
              style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
            });
          });
        }
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [milestones, capabilities]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.id.startsWith('cap-')) {
        onNodeClick?.(node.data.id, 'capability');
      } else if (node.id.startsWith('ms-')) {
        onNodeClick?.(node.data.id, 'milestone');
      }
    },
    [onNodeClick]
  );

  const isLoading = loadingMs || loadingCaps;

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-lg" />;
  }

  return (
    <div className="h-[600px] w-full rounded-lg border bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.25}
        maxZoom={2}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'capability') return node.data.color || '#3b82f6';
            if (node.data.status === 'completed') return '#22c55e';
            if (node.data.status === 'in_progress') return '#3b82f6';
            if (node.data.status === 'blocked') return '#ef4444';
            return '#94a3b8';
          }}
        />
      </ReactFlow>
    </div>
  );
}
