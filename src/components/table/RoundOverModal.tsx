'use client';

import React, { useEffect } from 'react';
import { IconTrophy, IconRotate, IconArrowLeft } from '@/components/ui/icons';
import type { GameState } from '@/game/types';

interface RoundOverModalProps {
  state: GameState;
  onNextRound: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export function RoundOverModal({
  state,
  onNextRound,
  onRestart,
  onExit,
}: RoundOverModalProps) {
  if (state.phase !== 'roundOver' && state.phase !== 'matchOver') return null;

  const isMatchOver = state.phase === 'matchOver';
  const winner = state.players.find((p) => p.id === state.winnerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6">
        {/* Header icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl sm:text-4xl shadow-neon-yellow">
            <IconTrophy size={36} className="text-slate-950" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black italic tracking-wide text-white uppercase drop-shadow">
            {isMatchOver ? 'JUARA PERTANDINGAN!' : 'RONDE SELESAI!'}
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            Pemenang:{' '}
            <span className="font-bold text-amber-400">
              {winner?.name ?? 'Pemain'}
            </span>
          </p>
        </div>

        {/* Scoreboard table */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-left space-y-2">
          <div className="flex justify-between text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-2">
            <span>PEMAIN</span>
            <span>TOTAL SKOR</span>
          </div>
          {state.players.map((p) => {
            const score = state.roundScoresBy[p.id] ?? 0;
            const isRoundWinner = p.id === state.winnerId;

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between text-sm py-1.5 px-2 rounded-xl transition-colors ${
                  isRoundWinner ? 'bg-amber-400/10 text-amber-300 font-bold' : 'text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{p.avatar}</span>
                  <span className="truncate max-w-[140px]">{p.name}</span>
                  {isRoundWinner && (
                    <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                      MENANG
                    </span>
                  )}
                </div>
                <span className="font-mono font-bold">{score} pts</span>
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {isMatchOver ? (
            <button
              onClick={onRestart}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-neon-yellow transition-transform active:scale-95"
            >
              <IconRotate size={18} />
              Main Ulang
            </button>
          ) : (
            <button
              onClick={onNextRound}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-neon-green transition-transform active:scale-95"
            >
              <IconRotate size={18} />
              Ronde Berikutnya
            </button>
          )}

          <button
            onClick={onExit}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-transform active:scale-95"
          >
            <IconArrowLeft size={18} />
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
