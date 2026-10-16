import type { Card, CardColor } from './types';

let seq = 0;

/** Build the standard 108-card UNO deck (shuffled). */
export function buildDeck(rng: () => number = Math.random): Card[] {
  const colors: CardColor[] = ['red', 'blue', 'green', 'yellow'];
  const cards: Card[] = [];
  for (const c of colors) {
    // one 0, two of 1-9, two each action card
    cards.push(mk(c, { type: 'number', value: 0 }, rng));
    for (let v = 1 as 1; v <= 9; v++) {
      cards.push(mk(c, { type: 'number', value: v as 0|1|2|3|4|5|6|7|8|9 }, rng));
      cards.push(mk(c, { type: 'number', value: v as 0|1|2|3|4|5|6|7|8|9 }, rng));
    }
    for (const kind of ['skip', 'reverse', 'draw2'] as const) {
      cards.push(mk(c, { type: kind }, rng));
      cards.push(mk(c, { type: kind }, rng));
    }
  }
  for (let i = 0; i < 4; i++) {
    cards.push(mk('wild', { type: 'wild' }, rng));
    cards.push(mk('wild', { type: 'wild4' }, rng));
  }
  return shuffle(cards, rng);
}

function mk(color: Card['color'], kind: Card['kind'], _rng: () => number): Card {
  // readable ids: r3, g-skip-1, w4-2 ...
  const short =
    kind.type === 'number' ? `${kind.value}` : kind.type === 'wild4' ? 'w4' : kind.type === 'wild' ? 'w' : kind.type[0];
  const id = `${color[0]}${short}-${(seq = (seq + 1) % 100000)}`;
  return { id, color, kind };
}

export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
