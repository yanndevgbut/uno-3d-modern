'use client';

import React from 'react';
import { PlayerSeat } from '@/components/player/PlayerSeat';
import { PlayerHand } from '@/components/player/PlayerHand';
import { CardPiles } from '@/components/table/CardPiles';
import { ColorPickerModal } from '@/components/card/ColorPickerModal';
import { RoundOverModal } from '@/components/table/RoundOverModal';
import { IconArrowLeft, IconVolume, IconVolumeMute, IconSettings } from '@/components/ui/icons';
import type { GameState, Card, CardColor } from '@/game/types';

interface GameTableProps {
  state: GameState;
  humanPlayerId: string;
  isMyTurn: boolean;
  activeColor: CardColor | null;
  playableCardIds: Set<string>;
  pendingWildCard: Card | null;
  onPlayCard: (card: Card) => void;
  onSelectWildColor: (color: CardColor) => void;
  onDrawCard: () => void;
  onPassTurn: () => void;
  onCallUno: () => void;
  onCatchUno: (targetId: string) => void;
  onChallenge: () => void;
  onNextRound: () => void;
  onRestartMatch: () => void;
  onExit: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
}

export function GameTable({
  state,
  humanPlayerId,
  isMyTurn,
  activeColor,
  playableCardIds,
  pendingWildCard,
  onPlayCard,
  onSelectWildColor,
  onDrawCard,
  onPassTurn,
  onCallUno,
  onCatchUno,
  onChallenge,
  onNextRound,
  onRestartMatch,
  onExit,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
}: GameTableProps) {
  const humanPlayer = state.players.find((p) => p.id === humanPlayerId) || state.players[0]!;
  const opponents = state.players.filter((p) => p.id !== humanPlayerId);

  const topCard = state.top?.card ?? (state.discard.length > 0 ? state.discard[state.discard.length - 1]! : null);

  const canDraw = isMyTurn && !state.drawnThisTurn;
  const canPass = isMyTurn && state.drawnThisTurn;
  const canCallUno = isMyTurn && (humanPlayer.hand.length === 1 || humanPlayer.hand.length === 2);
  const canChallenge = isMyTurn && state.pendingDraw === 4;

  const currentTurnPlayer = state.players[state.current];

  return (
    <div className="relative w-full min-h-screen bg-slate-950 flex flex-col justify-between overflow-hidden scene-3d">
      {/* Top Navigation Bar */}
      <header className="relative z-30 w-full px-4 py-3 flex items-center justify-between border-b border-white/5 bg-slate-900/60 backdrop-blur-md">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors"
        >
          <IconArrowLeft size={16} />
          <span>Menu</span>
        </button>

        {/* Turn Status Banner */}
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full text-xs sm:text-sm font-black italic tracking-wide transition-all shadow-md ${
              isMyTurn
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 animate-pulse shadow-neon-yellow'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {isMyTurn ? 'GILIRAN ANDA!' : `Giliran: ${currentTurnPlayer?.name ?? '...'}`}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            aria-label="Toggle Sound"
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            {soundEnabled ? <IconVolume size={18} /> : <IconVolumeMute size={18} />}
          </button>
          <button
            onClick={onOpenSettings}
            aria-label="Open Settings"
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <IconSettings size={18} />
          </button>
        </div>
      </header>

      {/* Main 3D Game Felt Area */}
      <main className="relative flex-1 w-full max-w-6xl mx-auto flex flex-col justify-between items-center p-2 sm:p-4 table-felt rounded-3xl my-2 shadow-felt-table">
        {/* Opponents Area (Top / Left / Right) */}
        <div className="w-full flex justify-around items-center pt-2 px-2 flex-wrap gap-2">
          {opponents.map((opp, idx) => {
            const isTurn = state.current === state.players.indexOf(opp);
            const canCatch = state.unoCatchable === opp.id;

            return (
              <PlayerSeat
                key={opp.id}
                player={opp}
                isCurrentTurn={isTurn}
                position={idx === 0 ? 'top' : idx === 1 ? 'left' : 'right'}
                canCatchUno={canCatch}
                onCatchUno={onCatchUno}
              />
            );
          })}
        </div>

        {/* Center Arena: Draw Pile & Discard Pile */}
        <div className="relative w-full flex items-center justify-center my-auto py-2">
          <CardPiles
            topCard={topCard}
            activeColor={activeColor}
            deckCount={state.deck.length}
            canDraw={canDraw}
            onDraw={onDrawCard}
            direction={state.direction}
            pendingDraw={state.pendingDraw}
          />
        </div>

        {/* Bottom Arena: Human Player Seat + Hand */}
        <div className="w-full flex flex-col items-center pb-2">
          {/* Player Seat Summary */}
          <div className="mb-2">
            <PlayerSeat
              player={humanPlayer}
              isCurrentTurn={isMyTurn}
              position="bottom"
            />
          </div>

          {/* Cards Fan */}
          <PlayerHand
            hand={humanPlayer.hand}
            playableCardIds={playableCardIds}
            onPlayCard={onPlayCard}
            canCallUno={canCallUno}
            onCallUno={onCallUno}
            saidUno={humanPlayer.saidUno}
            canPass={canPass}
            onPass={onPassTurn}
            canChallenge={canChallenge}
            onChallenge={onChallenge}
            isMyTurn={isMyTurn}
          />
        </div>
      </main>

      {/* Wild Color Picker Modal */}
      <ColorPickerModal
        open={Boolean(pendingWildCard)}
        onSelectColor={onSelectWildColor}
      />

      {/* Round & Match Over Celebration Modal */}
      <RoundOverModal
        state={state}
        onNextRound={onNextRound}
        onRestart={onRestartMatch}
        onExit={onExit}
      />
    </div>
  );
}
