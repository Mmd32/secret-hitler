import React from 'react';
import { CardComponent } from './CardComponent.js';
import {
  Eye,
  Skull,
  Scale,
  Search,
  Vote,
  Crown,
  Zap,
  AlertTriangle,
  Landmark,
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

export const BoardTracks: React.FC<BoardTracksProps> = ({
  liberalPoliciesEnacted,
  fascistPoliciesEnacted,
  failedElectionCount,
  playerCount,
  lang,
}) => {
  const isFa = lang === 'fa';

  // Helper to get executive power description and vector icon per player count
  const getPowerConfig = (
    slot: number
  ): { title: string; desc: string; icon: React.ReactNode } | null => {
    if (playerCount <= 6) {
      if (slot === 3)
        return {
          title: isFa ? 'نگاه به قوانین' : 'Policy Peek',
          desc: isFa ? 'مشاهده ۳ کارت بعدی' : 'View top 3 policies',
          icon: <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-[#eed2a2]" aria-hidden="true" />,
        };
      if (slot === 4)
        return {
          title: isFa ? 'اعدام' : 'Execution',
          desc: isFa ? 'اعدام یک بازیکن' : 'Execute a player',
          icon: <Skull className="w-4 h-4 sm:w-5 sm:h-5 text-red-300" aria-hidden="true" />,
        };
      if (slot === 5)
        return {
          title: isFa ? 'اعدام + حق وتو' : 'Execution + Veto',
          desc: isFa ? 'اعدام + فعال‌سازی وتو' : 'Execute + Veto unlocked',
          icon: <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-[#eed2a2]" aria-hidden="true" />,
        };
    } else if (playerCount <= 8) {
      if (slot === 2)
        return {
          title: isFa ? 'بررسی وفاداری' : 'Investigate',
          desc: isFa ? 'مشاهده کارت حزب' : 'Check party loyalty',
          icon: <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#eed2a2]" aria-hidden="true" />,
        };
      if (slot === 3)
        return {
          title: isFa ? 'انتخابات ویژه' : 'Special Election',
          desc: isFa ? 'تعیین رئیس بعدی' : 'Choose next President',
          icon: <Vote className="w-4 h-4 sm:w-5 sm:h-5 text-[#eed2a2]" aria-hidden="true" />,
        };
      if (slot === 4)
        return {
          title: isFa ? 'اعدام' : 'Execution',
          desc: isFa ? 'اعدام یک بازیکن' : 'Execute a player',
          icon: <Skull className="w-4 h-4 sm:w-5 sm:h-5 text-red-300" aria-hidden="true" />,
        };
      if (slot === 5)
        return {
          title: isFa ? 'اعدام + حق وتو' : 'Execution + Veto',
          desc: isFa ? 'اعدام + فعال‌سازی وتو' : 'Execute + Veto unlocked',
          icon: <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-[#eed2a2]" aria-hidden="true" />,
        };
    } else {
      if (slot === 1)
        return {
          title: isFa ? 'بررسی وفاداری' : 'Investigate',
          desc: isFa ? 'مشاهده کارت حزب' : 'Check party loyalty',
          icon: <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#eed2a2]" aria-hidden="true" />,
        };
      if (slot === 2)
        return {
          title: isFa ? 'بررسی وفاداری' : 'Investigate',
          desc: isFa ? 'مشاهده کارت حزب' : 'Check party loyalty',
          icon: <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#eed2a2]" aria-hidden="true" />,
        };
      if (slot === 3)
        return {
          title: isFa ? 'انتخابات ویژه' : 'Special Election',
          desc: isFa ? 'تعیین رئیس بعدی' : 'Choose next President',
          icon: <Vote className="w-4 h-4 sm:w-5 sm:h-5 text-[#eed2a2]" aria-hidden="true" />,
        };
      if (slot === 4)
        return {
          title: isFa ? 'اعدام' : 'Execution',
          desc: isFa ? 'اعدام یک بازیکن' : 'Execute a player',
          icon: <Skull className="w-4 h-4 sm:w-5 sm:h-5 text-red-300" aria-hidden="true" />,
        };
      if (slot === 5)
        return {
          title: isFa ? 'اعدام + حق وتو' : 'Execution + Veto',
          desc: isFa ? 'اعدام + فعال‌سازی وتو' : 'Execute + Veto unlocked',
          icon: <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-[#eed2a2]" aria-hidden="true" />,
        };
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col xl:grid xl:grid-cols-2 gap-4 lg:gap-6 select-none my-2">
      {/* ============================================================ */}
      {/* 1. LIBERAL POLICY TRACK (Archival Prussian Blue Board) */}
      {/* ============================================================ */}
      <div className="w-full rounded-3xl p-3.5 sm:p-5 bg-[#142632] border-2 border-[#2b4c5e] shadow-[0_16px_36px_rgba(0,0,0,0.65)] relative overflow-hidden flex flex-col justify-between">
        {/* Subtle Archival Linen Texture Overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, #142632 1px)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 8px 8px',
          }}
        />

        {/* Board Header Bar */}
        <div>
          <div className="flex justify-between items-center mb-3 px-1 pb-2 border-b border-[#244252]">
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#499bb8] shadow-[0_0_8px_rgba(73,155,184,0.7)]" />
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#73a3b8]">
                  {isFa ? 'لوح جمهوری و مجلس ملی' : 'DEUTSCHE REPUBLIK · REICHSGESETZBLATT'}
                </span>
                <h3 className="font-serif font-black tracking-wider text-[#e6f1f5] text-sm sm:text-base">
                  {isFa ? 'مسیر قوانین لیبرال' : 'LIBERAL POLICY TRACK'}
                </h3>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-[#b4d6e4] bg-[#0c181e] px-2.5 py-1 rounded-md border border-[#234252] shadow-inner">
              {liberalPoliciesEnacted} / 5
            </span>
          </div>

          {/* 5 Slots */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 my-2">
            {[1, 2, 3, 4, 5].map((slot) => {
              const isEnacted = slot <= liberalPoliciesEnacted;
              return (
                <div
                  key={`lib_${slot}`}
                  className={`relative aspect-[5/7] rounded-xl flex flex-col items-center justify-center transition-all duration-300 overflow-hidden ${
                    isEnacted
                      ? 'border-2 border-[#54a9c7] shadow-[0_8px_20px_rgba(0,0,0,0.6)] transform -translate-y-0.5'
                      : 'border-2 border-dashed border-[#234252] bg-[#0c181f]/85 shadow-[inset_0_3px_8px_rgba(0,0,0,0.6)]'
                  }`}
                >
                  {isEnacted ? (
                    <CardComponent
                      variant="POLICY_LIBERAL"
                      size="sm"
                      className="w-full h-full border-0 !rounded-none"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-1 w-full h-full">
                      <span className="text-sm sm:text-lg font-serif font-bold text-[#35586b]">
                        § {slot}
                      </span>
                      {slot === 5 && (
                        <div className="flex flex-col items-center mt-1">
                          <Landmark className="w-4 h-4 sm:w-5 sm:h-5 text-[#63abc9] opacity-80" aria-hidden="true" />
                          <span className="text-[8px] sm:text-[9px] text-[#8bcde8] font-serif font-bold mt-0.5 text-center leading-tight">
                            {isFa ? 'پیروزی قطعی' : 'LIBERAL WIN'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ELECTION TRACKER (Part of Liberal Board) */}
        <div className="mt-3 pt-3 border-t border-[#244252] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Vote className="w-4 h-4 text-[#e2b76c]" aria-hidden="true" />
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-xs font-serif font-bold text-[#d4e1e8]">
                {isFa ? 'شمارنده ناکامی در انتخابات:' : 'Election Tracker:'}
              </span>
              <span className="text-[9px] font-mono text-[#6d8a98]">
                {isFa
                  ? '۳ شکست پیاپی = هرج‌ومرج و تصویب فوری کارت بالای دسته'
                  : '3 consecutive failures = Chaos & top card enacted'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((step) => {
              const isActive = failedElectionCount === step;
              const isChaos = step === 3;
              return (
                <div
                  key={`tracker_${step}`}
                  className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                    isActive
                      ? 'scale-110'
                      : 'bg-[#0c181f] text-[#4b6a7a] border border-[#234252] shadow-inner'
                  }`}
                  title={isChaos ? (isFa ? 'آشوب مجلس!' : 'Reichstag Chaos!') : undefined}
                >
                  {isActive ? (
                    <img
                      src="/board/tracker_marker.svg"
                      alt={isChaos ? 'Chaos Marker' : `Step ${step}`}
                      className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
                    />
                  ) : isChaos ? (
                    <Zap className="w-3.5 h-3.5 text-red-500/70" aria-hidden="true" />
                  ) : (
                    step
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. FASCIST POLICY TRACK (Archival Oxblood Board) */}
      {/* ============================================================ */}
      <div className="w-full rounded-3xl p-3.5 sm:p-5 bg-[#2c1311] border-2 border-[#5a2522] shadow-[0_16px_36px_rgba(0,0,0,0.65)] relative overflow-hidden flex flex-col justify-between">
        {/* Archival Grain Texture Overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, #2c1311 1px)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 8px 8px',
          }}
        />

        {/* Board Header Bar */}
        <div>
          <div className="flex justify-between items-center mb-3 px-1 pb-2 border-b border-[#4d1f1c]">
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#c73b32] shadow-[0_0_8px_rgba(199,59,50,0.7)]" />
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#b86d68]">
                  {isFa ? 'فرمان‌های اضطراری و اختیارات ویژه' : 'NOTVERORDNUNG · ERMÄCHTIGUNGSGESETZ'}
                </span>
                <h3 className="font-serif font-black tracking-wider text-[#f4dedd] text-sm sm:text-base">
                  {isFa ? 'مسیر قوانین فاشیست' : 'FASCIST POLICY TRACK'}
                </h3>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-[#f0b5b1] bg-[#1a0a09] px-2.5 py-1 rounded-md border border-[#4d1f1c] shadow-inner">
              {fascistPoliciesEnacted} / 6
            </span>
          </div>

          {/* 6 Slots */}
          <div className="grid grid-cols-6 gap-1 sm:gap-2 my-2">
            {[1, 2, 3, 4, 5, 6].map((slot) => {
              const isEnacted = slot <= fascistPoliciesEnacted;
              const config = getPowerConfig(slot);
              const isHitlerZone = slot >= 3;

              return (
                <div
                  key={`fas_${slot}`}
                  className={`relative aspect-[5/7] rounded-xl flex flex-col items-center justify-between p-1 sm:p-1.5 transition-all duration-300 overflow-hidden ${
                    isEnacted
                      ? 'border-2 border-[#b8382f] shadow-[0_8px_20px_rgba(0,0,0,0.6)] transform -translate-y-0.5'
                      : isHitlerZone
                      ? 'border-2 border-red-700/60 bg-[#1c0a09]/90 shadow-[inset_0_3px_8px_rgba(0,0,0,0.6)]'
                      : 'border-2 border-dashed border-[#4d1f1c] bg-[#1a0a09]/85 shadow-[inset_0_3px_8px_rgba(0,0,0,0.6)]'
                  }`}
                >
                  {isEnacted ? (
                    <CardComponent
                      variant="POLICY_FASCIST"
                      size="sm"
                      className="w-full h-full border-0 !rounded-none"
                    />
                  ) : (
                    <>
                      <span className="text-[10px] sm:text-xs font-mono font-bold text-[#7d3b36] self-start">
                        § {slot}
                      </span>

                      <div className="flex flex-col items-center text-center my-auto px-0.5">
                        {slot === 6 ? (
                          <>
                            <Crown className="w-5 h-5 text-[#d8a853] animate-pulse" aria-hidden="true" />
                            <span className="text-[8px] sm:text-[9px] font-serif font-black text-[#f4dedd] leading-tight mt-1">
                              {isFa ? 'پیروزی' : 'WIN'}
                            </span>
                          </>
                        ) : config ? (
                          <>
                            <div className="mb-0.5">{config.icon}</div>
                            <span className="text-[8px] sm:text-[9px] font-serif font-bold text-[#eed2a2] leading-tight text-center">
                              {config.title}
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] text-[#6d302c] font-mono">—</span>
                        )}
                      </div>

                      {slot === 3 && (
                        <div className="w-full text-center text-[7px] sm:text-[8px] bg-red-950 text-red-300 font-mono font-bold rounded py-0.5 border border-red-800/80 uppercase tracking-tighter">
                          {isFa ? 'خطر هیتلر' : 'Hitler Zone'}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hitler Danger Zone Active Warning Banner */}
        {fascistPoliciesEnacted >= 3 && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#3f1614] border-2 border-red-600/80 flex items-center gap-2 text-xs text-red-100 shadow-[0_4px_16px_rgba(220,38,38,0.3)] animate-pulse">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
            <div className="flex flex-col">
              <span className="font-serif font-black text-red-300 uppercase tracking-wider text-[10px]">
                {isFa ? 'منطقه خطر هیتلر فعال است' : 'HITLER DANGER ZONE ACTIVE'}
              </span>
              <span className="text-[10px] sm:text-[11px] text-red-100/90 leading-tight">
                {isFa
                  ? 'اگر هیتلر به صدراعظمی انتخاب شود، فاشیست‌ها بلافاصله پیروز بازی خواهند شد!'
                  : 'If Hitler is elected Chancellor, Fascists win immediately!'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
