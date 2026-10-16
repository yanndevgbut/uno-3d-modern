'use client';

import React from 'react';
import type { Player } from '@/game/types';

interface PlayerSeatProps {
  player: Player;
  isCurrentTurn: boolean;
  position: 'top' | 'left' | 'right' | 'bottom';
  canCatchUno?: boolean;
  onCatchUno?: (targetId: string) => void;
}

export function PlayerSeat({
  player,
  isCurrentTurn,
  position,
  canCatchUno = false,
  onCatchUno,
}: PlayerSeatProps) {
  const isBottom = position === 'bottom';

  return (
    <div
      className={`relative flex items-center gap-3 p-2 sm:p-3 rounded-2xl transition-all duration-300
        ${
          isCurrentTurn
            ? 'bg-amber-400/10 border-2 border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.3)] scale-105'
            : 'bg-slate-900/60 border border-slate-700/60'
        }
        ${isBottom ? 'flex-row' : position === 'left' ? 'flex-col sm:flex-row' : position === 'right' ? 'flex-col sm:flex-row-reverse' : 'flex-row'}
      `}
    >
      {/* Avatar Container */}
      <div className="relative">
        <div
          className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-lg border-2 transition-transform ${
            isCurrentTurn
              ? 'border-amber-400 bg-gradient-to-tr from-amber-600 to-yellow-400'
              : 'border-slate-700 bg-slate-800'
          }`}
        >
          <span>{player.avatar || '👤'}</span>
        </div>

        {/* Turn Pulse Badge */}
        {isCurrentTurn && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500" />
          </span>
        )}
      </div>

      {/* Info column */}
      <div className="flex flex-col min-w-[70px]">
        <div className="flex items-center gap-1.5">
          <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[100px]">
            {player.name}
          </span>
          {player.isHost && (
            <span className="text-[9px] bg-sky-500/20 text-sky-400 px-1.5 py-0.2 rounded font-mono font-semibold">
              Host
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          {/* Card Count Pill */}
          <span className="text-[11px] font-mono font-medium text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
            🂠 {player.hand.length} kartu
          </span>

          {/* UNO Alert pill */}
          {player.hand.length === 1 && (
            <span className="text-[10px] font-black italic bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse shadow-neon-red">
              UNO!
            </span>
          )}
        </div>

        {/* CATCH UNO BUTTON (penalty if they forgot to call) */}
        {canCatchUno && (
          <button
            onClick={() => onCatchUno?.(player.id)}
            className="mt-1.5 text-[10px] font-black uppercase bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white px-2 py-1 rounded-lg shadow-neon-red animate-bounce"
          >
            TANGKAP UNO! (+2)
          </button>
        )}
      </div>

      {/* Opponent mini card fan view (top/left/right) */}
      {!isBottom && (
        <div className="flex -space-x-3 items-center ml-1">
          {Array.from({ length: Math.min(5, player.hand.length) }).map((_, i) => (
            <div
              key={i}
              className="w-5 h-8 sm:w-6 sm:h-9 rounded-[4px] bg-gradient-to-br from-red-700 via-neutral-900 to-black border border-white/20 shadow-md transform"
              style={{ transform: `rotate(${(i - 2) * 6}deg)` }}
            />
          ))}
          {player.hand.length > 5 && (
            <span className="text-[10px] text-slate-400 font-mono ml-1">
              +{player.hand.length - 5}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
