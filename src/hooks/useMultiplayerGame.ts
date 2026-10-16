'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { playable, activeColor } from '@/game/engine';
import type { Card, CardColor, GameAction, GameEvent, GameState, Player } from '@/game/types';
import type { SoundEffect } from './useSound';

export interface LobbyPlayer {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
}

export function useMultiplayerGame(playSound: (effect: SoundEffect) => void) {
  const socketRef = useRef<Socket | null>(null);

  const [status, setStatus] = useState<'idle' | 'in-lobby' | 'playing'>('idle');
  const [roomCode, setRoomCode] = useState<string>('');
  const [lobbyPlayers, setLobbyPlayers] = useState<LobbyPlayer[]>([]);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingWildCard, setPendingWildCard] = useState<Card | null>(null);

  // Initialize Socket connection
  useEffect(() => {
    const socket = io(typeof window !== 'undefined' ? window.location.origin : '', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setMyPlayerId(socket.id || '');
    });

    socket.on('room_created', ({ roomCode: code, player }: { roomCode: string; player: LobbyPlayer }) => {
      setRoomCode(code);
      setMyPlayerId(player.id);
      setStatus('in-lobby');
      setErrorMessage(null);
    });

    socket.on('room_joined', ({ roomCode: code, player }: { roomCode: string; player: LobbyPlayer }) => {
      setRoomCode(code);
      setMyPlayerId(player.id);
      setStatus('in-lobby');
      setErrorMessage(null);
    });

    socket.on('room_players_updated', (players: LobbyPlayer[]) => {
      setLobbyPlayers(players);
    });

    socket.on('room_error', (msg: string) => {
      setErrorMessage(msg);
      playSound('penalty');
    });

    socket.on('game_started', (initialState: GameState) => {
      setGameState(initialState);
      setStatus('playing');
      playSound('deal');
    });

    socket.on('game_state_update', ({ state, events }: { state: GameState; events?: GameEvent[] }) => {
      setGameState(state);

      if (events) {
        for (const ev of events) {
          if (ev.t === 'play') playSound('play');
          else if (ev.t === 'draw') playSound('draw');
          else if (ev.t === 'uno') playSound('uno');
          else if (ev.t === 'unoPenalty') playSound('penalty');
          else if (ev.t === 'win' || ev.t === 'matchWin') playSound('win');
          else if (ev.t === 'skip' || ev.t === 'reverse') playSound('skip');
        }
      }
    });

    socket.on('action_error', (err: string) => {
      setErrorMessage(err);
      playSound('penalty');
    });

    return () => {
      socket.disconnect();
    };
  }, [playSound]);

  // Create room
  const createRoom = useCallback((name: string, avatar: string) => {
    if (!socketRef.current) return;
    setErrorMessage(null);
    socketRef.current.emit('create_room', { name, avatar });
  }, []);

  // Join room
  const joinRoom = useCallback((code: string, name: string, avatar: string) => {
    if (!socketRef.current) return;
    setErrorMessage(null);
    socketRef.current.emit('join_room', { roomCode: code, name, avatar });
  }, []);

  // Start game (host only)
  const startGame = useCallback(() => {
    if (!socketRef.current || !roomCode) return;
    socketRef.current.emit('start_game', { roomCode });
  }, [roomCode]);

  // Leave room / return to lobby
  const leaveRoom = useCallback(() => {
    if (socketRef.current && roomCode) {
      socketRef.current.emit('leave_room', { roomCode });
    }
    setStatus('idle');
    setRoomCode('');
    setGameState(null);
    setLobbyPlayers([]);
    setErrorMessage(null);
  }, [roomCode]);

  // Dispatch action to server
  const sendGameAction = useCallback(
    (action: GameAction) => {
      if (!socketRef.current || !roomCode) return;
      socketRef.current.emit('game_action', { roomCode, action });
    },
    [roomCode],
  );

  const humanPlayer = useMemo(() => {
    if (!gameState) return null;
    return gameState.players.find((p) => p.id === myPlayerId) || gameState.players[0] || null;
  }, [gameState, myPlayerId]);

  const isMyTurn = useMemo(() => {
    if (!gameState || !humanPlayer) return false;
    return gameState.phase === 'playing' && gameState.players[gameState.current]?.id === humanPlayer.id;
  }, [gameState, humanPlayer]);

  const currentActiveColor = useMemo(() => {
    if (!gameState) return null;
    return activeColor(gameState);
  }, [gameState]);

  const playableCardIds = useMemo(() => {
    if (!gameState || !humanPlayer || !isMyTurn) return new Set<string>();
    const ids = new Set<string>();
    for (const card of humanPlayer.hand) {
      if (playable(card, gameState)) ids.add(card.id);
    }
    return ids;
  }, [gameState, humanPlayer, isMyTurn]);

  // Play card
  const playCard = useCallback(
    (card: Card) => {
      if (!isMyTurn) return;
      if (card.color === 'wild') {
        setPendingWildCard(card);
        return;
      }
      sendGameAction({ type: 'PLAY', cardId: card.id });
    },
    [isMyTurn, sendGameAction],
  );

  // Wild color selected
  const selectWildColor = useCallback(
    (color: CardColor) => {
      if (!pendingWildCard) return;
      sendGameAction({ type: 'PLAY', cardId: pendingWildCard.id, chosenColor: color });
      setPendingWildCard(null);
    },
    [pendingWildCard, sendGameAction],
  );

  // Draw card
  const drawCard = useCallback(() => {
    if (!isMyTurn) return;
    sendGameAction({ type: 'DRAW' });
  }, [isMyTurn, sendGameAction]);

  // Pass turn
  const passTurn = useCallback(() => {
    if (!isMyTurn) return;
    sendGameAction({ type: 'PASS' });
  }, [isMyTurn, sendGameAction]);

  // Call UNO
  const callUno = useCallback(() => {
    sendGameAction({ type: 'CALL_UNO' });
  }, [sendGameAction]);

  // Catch UNO
  const catchUno = useCallback(
    (targetId: string) => {
      sendGameAction({ type: 'CATCH_UNO', targetId });
    },
    [sendGameAction],
  );

  // Challenge
  const challenge = useCallback(() => {
    if (!isMyTurn) return;
    sendGameAction({ type: 'CHALLENGE' });
  }, [isMyTurn, sendGameAction]);

  // Next round
  const nextRound = useCallback(() => {
    sendGameAction({ type: 'START_GAME' });
  }, [sendGameAction]);

  // Restart match
  const restartMatch = useCallback(() => {
    sendGameAction({ type: 'RESTART' });
  }, [sendGameAction]);

  const isHost = useMemo(() => {
    return lobbyPlayers.find((p) => p.id === myPlayerId)?.isHost ?? false;
  }, [lobbyPlayers, myPlayerId]);

  return {
    status,
    roomCode,
    lobbyPlayers,
    myPlayerId,
    isHost,
    gameState,
    errorMessage,
    pendingWildCard,
    humanPlayer,
    isMyTurn,
    currentActiveColor,
    playableCardIds,
    createRoom,
    joinRoom,
    startGame,
    leaveRoom,
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
