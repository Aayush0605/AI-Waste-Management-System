import React, { useState } from 'react';
import { X, Download, ExternalLink, Image as ImageIcon, CheckCircle, FileText, Sparkles } from 'lucide-react';

interface FigureItem {
  id: string;
  figureNumber: string;
  pageNumber: number;
  title: string;
  caption: string;
  imageSrc: string;
  downloadFilename: string;
  fieldDescription: string;
}

const REPORT_FIGURES: FigureItem[] = [
  {
    id: 'fig-15-1',
    figureNumber: 'Figure 15.1',
    pageNumber: 18,
    title: 'Dashboard interface',
    caption: 'Overview of the central SmartWaste AI control deck, illustrating total scans processed (24 items), real-time landfill diversion rate gauge (85%), system average confidence (92%), category breakdown cards, and recent prediction logs.',
    imageSrc: '/docs/screenshots/figure_15_1_dashboard.jpg',
    downloadFilename: 'Figure_15_1_Dashboard_Interface.jpg',
    fieldDescription: 'Dashboard (total scans, landfill diversion gauge, category cards, recent predictions)',
  },
  {
    id: 'fig-15-2',
    figureNumber: 'Figure 15.2',
    pageNumber: 18,
    title: 'Waste classifier, image upload',
    caption: 'Classification interface under standard image file upload modality. A transparent plastic PET water bottle sample is classified with 95.0% confidence, displaying alternative category probability distribution and facility preparation steps.',
    imageSrc: '/docs/screenshots/figure_15_2_classifier_upload.jpg',
    downloadFilename: 'Figure_15_2_Classifier_Image_Upload.jpg',
    fieldDescription: 'Classifier view, file upload with prediction card (class, confidence meter, top-3 bars, preparation steps)',
  },
  {
    id: 'fig-15-3',
    figureNumber: 'Figure 15.3',
    pageNumber: 18,
    title: 'Waste classifier, live webcam stream',
    caption: 'Live optical viewfinder stream capturing an aluminium beverage can on a simulated sorting line. Features real-time bounding crosshairs, 98.6% model detection confidence, and instantaneous frame snapshot trigger.',
    imageSrc: '/docs/screenshots/figure_15_3_live_webcam.jpg',
    downloadFilename: 'Figure_15_3_Classifier_Webcam_Stream.jpg',
    fieldDescription: 'Live webcam viewfinder with snapshot capture',
  },
  {
    id: 'fig-15-4',
    figureNumber: 'Figure 15.4',
    pageNumber: 19,
    title: 'Low-confidence warning for a soiled item',
    caption: 'Safety rejection trigger (Test Case TC-05) on a contaminated, grease-soaked pizza box. Because classification certainty falls below the 65% acceptance threshold (58%), the system displays an amber warning banner instructing manual segregation.',
    imageSrc: '/docs/screenshots/figure_15_4_low_confidence.jpg',
    downloadFilename: 'Figure_15_4_Low_Confidence_Warning.jpg',
    fieldDescription: 'Low-confidence amber warning banner (TC-05)',
  },
  {
    id: 'fig-15-5',
    figureNumber: 'Figure 15.5',
    pageNumber: 19,
    title: 'Material disposal and preparation guide',
    caption: 'Interactive municipal sorting protocol guide detailing accepted polymer types, strictly forbidden contaminants, standard preparation SOPs (rinsing, removing caps), and designated recycling bin color codes.',
    imageSrc: '/docs/screenshots/figure_15_5_disposal_guide.jpg',
    downloadFilename: 'Figure_15_5_Disposal_Preparation_Guide.jpg',
    fieldDescription: 'Waste Sorting and Preparation Guide for the six streams',
  },
  {
    id: 'fig-15-6',
    figureNumber: 'Figure 15.6',
    pageNumber: 19,
    title: 'Classification history and database view',
    caption: 'Persistent SQLite database view displaying historical classification records with full-text search, stream filtering, confidence thresholds, item inspection modal, and Export CSV capability.',
    imageSrc: '/docs/screenshots/figure_15_6_history_database.jpg',
    downloadFilename: 'Figure_15_6_History_Database_View.jpg',
    fieldDescription: 'Classification history table with search, filters and Export CSV',
  },
  {
    id: 'fig-15-7',
    figureNumber: 'Figure 15.7',
    pageNumber: 20,
    title: 'Model evaluation lab and training studio',
    caption: 'Deep learning performance evaluation studio featuring the interactive 6×6 confusion matrix across 24,675 dataset samples, 88.4% test accuracy, 0.87 macro F1-score, dual-axis training/validation loss curves, and per-class metrics.',
    imageSrc: '/docs/screenshots/figure_15_7_model_evaluation.jpg',
    downloadFilename: 'Figure_15_7_Model_Evaluation_Lab.jpg',
    fieldDescription: 'Model Evaluation Lab and Big Data Training Hub',
  },
  {
    id: 'fig-15-8',
    figureNumber: 'Figure 15.8',
    pageNumber: 20,
    title: 'Desktop packaging and standalone application',
    caption: 'Standalone Windows desktop executable packaging interface. Shows active PyInstaller single-file build confirmation (SmartWasteAI.exe, 142 MB), local embedded SQLite database, offline ONNX runtime, and download trigger.',
    imageSrc: '/docs/screenshots/figure_15_8_desktop_app.jpg',
    downloadFilename: 'Figure_15_8_Desktop_Application_Packaging.jpg',
    fieldDescription: 'Desktop .EXE packaging modal / installed desktop application',
  },
];

interface ReportScreenshotsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportScreenshotsModal: React.FC<ReportScreenshotsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedPageFilter, setSelectedPageFilter] = useState<'all' | 18 | 19 | 20>('all');
  const [activePreviewFigure, setActivePreviewFigure] = useState<FigureItem | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  if (!isOpen) return null;

  const filteredFigures = REPORT_FIGURES.filter((fig) => {
    if (selectedPageFilter === 'all') return true;
    return fig.pageNumber === selectedPageFilter;
  });

  const downloadFigure = (fig: FigureItem) => {
    const link = document.createElement('a');
    link.href = fig.imageSrc;
    link.download = fig.downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    for (let i = 0; i < REPORT_FIGURES.length; i++) {
      const fig = REPORT_FIGURES[i];
      downloadFigure(fig);
      // Small delay between programmatic downloads to avoid browser block
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    setDownloadingAll(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Project Report Output Screenshots (Section 15)
                </h2>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                  8 Official Figures
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Aayush Gupta (2445556) &amp; Sehajpal Singh (2445712) · Btech CSE 2024 · Supervisor: Mrs. Ishatpreet Kaur
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              disabled={downloadingAll}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30 transition-colors"
              title="Download all 8 high-resolution figures"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingAll ? 'Downloading...' : 'Download All 8 (.JPG)'}</span>
            </button>
            <a
              href="/docs/SmartWaste_AI_Final_Academic_Project_Report.md"
              download="SmartWaste_AI_Final_Academic_Project_Report.md"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              title="Download complete 20-30 page report in markdown format"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Report Document (.md)</span>
            </a>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar & Page Mapping */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-6 py-2.5 bg-slate-950/40 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 mr-1">Report Pages:</span>
            <button
              onClick={() => setSelectedPageFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedPageFilter === 'all'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All 8 Figures
            </button>
            <button
              onClick={() => setSelectedPageFilter(18)}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedPageFilter === 18
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Page 18 (Figs 15.1 – 15.3)
            </button>
            <button
              onClick={() => setSelectedPageFilter(19)}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedPageFilter === 19
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Page 19 (Figs 15.4 – 15.6)
            </button>
            <button
              onClick={() => setSelectedPageFilter(20)}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedPageFilter === 20
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Page 20 (Figs 15.7 – 15.8)
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>High-resolution 16:9 screenshots formatted for Word/PDF insertion</span>
          </div>
        </div>

        {/* Scrollable Gallery Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFigures.map((fig) => (
              <div
                key={fig.id}
                className="group flex flex-col rounded-xl border border-slate-800 bg-slate-950/70 hover:border-slate-700 overflow-hidden transition-all shadow-md"
              >
                {/* Image Container with Hover Overlay */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden border-b border-slate-800">
                  <img
                    src={fig.imageSrc}
                    alt={fig.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02] cursor-pointer"
                    onClick={() => setActivePreviewFigure(fig)}
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="rounded-md bg-slate-900/90 backdrop-blur-sm border border-slate-700 px-2 py-0.5 text-[11px] font-bold text-white shadow">
                      {fig.figureNumber}
                    </span>
                    <span className="rounded-md bg-emerald-950/90 backdrop-blur-sm border border-emerald-700/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 shadow">
                      Page {fig.pageNumber}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setActivePreviewFigure(fig)}
                      className="p-1.5 rounded-md bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 shadow"
                      title="Enlarge preview"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => downloadFigure(fig)}
                      className="p-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                      title="Download image"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info & Caption Area */}
                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white tracking-tight">
                        {fig.title}
                      </h3>
                      <button
                        onClick={() => downloadFigure(fig)}
                        className="text-[11px] flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium shrink-0"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {fig.caption}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate pr-2">
                      Report placeholder: <code className="text-slate-300 font-mono text-[10px]">{fig.fieldDescription}</code>
                    </span>
                    <span className="text-slate-400 shrink-0">1920 × 1080</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 px-6 py-3.5 bg-slate-950/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>
              All 8 screenshots correspond exactly to Figures 15.1 – 15.8 on Pages 18, 19, and 20 of the B.Tech CSE evaluation rubric.
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            Close Gallery
          </button>
        </div>
      </div>

      {/* Lightbox Modal for Enlarge */}
      {activePreviewFigure && (
        <div
          className="fixed inset-0 z-60 flex flex-col items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setActivePreviewFigure(null)}
        >
          <div
            className="relative max-w-5xl w-full flex flex-col rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900">
              <div>
                <span className="text-xs font-bold text-emerald-400 mr-2">
                  {activePreviewFigure.figureNumber} (Page {activePreviewFigure.pageNumber})
                </span>
                <span className="text-sm font-semibold text-white">
                  {activePreviewFigure.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadFigure(activePreviewFigure)}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download High-Res
                </button>
                <button
                  onClick={() => setActivePreviewFigure(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="max-h-[75vh] bg-black flex items-center justify-center p-2">
              <img
                src={activePreviewFigure.imageSrc}
                alt={activePreviewFigure.title}
                className="max-h-[72vh] w-auto max-w-full object-contain rounded"
              />
            </div>
            <div className="p-4 bg-slate-900 border-t border-slate-800 text-xs text-slate-300">
              <p className="font-semibold text-white mb-0.5">Caption for Academic Report:</p>
              <p>{activePreviewFigure.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
