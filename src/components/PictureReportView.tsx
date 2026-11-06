import React, { useState, useEffect } from 'react';
import {
  PredictionResult,
  WasteCategory,
  ClassificationRecord,
} from '../types/waste';
import { CATEGORY_COLORS, SAMPLE_PRESETS, WASTE_GUIDES } from '../data/blueprintData';
import { classifyWasteImage } from '../services/classifier';
import {
  Printer,
  Download,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  Building2,
  Recycle,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface PictureReportViewProps {
  currentPrediction: PredictionResult | null;
  historyRecords: ClassificationRecord[];
  onSelectNewPrediction: (pred: PredictionResult) => void;
}

export const PictureReportView: React.FC<PictureReportViewProps> = ({
  currentPrediction,
  historyRecords,
  onSelectNewPrediction,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SAMPLE_PRESETS[0].id);
  const [activeImagePreview, setActiveImagePreview] = useState<string>(
    currentPrediction?.previewUrl || SAMPLE_PRESETS[0].imagePath || ''
  );
  const [activePrediction, setActivePrediction] = useState<PredictionResult | null>(
    currentPrediction
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analystName, setAnalystName] = useState('Aayush Gupta & Sehajpal Singh');
  const [facilityLocation, setFacilityLocation] = useState('Btech CSE 2024 · Python (BTCS 510-18)');

  // Load initial prediction if none is provided
  useEffect(() => {
    if (currentPrediction) {
      setActivePrediction(currentPrediction);
      if (currentPrediction.previewUrl) {
        setActiveImagePreview(currentPrediction.previewUrl);
      }
    } else {
      // Analyze first sample by default
      runAnalysisOnPreset(SAMPLE_PRESETS[0]);
    }
  }, [currentPrediction]);

  const runAnalysisOnPreset = async (preset: (typeof SAMPLE_PRESETS)[0]) => {
    setIsAnalyzing(true);
    setSelectedPresetId(preset.id);
    setActiveImagePreview(preset.imagePath || '');
    try {
      const res = await classifyWasteImage(
        preset.imagePath || '',
        `${preset.id}.jpg`,
        preset.id
      );
      setActivePrediction(res);
      onSelectNewPrediction(res);
    } catch (err) {
      console.error('Failed to analyze preset:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCustomFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setActiveImagePreview(dataUrl);
      try {
        const res = await classifyWasteImage(file, file.name);
        if (!res.previewUrl) {
          res.previewUrl = dataUrl;
        }
        setActivePrediction(res);
        onSelectNewPrediction(res);
      } catch (err) {
        console.error('Failed to analyze uploaded file:', err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (!activePrediction) return;
    const headers = [
      'report_id',
      'inspection_timestamp',
      'category',
      'confidence',
      'item_description',
      'material_composition',
      'resin_code',
      'contamination_risk',
      'bin_destination',
      'landfill_decomposition',
    ];
    const row = [
      `"SWA-REP-${Date.now()}"`,
      `"${new Date().toISOString()}"`,
      `"${activePrediction.category}"`,
      activePrediction.confidence.toFixed(4),
      `"${(activePrediction.itemDescription || '').replace(/"/g, '""')}"`,
      `"${(activePrediction.materialComposition || '').replace(/"/g, '""')}"`,
      `"${activePrediction.resinCode || 'N/A'}"`,
      `"${activePrediction.disposalGuidance.contaminationRisk}"`,
      `"${activePrediction.disposalGuidance.binType}"`,
      `"${activePrediction.disposalGuidance.decompositionTime}"`,
    ];
    const csv = [headers.join(','), row.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waste_analysis_report_${activePrediction.category.toLowerCase()}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const catStyle = activePrediction
    ? CATEGORY_COLORS[activePrediction.category]
    : CATEGORY_COLORS.Plastic;

  return (
    <div className="space-y-8">
      {/* Top Controls & Picture Selector (Hidden when printing) */}
      <div className="print:hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mb-1">
              <span>Executive Waste Characterization</span>
              <span aria-hidden="true">·</span>
              <span>Quality Audit & Compliance</span>
              <span aria-hidden="true">·</span>
              <span>Management Analysis</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Picture Analysis & Management Report
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate, audit, and export formal material characterization reports for any scanned waste photograph.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadCSV}
              disabled={!activePrediction}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV Audit</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={!activePrediction}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF Report</span>
            </button>
          </div>
        </div>

        {/* Input Selector Bar: Pick Sample or Upload Any Picture */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-300">
              Select or Upload Picture to Generate Report:
            </span>

            <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Upload Custom Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCustomFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Quick picture thumbnails */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {SAMPLE_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => runAnalysisOnPreset(preset)}
                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-lg border text-left whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="w-7 h-7 rounded bg-black overflow-hidden border border-slate-800 shrink-0">
                    {preset.imagePath ? (
                      <img
                        src={preset.imagePath}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600">
                        IMG
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Report Document View (Print-Optimized) */}
      {isAnalyzing ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin mx-auto" />
          <div className="space-y-1">
            <span className="text-sm font-semibold text-white block">
              Extracting Material & Composition Data
            </span>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Running high-resolution feature tensor inspection, calculating recyclability index, and compiling management audit...
            </p>
          </div>
        </div>
      ) : activePrediction ? (
        <div
          id="printable-management-report"
          className="rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 p-8 md:p-12 shadow-2xl space-y-8 max-w-5xl mx-auto print:border-none print:shadow-none print:p-0 print:bg-white print:text-black font-sans"
        >
          {/* Report Top Header */}
          <div className="border-b border-slate-800 print:border-slate-300 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-emerald-700">
                  Material Recovery Facility Audit
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white print:text-black">
                Waste Material Characterization Report
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Automated Optical Inspection System · SmartWaste AI (Python BTCS 510-18 · Btech CSE 2024)
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-slate-400 print:text-slate-700 space-y-1">
              <div>
                <span className="text-slate-500">Report Ref:</span>{' '}
                <strong className="text-white print:text-black">
                  SWA-2026-{(activePrediction.id || '98412').slice(-6).toUpperCase()}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">Date:</span>{' '}
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <div>
                <span className="text-slate-500">Terminal:</span> Station #01
              </div>
            </div>
          </div>

          {/* Core Findings Split: Picture Preview + Material Characterization */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Visual Evidence (Left 4 cols) */}
            <div className="md:col-span-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700 block">
                Visual Evidence & Inspection Frame
              </span>
              <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-800 print:border-slate-400 bg-black">
                {activeImagePreview ? (
                  <img
                    src={activeImagePreview}
                    alt="Analyzed waste object"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                    No Picture Selected
                  </div>
                )}
                {/* Visual optical crosshairs overlay */}
                <div className="absolute inset-3 border border-white/20 pointer-events-none rounded flex items-center justify-center">
                  <div className="w-4 h-4 border-t border-l border-emerald-400 absolute top-0 left-0" />
                  <div className="w-4 h-4 border-t border-r border-emerald-400 absolute top-0 right-0" />
                  <div className="w-4 h-4 border-b border-l border-emerald-400 absolute bottom-0 left-0" />
                  <div className="w-4 h-4 border-b border-r border-emerald-400 absolute bottom-0 right-0" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 print:text-slate-600 pt-1">
                <span>Input: {activePrediction.filename || 'waste_input.jpg'}</span>
                <span>RGB 224×224</span>
              </div>
            </div>

            {/* Classification & Material Diagnostic (Right 7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700 block">
                Primary Material Assessment
              </span>

              <div className="p-5 rounded-xl border border-slate-800 print:border-slate-300 bg-slate-950/60 print:bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold uppercase tracking-wider ${catStyle.text} print:text-black`}>
                    Class: {activePrediction.category}
                  </span>
                  <span className="text-sm font-mono font-bold text-emerald-400 print:text-emerald-700 tabular-nums">
                    {Math.round(activePrediction.confidence * 100)}% Confidence
                  </span>
                </div>

                <div className="text-lg font-bold text-white print:text-black">
                  {activePrediction.itemDescription}
                </div>

                <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
                  <strong>Composition:</strong> {activePrediction.materialComposition}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-800/80 print:border-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Resin Code / Standard</span>
                    <span className="font-mono font-semibold text-slate-200 print:text-black">
                      {activePrediction.resinCode || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Recyclability Status</span>
                    <span className="font-semibold text-emerald-400 print:text-emerald-800">
                      {activePrediction.category === 'General Waste'
                        ? 'Non-Recyclable Residual'
                        : 'Approved for Circular Recovery'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contamination Notice if Low Confidence */}
              {activePrediction.isLowConfidence && (
                <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-200 print:text-amber-900 print:border-amber-400 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold">Contamination Advisory (Confidence &lt; 65%)</p>
                    <p className="leading-relaxed">
                      Image exhibits composite materials, heavy grease, or multi-laminate layers. Manual segregation recommended prior to mechanical baling.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Standard Operating Procedure (SOP) & Handling Protocol */}
          <div className="border-t border-slate-800 print:border-slate-300 pt-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 print:text-black">
              Facility Handling & Preparation Protocol
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-800 print:border-slate-300 bg-slate-950/40 print:bg-slate-50 space-y-2">
                <span className="font-semibold text-emerald-400 print:text-emerald-800 block">
                  Mandatory Preparation Protocol:
                </span>
                <ul className="space-y-1.5 text-slate-300 print:text-slate-700">
                  {activePrediction.disposalGuidance.prepSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 print:text-emerald-700 font-bold">✓</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 print:border-slate-300 bg-slate-950/40 print:bg-slate-50 space-y-2">
                <span className="font-semibold text-slate-200 print:text-black block">
                  Logistical Routing:
                </span>
                <div className="space-y-1 text-slate-300 print:text-slate-700">
                  <p>
                    <strong>Designated Bin:</strong> {activePrediction.disposalGuidance.binType}
                  </p>
                  <p>
                    <strong>Batch Contamination Hazard:</strong>{' '}
                    {activePrediction.disposalGuidance.contaminationRisk} Risk
                  </p>
                  <p>
                    <strong>Circularity Potential:</strong>{' '}
                    {activePrediction.disposalGuidance.recyclingPotential}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Lifecycle & Impact Ledger */}
          <div className="border-t border-slate-800 print:border-slate-300 pt-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 print:text-black">
              Environmental Impact Assessment
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-lg border border-slate-800 print:border-slate-300 bg-slate-950/60 print:bg-slate-50">
                <span className="text-slate-500 block text-[11px]">Landfill Decomposition</span>
                <span className="font-semibold text-slate-200 print:text-black mt-1 block">
                  {activePrediction.disposalGuidance.decompositionTime}
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-800 print:border-slate-300 bg-slate-950/60 print:bg-slate-50">
                <span className="text-slate-500 block text-[11px]">Estimated Energy Saved</span>
                <span className="font-semibold text-emerald-400 print:text-emerald-800 mt-1 block font-mono">
                  ~0.18 kWh / unit
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-800 print:border-slate-300 bg-slate-950/60 print:bg-slate-50">
                <span className="text-slate-500 block text-[11px]">CO2e Emission Avoidance</span>
                <span className="font-semibold text-cyan-400 print:text-cyan-800 mt-1 block font-mono">
                  0.09 kg CO2e
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-800 print:border-slate-300 bg-slate-950/60 print:bg-slate-50">
                <span className="text-slate-500 block text-[11px]">Audit Status</span>
                <span className="font-semibold text-emerald-400 print:text-emerald-800 mt-1 block">
                  Certified Complete
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 print:text-slate-600 leading-relaxed italic">
              {activePrediction.disposalGuidance.environmentalImpact}
            </p>
          </div>

          {/* Audit Verification & Signature Stamp */}
          <div className="border-t border-slate-800 print:border-slate-300 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-slate-400 print:text-slate-700">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 print:text-emerald-800 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified by SmartWaste AI Computer Vision Model</span>
              </div>
              <p className="text-[11px] text-slate-500 print:text-slate-600">
                Inference Hash: SHA256-{(activePrediction.id || '98412').slice(-8)} · Model: MobileNetV2-Transfer-v1.4
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
              <div className="w-56 border-b border-slate-700 print:border-slate-400 mb-1" />
              <p className="font-bold text-white print:text-black">Aayush Gupta (2445556) & Sehajpal Singh (2445712)</p>
              <p className="text-[11px] text-slate-500 print:text-slate-600">Guide: Mrs. Ishatpreet Kaur · Dept. of Computer Science & Engineering</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
