import { HiDocumentText, HiLightBulb, HiBeaker, HiBookOpen } from 'react-icons/hi';
import { useState } from "react";

const agents = [
  { icon: HiDocumentText, label: "Data Survey" },
  { icon: HiLightBulb, label: "Validation Spark" },
  { icon: HiBeaker, label: "Auto Validate" },
  { icon: HiBookOpen, label: "Analysis Notebook" }
];

const useCases = [
  {
    title: "Validate provider directory",
    agent: "Validation Spark",
    desc: "Run comprehensive validation on 500+ provider profiles using NPI registry and state medical boards"
  },
  {
    title: "Cross-reference verification",
    agent: "Auto Validate",
    desc: "Compare provider data across multiple sources including Google Business and practice websites"
  },
  {
    title: "License compliance check",
    agent: "Data Survey",
    desc: "Verify medical licenses, expiration dates, and disciplinary actions from state boards"
  },
  {
    title: "Contact info enrichment",
    agent: "Validation Spark",
    desc: "Scrape and validate phone numbers, emails, and addresses from public sources"
  },
  {
    title: "Network affiliation mapping",
    agent: "Data Survey",
    desc: "Identify and verify insurance network participation and hospital affiliations"
  },
  {
    title: "Generate confidence scores",
    agent: "Analysis Notebook",
    desc: "Calculate data quality metrics and reliability scores for each provider profile"
  }
];

interface StartViewProps {
  onStartWorkflow?: (prompt: string) => void;
}

export function StartView({ onStartWorkflow }: StartViewProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (prompt.trim() && onStartWorkflow) {
      onStartWorkflow(prompt);
    }
  };

  const handleUseCaseClick = (title: string) => {
    if (onStartWorkflow) {
      onStartWorkflow(title);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div className="max-w-4xl w-full px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-serif">Meet your validation assistant</h1>
          <p className="text-gray-500">An AI assistant ready to validate provider data</p>
        </div>

        {/* Chat Area */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm text-cyan-600">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-600" />
            <span>LampStack is ready</span>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="@ an agent to start validation task..."
            className="w-full min-h-[120px] bg-transparent border-0 outline-none resize-none text-sm placeholder:text-gray-400"
          />

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900">+ Add file</button>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 hover:bg-cyan-50 text-gray-600 hover:text-cyan-600 disabled:opacity-50 transition-colors"
            >
              ↑
            </button>
          </div>
        </div>

        {/* Agent Buttons */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {agents.map((agent) => (
            <button key={agent.label} className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-sm hover:border-cyan-300 hover:bg-cyan-50 transition-colors">
              <agent.icon className="h-4 w-4" />
              {agent.label}
            </button>
          ))}
        </div>

        {/* Use Cases */}
        <div className="space-y-4">
          <p className="text-center text-sm text-gray-500">Explore use cases</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {useCases.map((useCase, i) => (
              <button
                key={i}
                onClick={() => handleUseCaseClick(useCase.title)}
                className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-cyan-300 hover:shadow-md transition-all group"
              >
                <p className="text-sm mb-3 line-clamp-2 font-medium">{useCase.title}</p>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{useCase.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <HiLightbulb className="h-3 w-3" />
                    <span>{useCase.agent}</span>
                  </div>
                  <span className="text-gray-300 group-hover:text-cyan-500 transition-colors">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
