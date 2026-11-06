/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { ClassifierView } from './components/ClassifierView';
import { PictureReportView } from './components/PictureReportView';
import { DashboardView } from './components/DashboardView';
import { WasteGuideView } from './components/WasteGuideView';
import { HistoryView } from './components/HistoryView';
import { DesktopAppModal } from './components/DesktopAppModal';
import { ReportScreenshotsModal } from './components/ReportScreenshotsModal';
import {
  ClassificationRecord,
  WasteCategory,
  PredictionResult,
} from './types/waste';
import {
  fetchClassificationHistory,
} from './services/classifier';
import { INITIAL_CLASSIFICATIONS } from './data/blueprintData';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('classify');
  const [selectedGuideCat, setSelectedGuideCat] = useState<WasteCategory | undefined>(undefined);
  const [records, setRecords] = useState<ClassificationRecord[]>(INITIAL_CLASSIFICATIONS);
  const [currentPrediction, setCurrentPrediction] = useState<PredictionResult | null>(null);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [isScreenshotsModalOpen, setIsScreenshotsModalOpen] = useState(false);

  // Load persistent history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const serverRecords = await fetchClassificationHistory();
      if (serverRecords && serverRecords.length > 0) {
        setRecords(serverRecords);
      }
    } catch {
      // Keep initial records if fetch fails
    }
  };

  const handleRecordSaved = (newRec: ClassificationRecord) => {
    setRecords((prev) => [newRec, ...prev.filter((r) => r.id !== newRec.id)]);
  };

  const handleNavigateGuide = (category?: WasteCategory) => {
    setSelectedGuideCat(category);
    setActiveTab('guide');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategoryForClassify = (_cat: WasteCategory) => {
    setActiveTab('classify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGeneratePictureReport = (pred: PredictionResult) => {
    setCurrentPrediction(pred);
    setActiveTab('pictureReport');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Bar Navigation (Clean, Professional, Modern) */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onQuickScan={() => {
          setActiveTab('classify');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenDesktopModal={() => setIsDesktopModalOpen(true)}
        onOpenScreenshotsModal={() => setIsScreenshotsModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {activeTab === 'classify' && (
          <ClassifierView
            onRecordSaved={handleRecordSaved}
            onNavigateHistory={() => setActiveTab('history')}
            onGeneratePictureReport={handleGeneratePictureReport}
          />
        )}

        {activeTab === 'pictureReport' && (
          <PictureReportView
            currentPrediction={currentPrediction}
            historyRecords={records}
            onSelectNewPrediction={(pred) => setCurrentPrediction(pred)}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            records={records}
            onNavigateClassify={() => setActiveTab('classify')}
            onNavigateGuide={handleNavigateGuide}
            onNavigateHistory={() => setActiveTab('history')}
            onNavigatePictureReport={() => setActiveTab('pictureReport')}
            onOpenScreenshots={() => setIsScreenshotsModalOpen(true)}
          />
        )}

        {activeTab === 'guide' && (
          <WasteGuideView
            initialCategory={selectedGuideCat}
            onSelectCategoryForClassify={handleSelectCategoryForClassify}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            records={records}
            onReloadHistory={loadHistory}
            onNavigateClassify={() => setActiveTab('classify')}
          />
        )}
      </main>

      {/* Desktop App & .EXE Packaging Modal */}
      <DesktopAppModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
      />

      {/* Project Report Figures & Screenshots Gallery Modal */}
      <ReportScreenshotsModal
        isOpen={isScreenshotsModalOpen}
        onClose={() => setIsScreenshotsModalOpen(false)}
      />

      {/* Quiet, Clean, Executive Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-6 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-semibold text-slate-300">SmartWaste AI</span>
              <span aria-hidden="true">·</span>
              <span>Btech CSE 2024 · Python (BTCS 510-18)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Students: <strong>Aayush Gupta</strong> (2445556) &amp; <strong>Sehajpal Singh</strong> (2445712) · Under the Guidance of <strong>Mrs. Ishatpreet Kaur</strong>
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('classify')}
              className="hover:text-slate-300 transition-colors"
            >
              Scanner
            </button>
            <button
              onClick={() => setIsScreenshotsModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              title="View and download all 8 output screenshots for Pages 18-20"
            >
              Report Figures (15.1 – 15.8)
            </button>
            <button
              onClick={() => setActiveTab('pictureReport')}
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Picture Analysis Report
            </button>
            <button
              onClick={() => setIsDesktopModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Desktop .EXE Package
            </button>
            <a
              href="/docs/SmartWaste_AI_Final_Academic_Project_Report.md"
              download="SmartWaste_AI_Final_Academic_Project_Report.md"
              title="Download 20-30 page college project report submission document"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Project Report (.md)
            </a>
            <button
              onClick={() => setActiveTab('history')}
              className="hover:text-slate-300 transition-colors"
            >
              Audit History
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
