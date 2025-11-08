import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowUp, HiPlus, HiDocumentText, HiLightningBolt, HiCog, HiChartBar} from 'react-icons/hi';

export function Home() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (!input.trim()) return;
    navigate('/workflow', { state: { query: input } });
  };

  const quickActions = [
    { icon: HiDocumentText, label: 'Batch Validation' },
    { icon: HiLightningBolt, label: 'Quick Verify' },
    { icon: HiChartBar, label: 'Quality Report' },
    { icon: HiCog, label: 'Configure Agents' },
  ];

  const examples = [
    {
      title: 'Validate provider directory',
      desc: 'Run comprehensive validation on 500+ provider profiles using NPI registry and state medical boards',
      tag: 'Batch Validation'
    },
    {
      title: 'Cross-reference verification',
      desc: 'Compare provider data across multiple sources including Google Business and practice websites',
      tag: 'Quick Verify'
    },
    {
      title: 'License compliance check',
      desc: 'Verify medical licenses, expiration dates, and disciplinary actions from state boards',
      tag: 'Quality Report'
    },
    {
      title: 'Contact info enrichment',
      desc: 'Scrape and validate phone numbers, emails, and addresses from public sources',
      tag: 'Configure Agents'
    },
    {
      title: 'Network affiliation mapping',
      desc: 'Identify and verify insurance network participation and hospital affiliations',
      tag: 'Batch Validation'
    },
    {
      title: 'Generate confidence scores',
      desc: 'Calculate data quality metrics and reliability scores for each provider profile',
      tag: 'Quality Report'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-cyan-50/10 to-blue-50/10">
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
              <button className="text-gray-400 hover:text-gray-600 active:text-gray-700 transition-colors">
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

          <div className="text-center mb-3 sm:mb-4">
            <p className="text-[12px] sm:text-[13px] text-gray-400">Explore use cases</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {examples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => setInput(example.title)}
                className="group p-3.5 sm:p-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg text-left hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-500/5 hover:bg-gradient-to-br hover:from-white hover:to-cyan-50/20 active:scale-[0.98] transition-all min-h-[135px] sm:h-[145px] flex flex-col"
              >
                <p className="text-[13px] sm:text-[14px] text-gray-900 font-medium mb-1.5 line-clamp-2">
                  {example.title}
                </p>
                <p className="text-[11px] sm:text-[12px] text-gray-500 mb-auto line-clamp-3 leading-relaxed">
                  {example.desc}
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-gray-100">
                  <HiDocumentText className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-gray-400" />
                  <span className="text-[10px] sm:text-[11px] text-gray-500">{example.tag}</span>
                  <span className="ml-auto text-gray-300 group-hover:text-cyan-400 transition-colors text-sm">↗</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
