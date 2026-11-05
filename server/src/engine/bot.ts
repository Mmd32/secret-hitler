import { SecretHitlerGame } from './SecretHitlerGame.js';
import { VoteChoice } from './types.js';

export class SecretHitlerBot {
  public static makeDecision(game: SecretHitlerGame, botId: string): void {
    const clientState = game.getClientState(botId);
    const { availableActions, publicState, myPlayer, drawnPolicies } = clientState;

    if (!myPlayer || !myPlayer.isAlive) return;

    // 1. Chancellor Nomination
    if (availableActions.canNominate) {
      const eligible = publicState.players.filter((p) =>
        p.isAlive && game.isEligibleChancellor(p.id)
      );
      if (eligible.length > 0) {
        // Pick an eligible player
        const target = eligible[Math.floor(Math.random() * eligible.length)];
        game.nominateChancellor(botId, target.id);
      }
      return;
    }

    // 2. Voting
    if (availableActions.canVote) {
      // 80% Ja, 20% Nein (or based on role heuristic)
      let choice: VoteChoice = Math.random() < 0.8 ? 'JA' : 'NEIN';
      game.castVote(botId, choice);
      return;
    }

    // 3. President Discard
    if (availableActions.canDiscardPresident && drawnPolicies && drawnPolicies.length === 3) {
      // Discard policy:
      // If liberal: discard fascist if possible, else discard liberal
      // If fascist/hitler: discard liberal if possible, else fascist
      let discardIndex = 0;
      if (myPlayer.role === 'LIBERAL') {
        const fascistIndex = drawnPolicies.indexOf('FASCIST');
        discardIndex = fascistIndex !== -1 ? fascistIndex : 0;
      } else {
        const liberalIndex = drawnPolicies.indexOf('LIBERAL');
        discardIndex = liberalIndex !== -1 ? liberalIndex : 0;
      }
      game.presidentDiscard(botId, discardIndex);
      return;
    }

    // 4. Veto Request (Chancellor)
    if (availableActions.canRequestVeto) {
      // If both cards are opposite of interest, request veto with 50% chance
      if (Math.random() < 0.5) {
        game.requestVeto(botId);
        return;
      }
    }

    // 5. Chancellor Discard
    if (availableActions.canDiscardChancellor && drawnPolicies && drawnPolicies.length === 2) {
      let discardIndex = 0;
      if (myPlayer.role === 'LIBERAL') {
        const fascistIndex = drawnPolicies.indexOf('FASCIST');
        discardIndex = fascistIndex !== -1 ? fascistIndex : 0;
      } else {
        const liberalIndex = drawnPolicies.indexOf('LIBERAL');
        discardIndex = liberalIndex !== -1 ? liberalIndex : 0;
      }
      game.chancellorDiscard(botId, discardIndex);
      return;
    }

    // 6. Respond Veto (President)
    if (availableActions.canRespondVeto) {
      // President agrees 50% of the time
      game.respondVeto(botId, Math.random() < 0.5);
      return;
    }

    // 7. Executive Power
    if (availableActions.canExecutePower && publicState.pendingExecutivePower) {
      const power = publicState.pendingExecutivePower;
      const otherLiving = publicState.players.filter(
        (p) => p.isAlive && p.id !== botId
      );

      switch (power) {
        case 'INVESTIGATE_LOYALTY': {
          const eligibleToInvestigate = otherLiving.filter((p) => !p.hasInvestigated);
          const target = eligibleToInvestigate.length > 0 ? eligibleToInvestigate[0] : otherLiving[0];
          if (target) {
            game.useExecutivePower(botId, 'INVESTIGATE_LOYALTY', target.id);
          }
          break;
        }

        case 'SPECIAL_ELECTION': {
          if (otherLiving.length > 0) {
            const target = otherLiving[Math.floor(Math.random() * otherLiving.length)];
            game.useExecutivePower(botId, 'SPECIAL_ELECTION', target.id);
          }
          break;
        }

        case 'POLICY_PEEK': {
          game.useExecutivePower(botId, 'POLICY_PEEK');
          break;
        }

        case 'EXECUTION': {
          if (otherLiving.length > 0) {
            const target = otherLiving[Math.floor(Math.random() * otherLiving.length)];
            game.useExecutivePower(botId, 'EXECUTION', target.id);
          }
          break;
        }
      }
      return;
    }
  }
}

