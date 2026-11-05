import React from 'react';
import { Shield, Landmark } from 'lucide-react';

interface GovernmentPlacardsProps {
  presidentName: string | null;
  chancellorName: string | null;
  isNominated?: boolean;
  termLimitInfo?: {
    lastPresidentName?: string | null;
    lastChancellorName?: string | null;
  };
  lang: 'fa' | 'en';
}

export const GovernmentPlacards: React.FC<GovernmentPlacardsProps> = ({
  presidentName,
  chancellorName,
  isNominated = false,
  termLimitInfo,
  lang,
}) => {
  const isFa = lang === 'fa';

  return (
    <div className="w-full my-3 flex flex-col items-center select-none">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl">
        
        {/* ========================================================= */}
        {/* 1. PRESIDENT PLACARD                                      */}
        {/* ========================================================= */}
        <div className="flex flex-col rounded-2xl overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.6)] border-2 border-[#5c3a21] bg-[#1a0f08] transition-all">
          {/* LAYER 1: Official SVG Placard (Fixed Title Artwork) */}
          <div className="relative aspect-[960/340] w-full overflow-hidden bg-[#1e1008] border-b-2 border-[#3d2314]">
            <img
              src="/game-assets/placards/president.svg"
              alt="President Placard"
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          </div>

          {/* LAYER 2: Separate Semantic Delegate Nameplate Layer */}
          <div className="px-3.5 py-2.5 bg-[#120a05] flex items-center justify-between gap-2 border-t border-[#422513]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-[#2e190d] border border-[#7a4e2b] flex items-center justify-center shrink-0 shadow-inner">
                <Landmark className="w-3.5 h-3.5 text-[#e6c687]" aria-hidden="true" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#8a725e]">
                  {isFa ? 'رئیس‌جمهور مستقر' : 'Sitting President'}
                </span>
                <span className="font-serif font-black text-sm sm:text-base text-[#faecd5] truncate">
                  {presidentName ? (
                    <bdi dir={isFa ? 'rtl' : 'ltr'}>{presidentName}</bdi>
                  ) : (
                    <span className="text-[#736052] italic">{isFa ? 'کرسی خالی' : 'Vacant Seat'}</span>
                  )}
                </span>
              </div>
            </div>

            {presidentName && (
              <span className="px-2 py-0.5 rounded bg-[#2b180d] border border-[#8a5d35] text-[10px] font-mono text-[#ecd4ab] shrink-0 font-bold">
                {isFa ? 'در مسند قدرت' : 'In Office'}
              </span>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CHANCELLOR PLACARD                                     */}
        {/* ========================================================= */}
        <div
          className={`flex flex-col rounded-2xl overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.6)] border-2 transition-all ${
            isNominated
              ? 'border-amber-400 bg-[#24160a] ring-2 ring-amber-500/30'
              : 'border-[#4a3930] bg-[#14100e]'
          }`}
        >
          {/* LAYER 1: Official SVG Placard (Fixed Title Artwork) */}
          <div className="relative aspect-[960/340] w-full overflow-hidden bg-[#14100d] border-b-2 border-[#382b24]">
            <img
              src="/game-assets/placards/chancellor.svg"
              alt="Chancellor Placard"
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          </div>

          {/* LAYER 2: Separate Semantic Delegate Nameplate Layer */}
          <div className="px-3.5 py-2.5 bg-[#0e0a09] flex items-center justify-between gap-2 border-t border-[#30251f]">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-inner border ${
                  isNominated
                    ? 'bg-amber-950/80 border-amber-500/80'
                    : 'bg-[#211a17] border-[#4a3b34]'
                }`}
              >
                <Shield
                  className={`w-3.5 h-3.5 ${
                    isNominated ? 'text-amber-300' : 'text-[#d6c7b0]'
                  }`}
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#8a7a70]">
                  {isNominated
                    ? isFa
                      ? 'نامزد معرفی‌شده برای رأی‌گیری'
                      : 'Nominated Candidate'
                    : isFa
                    ? 'صدراعظم منتخب'
                    : 'Elected Chancellor'}
                </span>
                <span className="font-serif font-black text-sm sm:text-base text-[#f5ede0] truncate">
                  {chancellorName ? (
                    <bdi dir={isFa ? 'rtl' : 'ltr'}>{chancellorName}</bdi>
                  ) : (
                    <span className="text-[#695c54] italic">
                      {isFa ? 'در انتظار نامزدی' : 'Awaiting Nomination'}
                    </span>
                  )}
                </span>
              </div>
            </div>

            {chancellorName && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 border ${
                  isNominated
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 animate-pulse'
                    : 'bg-[#241c18] border-[#5e4b41] text-[#e0d3c1]'
                }`}
              >
                {isNominated ? (isFa ? 'در انتظار رأی' : 'Nominee') : isFa ? 'منتخب' : 'Elected'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TERM LIMITATIONS (PAST GOVERNMENTS)                    */}
      {/* ========================================================= */}
      {termLimitInfo && (termLimitInfo.lastPresidentName || termLimitInfo.lastChancellorName) && (
        <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-[#140c08]/90 border border-[#3b2314] text-[10px] sm:text-[11px] font-mono text-[#a38a74] flex flex-wrap items-center justify-center gap-2 shadow-inner">
          <span className="font-serif font-bold text-[#c49b5a] flex items-center gap-1">
            📜 {isFa ? 'محدودیت تصدی دور پیشین:' : 'Term Limits (Ineligible):'}
          </span>
          {termLimitInfo.lastPresidentName && (
            <span className="bg-[#1f120a] px-2 py-0.5 rounded border border-[#52331d] text-[#e6d0b3]">
              <bdi dir={isFa ? 'rtl' : 'ltr'}>{termLimitInfo.lastPresidentName}</bdi>{' '}
              <span className="text-[#9e7d60]">({isFa ? 'رئیس‌جمهور سابق' : 'Ex-Pres'})</span>
            </span>
          )}
          {termLimitInfo.lastChancellorName && (
            <span className="bg-[#1f120a] px-2 py-0.5 rounded border border-[#52331d] text-[#e6d0b3]">
              <bdi dir={isFa ? 'rtl' : 'ltr'}>{termLimitInfo.lastChancellorName}</bdi>{' '}
              <span className="text-[#9e7d60]">({isFa ? 'صدراعظم سابق' : 'Ex-Chan'})</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
