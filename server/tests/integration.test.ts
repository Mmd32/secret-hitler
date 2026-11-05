import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ClientIO, Socket as ClientSocket } from 'socket.io-client';
import cors from 'cors';
import { RoomManager } from '../src/room/RoomManager.js';
import { ClientAction, ClientGameState } from '../src/engine/types.js';

describe('Secret Hitler Full-Stack Integration & Multiplayer Tests', () => {
  let server: http.Server;
  let io: SocketIOServer;
  let port: number;
  const roomManager = new RoomManager();
  const socketConnections = new Map<string, { roomCode: string; sessionToken: string; playerId: string }>();

  beforeAll(async () => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.post('/api/room/create', (req, res) => {
      const result = roomManager.createRoom(req.body.hostName);
      res.json(result);
    });

    app.post('/api/room/join', (req, res) => {
      const result = roomManager.joinRoom(req.body.roomCode, req.body.playerName, req.body.sessionToken);
      res.json(result);
    });

    server = http.createServer(app);
    io = new SocketIOServer(server, { cors: { origin: '*' } });

    io.on('connection', (socket) => {
      socket.on('join-room', (data) => {
        const val = roomManager.validatePlayer(data.roomCode, data.sessionToken);
        if (val) {
          socketConnections.set(socket.id, {
            roomCode: data.roomCode,
            sessionToken: data.sessionToken,
            playerId: val.player.id,
          });
          const clientState = val.game.getClientState(val.player.id);
          socket.emit('state-update', clientState);
        }
      });

      socket.on('action', (data: { roomCode: string; sessionToken: string; action: ClientAction }) => {
        roomManager.handleAction(data.roomCode, data.sessionToken, data.action);
        const session = roomManager.getSession(data.roomCode);
        if (session) {
          for (const [sockId, conn] of socketConnections.entries()) {
            if (conn.roomCode === data.roomCode) {
              const state = session.game.getClientState(conn.playerId);
              io.to(sockId).emit('state-update', state);
            }
          }
        }
      });
    });

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address() as any;
        port = addr.port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    io.close();
    server.close();
  });

  it('creates room, 5 players join, receive secret roles, and reconnect safely', async () => {
    // 1. Host creates room
    const createRes = await fetch(`http://localhost:${port}/api/room/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostName: 'HostPlayer' }),
    });
    const hostData = await createRes.json();
    expect(hostData.roomCode).toBeDefined();

    // 2. 4 more players join
    const players = [hostData];
    for (let i = 1; i < 5; i++) {
      const joinRes = await fetch(`http://localhost:${port}/api/room/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: hostData.roomCode, playerName: `Player_${i}` }),
      });
      const joinData = await joinRes.json();
      players.push(joinData);
    }
    expect(players.length).toBe(5);

    // 3. Connect client sockets
    const sockets: ClientSocket[] = [];
    const clientStates: (ClientGameState | null)[] = [null, null, null, null, null];

    await Promise.all(
      players.map((p, idx) => {
        return new Promise<void>((resolve) => {
          const sock = ClientIO(`http://localhost:${port}`, { transports: ['websocket'] });
          sockets.push(sock);
          sock.on('connect', () => {
            sock.emit('join-room', { roomCode: hostData.roomCode, sessionToken: p.sessionToken });
          });
          sock.on('state-update', (state: ClientGameState) => {
            clientStates[idx] = state;
            resolve();
          });
        });
      })
    );

    // Verify all 5 are in lobby
    expect(clientStates[0]?.publicState.players.length).toBe(5);
    expect(clientStates[0]?.publicState.phase).toBe('LOBBY');

    // 4. Host starts game
    await new Promise<void>((resolve) => {
      sockets[0].emit('action', {
        roomCode: hostData.roomCode,
        sessionToken: hostData.sessionToken,
        action: { type: 'START_GAME' },
      });
      // Wait for state-update
      sockets[0].once('state-update', (st: ClientGameState) => {
        expect(st.publicState.phase).toBe('ROLE_REVEAL');
        resolve();
      });
    });

    // 5. Test Reconnection: Player 2 disconnects and reconnects with sessionToken
    const player2Token = players[2].sessionToken;

    // Disconnect old socket
    sockets[2].disconnect();

    // Reconnect new socket with same sessionToken
    const reconnectedState: ClientGameState = await new Promise((resolve) => {
      const newSock = ClientIO(`http://localhost:${port}`, { transports: ['websocket'] });
      newSock.on('connect', () => {
        newSock.emit('join-room', { roomCode: hostData.roomCode, sessionToken: player2Token });
      });
      newSock.on('state-update', (state) => {
        newSock.disconnect();
        resolve(state);
      });
    });

    expect(reconnectedState.myPlayer?.role).toBeDefined();
    expect(reconnectedState.myPlayer?.id).toBe(players[2].playerId);

    // Clean up all sockets
    sockets.forEach((s) => s.disconnect());
  });
});
