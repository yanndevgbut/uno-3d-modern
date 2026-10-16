// ---- Core UNO types shared by client, server, and AI ----

export type CardColor = 'red' | 'blue' | 'green' | 'yellow';
export type ColorOrWild = CardColor | 'wild';

export type CardKind =
  | { type: 'number'; value: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }
  | { type: 'skip' }
  | { type: 'reverse' }
  | { type: 'draw2' }
  | { type: 'wild' }
  | { type: 'wild4' };

export interface Card {
  id: string; // unique, e.g. "r5-23"
  color: ColorOrWild; // wild cards carry chosen color at play time via TopPlay
  kind: CardKind;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  hand: Card[];
  saidUno: boolean;
  connected: boolean; // multiplayer only; always true offline
  isHost: boolean;
}

export type Direction = 1 | -1;

export interface TopPlay {
  card: Card;
  byPlayerId: string;
  chosenColor: CardColor | null; // for wilds
}

export type GamePhase = 'lobby' | 'playing' | 'roundOver' | 'matchOver';

export interface GameState {
  phase: GamePhase;
  players: Player[];
  deck: Card[]; // draw pile, top = last element
  discard: Card[]; // top = last element
  current: number; // index into players
  direction: Direction;
  pendingDraw: number; // 4 when wild4 awaits challenge/accept, else 0
  pendingBy: string | null; // offender for challenge logic
  top: TopPlay | null;
  turnCount: number;
  drawnThisTurn: boolean; // current player already used their draw
  lastDrawn: string[]; // ids of cards drawn this turn (client highlight)
  unoCatchable: string | null; // playerId who dropped to 1 card without calling
  winnerId: string | null;
  roundScoresBy: Record<string, number>;
  targetScore: number;
  lastAction: GameEvent | null;
}

export type GameEvent =
  | { t: 'play'; playerId: string; card: Card; color: CardColor | null }
  | { t: 'draw'; playerId: string; count: number; forced: boolean }
  | { t: 'skip'; playerId: string } // player who got skipped
  | { t: 'reverse' }
  | { t: 'uno'; playerId: string }
  | { t: 'unoPenalty'; playerId: string; byId: string | null }
  | { t: 'challenge'; challengerId: string; success: boolean }
  | { t: 'win'; playerId: string; points: number }
  | { t: 'matchWin'; playerId: string };

export type GameAction =
  | { type: 'PLAY'; cardId: string; chosenColor?: CardColor }
  | { type: 'DRAW' } // 1 normally; absorbs pending wild4
  | { type: 'PASS' } // decline playing the drawn card
  | { type: 'CALL_UNO' }
  | { type: 'CATCH_UNO'; targetId: string }
  | { type: 'CHALLENGE' } // challenge pending wild4
  | { type: 'START_GAME' }
  | { type: 'RESTART' };
