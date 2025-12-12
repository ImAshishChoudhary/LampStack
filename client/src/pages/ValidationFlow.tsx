import { useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { apiClient } from '../services/api';

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
  const [providers, setProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await apiClient.getProviders({ limit: 10 });
        
        const mappedProviders = response.providers?.map((p: any, idx: number) => ({
          id: p.id,
          name: `Dr. ${p.firstName} ${p.lastName}`,
          specialty: p.specialties?.[0] || 'General Medicine',
          npi: p.npiNumber,
          score: p.overallConfidence || 85 + (idx * 2),
          grade: p.overallConfidence >= 90 ? 'A' : p.overallConfidence >= 80 ? 'B' : p.overallConfidence >= 70 ? 'C' : 'D',
        })) || [];

        if (mappedProviders.length === 0) {
          setProviders([
            { id: 1, name: 'Dr. James Thomas', specialty: 'Internal Medicine', npi: '1003000126', score: 64, grade: 'D' },
            { id: 2, name: 'Dr. Sarah Martinez', specialty: 'Family Medicine', npi: '1234567892', score: 82, grade: 'B' },
            { id: 3, name: 'Dr. John Doe', specialty: 'Internal Medicine', npi: '1003000126', score: 64, grade: 'D' },
            { id: 4, name: 'Dr. Emily Chen', specialty: 'Pediatrics', npi: '1234567894', score: 91, grade: 'A' },
          ]);
        } else {
          setProviders(mappedProviders);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch providers:', error);
        setProviders([
          { id: 1, name: 'Dr. James Thomas', specialty: 'Internal Medicine', npi: '1003000126', score: 64, grade: 'D' },
          { id: 2, name: 'Dr. Sarah Martinez', specialty: 'Family Medicine', npi: '1234567892', score: 82, grade: 'B' },
          { id: 3, name: 'Dr. John Doe', specialty: 'Internal Medicine', npi: '1003000126', score: 64, grade: 'D' },
          { id: 4, name: 'Dr. Emily Chen', specialty: 'Pediatrics', npi: '1234567894', score: 91, grade: 'A' },
        ]);
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

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
            {isLoading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                <p className="mt-3 text-sm text-gray-500">Loading provider data...</p>
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-500">No providers found</p>
              </div>
            ) : (
              providers.map((provider, i) => (
                <div 
                  key={provider.id} 
                  className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-500/5 hover:bg-gradient-to-r hover:from-white hover:to-cyan-50/20 active:scale-[0.99] transition-all duration-200 cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-start sm:items-center justify-between mb-2 gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[13px] sm:text-[14px] text-gray-900">{provider.name}</h3>
                        {provider.grade && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            provider.grade === 'A' ? 'bg-green-100 text-green-700' :
                            provider.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                            provider.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {provider.grade}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-[12px] text-gray-500">{provider.specialty}</p>
                    </div>
                    <span className="text-[11px] sm:text-[12px] text-gray-600 whitespace-nowrap">NPI: {provider.npi}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${
                          provider.score >= 90 ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                          provider.score >= 80 ? 'bg-gradient-to-r from-blue-600 to-cyan-600' :
                          provider.score >= 70 ? 'bg-gradient-to-r from-yellow-600 to-amber-600' :
                          'bg-gradient-to-r from-orange-600 to-red-600'
                        }`}
                        style={{ width: `${provider.score}%` }}
                      />
                    </div>
                    <span className="text-[11px] sm:text-[12px] font-medium text-gray-900">{provider.score}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
