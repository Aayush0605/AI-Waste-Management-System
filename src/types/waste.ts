export type WasteCategory =
  | 'Plastic'
  | 'Paper'
  | 'Glass'
  | 'Metal'
  | 'Organic'
  | 'General Waste';

export interface CategoryAlternative {
  category: WasteCategory;
  probability: number;
}

export interface DisposalGuidance {
  title: string;
  binType: string;
  binColor: string; // Tailwind color class or hex
  acceptedSummary: string[];
  forbiddenSummary: string[];
  prepSteps: string[];
  environmentalImpact: string;
  decompositionTime: string;
  recyclingPotential: string;
  contaminationRisk: string;
}

export interface PredictionResult {
  id: string;
  category: WasteCategory;
  confidence: number; // 0 to 1
  alternatives: CategoryAlternative[];
  isLowConfidence: boolean;
  isOutOfScope: boolean;
  itemDescription: string;
  materialComposition: string;
  resinCode?: string;
  disposalGuidance: DisposalGuidance;
  modelVersion: string;
  inferenceSource: 'gemini-vision' | 'mobilenet-v2-local' | 'bigdata-neural-engine';
  processingTimeMs: number;
  timestamp: string;
  previewUrl?: string;
  filename?: string;
}

export interface ClassificationRecord {
  id: number;
  filename: string;
  category: WasteCategory;
  confidence: number;
  created_at: string;
  model_version: string;
  notes?: string;
  previewUrl?: string;
}

export interface PhaseTask {
  id: string;
  label: string;
  done: boolean;
}

export interface PhaseItem {
  id: number;
  title: string;
  subtitle: string;
  deliverable: string;
  status: 'completed' | 'in_progress' | 'pending';
  tasks: PhaseTask[];
}

export interface ModelMetricSummary {
  modelVersion: string;
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  testSetSize: number;
  evaluatedAt: string;
}

export interface ClassPerformance {
  category: WasteCategory;
  precision: number;
  recall: number;
  f1Score: number;
  support: number;
}
