import assert from 'node:assert/strict';
import { test, beforeEach } from 'node:test';
import { createGameState, applyAction, playable } from './engine';
import { buildDeck } from './deck';
import type { GameState, CardColor } from './types';

function fakeRng() {
  let s = 42;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function twoPlayerState(): GameState {
  return createGameState(
    [
      { id: 'p1', name: 'You', avatar: '🙂', isHost: true },
      { id: 'p2', name: 'Bot', avatar: '🤖', isHost: false },
    ],
    { rng: fakeRng(), targetScore: 200 },
  );
}

test('deck has 108 unique cards', () => {
  const deck = buildDeck();
  assert.equal(deck.length, 108);
  assert.equal(new Set(deck.map((c) => c.id)).size, 108);
});

test('initial state is valid', () => {
  const s = twoPlayerState();
  assert.equal(s.players.length, 2);
  for (const p of s.players) assert.equal(p.hand.length, 7);
  assert.equal(s.discard.length, 1);
  assert.ok(s.top);
  assert.notEqual(s.top!.card.color, 'wild');
});

// find a card of given color in a player's hand
function findCard(s: GameState, pid: string, pred: (c: any) => boolean) {
  return s.players.find((p) => p.id === pid)!.hand.find(pred)!;
}

test('play number card passes turn', () => {
  let s = twoPlayerState();
  const startIdx = s.current;
  const pid = s.players[startIdx]!.id;
  const card = findCard(s, pid, (c) => c.kind.type === 'number' && c.color === s.top!.card.color);
  const r = applyAction(s, { type: 'PLAY', cardId: card.id }, pid);
  assert.ok(!r.error, r.error);
  assert.notEqual(r.state.current, startIdx);
});

test('skip skips next player', () => {
  let s = twoPlayerState();
  const curIdx = s.current;
  const cur = s.players[curIdx]!;
  const skipColor: CardColor = s.top!.card.color as CardColor;
  cur.hand = [
    { id: 'x-skip', color: skipColor, kind: { type: 'skip' } },
    { id: 'dummy-1', color: 'blue', kind: { type: 'number', value: 1 } },
  ];
  const otherIdx = 1 - curIdx;
  const before = s.players[otherIdx]!.hand.length;
  const r = applyAction(s, { type: 'PLAY', cardId: 'x-skip' }, cur.id);
  assert.ok(!r.error, r.error);
  // 2 players: skip = other loses turn, back to current player
  assert.equal(r.state.current, curIdx);
  assert.equal(r.state.players[otherIdx]!.hand.length, before);
});

test('draw2 forces next player to draw and lose turn (2p = self again)', () => {
  let s = twoPlayerState();
  const curIdx = s.current;
  const cur = s.players[curIdx]!;
  const color = s.top!.card.color as CardColor;
  cur.hand = [
    { id: 'x-d2', color, kind: { type: 'draw2' } },
    { id: 'dummy-1', color: 'blue', kind: { type: 'number', value: 1 } },
  ];
  const r = applyAction(s, { type: 'PLAY', cardId: 'x-d2' }, cur.id);
  assert.ok(!r.error, r.error);
  const other = r.state.players[1 - curIdx]!;
  assert.equal(other.hand.length, 9); // 7 + 2
  assert.equal(r.state.current, curIdx); // back to mover in 2p
});

test('reverse in 2p acts as skip and flips nothing weird', () => {
  let s = twoPlayerState();
  const curIdx = s.current;
  const cur = s.players[curIdx]!;
  const color = s.top!.card.color as CardColor;
  cur.hand = [
    { id: 'x-rev', color, kind: { type: 'reverse' } },
    { id: 'dummy-1', color: 'blue', kind: { type: 'number', value: 1 } },
  ];
  const r = applyAction(s, { type: 'PLAY', cardId: 'x-rev' }, cur.id);
  assert.ok(!r.error, r.error);
  assert.equal(r.state.current, curIdx);
});

test('wild sets chosen color', () => {
  let s = twoPlayerState();
  const cur = s.players[s.current]!;
  cur.hand = [
    { id: 'x-w', color: 'wild', kind: { type: 'wild' } },
    { id: 'dummy-1', color: 'blue', kind: { type: 'number', value: 1 } },
  ];
  const r = applyAction(
    s,
    { type: 'PLAY', cardId: 'x-w', chosenColor: 'blue' },
    cur.id,
  );
  assert.ok(!r.error, r.error);
  assert.equal(r.state.top!.chosenColor, 'blue');
});

test('wild4 then victim draws 4 and mover goes again (2p)', () => {
  let s = twoPlayerState();
  const curIdx = s.current;
  const cur = s.players[curIdx]!;
  cur.hand = [
    { id: 'x-w4', color: 'wild', kind: { type: 'wild4' } },
    { id: 'dummy-1', color: 'blue', kind: { type: 'number', value: 1 } },
  ];
  let r = applyAction(s, { type: 'PLAY', cardId: 'x-w4', chosenColor: 'green' }, cur.id);
  assert.ok(!r.error, r.error);
  assert.equal(r.state.pendingDraw, 4);
  assert.equal(r.state.current, 1 - curIdx); // victim to act

  // victim draws (accepts)
  r = applyAction(r.state, { type: 'DRAW' }, r.state.players[1 - curIdx]!.id);
  assert.ok(!r.error, r.error);
  assert.equal(r.state.players[1 - curIdx]!.hand.length, 11);
  assert.equal(r.state.pendingDraw, 0);
  assert.equal(r.state.current, curIdx); // back to mover
});

test('challenge success: offender draws 4', () => {
  let s = twoPlayerState();
  const curIdx = s.current;
  const cur = s.players[curIdx]!;
  const topColor = s.top!.card.color as CardColor;
  cur.hand = [
    { id: 'x-w4', color: 'wild', kind: { type: 'wild4' } },
    { id: 'offender-has-color', color: topColor, kind: { type: 'number', value: 3 } },
  ];
  const victimIdx = 1 - curIdx;
  let r = applyAction(s, { type: 'PLAY', cardId: 'x-w4' }, cur.id);
  assert.ok(!r.error, r.error);
  r = applyAction(r.state, { type: 'CHALLENGE' }, r.state.players[victimIdx]!.id);
  assert.ok(!r.error, r.error);
  // offender held matching color, so challenge succeeded -> offender drew 4 cards
  assert.equal(r.state.players[curIdx]!.hand.length, 5); // 1 remaining + 4 drawn
  assert.equal(r.state.pendingDraw, 0);
  // challenger still their turn to play
  assert.equal(r.state.current, victimIdx);
});

test('must draw when pending; cannot play', () => {
  let s = twoPlayerState();
  const curIdx = s.current;
  const cur = s.players[curIdx]!;
  cur.hand = [
    { id: 'x-w4', color: 'wild', kind: { type: 'wild4' } },
    { id: 'dummy-1', color: 'blue', kind: { type: 'number', value: 1 } },
  ];
  let r = applyAction(s, { type: 'PLAY', cardId: 'x-w4', chosenColor: 'red' }, cur.id);
  const victim = r.state.players[1 - curIdx]!;
  // victim tries to pass without drawing (should fail)
  const bad = applyAction(r.state, { type: 'PASS' }, victim.id);
  assert.ok(bad.error);
  const dr = applyAction(r.state, { type: 'DRAW' }, victim.id);
  assert.ok(!dr.error, dr.error);
  assert.equal(dr.state.players[1 - curIdx]!.hand.length, 11);
});

test('draw one, player can pass to advance turn', () => {
  let s = twoPlayerState();
  const curIdx = s.current;
  const cur = s.players[curIdx]!;
  cur.hand = [{ id: 'n1', color: 'red', kind: { type: 'number', value: 1 } }];
  s.discard = [{ id: 't0', color: 'blue', kind: { type: 'number', value: 5 } }];
  s.top = { card: s.discard[0]!, byPlayerId: '', chosenColor: null };

  let r = applyAction(s, { type: 'DRAW' }, cur.id);
  assert.ok(!r.error);
  assert.equal(r.state.drawnThisTurn, true);

  // player passes
  const pass = applyAction(r.state, { type: 'PASS' }, cur.id);
  assert.ok(!pass.error);
  assert.equal(pass.state.current, 1 - curIdx);
});

test('UNO call and catch penalty', () => {
  let s = twoPlayerState();
  const curIdx = s.current;
  const cur = s.players[curIdx]!;
  const color = s.top!.card.color as CardColor;
  cur.hand = [
    { id: 'a1', color, kind: { type: 'number', value: 2 } },
    { id: 'a2', color, kind: { type: 'number', value: 3 } },
  ];
  // play down to one without calling
  let r = applyAction(s, { type: 'PLAY', cardId: 'a1' }, cur.id);
  assert.ok(!r.error, r.error);
  assert.equal(r.state.unoCatchable, cur.id);
  // other player catches
  const catcher = r.state.players[1 - curIdx]!.id;
  const caught = applyAction(r.state, { type: 'CATCH_UNO', targetId: cur.id }, catcher);
  assert.ok(!caught.error, caught.error);
  assert.equal(caught.state.players[curIdx]!.hand.length, 3); // 1 + 2 penalty
  // call after already caught: fails
  const late = applyAction(caught.state, { type: 'CALL_UNO' }, cur.id);
  // now has 3 cards -> error
  assert.ok(late.error);
});

test('win round scores opponent hand', () => {
  let s = twoPlayerState();
  const curIdx = s.current;
  const cur = s.players[curIdx]!;
  const color = s.top!.card.color as CardColor;
  cur.hand = [{ id: 'last', color, kind: { type: 'number', value: 7 } }];
  s.players[1 - curIdx]!.hand = [
    { id: 'o1', color: 'green', kind: { type: 'number', value: 5 } },
    { id: 'o2', color: 'wild', kind: { type: 'wild4' } },
  ];
  const r = applyAction(s, { type: 'PLAY', cardId: 'last' }, cur.id);
  assert.ok(!r.error, r.error);
  assert.equal(r.state.phase, 'roundOver');
  assert.equal(r.state.winnerId, cur.id);
  assert.equal(r.state.roundScoresBy[cur.id], 55); // 5 + 50
});

test('deck reshuffles when empty', () => {
  let s = twoPlayerState();
  s.deck = [];
  s.discard = [
    { id: 't0', color: 'red', kind: { type: 'number', value: 5 } },
    { id: 'd1', color: 'green', kind: { type: 'number', value: 3 } },
    { id: 'd2', color: 'blue', kind: { type: 'number', value: 4 } },
  ];
  s.top = { card: s.discard[2]!, byPlayerId: '', chosenColor: null };
  const curIdx = s.current;
  const cur = s.players[curIdx]!;
  const r = applyAction(s, { type: 'DRAW' }, cur.id);
  assert.ok(!r.error, r.error);
  assert.equal(r.state.players[curIdx]!.hand.length, 8);
  assert.ok(r.state.deck.length >= 1);
  assert.equal(r.state.discard.length, 1);
});
