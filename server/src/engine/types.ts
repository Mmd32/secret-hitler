// Secret Hitler Game Types & Protocol

export type Role = 'LIBERAL' | 'FASCIST' | 'HITLER';
export type PartyMembership = 'LIBERAL' | 'FASCIST';
export type PolicyType = 'LIBERAL' | 'FASCIST';

export type GamePhase =
  | 'LOBBY'
  | 'ROLE_REVEAL'
  | 'ELECTION_NOMINATION'
  | 'ELECTION_VOTING'
  | 'ELECTION_REVEAL'
  | 'LEGISLATIVE_PRESIDENT'
  | 'LEGISLATIVE_CHANCELLOR'
  | 'LEGISLATIVE_VETO_OFFERED'
  | 'LEGISLATIVE_POLICY_ENACTED'
  | 'EXECUTIVE_POWER'
  | 'ROUND_END'
  | 'GAME_OVER';

export type ExecutivePower =
  | 'INVESTIGATE_LOYALTY'
  | 'SPECIAL_ELECTION'
  | 'POLICY_PEEK'
  | 'EXECUTION';

export type VoteChoice = 'JA' | 'NEIN';

export interface Player {
  id: string;
  name: string;
  avatarSeed?: string;
  isHost: boolean;
  isConnected: boolean;
  isAlive: boolean;
  isReady: boolean;
  role?: Role;
  membership?: PartyMembership;
  investigatedBy?: string[]; // IDs of presidents who investigated this player
}

export interface PlayerPublicView {
  id: string;
  name: string;
  avatarSeed?: string;
  isHost: boolean;
  isConnected: boolean;
  isAlive: boolean;
  isReady: boolean;
  hasInvestigated?: boolean;
}

export interface PlayerPrivateView {
  id: string;
  name: string;
  isHost: boolean;
  isConnected: boolean;
  isAlive: boolean;
  role?: Role;
  membership?: PartyMembership;
  // Known identities based on official rules:
  knownTeam?: {
    allies: { id: string; name: string; role: Role }[];
    hitler?: { id: string; name: string };
  };
}

export interface ElectionRecord {
  presidentCandidateId: string;
  chancellorCandidateId: string;
  votes: Record<string, VoteChoice>; // Revealed only after voting is complete
  passed: boolean;
  jaCount: number;
  neinCount: number;
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  type:
    | 'GAME_START'
    | 'NOMINATION'
    | 'VOTE_START'
    | 'VOTE_RESULT'
    | 'POLICY_ENACTED'
    | 'CHAOS_POLICY'
    | 'EXECUTIVE_ACTION'
    | 'PLAYER_EXECUTED'
    | 'VETO_REQUESTED'
    | 'VETO_ACCEPTED'
    | 'VETO_REJECTED'
    | 'SPECIAL_ELECTION'
    | 'DECK_RESHUFFLED'
    | 'GAME_OVER';
  message: string;
  data?: Record<string, any>;
}

export interface GameStatePublic {
  roomId: string;
  phase: GamePhase;
  players: PlayerPublicView[];
  seatingOrder: string[]; // Player IDs in clockwise order
  presidentId: string | null;
  chancellorId: string | null;
  nominatedChancellorId: string | null;
  lastElectedPresidentId: string | null;
  lastElectedChancellorId: string | null;
  
  // Board tracks
  liberalPoliciesEnacted: number; // 0 to 5 (5 = Liberal Win)
  fascistPoliciesEnacted: number; // 0 to 6 (6 = Fascist Win)
  failedElectionCount: number;    // 0 to 3 (3 = Chaos!)
  vetoUnlocked: boolean;          // True when 5 fascist policies enacted

  // Deck counts (cards themselves are kept secret on server!)
  drawPileCount: number;
  discardPileCount: number;

  // Active voting state
  votedPlayerIds: string[]; // Who has already cast a vote (hidden choices)
  lastElection: ElectionRecord | null;

  // Active executive power
  pendingExecutivePower: ExecutivePower | null;
  executivePowerTargetId: string | null;

  // Victory info
  winner: 'LIBERAL' | 'FASCIST' | null;
  winReason:
    | 'LIBERAL_5_POLICIES'
    | 'HITLER_EXECUTED'
    | 'FASCIST_6_POLICIES'
    | 'HITLER_ELECTED_CHANCELLOR'
    | null;

  // Log / timeline
  logs: GameLogEntry[];

  // Chaos enactment notification
  lastChaosPolicy?: PolicyType;
}

export interface ClientGameState {
  publicState: GameStatePublic;
  myPlayer: PlayerPrivateView | null;
  
  // Secret legislative hands:
  drawnPolicies?: PolicyType[];       // For President (3 policies) or Chancellor (2 policies)
  policyPeekCards?: PolicyType[];     // For President during Policy Peek power (top 3 policies)
  investigatedLoyalty?: {             // Result of Investigate Loyalty
    targetId: string;
    targetName: string;
    membership: PartyMembership;
  };
  
  // Current user's available actions
  availableActions: {
    canNominate: boolean;
    canVote: boolean;
    canDiscardPresident: boolean;
    canDiscardChancellor: boolean;
    canRequestVeto: boolean;
    canRespondVeto: boolean;
    canExecutePower: boolean;
    canStartGame: boolean;
  };
}

export type ClientAction =
  | { type: 'START_GAME' }
  | { type: 'NOMINATE_CHANCELLOR'; chancellorId: string }
  | { type: 'CAST_VOTE'; vote: VoteChoice }
  | { type: 'PRESIDENT_DISCARD'; cardIndex: number }
  | { type: 'CHANCELLOR_DISCARD'; cardIndex: number }
  | { type: 'REQUEST_VETO' }
  | { type: 'RESPOND_VETO'; agree: boolean }
  | { type: 'USE_EXECUTIVE_POWER'; power: ExecutivePower; targetId?: string }
  | { type: 'RESTART_GAME' };

