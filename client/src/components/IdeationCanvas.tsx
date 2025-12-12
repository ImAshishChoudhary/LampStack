import { useState, useEffect, useRef, useCallback } from 'react';

interface ProcessingNode {
  id: string;
  label: string;
  description?: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  agent: string;
  children?: string[];
  parentId?: string;
}

interface CanvasNode {
  id: string;
  label: string;
  description?: string;
  x: number;
  y: number;
  status: 'pending' | 'processing' | 'complete' | 'error';
  agent: string;
  parentId?: string;
  depth: number;
  visible: boolean;
}

interface Edge {
  from: string;
  to: string;
  animated: boolean;
}

interface IdeationCanvasProps {
  nodes?: ProcessingNode[];
}

export function IdeationCanvas({ nodes: dynamicNodes = [] }: IdeationCanvasProps) {
  const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [viewOffset] = useState({ x: 50, y: 50 });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dynamicNodes.length === 0) {
      setCanvasNodes([]);
      setEdges([]);
      return;
    }

    const nodeMap = new Map<string, ProcessingNode>();
    dynamicNodes.forEach(n => nodeMap.set(n.id, n));

    const childrenMap = new Map<string, string[]>();
    
    dynamicNodes.forEach(n => {
      if (n.children && n.children.length > 0) {
        childrenMap.set(n.id, [...(childrenMap.get(n.id) || []), ...n.children]);
      }
    });
    
    dynamicNodes.forEach(n => {
      if (n.parentId) {
        const parentChildren = childrenMap.get(n.parentId) || [];
        if (!parentChildren.includes(n.id)) {
          childrenMap.set(n.parentId, [...parentChildren, n.id]);
        }
      }
    });

    const allChildIds = new Set<string>();
    childrenMap.forEach(children => children.forEach(c => allChildIds.add(c)));
    dynamicNodes.forEach(n => {
      if (n.parentId) allChildIds.add(n.id);
    });
    
    const rootNodes = dynamicNodes.filter(n => !allChildIds.has(n.id) && !n.parentId);
    
    if (rootNodes.length === 0 && dynamicNodes.length > 0) {
      rootNodes.push(dynamicNodes[0]);
    }

    const NODE_WIDTH = 220;
    const NODE_HEIGHT = 55;
    const HORIZONTAL_GAP = 60;
    const VERTICAL_GAP = 25;
    const START_X = 40;
    const START_Y = 60;

    const layoutNodes: CanvasNode[] = [];
    const layoutEdges: Edge[] = [];

    const depthYPositions: Map<number, number> = new Map();

    interface QueueItem {
      node: ProcessingNode;
      parentId?: string;
      depth: number;
    }

    const queue: QueueItem[] = rootNodes.map(n => ({ node: n, depth: 0 }));
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { node, parentId, depth } = queue.shift()!;
      
      if (visited.has(node.id)) continue;
      visited.add(node.id);

      const x = START_X + depth * (NODE_WIDTH + HORIZONTAL_GAP);
      const currentY = depthYPositions.get(depth) || START_Y;
      const y = currentY;

      depthYPositions.set(depth, currentY + NODE_HEIGHT + VERTICAL_GAP);

      layoutNodes.push({
        id: node.id,
        label: node.label,
        description: node.description,
        x,
        y,
        status: node.status,
        agent: node.agent,
        parentId,
        depth,
        visible: true,
      });

      if (parentId) {
        layoutEdges.push({
          from: parentId,
          to: node.id,
          animated: node.status === 'processing',
        });
      }

      const nodeChildren = childrenMap.get(node.id) || node.children || [];
      nodeChildren.forEach(childId => {
        const child = nodeMap.get(childId);
        if (child && !visited.has(childId)) {
          queue.push({ node: child, parentId: node.id, depth: depth + 1 });
        }
      });
    }

    setCanvasNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [dynamicNodes]);

  const getNodeCenter = useCallback((nodeId: string): { x: number; y: number } | null => {
    const node = canvasNodes.find(n => n.id === nodeId);
    if (!node) return null;
    return {
      x: node.x + 100 + viewOffset.x, // Half of node width
      y: node.y + 25 + viewOffset.y,  // Half of node height
    };
  }, [canvasNodes, viewOffset]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'border-cyan-400 bg-white';
      case 'complete': return 'border-gray-300 bg-white';
      case 'error': return 'border-gray-300 bg-white';
      default: return 'border-gray-200 bg-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return (
          <div className="w-3.5 h-3.5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        );
      case 'complete':
        return (
          <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return <div className="w-3.5 h-3.5 rounded-full bg-gray-200" />;
    }
  };

  const drawEdge = (edge: Edge) => {
    const from = getNodeCenter(edge.from);
    const to = canvasNodes.find(n => n.id === edge.to);
    
    if (!from || !to) return null;

    const toX = to.x + viewOffset.x;
    const toY = to.y + 25 + viewOffset.y;

    const midX = from.x + (toX - from.x) / 2;

    const pathD = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${toY}, ${toX} ${toY}`;

    return (
      <g key={`${edge.from}-${edge.to}`}>
        <path
          d={pathD}
          fill="none"
          stroke={edge.animated ? '#06b6d4' : '#d1d5db'}
          strokeWidth={2}
          strokeDasharray={edge.animated ? '5,5' : 'none'}
          className={edge.animated ? 'animate-dash' : ''}
        />
        {/* Arrow head */}
        <circle
          cx={toX}
          cy={toY}
          r={4}
          fill={edge.animated ? '#06b6d4' : '#d1d5db'}
        />
      </g>
    );
  };

  if (dynamicNodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-xl bg-gray-100 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <p className="text-[14px] text-gray-600 mb-1">Agent Flow Visualization</p>
          <p className="text-[12px] text-gray-400">Nodes will appear as agents process your task</p>
        </div>
      </div>
    );
  }

  const maxX = Math.max(...canvasNodes.map(n => n.x + 200)) + 100;
  const maxY = Math.max(...canvasNodes.map(n => n.y + 60)) + 100;

  return (
    <div 
      ref={canvasRef}
      className="h-full w-full overflow-auto bg-gradient-to-br from-white via-gray-50/50 to-cyan-50/20"
    >
      <svg 
        width={Math.max(maxX + viewOffset.x, 1200)}
        height={Math.max(maxY + viewOffset.y, 600)}
        className="min-w-full min-h-full"
      >
        {/* CSS for animated dash */}
        <defs>
          <style>
            {`
              @keyframes dash {
                to {
                  stroke-dashoffset: -20;
                }
              }
              .animate-dash {
                animation: dash 0.5s linear infinite;
              }
            `}
          </style>
        </defs>

        {/* Draw edges first (behind nodes) */}
        <g className="edges">
          {edges.map(edge => drawEdge(edge))}
        </g>

        {/* Draw nodes */}
        <g className="nodes">
          {canvasNodes.map((node, index) => (
            <g 
              key={node.id}
              className="transition-all duration-500 ease-out"
              style={{
                transform: `translate(${node.x + viewOffset.x}px, ${node.y + viewOffset.y}px)`,
                opacity: node.visible ? 1 : 0,
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Node background */}
              <foreignObject width={220} height={55} x={0} y={0}>
                <div 
                  className={`
                    h-full px-3 py-2 rounded-lg border transition-all duration-300
                    ${getStatusColor(node.status)}
                    ${node.status === 'processing' ? 'shadow-md' : 'shadow-sm'}
                  `}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(node.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-gray-800 leading-tight line-clamp-2">
                        {node.label}
                      </p>
                      {node.description && (
                        <p className="text-[9px] text-gray-400 truncate mt-0.5">
                          {node.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </foreignObject>
            </g>
          ))}
        </g>
      </svg>

      {/* Legend - simplified */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 px-3 py-2">
        <div className="flex items-center gap-4 text-[10px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-cyan-400" />
            <span>Processing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-300" />
            <span>Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IdeationCanvas;
