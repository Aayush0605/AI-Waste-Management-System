import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Monitor, Download, CheckCircle, Terminal, FileCode, X, Laptop } from 'lucide-react';

interface DesktopAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopAppModal: React.FC<DesktopAppModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [downloadingZip, setDownloadingZip] = useState(false);

  if (!isOpen) return null;

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAllDesktopScripts = () => {
    setDownloadingZip(true);
    // Download the key batch and python packaging files
    downloadFile('/scripts/build_windows_exe.bat', 'build_windows_exe.bat');
    setTimeout(() => downloadFile('/scripts/run_desktop.bat', 'run_desktop.bat'), 300);
    setTimeout(() => downloadFile('/scripts/app_desktop.py', 'app_desktop.py'), 600);
    setTimeout(() => downloadFile('/scripts/requirements.txt', 'requirements.txt'), 900);
    setTimeout(() => setDownloadingZip(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                SmartWaste AI Desktop & .EXE Distribution
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Install directly as a native standalone desktop app or compile a Windows .EXE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option 1: Native Standalone PWA Desktop App */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <Monitor className="w-4 h-4" />
              <span>Option 1: One-Click Desktop App (Windows / macOS / Linux)</span>
            </div>
            {isInstalled && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Installed on this device</span>
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Installs SmartWaste AI directly to your operating system desktop and start menu. Runs in an isolated native window without browser address bars, with offline cache and SQLite storage.
          </p>

          <div className="pt-1 flex items-center gap-3">
            {isInstalled ? (
              <div className="text-xs text-slate-400 italic">
                Application is currently running or registered as a native desktop app.
              </div>
            ) : isInstallable ? (
              <button
                onClick={install}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Install Desktop App Now</span>
              </button>
            ) : (
              <div className="text-xs text-slate-400">
                To install on desktop: In Chrome or Edge, click the <strong>Install</strong> icon in the address bar or select <em>Settings &gt; Install SmartWaste AI</em>.
              </div>
            )}
          </div>
        </div>

        {/* Option 2: Native Windows .EXE Compiler Suite */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Option 2: Standalone Windows .EXE Packaging Suite</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
              PyInstaller + PyWebView
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Build an independent <code>SmartWasteAI.exe</code> binary for Windows with an embedded local SQLite database and offline inference engine.
          </p>

          {/* Steps */}
          <div className="space-y-2 text-xs text-slate-400 bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 font-mono">
            <div className="text-slate-300 font-sans font-semibold mb-1">
              Automated Build Instructions:
            </div>
            <div>1. Click &quot;Download .EXE Packaging Kit&quot; below.</div>
            <div>2. Place <code>build_windows_exe.bat</code> and <code>app_desktop.py</code> in a folder.</div>
            <div>3. Double-click <code>build_windows_exe.bat</code> — it installs PyInstaller and compiles:</div>
            <div className="text-emerald-400 pl-4">dist\SmartWasteAI\SmartWasteAI.exe</div>
          </div>

          <div className="pt-1 flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadAllDesktopScripts}
              disabled={downloadingZip}
              className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-cyan-500 disabled:opacity-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingZip ? 'Downloading Files...' : 'Download .EXE Packaging Kit (Batch + Python)'}</span>
            </button>
            <a
              href="/scripts/build_windows_exe.bat"
              download="build_windows_exe.bat"
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              build_windows_exe.bat
            </a>
            <span className="text-slate-600">·</span>
            <a
              href="/scripts/app_desktop.py"
              download="app_desktop.py"
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              app_desktop.py
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
