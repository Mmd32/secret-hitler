import fs from 'fs';
import path from 'path';
import { SecretHitlerGame } from '../engine/SecretHitlerGame.js';
import { ClientAction, ClientGameState } from '../engine/types.js';

export interface RoomSession {
  roomCode: string;
  game: SecretHitlerGame;
  playerTokens: Map<string, string>; // playerId -> sessionToken
  tokenToPlayerId: Map<string, string>; // sessionToken -> playerId
  createdAt: number;
  lastActive: number;
}

export class RoomManager {
  private rooms: Map<string, RoomSession> = new Map();
  private storageDir: string;

  constructor(storageDir = './data') {
    this.storageDir = storageDir;
    try {
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
      }
    } catch (e) {
      console.warn('Storage directory warning:', e);
    }
  }

  // Generate 5-character readable code (no ambiguous chars like 0/O, 1/I)
  public generateRoomCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 5; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
    } while (this.rooms.has(code));
    return code;
  }

  public createRoom(hostName: string): { roomCode: string; playerId: string; sessionToken: string } {
    const roomCode = this.generateRoomCode();
    const game = new SecretHitlerGame(roomCode);
    const playerId = `usr_${Math.random().toString(36).substring(2, 9)}`;
    const sessionToken = `tok_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;

    game.addPlayer(playerId, hostName, true);

    const session: RoomSession = {
      roomCode,
      game,
      playerTokens: new Map([[playerId, sessionToken]]),
      tokenToPlayerId: new Map([[sessionToken, playerId]]),
      createdAt: Date.now(),
      lastActive: Date.now(),
    };

    this.rooms.set(roomCode, session);
    return { roomCode, playerId, sessionToken };
  }

  public joinRoom(
    roomCode: string,
    playerName: string,
    existingToken?: string
  ): { playerId: string; sessionToken: string; game: SecretHitlerGame } {
    const session = this.rooms.get(roomCode.toUpperCase());
    if (!session) {
      throw new Error('Room not found');
    }

    session.lastActive = Date.now();

    // Check if player is reconnecting with an existing token
    if (existingToken && session.tokenToPlayerId.has(existingToken)) {
      const existingPlayerId = session.tokenToPlayerId.get(existingToken)!;
      const player = session.game.players.get(existingPlayerId);
      if (player) {
        player.isConnected = true;
        return { playerId: existingPlayerId, sessionToken: existingToken, game: session.game };
      }
    }

    // New player joining
    if (session.game.phase !== 'LOBBY') {
      throw new Error('Game in progress. Cannot join as new player.');
    }
    if (session.game.players.size >= 10) {
      throw new Error('Room is full (max 10 players).');
    }

    const playerId = `usr_${Math.random().toString(36).substring(2, 9)}`;
    const sessionToken = `tok_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;

    session.game.addPlayer(playerId, playerName, false);
    session.playerTokens.set(playerId, sessionToken);
    session.tokenToPlayerId.set(sessionToken, playerId);

    return { playerId, sessionToken, game: session.game };
  }

  public getSession(roomCode: string): RoomSession | undefined {
    return this.rooms.get(roomCode.toUpperCase());
  }

  public validatePlayer(roomCode: string, sessionToken: string): { player: any; game: SecretHitlerGame } | null {
    const session = this.getSession(roomCode);
    if (!session) return null;

    const playerId = session.tokenToPlayerId.get(sessionToken);
    if (!playerId) return null;

    const player = session.game.players.get(playerId);
    if (!player) return null;

    return { player, game: session.game };
  }

  public handleAction(roomCode: string, sessionToken: string, action: ClientAction): ClientGameState {
    const session = this.getSession(roomCode);
    if (!session) throw new Error('Room not found');

    const playerId = session.tokenToPlayerId.get(sessionToken);
    if (!playerId) throw new Error('Invalid session token');

    const game = session.game;
    session.lastActive = Date.now();

    switch (action.type) {
      case 'START_GAME': {
        const player = game.players.get(playerId);
        if (!player?.isHost) throw new Error('Only the host can start the game');
        game.startGame();
        break;
      }

      case 'NOMINATE_CHANCELLOR': {
        game.nominateChancellor(playerId, action.chancellorId);
        break;
      }

      case 'CAST_VOTE': {
        game.castVote(playerId, action.vote);
        break;
      }

      case 'PRESIDENT_DISCARD': {
        game.presidentDiscard(playerId, action.cardIndex);
        break;
      }

      case 'CHANCELLOR_DISCARD': {
        game.chancellorDiscard(playerId, action.cardIndex);
        break;
      }

      case 'REQUEST_VETO': {
        game.requestVeto(playerId);
        break;
      }

      case 'RESPOND_VETO': {
        game.respondVeto(playerId, action.agree);
        break;
      }

      case 'USE_EXECUTIVE_POWER': {
        game.useExecutivePower(playerId, action.power, action.targetId);
        break;
      }

      case 'RESTART_GAME': {
        const player = game.players.get(playerId);
        if (!player?.isHost) throw new Error('Only the host can restart the game');
        game.restartGame();
        break;
      }

      default:
        throw new Error('Unknown action');
    }

    return game.getClientState(playerId);
  }
}

