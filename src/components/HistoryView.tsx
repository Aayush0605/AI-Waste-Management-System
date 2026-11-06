import React, { useState } from 'react';
import { ClassificationRecord, WasteCategory } from '../types/waste';
import { CATEGORY_COLORS } from '../data/blueprintData';
import {
  exportHistoryAsCSV,
  downloadCSV,
  deleteClassificationRecord,
  clearAllClassificationHistory,
} from '../services/classifier';
import {
  Download,
  Trash2,
  Search,
  Filter,
  Eye,
  X,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';

interface HistoryViewProps {
  records: ClassificationRecord[];
  onReloadHistory: () => void;
  onNavigateClassify: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onReloadHistory,
  onNavigateClassify,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<'all' | 'high' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<ClassificationRecord | null>(null);

  const categories: WasteCategory[] = [
    'Plastic',
    'Paper',
    'Glass',
    'Metal',
    'Organic',
    'General Waste',
  ];

  // Filtering
  const filtered = records.filter((r) => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (confidenceFilter === 'high' && r.confidence < 0.85) return false;
    if (confidenceFilter === 'low' && r.confidence >= 0.65) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchFile = r.filename.toLowerCase().includes(q);
      const matchNotes = (r.notes || '').toLowerCase().includes(q);
      const matchCat = r.category.toLowerCase().includes(q);
      if (!matchFile && !matchNotes && !matchCat) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const csv = exportHistoryAsCSV(filtered);
    downloadCSV(csv, `smartwaste_history_${Date.now()}.csv`);
  };

  const handleDeleteItem = async (id: number) => {
    await deleteClassificationRecord(id);
    if (selectedRecord?.id === id) setSelectedRecord(null);
    onReloadHistory();
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all local classification history? This action cannot be undone.')) {
      await clearAllClassificationHistory();
      setSelectedRecord(null);
      onReloadHistory();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Classification History & Database
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Persisted records conforming to SQLite table schema (id, filename, category, confidence, created_at, model_version).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          {records.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:border-rose-900 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename, notes, or category..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by material category"
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value as any)}
            aria-label="Filter by confidence score threshold"
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Confidence Levels</option>
            <option value="high">High Confidence (&ge; 85%)</option>
            <option value="low">Low Confidence (&lt; 65%)</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-medium">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Filename</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Confidence</th>
                <th className="px-5 py-3.5">Model Version</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">No records match the current filter</p>
                    <button
                      onClick={onNavigateClassify}
                      className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      Classify a waste item now
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => {
                  const style = CATEGORY_COLORS[rec.category];
                  const confPct = Math.round(rec.confidence * 100);
                  const isLow = rec.confidence < 0.65;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-slate-500">
                        #{rec.id}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-200">
                        {rec.filename}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-semibold ${style.text}`}>
                          {rec.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={
                              confPct >= 85
                                ? 'text-emerald-400 font-semibold'
                                : isLow
                                ? 'text-amber-400 font-semibold'
                                : 'text-slate-300'
                            }
                          >
                            {confPct}%
                          </span>
                          {isLow && (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {rec.model_version}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-400 tabular-nums">
                        {rec.created_at}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => setSelectedRecord(rec)}
                          title="Inspect record"
                          className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(rec.id)}
                          title="Delete record"
                          className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-500 font-mono">
                  Record #{selectedRecord.id}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {selectedRecord.filename}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedRecord.previewUrl && (
              <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-800 bg-black">
                <img
                  src={selectedRecord.previewUrl}
                  alt={selectedRecord.filename}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block text-[11px]">Assigned Category</span>
                <span className={`text-sm font-semibold mt-0.5 block ${CATEGORY_COLORS[selectedRecord.category].text}`}>
                  {selectedRecord.category}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block text-[11px]">Model Confidence</span>
                <span className="text-sm font-mono font-semibold text-emerald-400 mt-0.5 block tabular-nums">
                  {Math.round(selectedRecord.confidence * 100)}%
                </span>
              </div>
            </div>

            {selectedRecord.notes && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                <span className="text-slate-500 block text-[11px] mb-1">Inference Notes</span>
                <p className="text-slate-300 leading-relaxed">{selectedRecord.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-3 font-mono">
              <span>{selectedRecord.model_version}</span>
              <span>{selectedRecord.created_at}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleDeleteItem(selectedRecord.id)}
                className="px-3 py-1.5 rounded-lg border border-rose-900 bg-rose-500/10 text-rose-300 text-xs font-medium hover:bg-rose-500/20"
              >
                Delete Record
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
