import { buildDeck, shuffle } from './deck';
import type {
  Card,
  CardColor,
  GameAction,
  GameEvent,
  GameState,
  Player,
} from './types';

export const TARGET_SCORE = 200;
export const MAX_PLAYERS = 4;
export const MIN_PLAYERS = 2;
export const WILD4_CHALLENGE_WINDOW = true; // victim may challenge instead of drawing

// ---------- match / playability ----------

export function activeColor(state: GameState): CardColor | null {
  const top = state.top;
  if (!top) return null;
  if (top.chosenColor) return top.chosenColor;
  return top.card.color === 'wild' ? null : (top.card.color as CardColor);
}

export function playable(card: Card, state: GameState): boolean {
  if (state.phase !== 'playing') return false;
  if (state.pendingDraw > 0) return false; // official: must take the cards
  const top = state.top;
  if (!top) return true;
  if (card.color === 'wild') return true;
  const ac = activeColor(state);
  if (ac && card.color === ac) return true;
  const k = card.kind;
  const t = top.card.kind;
  if (k.type === 'number' && t.type === 'number') return k.value === t.value;
  if (k.type !== 'number' && k.type === t.type) return true;
  return false;
}

export function handWithPlayable(state: GameState, hand: Card[]) {
  return hand.map((card) => ({ card, ok: playable(card, state) }));
}

// ---------- small utils ----------

function nextIndex(state: GameState, from: number = state.current): number {
  const n = state.players.length;
  return (from + state.direction + n) % n;
}

function advance(state: GameState) {
  state.current = nextIndex(state);
  state.turnCount++;
  state.drawnThisTurn = false;
  state.lastDrawn = [];
}

function drawCards(state: GameState, playerIdx: number, count: number): Card[] {
  const drawn: Card[] = [];
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0) reshuffle(state);
    if (state.deck.length === 0) break; // everyone hoarding cards, ultra rare
    state.players[playerIdx]!.hand.push(state.deck.pop()!);
    drawn.push(state.players[playerIdx]!.hand[state.players[playerIdx]!.hand.length - 1]!);
  }
  return drawn;
}

function reshuffle(state: GameState) {
  const top = state.discard.pop();
  const rest = state.discard;
  state.discard = top ? [top] : [];
  if (rest.length === 0) return;
  state.deck = shuffle(rest);
}

export function scoreOf(hand: Card[]): number {
  let s = 0;
  for (const c of hand) {
    const k = c.kind;
    if (k.type === 'number') s += k.value;
    else if (k.type === 'wild' || k.type === 'wild4') s += 50;
    else s += 20;
  }
  return s;
}

function totalFor(state: GameState, id: string): number {
  return state.roundScoresBy[id] ?? 0;
}

// ---------- setup ----------

export function createGameState(
  players: Array<Pick<Player, 'id' | 'name' | 'avatar' | 'isHost'>>,
  opts: { targetScore?: number; rng?: () => number } = {},
): GameState {
  const deck = buildDeck(opts.rng);
  const state: GameState = {
    phase: 'playing',
    players: players.map((p) => ({
      ...p,
      hand: [],
      saidUno: false,
      connected: true,
    })),
    deck: [],
    discard: [],
    current: Math.floor((opts.rng ?? Math.random)() * players.length),
    direction: 1,
    pendingDraw: 0,
    pendingBy: null,
    top: null,
    turnCount: 0,
    drawnThisTurn: false,
    lastDrawn: [],
    unoCatchable: null,
    winnerId: null,
    roundScoresBy: {},
    targetScore: opts.targetScore ?? TARGET_SCORE,
    lastAction: null,
  };
  for (let r = 0; r < 7; r++) for (const p of state.players) p.hand.push(deck.pop()!);
  state.deck = deck;

  // flip first discard; wilds go back under and we re-flip
  let first = deck.pop()!;
  while (first.color === 'wild') {
    deck.unshift(first);
    first = deck.pop()!;
  }
  state.discard = [first];
  state.top = { card: first, byPlayerId: state.players[state.current]!.id, chosenColor: null };
  applyFirstCard(state, first);
  return state;
}

function applyFirstCard(state: GameState, first: Card) {
  const k = first.kind;
  if (k.type === 'number') return;
  if (k.type === 'skip') {
    const skipped = state.players[nextIndex(state)]!.id;
    state.lastAction = { t: 'skip', playerId: skipped };
    advance(state);
  } else if (k.type === 'reverse') {
    if (state.players.length === 2) {
      const skipped = state.players[nextIndex(state)]!.id;
      state.lastAction = { t: 'skip', playerId: skipped };
      advance(state);
    } else {
      state.direction = -1;
      state.lastAction = { t: 'reverse' };
      state.current = nextIndex(state);
      state.turnCount++;
    }
  } else if (k.type === 'draw2') {
    const victim = nextIndex(state);
    drawCards(state, victim, 2);
    state.lastAction = { t: 'draw', playerId: state.players[victim]!.id, count: 2, forced: true };
    state.current = victim;
    state.turnCount++;
    state.drawnThisTurn = true; // victim must press PASS after absorbing
    state.pendingDraw = 0;
    // victim's turn: they cannot play (pending>0)? Official first-card draw2:
    // victim draws 2 and is skipped. Simpler & fair: draw 2, turn passes.
    state.drawnThisTurn = false;
    state.lastDrawn = [];
    state.current = nextIndex(state);
    state.turnCount++;
  }
}

// ---------- reducer ----------

export interface ApplyResult {
  state: GameState;
  events: GameEvent[];
  error?: string;
}

export function applyAction(prev: GameState, action: GameAction, actorId?: string): ApplyResult {
  const state: GameState = structuredClone(prev);
  const events: GameEvent[] = [];
  const actor = actorId ?? state.players[state.current]?.id;
  const actorIdx = state.players.findIndex((p) => p.id === actor);
  if (actorIdx === -1) return { state, events, error: 'unknown actor' };
  const me = state.players[actorIdx]!;

  switch (action.type) {
    case 'START_GAME': {
      if (state.phase !== 'lobby') return { state, events, error: 'not lobby' };
      state.phase = 'playing';
      return { state, events };
    }

    case 'PLAY': {
      if (state.phase !== 'playing') return { state, events, error: 'game not running' };
      if (actorIdx !== state.current) return { state, events, error: 'not your turn' };
      const idx = me.hand.findIndex((c) => c.id === action.cardId);
      if (idx === -1) return { state, events, error: 'card not in hand' };
      const card = me.hand[idx]!;
      if (state.pendingDraw > 0)
        return { state, events, error: 'resolve pending draw first' };
      if (!playable(card, state)) return { state, events, error: 'card not playable' };

      me.hand.splice(idx, 1);
      state.discard.push(card);
      const chosen: CardColor | null =
        card.color === 'wild' ? (action.chosenColor ?? 'red') : null;
      state.top = { card, byPlayerId: me.id, chosenColor: chosen };
      state.unoCatchable = null;
      state.lastAction = { t: 'play', playerId: me.id, card, color: chosen };
      events.push(state.lastAction);

      // ---- win ----
      if (me.hand.length === 0) {
        return finishRound(state, events, actorIdx);
      }

      // ---- UNO tracking ----
      if (me.hand.length === 1) {
        if (!me.saidUno) state.unoCatchable = me.id;
        // if they had already called (pressed button while holding 2), keep it
      } else {
        me.saidUno = false;
      }

      // ---- effects ----
      const k = card.kind;
      if (k.type === 'wild4') {
        state.pendingDraw = 4;
        state.pendingBy = me.id;
        advance(state); // victim decides: CHALLENGE or DRAW (absorbs 4)
      } else if (k.type === 'draw2') {
        advance(state);
        const v = state.current;
        drawCards(state, v, 2);
        events.push({ t: 'draw', playerId: state.players[v]!.id, count: 2, forced: true });
        advance(state);
      } else if (k.type === 'skip') {
        advance(state);
        events.push({ t: 'skip', playerId: state.players[state.current]!.id });
        advance(state);
      } else if (k.type === 'reverse') {
        if (state.players.length === 2) {
          advance(state);
          events.push({ t: 'skip', playerId: state.players[state.current]!.id });
          advance(state);
        } else {
          state.direction = (state.direction === 1 ? -1 : 1) as 1 | -1;
          events.push({ t: 'reverse' });
          advance(state);
        }
      } else {
        advance(state);
      }
      return { state, events };
    }

    case 'DRAW': {
      if (state.phase !== 'playing') return { state, events, error: 'game not running' };
      if (actorIdx !== state.current) return { state, events, error: 'not your turn' };
      if (state.drawnThisTurn && state.pendingDraw === 0)
        return { state, events, error: 'already drew this turn' };

      const forced = state.pendingDraw > 0;
      const count = forced ? state.pendingDraw : 1;
      const drawn = drawCards(state, actorIdx, count);
      state.drawnThisTurn = true;
      state.lastDrawn = drawn.map((c) => c.id);
      events.push({ t: 'draw', playerId: me.id, count, forced });

      if (forced) {
        // wild4 absorbed: turn ends (player chose not to challenge)
        state.pendingDraw = 0;
        state.pendingBy = null;
        advance(state);
      }
      return { state, events };
    }

    case 'PASS': {
      if (state.phase !== 'playing') return { state, events, error: 'game not running' };
      if (actorIdx !== state.current) return { state, events, error: 'not your turn' };
      if (!state.drawnThisTurn) return { state, events, error: 'must draw first' };
      state.lastDrawn = [];
      advance(state);
      return { state, events };
    }

    case 'CALL_UNO': {
      if (me.hand.length !== 1) return { state, events, error: 'not at one card' };
      if (!me.saidUno) {
        me.saidUno = true;
        state.unoCatchable = null;
        events.push({ t: 'uno', playerId: me.id });
      }
      return { state, events };
    }

    case 'CATCH_UNO': {
      if (state.phase !== 'playing') return { state, events, error: 'game not running' };
      const target = state.players.find((p) => p.id === action.targetId);
      if (!target) return { state, events, error: 'no such player' };
      if (state.unoCatchable !== action.targetId)
        return { state, events, error: 'nothing to catch' };
      if (target.id === me.id) return { state, events, error: 'cannot catch yourself' };
      // penalty: target draws 2
      const ti = state.players.findIndex((p) => p.id === action.targetId);
      drawCards(state, ti, 2);
      state.unoCatchable = null;
      events.push({ t: 'unoPenalty', playerId: target.id, byId: me.id });
      return { state, events };
    }

    case 'CHALLENGE': {
      if (state.phase !== 'playing') return { state, events, error: 'game not running' };
      if (actorIdx !== state.current) return { state, events, error: 'not your turn' };
      if (state.pendingDraw !== 4) return { state, events, error: 'nothing to challenge' };
      const offender = state.players.find((p) => p.id === state.pendingBy);
      // color before the wild4 was played:
      const prevTop = state.discard[state.discard.length - 2];
      const colorBefore = prevTop
        ? prevTop.kind.type === 'number' || prevTop.color !== 'wild'
          ? (prevTop.color as CardColor)
          : null
        : null;
      const hadMatch = offender
        ? offender.hand.some(
            (c) => c.color !== 'wild' && colorBefore !== null && c.color === colorBefore,
          )
        : false;
      state.pendingDraw = 0;
      state.pendingBy = null;
      if (hadMatch) {
        // offender caught bluffing: offender draws 4, challenger plays on
        const oi = state.players.findIndex((p) => p.id === offender?.id);
        drawCards(state, oi, 4);
        events.push({ t: 'challenge', challengerId: me.id, success: true });
        // challenger now draws nothing; may play any legal card or draw 1
      } else {
        // wrong challenge: challenger draws 4 + 2? Official: draws 6 total
        drawCards(state, actorIdx, 6);
        events.push({ t: 'challenge', challengerId: me.id, success: false });
        advance(state);
      }
      return { state, events };
    }

    case 'RESTART': {
      const fresh = createGameState(
        state.players.map(({ id, name, avatar, isHost }) => ({ id, name, avatar, isHost })),
      );
      return { state: fresh, events: [{ t: 'matchWin', playerId: '' }] };
    }

    default:
      return { state, events, error: 'unknown action' };
  }
}

function finishRound(state: GameState, events: GameEvent[], winnerIdx: number): ApplyResult {
  const winner = state.players[winnerIdx]!;
  const pts = state.players.reduce(
    (sum, p, i) => (i === winnerIdx ? sum : sum + scoreOf(p.hand)),
    0,
  );
  state.roundScoresBy[winner.id] = totalFor(state, winner.id) + pts;
  state.winnerId = winner.id;
  events.push({ t: 'win', playerId: winner.id, points: pts });
  state.pendingDraw = 0;
  state.pendingBy = null;

  const matchWinner = state.players.reduce((best, p) =>
    totalFor(state, p.id) > totalFor(state, best.id) ? p : best,
  );
  if (totalFor(state, matchWinner.id) >= state.targetScore) {
    state.phase = 'matchOver';
    events.push({ t: 'matchWin', playerId: matchWinner.id });
  } else {
    state.phase = 'roundOver';
  }
  return { state, events };
}
