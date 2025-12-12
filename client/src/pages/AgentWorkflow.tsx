import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IdeationCanvas } from '../components/IdeationCanvas';
import { useAgentWebSocket } from '../hooks/useAgentWebSocket';

interface ValidationStats {
  totalProviders: number;
  validatedProviders: number;
  npiVerified: number;
  licenseActive: number;
  issuesFlagged: number;
  contactEnriched: number;
  avgConfidence: number;
}

interface LocationState {
  query?: string;
  fileName?: string;
  fileContent?: string;
}

export function AgentWorkflow() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'flow' | 'results'>('flow');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProviderIdx, setSelectedProviderIdx] = useState(0);
  const [stats, setStats] = useState<ValidationStats>({
    totalProviders: 0,
    validatedProviders: 0,
    npiVerified: 0,
    licenseActive: 0,
    issuesFlagged: 0,
    contactEnriched: 0,
    avgConfidence: 0,
  });
  
  const logsEndRef = useRef<HTMLDivElement>(null);
  const { isConnected, logs, nodes, progress, isComplete, results, startProcessing, clearLogs } = useAgentWebSocket();

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (state?.query && !isProcessing && logs.length === 0 && isConnected) {
      console.log('[AgentWorkflow] Auto-starting processing with query:', state.query);
      console.log('[AgentWorkflow] File content length:', state?.fileContent?.length || 0);
      setInput(state.query);
      handleStartProcessing(state.query);
    }
  }, [state?.query, isConnected]);

  useEffect(() => {
    if (results?.stats) {
      const s = results.stats;
      console.log('[AgentWorkflow] Received stats:', s);
      setStats({
        totalProviders: s.totalProviders || 0,
        validatedProviders: s.npiValidated || s.totalProviders || 0,
        npiVerified: s.npiValidated || 0,
        licenseActive: s.addressValidated || 0,
        issuesFlagged: s.issuesFlagged || 0,
        contactEnriched: s.addressValidated || 0,
        avgConfidence: s.avgConfidence || 85,
      });
      setIsProcessing(false);
    }
  }, [results]);

  useEffect(() => {
    if (isComplete) {
      setTimeout(() => setActiveTab('results'), 800);
    }
  }, [isComplete]);

  const providers = results?.providers || [];
  const selectedProvider = providers[selectedProviderIdx] || providers[0];


  const handleStartProcessing = (query?: string) => {
    const taskQuery = query || input;
    if (!taskQuery.trim()) {
      console.log('[AgentWorkflow] Empty query, not starting');
      return;
    }
    
    console.log('[AgentWorkflow] Starting processing...');
    console.log('[AgentWorkflow] Query:', taskQuery);
    console.log('[AgentWorkflow] File name:', state?.fileName);
    console.log('[AgentWorkflow] File content length:', state?.fileContent?.length || 0);
    console.log('[AgentWorkflow] WebSocket connected:', isConnected);
    
    clearLogs();
    setIsProcessing(true);
    setActiveTab('flow');
    startProcessing({
      name: state?.fileName || 'provider_data.csv',
      content: state?.fileContent || '',
      query: taskQuery,
    });
  };

  const handleSubmit = () => {
    if (!input.trim() || isProcessing) return;
    handleStartProcessing(input);
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-white via-gray-50/30 to-cyan-50/10">
      {/* Left Sidebar - Agent Logs - Fixed width */}
      <div className="w-[340px] min-w-[340px] max-w-[340px] border-r border-gray-200 flex flex-col bg-white">
        {/* Header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <span className="text-[13px] text-gray-700">Agent Activity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-cyan-500' : 'bg-gray-300'}`} />
            <span className="text-[10px] text-gray-400">{isConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>

        {/* Agent Logs */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              {isProcessing ? (
                <>
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-[13px] text-gray-600">Initializing agents...</p>
                  <p className="text-[11px] text-gray-400 mt-1">Processing your request</p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-lg bg-gray-100 mb-3 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-gray-500">Ready to process</p>
                  <p className="text-[11px] text-gray-400 mt-1">Enter a task below to start</p>
                </>
              )}
            </div>
          ) : (
            <div className="px-4 py-3 space-y-1">
              {logs.map((log, idx) => (
                <div key={idx} className="py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-medium text-cyan-600 uppercase tracking-wide">
                      {log.agent || 'system'}
                    </span>
                    <span className="text-[9px] text-gray-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    {log.type === 'reasoning' && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-cyan-50 text-cyan-600 rounded font-medium">thinking</span>
                    )}
                  </div>
                  <p className={`text-[12px] leading-relaxed break-words whitespace-pre-wrap ${
                    log.type === 'error' ? 'text-red-600' :
                    log.type === 'reasoning' ? 'text-gray-500 italic' :
                    log.type === 'complete' ? 'text-cyan-600' :
                    'text-gray-600'
                  }`}>
                    {log.message}
                  </p>
                </div>
              ))}

              {/* Processing indicator */}
              {isProcessing && !isComplete && (
                <div className="py-2 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {progress?.stage || 'Processing...'}
                  </span>
                </div>
              )}

              {/* Progress bar */}
              {progress && !isComplete && (
                <div className="py-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                    <span>{progress.stage}</span>
                    <span>{progress.progress}%</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 transition-all duration-300 ease-out"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div ref={logsEndRef} />
            </div>
          )}
        </div>

        {/* Message Input Box */}
        <div className="p-3 border-t border-gray-100 flex-shrink-0 bg-white">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Ask a follow-up or start new task..."
              disabled={isProcessing}
              className="w-full bg-transparent border-none focus:outline-none resize-none text-[12px] text-gray-700 placeholder-gray-400 min-h-[36px] max-h-[60px] disabled:opacity-50"
              rows={1}
            />
            <div className="flex items-center justify-between mt-2">
              <button className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                Add file
              </button>
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isProcessing}
                className="w-6 h-6 rounded bg-gray-200 text-gray-500 hover:bg-cyan-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tabs */}
        <div className="h-12 border-b border-gray-200 bg-white flex items-center px-6 flex-shrink-0">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('flow')}
              className={`text-[13px] h-12 border-b-2 transition-colors ${
                activeTab === 'flow'
                  ? 'border-cyan-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Ideation Flow
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`text-[13px] h-12 border-b-2 transition-colors ${
                activeTab === 'results'
                  ? 'border-cyan-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Results
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-white">
          {activeTab === 'flow' ? (
            <IdeationCanvas nodes={nodes} />
          ) : (
            <div className="h-full flex">
              {/* Provider Details - Center/Main */}
              <div className="flex-1 overflow-y-auto p-6 bg-white">
                {providers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-[13px] text-gray-400">No results yet</p>
                  </div>
                ) : selectedProvider && (
                  <div className="max-w-3xl mx-auto">
                    {/* Provider Header with Avatar */}
                    <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-100">
                      <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-[20px] font-medium text-gray-500">
                          {(selectedProvider.firstname?.[0] || selectedProvider.name?.[0] || 'P').toUpperCase()}
                          {(selectedProvider.lastname?.[0] || selectedProvider.name?.split(' ')[1]?.[0] || '').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h1 className="text-[20px] font-semibold text-gray-900">
                          {selectedProvider.name || `${selectedProvider.firstname} ${selectedProvider.lastname}`}
                        </h1>
                        <p className="text-[13px] text-gray-500">{selectedProvider.specialty || 'Healthcare Provider'}</p>
                      </div>
                      {/* Confidence Score - Color changes based on score */}
                      <div className="text-center flex-shrink-0">
                        <div className="relative w-14 h-14">
                          {(() => {
                            const score = selectedProvider.qualityScore?.score || stats.avgConfidence || 50;
                            const strokeColor = score >= 70 ? '#06B6D4' : score >= 40 ? '#F59E0B' : '#EF4444';
                            const textColor = score >= 70 ? 'text-cyan-600' : score >= 40 ? 'text-amber-600' : 'text-red-600';
                            return (
                              <>
                                <svg className="w-14 h-14 transform -rotate-90">
                                  <circle cx="28" cy="28" r="24" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                                  <circle cx="28" cy="28" r="24" fill="none" stroke={strokeColor} strokeWidth="3" 
                                    strokeDasharray={`${score * 1.51} 151`} 
                                    strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className={`text-[14px] font-semibold ${textColor}`}>{score}</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        <p className="text-[9px] text-gray-400 mt-1">Quality Score</p>
                      </div>
                    </div>

                    {/* Provider Info Grid */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6 pb-6 border-b border-gray-100">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">NPI Number</p>
                        <p className="text-[13px] font-mono text-gray-900">{selectedProvider.npi || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">License</p>
                        <p className="text-[13px] text-gray-900">{selectedProvider.licensenumber || 'N/A'} {selectedProvider.licensestate && `(${selectedProvider.licensestate})`}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Phone</p>
                        <p className="text-[13px] text-gray-900">{selectedProvider.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
                        <p className="text-[13px] text-gray-900">{selectedProvider.email || 'Not provided'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Address</p>
                        <p className="text-[13px] text-gray-900">
                          {selectedProvider.address || ''}{selectedProvider.city && `, ${selectedProvider.city}`}{selectedProvider.state && `, ${selectedProvider.state}`} {selectedProvider.zipcode || ''}
                        </p>
                      </div>
                    </div>

                    {/* Validation Results */}
                    <div className="mb-6">
                      <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Validation Results</h2>
                      
                      <div className="space-y-3">
                        {/* NPI Registry */}
                        {(() => {
                          const npiValid = selectedProvider.npiValidation?.valid;
                          const registryName = selectedProvider.npiValidation?.name?.toUpperCase() || '';
                          const providerName = (selectedProvider.name || `${selectedProvider.firstname || ''} ${selectedProvider.lastname || ''}`).toUpperCase().trim();
                          const nameMismatch = npiValid && registryName && providerName && 
                            !registryName.includes(providerName.split(' ')[0]) && !registryName.includes(providerName.split(' ').pop() || '');
                          
                          const bgColor = !npiValid ? 'bg-red-50 border border-red-100' : 
                            nameMismatch ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50';
                          const iconColor = !npiValid ? 'bg-red-500' : 
                            nameMismatch ? 'bg-amber-500' : 'bg-cyan-500';
                          
                          return (
                            <div className={`p-4 rounded-lg ${bgColor}`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${iconColor} text-white`}>
                                  {npiValid && !nameMismatch ? (
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  ) : nameMismatch ? (
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-medium text-gray-900">NPI Registry Verification</p>
                                  {npiValid ? (
                                    <>
                                      {nameMismatch ? (
                                        <p className="text-[11px] text-amber-600 font-medium">⚠ NPI exists but NAME MISMATCH detected</p>
                                      ) : (
                                        <p className="text-[11px] text-cyan-600 font-medium">✓ Verified in CMS NPPES database</p>
                                      )}
                                      {selectedProvider.npiValidation?.name && (
                                        <div className="mt-1">
                                          <p className="text-[11px] text-gray-600">Registry Name: <span className={`font-medium ${nameMismatch ? 'text-amber-700' : ''}`}>{selectedProvider.npiValidation.name}</span></p>
                                          {nameMismatch && (
                                            <p className="text-[11px] text-amber-600">Your Data: <span className="font-medium">{selectedProvider.name || `${selectedProvider.firstname} ${selectedProvider.lastname}`}</span></p>
                                          )}
                                        </div>
                                      )}
                                      {selectedProvider.npiValidation?.specialty && (
                                        <p className="text-[11px] text-gray-600">Registry Specialty: <span className="font-medium">{selectedProvider.npiValidation.specialty}</span></p>
                                      )}
                                      {selectedProvider.npiValidation?.status && (
                                        <p className="text-[11px] text-gray-600">Status: <span className="font-medium">{selectedProvider.npiValidation.status === 'A' ? 'Active' : selectedProvider.npiValidation.status}</span></p>
                                      )}
                                      {selectedProvider.npiValidation?.lastUpdated && (
                                        <p className="text-[11px] text-gray-600">Last Updated: <span className="font-medium">{selectedProvider.npiValidation.lastUpdated}</span></p>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <p className="text-[11px] text-red-600 font-medium">✗ NOT FOUND in CMS NPI Registry</p>
                                      <p className="text-[11px] text-red-500 mt-1">{selectedProvider.npiValidation?.reason || 'NPI does not exist in the national registry'}</p>
                                      {selectedProvider.npiFormatValid === false && (
                                        <p className="text-[11px] text-red-500">Format check: Failed Luhn checksum validation</p>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Address Verification */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${selectedProvider.geocoding?.valid ? 'bg-cyan-500 text-white' : 'bg-gray-300 text-white'}`}>
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-gray-900">Address Verification</p>
                              <p className="text-[11px] text-gray-500">{selectedProvider.geocoding?.valid ? 'Geocoded via Google Maps API' : 'Pending verification'}</p>
                              {selectedProvider.geocoding?.formattedAddress && (
                                <p className="text-[11px] text-gray-600 mt-1">Formatted: <span className="font-medium">{selectedProvider.geocoding.formattedAddress}</span></p>
                              )}
                              {selectedProvider.geocoding?.location && (
                                <p className="text-[11px] text-gray-600">Coordinates: <span className="font-mono text-[10px]">{selectedProvider.geocoding.location.lat}, {selectedProvider.geocoding.location.lng}</span></p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* AI Quality Assessment */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-gray-900">AI Quality Assessment</p>
                              <p className="text-[11px] text-gray-500">Analyzed by Gemini 2.0 Flash</p>
                              {selectedProvider.qualityScore?.score && (
                                <p className="text-[11px] text-gray-600 mt-1">Quality Score: <span className="font-medium">{selectedProvider.qualityScore.score}/100</span></p>
                              )}
                              {selectedProvider.qualityScore?.issues && selectedProvider.qualityScore.issues.length > 0 && (
                                <div className="mt-2 space-y-1.5">
                                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Issues Found:</p>
                                  {selectedProvider.qualityScore.issues.map((issue: string, i: number) => (
                                    <p key={i} className="text-[11px] text-gray-600 pl-2 border-l-2 border-gray-200">
                                      {issue}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Verification References - Clickable links to cross-check data */}
                    <div>
                      <h2 className="text-[14px] font-semibold text-gray-900 mb-3">Verification References</h2>
                      <p className="text-[11px] text-gray-500 mb-3">Click to verify extracted data from original sources</p>
                      <div className="space-y-2">
                        {/* NPI Registry Lookup */}
                        {selectedProvider.npi && (
                          <a href={`https://npiregistry.cms.hhs.gov/provider-view/${selectedProvider.npi}`} 
                             target="_blank" rel="noopener noreferrer"
                             className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-cyan-50 rounded-lg border border-gray-100 hover:border-cyan-200 transition-all group">
                            <div className="w-8 h-8 rounded bg-white flex items-center justify-center flex-shrink-0 border border-gray-200 group-hover:border-cyan-200">
                              <svg className="w-4 h-4 text-gray-500 group-hover:text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-medium text-gray-700 group-hover:text-cyan-700">NPI Registry - CMS NPPES</p>
                              <p className="text-[10px] text-gray-400 truncate">Verify NPI #{selectedProvider.npi}</p>
                            </div>
                          </a>
                        )}
                        
                        {/* Google Maps Location */}
                        {selectedProvider.geocoding?.location && (
                          <a href={`https://www.google.com/maps/search/?api=1&query=${selectedProvider.geocoding.location.lat},${selectedProvider.geocoding.location.lng}`} 
                             target="_blank" rel="noopener noreferrer"
                             className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-cyan-50 rounded-lg border border-gray-100 hover:border-cyan-200 transition-all group">
                            <div className="w-8 h-8 rounded bg-white flex items-center justify-center flex-shrink-0 border border-gray-200 group-hover:border-cyan-200">
                              <svg className="w-4 h-4 text-gray-500 group-hover:text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-medium text-gray-700 group-hover:text-cyan-700">Google Maps Location</p>
                              <p className="text-[10px] text-gray-400 truncate">{selectedProvider.geocoding.formattedAddress || 'View on map'}</p>
                            </div>
                          </a>
                        )}
                        
                        {/* State Medical Board */}
                        {selectedProvider.state && (
                          <a href={`https://www.google.com/search?q=${encodeURIComponent((selectedProvider.state || '') + ' state medical board license verification ' + (selectedProvider.name || selectedProvider.firstname + ' ' + selectedProvider.lastname))}`} 
                             target="_blank" rel="noopener noreferrer"
                             className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-cyan-50 rounded-lg border border-gray-100 hover:border-cyan-200 transition-all group">
                            <div className="w-8 h-8 rounded bg-white flex items-center justify-center flex-shrink-0 border border-gray-200 group-hover:border-cyan-200">
                              <svg className="w-4 h-4 text-gray-500 group-hover:text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-medium text-gray-700 group-hover:text-cyan-700">{selectedProvider.state} State Medical Board</p>
                              <p className="text-[10px] text-gray-400 truncate">License verification lookup</p>
                            </div>
                          </a>
                        )}
                        
                        {/* Specialty Board */}
                        {selectedProvider.specialty && (
                          <a href={`https://www.google.com/search?q=${encodeURIComponent('ABMS board certification verification ' + (selectedProvider.specialty || '') + ' ' + (selectedProvider.name || selectedProvider.firstname + ' ' + selectedProvider.lastname))}`} 
                             target="_blank" rel="noopener noreferrer"
                             className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-cyan-50 rounded-lg border border-gray-100 hover:border-cyan-200 transition-all group">
                            <div className="w-8 h-8 rounded bg-white flex items-center justify-center flex-shrink-0 border border-gray-200 group-hover:border-cyan-200">
                              <svg className="w-4 h-4 text-gray-500 group-hover:text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-medium text-gray-700 group-hover:text-cyan-700">Board Certification (ABMS)</p>
                              <p className="text-[10px] text-gray-400 truncate">{selectedProvider.specialty} certification</p>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Provider List & Summary - Right Side */}
              <div className="w-[280px] border-l border-gray-100 flex flex-col bg-white flex-shrink-0">
                {/* Provider List Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-medium text-gray-700">Providers</p>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{providers.length}</span>
                  </div>
                </div>
                
                {/* Provider List */}
                <div className="flex-1 overflow-y-auto">
                  {providers.length === 0 ? (
                    <div className="flex items-center justify-center h-full px-4">
                      <p className="text-[12px] text-gray-400">No providers</p>
                    </div>
                  ) : (
                    <div className="p-3 space-y-1">
                      {providers.map((provider: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedProviderIdx(idx)}
                          className={`w-full p-3 rounded-lg text-left transition-all ${
                            selectedProviderIdx === idx ? 'bg-cyan-50 border border-cyan-200' : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-[11px] font-medium text-gray-500">
                                {(provider.firstname?.[0] || provider.name?.[0] || 'P').toUpperCase()}
                                {(provider.lastname?.[0] || provider.name?.split(' ')[1]?.[0] || '').toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-medium text-gray-900 truncate">{provider.name || `${provider.firstname} ${provider.lastname}`}</p>
                              <p className="text-[10px] text-gray-400 truncate">{provider.specialty || 'Provider'}</p>
                            </div>
                            {/* Score indicator - shows validation status */}
                            <div className="flex-shrink-0 flex items-center gap-1.5">
                              {/* NPI Status indicator */}
                              {provider.npiValidation?.valid === false && (
                                <span className="text-[8px] font-medium px-1 py-0.5 rounded bg-red-100 text-red-600">NPI ✗</span>
                              )}
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                (provider.qualityScore?.score || 50) >= 70 ? 'text-cyan-700 bg-cyan-50' :
                                (provider.qualityScore?.score || 50) >= 40 ? 'text-amber-700 bg-amber-50' :
                                'text-red-600 bg-red-50'
                              }`}>
                                {provider.qualityScore?.score || 50}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary Stats - Expanded */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">Validation Summary</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-600">Total Providers</span>
                      <span className="text-[12px] font-semibold text-gray-900">{stats.totalProviders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-600">NPI Verified</span>
                      <span className="text-[12px] font-semibold text-cyan-600">{stats.npiVerified}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-600">Address Validated</span>
                      <span className="text-[12px] font-semibold text-cyan-600">{stats.licenseActive}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-600">Issues Found</span>
                      <span className="text-[12px] font-semibold text-gray-500">{stats.issuesFlagged}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
                      <span className="text-[11px] text-gray-600">Avg. Confidence</span>
                      <span className="text-[12px] font-semibold text-gray-900">{stats.avgConfidence}%</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-4 space-y-2">
                    <button className="w-full py-2.5 text-[11px] font-medium text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 transition-colors">
                      Export Results
                    </button>
                    <button className="w-full py-2 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      Share Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
