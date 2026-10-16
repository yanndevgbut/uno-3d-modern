'use client';

import React from 'react';
import { UnoCard } from '@/components/card/UnoCard';
import type { Card, CardColor, Direction } from '@/game/types';

interface CardPilesProps {
  topCard: Card | null;
  activeColor: CardColor | null;
  deckCount: number;
  canDraw: boolean;
  onDraw: () => void;
  direction: Direction;
  pendingDraw: number;
}

const COLOR_GLOW: Record<CardColor, string> = {
  red: 'shadow-[0_0_50px_rgba(239,35,60,0.4)] border-red-500/60',
  blue: 'shadow-[0_0_50px_rgba(0,119,182,0.4)] border-sky-500/60',
  green: 'shadow-[0_0_50px_rgba(42,157,143,0.4)] border-emerald-500/60',
  yellow: 'shadow-[0_0_50px_rgba(255,183,3,0.4)] border-yellow-400/60',
};

const COLOR_NAME_ID: Record<CardColor, string> = {
  red: 'MERAH',
  blue: 'BIRU',
  green: 'HIJAU',
  yellow: 'KUNING',
};

export function CardPiles({
  topCard,
  activeColor,
  deckCount,
  canDraw,
  onDraw,
  direction,
  pendingDraw,
}: CardPilesProps) {
  const glow = activeColor ? COLOR_GLOW[activeColor] : 'border-white/10';

  return (
    <div className="relative flex items-center justify-center gap-6 sm:gap-12 my-2 sm:my-6">
      {/* Direction Orbit Ring Indicator */}
      <div className="absolute -inset-4 sm:-inset-8 rounded-full border-2 border-dashed border-white/10 pointer-events-none flex items-center justify-center animate-spin-slow">
        <div
          className={`text-xs sm:text-sm font-black text-slate-400/40 tracking-widest uppercase transition-transform duration-500 ${
            direction === 1 ? '' : 'scale-x-[-1]'
          }`}
        >
          {direction === 1 ? '↻ PUTARAN SEARAH JARUM JAM' : '↺ PUTARAN BERLAWANAN ARAH'}
        </div>
      </div>

      {/* DRAW PILE (DECK) */}
      <div className="flex flex-col items-center">
        <div
          onClick={canDraw ? onDraw : undefined}
          className={`relative group ${
            canDraw ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-80'
          }`}
        >
          {/* Deck thickness layers */}
          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-xl bg-slate-900 border border-slate-800 shadow-md pointer-events-none" />
          <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-xl bg-slate-950 border border-slate-700 shadow pointer-events-none" />

          {/* Top of Draw Pile */}
          <UnoCard
            card={{ id: 'deck-top', color: 'wild', kind: { type: 'wild' } }}
            faceDown
            size="md"
            className={canDraw ? 'ring-2 ring-emerald-400 shadow-neon-green' : ''}
          />

          {canDraw && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap animate-bounce">
              {pendingDraw > 0 ? `AMBIL +${pendingDraw}` : 'AMBIL'}
            </div>
          )}
        </div>
        <span className="text-[11px] text-slate-400 mt-2 font-mono font-medium">
          Sisa: {deckCount}
        </span>
      </div>

      {/* DISCARD PILE */}
      <div className="flex flex-col items-center">
        <div className={`relative p-2 rounded-2xl border-2 transition-all duration-300 ${glow}`}>
          {/* Phantom previous card for 3D stack texture */}
          <div className="absolute inset-2 -rotate-6 rounded-xl bg-black/40 border border-white/5 pointer-events-none" />

          {topCard ? (
            <UnoCard card={topCard} size="md" className="rotate-2" />
          ) : (
            <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-xs text-slate-500">
              Kosong
            </div>
          )}

          {/* Active color badge */}
          {activeColor && (
            <div
              className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase text-white shadow-lg drop-shadow border border-white/20 whitespace-nowrap ${
                activeColor === 'red'
                  ? 'bg-red-600'
                  : activeColor === 'blue'
                  ? 'bg-blue-600'
                  : activeColor === 'green'
                  ? 'bg-emerald-600'
                  : 'bg-amber-500 text-neutral-950'
              }`}
            >
              WARNA: {COLOR_NAME_ID[activeColor]}
            </div>
          )}
        </div>
        <span className="text-[11px] text-slate-400 mt-2 font-mono font-medium">
          Buang
        </span>
      </div>
    </div>
  );
}
