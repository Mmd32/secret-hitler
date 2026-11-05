import React, { useState, useEffect } from 'react';
import {
  Vote,
  ShieldAlert,
  Landmark,
  Layers,
  Scale,
} from 'lucide-react';
import {
  LIBERAL_DESKTOP,
  LIBERAL_MOBILE,
  getFascistBoardConfig,
  getSlotStyle,
  BoardConfig,
} from '../constants/boardAssets.js';

interface BoardTracksProps {
  liberalPoliciesEnacted: number;
  fascistPoliciesEnacted: number;
  failedElectionCount: number;
  playerCount: number;
  drawPileCount?: number;
  discardPileCount?: number;
  lang: 'fa' | 'en';
}

export const BoardTracks: React.FC<BoardTracksProps> = ({
  liberalPoliciesEnacted,
  fascistPoliciesEnacted,
  failedElectionCount,
  playerCount,
  lang,
}) => {
  const isFa = lang === 'fa';
  const [mobileTab, setMobileTab] = useState<'both' | 'liberal' | 'fascist'>('both');
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  // Track responsive screen width for dedicated mobile vs desktop board SVG selection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(max-width: 1023px)');
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };

    mq.addEventListener('change', handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      mq.removeEventListener('change', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Select board configurations according to asset-manifest.json rules
  const liberalBoard: BoardConfig = isMobileScreen ? LIBERAL_MOBILE : LIBERAL_DESKTOP;
  const fascistBoard: BoardConfig = getFascistBoardConfig(playerCount, isMobileScreen);

  // Election tracker pawn positions on the dedicated election_tracker.svg (width: 900, height: 250)
  // Circle 1: x=300, y=157; Circle 2: x=450, y=157; Circle 3: x=600, y=157
  const getElectionMarkerStyle = (failedCount: number) => {
    let x = 145; // Inactive / 0 failed position
    if (failedCount === 1) x = 300;
    if (failedCount === 2) x = 450;
    if (failedCount >= 3) x = 600;

    const y = 157;
    const markerSize = 64; // Scaled for 900x250 canvas

    return {
      left: `${((x - markerSize / 2) / 900) * 100}%`,
      top: `${((y - markerSize / 2) / 250) * 100}%`,
      width: `${(markerSize / 900) * 100}%`,
      height: `${(markerSize / 250) * 100}%`,
    };
  };

  return (
    <div className="w-full flex flex-col gap-4 select-none my-2">
      {/* Mobile Board Switcher Tabs (Visible on mobile/tablet screens) */}
      <div className="flex lg:hidden items-center justify-center gap-1.5 p-1 rounded-2xl bg-[#140c08] border border-[#3d2314] max-w-md mx-auto w-full">
        <button
          onClick={() => setMobileTab('both')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'both'
              ? 'bg-[#2b180e] text-[#f4ecd8] border border-[#7a4925] shadow'
              : 'text-[#8a725e] hover:text-[#c49b5a]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isFa ? 'هر دو صفحه' : 'Both Boards'}</span>
        </button>
        <button
          onClick={() => setMobileTab('liberal')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'liberal'
              ? 'bg-[#142632] text-[#90d5f2] border border-[#2d5975] shadow'
              : 'text-[#8a725e] hover:text-[#90d5f2]'
          }`}
        >
          <Landmark className="w-3.5 h-3.5 text-[#54a9c7]" />
          <span>{isFa ? 'لیبرال' : 'Liberal'}</span>
          <span dir="ltr" className="tabular-nums font-mono text-[11px] opacity-80">
            ({liberalPoliciesEnacted}/5)
          </span>
        </button>
        <button
          onClick={() => setMobileTab('fascist')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'fascist'
              ? 'bg-[#2e0f0f] text-[#ff9999] border border-[#752d2d] shadow'
              : 'text-[#8a725e] hover:text-[#ff9999]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>{isFa ? 'فاشیست' : 'Fascist'}</span>
          <span dir="ltr" className="tabular-nums font-mono text-[11px] opacity-80">
            ({fascistPoliciesEnacted}/6)
          </span>
        </button>
      </div>

      {/* Main Tabletop Boards Layout (Responsive Grid: 1 col on mobile, 2 cols on wide desktop) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        
        {/* ============================================================ */}
        {/* 1. LIBERAL POLICY TRACK (Official SVG Board + Enacted Slots) */}
        {/* ============================================================ */}
        {(mobileTab === 'both' || mobileTab === 'liberal' || !isMobileScreen) && (
          <div className="w-full flex flex-col rounded-3xl overflow-hidden bg-[#0c1820] border-2 border-[#204052] shadow-[0_16px_36px_rgba(0,0,0,0.7)] transition-all">
            {/* Board Header Bar */}
            <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#09141b] border-b border-[#1c3848] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#54a9c7] shadow-[0_0_8px_rgba(84,169,199,0.8)]" />
                <span className="font-serif font-black text-xs sm:text-sm text-[#e6f4f8] tracking-wider uppercase">
                  {isFa ? 'صفحه قوانین لیبرال' : 'LIBERAL POLICY TRACK'}
                </span>
                <span className="hidden sm:inline text-[10px] font-mono text-[#628f9f] uppercase tracking-widest">
                  · {isMobileScreen ? 'MOBILE DEDICATED' : 'ARCHIVE LEGISLATIVE'}
                </span>
              </div>
              <div
                dir="ltr"
                className="tabular-nums font-mono font-bold text-xs sm:text-sm text-[#8cd2ec] bg-[#060e13] px-2.5 py-0.5 rounded-lg border border-[#1b3645] shadow-inner"
              >
                <bdi>{liberalPoliciesEnacted}</bdi> / 5
              </div>
            </div>

            {/* Board Canvas with Exact SVG Dimensions from Manifest */}
            <div
              className="relative w-full overflow-hidden bg-[#10202b]"
              style={{
                aspectRatio: `${liberalBoard.naturalWidth} / ${liberalBoard.naturalHeight}`,
              }}
            >
              {/* Scalable Vector Board Artwork from Asset Kit */}
              <img
                src={liberalBoard.asset}
                alt="Liberal Policy Board"
                className="w-full h-full object-contain pointer-events-none"
                draggable={false}
              />

              {/* Exact Policy Card Slots from asset-manifest.json */}
              {liberalBoard.slots.map((slot) => {
                const isEnacted = slot.index <= liberalPoliciesEnacted;
                const slotStyle = getSlotStyle(slot, liberalBoard.naturalWidth, liberalBoard.naturalHeight);

                return (
                  <div
                    key={`lib_slot_${slot.index}`}
                    style={slotStyle}
                    className="absolute flex items-center justify-center transition-all duration-300"
                  >
                    {isEnacted && (
                      <img
                        src="/game-assets/policy/liberal_policy.svg"
                        alt={`Liberal Policy ${slot.index}`}
                        className="w-full h-full object-fill rounded shadow-[0_6px_16px_rgba(0,0,0,0.8)] transform -translate-y-0.5 animate-fadeIn"
                        draggable={false}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Integrated Election Tracker Module */}
            <div className="px-3.5 py-2.5 bg-[#081218] border-t border-[#18313e] flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[#7ea0af]">
                <div className="flex items-center gap-1.5">
                  <Vote className="w-3.5 h-3.5 text-[#e2b76c]" />
                  <span className="font-serif font-bold text-[#d2e4ec]">
                    {isFa ? 'شمارنده انتخابات ناموفق:' : 'Election Tracker:'}
                  </span>
                  <span dir="ltr" className="tabular-nums font-bold text-[#eed49f]">
                    {failedElectionCount} / 3
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-[#5b7a88]">
                  {failedElectionCount === 3
                    ? isFa
                      ? '⚠️ هرج‌ومرج و تصویب فوری کارت!'
                      : '⚠️ Chaos! Top policy enacted!'
                    : isFa
                    ? '۳ شکست پیاپی = هرج‌ومرج'
                    : '3 failures = Chaos'}
                </span>
              </div>

              {/* Official Scalable Election Tracker SVG Board */}
              <div className="relative w-full max-w-md mx-auto aspect-[900/250] rounded-xl overflow-hidden border border-[#234252] shadow-inner bg-[#121c24]">
                <img
                  src="/game-assets/markers/election_tracker.svg"
                  alt="Election Tracker Board"
                  className="w-full h-full object-fill pointer-events-none"
                  draggable={false}
                />

                {/* Animated Moving Election Marker */}
                <div
                  style={getElectionMarkerStyle(failedElectionCount)}
                  className="absolute flex items-center justify-center transition-all duration-500 ease-out z-10"
                >
                  <img
                    src="/game-assets/markers/election_marker.svg"
                    alt={`Election Marker on ${failedElectionCount}`}
                    className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] animate-pulse"
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. FASCIST POLICY TRACK (Official SVG Board + Enacted Slots) */}
        {/* ============================================================ */}
        {(mobileTab === 'both' || mobileTab === 'fascist' || !isMobileScreen) && (
          <div className="w-full flex flex-col rounded-3xl overflow-hidden bg-[#1c0808] border-2 border-[#521c1c] shadow-[0_16px_36px_rgba(0,0,0,0.7)] transition-all">
            {/* Board Header Bar */}
            <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#140505] border-b border-[#381414] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span className="font-serif font-black text-xs sm:text-sm text-[#fbe8e8] tracking-wider uppercase">
                  {isFa ? 'صفحه قوانین فاشیست' : 'FASCIST POLICY TRACK'}
                </span>
                <span className="hidden sm:inline text-[10px] font-mono text-[#9f6262] uppercase tracking-widest">
                  · {playerCount} {isFa ? 'بازیکن' : 'PLAYERS'} ({isMobileScreen ? 'MOBILE' : 'DESKTOP'})
                </span>
              </div>
              <div
                dir="ltr"
                className="tabular-nums font-mono font-bold text-xs sm:text-sm text-[#ff9999] bg-[#0f0404] px-2.5 py-0.5 rounded-lg border border-[#3b1212] shadow-inner"
              >
                <bdi>{fascistPoliciesEnacted}</bdi> / 6
              </div>
            </div>

            {/* Board Canvas with Exact SVG Dimensions from Manifest */}
            <div
              className="relative w-full overflow-hidden bg-[#240a0a]"
              style={{
                aspectRatio: `${fascistBoard.naturalWidth} / ${fascistBoard.naturalHeight}`,
              }}
            >
              {/* Scalable Vector Board Artwork from Asset Kit */}
              <img
                src={fascistBoard.asset}
                alt={`Fascist Policy Board (${playerCount} Players)`}
                className="w-full h-full object-contain pointer-events-none"
                draggable={false}
              />

              {/* Exact Policy Card Slots from asset-manifest.json */}
              {fascistBoard.slots.map((slot) => {
                const isEnacted = slot.index <= fascistPoliciesEnacted;
                const slotStyle = getSlotStyle(slot, fascistBoard.naturalWidth, fascistBoard.naturalHeight);

                return (
                  <div
                    key={`fas_slot_${slot.index}`}
                    style={slotStyle}
                    className="absolute flex items-center justify-center transition-all duration-300"
                  >
                    {isEnacted && (
                      <img
                        src="/game-assets/policy/fascist_policy.svg"
                        alt={`Fascist Policy ${slot.index}`}
                        className="w-full h-full object-fill rounded shadow-[0_6px_16px_rgba(0,0,0,0.8)] transform -translate-y-0.5 animate-fadeIn"
                        draggable={false}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hitler Danger Zone & Veto Status Footer */}
            <div className="px-3.5 py-2.5 bg-[#0f0303] border-t border-[#300e0e] flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[#aa7979]">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-serif font-bold text-[#f5dede]">
                    {isFa ? 'منطقه خطر هیتلر:' : 'Hitler Danger Zone:'}
                  </span>
                  <span className={fascistPoliciesEnacted >= 3 ? 'text-amber-400 font-bold' : 'text-[#7e5c5c]'}>
                    {isFa ? 'از قانون ۳ به بعد' : '§ 3+ Enacted'}
                  </span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-[#855959]">
                  {fascistPoliciesEnacted >= 5
                    ? isFa
                      ? 'حق وتو فعال شد!'
                      : 'Veto Unlocked!'
                    : fascistPoliciesEnacted >= 3
                    ? isFa
                      ? 'انتخاب هیتلر = پیروزی فاشیست'
                      : 'Hitler elected = Fascist win'
                    : isFa
                    ? '۶ قانون = پیروزی فاشیست'
                    : '6 policies = Fascist win'}
                </span>
              </div>

              {/* Veto Unlocked Badge from Asset Kit */}
              {fascistPoliciesEnacted >= 5 && (
                <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-xl bg-amber-950/40 border border-amber-600/60 text-amber-200 text-xs font-serif font-bold animate-fadeIn">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>
                    {isFa
                      ? 'حق وتو توسط رئیس‌جمهور و صدراعظم فعال شد'
                      : 'Veto Power Active for Legislative Sessions'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
