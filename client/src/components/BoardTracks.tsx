import React, { useState, useEffect } from 'react';
import {
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

  const showLib = mobileTab === 'both' || mobileTab === 'liberal' || !isMobileScreen;
  const showFas = mobileTab === 'both' || mobileTab === 'fascist' || !isMobileScreen;

  const tab = (id: 'both' | 'liberal' | 'fascist', label: React.ReactNode, active: string) => (
    <button
      onClick={() => setMobileTab(id)}
      aria-pressed={mobileTab === id}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-all ${
        mobileTab === id ? active : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex w-full select-none flex-col gap-4">
      {/* Mobile switcher */}
      <div className="mx-auto flex w-full max-w-md gap-1 rounded-xl border border-white/10 bg-black/30 p-1 lg:hidden">
        {tab('both', <><Layers className="h-3.5 w-3.5" />{isFa ? 'هر دو' : 'Both'}</>, 'bg-white/10 text-white shadow')}
        {tab('liberal', <><Landmark className="h-3.5 w-3.5 text-[#4aa3c7]" />{isFa ? 'لیبرال' : 'Liberal'}<span dir="ltr" className="tabular-nums opacity-70">{liberalPoliciesEnacted}/5</span></>, 'bg-[#4aa3c7]/20 text-[#9bd8ef] shadow')}
        {tab('fascist', <><ShieldAlert className="h-3.5 w-3.5 text-[#e5534b]" />{isFa ? 'فاشیست' : 'Fascist'}<span dir="ltr" className="tabular-nums opacity-70">{fascistPoliciesEnacted}/6</span></>, 'bg-[#e5534b]/20 text-[#ffaaa4] shadow')}
      </div>

      <div className="grid w-full grid-cols-1 items-start gap-4 xl:grid-cols-1">
        {/* LIBERAL */}
        {showLib && (
          <div className="overflow-hidden rounded-2xl border border-[#4aa3c7]/25 bg-[#0c1822] shadow-[0_20px_50px_-20px_rgba(0,0,0,.8)]">
            <div className="flex items-center justify-between border-b border-[#4aa3c7]/15 px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4aa3c7]/15">
                  <Landmark className="h-4 w-4 text-[#4aa3c7]" />
                </span>
                <span className="text-sm font-extrabold text-[#d7f0fa]">{isFa ? 'قوانین لیبرال' : 'Liberal policies'}</span>
              </div>
              <ProgressPips total={5} filled={liberalPoliciesEnacted} color="#4aa3c7" />
            </div>
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${liberalBoard.naturalWidth} / ${liberalBoard.naturalHeight}` }}>
              <img src={liberalBoard.asset} alt="Liberal Policy Board" className="h-full w-full object-contain pointer-events-none" draggable={false} />
              {liberalBoard.slots.map((slot) => (
                <div key={`lib_slot_${slot.index}`} style={getSlotStyle(slot, liberalBoard.naturalWidth, liberalBoard.naturalHeight)} className="absolute flex items-center justify-center">
                  {slot.index <= liberalPoliciesEnacted && (
                    <img src="/game-assets/policy/liberal_policy.svg" alt={`Liberal Policy ${slot.index}`} className="h-full w-full -translate-y-0.5 rounded object-fill shadow-[0_6px_16px_rgba(0,0,0,0.8)] animate-fadeIn" draggable={false} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FASCIST */}
        {showFas && (
          <div className="overflow-hidden rounded-2xl border border-[#e5534b]/25 bg-[#1b0d0e] shadow-[0_20px_50px_-20px_rgba(0,0,0,.8)]">
            <div className="flex items-center justify-between border-b border-[#e5534b]/15 px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e5534b]/15">
                  <ShieldAlert className="h-4 w-4 text-[#e5534b]" />
                </span>
                <span className="text-sm font-extrabold text-[#ffe1de]">{isFa ? 'قوانین فاشیست' : 'Fascist policies'}</span>
                <span className="chip hidden sm:inline-flex">{playerCount} {isFa ? 'بازیکن' : 'players'}</span>
              </div>
              <ProgressPips total={6} filled={fascistPoliciesEnacted} color="#e5534b" />
            </div>
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${fascistBoard.naturalWidth} / ${fascistBoard.naturalHeight}` }}>
              <img src={fascistBoard.asset} alt={`Fascist Policy Board (${playerCount} Players)`} className="h-full w-full object-contain pointer-events-none" draggable={false} />
              {fascistBoard.slots.map((slot) => (
                <div key={`fas_slot_${slot.index}`} style={getSlotStyle(slot, fascistBoard.naturalWidth, fascistBoard.naturalHeight)} className="absolute flex items-center justify-center">
                  {slot.index <= fascistPoliciesEnacted && (
                    <img src="/game-assets/policy/fascist_policy.svg" alt={`Fascist Policy ${slot.index}`} className="h-full w-full -translate-y-0.5 rounded object-fill shadow-[0_6px_16px_rgba(0,0,0,0.8)] animate-fadeIn" draggable={false} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e5534b]/15 px-4 py-2.5 text-[11px]">
              <span className={`flex items-center gap-1.5 font-bold ${fascistPoliciesEnacted >= 3 ? 'text-amber-300' : 'text-slate-500'}`}>
                <ShieldAlert className="h-3.5 w-3.5" />
                {isFa ? 'منطقه خطر هیتلر از قانون ۳' : 'Hitler danger zone from policy 3'}
              </span>
              <span className="text-slate-400">
                {fascistPoliciesEnacted >= 5
                  ? isFa ? 'حق وتو فعال شد' : 'Veto unlocked'
                  : fascistPoliciesEnacted >= 3
                  ? isFa ? 'انتخاب هیتلر = پیروزی فاشیست' : 'Hitler elected = Fascist win'
                  : isFa ? '۶ قانون = پیروزی فاشیست' : '6 policies = Fascist win'}
              </span>
              {fascistPoliciesEnacted >= 5 && (
                <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-200">
                  <Scale className="h-4 w-4" />
                  {isFa ? 'رئیس‌جمهور و صدراعظم می‌توانند وتو کنند' : 'President & Chancellor may veto'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProgressPips: React.FC<{ total: number; filled: number; color: string }> = ({ total, filled, color }) => (
  <div className="flex items-center gap-1.5" dir="ltr" role="img" aria-label={`${filled} / ${total}`}>
    {Array.from({ length: total }).map((_, i) => (
      <span
        key={i}
        className="h-2 w-5 rounded-full transition-all duration-500"
        style={{ background: i < filled ? color : 'rgba(255,255,255,.12)', boxShadow: i < filled ? `0 0 10px ${color}99` : 'none' }}
      />
    ))}
  </div>
);
