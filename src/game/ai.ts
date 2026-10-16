import { playable, activeColor } from './engine';
import type { Card, CardColor, GameAction, GameState } from './types';

export type Difficulty = 'easy' | 'medium' | 'hard';

const COLOR_ORDER: CardColor[] = ['red', 'blue', 'green', 'yellow'];

/** Pick an action for the bot at state.players[state.current] (must be their turn). */
export function aiChooseAction(state: GameState, difficulty: Difficulty): GameAction {
  const me = state.players[state.current]!;

  // Pending wild4: decide challenge
  if (state.pendingDraw === 4) {
    const shouldChallenge =
      difficulty !== 'easy' &&
      me.hand.length <= 2 && // desperate
      Math.random() < 0.5;
    return shouldChallenge ? { type: 'CHALLENGE' } : { type: 'DRAW' };
  }

  const legal = me.hand.filter((c) => playable(c, state));
  if (legal.length === 0) return { type: 'DRAW' };

  const pick = chooseCard(legal, state, me.hand, difficulty);
  const chosenColor = pick.color === 'wild' ? bestColor(me.hand, difficulty) : undefined;
  return { type: 'PLAY', cardId: pick.id, chosenColor };
}

function chooseCard(
  legal: Card[],
  state: GameState,
  fullHand: Card[],
  diff: Difficulty,
): Card {
  if (diff === 'easy') {
    return legal[Math.floor(Math.random() * legal.length)]!;
  }

  // score each candidate
  const scored = legal.map((card) => ({ card, s: heuristic(card, state) }));

  if (diff === 'medium') {
    scored.sort((a, b) => b.s - a.s);
    // medium: pick among top 2 randomly (some suboptimality)
    const top = scored.slice(0, Math.min(2, scored.length));
    return top[Math.floor(Math.random() * top.length)]!.card;
  }

  // hard: full heuristic + opportunistic UNO timing
  scored.sort((a, b) => b.s - a.s);
  return scored[0]!.card;
}

function heuristic(card: Card, state: GameState): number {
  let s = 0;
  const k = card.kind;
  const opponentsMin = Math.min(
    ...state.players
      .filter((_, i) => i !== state.current)
      .map((p) => p.hand.length),
  );

  // dump high-value cards first
  if (k.type === 'number') s += k.value * 0.5;
  else if (k.type === 'wild4') s += 10;
  else if (k.type === 'wild') s += 8;
  else s += 6; // skip/reverse/draw2

  // aggression when an opponent is close to winning
  if (opponentsMin <= 2) {
    if (k.type === 'draw2') s += 8;
    if (k.type === 'skip') s += 6;
    if (k.type === 'reverse') s += 4;
    if (k.type === 'wild4') s += 4;
  }

  // keep color flexibility: prefer color we hold most
  if (card.color !== 'wild') {
    const sameColor = state.players[state.current]!.hand.filter(
      (c) => c.color === card.color,
    ).length;
    s += sameColor * 1.5;
  }

  return s;
}

function bestColor(hand: Card[], diff: Difficulty): CardColor {
  if (diff === 'easy') return COLOR_ORDER[Math.floor(Math.random() * 4)]!;
  const counts = new Map<CardColor, number>([
    ['red', 0],
    ['blue', 0],
    ['green', 0],
    ['yellow', 0],
  ]);
  for (const c of hand) if (c.color !== 'wild') counts.set(c.color, (counts.get(c.color) ?? 0) + 1);
  let best: CardColor = 'red';
  let bestN = -1;
  for (const [c, n] of counts) {
    if (n > bestN) {
      bestN = n;
      best = c;
    }
  }
  // hard: tie-break by value in color
  if (diff === 'hard' && bestN <= 0) {
    let bv = -1;
    for (const c of hand) {
      if (c.color !== 'wild' && c.kind.type === 'number') {
        const v = c.kind.value + 1;
        if (v > bv) {
          bv = v;
          best = c.color as CardColor;
        }
      }
    }
  }
  return best;
}
