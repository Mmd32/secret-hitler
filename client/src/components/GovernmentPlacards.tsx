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
        {/* 1. PRESIDENT PLACARD (DER REICHSPRÄSIDENT)                */}
        {/* ========================================================= */}
        <div className="flex flex-col rounded-2xl overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.6)] border-2 border-[#5c3a21] bg-[#1a0f08] transition-all">
          {/* LAYER 1: Physical Wooden Office Placard (Fixed Title) */}
          <div className="relative aspect-[10/3.2] w-full overflow-hidden bg-gradient-to-b from-[#2a170c] via-[#1e1008] to-[#140a05] flex flex-col items-center justify-center px-4 py-2 border-b-2 border-[#3d2314]">
            {/* Subtle Woodgrain & Gold Inlaid Edge */}
            <div className="absolute inset-1.5 rounded-xl border border-[#c49b5a]/40 pointer-events-none" />
            <div className="absolute inset-2 rounded-lg border border-[#c49b5a]/20 border-dashed pointer-events-none" />
            
            {/* Corner Brass Rivets */}
            <div className="absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-[#e6c687] shadow-sm" />
            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#e6c687] shadow-sm" />
            <div className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-[#e6c687] shadow-sm" />
            <div className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#e6c687] shadow-sm" />

            {/* Official Title Subtext */}
            <span className="text-[10px] sm:text-[11px] font-serif font-bold text-[#c49b5a] tracking-[0.25em] uppercase text-center">
              DER REICHSPRÄSIDENT
            </span>

            {/* Main Historic Title */}
            <h4 className="text-xl sm:text-2xl font-serif font-black tracking-[0.2em] text-[#f4ecd8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] my-0.5 uppercase">
              PRESIDENT
            </h4>

            {/* Persian Localization Tag */}
            {isFa && (
              <span className="text-[11px] font-serif font-bold text-[#b8956b] tracking-wider">
                رئیس‌جمهور جمهوری وایمار
              </span>
            )}
          </div>

          {/* LAYER 2: Dedicated Brass Nameplate Holder (Player Delegate) */}
          <div className="px-3.5 py-2.5 bg-[#120a05] flex items-center justify-between gap-2 border-t border-[#422513]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-[#2e190d] border border-[#7a4e2b] flex items-center justify-center shrink-0 shadow-inner">
                <Landmark className="w-3.5 h-3.5 text-[#e6c687]" aria-hidden="true" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#8a725e]">
                  {isFa ? 'نماینده مستقر در مقام' : 'Sitting Delegate'}
                </span>
                <span className="font-serif font-black text-sm sm:text-base text-[#faecd5] truncate">
                  {presidentName ? (
                    <bdi dir={isFa ? 'rtl' : 'ltr'}>{presidentName}</bdi>
                  ) : (
                    <span className="text-[#736052] italic">{isFa ? 'در انتظار انتصاب' : 'Vacant Seat'}</span>
                  )}
                </span>
              </div>
            </div>

            {presidentName && (
              <span className="px-2 py-0.5 rounded bg-[#2b180d] border border-[#8a5d35] text-[10px] font-mono text-[#ecd4ab] shrink-0 font-bold">
                {isFa ? 'دارای حق وتو/اجرا' : 'In Office'}
              </span>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CHANCELLOR PLACARD (DER REICHSKANZLER)                 */}
        {/* ========================================================= */}
        <div
          className={`flex flex-col rounded-2xl overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.6)] border-2 transition-all ${
            isNominated
              ? 'border-amber-400 bg-[#24160a] ring-2 ring-amber-500/30'
              : 'border-[#4a3930] bg-[#14100e]'
          }`}
        >
          {/* LAYER 1: Physical Wooden Office Placard (Fixed Title) */}
          <div className="relative aspect-[10/3.2] w-full overflow-hidden bg-gradient-to-b from-[#241d1a] via-[#1a1412] to-[#100d0b] flex flex-col items-center justify-center px-4 py-2 border-b-2 border-[#382b24]">
            {/* Subtle Silver/Brass Inlaid Edge */}
            <div className="absolute inset-1.5 rounded-xl border border-[#d1c2a5]/40 pointer-events-none" />
            <div className="absolute inset-2 rounded-lg border border-[#d1c2a5]/20 border-dashed pointer-events-none" />
            
            {/* Corner Screws */}
            <div className="absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-[#f0e8d8] shadow-sm" />
            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#f0e8d8] shadow-sm" />
            <div className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-[#f0e8d8] shadow-sm" />
            <div className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#f0e8d8] shadow-sm" />

            {/* Official Title Subtext */}
            <span className="text-[10px] sm:text-[11px] font-serif font-bold text-[#d1c2a5] tracking-[0.25em] uppercase text-center">
              DER REICHSKANZLER
            </span>

            {/* Main Historic Title */}
            <h4 className="text-xl sm:text-2xl font-serif font-black tracking-[0.2em] text-[#faf6ee] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] my-0.5 uppercase">
              CHANCELLOR
            </h4>

            {/* Persian Localization Tag */}
            {isFa && (
              <span className="text-[11px] font-serif font-bold text-[#b8ada0] tracking-wider">
                صدراعظم دولت
              </span>
            )}
          </div>

          {/* LAYER 2: Dedicated Brass Nameplate Holder (Player Delegate) */}
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
                      : 'Nominee Under Vote'
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
