import React from 'react';
import { Laptop, FileText } from 'lucide-react';

export type NavTab =
  | 'classify'
  | 'pictureReport'
  | 'dashboard'
  | 'guide'
  | 'history';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onQuickScan: () => void;
  onOpenDesktopModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onQuickScan,
  onOpenDesktopModal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('classify')}
          className="text-left text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
        >
          SmartWaste AI
        </button>

        {/* Zone 2: 5 Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => onSelectTab('classify')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'classify'
                ? 'text-emerald-400 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Scanner
          </button>
          <button
            onClick={() => onSelectTab('pictureReport')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'pictureReport'
                ? 'text-emerald-400 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Picture Report
          </button>
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard'
                ? 'text-emerald-400 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Analytics & KPIs
          </button>
          <button
            onClick={() => onSelectTab('guide')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'guide'
                ? 'text-emerald-400 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Sorting Guide
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'history'
                ? 'text-emerald-400 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Scan History
          </button>
        </nav>

        {/* Zone 3: Desktop .EXE + Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenDesktopModal}
            title="Download Windows .EXE or Install Desktop App"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Laptop className="w-3.5 h-3.5 text-cyan-400" />
            <span>Desktop .EXE</span>
          </button>

          <button
            onClick={onQuickScan}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 active:scale-95 transition-all whitespace-nowrap shrink-0"
          >
            Classify Waste
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-800/80 px-4 py-2 text-xs gap-2 scrollbar-none">
        <button
          onClick={() => onSelectTab('classify')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'classify' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          Scanner
        </button>
        <button
          onClick={() => onSelectTab('pictureReport')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'pictureReport' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          Picture Report
        </button>
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => onSelectTab('guide')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'guide' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          Guide
        </button>
        <button
          onClick={() => onSelectTab('history')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'history' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
          }`}
        >
          History
        </button>
        <button
          onClick={onOpenDesktopModal}
          className="px-2.5 py-1 rounded whitespace-nowrap bg-cyan-950/60 text-cyan-400 border border-cyan-800/50"
        >
          Desktop .EXE
        </button>
      </div>
    </header>
  );
};
