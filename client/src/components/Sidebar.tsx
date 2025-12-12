import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HiMenu, HiPlus, HiSparkles } from 'react-icons/hi';

interface SidebarProps {
  onExpandChange?: (expanded: boolean) => void;
}

export function Sidebar({ onExpandChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onExpandChange?.(newState);
  };

  return (
    <>
      {/* Overlay for mobile when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={handleToggle}
        />
      )}

      {/* Collapsed Sidebar */}
      {!isExpanded && (
        <aside className="w-12 sm:w-16 h-screen bg-white border-r border-gray-200 flex flex-col items-center py-4 sm:py-5 fixed left-0 top-0 z-40">
          <button
            onClick={handleToggle}
            className="mb-4 sm:mb-6 p-1.5 sm:p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors"
          >
            <HiMenu className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />
          </button>

          <nav className="flex-1 flex flex-col items-center gap-1.5">
            <button className="p-1.5 sm:p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors">
              <HiPlus className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          </nav>

          <div className="mt-auto">
            <div className="w-7 sm:w-8 h-7 sm:h-8 bg-amber-600 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-medium">
              A
            </div>
            <button className="mt-2 sm:mt-3 p-1 sm:p-1.5 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors">
              <HiSparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-400" />
            </button>
          </div>
        </aside>
      )}

      {/* Expanded Sidebar */}
      {isExpanded && (
        <aside className="w-64 sm:w-56 h-screen bg-white border-r border-gray-200 flex flex-col py-4 sm:py-5 px-3 fixed left-0 top-0 z-40 shadow-lg lg:shadow-none">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <button
              onClick={handleToggle}
              className="p-1.5 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors"
            >
              <HiMenu className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <button className="flex items-center gap-2 px-2.5 py-1.5 text-[13px] text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-cyan-50/60 active:bg-cyan-50/80 rounded-md transition-all mb-5">
            <HiPlus className="w-4 h-4" />
            <span>New Project</span>
          </button>

          <div className="flex-1 overflow-y-auto">
            <p className="text-[11px] text-gray-500 mb-1.5 px-2.5">Projects</p>
            <div className="space-y-0.5">
              <NavLink
                to="/"
                className="block px-2.5 py-1.5 text-[13px] text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-cyan-50/60 active:bg-cyan-50/80 rounded-md transition-all"
              >
                Provider validation system
              </NavLink>
              <NavLink
                to="/multi-validation"
                className="block px-2.5 py-1.5 text-[13px] text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-cyan-50/60 active:bg-cyan-50/80 rounded-md transition-all"
              >
                Multi-Source Validation ⭐
              </NavLink>
              <NavLink
                to="/validation"
                className="block px-2.5 py-1.5 text-[13px] text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-cyan-50/60 active:bg-cyan-50/80 rounded-md transition-all"
              >
                NPI Registry Only
              </NavLink>
              <NavLink
                to="/flow"
                className="block px-2.5 py-1.5 text-[13px] text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-cyan-50/60 active:bg-cyan-50/80 rounded-md transition-all"
              >
                Validation Flow
              </NavLink>
            </div>
          </div>

          <div className="mt-auto border-t border-gray-200 pt-3">
            <div className="flex items-center gap-2 px-2.5">
              <div className="w-7 h-7 bg-amber-600 rounded-full flex items-center justify-center text-white text-[11px]">
                A
              </div>
              <span className="text-[12px] text-gray-700 truncate">im.ashish.1001@gm...</span>
            </div>
            <button className="flex items-center gap-2 px-2.5 py-1.5 mt-2 text-[13px] text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-cyan-50/60 active:bg-cyan-50/80 rounded-md transition-all w-full">
              <HiSparkles className="w-3.5 h-3.5" />
              <span>Upgrade</span>
              <span className="ml-auto text-[11px] text-gray-400">0</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
