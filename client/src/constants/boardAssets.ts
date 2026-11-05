// Tabletop Board Asset Configurations from asset-manifest.json

export interface SlotCoordinate {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  power: 'PEEK' | 'INVESTIGATE' | 'SPECIAL' | 'EXECUTION' | 'WIN' | null;
}

export interface BoardConfig {
  id: string;
  asset: string;
  naturalWidth: number;
  naturalHeight: number;
  slots: SlotCoordinate[];
}

export const LIBERAL_DESKTOP: BoardConfig = {
  id: 'liberal_desktop',
  asset: '/game-assets/boards/liberal_desktop.svg',
  naturalWidth: 1740,
  naturalHeight: 670,
  slots: [
    { index: 1, x: 162, y: 239, width: 268, height: 345, power: null },
    { index: 2, x: 449, y: 239, width: 268, height: 345, power: null },
    { index: 3, x: 736, y: 239, width: 268, height: 345, power: null },
    { index: 4, x: 1023, y: 239, width: 268, height: 345, power: null },
    { index: 5, x: 1310, y: 239, width: 268, height: 345, power: 'WIN' },
  ],
};

export const LIBERAL_MOBILE: BoardConfig = {
  id: 'liberal_mobile',
  asset: '/game-assets/boards/liberal_mobile.svg',
  naturalWidth: 800,
  naturalHeight: 1550,
  slots: [
    { index: 1, x: 139, y: 248, width: 246, height: 378, power: null },
    { index: 2, x: 415, y: 248, width: 246, height: 378, power: null },
    { index: 3, x: 139, y: 671, width: 246, height: 378, power: null },
    { index: 4, x: 415, y: 671, width: 246, height: 378, power: null },
    { index: 5, x: 277, y: 1094, width: 246, height: 378, power: 'WIN' },
  ],
};

export const FASCIST_5_6_DESKTOP: BoardConfig = {
  id: 'fascist_5_6_desktop',
  asset: '/game-assets/boards/fascist_5_6_desktop.svg',
  naturalWidth: 1740,
  naturalHeight: 670,
  slots: [
    { index: 1, x: 144, y: 239, width: 226, height: 345, power: null },
    { index: 2, x: 389, y: 239, width: 226, height: 345, power: null },
    { index: 3, x: 634, y: 239, width: 226, height: 345, power: 'PEEK' },
    { index: 4, x: 879, y: 239, width: 226, height: 345, power: 'EXECUTION' },
    { index: 5, x: 1124, y: 239, width: 226, height: 345, power: 'EXECUTION' },
    { index: 6, x: 1369, y: 239, width: 226, height: 345, power: 'WIN' },
  ],
};

export const FASCIST_5_6_MOBILE: BoardConfig = {
  id: 'fascist_5_6_mobile',
  asset: '/game-assets/boards/fascist_5_6_mobile.svg',
  naturalWidth: 800,
  naturalHeight: 1550,
  slots: [
    { index: 1, x: 139, y: 248, width: 246, height: 378, power: null },
    { index: 2, x: 415, y: 248, width: 246, height: 378, power: null },
    { index: 3, x: 139, y: 671, width: 246, height: 378, power: 'PEEK' },
    { index: 4, x: 415, y: 671, width: 246, height: 378, power: 'EXECUTION' },
    { index: 5, x: 139, y: 1094, width: 246, height: 378, power: 'EXECUTION' },
    { index: 6, x: 415, y: 1094, width: 246, height: 378, power: 'WIN' },
  ],
};

export const FASCIST_7_8_DESKTOP: BoardConfig = {
  id: 'fascist_7_8_desktop',
  asset: '/game-assets/boards/fascist_7_8_desktop.svg',
  naturalWidth: 1740,
  naturalHeight: 670,
  slots: [
    { index: 1, x: 144, y: 239, width: 226, height: 345, power: null },
    { index: 2, x: 389, y: 239, width: 226, height: 345, power: 'INVESTIGATE' },
    { index: 3, x: 634, y: 239, width: 226, height: 345, power: 'SPECIAL' },
    { index: 4, x: 879, y: 239, width: 226, height: 345, power: 'EXECUTION' },
    { index: 5, x: 1124, y: 239, width: 226, height: 345, power: 'EXECUTION' },
    { index: 6, x: 1369, y: 239, width: 226, height: 345, power: 'WIN' },
  ],
};

export const FASCIST_7_8_MOBILE: BoardConfig = {
  id: 'fascist_7_8_mobile',
  asset: '/game-assets/boards/fascist_7_8_mobile.svg',
  naturalWidth: 800,
  naturalHeight: 1550,
  slots: [
    { index: 1, x: 139, y: 248, width: 246, height: 378, power: null },
    { index: 2, x: 415, y: 248, width: 246, height: 378, power: 'INVESTIGATE' },
    { index: 3, x: 139, y: 671, width: 246, height: 378, power: 'SPECIAL' },
    { index: 4, x: 415, y: 671, width: 246, height: 378, power: 'EXECUTION' },
    { index: 5, x: 139, y: 1094, width: 246, height: 378, power: 'EXECUTION' },
    { index: 6, x: 415, y: 1094, width: 246, height: 378, power: 'WIN' },
  ],
};

export const FASCIST_9_10_DESKTOP: BoardConfig = {
  id: 'fascist_9_10_desktop',
  asset: '/game-assets/boards/fascist_9_10_desktop.svg',
  naturalWidth: 1740,
  naturalHeight: 670,
  slots: [
    { index: 1, x: 144, y: 239, width: 226, height: 345, power: 'INVESTIGATE' },
    { index: 2, x: 389, y: 239, width: 226, height: 345, power: 'INVESTIGATE' },
    { index: 3, x: 634, y: 239, width: 226, height: 345, power: 'SPECIAL' },
    { index: 4, x: 879, y: 239, width: 226, height: 345, power: 'EXECUTION' },
    { index: 5, x: 1124, y: 239, width: 226, height: 345, power: 'EXECUTION' },
    { index: 6, x: 1369, y: 239, width: 226, height: 345, power: 'WIN' },
  ],
};

export const FASCIST_9_10_MOBILE: BoardConfig = {
  id: 'fascist_9_10_mobile',
  asset: '/game-assets/boards/fascist_9_10_mobile.svg',
  naturalWidth: 800,
  naturalHeight: 1550,
  slots: [
    { index: 1, x: 139, y: 248, width: 246, height: 378, power: 'INVESTIGATE' },
    { index: 2, x: 415, y: 248, width: 246, height: 378, power: 'INVESTIGATE' },
    { index: 3, x: 139, y: 671, width: 246, height: 378, power: 'SPECIAL' },
    { index: 4, x: 415, y: 671, width: 246, height: 378, power: 'EXECUTION' },
    { index: 5, x: 139, y: 1094, width: 246, height: 378, power: 'EXECUTION' },
    { index: 6, x: 415, y: 1094, width: 246, height: 378, power: 'WIN' },
  ],
};

/**
 * Returns the exact Fascist board configuration based on initial player count and device format
 */
export function getFascistBoardConfig(playerCount: number, isMobile: boolean): BoardConfig {
  if (playerCount <= 6) {
    return isMobile ? FASCIST_5_6_MOBILE : FASCIST_5_6_DESKTOP;
  }
  if (playerCount <= 8) {
    return isMobile ? FASCIST_7_8_MOBILE : FASCIST_7_8_DESKTOP;
  }
  return isMobile ? FASCIST_9_10_MOBILE : FASCIST_9_10_DESKTOP;
}

/**
 * Helper to compute percentage CSS styles for any slot rectangle
 */
export function getSlotStyle(slot: SlotCoordinate, naturalWidth: number, naturalHeight: number) {
  return {
    left: `${(slot.x / naturalWidth) * 100}%`,
    top: `${(slot.y / naturalHeight) * 100}%`,
    width: `${(slot.width / naturalWidth) * 100}%`,
    height: `${(slot.height / naturalHeight) * 100}%`,
  };
}

