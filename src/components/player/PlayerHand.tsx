'use client';

import React from 'react';
import { UnoCard } from '@/components/card/UnoCard';
import type { Card } from '@/game/types';

interface PlayerHandProps {
  hand: Card[];
  playableCardIds: Set<string>;
  onPlayCard: (card: Card) => void;
  canCallUno: boolean;
  onCallUno: () => void;
  saidUno: boolean;
  canPass: boolean;
  onPass: () => void;
  canChallenge: boolean;
  onChallenge: () => void;
  isMyTurn: boolean;
}

export function PlayerHand({
  hand,
  playableCardIds,
  onPlayCard,
  canCallUno,
  onCallUno,
  saidUno,
  canPass,
  onPass,
  canChallenge,
  onChallenge,
  isMyTurn,
}: PlayerHandProps) {
  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Action toolbar above cards */}
      <div className="flex items-center gap-3 mb-2 sm:mb-4 z-20 flex-wrap justify-center">
        {/* CALL UNO BUTTON */}
        {canCallUno && (
          <button
            onClick={onCallUno}
            disabled={saidUno}
            className={`px-4 sm:px-6 py-2 rounded-2xl font-black italic tracking-wider text-sm sm:text-base uppercase shadow-xl transition-all duration-200 ${
              saidUno
                ? 'bg-emerald-600 text-white cursor-default opacity-90'
                : 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-neutral-950 shadow-neon-yellow hover:scale-105 active:scale-95 animate-bounce'
            }`}
          >
            {saidUno ? '✓ UNO TERPANGGIL!' : 'PANGGIL UNO!'}
          </button>
        )}

        {/* PASS BUTTON (after drawing) */}
        {canPass && isMyTurn && (
          <button
            onClick={onPass}
            className="px-4 sm:px-5 py-2 rounded-2xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            Lewati Giliran ➔
          </button>
        )}

        {/* CHALLENGE WILD +4 BUTTON */}
        {canChallenge && isMyTurn && (
          <button
            onClick={onChallenge}
            className="px-4 sm:px-5 py-2 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-neon-red hover:scale-105 active:scale-95 transition-all"
          >
            ⚡ TANTANG WILD +4
          </button>
        )}
      </div>

      {/* 3D Arc Card Fan Container */}
      <div className="w-full max-w-4xl px-2 overflow-x-auto pb-4 pt-6 scrollbar-none flex justify-start sm:justify-center items-end">
        <div className="flex -space-x-8 sm:-space-x-10 items-end min-w-max px-6">
          {hand.map((card, idx) => {
            const isPlayable = isMyTurn && playableCardIds.has(card.id);
            // Slight fan rotation across cards
            const total = hand.length;
            const mid = (total - 1) / 2;
            const rotateDeg = total > 1 ? (idx - mid) * 2.5 : 0;
            const translateY = total > 1 ? Math.abs(idx - mid) * 2 : 0;

            return (
              <div
                key={card.id}
                style={{
                  transform: `rotate(${rotateDeg}deg) translateY(${translateY}px)`,
                  zIndex: idx + 1,
                }}
                className="transition-transform duration-200 hover:!z-50"
              >
                <UnoCard
                  card={card}
                  playable={isPlayable}
                  size="md"
                  onClick={() => onPlayCard(card)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
