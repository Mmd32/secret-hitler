import React from 'react';

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
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl">
        {/* PRESIDENT PLACARD */}
        <div className="relative group rounded-xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.5)] border border-[#4a2e1b] bg-[#1a0e08]">
          <div className="relative aspect-[10/3] w-full">
            <img
              src="/cards/placard_president.svg"
              alt="Der Reichspräsident"
              className="w-full h-full object-cover"
            />
            {/* Engraved Brass Nameplate Overlay */}
            <div className="absolute inset-x-0 bottom-2.5 flex items-center justify-center">
              <div className="bg-[#1c100a]/90 border border-[#c49b5a] px-4 py-0.5 rounded shadow-inner max-w-[85%] truncate">
                <span className="font-serif font-black text-sm sm:text-base text-[#f5e2b8] tracking-wide">
                  {presidentName || (isFa ? 'تعیین‌نشده' : 'Vacant')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CHANCELLOR PLACARD */}
        <div className="relative group rounded-xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.5)] border border-[#4a2e1b] bg-[#1a0e08]">
          <div className="relative aspect-[10/3] w-full">
            <img
              src="/cards/placard_chancellor.svg"
              alt="Der Reichskanzler"
              className="w-full h-full object-cover"
            />
            {/* Engraved Brass Nameplate Overlay */}
            <div className="absolute inset-x-0 bottom-2.5 flex items-center justify-center">
              <div
                className={`px-4 py-0.5 rounded shadow-inner max-w-[85%] truncate border ${
                  isNominated
                    ? 'bg-[#3b2713]/90 border-amber-400 animate-pulse'
                    : 'bg-[#1c100a]/90 border-[#c49b5a]'
                }`}
              >
                <span className="font-serif font-black text-sm sm:text-base text-[#f5e2b8] tracking-wide">
                  {chancellorName || (isFa ? 'در انتظار نامزدی' : 'Vacant')}
                </span>
                {isNominated && (
                  <span className="text-[10px] text-amber-300 font-mono ms-1.5 font-bold">
                    ({isFa ? 'نامزد' : 'Nominee'})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Term Limits Subtext */}
      {termLimitInfo && (termLimitInfo.lastPresidentName || termLimitInfo.lastChancellorName) && (
        <div className="mt-2 text-[10px] sm:text-[11px] font-mono text-[#8a7664] flex items-center gap-1.5">
          <span>📜 {isFa ? 'محدودیت تصدی دور قبل:' : 'Term-Limited:'}</span>
          {termLimitInfo.lastPresidentName && (
            <span className="bg-[#241710] px-1.5 py-0.5 rounded border border-[#3d291e] text-[#b89f8a]">
              {termLimitInfo.lastPresidentName} ({isFa ? 'رئیس‌جمهور سابق' : 'Ex-Pres'})
            </span>
          )}
          {termLimitInfo.lastChancellorName && (
            <span className="bg-[#241710] px-1.5 py-0.5 rounded border border-[#3d291e] text-[#b89f8a]">
              {termLimitInfo.lastChancellorName} ({isFa ? 'صدراعظم سابق' : 'Ex-Chan'})
            </span>
          )}
        </div>
      )}
    </div>
  );
};

