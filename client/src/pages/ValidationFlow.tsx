import { useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

const CustomNode = ({ data }: { data: any }) => {
  return (
    <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:shadow-cyan-500/10 hover:border-cyan-300 transition-all min-w-[140px] sm:min-w-[160px]">
      <div className="font-medium text-[12px] sm:text-[13px] text-gray-900 mb-0.5">{data.label}</div>
      {data.description && (
        <div className="text-[10px] sm:text-[11px] text-gray-500">{data.description}</div>
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    data: { label: 'Provider Data Validation' },
    position: { x: 400, y: 50 },
  },
  {
    id: '2',
    type: 'custom',
    data: { label: 'Data Ingestion', description: 'CSV, PDF parsing' },
    position: { x: 100, y: 200 },
  },
  {
    id: '3',
    type: 'custom',
    data: { label: 'NPI Validation', description: 'Registry verification' },
    position: { x: 400, y: 200 },
  },
  {
    id: '4',
    type: 'custom',
    data: { label: 'License Check', description: 'State board validation' },
    position: { x: 700, y: 200 },
  },
  {
    id: '5',
    type: 'custom',
    data: { label: 'Quality Assurance', description: 'Cross-reference check' },
    position: { x: 400, y: 350 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', style: { stroke: '#d1d5db' } },
  { id: 'e1-3', source: '1', target: '3', style: { stroke: '#d1d5db' } },
  { id: 'e1-4', source: '1', target: '4', style: { stroke: '#d1d5db' } },
  { id: 'e2-5', source: '2', target: '5', style: { stroke: '#d1d5db' } },
  { id: 'e3-5', source: '3', target: '5', style: { stroke: '#d1d5db' } },
  { id: 'e4-5', source: '4', target: '5', style: { stroke: '#d1d5db' } },
];

export function ValidationFlow() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [activeTab, setActiveTab] = useState<'flow' | 'results'>('flow');

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-white via-cyan-50/10 to-blue-50/10">
      {/* Logo */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-2">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-7 sm:h-7">
            <rect width="28" height="28" rx="6" fill="url(#logo-gradient-flow)"/>
            <path d="M14 6L18 10L14 14L10 10L14 6Z" fill="white" fillOpacity="0.9"/>
            <path d="M10 14L14 18L10 22L6 18L10 14Z" fill="white" fillOpacity="0.7"/>
            <path d="M18 14L22 18L18 22L14 18L18 14Z" fill="white" fillOpacity="0.7"/>
            <defs>
              <linearGradient id="logo-gradient-flow" x1="0" y1="0" x2="28" y2="28">
                <stop stopColor="#06b6d4"/>
                <stop offset="1" stopColor="#3b82f6"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="text-[14px] sm:text-[15px] font-semibold tracking-tight text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            LampStack
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <h1 className="text-[18px] sm:text-[20px] font-normal text-gray-900 mb-2 sm:mb-3">Provider Validation</h1>
        
        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={() => setActiveTab('flow')}
            className={`pb-1.5 text-[12px] sm:text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === 'flow'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Validation Flow
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`pb-1.5 text-[12px] sm:text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === 'results'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Final Results
          </button>
        </div>
      </div>

      {activeTab === 'flow' ? (
        <div className="flex-1 bg-gradient-to-br from-gray-50/30 to-cyan-50/15 touch-pan-x touch-pan-y">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.3}
            maxZoom={1.5}
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={0.5} color="#e5e7eb" />
            <Controls className="bg-white border border-gray-200 rounded-lg !bottom-4 !left-4" />
          </ReactFlow>
        </div>
      ) : (
        <div className="flex-1 p-3 sm:p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-2.5 sm:space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-500/5 hover:bg-gradient-to-r hover:from-white hover:to-cyan-50/20 active:scale-[0.99] transition-all">
                <div className="flex items-start sm:items-center justify-between mb-2 gap-2">
                  <div>
                    <h3 className="font-medium text-[13px] sm:text-[14px] text-gray-900">Dr. Provider {i}</h3>
                    <p className="text-[11px] sm:text-[12px] text-gray-500">Specialty Medicine</p>
                  </div>
                  <span className="text-[11px] sm:text-[12px] text-gray-600 whitespace-nowrap">NPI: 123456789{i}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-blue-600"
                      style={{ width: `${85 + i * 3}%` }}
                    />
                  </div>
                  <span className="text-[11px] sm:text-[12px] font-medium text-gray-900">{85 + i * 3}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
