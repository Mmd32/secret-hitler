import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { RoomManager } from './room/RoomManager.js';
import { SecretHitlerBot } from './engine/bot.js';
import { ClientAction } from './engine/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json());

const roomManager = new RoomManager();

// Track active socket connections: socketId -> { roomCode, sessionToken, playerId }
const socketConnections = new Map<
  string,
  { roomCode: string; sessionToken: string; playerId: string }
>();

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Broadcast tailored state to all connected sockets in a room
function broadcastRoomState(roomCode: string) {
  const session = roomManager.getSession(roomCode);
  if (!session) return;

  const roomKey = roomCode.toUpperCase();
  for (const [socketId, conn] of socketConnections.entries()) {
    if (conn.roomCode.toUpperCase() === roomKey) {
      const state = session.game.getClientState(conn.playerId);
      io.to(socketId).emit('state-update', state);
    }
  }
}

// Bot auto-play loop if bots are present in the room
function checkAndRunBots(roomCode: string) {
  const session = roomManager.getSession(roomCode);
  if (!session || session.game.phase === 'LOBBY' || session.game.phase === 'GAME_OVER') {
    return;
  }

  // Find any bot players (names starting with 'Bot ' or custom flag)
  const bots = Array.from(session.game.players.values()).filter((p) =>
    p.name.startsWith('Bot ') && p.isAlive
  );
  if (bots.length === 0) return;

  // Let bots make decisions sequentially with slight human-like delay
  setTimeout(() => {
    let madeDecision = false;
    for (const bot of bots) {
      try {
        SecretHitlerBot.makeDecision(session.game, bot.id);
        madeDecision = true;
      } catch (e) {
        // Ignored if action not applicable to this bot right now
      }
    }

    if (madeDecision) {
      broadcastRoomState(roomCode);
      // Re-trigger in case subsequent phase needs bot input (e.g. votes or discard)
      checkAndRunBots(roomCode);
    }
  }, 600);
}

// --- REST Endpoints ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.post('/api/room/create', (req, res) => {
  try {
    const { hostName } = req.body;
    if (!hostName || typeof hostName !== 'string' || !hostName.trim()) {
      return res.status(400).json({ error: 'Host name is required' });
    }

    const result = roomManager.createRoom(hostName.trim());
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/room/join', (req, res) => {
  try {
    const { roomCode, playerName, sessionToken } = req.body;
    if (!roomCode || typeof roomCode !== 'string') {
      return res.status(400).json({ error: 'Room code is required' });
    }

    const result = roomManager.joinRoom(
      roomCode.trim(),
      (playerName || 'Player').trim(),
      sessionToken
    );
    res.json({
      roomCode: roomCode.toUpperCase(),
      playerId: result.playerId,
      sessionToken: result.sessionToken,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/room/:code', (req, res) => {
  const session = roomManager.getSession(req.params.code);
  if (!session) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json({
    roomCode: session.roomCode,
    phase: session.game.phase,
    playerCount: session.game.players.size,
    isFull: session.game.players.size >= 10,
    hasStarted: session.game.phase !== 'LOBBY',
  });
});

// Serve frontend in production
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('Secret Hitler Server is running. Client build in progress.');
    }
  });
});

// --- Socket.IO Event Handlers ---

io.on('connection', (socket) => {
  socket.on('join-room', (data: { roomCode: string; sessionToken: string }) => {
    const { roomCode, sessionToken } = data || {};
    if (!roomCode || !sessionToken) {
      socket.emit('error-msg', { message: 'Missing roomCode or sessionToken' });
      return;
    }

    const validation = roomManager.validatePlayer(roomCode, sessionToken);
    if (!validation) {
      socket.emit('error-msg', { message: 'Invalid session or room' });
      return;
    }

    const { player, game } = validation;
    player.isConnected = true;

    socketConnections.set(socket.id, {
      roomCode: roomCode.toUpperCase(),
      sessionToken,
      playerId: player.id,
    });

    socket.join(roomCode.toUpperCase());

    // Send immediate state update to joining socket
    const clientState = game.getClientState(player.id);
    socket.emit('state-update', clientState);

    // Notify others in room
    broadcastRoomState(roomCode);
  });

  socket.on('action', (data: { roomCode: string; sessionToken: string; action: ClientAction }) => {
    const { roomCode, sessionToken, action } = data || {};
    try {
      roomManager.handleAction(roomCode, sessionToken, action);
      broadcastRoomState(roomCode);
      checkAndRunBots(roomCode);
    } catch (err: any) {
      socket.emit('error-msg', { message: err.message || 'Action failed' });
    }
  });

  socket.on('finish-role-reveal', (data: { roomCode: string }) => {
    const session = roomManager.getSession(data?.roomCode);
    if (session && session.game.phase === 'ROLE_REVEAL') {
      session.game.finishRoleReveal();
      broadcastRoomState(data.roomCode);
      checkAndRunBots(data.roomCode);
    }
  });

  socket.on('add-bot', (data: { roomCode: string; sessionToken: string }) => {
    const session = roomManager.getSession(data?.roomCode);
    if (!session) return;
    const validation = roomManager.validatePlayer(data.roomCode, data.sessionToken);
    if (!validation?.player.isHost) {
      socket.emit('error-msg', { message: 'Only the host can add bots' });
      return;
    }

    if (session.game.players.size >= 10) {
      socket.emit('error-msg', { message: 'Room is full' });
      return;
    }

    const botNumber = session.game.players.size + 1;
    const botId = `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    session.game.addPlayer(botId, `Bot ${botNumber}`, false);

    broadcastRoomState(data.roomCode);
  });

  socket.on('disconnect', () => {
    const conn = socketConnections.get(socket.id);
    if (conn) {
      socketConnections.delete(socket.id);
      const session = roomManager.getSession(conn.roomCode);
      if (session) {
        const player = session.game.players.get(conn.playerId);
        if (player) {
          player.isConnected = false;
        }
        broadcastRoomState(conn.roomCode);
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Secret Hitler Server running on http://localhost:${PORT}`);
});

