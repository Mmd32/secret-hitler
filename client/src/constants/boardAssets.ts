// Board art + exact slot rectangles measured from the final board PNGs (1740×670).
// Slots are sized to the 600:940 policy-card aspect ratio and centred in each printed frame.

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

type Power = SlotCoordinate['power'];

const W = 1740;
const H = 670;

const LIB_X = [178, 471, 765, 1058, 1351];
const FAS_X = [152, 408, 659, 911, 1163, 1414];

const liberalSlots = (): SlotCoordinate[] =>
  LIB_X.map((x, i) => ({ index: i + 1, x, y: 259, width: 210, height: 330, power: i === 4 ? 'WIN' : null }));

const fascistSlots = (powers: Power[]): SlotCoordinate[] =>
  FAS_X.map((x, i) => ({ index: i + 1, x, y: 247, width: 174, height: 272, power: powers[i] }));

export const LIBERAL_DESKTOP: BoardConfig = {
  id: 'liberal_desktop',
  asset: '/game-assets/boards/liberal_desktop.png',
  naturalWidth: W,
  naturalHeight: H,
  slots: liberalSlots(),
};

export const FASCIST_5_6_DESKTOP: BoardConfig = {
  id: 'fascist_5_6_desktop',
  asset: '/game-assets/boards/fascist_5_6_desktop.png',
  naturalWidth: W,
  naturalHeight: H,
  slots: fascistSlots([null, null, 'PEEK', 'EXECUTION', 'EXECUTION', 'WIN']),
};

export const FASCIST_7_8_DESKTOP: BoardConfig = {
  id: 'fascist_7_8_desktop',
  asset: '/game-assets/boards/fascist_7_8_desktop.png',
  naturalWidth: W,
  naturalHeight: H,
  slots: fascistSlots([null, 'INVESTIGATE', 'SPECIAL', 'EXECUTION', 'EXECUTION', 'WIN']),
};

export const FASCIST_9_10_DESKTOP: BoardConfig = {
  id: 'fascist_9_10_desktop',
  asset: '/game-assets/boards/fascist_9_10_desktop.png',
  naturalWidth: W,
  naturalHeight: H,
  slots: fascistSlots(['INVESTIGATE', 'INVESTIGATE', 'SPECIAL', 'EXECUTION', 'EXECUTION', 'WIN']),
};

// The final asset kit ships one wide board per track; it scales to any screen width,
// so the mobile flag is accepted for API compatibility but no longer changes the artwork.
export const LIBERAL_MOBILE = LIBERAL_DESKTOP;

export function getFascistBoardConfig(playerCount: number, _isMobile = false): BoardConfig {
  if (playerCount <= 6) return FASCIST_5_6_DESKTOP;
  if (playerCount <= 8) return FASCIST_7_8_DESKTOP;
  return FASCIST_9_10_DESKTOP;
}

/** Helper to compute percentage CSS styles for any slot rectangle */
export function getSlotStyle(slot: SlotCoordinate, naturalWidth: number, naturalHeight: number) {
  return {
    left: `${(slot.x / naturalWidth) * 100}%`,
    top: `${(slot.y / naturalHeight) * 100}%`,
    width: `${(slot.width / naturalWidth) * 100}%`,
    height: `${(slot.height / naturalHeight) * 100}%`,
  };
}
