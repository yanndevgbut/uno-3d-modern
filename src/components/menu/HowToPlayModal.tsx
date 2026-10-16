'use client';

import React from 'react';
import { IconHelp, IconClose } from '@/components/ui/icons';

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

export function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-left space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400">
              <IconHelp size={22} />
            </div>
            <h2 className="text-xl font-black italic tracking-wide text-white uppercase drop-shadow">
              CARA BERMAIN UNO
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto space-y-4 pr-1 text-xs sm:text-sm text-slate-300">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <h3 className="font-black text-amber-400 text-sm mb-1 uppercase">🎯 TUJUAN PERMAINAN</h3>
            <p>
              Jadilah pemain pertama yang menghabiskan seluruh kartu di tangan. Setiap putaran mengumpulkan skor dari sisa kartu di tangan lawan hingga mencapai target poin (200 poin).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="font-black text-emerald-400 text-sm uppercase">🃏 ATURAN COCOK KARTU</h3>
            <p>
              Di giliran Anda, letakkan 1 kartu yang cocok dengan kartu teratas di tumpukan Buang berdasarkan:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
              <li><strong className="text-white">Warna yang sama</strong> (Merah, Biru, Hijau, Kuning)</li>
              <li><strong className="text-white">Angka yang sama</strong> (0 sampai 9)</li>
              <li><strong className="text-white">Simbol aksi yang sama</strong> (Skip, Reverse, Draw Two)</li>
              <li>Kartu <strong className="text-white">Wild</strong> atau <strong className="text-white">Wild +4</strong> dapat dimainkan kapan saja.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="font-black text-sky-400 text-sm uppercase">⚡ KARTU SPESIAL</h3>
            <div className="space-y-1.5 text-slate-300">
              <div><strong className="text-rose-400">Skip (⊘):</strong> Giliran pemain berikutnya dilewati.</div>
              <div><strong className="text-blue-400">Reverse (⇄):</strong> Arah putaran berbalik (searah ➔ berlawanan).</div>
              <div><strong className="text-amber-400">Draw Two (+2):</strong> Pemain berikutnya wajib mengambil 2 kartu dan kehilangan giliran.</div>
              <div><strong className="text-purple-400">Wild:</strong> Bebas memilih warna berikutnya yang harus dimainkan.</div>
              <div><strong className="text-red-400">Wild Draw Four (+4):</strong> Bebas pilih warna, dan pemain berikutnya wajib ambil 4 kartu + dilewati! (Dapat ditantang jika menduga lawan punya warna yang sama).</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <h3 className="font-black text-rose-400 text-sm mb-1 uppercase">🚨 ATURAN PANGGIL UNO!</h3>
            <p>
              Saat Anda hanya memiliki <strong className="text-white">1 kartu tersisa</strong>, Anda <strong className="text-amber-400">WAJIB</strong> menekan tombol <em>&ldquo;PANGGIL UNO!&rdquo;</em>. Jika pemain lain menekan tombol <em>&ldquo;TANGKAP UNO!&rdquo;</em> sebelum Anda memanggilnya, Anda dikenakan penalti mengambil 2 kartu!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors"
        >
          Mengerti, Ayo Main!
        </button>
      </div>
    </div>
  );
}
