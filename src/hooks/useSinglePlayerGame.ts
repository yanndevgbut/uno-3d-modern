'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  applyAction,
  createGameState,
  playable,
  activeColor,
} from '@/game/engine';
import { aiChooseAction, type Difficulty } from '@/game/ai';
import type { Card, CardColor, GameAction, GameState } from '@/game/types';
import type { SoundEffect } from './useSound';

interface GameSetup {
  playerName: string;
  playerAvatar: string;
  botCount: 1 | 2 | 3;
  difficulty: Difficulty;
  targetScore: number;
}

const BOT_PRESETS = [
  { name: 'Bot Kucing', avatar: '🐱' },
  { name: 'Bot Robot', avatar: '🤖' },
  { name: 'Bot Rubah', avatar: '🦊' },
];

export function useSinglePlayerGame(
  setup: GameSetup,
  playSound: (effect: SoundEffect) => void,
) {
  const [state, setState] = useState<GameState>(() => {
    const players = [
      { id: 'human-1', name: setup.playerName || 'Pemain', avatar: setup.playerAvatar || '😎', isHost: true },
      ...Array.from({ length: setup.botCount }).map((_, i) => ({
        id: `bot-${i + 1}`,
        name: BOT_PRESETS[i]?.name ?? `Bot ${i + 1}`,
        avatar: BOT_PRESETS[i]?.avatar ?? '🤖',
        isHost: false,
      })),
    ];
    return createGameState(players, { targetScore: setup.targetScore });
  });

  const [pendingWildCard, setPendingWildCard] = useState<Card | null>(null);
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);

  const humanPlayer = state.players.find((p) => p.id === 'human-1') || state.players[0]!;
  const isHumanTurn = state.phase === 'playing' && state.players[state.current]?.id === humanPlayer.id;

  const currentActiveColor = useMemo(() => activeColor(state), [state]);

  const playableCardIds = useMemo(() => {
    if (!isHumanTurn) return new Set<string>();
    const ids = new Set<string>();
    for (const card of humanPlayer.hand) {
      if (playable(card, state)) ids.add(card.id);
    }
    return ids;
  }, [isHumanTurn, humanPlayer.hand, state]);

  // Dispatch game action with sound integration
  const dispatchAction = useCallback(
    (action: GameAction, actorId?: string) => {
      setState((prev) => {
        const res = applyAction(prev, action, actorId);
        if (res.error) {
          playSound('penalty');
          return prev;
        }

        // Sound triggers based on action
        if (action.type === 'PLAY') {
          playSound('play');
        } else if (action.type === 'DRAW') {
          playSound('draw');
        } else if (action.type === 'CALL_UNO') {
          playSound('uno');
        } else if (action.type === 'CATCH_UNO') {
          playSound('penalty');
        }

        // Event sound reactions
        for (const ev of res.events) {
          if (ev.t === 'win' || ev.t === 'matchWin') {
            playSound('win');
          } else if (ev.t === 'skip' || ev.t === 'reverse') {
            playSound('skip');
          }
        }

        return res.state;
      });
    },
    [playSound],
  );

  // Play a card handler
  const playCard = useCallback(
    (card: Card) => {
      if (!isHumanTurn) return;
      if (card.color === 'wild') {
        setPendingWildCard(card);
        return;
      }
      dispatchAction({ type: 'PLAY', cardId: card.id }, humanPlayer.id);
    },
    [isHumanTurn, dispatchAction, humanPlayer.id],
  );

  // Wild color selected
  const selectWildColor = useCallback(
    (color: CardColor) => {
      if (!pendingWildCard) return;
      playSound('wild');
      dispatchAction(
        { type: 'PLAY', cardId: pendingWildCard.id, chosenColor: color },
        humanPlayer.id,
      );
      setPendingWildCard(null);
    },
    [pendingWildCard, dispatchAction, humanPlayer.id, playSound],
  );

  // Draw card handler
  const drawCard = useCallback(() => {
    if (!isHumanTurn) return;
    dispatchAction({ type: 'DRAW' }, humanPlayer.id);
  }, [isHumanTurn, dispatchAction, humanPlayer.id]);

  // Pass turn handler
  const passTurn = useCallback(() => {
    if (!isHumanTurn) return;
    dispatchAction({ type: 'PASS' }, humanPlayer.id);
  }, [isHumanTurn, dispatchAction, humanPlayer.id]);

  // Call UNO handler
  const callUno = useCallback(() => {
    dispatchAction({ type: 'CALL_UNO' }, humanPlayer.id);
  }, [dispatchAction, humanPlayer.id]);

  // Catch UNO on opponent
  const catchUno = useCallback(
    (targetId: string) => {
      dispatchAction({ type: 'CATCH_UNO', targetId }, humanPlayer.id);
    },
    [dispatchAction, humanPlayer.id],
  );

  // Challenge Wild +4
  const challenge = useCallback(() => {
    if (!isHumanTurn) return;
    dispatchAction({ type: 'CHALLENGE' }, humanPlayer.id);
  }, [isHumanTurn, dispatchAction, humanPlayer.id]);

  // Next round
  const nextRound = useCallback(() => {
    setState((prev) => {
      const fresh = createGameState(
        prev.players.map(({ id, name, avatar, isHost }) => ({ id, name, avatar, isHost })),
        { targetScore: prev.targetScore },
      );
      // carry over scores
      fresh.roundScoresBy = { ...prev.roundScoresBy };
      return fresh;
    });
    playSound('deal');
  }, [playSound]);

  // Restart match from 0
  const restartMatch = useCallback(() => {
    setState(() => {
      const fresh = createGameState(
        state.players.map(({ id, name, avatar, isHost }) => ({ id, name, avatar, isHost })),
        { targetScore: setup.targetScore },
      );
      return fresh;
    });
    playSound('deal');
  }, [state.players, setup.targetScore, playSound]);

  // AI Turn Loop
  useEffect(() => {
    if (state.phase !== 'playing') return;
    const currentActivePlayer = state.players[state.current];
    if (!currentActivePlayer || currentActivePlayer.id === humanPlayer.id) return;

    // AI bot acts after natural delay
    const delay = setup.difficulty === 'easy' ? 900 : setup.difficulty === 'medium' ? 750 : 600;

    botTimerRef.current = setTimeout(() => {
      // Opportunistic catch UNO by bot if human forgot
      if (state.unoCatchable && state.unoCatchable === humanPlayer.id) {
        const catchProbability = setup.difficulty === 'easy' ? 0.35 : setup.difficulty === 'medium' ? 0.65 : 0.9;
        if (Math.random() < catchProbability) {
          dispatchAction({ type: 'CATCH_UNO', targetId: humanPlayer.id }, currentActivePlayer.id);
          return;
        }
      }

      // Check if bot should call UNO before moving
      if (currentActivePlayer.hand.length === 2) {
        const willCall = setup.difficulty === 'easy' ? Math.random() < 0.6 : Math.random() < 0.95;
        if (willCall && !currentActivePlayer.saidUno) {
          // Bot calls UNO
          dispatchAction({ type: 'CALL_UNO' }, currentActivePlayer.id);
        }
      }

      const botAction = aiChooseAction(state, setup.difficulty);
      dispatchAction(botAction, currentActivePlayer.id);

      // If bot drew and card is unplayable -> pass
      if (botAction.type === 'DRAW') {
        setTimeout(() => {
          setState((latest) => {
            if (latest.players[latest.current]?.id === currentActivePlayer.id && latest.drawnThisTurn) {
              const res = applyAction(latest, { type: 'PASS' }, currentActivePlayer.id);
              return res.state;
            }
            return latest;
          });
        }, 300);
      }
    }, delay);

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [state, humanPlayer.id, setup.difficulty, dispatchAction]);

  return {
    state,
    humanPlayer,
    isHumanTurn,
    currentActiveColor,
    playableCardIds,
    pendingWildCard,
    playCard,
    selectWildColor,
    drawCard,
    passTurn,
    callUno,
    catchUno,
    challenge,
    nextRound,
    restartMatch,
  };
}
