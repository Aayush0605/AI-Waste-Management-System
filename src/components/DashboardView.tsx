import React from 'react';
import {
  ClassificationRecord,
  WasteCategory,
} from '../types/waste';
import {
  CATEGORY_COLORS,
  MODEL_EVALUATION_METRICS,
} from '../data/blueprintData';
import { ArrowRight, Recycle, Sparkles, Database, CheckCircle2 } from 'lucide-react';

interface DashboardViewProps {
  records: ClassificationRecord[];
  onNavigateClassify: () => void;
  onNavigateGuide: (category?: WasteCategory) => void;
  onNavigateHistory: () => void;
  onNavigatePictureReport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  onNavigateClassify,
  onNavigateGuide,
  onNavigateHistory,
  onNavigatePictureReport,
}) => {
  const totalScans = records.length;
  const nonGeneralScans = records.filter(
    (r) => r.category !== 'General Waste'
  ).length;
  const diversionRate =
    totalScans > 0 ? Math.round((nonGeneralScans / totalScans) * 100) : 85;

  const avgConfidence =
    totalScans > 0
      ? Math.round(
          (records.reduce((acc, r) => acc + r.confidence, 0) / totalScans) * 100
        )
      : 92;

  // Category counts
  const categoryCounts: Record<WasteCategory, number> = {
    Plastic: 0,
    Paper: 0,
    Glass: 0,
    Metal: 0,
    Organic: 0,
    'General Waste': 0,
  };

  records.forEach((r) => {
    if (categoryCounts[r.category] !== undefined) {
      categoryCounts[r.category]++;
    }
  });

  const categories: WasteCategory[] = [
    'Plastic',
    'Paper',
    'Glass',
    'Metal',
    'Organic',
    'General Waste',
  ];

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-8 md:p-12">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <span>MobileNetV2 Deep Learning</span>
            <span aria-hidden="true">·</span>
            <span>Transfer Learning v1.4</span>
            <span aria-hidden="true">·</span>
            <span>6 Waste Categories</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white text-balance leading-tight">
            Intelligent Waste Classification & Recovery System
          </h1>
          <p className="text-base text-slate-400 leading-relaxed max-w-2xl">
            Automating material separation across plastic, paper, glass, metal, organic, and general waste using deep convolutional neural networks and multimodal vision analytics.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateClassify}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 active:scale-95 transition-all"
            >
              <span>Classify Waste Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onNavigatePictureReport}
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Generate Picture Report
            </button>
          </div>
        </div>
      </section>

      {/* KPI Stat Cards Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs text-slate-400 block mb-1">Total Scans Recorded</span>
          <div className="text-2xl md:text-3xl font-bold text-white font-mono tabular-nums">
            {totalScans}
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            Saved to SQLite table
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs text-slate-400 block mb-1">Diverted from Landfill</span>
          <div className="text-2xl md:text-3xl font-bold text-emerald-400 font-mono tabular-nums">
            {diversionRate}%
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            Recyclable & organic streams
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs text-slate-400 block mb-1">Average Confidence</span>
          <div className="text-2xl md:text-3xl font-bold text-blue-400 font-mono tabular-nums">
            {avgConfidence}%
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            Softmax output calibration
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs text-slate-400 block mb-1">Test Set Accuracy</span>
          <div className="text-2xl md:text-3xl font-bold text-cyan-400 font-mono tabular-nums">
            {(MODEL_EVALUATION_METRICS.accuracy * 100).toFixed(1)}%
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            900 held-out test samples
          </span>
        </div>
      </section>

      {/* 6 Target Categories Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Target Material Categories
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              The 6 primary waste streams defined in the deep learning architecture
            </p>
          </div>
          <button
            onClick={() => onNavigateGuide()}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            <span>Complete Disposal Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const config = CATEGORY_COLORS[cat];
            const count = categoryCounts[cat];
            return (
              <div
                key={cat}
                onClick={() => onNavigateGuide(cat)}
                className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 hover:bg-slate-900/70 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-semibold ${config.text}`}>
                      {cat}
                    </span>
                    <span className="text-xs font-mono tabular-nums text-slate-400">
                      {count} items logged
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cat === 'Plastic' && 'Bottles, HDPE jugs, PP tubs, clean food containers.'}
                    {cat === 'Paper' && 'Cardboard boxes, shipping cartons, paper sheets.'}
                    {cat === 'Glass' && 'Flint glass bottles, condiment jars, glass containers.'}
                    {cat === 'Metal' && 'Aluminium beverage cans, tin and steel food cans.'}
                    {cat === 'Organic' && 'Food scraps, fruit peels, vegetable ends, eggshells.'}
                    {cat === 'General Waste' && 'Greasy wrappers, styrofoam, non-recyclables.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 group-hover:text-slate-300">
                  <span>View handling rules</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Scans Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Recent Classification Log
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live records persisted to SQLite classifications table
            </p>
          </div>
          <button
            onClick={onNavigateHistory}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            <span>Full History & CSV Export</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-medium">
                <tr>
                  <th className="px-5 py-3.5">Filename</th>
                  <th className="px-5 py-3.5">Predicted Class</th>
                  <th className="px-5 py-3.5">Confidence</th>
                  <th className="px-5 py-3.5">Model</th>
                  <th className="px-5 py-3.5">Logged At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {records.slice(0, 5).map((rec) => {
                  const style = CATEGORY_COLORS[rec.category];
                  const confPct = Math.round(rec.confidence * 100);
                  return (
                    <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-slate-200">
                        {rec.filename}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-medium ${style.text}`}>
                          {rec.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono tabular-nums">
                        <span className={confPct >= 85 ? 'text-emerald-400' : confPct >= 65 ? 'text-amber-400' : 'text-rose-400'}>
                          {confPct}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {rec.model_version}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-400 tabular-nums">
                        {rec.created_at}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
