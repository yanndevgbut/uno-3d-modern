'use client';

import React from 'react';
import { IconInfo, IconClose } from '@/components/ui/icons';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-left space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-purple-400">
              <IconInfo size={22} />
            </div>
            <h2 className="text-xl font-black italic tracking-wide text-white uppercase drop-shadow">
              TENTANG UNO 3D
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          <p>
            Website minigame <strong className="text-white">UNO 3D Modern</strong> dirancang dengan fokus pada gameplay resmi, visual 3D berperspektif nyata, dan performa tinggi tanpa beban berlebih.
          </p>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5 font-mono text-xs">
            <div className="text-amber-400 font-bold font-sans">⚡ SPESIFIKASI TEKNOLOGI</div>
            <div>• Next.js 14 &amp; React 18</div>
            <div>• TypeScript &amp; Tailwind CSS</div>
            <div>• Pure CSS 3D (Hardware Accelerated)</div>
            <div>• WebAudio API (Zero Audio Assets)</div>
            <div>• Bot AI (Mudah, Sedang, Sulit)</div>
            <div>• Multiplayer Realtime (Socket.IO)</div>
          </div>

          <div className="text-slate-400 text-xs">
            Versi 1.0.0 • Dioptimalkan untuk layar sentuh HP dan Desktop.
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
