import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowUp, HiPlus, HiDocumentText, HiLightningBolt, HiCog, HiChartBar } from 'react-icons/hi';
import { useProviderStats } from '../hooks/useProviders';
import { apiClient } from '../services/api';

interface UploadedFile {
  file: File;
  id: string;
  content?: string;
}

export function Home() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { stats, loading, refetch } = useProviderStats();

  const handleSubmit = () => {
    if (!input.trim()) return;
    navigate('/workflow', { 
      state: { 
        query: input,
        fileName: uploadedFiles[0]?.file.name,
        fileContent: uploadedFiles[0]?.content,
      } 
    });
  };

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = files.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      content: undefined as string | undefined,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(true);

    try {
      const fileContent = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || '');
        reader.onerror = () => resolve('');
        reader.readAsText(files[0]);
      });

      setUploadedFiles(prev => prev.map((f, i) => 
        i === prev.length - 1 ? { ...f, content: fileContent } : f
      ));

      for (const {file} of newFiles) {
        await apiClient.uploadProviderFile(file);
      }
      
      refetch();
      
      const fileName = files[0]?.name?.replace(/\.[^/.]+$/, '') || 'provider_data';
      const fileType = files[0]?.name?.split('.').pop()?.toUpperCase() || 'CSV';
      
      const dynamicSuggestions = [
        `Validate all provider NPI numbers in ${fileName}`,
        `Check license status and expiration dates for providers`,
        `Enrich contact information and verify addresses`,
      ];
      
      setSuggestions(dynamicSuggestions);
      setIsUploading(false);
    } catch (error: any) {
      console.error('Error:', error);
      setSuggestions([
        `Analyze provider specialties and locations across 10 states`,
        `Generate spreadsheet comparing license expiry dates and contact information`,
        `Create validation report showing data quality issues in uploaded files`,
      ]);
      setIsUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    if (uploadedFiles.length === 1) {
      setSuggestions([]);
    }
  };

  const quickActions = [
    { icon: HiDocumentText, label: 'Batch Validation', count: stats?.needsReview || 0 },
    { icon: HiLightningBolt, label: 'Quick Verify', count: stats?.validated || 0 },
    { icon: HiChartBar, label: 'Quality Report', count: stats?.highConfidence || 0 },
    { icon: HiCog, label: 'Configure Agents', count: stats?.byState?.length || 0 },
  ];

  const examples = [
    {
      title: 'Validate provider directory',
      desc: `Run comprehensive validation on ${stats?.total || 200}+ provider profiles using NPI registry and state medical boards`,
      tag: 'Batch Validation',
      stats: `${stats?.needsReview || 200} providers need review`
    },
    {
      title: 'Cross-reference verification',
      desc: 'Compare provider data across multiple sources including Google Business and practice websites',
      tag: 'Quick Verify',
      stats: `${stats?.validated || 0} providers validated`
    },
    {
      title: 'License compliance check',
      desc: 'Verify medical licenses, expiration dates, and disciplinary actions from state boards',
      tag: 'Quality Report',
      stats: `${stats?.validationProgress || 0}% completion rate`
    },
    {
      title: 'Contact info enrichment',
      desc: 'Scrape and validate phone numbers, emails, and addresses from public sources',
      tag: 'Configure Agents',
      stats: `${stats?.highConfidence || 0} high confidence records`
    },
    {
      title: 'Network affiliation mapping',
      desc: 'Identify and verify insurance network participation and hospital affiliations',
      tag: 'Batch Validation',
      stats: `${stats?.byState?.length || 0} states covered`
    },
    {
      title: 'Generate confidence scores',
      desc: 'Calculate data quality metrics and reliability scores for each provider profile',
      tag: 'Quality Report',
      stats: `${stats?.averageConfidence ? (stats.averageConfidence * 100).toFixed(1) : 0}% avg confidence`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-cyan-50/10 to-blue-50/10">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelect}
        multiple
        className="hidden"
      />

      {/* Logo */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-2">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-7 sm:h-7">
            <rect width="28" height="28" rx="6" fill="url(#logo-gradient)"/>
            <path d="M14 6L18 10L14 14L10 10L14 6Z" fill="white" fillOpacity="0.9"/>
            <path d="M10 14L14 18L10 22L6 18L10 14Z" fill="white" fillOpacity="0.7"/>
            <path d="M18 14L22 18L18 22L14 18L18 14Z" fill="white" fillOpacity="0.7"/>
            <defs>
              <linearGradient id="logo-gradient" x1="0" y1="0" x2="28" y2="28">
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

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
        <div className="w-full max-w-[720px] mx-auto">
          <h1 className="text-[24px] sm:text-[32px] font-normal text-center text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
            Autonomous provider data validation
          </h1>

          <div className="bg-gradient-to-br from-white/80 to-cyan-50/20 backdrop-blur-sm rounded-lg border border-gray-200/80 mb-3 shadow-sm">
            {/* Uploaded Files - Horizontal Display */}
            {uploadedFiles.length > 0 && (
              <div className="px-3 pt-3 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {uploadedFiles.map(({file, id}) => (
                    <div key={id} className="group relative flex items-center gap-2 px-2.5 py-2 bg-white/50 rounded hover:bg-white/80 transition-all border border-gray-200">
                      <img src="/csv.png" alt="" className="w-4 h-4 flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <p className="text-[12px] font-medium text-gray-900 truncate max-w-[120px]">{file.name}</p>
                        <p className="text-[10px] text-gray-500">Spreadsheet • {(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      {isUploading ? (
                        <div className="flex items-center gap-0.5 ml-1">
                          <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
                          <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                      ) : (
                        <button
                          onClick={() => removeFile(id)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          title="Remove file"
                        >
                          <svg className="w-2.5 h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="px-3 sm:px-3.5 pt-2 sm:pt-2.5 pb-1.5">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50"></div>
                <span className="text-[12px] sm:text-[13px] text-gray-600">LampStack is ready</span>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="@ an agent to start validation task..."
                className="w-full bg-transparent border-none focus:outline-none resize-none text-[13px] sm:text-[14px] text-gray-900 placeholder-gray-400 min-h-[45px] sm:min-h-[50px]"
              />
            </div>

            <div className="flex items-center justify-between px-3 sm:px-3.5 py-2 border-t border-gray-200/80 bg-white/40">
              <button 
                onClick={handlePlusClick}
                className="text-gray-400 hover:text-gray-600 active:text-gray-700 transition-colors"
              >
                <HiPlus className="w-4 h-4" />
              </button>
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="p-1.5 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-cyan-50 hover:to-cyan-100 hover:text-cyan-700 hover:shadow-sm hover:shadow-cyan-500/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                <HiArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6 sm:mb-8">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-md text-[12px] sm:text-[13px] text-gray-700 hover:bg-gradient-to-br hover:from-white hover:to-cyan-50/40 hover:border-cyan-300 hover:shadow-sm hover:shadow-cyan-500/10 active:scale-95 transition-all whitespace-nowrap"
              >
                <action.icon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-gray-500" />
                <span className="hidden sm:inline">{action.label}</span>
                <span className="sm:hidden">{action.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Smart Suggestions after upload */}
          {suggestions.length > 0 && (
            <div className="mb-6">
              <p className="text-[13px] text-gray-600 mb-2.5">Here's what you could do with {uploadedFiles[0]?.file.name.split('.')[0]}:</p>
              <div className="space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const cleanSuggestion = suggestion.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '');
                      setInput(cleanSuggestion);
                    }}
                    className="w-full text-left px-3 py-2.5 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-white/80 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <p className="text-[13px] text-gray-700 flex-1 leading-relaxed">{suggestion.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '')}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-center mb-3 sm:mb-4">
            <p className="text-[12px] sm:text-[13px] text-gray-400">Explore use cases</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {loading ? (
              [...Array(6)].map((_, idx) => (
                <div key={idx} className="p-3.5 sm:p-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg animate-pulse min-h-[135px] sm:h-[145px]">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))
            ) : (
              examples.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(example.title)}
                  className="group p-3.5 sm:p-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg text-left hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-500/5 hover:bg-gradient-to-br hover:from-white hover:to-cyan-50/20 active:scale-[0.98] transition-all min-h-[135px] sm:h-[145px] flex flex-col"
                >
                  <p className="text-[13px] sm:text-[14px] text-gray-900 font-medium mb-1.5 line-clamp-2">
                    {example.title}
                  </p>
                  <p className="text-[11px] sm:text-[12px] text-gray-500 mb-auto line-clamp-2 leading-relaxed">
                    {example.desc}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <HiDocumentText className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-gray-400" />
                      <span className="text-[10px] sm:text-[11px] text-gray-500">{example.tag}</span>
                    </div>
                    <span className="text-[10px] text-cyan-600 font-medium">{example.stats}</span>
                    <span className="text-gray-300 group-hover:text-cyan-400 transition-colors text-sm">↗</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
