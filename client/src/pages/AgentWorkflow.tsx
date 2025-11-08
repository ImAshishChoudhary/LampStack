import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IdeationCanvas } from '../components/IdeationCanvas';

export function AgentWorkflow() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'final' | 'flow'>('flow'); // Default to Ideation Flow

  return (
    <div className="h-screen flex bg-white">
      {/* Left Sidebar - FIXED, same for both tabs */}
      <div className="w-[340px] border-r border-gray-200 flex flex-col bg-white fixed left-0 top-0 bottom-0 z-10">
        <div className="px-5 py-4 flex items-center gap-4 border-b border-gray-100">
          <button 
            onClick={() => navigate('/')}
            className="p-1 hover:bg-gray-50 rounded transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-[13px] text-gray-500 font-normal">Provider Data Validation</div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* User Prompt */}
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 mt-0.5">
              U
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
              <p className="text-[12px] text-gray-800 leading-relaxed">
                Validate provider directory - Run comprehensive validation on 500+ provider profiles using NPI registry and state medical boards
              </p>
            </div>
          </div>

          {/* AI Response */}
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 mt-0.5">
              AI
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-lg px-3 py-2.5 border border-gray-200">
                <p className="text-[12px] text-gray-700 leading-relaxed mb-2">
                  I'll help you validate the provider directory. Running comprehensive validation:
                </p>
                <ul className="text-[11px] text-gray-600 space-y-1 ml-1">
                  <li className="flex items-start gap-1.5">
                    <span className="text-cyan-500 mt-0.5">✓</span>
                    <span>NPI Registry cross-reference</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-cyan-500 mt-0.5">✓</span>
                    <span>State medical board verification</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-cyan-500 mt-0.5">✓</span>
                    <span>Contact enrichment</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-cyan-500 mt-0.5">✓</span>
                    <span>Quality scoring complete</span>
                  </li>
                </ul>
              </div>
              <p className="text-[12px] text-cyan-600 mt-2.5 font-medium px-1">
                196/200 providers validated successfully
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          <div className="bg-gradient-to-br from-gray-50 to-cyan-50/30 rounded-lg px-4 py-3 border border-gray-200/80">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse"></div>
              <span className="text-[11px] text-gray-500 font-medium">Awaiting your response</span>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="@ an agent to start research task..."
              className="w-full bg-transparent text-[11px] outline-none text-gray-700 placeholder-gray-400 mb-2.5"
            />
            <div className="flex items-center justify-between">
              <button className="p-1 hover:bg-white/80 rounded transition-colors">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button className="p-1 hover:bg-cyan-100/50 rounded transition-colors">
                <svg className="w-3.5 h-3.5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col bg-white ml-[340px]">
        {/* Tabs Header - FIXED positioned, starts after sidebar */}
        <div className="fixed top-0 left-[340px] right-0 bg-white border-b border-gray-200 z-20">
          <div className="flex items-center justify-between px-8 h-14">
            <div className="flex items-center gap-8 h-full">
              <button
                onClick={() => setActiveTab('final')}
                className={`flex items-center gap-2 text-[13px] h-full border-b-2 transition-colors ${
                  activeTab === 'final'
                    ? 'border-cyan-500 text-gray-900 font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="px-1.5 py-0.5 bg-cyan-100/70 text-cyan-700 text-[10px] rounded font-medium">Final</span>
                Final Validation Results
              </button>
              <button
                onClick={() => setActiveTab('flow')}
                className={`flex items-center gap-1.5 text-[13px] h-full border-b-2 transition-colors ${
                  activeTab === 'flow'
                    ? 'border-cyan-500 text-gray-900 font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Ideation Flow
              </button>
            </div>
            <button className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Content Area - Add top padding to account for fixed header */}
        <div className="flex-1 overflow-y-scroll pt-14">
          {activeTab === 'final' ? (
            <div className="max-w-4xl mx-auto px-12 py-10">
              <div className="bg-gradient-to-br from-cyan-50/40 via-white to-blue-50/20 rounded-2xl p-6 mb-8 border border-cyan-100/50 shadow-sm">
                <p className="text-[14px] text-gray-700 leading-relaxed font-normal" style={{ fontFamily: "'Inter', sans-serif" }}>
                  I have validated <span className="font-semibold text-cyan-700">200 provider profiles</span> from the uploaded dataset, identifying the most critical data quality issues and prioritizing high-confidence updates. The validation process leveraged multiple authoritative sources including <span className="font-medium">NPI Registry</span>, <span className="font-medium">State Medical Boards</span>, and <span className="font-medium">public directories</span>. Selected updates represent the most impactful improvements covering license verification, contact information enrichment, specialty validation, and credentialing status checks.
                </p>
              </div>

              <div className="space-y-8">
                <div className="group">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-[17px] font-semibold text-gray-900 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      NPI Registry Cross-Reference Validation
                    </h3>
                    <span className="px-2.5 py-1 bg-gradient-to-br from-cyan-50 to-cyan-100/70 text-cyan-700 text-[11px] rounded-md border border-cyan-200/70 font-medium shadow-sm">
                      + LampStack Selection
                    </span>
                  </div>
                  <p className="text-[14px] text-gray-700 leading-relaxed mb-4 font-normal">
                    Cross-reference all 200 provider records against the National Provider Identifier (NPI) Registry database to verify demographics, taxonomy codes, and practice locations. This validation ensures each provider's NPI number is active, matches their credentials, and corresponds to correct specialty classifications. The system automatically flags mismatches in provider names, addresses, or specialties that require manual review.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-lg px-3.5 py-2.5 border border-gray-100">
                      <p className="text-[10px] text-gray-500 font-medium mb-0.5 uppercase tracking-wide">Status</p>
                      <p className="text-[13px] text-cyan-600 font-semibold">196/200 providers verified</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-lg px-3.5 py-2.5 border border-gray-100">
                      <p className="text-[10px] text-gray-500 font-medium mb-0.5 uppercase tracking-wide">Confidence Score</p>
                      <p className="text-[13px] text-cyan-600 font-semibold">94%</p>
                    </div>
                  </div>
                  <div className="text-[12px] text-gray-500 space-y-0.5 mb-3">
                    <p><span className="font-medium">Source:</span> NPPES National Provider Registry</p>
                    <p><span className="font-medium">Last Updated:</span> 2025-01-15</p>
                  </div>
                  <div className="bg-gray-50/50 rounded-lg px-3.5 py-3 border border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5">References</p>
                    <div className="space-y-1">
                      <a href="#" className="text-[12px] text-cyan-600 hover:text-cyan-700 hover:underline block transition-colors">https://npiregistry.cms.hhs.gov/api-page</a>
                      <a href="#" className="text-[12px] text-cyan-600 hover:text-cyan-700 hover:underline block transition-colors">https://www.cms.gov/Regulations-and-Guidance/Administrative-Simplification/NationalProvIdentStand</a>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                <div className="group">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-[17px] font-semibold text-gray-900 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      State Medical Board License Verification
                    </h3>
                    <span className="px-2.5 py-1 bg-gradient-to-br from-cyan-50 to-cyan-100/70 text-cyan-700 text-[11px] rounded-md border border-cyan-200/70 font-medium shadow-sm">
                      + LampStack Selection
                    </span>
                  </div>
                  <p className="text-[14px] text-gray-700 leading-relaxed mb-4 font-normal">
                    Validate active medical licenses by scraping state medical board websites for each provider's primary and secondary practice locations. The system checks license status, expiration dates, disciplinary actions, and board certifications. This multi-state validation ensures compliance with credentialing requirements and identifies providers with expired, suspended, or restricted licenses requiring immediate attention.
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-lg px-3.5 py-2.5 border border-gray-100">
                      <p className="text-[10px] text-gray-500 font-medium mb-0.5 uppercase tracking-wide">Status</p>
                      <p className="text-[13px] text-cyan-600 font-semibold">189/200 active</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-lg px-3.5 py-2.5 border border-gray-100">
                      <p className="text-[10px] text-gray-500 font-medium mb-0.5 uppercase tracking-wide">Confidence</p>
                      <p className="text-[13px] text-cyan-600 font-semibold">91%</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-50/50 rounded-lg px-3.5 py-2.5 border border-amber-100">
                      <p className="text-[10px] text-amber-600 font-medium mb-0.5 uppercase tracking-wide">Issues</p>
                      <p className="text-[13px] text-amber-700 font-semibold">11 flagged</p>
                    </div>
                  </div>
                  <div className="text-[12px] text-gray-500">
                    <p><span className="font-medium">Sources:</span> 15 State Medical Boards</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                <div className="group">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-[17px] font-semibold text-gray-900 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Contact Information Enrichment
                    </h3>
                    <span className="px-2.5 py-1 bg-gradient-to-br from-cyan-50 to-cyan-100/70 text-cyan-700 text-[11px] rounded-md border border-cyan-200/70 font-medium shadow-sm">
                      + LampStack Selection
                    </span>
                  </div>
                  <p className="text-[14px] text-gray-700 leading-relaxed mb-4 font-normal">
                    Enrich provider contact details by aggregating data from Google Business profiles, practice websites, Healthgrades, and other public directories. The system validates phone numbers, email addresses, office hours, and practice websites to ensure accurate patient communication channels.
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-lg px-3.5 py-2.5 border border-gray-100">
                      <p className="text-[10px] text-gray-500 font-medium mb-0.5 uppercase tracking-wide">Phones</p>
                      <p className="text-[13px] text-cyan-600 font-semibold">178/200</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-lg px-3.5 py-2.5 border border-gray-100">
                      <p className="text-[10px] text-gray-500 font-medium mb-0.5 uppercase tracking-wide">Emails</p>
                      <p className="text-[13px] text-cyan-600 font-semibold">165/200</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-lg px-3.5 py-2.5 border border-gray-100">
                      <p className="text-[10px] text-gray-500 font-medium mb-0.5 uppercase tracking-wide">Websites</p>
                      <p className="text-[13px] text-cyan-600 font-semibold">124/200</p>
                    </div>
                  </div>
                  <div className="bg-gray-50/50 rounded-lg px-3.5 py-3 border border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5">References</p>
                    <div className="space-y-1">
                      <a href="#" className="text-[12px] text-cyan-600 hover:text-cyan-700 hover:underline block transition-colors">https://www.google.com/business/</a>
                      <a href="#" className="text-[12px] text-cyan-600 hover:text-cyan-700 hover:underline block transition-colors">https://www.healthgrades.com/</a>
                      <a href="#" className="text-[12px] text-cyan-600 hover:text-cyan-700 hover:underline block transition-colors">https://www.vitals.com/</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <IdeationCanvas />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
