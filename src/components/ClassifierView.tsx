import React, { useState, useRef, useEffect } from 'react';
import {
  PredictionResult,
  WasteCategory,
  ClassificationRecord,
} from '../types/waste';
import {
  classifyWasteImage,
  saveClassificationRecord,
} from '../services/classifier';
import {
  CATEGORY_COLORS,
  SAMPLE_PRESETS,
} from '../data/blueprintData';
import {
  Upload,
  Camera,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  RefreshCw,
  BookmarkCheck,
  Zap,
  FileText,
} from 'lucide-react';

interface ClassifierViewProps {
  onRecordSaved: (record: ClassificationRecord) => void;
  onNavigateHistory: () => void;
  onGeneratePictureReport?: (pred: PredictionResult) => void;
}

export const ClassifierView: React.FC<ClassifierViewProps> = ({
  onRecordSaved,
  onNavigateHistory,
  onGeneratePictureReport,
}) => {
  const [activeInputMode, setActiveInputMode] = useState<'upload' | 'camera' | 'presets'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera when unmounting or switching tabs
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser permissions or use file upload.'
          : 'Unable to start camera stream. Please try file upload or preset samples.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    setImagePreview(dataUrl);
    setImageFile(null);
    setActivePresetId(null);
    handleExecuteInference(dataUrl, 'webcam_capture.jpg');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image format (JPEG, PNG, or WebP). PDFs and binaries are rejected.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 20MB limit. Please upload a smaller image.');
      return;
    }

    setErrorMessage(null);
    setImageFile(file);
    setActivePresetId(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      handleExecuteInference(file, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: (typeof SAMPLE_PRESETS)[0]) => {
    stopCamera();
    setActivePresetId(preset.id);
    setImagePreview(preset.imagePath || null);
    setImageFile(null);
    handleExecuteInference(preset.imagePath || '', `${preset.id}.jpg`, preset.id);
  };

  const handleExecuteInference = async (
    source: string | File,
    filename: string,
    presetId?: string
  ) => {
    setIsLoading(true);
    setPrediction(null);
    setSavedSuccess(false);
    setErrorMessage(null);

    try {
      const res = await classifyWasteImage(source, filename, presetId);
      if (!res.previewUrl && imagePreview) {
        res.previewUrl = imagePreview;
      }
      setPrediction(res);
      // Automatically save to local history database per Section 1 Workflow
      const savedRec = await saveClassificationRecord({
        filename: res.filename || filename,
        category: res.category,
        confidence: res.confidence,
        notes: res.itemDescription,
        previewUrl: res.previewUrl || imagePreview || (typeof source === 'string' ? source : ''),
      });
      onRecordSaved(savedRec);
      setSavedSuccess(true);
    } catch (err: any) {
      console.error('Classification execution failed:', err);
      setErrorMessage('Classification inference failed. Please try another image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    stopCamera();
    setImagePreview(null);
    setImageFile(null);
    setActivePresetId(null);
    setPrediction(null);
    setSavedSuccess(false);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mb-1">
          <span className="font-semibold text-emerald-300">2.4 GB Big Data Corpus Trained</span>
          <span aria-hidden="true">·</span>
          <span>50+ Sub-Class Materials</span>
          <span aria-hidden="true">·</span>
          <span>Copper Hardware & Textile Cloth Certified</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          Classify Waste Item
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Submit any waste item photo for high-precision multi-material vision classification across copper bolts, cloth/textiles, plastics, metals, paper, glass, and organics.
        </p>
      </div>

      {/* Main Grid: Input / Camera left, Results right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Selection (Upload / Camera / Presets) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Segmented input mode tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => {
                stopCamera();
                setActiveInputMode('upload');
              }}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
                activeInputMode === 'upload'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upload Image
            </button>
            <button
              onClick={() => {
                setActiveInputMode('camera');
                startCamera();
              }}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
                activeInputMode === 'camera'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Camera
            </button>
            <button
              onClick={() => {
                stopCamera();
                setActiveInputMode('presets');
              }}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
                activeInputMode === 'presets'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Test Samples
            </button>
          </div>

          {/* Mode 1: File Upload Box */}
          {activeInputMode === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer rounded-xl border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-900/40 hover:bg-slate-900/80 p-8 text-center transition-all flex flex-col items-center justify-center min-h-[280px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-emerald-500/10 flex items-center justify-center mb-4 transition-colors">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-slate-200 group-hover:text-white">
                Drop your waste image here or browse
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                Supports JPG, PNG, and WebP (up to 20MB)
              </span>
            </div>
          )}

          {/* Mode 2: Camera Stream */}
          {activeInputMode === 'camera' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
              {cameraError ? (
                <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  <p>{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="mt-3 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
                  >
                    Retry Camera
                  </button>
                </div>
              ) : (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {!cameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-xs text-slate-400 gap-2">
                      <Camera className="w-6 h-6 text-slate-500" />
                      <span>Initializing camera viewfinder...</span>
                    </div>
                  )}
                </div>
              )}

              {cameraActive && (
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={stopCamera}
                    className="text-xs text-slate-400 hover:text-slate-200 py-2 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={captureCameraFrame}
                    className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Snapshot</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mode 3: Test Samples Drawer */}
          {activeInputMode === 'presets' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
              <span className="text-xs text-slate-400 block font-medium">
                Select a benchmark dataset sample to test model inference:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                {SAMPLE_PRESETS.map((preset) => {
                  const isSelected = activePresetId === preset.id;
                  const catStyle = CATEGORY_COLORS[preset.category];
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-left p-3 rounded-lg border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-xs font-semibold ${catStyle.text}`}>
                            {preset.category}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {preset.resinCode}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-slate-200 block truncate">
                          {preset.label}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {preset.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Message Display */}
          {errorMessage && (
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Validation Notice</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Classification Results & Diagnostic Guide */}
        <div className="lg:col-span-7 space-y-6">
          {isLoading && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <span className="text-sm font-semibold text-white block">
                  Processing Waste Inference
                </span>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Resizing to 224x224 RGB, normalizing tensor weights, and extracting class probabilities...
                </p>
              </div>
            </div>
          )}

          {!isLoading && !prediction && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-slate-300 block">
                Awaiting Waste Image Input
              </span>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload an image, capture via webcam, or choose a benchmark sample from the left panel to generate class probabilities.
              </p>
            </div>
          )}

          {!isLoading && prediction && (
            <div className="space-y-6">
              {/* Primary Prediction Result Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
                {/* Header with image preview and category badge */}
                <div className="flex flex-col sm:flex-row gap-5 items-start justify-between">
                  {imagePreview && (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border border-slate-800 bg-black shrink-0">
                      <img
                        src={imagePreview}
                        alt="Scanned waste"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Clean CSS fallback container if path fails
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Model: {prediction.modelVersion}</span>
                      <span aria-hidden="true">·</span>
                      <span>{prediction.inferenceSource === 'gemini-vision' ? 'Multimodal Vision' : 'MobileNetV2 Edge'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{prediction.processingTimeMs}ms</span>
                    </div>

                    <div className="flex items-baseline gap-3 pt-1">
                      <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        {prediction.category}
                      </h2>
                      <span className="text-lg font-mono font-semibold text-emerald-400 tabular-nums">
                        {Math.round(prediction.confidence * 100)}% Confidence
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {prediction.itemDescription}
                    </p>
                  </div>
                </div>

                {/* Low-Confidence Warning per Section 6 of Blueprint */}
                {prediction.isLowConfidence && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-amber-300">
                        Low Confidence Warning (Probability &lt; 65%)
                      </p>
                      <p className="leading-relaxed">
                        The model detected ambiguous features (potential mixed materials, excessive food grease, or composite layers). Avoid treating this prediction as absolute fact; inspect manually.
                      </p>
                    </div>
                  </div>
                )}

                {/* Alternative Class Probabilities (Top-3) */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 block">
                    Top Alternative Class Probabilities
                  </span>
                  <div className="space-y-2">
                    {prediction.alternatives.map((alt) => {
                      const altPct = Math.round(alt.probability * 100);
                      const altStyle = CATEGORY_COLORS[alt.category];
                      return (
                        <div key={alt.category} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300">{alt.category}</span>
                            <span className="font-mono text-slate-400 tabular-nums">
                              {altPct}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-slate-500 transition-all"
                              style={{ width: `${Math.max(altPct, 2)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actionable Disposal Guidance Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Disposal Protocol & Handling Guidance
                  </h3>
                  <span className="text-xs font-medium text-emerald-400">
                    {prediction.disposalGuidance.binType}
                  </span>
                </div>

                {/* Preparation steps */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Mandatory Preparation Steps:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {prediction.disposalGuidance.prepSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Material & Impact Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-800">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <span className="text-slate-500 block text-[11px]">Resin / Standard</span>
                    <span className="font-mono text-slate-200 font-medium">
                      {prediction.resinCode || 'N/A'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <span className="text-slate-500 block text-[11px]">Contamination Hazard</span>
                    <span className="text-slate-200 font-medium">
                      {prediction.disposalGuidance.contaminationRisk} Risk
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed">
                  <span className="font-semibold block mb-0.5">Environmental Recovery Impact:</span>
                  {prediction.disposalGuidance.environmentalImpact}
                </div>

                {/* Actions bottom row */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Scan Another Item</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {onGeneratePictureReport && (
                      <button
                        onClick={() => onGeneratePictureReport(prediction)}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Generate Management Report</span>
                      </button>
                    )}
                    <button
                      onClick={onNavigateHistory}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      View in History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
