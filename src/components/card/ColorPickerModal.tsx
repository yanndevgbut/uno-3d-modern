'use client';

import React from 'react';
import type { CardColor } from '@/game/types';

interface ColorPickerModalProps {
  open: boolean;
  onSelectColor: (color: CardColor) => void;
}

export function ColorPickerModal({ open, onSelectColor }: ColorPickerModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black italic tracking-wide text-white drop-shadow">
            PILIH WARNA
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tentukan warna berikutnya untuk kartu Wild!
          </p>
        </div>

        {/* 4 Color Quadrants */}
        <div className="grid grid-cols-2 gap-4 max-w-[240px] mx-auto">
          <button
            onClick={() => onSelectColor('red')}
            className="h-24 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 shadow-neon-red border-2 border-red-300/40 text-white font-black text-lg transition-transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center"
          >
            <span className="drop-shadow">MERAH</span>
          </button>

          <button
            onClick={() => onSelectColor('blue')}
            className="h-24 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 shadow-neon-blue border-2 border-sky-300/40 text-white font-black text-lg transition-transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center"
          >
            <span className="drop-shadow">BIRU</span>
          </button>

          <button
            onClick={() => onSelectColor('green')}
            className="h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-neon-green border-2 border-emerald-300/40 text-white font-black text-lg transition-transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center"
          >
            <span className="drop-shadow">HIJAU</span>
          </button>

          <button
            onClick={() => onSelectColor('yellow')}
            className="h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 shadow-neon-yellow border-2 border-yellow-200/50 text-neutral-900 font-black text-lg transition-transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center"
          >
            <span className="drop-shadow">KUNING</span>
          </button>
        </div>
      </div>
    </div>
  );
}
