// src/components/diagrams/DependencyFlow.tsx
import { useCallback, useMemo, useEffect, useState } from 'react';
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
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useMilestones, useCapabilities } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MilestoneNode } from './nodes/MilestoneNode';
import { CapabilityNode } from './nodes/CapabilityNode';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Eye,
  EyeOff,
  GitBranch,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle
} from 'lucide-react';

// Register custom node types
const nodeTypes = {
  milestone: MilestoneNode,
  capability: CapabilityNode,
};

interface DependencyFlowProps {
  onNodeClick?: (id: string, type: 'milestone' | 'capability') => void;
}

type StatusFilter = 'all' | 'completed' | 'in_progress' | 'blocked' | 'not_started';

export function DependencyFlow({ onNodeClick }: DependencyFlowProps) {
  const { data: milestones, isLoading: loadingMs } = useMilestones();
  const { data: capabilities, isLoading: loadingCaps } = useCapabilities();

  // Interactive state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showDependencies, setShowDependencies] = useState(true);
  const [selectedCapability, setSelectedCapability] = useState<string | null>(null);

  // Build nodes and edges from data
  const { computedNodes, computedEdges, stats } = useMemo(() => {
    if (!milestones || !capabilities) {
      return { computedNodes: [], computedEdges: [], stats: { total: 0, completed: 0, inProgress: 0, blocked: 0, notStarted: 0 } };
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const capabilityPositions: Record<string, { x: number; y: number }> = {};

    // Calculate stats
    const stats = {
      total: milestones.length,
      completed: milestones.filter(m => m.status === 'completed').length,
      inProgress: milestones.filter(m => m.status === 'in_progress').length,
      blocked: milestones.filter(m => m.status === 'blocked').length,
      notStarted: milestones.filter(m => m.status === 'not_started').length,
    };

    // Filter capabilities if one is selected
    const filteredCapabilities = selectedCapability
      ? capabilities.filter(c => c.id === selectedCapability)
      : capabilities;

    // Create capability nodes (vertical layout)
    filteredCapabilities.forEach((cap, index) => {
      const x = 50;
      const y = index * 220 + 50;
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
      // Apply status filter
      if (statusFilter !== 'all' && ms.status !== statusFilter) return;
      // Apply capability filter
      if (selectedCapability && ms.capability_id !== selectedCapability) return;

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
        const x = capPos.x + 320 + idx * 280;
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
            capabilityName: (ms as any).capability?.name,
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
            style: { stroke: '#64748b', strokeWidth: 2 },
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
            style: { stroke: '#64748b', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed },
          });
        }

        // Cross-capability dependencies
        if (showDependencies && ms.dependencies?.length) {
          ms.dependencies.forEach((depId: string) => {
            edges.push({
              id: `edge-dep-${depId}-${ms.id}`,
              source: `ms-${depId}`,
              target: nodeId,
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
            });
          });
        }
      });
    });

    return { computedNodes: nodes, computedEdges: edges, stats };
  }, [milestones, capabilities, statusFilter, showDependencies, selectedCapability]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Update nodes and edges when computed values change - this fixes the initial load issue
  useEffect(() => {
    setNodes(computedNodes);
    setEdges(computedEdges);
  }, [computedNodes, computedEdges, setNodes, setEdges]);

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
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[700px] w-full rounded-lg" />
      </div>
    );
  }

  const statusFilters: { value: StatusFilter; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'all', label: 'All', icon: <GitBranch className="h-4 w-4" />, color: 'bg-slate-100 hover:bg-slate-200' },
    { value: 'completed', label: 'Completed', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-green-100 hover:bg-green-200 text-green-700' },
    { value: 'in_progress', label: 'In Progress', icon: <Clock className="h-4 w-4" />, color: 'bg-blue-100 hover:bg-blue-200 text-blue-700' },
    { value: 'blocked', label: 'Blocked', icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-red-100 hover:bg-red-200 text-red-700' },
    { value: 'not_started', label: 'Not Started', icon: <Circle className="h-4 w-4" />, color: 'bg-gray-100 hover:bg-gray-200 text-gray-700' },
  ];

  return (
    <div className="space-y-4">
      {/* Interactive Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Filter:</span>
          <div className="flex gap-1">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant="ghost"
                size="sm"
                className={`gap-1.5 ${statusFilter === filter.value ? filter.color + ' ring-2 ring-offset-1 ring-primary/30' : 'hover:bg-slate-100'}`}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.icon}
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Capability Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Capability:</span>
          <select
            value={selectedCapability || ''}
            onChange={(e) => setSelectedCapability(e.target.value || null)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="">All Capabilities</option>
            {capabilities?.map((cap) => (
              <option key={cap.id} value={cap.id}>{cap.name}</option>
            ))}
          </select>
        </div>

        {/* Toggle Dependencies */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setShowDependencies(!showDependencies)}
        >
          {showDependencies ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {showDependencies ? 'Hide' : 'Show'} Dependencies
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4">
        <Card className="flex-1">
          <CardContent className="py-3 px-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium">{stats.completed} Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">{stats.inProgress} In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm font-medium">{stats.blocked} Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-sm font-medium">{stats.notStarted} Not Started</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {stats.total} Total Milestones
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Flow Diagram */}
      <div className="h-[700px] w-full rounded-lg border bg-gradient-to-br from-slate-50 to-slate-100">
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
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background color="#e2e8f0" gap={16} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'capability') return node.data.color || '#3b82f6';
              if (node.data.status === 'completed') return '#22c55e';
              if (node.data.status === 'in_progress') return '#3b82f6';
              if (node.data.status === 'blocked') return '#ef4444';
              return '#94a3b8';
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
            className="bg-white/80 rounded-lg"
          />

          {/* Legend Panel */}
          <Panel position="bottom-left" className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
            <div className="text-xs font-medium mb-2 text-muted-foreground">Legend</div>
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-slate-500" />
                <span>Sequential Flow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-amber-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b, #f59e0b 4px, transparent 4px, transparent 8px)' }} />
                <span>Cross-Dependency</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
