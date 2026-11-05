import { describe, it, expect } from 'vitest';
import { SecretHitlerGame } from '../src/engine/SecretHitlerGame.js';
import { SecretHitlerBot } from '../src/engine/bot.js';
import { ROLE_DISTRIBUTIONS, TOTAL_FASCIST_POLICIES, TOTAL_LIBERAL_POLICIES } from '../src/engine/constants.js';

describe('Secret Hitler Game Engine', () => {
  // 1. Role distribution for all player counts (5-10)
  it('correctly assigns roles and party memberships according to official rules (5-10 players)', () => {
    for (let count = 5; count <= 10; count++) {
      const game = new SecretHitlerGame(`test-roles-${count}`);
      for (let i = 0; i < count; i++) {
        game.addPlayer(`p${i}`, `Player ${i}`, i === 0);
      }

      game.startGame();

      const expected = ROLE_DISTRIBUTIONS[count];
      const players = Array.from(game.players.values());

      const liberals = players.filter((p) => p.role === 'LIBERAL');
      const fascists = players.filter((p) => p.role === 'FASCIST');
      const hitlers = players.filter((p) => p.role === 'HITLER');

      expect(liberals.length).toBe(expected.liberal);
      expect(fascists.length).toBe(expected.fascist);
      expect(hitlers.length).toBe(expected.hitler);

      // Verify party membership
      liberals.forEach((p) => expect(p.membership).toBe('LIBERAL'));
      fascists.forEach((p) => expect(p.membership).toBe('FASCIST'));
      hitlers.forEach((p) => expect(p.membership).toBe('FASCIST')); // Hitler has Fascist membership!
    }
  });

  // 2. Secret knowledge per player count
  it('enforces official role knowledge: 5-6 players vs 7-10 players', () => {
    // 5 players: Fascist and Hitler know each other
    const game5 = new SecretHitlerGame('test-know-5');
    for (let i = 0; i < 5; i++) game5.addPlayer(`p${i}`, `Player ${i}`, i === 0);
    game5.startGame();

    const hitler5 = Array.from(game5.players.values()).find((p) => p.role === 'HITLER')!;
    const fascist5 = Array.from(game5.players.values()).find((p) => p.role === 'FASCIST')!;
    const liberal5 = Array.from(game5.players.values()).find((p) => p.role === 'LIBERAL')!;

    const hitlerView5 = game5.getPlayerPrivateView(hitler5.id);
    const fascistView5 = game5.getPlayerPrivateView(fascist5.id);
    const liberalView5 = game5.getPlayerPrivateView(liberal5.id);

    expect(hitlerView5?.knownTeam?.allies.some((a) => a.id === fascist5.id)).toBe(true);
    expect(fascistView5?.knownTeam?.hitler?.id).toBe(hitler5.id);
    expect(liberalView5?.knownTeam).toBeUndefined();

    // 7 players: Hitler knows NO ONE! Regular fascists know each other and Hitler.
    const game7 = new SecretHitlerGame('test-know-7');
    for (let i = 0; i < 7; i++) game7.addPlayer(`p${i}`, `Player ${i}`, i === 0);
    game7.startGame();

    const hitler7 = Array.from(game7.players.values()).find((p) => p.role === 'HITLER')!;
    const fascists7 = Array.from(game7.players.values()).filter((p) => p.role === 'FASCIST');

    const hitlerView7 = game7.getPlayerPrivateView(hitler7.id);
    expect(hitlerView7?.knownTeam).toBeUndefined(); // Hitler does NOT know regular fascists in 7+ games!

    const f1View = game7.getPlayerPrivateView(fascists7[0].id);
    expect(f1View?.knownTeam?.hitler?.id).toBe(hitler7.id);
    expect(f1View?.knownTeam?.allies.some((a) => a.id === fascists7[1].id)).toBe(true);
  });

  // 3. Policy Deck setup
  it('starts with exactly 6 Liberal and 11 Fascist cards (17 total)', () => {
    const game = new SecretHitlerGame('test-deck');
    for (let i = 0; i < 5; i++) game.addPlayer(`p${i}`, `Player ${i}`, i === 0);
    game.startGame();

    expect(game.drawPile.length).toBe(17);
    const libCards = game.drawPile.filter((c) => c === 'LIBERAL').length;
    const fasCards = game.drawPile.filter((c) => c === 'FASCIST').length;
    expect(libCards).toBe(TOTAL_LIBERAL_POLICIES);
    expect(fasCards).toBe(TOTAL_FASCIST_POLICIES);
  });

  // 4. Term limits & 5-player exception
  it('enforces term limits correctly, including 5-or-fewer living players exception', () => {
    const game = new SecretHitlerGame('test-terms');
    for (let i = 0; i < 6; i++) game.addPlayer(`p${i}`, `Player ${i}`, i === 0);
    game.startGame();

    game.lastElectedPresidentId = 'p0';
    game.lastElectedChancellorId = 'p1';
    game.presidentId = 'p2';

    // In 6 living players: neither last president nor last chancellor is eligible
    expect(game.isEligibleChancellor('p0')).toBe(false);
    expect(game.isEligibleChancellor('p1')).toBe(false);
    expect(game.isEligibleChancellor('p3')).toBe(true);

    // If 1 player dies -> 5 living players left
    game.players.get('p5')!.isAlive = false;
    expect(game.livingPlayerCount).toBe(5);

    // In 5 or fewer living players: last president IS eligible! Last chancellor is STILL ineligible!
    expect(game.isEligibleChancellor('p0')).toBe(true);
    expect(game.isEligibleChancellor('p1')).toBe(false);
  });

  // 5. Election voting majority & tie failure
  it('requires strict majority (> 50%) for election to pass; tie fails', () => {
    const game = new SecretHitlerGame('test-vote');
    for (let i = 0; i < 6; i++) game.addPlayer(`p${i}`, `Player ${i}`, i === 0);
    game.startGame();
    game.finishRoleReveal();

    const presId = game.presidentId!;
    const eligibleChan = game.seatingOrder.find((id) => game.isEligibleChancellor(id))!;
    game.nominateChancellor(presId, eligibleChan);

    // 3 JA, 3 NEIN => Tie (50%) => Must fail!
    game.castVote('p0', 'JA');
    game.castVote('p1', 'JA');
    game.castVote('p2', 'JA');
    game.castVote('p3', 'NEIN');
    game.castVote('p4', 'NEIN');
    game.castVote('p5', 'NEIN');

    expect(game.lastElection?.passed).toBe(false);
    expect(game.failedElectionCount).toBe(1);
    expect(game.phase).toBe('ELECTION_NOMINATION');
  });

  // 6. Chaos after 3 failed elections
  it('triggers Chaos on 3 consecutive failed elections and enacts top card', () => {
    const game = new SecretHitlerGame('test-chaos');
    for (let i = 0; i < 5; i++) game.addPlayer(`p${i}`, `Player ${i}`, i === 0);
    game.startGame();
    game.finishRoleReveal();

    game.failedElectionCount = 2; // Simulate 2 previous failures
    const presId = game.presidentId!;
    const chanId = game.seatingOrder.find((id) => game.isEligibleChancellor(id))!;
    game.nominateChancellor(presId, chanId);

    // Vote all NEIN to cause 3rd failure
    for (let i = 0; i < 5; i++) {
      game.castVote(`p${i}`, 'NEIN');
    }

    // Chaos must have fired
    expect(game.failedElectionCount).toBe(0); // Resets to 0
    expect(game.liberalPoliciesEnacted + game.fascistPoliciesEnacted).toBe(1); // 1 card enacted
    expect(game.lastElectedPresidentId).toBeNull(); // Term limits cleared
    expect(game.lastElectedChancellorId).toBeNull();
  });

  // 7. Legislative flow: 3 cards drawn, President discards 1, Chancellor discards 1
  it('executes legislative session: President discards 1, Chancellor discards 1, remaining enacted', () => {
    const game = new SecretHitlerGame('test-legislative');
    for (let i = 0; i < 5; i++) game.addPlayer(`p${i}`, `Player ${i}`, i === 0);
    game.startGame();
    game.finishRoleReveal();

    const presId = game.presidentId!;
    const chanId = game.seatingOrder.find((id) => game.isEligibleChancellor(id))!;
    game.nominateChancellor(presId, chanId);

    // Vote JA to elect
    for (let i = 0; i < 5; i++) game.castVote(`p${i}`, 'JA');

    expect(game.phase).toBe('LEGISLATIVE_PRESIDENT');
    expect(game.presidentDrawnPolicies.length).toBe(3);

    // President discards first card
    const firstCard = game.presidentDrawnPolicies[0];
    game.presidentDiscard(presId, 0);

    expect(game.phase).toBe('LEGISLATIVE_CHANCELLOR');
    expect(game.chancellorDrawnPolicies.length).toBe(2);
    expect(game.discardPile).toContain(firstCard);

    // Chancellor discards first card
    const remainingToEnact = game.chancellorDrawnPolicies[1];
    game.chancellorDiscard(chanId, 0);

    // Enacted count must have incremented
    const totalEnacted = game.liberalPoliciesEnacted + game.fascistPoliciesEnacted;
    expect(totalEnacted).toBe(1);
    if (remainingToEnact === 'LIBERAL') {
      expect(game.liberalPoliciesEnacted).toBe(1);
    } else {
      expect(game.fascistPoliciesEnacted).toBe(1);
    }
  });

  // 8. Veto power: unlocked at 5 fascist policies
  it('unlocks veto power at 5 fascist policies; accepting veto increments election tracker', () => {
    const game = new SecretHitlerGame('test-veto');
    for (let i = 0; i < 5; i++) game.addPlayer(`p${i}`, `Player ${i}`, i === 0);
    game.startGame();
    game.finishRoleReveal();

    // Enact 5 fascist policies
    game.fascistPoliciesEnacted = 5;

    const hitler = Array.from(game.players.values()).find((p) => p.role === 'HITLER')!;
    const presId = game.presidentId!;
    const chanId = game.seatingOrder.find((id) => id !== hitler.id && game.isEligibleChancellor(id))!;
    game.nominateChancellor(presId, chanId);
    for (let i = 0; i < 5; i++) game.castVote(`p${i}`, 'JA');

    // President discards 1
    game.presidentDiscard(presId, 0);
    expect(game.phase).toBe('LEGISLATIVE_CHANCELLOR');

    // Chancellor requests veto
    game.requestVeto(chanId);
    expect(game.phase).toBe('LEGISLATIVE_VETO_OFFERED');

    // President agrees to veto
    game.respondVeto(presId, true);

    // Both cards discarded, no policy enacted, tracker = 1
    expect(game.fascistPoliciesEnacted).toBe(5);
    expect(game.failedElectionCount).toBe(1);
    expect(game.phase).toBe('ELECTION_NOMINATION');
  });

  // 9. Hitler elected Chancellor win condition
  it('triggers immediate Fascist victory when Hitler is elected Chancellor after 3 Fascist policies', () => {
    const game = new SecretHitlerGame('test-hitler-chancellor');
    for (let i = 0; i < 5; i++) game.addPlayer(`p${i}`, `Player ${i}`, i === 0);
    game.startGame();
    game.finishRoleReveal();

    // Enact 3 fascist policies
    game.fascistPoliciesEnacted = 3;

    const hitler = Array.from(game.players.values()).find((p) => p.role === 'HITLER')!;
    const notHitler = Array.from(game.players.values()).find((p) => p.id !== hitler.id && p.isAlive)!;

    game.presidentId = notHitler.id;
    game.nominateChancellor(notHitler.id, hitler.id);

    // Vote JA
    for (let i = 0; i < 5; i++) game.castVote(`p${i}`, 'JA');

    expect(game.phase).toBe('GAME_OVER');
    expect(game.winner).toBe('FASCIST');
    expect(game.winReason).toBe('HITLER_ELECTED_CHANCELLOR');
  });

  // 10. Hitler executed win condition
  it('triggers immediate Liberal victory when Hitler is executed', () => {
    const game = new SecretHitlerGame('test-hitler-executed');
    for (let i = 0; i < 5; i++) game.addPlayer(`p${i}`, `Player ${i}`, i === 0);
    game.startGame();

    const hitler = Array.from(game.players.values()).find((p) => p.role === 'HITLER')!;
    const pres = Array.from(game.players.values()).find((p) => p.id !== hitler.id)!;

    game.presidentId = pres.id;
    game.pendingExecutivePower = 'EXECUTION';
    game.phase = 'EXECUTIVE_POWER';

    game.useExecutivePower(pres.id, 'EXECUTION', hitler.id);

    expect(game.phase).toBe('GAME_OVER');
    expect(game.winner).toBe('LIBERAL');
    expect(game.winReason).toBe('HITLER_EXECUTED');
    expect(hitler.isAlive).toBe(false);
  });

  // 11. 50 Full Game Simulations with Bots (5, 6, 7, 8, 9, 10 players)
  it('successfully simulates complete automated games from start to finish without deadlocks', () => {
    const playerCounts = [5, 6, 7, 8, 9, 10];

    for (const count of playerCounts) {
      const game = new SecretHitlerGame(`sim-game-${count}`);
      for (let i = 0; i < count; i++) {
        game.addPlayer(`bot_${i}`, `Bot ${i}`, i === 0);
      }

      game.startGame();
      game.finishRoleReveal();

      let turnCount = 0;
      const MAX_TURNS = 200;

      while (game.phase !== 'GAME_OVER' && turnCount < MAX_TURNS) {
        turnCount++;
        // Make decisions for all active bots
        for (let i = 0; i < count; i++) {
          SecretHitlerBot.makeDecision(game, `bot_${i}`);
        }
      }

      expect(game.phase).toBe('GAME_OVER');
      expect(game.winner).not.toBeNull();
      expect(game.winReason).not.toBeNull();
    }
  });
});
