import React, { useState } from 'react';
import { WasteCategory } from '../types/waste';
import { WASTE_GUIDES, CATEGORY_COLORS } from '../data/blueprintData';
import { Search, CheckCircle2, XCircle, AlertCircle, ArrowUpRight } from 'lucide-react';

interface WasteGuideViewProps {
  initialCategory?: WasteCategory;
  onSelectCategoryForClassify: (cat: WasteCategory) => void;
}

export const WasteGuideView: React.FC<WasteGuideViewProps> = ({
  initialCategory,
  onSelectCategoryForClassify,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory>(
    initialCategory || 'Plastic'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const categories: WasteCategory[] = [
    'Plastic',
    'Paper',
    'Glass',
    'Metal',
    'Organic',
    'General Waste',
  ];

  const guide = WASTE_GUIDES[selectedCategory];
  const catStyle = CATEGORY_COLORS[selectedCategory];

  // Quick item search across all categories
  const searchResults = searchQuery.trim()
    ? categories.flatMap((cat) => {
        const g = WASTE_GUIDES[cat];
        const matchesAccepted = g.acceptedSummary.filter((item) =>
          item.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const matchesForbidden = g.forbiddenSummary.filter((item) =>
          item.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return [
          ...matchesAccepted.map((item) => ({ cat, item, type: 'accepted' as const })),
          ...matchesForbidden.map((item) => ({ cat, item, type: 'forbidden' as const })),
        ];
      })
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Waste Sorting & Disposal Guide
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Standard operating protocols and preparation rules for the 6 material streams.
          </p>
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items (e.g. pizza box, can)..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Search results popup if active */}
      {searchQuery.trim() && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-3">
          <span className="text-xs font-semibold text-slate-300 block">
            Search Matches for &quot;{searchQuery}&quot; ({searchResults.length} items found):
          </span>
          {searchResults.length === 0 ? (
            <p className="text-xs text-slate-500">
              No direct matches found. Please consult the individual category guides below.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedCategory(res.cat)}
                  className="cursor-pointer p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {res.type === 'accepted' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}
                    <span className="text-slate-200">{res.item}</span>
                  </div>
                  <span className={`text-[11px] font-medium ${CATEGORY_COLORS[res.cat].text}`}>
                    {res.cat}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const style = CATEGORY_COLORS[cat];
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span className={isSelected ? style.text : ''}>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Guide Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Accepted, Prohibited, Prep Steps */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stream Banner */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${catStyle.text}`}>
                {selectedCategory} Management Protocol
              </span>
              <button
                onClick={() => onSelectCategoryForClassify(selectedCategory)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
              >
                <span>Test {selectedCategory} in Classifier</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {guide.title}
            </h2>
            <p className="text-xs text-slate-400">
              Assigned collection receptacle: <strong className="text-slate-200">{guide.binType}</strong>
            </p>
          </div>

          {/* Accepted vs Prohibited Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Accepted Items */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Accepted Materials</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {guide.acceptedSummary.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prohibited Items */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                <XCircle className="w-4 h-4" />
                <span>Prohibited / Contaminants</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {guide.forbiddenSummary.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mandatory Preparation Steps */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Mandatory Preparation Protocol
            </h3>
            <ol className="space-y-2.5 text-xs text-slate-300">
              {guide.prepSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right 4 Cols: Environmental Stats & Decomposition */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Stream Metrics & Lifecycle
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500 block text-[11px]">Landfill Decomposition</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">
                  {guide.decompositionTime}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500 block text-[11px]">Recycling Circularity Potential</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">
                  {guide.recyclingPotential}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500 block text-[11px]">Batch Contamination Risk</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">
                  {guide.contaminationRisk}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed">
              <span className="font-semibold block mb-1">Environmental Impact:</span>
              {guide.environmentalImpact}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
