import {
  ClientGameState,
  ElectionRecord,
  ExecutivePower,
  GameLogEntry,
  GamePhase,
  GameStatePublic,
  PartyMembership,
  Player,
  PlayerPrivateView,
  PlayerPublicView,
  PolicyType,
  Role,
  VoteChoice,
} from './types.js';
import {
  HITLER_ZONE_FASCIST_POLICIES,
  MAX_FAILED_ELECTIONS,
  ROLE_DISTRIBUTIONS,
  TOTAL_FASCIST_POLICIES,
  TOTAL_LIBERAL_POLICIES,
  VETO_UNLOCKED_FASCIST_POLICIES,
  WIN_FASCIST_POLICIES,
  WIN_LIBERAL_POLICIES,
  getExecutivePower,
} from './constants.js';

export class SecretHitlerGame {
  public readonly roomId: string;
  public phase: GamePhase = 'LOBBY';

  public players: Map<string, Player> = new Map();
  public seatingOrder: string[] = []; // Clockwise seating order of player IDs

  // Presidential succession
  public presidentId: string | null = null;
  public chancellorId: string | null = null;
  public nominatedChancellorId: string | null = null;

  // Term limit tracking (last successfully elected government)
  public lastElectedPresidentId: string | null = null;
  public lastElectedChancellorId: string | null = null;

  // Special election tracking
  public returnPresidencyId: string | null = null; // Next president after special election finishes

  // Decks
  public drawPile: PolicyType[] = [];
  public discardPile: PolicyType[] = [];

  // Board tracks
  public liberalPoliciesEnacted = 0;
  public fascistPoliciesEnacted = 0;
  public failedElectionCount = 0;

  // Legislative in-flight cards
  public presidentDrawnPolicies: PolicyType[] = [];
  public chancellorDrawnPolicies: PolicyType[] = [];
  public vetoRequested = false;

  // Voting
  public currentVotes: Record<string, VoteChoice> = {};
  public lastElection: ElectionRecord | null = null;

  // Executive action
  public pendingExecutivePower: ExecutivePower | null = null;
  public executivePowerTargetId: string | null = null;
  public policyPeekCards: PolicyType[] | null = null;
  public lastInvestigationResult: {
    investigatorId: string;
    targetId: string;
    targetName: string;
    membership: PartyMembership;
  } | null = null;

  // Victory
  public winner: 'LIBERAL' | 'FASCIST' | null = null;
  public winReason:
    | 'LIBERAL_5_POLICIES'
    | 'HITLER_EXECUTED'
    | 'FASCIST_6_POLICIES'
    | 'HITLER_ELECTED_CHANCELLOR'
    | null = null;

  // Logs
  public logs: GameLogEntry[] = [];
  public initialPlayerCount = 0;
  public lastChaosPolicy?: PolicyType;

  constructor(roomId: string) {
    this.roomId = roomId;
  }

  // --- Helpers ---
  private addLog(
    type: GameLogEntry['type'],
    message: string,
    data?: Record<string, any>
  ): void {
    this.logs.push({
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      type,
      message,
      data,
    });
  }

  private shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  public get livingPlayers(): Player[] {
    return this.seatingOrder
      .map((id) => this.players.get(id)!)
      .filter((p) => p && p.isAlive);
  }

  public get livingPlayerCount(): number {
    return this.livingPlayers.length;
  }

  // --- Lobby & Seating ---
  public addPlayer(id: string, name: string, isHost = false): Player {
    if (this.phase !== 'LOBBY') {
      throw new Error('Game already started');
    }
    if (this.players.size >= 10) {
      throw new Error('Room is full (max 10 players)');
    }

    const player: Player = {
      id,
      name,
      isHost,
      isConnected: true,
      isAlive: true,
      isReady: isHost,
      investigatedBy: [],
    };
    this.players.set(id, player);
    if (!this.seatingOrder.includes(id)) {
      this.seatingOrder.push(id);
    }
    return player;
  }

  public removePlayer(id: string): void {
    if (this.phase === 'LOBBY') {
      this.players.delete(id);
      this.seatingOrder = this.seatingOrder.filter((pId) => pId !== id);
      // Transfer host if host left
      const remaining = Array.from(this.players.values());
      if (remaining.length > 0 && !remaining.some((p) => p.isHost)) {
        remaining[0].isHost = true;
      }
    } else {
      const p = this.players.get(id);
      if (p) {
        p.isConnected = false;
      }
    }
  }

  public setSeatingOrder(newOrder: string[]): void {
    if (this.phase !== 'LOBBY') {
      throw new Error('Cannot change seating order once game has started');
    }
    // Validate all players exist
    if (
      newOrder.length === this.seatingOrder.length &&
      newOrder.every((id) => this.players.has(id))
    ) {
      this.seatingOrder = [...newOrder];
    }
  }

  // --- Game Initialization ---
  public startGame(): void {
    const count = this.players.size;
    if (count < 5 || count > 10) {
      throw new Error(`Invalid player count: ${count}. Must be between 5 and 10.`);
    }

    this.initialPlayerCount = count;

    // 1. Assign Roles
    const dist = ROLE_DISTRIBUTIONS[count];
    const roles: Role[] = [
      ...Array(dist.liberal).fill('LIBERAL'),
      ...Array(dist.fascist).fill('FASCIST'),
      ...Array(dist.hitler).fill('HITLER'),
    ];
    const shuffledRoles = this.shuffle(roles);

    const playerList = Array.from(this.players.values());
    for (let i = 0; i < playerList.length; i++) {
      const role = shuffledRoles[i];
      playerList[i].role = role;
      playerList[i].membership = role === 'LIBERAL' ? 'LIBERAL' : 'FASCIST';
      playerList[i].isAlive = true;
      playerList[i].investigatedBy = [];
    }

    // 2. Initialize Policy Deck (6 Liberal, 11 Fascist)
    const policies: PolicyType[] = [
      ...Array(TOTAL_LIBERAL_POLICIES).fill('LIBERAL'),
      ...Array(TOTAL_FASCIST_POLICIES).fill('FASCIST'),
    ];
    this.drawPile = this.shuffle(policies);
    this.discardPile = [];

    // 3. Reset Tracks
    this.liberalPoliciesEnacted = 0;
    this.fascistPoliciesEnacted = 0;
    this.failedElectionCount = 0;
    this.lastElectedPresidentId = null;
    this.lastElectedChancellorId = null;
    this.returnPresidencyId = null;
    this.winner = null;
    this.winReason = null;
    this.logs = [];

    // 4. Pick First President randomly
    const startIndex = Math.floor(Math.random() * this.seatingOrder.length);
    this.presidentId = this.seatingOrder[startIndex];
    this.chancellorId = null;
    this.nominatedChancellorId = null;

    this.phase = 'ROLE_REVEAL';
    this.addLog('GAME_START', `Game started with ${count} players. Roles assigned secretly.`);
  }

  // Acknowledge role and advance to first nomination
  public finishRoleReveal(): void {
    if (this.phase === 'ROLE_REVEAL') {
      this.phase = 'ELECTION_NOMINATION';
      const pres = this.players.get(this.presidentId!)?.name || 'President';
      this.addLog('NOMINATION', `${pres} is Presidential Candidate and must nominate a Chancellor.`);
    }
  }

  // --- Chancellor Eligibility Check ---
  public isEligibleChancellor(candidateId: string): boolean {
    const candidate = this.players.get(candidateId);
    if (!candidate || !candidate.isAlive) return false;
    if (candidateId === this.presidentId) return false;

    // Term limit check against LAST ELECTED government
    if (candidateId === this.lastElectedChancellorId) {
      return false;
    }

    // Previous president term limit applies ONLY if alive players > 5
    if (this.livingPlayerCount > 5) {
      if (candidateId === this.lastElectedPresidentId) {
        return false;
      }
    }

    return true;
  }

  public nominateChancellor(presidentId: string, chancellorId: string): void {
    if (this.phase !== 'ELECTION_NOMINATION') {
      throw new Error('Not in nomination phase');
    }
    if (this.presidentId !== presidentId) {
      throw new Error('Only the presidential candidate can nominate a chancellor');
    }
    if (!this.isEligibleChancellor(chancellorId)) {
      throw new Error('Nominated candidate is not eligible for Chancellor');
    }

    this.nominatedChancellorId = chancellorId;
    this.currentVotes = {};
    this.phase = 'ELECTION_VOTING';

    const presName = this.players.get(presidentId)?.name;
    const chanName = this.players.get(chancellorId)?.name;
    this.addLog('NOMINATION', `${presName} nominated ${chanName} as Chancellor.`);
  }

  // --- Voting ---
  public castVote(playerId: string, vote: VoteChoice): void {
    if (this.phase !== 'ELECTION_VOTING') {
      throw new Error('Not in voting phase');
    }
    const player = this.players.get(playerId);
    if (!player || !player.isAlive) {
      throw new Error('Dead or non-existent players cannot vote');
    }

    this.currentVotes[playerId] = vote;

    // Check if all living players have voted
    const living = this.livingPlayers;
    const allVoted = living.every((p) => this.currentVotes[p.id] !== undefined);

    if (allVoted) {
      this.resolveElection();
    }
  }

  private resolveElection(): void {
    const living = this.livingPlayers;
    let jaCount = 0;
    let neinCount = 0;

    for (const p of living) {
      const v = this.currentVotes[p.id];
      if (v === 'JA') jaCount++;
      else neinCount++;
    }

    // Strict majority required (> 50%)
    const passed = jaCount > living.length / 2;

    this.lastElection = {
      presidentCandidateId: this.presidentId!,
      chancellorCandidateId: this.nominatedChancellorId!,
      votes: { ...this.currentVotes },
      passed,
      jaCount,
      neinCount,
    };

    const presName = this.players.get(this.presidentId!)?.name;
    const chanName = this.players.get(this.nominatedChancellorId!)?.name;
    this.addLog(
      'VOTE_RESULT',
      `Government (${presName} & ${chanName}) ${passed ? 'ELECTED' : 'REJECTED'}: ${jaCount} Ja, ${neinCount} Nein.`,
      { passed, jaCount, neinCount }
    );

    if (passed) {
      this.handleElectionSuccess();
    } else {
      this.handleElectionFailure();
    }
  }

  private handleElectionSuccess(): void {
    this.chancellorId = this.nominatedChancellorId;
    this.nominatedChancellorId = null;

    // Check Hitler Chancellor win condition:
    // If at least 3 Fascist policies have been enacted AND newly elected Chancellor is Hitler => Fascists win!
    const electedChancellor = this.players.get(this.chancellorId!)!;
    if (
      this.fascistPoliciesEnacted >= HITLER_ZONE_FASCIST_POLICIES &&
      electedChancellor.role === 'HITLER'
    ) {
      this.winner = 'FASCIST';
      this.winReason = 'HITLER_ELECTED_CHANCELLOR';
      this.phase = 'GAME_OVER';
      this.addLog(
        'GAME_OVER',
        `Hitler (${electedChancellor.name}) was elected Chancellor after 3 Fascist policies! Fascists win!`
      );
      return;
    }

    // Set term limits on successful election
    this.lastElectedPresidentId = this.presidentId;
    this.lastElectedChancellorId = this.chancellorId;

    // Legislative Session begins
    this.startLegislativeSession();
  }

  private handleElectionFailure(): void {
    this.nominatedChancellorId = null;
    this.failedElectionCount++;

    if (this.failedElectionCount >= MAX_FAILED_ELECTIONS) {
      // CHAOS!
      this.triggerChaos();
    } else {
      this.advancePresident();
      this.phase = 'ELECTION_NOMINATION';
    }
  }

  private triggerChaos(): void {
    this.addLog('CHAOS_POLICY', '3 consecutive failed elections! Chaos ensues: enacting top policy.');

    // Enact top policy without presidential power
    const topCard = this.drawOneCard();
    this.lastChaosPolicy = topCard;

    if (topCard === 'LIBERAL') {
      this.liberalPoliciesEnacted++;
    } else {
      this.fascistPoliciesEnacted++;
    }

    this.failedElectionCount = 0;
    // Official rules: Chaos clears all previous term limits!
    this.lastElectedPresidentId = null;
    this.lastElectedChancellorId = null;

    this.addLog('POLICY_ENACTED', `Chaos enacted a ${topCard} policy.`);

    // Check victory conditions
    if (this.checkVictory()) {
      return;
    }

    // Advance president to next player
    this.advancePresident();
    this.phase = 'ELECTION_NOMINATION';
  }

  // --- Legislative Session ---
  private checkAndReshuffleDeck(neededCount = 3): void {
    if (this.drawPile.length < neededCount) {
      this.addLog(
        'DECK_RESHUFFLED',
        `Draw pile had ${this.drawPile.length} cards. Reshuffling ${this.discardPile.length} discarded cards.`
      );
      this.drawPile = this.shuffle([...this.drawPile, ...this.discardPile]);
      this.discardPile = [];
    }
  }

  private drawOneCard(): PolicyType {
    this.checkAndReshuffleDeck(1);
    if (this.drawPile.length === 0) {
      throw new Error('No cards available in deck or discard pile');
    }
    return this.drawPile.shift()!;
  }

  private startLegislativeSession(): void {
    this.checkAndReshuffleDeck(3);
    this.presidentDrawnPolicies = [
      this.drawPile.shift()!,
      this.drawPile.shift()!,
      this.drawPile.shift()!,
    ];
    this.chancellorDrawnPolicies = [];
    this.vetoRequested = false;
    this.phase = 'LEGISLATIVE_PRESIDENT';

    const presName = this.players.get(this.presidentId!)?.name;
    this.addLog('POLICY_ENACTED', `${presName} drew 3 policies and must discard 1.`);
  }

  public presidentDiscard(presidentId: string, cardIndex: number): void {
    if (this.phase !== 'LEGISLATIVE_PRESIDENT') {
      throw new Error('Not in President legislative phase');
    }
    if (this.presidentId !== presidentId) {
      throw new Error('Only the President can discard in this phase');
    }
    if (cardIndex < 0 || cardIndex >= this.presidentDrawnPolicies.length) {
      throw new Error('Invalid card index');
    }

    const [discarded] = this.presidentDrawnPolicies.splice(cardIndex, 1);
    this.discardPile.push(discarded);

    // Remaining 2 policies go to Chancellor
    this.chancellorDrawnPolicies = [...this.presidentDrawnPolicies];
    this.presidentDrawnPolicies = [];
    this.phase = 'LEGISLATIVE_CHANCELLOR';

    const chanName = this.players.get(this.chancellorId!)?.name;
    this.addLog('POLICY_ENACTED', `President passed 2 policies to Chancellor ${chanName}.`);
  }

  public chancellorDiscard(chancellorId: string, cardIndex: number): void {
    if (this.phase !== 'LEGISLATIVE_CHANCELLOR') {
      throw new Error('Not in Chancellor legislative phase');
    }
    if (this.chancellorId !== chancellorId) {
      throw new Error('Only the Chancellor can discard in this phase');
    }
    if (cardIndex < 0 || cardIndex >= this.chancellorDrawnPolicies.length) {
      throw new Error('Invalid card index');
    }

    const [discarded] = this.chancellorDrawnPolicies.splice(cardIndex, 1);
    this.discardPile.push(discarded);

    // The single remaining card is enacted!
    const enactedPolicy = this.chancellorDrawnPolicies[0];
    this.chancellorDrawnPolicies = [];

    this.enactPolicy(enactedPolicy);
  }

  // --- Veto Power ---
  public requestVeto(chancellorId: string): void {
    if (this.phase !== 'LEGISLATIVE_CHANCELLOR') {
      throw new Error('Not in Chancellor legislative phase');
    }
    if (this.chancellorId !== chancellorId) {
      throw new Error('Only the Chancellor can request a veto');
    }
    if (this.fascistPoliciesEnacted < VETO_UNLOCKED_FASCIST_POLICIES) {
      throw new Error('Veto power is not unlocked yet (requires 5 Fascist policies)');
    }

    this.vetoRequested = true;
    this.phase = 'LEGISLATIVE_VETO_OFFERED';

    const chanName = this.players.get(chancellorId)?.name;
    const presName = this.players.get(this.presidentId!)?.name;
    this.addLog('VETO_REQUESTED', `Chancellor ${chanName} requested a VETO. President ${presName} must decide.`);
  }

  public respondVeto(presidentId: string, agree: boolean): void {
    if (this.phase !== 'LEGISLATIVE_VETO_OFFERED') {
      throw new Error('Not in Veto response phase');
    }
    if (this.presidentId !== presidentId) {
      throw new Error('Only the President can respond to a veto request');
    }

    if (agree) {
      // Both cards discarded, no policy enacted
      this.discardPile.push(...this.chancellorDrawnPolicies);
      this.chancellorDrawnPolicies = [];
      this.vetoRequested = false;

      this.addLog('VETO_ACCEPTED', 'President agreed to the VETO. Both cards discarded.');

      // Election tracker increments +1
      this.failedElectionCount++;
      if (this.failedElectionCount >= MAX_FAILED_ELECTIONS) {
        this.triggerChaos();
      } else {
        this.advancePresident();
        this.phase = 'ELECTION_NOMINATION';
      }
    } else {
      // Veto rejected, Chancellor must enact one
      this.vetoRequested = false;
      this.phase = 'LEGISLATIVE_CHANCELLOR';
      this.addLog('VETO_REJECTED', 'President rejected the VETO. Chancellor must enact a policy.');
    }
  }

  // --- Policy Enactment & Executive Powers ---
  private enactPolicy(policy: PolicyType): void {
    if (policy === 'LIBERAL') {
      this.liberalPoliciesEnacted++;
    } else {
      this.fascistPoliciesEnacted++;
    }

    // A successfully enacted policy resets the election tracker
    this.failedElectionCount = 0;

    this.addLog('POLICY_ENACTED', `A ${policy} policy has been enacted!`);

    // Check immediate victory conditions
    if (this.checkVictory()) {
      return;
    }

    // Check if an Executive Power is triggered
    if (policy === 'FASCIST') {
      const power = getExecutivePower(this.initialPlayerCount, this.fascistPoliciesEnacted);
      if (power) {
        this.pendingExecutivePower = power;
        this.phase = 'EXECUTIVE_POWER';
        const presName = this.players.get(this.presidentId!)?.name;
        this.addLog('EXECUTIVE_ACTION', `Fascist policy unlocked executive power: ${power} for President ${presName}.`);
        return;
      }
    }

    // No executive power triggered, proceed to next round
    this.advancePresident();
    this.phase = 'ELECTION_NOMINATION';
  }

  public useExecutivePower(
    presidentId: string,
    power: ExecutivePower,
    targetId?: string
  ): void {
    if (this.phase !== 'EXECUTIVE_POWER') {
      throw new Error('Not in Executive Power phase');
    }
    if (this.presidentId !== presidentId) {
      throw new Error('Only the President can execute presidential powers');
    }
    if (this.pendingExecutivePower !== power) {
      throw new Error(`Expected power ${this.pendingExecutivePower}, but got ${power}`);
    }

    switch (power) {
      case 'INVESTIGATE_LOYALTY': {
        if (!targetId) throw new Error('Target required for Investigate Loyalty');
        if (targetId === presidentId) throw new Error('Cannot investigate yourself');
        const target = this.players.get(targetId);
        if (!target || !target.isAlive) throw new Error('Target must be a living player');
        if (target.investigatedBy?.includes(presidentId)) {
          throw new Error('Target player has already been investigated');
        }

        target.investigatedBy = target.investigatedBy || [];
        target.investigatedBy.push(presidentId);

        // Hitler has FASCIST membership, exactly like regular fascists
        this.lastInvestigationResult = {
          investigatorId: presidentId,
          targetId: target.id,
          targetName: target.name,
          membership: target.membership!,
        };

        this.addLog(
          'EXECUTIVE_ACTION',
          `President investigated the party membership of ${target.name}.`
        );
        this.pendingExecutivePower = null;
        this.advancePresident();
        this.phase = 'ELECTION_NOMINATION';
        break;
      }

      case 'SPECIAL_ELECTION': {
        if (!targetId) throw new Error('Target required for Special Election');
        if (targetId === presidentId) throw new Error('Cannot choose yourself for Special Election');
        const target = this.players.get(targetId);
        if (!target || !target.isAlive) throw new Error('Target must be a living player');

        // Save original succession: after the special election government ends,
        // presidency returns to the player to the left of the president who called it!
        if (this.returnPresidencyId === null) {
          const currentIndex = this.seatingOrder.indexOf(presidentId);
          this.returnPresidencyId = this.getNextLivingPlayerId(currentIndex);
        }

        this.presidentId = targetId;
        this.nominatedChancellorId = null;
        this.pendingExecutivePower = null;
        this.phase = 'ELECTION_NOMINATION';

        this.addLog(
          'SPECIAL_ELECTION',
          `President called a Special Election! ${target.name} is the next Presidential Candidate.`
        );
        break;
      }

      case 'POLICY_PEEK': {
        this.checkAndReshuffleDeck(3);
        // Look at top 3 cards without altering them
        this.policyPeekCards = this.drawPile.slice(0, 3);
        this.pendingExecutivePower = null;
        this.addLog('EXECUTIVE_ACTION', 'President peeked at the top 3 cards of the policy deck.');
        this.advancePresident();
        this.phase = 'ELECTION_NOMINATION';
        break;
      }

      case 'EXECUTION': {
        if (!targetId) throw new Error('Target required for Execution');
        if (targetId === presidentId) throw new Error('Cannot execute yourself');
        const target = this.players.get(targetId);
        if (!target || !target.isAlive) throw new Error('Target must be a living player');

        target.isAlive = false;
        this.addLog('PLAYER_EXECUTED', `President executed ${target.name}!`);

        // Check Hitler execution win condition:
        if (target.role === 'HITLER') {
          this.winner = 'LIBERAL';
          this.winReason = 'HITLER_EXECUTED';
          this.phase = 'GAME_OVER';
          this.addLog('GAME_OVER', `Hitler (${target.name}) was executed! Liberals win!`);
          return;
        }

        this.pendingExecutivePower = null;

        // If target was part of term limits or next in line, clean up
        if (this.lastElectedChancellorId === targetId) {
          this.lastElectedChancellorId = null;
        }
        if (this.lastElectedPresidentId === targetId) {
          this.lastElectedPresidentId = null;
        }

        this.advancePresident();
        this.phase = 'ELECTION_NOMINATION';
        break;
      }
    }
  }

  // --- Presidential Succession ---
  private getNextLivingPlayerId(fromIndex: number): string {
    const total = this.seatingOrder.length;
    for (let i = 1; i <= total; i++) {
      const idx = (fromIndex + i) % total;
      const candidateId = this.seatingOrder[idx];
      const p = this.players.get(candidateId);
      if (p && p.isAlive) {
        return candidateId;
      }
    }
    throw new Error('No living players left');
  }

  private advancePresident(): void {
    if (this.returnPresidencyId) {
      // Resume regular order after Special Election
      this.presidentId = this.returnPresidencyId;
      this.returnPresidencyId = null;
      // If the return player died in between, advance to next living
      const p = this.players.get(this.presidentId);
      if (!p || !p.isAlive) {
        const curIdx = this.seatingOrder.indexOf(this.presidentId);
        this.presidentId = this.getNextLivingPlayerId(curIdx);
      }
    } else {
      const currentIndex = this.seatingOrder.indexOf(this.presidentId!);
      this.presidentId = this.getNextLivingPlayerId(currentIndex);
    }

    this.nominatedChancellorId = null;
    this.currentVotes = {};
    this.policyPeekCards = null;
  }

  // --- Victory Verification ---
  private checkVictory(): boolean {
    if (this.liberalPoliciesEnacted >= WIN_LIBERAL_POLICIES) {
      this.winner = 'LIBERAL';
      this.winReason = 'LIBERAL_5_POLICIES';
      this.phase = 'GAME_OVER';
      this.addLog('GAME_OVER', 'Liberals enacted 5 policies! Liberals win!');
      return true;
    }
    if (this.fascistPoliciesEnacted >= WIN_FASCIST_POLICIES) {
      this.winner = 'FASCIST';
      this.winReason = 'FASCIST_6_POLICIES';
      this.phase = 'GAME_OVER';
      this.addLog('GAME_OVER', 'Fascists enacted 6 policies! Fascists win!');
      return true;
    }
    return false;
  }

  // --- Obfuscated Client Views (Security Guarantee) ---
  public getPublicState(): GameStatePublic {
    const publicPlayers: PlayerPublicView[] = this.seatingOrder.map((id) => {
      const p = this.players.get(id)!;
      return {
        id: p.id,
        name: p.name,
        avatarSeed: p.avatarSeed,
        isHost: p.isHost,
        isConnected: p.isConnected,
        isAlive: p.isAlive,
        isReady: p.isReady,
        hasInvestigated: (p.investigatedBy && p.investigatedBy.length > 0) || false,
      };
    });

    return {
      roomId: this.roomId,
      phase: this.phase,
      players: publicPlayers,
      seatingOrder: this.seatingOrder,
      presidentId: this.presidentId,
      chancellorId: this.chancellorId,
      nominatedChancellorId: this.nominatedChancellorId,
      lastElectedPresidentId: this.lastElectedPresidentId,
      lastElectedChancellorId: this.lastElectedChancellorId,
      liberalPoliciesEnacted: this.liberalPoliciesEnacted,
      fascistPoliciesEnacted: this.fascistPoliciesEnacted,
      failedElectionCount: this.failedElectionCount,
      vetoUnlocked: this.fascistPoliciesEnacted >= VETO_UNLOCKED_FASCIST_POLICIES,
      drawPileCount: this.drawPile.length,
      discardPileCount: this.discardPile.length,
      votedPlayerIds: Object.keys(this.currentVotes),
      lastElection: this.lastElection,
      pendingExecutivePower: this.pendingExecutivePower,
      executivePowerTargetId: this.executivePowerTargetId,
      winner: this.winner,
      winReason: this.winReason,
      logs: this.logs.slice(-30), // Latest 30 entries
      lastChaosPolicy: this.lastChaosPolicy,
    };
  }

  public getPlayerPrivateView(playerId: string): PlayerPrivateView | null {
    const player = this.players.get(playerId);
    if (!player) return null;

    const view: PlayerPrivateView = {
      id: player.id,
      name: player.name,
      isHost: player.isHost,
      isConnected: player.isConnected,
      isAlive: player.isAlive,
      role: player.role,
      membership: player.membership,
    };

    if (!player.role) {
      return view;
    }

    // Official knowledge distribution:
    if (player.role === 'LIBERAL') {
      // Liberals know nothing
      view.knownTeam = undefined;
    } else if (player.role === 'FASCIST') {
      // Regular fascists always know other fascists and Hitler
      const allies: { id: string; name: string; role: Role }[] = [];
      let hitlerInfo: { id: string; name: string } | undefined;

      for (const p of this.players.values()) {
        if (p.id === playerId) continue;
        if (p.role === 'FASCIST') {
          allies.push({ id: p.id, name: p.name, role: p.role });
        } else if (p.role === 'HITLER') {
          hitlerInfo = { id: p.id, name: p.name };
        }
      }
      view.knownTeam = { allies, hitler: hitlerInfo };
    } else if (player.role === 'HITLER') {
      // Hitler knowledge depends on player count:
      // In 5-6 player games: Hitler knows who the fascist is!
      // In 7-10 player games: Hitler knows NO ONE!
      if (this.initialPlayerCount <= 6) {
        const fascist = Array.from(this.players.values()).find(
          (p) => p.role === 'FASCIST'
        );
        view.knownTeam = {
          allies: fascist && fascist.role ? [{ id: fascist.id, name: fascist.name, role: fascist.role }] : [],
        };
      } else {
        view.knownTeam = undefined;
      }
    }

    return view;
  }

  public getClientState(playerId: string): ClientGameState {
    const publicState = this.getPublicState();
    const myPlayer = this.getPlayerPrivateView(playerId);

    const isPres = this.presidentId === playerId;
    const isChan = this.chancellorId === playerId;
    const isAlive = myPlayer ? myPlayer.isAlive : false;

    // Drawn policies access
    let drawnPolicies: PolicyType[] | undefined;
    if (this.phase === 'LEGISLATIVE_PRESIDENT' && isPres) {
      drawnPolicies = [...this.presidentDrawnPolicies];
    } else if (this.phase === 'LEGISLATIVE_CHANCELLOR' && isChan) {
      drawnPolicies = [...this.chancellorDrawnPolicies];
    }

    // Policy peek access
    let peekCards: PolicyType[] | undefined;
    if (this.policyPeekCards && isPres) {
      peekCards = [...this.policyPeekCards];
    }

    // Investigation result
    let investigatedLoyalty: ClientGameState['investigatedLoyalty'];
    if (
      this.lastInvestigationResult &&
      this.lastInvestigationResult.investigatorId === playerId
    ) {
      investigatedLoyalty = {
        targetId: this.lastInvestigationResult.targetId,
        targetName: this.lastInvestigationResult.targetName,
        membership: this.lastInvestigationResult.membership,
      };
    }

    // Action availability flags
    const canNominate =
      this.phase === 'ELECTION_NOMINATION' && isPres && isAlive;
    const canVote =
      this.phase === 'ELECTION_VOTING' &&
      isAlive &&
      this.currentVotes[playerId] === undefined;
    const canDiscardPresident =
      this.phase === 'LEGISLATIVE_PRESIDENT' && isPres && isAlive;
    const canDiscardChancellor =
      this.phase === 'LEGISLATIVE_CHANCELLOR' && isChan && isAlive;
    const canRequestVeto =
      this.phase === 'LEGISLATIVE_CHANCELLOR' &&
      isChan &&
      isAlive &&
      publicState.vetoUnlocked &&
      !this.vetoRequested;
    const canRespondVeto =
      this.phase === 'LEGISLATIVE_VETO_OFFERED' && isPres && isAlive;
    const canExecutePower =
      this.phase === 'EXECUTIVE_POWER' && isPres && isAlive;
    const canStartGame =
      this.phase === 'LOBBY' &&
      (myPlayer?.isHost ?? false) &&
      this.players.size >= 5 &&
      this.players.size <= 10;

    return {
      publicState,
      myPlayer,
      drawnPolicies,
      policyPeekCards: peekCards,
      investigatedLoyalty,
      availableActions: {
        canNominate,
        canVote,
        canDiscardPresident,
        canDiscardChancellor,
        canRequestVeto,
        canRespondVeto,
        canExecutePower,
        canStartGame,
      },
    };
  }

  // Restart game in same room
  public restartGame(): void {
    if (this.phase !== 'GAME_OVER') {
      throw new Error('Can only restart when game is over');
    }
    this.phase = 'LOBBY';
    this.startGame();
  }
}
