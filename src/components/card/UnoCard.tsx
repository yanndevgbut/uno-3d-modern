'use client';

import React from 'react';
import type { Card, CardColor } from '@/game/types';

interface UnoCardProps {
  card: Card;
  faceDown?: boolean;
  playable?: boolean;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

const COLOR_MAP: Record<CardColor, { bg: string; text: string; ring: string; border: string }> = {
  red: {
    bg: 'bg-gradient-to-br from-red-500 via-red-600 to-rose-700',
    text: 'text-red-500',
    ring: 'shadow-neon-red ring-2 ring-red-400',
    border: 'border-red-400/30',
  },
  blue: {
    bg: 'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-800',
    text: 'text-blue-500',
    ring: 'shadow-neon-blue ring-2 ring-sky-400',
    border: 'border-blue-400/30',
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-500 via-green-600 to-teal-800',
    text: 'text-green-500',
    ring: 'shadow-neon-green ring-2 ring-emerald-400',
    border: 'border-green-400/30',
  },
  yellow: {
    bg: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600',
    text: 'text-amber-500',
    ring: 'shadow-neon-yellow ring-2 ring-yellow-300',
    border: 'border-yellow-300/40',
  },
};

export const UnoCard = React.memo(function UnoCard({
  card,
  faceDown = false,
  playable = false,
  selected = false,
  onClick,
  size = 'md',
  className = '',
  style = {},
}: UnoCardProps) {
  const sizeClasses = {
    sm: 'w-12 h-18 text-xs',
    md: 'w-16 h-24 sm:w-20 sm:h-28 text-sm',
    lg: 'w-22 h-32 sm:w-26 sm:h-38 text-base',
  }[size];

  const isWild = card.color === 'wild';
  const colorConf = !isWild ? COLOR_MAP[card.color as CardColor] : null;

  return (
    <div
      onClick={playable || faceDown ? onClick : undefined}
      style={style}
      className={`card-3d-wrap relative select-none cursor-pointer group transition-all duration-200
        ${sizeClasses}
        ${faceDown ? '' : ''}
        ${playable ? 'hover:-translate-y-4 hover:scale-105 active:scale-95' : 'cursor-default'}
        ${selected ? '-translate-y-5 scale-105 ring-4 ring-white shadow-2xl' : ''}
        ${className}
      `}
    >
      {/* 3D Depth edge / card thickness effect */}
      <div
        className="absolute inset-0 rounded-xl bg-slate-900 border border-white/10 shadow-3d-card pointer-events-none"
        style={{ transform: 'translateZ(-2px)' }}
      />

      {faceDown ? (
        /* Card Back Face */
        <div className="card-face w-full h-full rounded-xl bg-gradient-to-br from-slate-900 via-neutral-900 to-black p-1 border-2 border-slate-700 shadow-xl flex items-center justify-center">
          <div className="w-full h-full rounded-lg bg-gradient-to-tr from-red-600 via-yellow-500 to-blue-600 p-[2px] flex items-center justify-center">
            <div className="w-full h-full rounded-[6px] bg-neutral-950 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Ellipse accent */}
              <div className="absolute w-[140%] h-[55%] -rotate-28 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-black italic tracking-tighter text-sm sm:text-base drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  UNO
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Card Front Face */
        <div
          className={`card-face w-full h-full rounded-xl p-[3px] border-2 shadow-2xl overflow-hidden flex flex-col justify-between transition-shadow
            ${isWild ? 'bg-gradient-to-br from-neutral-900 via-slate-800 to-black border-slate-500/40' : `${colorConf?.bg} ${colorConf?.border}`}
            ${playable ? (isWild ? 'ring-2 ring-white/60 shadow-[0_0_20px_rgba(255,255,255,0.4)]' : colorConf?.ring) : 'opacity-90'}
          `}
        >
          {/* Top corner label */}
          <div className="flex items-center justify-between px-1 text-white font-black italic leading-none drop-shadow">
            <CornerLabel kind={card.kind} color={card.color} />
          </div>

          {/* Central Oval Motif */}
          <div className="relative mx-auto my-auto w-[82%] h-[68%] rounded-full bg-white/95 flex items-center justify-center shadow-inner overflow-hidden -rotate-18">
            {isWild ? (
              <div className="w-full h-full relative grid grid-cols-2 grid-rows-2">
                <div className="bg-red-500" />
                <div className="bg-blue-500" />
                <div className="bg-yellow-400" />
                <div className="bg-emerald-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-neutral-950 font-black italic text-base sm:text-xl drop-shadow">
                    {card.kind.type === 'wild4' ? '+4' : 'WILD'}
                  </span>
                </div>
              </div>
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${colorConf?.text} font-black italic`}>
                <CenterSymbol kind={card.kind} />
              </div>
            )}
          </div>

          {/* Bottom corner label (rotated) */}
          <div className="flex items-center justify-between px-1 text-white font-black italic leading-none drop-shadow rotate-180">
            <CornerLabel kind={card.kind} color={card.color} />
          </div>
        </div>
      )}
    </div>
  );
});

function CornerLabel({ kind }: { kind: Card['kind']; color: Card['color'] }) {
  if (kind.type === 'number') return <span className="text-xs sm:text-sm font-black">{kind.value}</span>;
  if (kind.type === 'draw2') return <span className="text-[10px] sm:text-xs font-black">+2</span>;
  if (kind.type === 'wild4') return <span className="text-[10px] sm:text-xs font-black">+4</span>;
  if (kind.type === 'wild') return <span className="text-[9px] font-black">★</span>;
  if (kind.type === 'skip') return <span className="text-[11px] font-black">⊘</span>;
  if (kind.type === 'reverse') return <span className="text-[11px] font-black">⇄</span>;
  return null;
}

function CenterSymbol({ kind }: { kind: Card['kind'] }) {
  if (kind.type === 'number') {
    return (
      <span className="text-2xl sm:text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
        {kind.value}
      </span>
    );
  }
  if (kind.type === 'draw2') {
    return (
      <span className="text-xl sm:text-3xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
        +2
      </span>
    );
  }
  if (kind.type === 'skip') {
    return (
      <svg className="w-8 h-8 sm:w-11 sm:h-11 drop-shadow" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 0 1-5.06-1.88l11.14-11.14A7.994 7.994 0 0 1 12 20zm5.06-1.88L5.92 6.98A7.994 7.994 0 0 1 12 4a8 8 0 0 1 5.06 14.12z" />
      </svg>
    );
  }
  if (kind.type === 'reverse') {
    return (
      <div className="flex flex-col items-center justify-center font-bold text-xl sm:text-2xl leading-none">
        <span>⮂</span>
        <span className="-mt-1">⮀</span>
      </div>
    );
  }
  return null;
}
