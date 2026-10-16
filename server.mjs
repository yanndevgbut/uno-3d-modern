import { createServer } from 'node:http';
import { parse } from 'node:url';
import { createRequire } from 'node:module';
import next from 'next';
import { Server } from 'socket.io';

const require = createRequire(import.meta.url);
const { createGameState, applyAction } = require('./src/game/dist/engine.js');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory rooms store
const rooms = new Map();

function sanitizeStateForPlayer(state, playerId) {
  if (!state) return null;
  return {
    ...state,
    deck: Array.from({ length: state.deck.length }), // mask deck cards
    players: state.players.map((p) => {
      if (p.id === playerId) return p;
      return {
        ...p,
        hand: p.hand.map((_, i) => ({
          id: `dummy-${p.id}-${i}`,
          color: 'wild',
          kind: { type: 'wild' },
        })),
      };
    }),
  };
}

function broadcastGameState(io, roomCode, room, events = []) {
  if (!room.state) return;
  for (const p of room.players) {
    const sanitized = sanitizeStateForPlayer(room.state, p.id);
    io.to(p.id).emit('game_state_update', { state: sanitized, events });
  }
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    let currentRoom = null;

    socket.on('create_room', ({ name, avatar }) => {
      const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      currentRoom = roomCode;

      const player = {
        id: socket.id,
        name: name || 'Pemain 1',
        avatar: avatar || '😎',
        isHost: true,
      };

      rooms.set(roomCode, {
        code: roomCode,
        players: [player],
        state: null,
      });

      socket.join(roomCode);
      socket.emit('room_created', { roomCode, player });
      io.to(roomCode).emit('room_players_updated', [player]);
    });

    socket.on('join_room', ({ roomCode, name, avatar }) => {
      const code = (roomCode || '').toUpperCase();
      const room = rooms.get(code);

      if (!room) {
        socket.emit('room_error', 'Room tidak ditemukan!');
        return;
      }

      if (room.players.length >= 4) {
        socket.emit('room_error', 'Room sudah penuh (maksimal 4 pemain)!');
        return;
      }

      if (room.state && room.state.phase === 'playing') {
        socket.emit('room_error', 'Permainan dalam room ini sudah dimulai!');
        return;
      }

      currentRoom = code;

      const player = {
        id: socket.id,
        name: name || `Pemain ${room.players.length + 1}`,
        avatar: avatar || '🤠',
        isHost: false,
      };

      room.players.push(player);
      socket.join(code);

      socket.emit('room_joined', { roomCode: code, player });
      io.to(code).emit('room_players_updated', room.players);
    });

    socket.on('start_game', ({ roomCode }) => {
      const code = (roomCode || '').toUpperCase();
      const room = rooms.get(code);
      if (!room) return;

      const sender = room.players.find((p) => p.id === socket.id);
      if (!sender || !sender.isHost) {
        socket.emit('room_error', 'Hanya Host yang dapat memulai permainan!');
        return;
      }

      if (room.players.length < 2) {
        socket.emit('room_error', 'Minimal 2 pemain diperlukan untuk bermain!');
        return;
      }

      // Initialize game state on server
      const state = createGameState(
        room.players.map((p) => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          isHost: p.isHost,
        })),
        { targetScore: 200 },
      );

      room.state = state;

      // Broadcast initial sanitized state to each player
      for (const p of room.players) {
        const sanitized = sanitizeStateForPlayer(room.state, p.id);
        io.to(p.id).emit('game_started', sanitized);
      }
    });

    socket.on('game_action', ({ roomCode, action }) => {
      const code = (roomCode || '').toUpperCase();
      const room = rooms.get(code);
      if (!room || !room.state) return;

      const res = applyAction(room.state, action, socket.id);

      if (res.error) {
        socket.emit('action_error', res.error);
        return;
      }

      room.state = res.state;
      broadcastGameState(io, code, room, res.events);
    });

    socket.on('leave_room', ({ roomCode }) => {
      const code = (roomCode || '').toUpperCase();
      if (rooms.has(code)) {
        const room = rooms.get(code);
        room.players = room.players.filter((p) => p.id !== socket.id);
        socket.leave(code);

        if (room.players.length === 0) {
          rooms.delete(code);
        } else {
          if (!room.players.some((p) => p.isHost)) {
            room.players[0].isHost = true;
          }
          io.to(code).emit('room_players_updated', room.players);
        }
      }
      currentRoom = null;
    });

    socket.on('disconnect', () => {
      if (currentRoom && rooms.has(currentRoom)) {
        const room = rooms.get(currentRoom);
        room.players = room.players.filter((p) => p.id !== socket.id);

        if (room.players.length === 0) {
          rooms.delete(currentRoom);
        } else {
          if (!room.players.some((p) => p.isHost)) {
            room.players[0].isHost = true;
          }
          io.to(currentRoom).emit('room_players_updated', room.players);
          if (room.state) {
            broadcastGameState(io, currentRoom, room);
          }
        }
      }
    });
  });

  server.listen(port, hostname, () => {
    console.log(`> UNO 3D Server running on http://${hostname}:${port}`);
  });
});
