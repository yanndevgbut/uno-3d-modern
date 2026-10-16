'use client';

import React, { useEffect, useState } from 'react';
import { IconSettings, IconClose, IconVolume, IconVolumeMute } from '@/components/ui/icons';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export function SettingsModal({
  open,
  onClose,
  soundEnabled,
  onToggleSound,
}: SettingsModalProps) {
  const [lowPerf, setLowPerf] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('uno_perf_mode');
      if (stored === 'low') {
        setLowPerf(true);
        document.body.classList.add('perf-low');
      }
    } catch (_) {}
  }, []);

  const togglePerf = () => {
    const next = !lowPerf;
    setLowPerf(next);
    try {
      localStorage.setItem('uno_perf_mode', next ? 'low' : 'normal');
      if (next) {
        document.body.classList.add('perf-low');
      } else {
        document.body.classList.remove('perf-low');
      }
    } catch (_) {}
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-left space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
              <IconSettings size={22} />
            </div>
            <h2 className="text-xl font-black italic tracking-wide text-white uppercase drop-shadow">
              PENGATURAN
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                {soundEnabled ? <IconVolume size={18} /> : <IconVolumeMute size={18} />}
              </div>
              <div>
                <div className="text-sm font-bold text-white">Efek Suara</div>
                <div className="text-xs text-slate-400">Audio synthesized WebAudio</div>
              </div>
            </div>
            <button
              onClick={onToggleSound}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Low Perf Mode Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-sm font-bold text-white">Mode Performa Ringan</div>
              <div className="text-xs text-slate-400">Matikan efek bayangan/blur untuk HP kentang</div>
            </div>
            <button
              onClick={togglePerf}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                lowPerf ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  lowPerf ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
