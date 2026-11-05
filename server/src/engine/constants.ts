import { ExecutivePower } from './types.js';

export const TOTAL_LIBERAL_POLICIES = 6;
export const TOTAL_FASCIST_POLICIES = 11;

export const WIN_LIBERAL_POLICIES = 5;
export const WIN_FASCIST_POLICIES = 6;

export const HITLER_ZONE_FASCIST_POLICIES = 3; // Election of Hitler as Chancellor wins for Fascists after 3 Fascist policies
export const VETO_UNLOCKED_FASCIST_POLICIES = 5; // Veto becomes available after 5 Fascist policies

export const MAX_FAILED_ELECTIONS = 3; // 3 failed elections triggers Chaos!

export interface RoleDistribution {
  liberal: number;
  fascist: number; // Regular Fascists (excluding Hitler)
  hitler: number;  // Always 1
}

export const ROLE_DISTRIBUTIONS: Record<number, RoleDistribution> = {
  5: { liberal: 3, fascist: 1, hitler: 1 },
  6: { liberal: 4, fascist: 1, hitler: 1 },
  7: { liberal: 4, fascist: 2, hitler: 1 },
  8: { liberal: 5, fascist: 2, hitler: 1 },
  9: { liberal: 5, fascist: 3, hitler: 1 },
  10: { liberal: 6, fascist: 3, hitler: 1 },
};

// Returns executive power unlocked at given fascist policy count (1-based index) for given player count
export function getExecutivePower(playerCount: number, fascistPolicyIndex: number): ExecutivePower | null {
  if (fascistPolicyIndex <= 0 || fascistPolicyIndex >= 6) {
    return null;
  }

  if (playerCount === 5 || playerCount === 6) {
    switch (fascistPolicyIndex) {
      case 3:
        return 'POLICY_PEEK';
      case 4:
      case 5:
        return 'EXECUTION';
      default:
        return null;
    }
  }

  if (playerCount === 7 || playerCount === 8) {
    switch (fascistPolicyIndex) {
      case 2:
        return 'INVESTIGATE_LOYALTY';
      case 3:
        return 'SPECIAL_ELECTION';
      case 4:
      case 5:
        return 'EXECUTION';
      default:
        return null;
    }
  }

  if (playerCount >= 9) {
    switch (fascistPolicyIndex) {
      case 1:
      case 2:
        return 'INVESTIGATE_LOYALTY';
      case 3:
        return 'SPECIAL_ELECTION';
      case 4:
      case 5:
        return 'EXECUTION';
      default:
        return null;
    }
  }

  return null;
}

