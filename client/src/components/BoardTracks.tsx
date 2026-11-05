import React, { useState } from 'react';
import {
  Vote,
  ShieldAlert,
  Landmark,
  Layers,
} from 'lucide-react';

interface BoardTracksProps {
  liberalPoliciesEnacted: number;
  fascistPoliciesEnacted: number;
  failedElectionCount: number;
  playerCount: number;
  drawPileCount?: number;
  discardPileCount?: number;
  lang: 'fa' | 'en';
}

const VIEWBOX_W = 1683;
const VIEWBOX_H = 650;

function toPercentRect(x: number, y: number, w: number, h: number) {
  return {
    left: `${(x / VIEWBOX_W) * 100}%`,
    top: `${(y / VIEWBOX_H) * 100}%`,
    width: `${(w / VIEWBOX_W) * 100}%`,
    height: `${(h / VIEWBOX_H) * 100}%`,
  };
}

// Exact pixel coordinates from official Secret Hitler print & play boards
const LIBERAL_SLOTS = [
  toPercentRect(285, 182, 194, 268),
  toPercentRect(515, 182, 194, 268),
  toPercentRect(745, 182, 194, 268),
  toPercentRect(975, 182, 194, 268),
  toPercentRect(1205, 182, 194, 268),
];

const TRACKER_SLOTS = [
  toPercentRect(582, 495, 42, 46),
  toPercentRect(736, 495, 42, 46),
  toPercentRect(890, 495, 42, 46),
  toPercentRect(1044, 495, 42, 46),
];

const FASCIST_SLOTS = [
  toPercentRect(170, 182, 194.3, 268),
  toPercentRect(400, 182, 194.3, 268),
  toPercentRect(630, 182, 194.3, 268),
  toPercentRect(860, 182, 194.3, 268),
  toPercentRect(1090, 182, 194.3, 268),
  toPercentRect(1320, 182, 194.3, 268),
];

export const BoardTracks: React.FC<BoardTracksProps> = ({
  liberalPoliciesEnacted,
  fascistPoliciesEnacted,
  failedElectionCount,
  playerCount,
  lang,
}) => {
  const isFa = lang === 'fa';
  const [mobileTab, setMobileTab] = useState<'both' | 'liberal' | 'fascist'>('both');

  // Select appropriate Fascist board version according to official rules
  const getFascistBoardSrc = () => {
    if (playerCount <= 6) return '/board/official/board-fascist-5-6.png';
    if (playerCount <= 8) return '/board/official/board-fascist-7-8.png';
    return '/board/official/board-fascist-9-10.png';
  };

  const fascistBoardSrc = getFascistBoardSrc();

  return (
    <div className="w-full flex flex-col gap-4 select-none my-2">
      {/* Mobile Board Switcher Tabs (Visible on mobile/tablet screens) */}
      <div className="flex xl:hidden items-center justify-center gap-1.5 p-1 rounded-2xl bg-[#140c08] border border-[#3d2314] max-w-md mx-auto w-full">
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
      <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">
        
        {/* ============================================================ */}
        {/* 1. LIBERAL BOARD (Archival Prussian Blue Weimar Track)       */}
        {/* ============================================================ */}
        {(mobileTab === 'both' || mobileTab === 'liberal') && (
          <div className="w-full flex flex-col rounded-3xl overflow-hidden bg-[#0c1820] border-2 border-[#204052] shadow-[0_16px_36px_rgba(0,0,0,0.7)] transition-all">
            {/* Board Header Bar */}
            <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#09141b] border-b border-[#1c3848] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#54a9c7] shadow-[0_0_8px_rgba(84,169,199,0.8)]" />
                <span className="font-serif font-black text-xs sm:text-sm text-[#e6f4f8] tracking-wider uppercase">
                  {isFa ? 'صفحه قوانین لیبرال' : 'LIBERAL POLICY TRACK'}
                </span>
                <span className="hidden sm:inline text-[10px] font-mono text-[#628f9f] uppercase tracking-widest">
                  · REICHSGESETZBLATT
                </span>
              </div>
              <div
                dir="ltr"
                className="tabular-nums font-mono font-bold text-xs sm:text-sm text-[#8cd2ec] bg-[#060e13] px-2.5 py-0.5 rounded-lg border border-[#1b3645] shadow-inner"
              >
                <bdi>{liberalPoliciesEnacted}</bdi> / 5
              </div>
            </div>

            {/* Board Canvas with Exact 1683:650 Aspect Ratio */}
            <div className="relative w-full aspect-[1683/650] overflow-hidden bg-[#10202b]">
              {/* Authentic Print & Play Board Texture */}
              <img
                src="/board/official/board-liberal.png"
                alt="Liberal Board"
                className="w-full h-full object-fill pointer-events-none"
                draggable={false}
              />

              {/* 5 Enacted Policy Card Overlays */}
              {LIBERAL_SLOTS.map((rectStyle, index) => {
                const isEnacted = index < liberalPoliciesEnacted;
                return (
                  <div
                    key={`lib_slot_${index}`}
                    style={rectStyle}
                    className="absolute flex items-center justify-center transition-all duration-300"
                  >
                    {isEnacted && (
                      <img
                        src="/cards/official/policy-liberal.png"
                        alt={`Liberal Policy ${index + 1}`}
                        className="w-full h-full object-fill rounded shadow-[0_4px_12px_rgba(0,0,0,0.8)] transform -translate-y-0.5 animate-fadeIn"
                        draggable={false}
                      />
                    )}
                  </div>
                );
              })}

              {/* Election Tracker Moving Wooden Pawn */}
              {TRACKER_SLOTS[failedElectionCount] && (
                <div
                  style={TRACKER_SLOTS[failedElectionCount]}
                  className="absolute flex items-center justify-center transition-all duration-500 ease-out z-10"
                >
                  <img
                    src="/board/official/board-tracker.png"
                    alt={`Election Tracker Position ${failedElectionCount}`}
                    className="w-full h-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] animate-pulse"
                    draggable={false}
                  />
                </div>
              )}
            </div>

            {/* Election Tracker Legend / Explanatory Footer */}
            <div className="px-3.5 py-2 bg-[#081218] border-t border-[#18313e] flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[#7ea0af]">
              <div className="flex items-center gap-1.5">
                <Vote className="w-3.5 h-3.5 text-[#e2b76c]" />
                <span className="font-serif font-bold text-[#d2e4ec]">
                  {isFa ? 'شمارنده ناکامی:' : 'Election Tracker:'}
                </span>
                <span dir="ltr" className="tabular-nums font-bold text-[#eed49f]">
                  {failedElectionCount} / 3
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-[#5b7a88]">
                {failedElectionCount === 3
                  ? isFa
                    ? '⚠️ هرج‌ومرج و تصویب فوری قانون بالا!'
                    : '⚠️ Chaos! Top policy enacted!'
                  : isFa
                  ? '۳ شکست پیاپی = هرج‌ومرج'
                  : '3 failures = Chaos'}
              </span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. FASCIST BOARD (Oxblood Red Imperial Track)                */}
        {/* ============================================================ */}
        {(mobileTab === 'both' || mobileTab === 'fascist') && (
          <div className="w-full flex flex-col rounded-3xl overflow-hidden bg-[#1c0808] border-2 border-[#521c1c] shadow-[0_16px_36px_rgba(0,0,0,0.7)] transition-all">
            {/* Board Header Bar */}
            <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#140505] border-b border-[#381414] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span className="font-serif font-black text-xs sm:text-sm text-[#fbe8e8] tracking-wider uppercase">
                  {isFa ? 'صفحه قوانین فاشیست' : 'FASCIST POLICY TRACK'}
                </span>
                <span className="hidden sm:inline text-[10px] font-mono text-[#9f6262] uppercase tracking-widest">
                  · {playerCount} {isFa ? 'بازیکن' : 'PLAYERS'}
                </span>
              </div>
              <div
                dir="ltr"
                className="tabular-nums font-mono font-bold text-xs sm:text-sm text-[#ff9999] bg-[#0f0404] px-2.5 py-0.5 rounded-lg border border-[#3b1212] shadow-inner"
              >
                <bdi>{fascistPoliciesEnacted}</bdi> / 6
              </div>
            </div>

            {/* Board Canvas with Exact 1683:650 Aspect Ratio */}
            <div className="relative w-full aspect-[1683/650] overflow-hidden bg-[#240a0a]">
              {/* Authentic Print & Play Board Texture */}
              <img
                src={fascistBoardSrc}
                alt={`Fascist Board (${playerCount} Players)`}
                className="w-full h-full object-fill pointer-events-none"
                draggable={false}
              />

              {/* 6 Enacted Policy Card Overlays */}
              {FASCIST_SLOTS.map((rectStyle, index) => {
                const isEnacted = index < fascistPoliciesEnacted;
                return (
                  <div
                    key={`fas_slot_${index}`}
                    style={rectStyle}
                    className="absolute flex items-center justify-center transition-all duration-300"
                  >
                    {isEnacted && (
                      <img
                        src="/cards/official/policy-fascist.png"
                        alt={`Fascist Policy ${index + 1}`}
                        className="w-full h-full object-fill rounded shadow-[0_4px_12px_rgba(0,0,0,0.8)] transform -translate-y-0.5 animate-fadeIn"
                        draggable={false}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hitler Danger Zone & Executive Powers Footer */}
            <div className="px-3.5 py-2 bg-[#0f0303] border-t border-[#300e0e] flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[#aa7979]">
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
                    ? 'وتو فعال + ۱ قانون تا پیروزی فاشیست'
                    : 'Veto Unlocked + 1 to Win'
                  : fascistPoliciesEnacted >= 3
                  ? isFa
                    ? 'انتخاب هیتلر = پیروزی فاشیست'
                    : 'Hitler elected = Fascist win'
                  : isFa
                  ? '۶ قانون = پیروزی فاشیست'
                  : '6 policies = Fascist win'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
