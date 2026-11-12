import React from 'react';
import { Crown, ScrollText, AlertTriangle } from 'lucide-react';
import { Avatar } from './ui.js';

interface GovernmentPlacardsProps {
  presidentName: string | null;
  chancellorName: string | null;
  isNominated?: boolean;
  termLimitInfo?: {
    lastPresidentName?: string | null;
    lastChancellorName?: string | null;
  };
  failedElectionCount?: number;
  lang: 'fa' | 'en';
}

export const GovernmentPlacards: React.FC<GovernmentPlacardsProps> = ({
  presidentName,
  chancellorName,
  isNominated = false,
  termLimitInfo,
  failedElectionCount = 0,
  lang,
}) => {
  const isFa = lang === 'fa';

  const Row: React.FC<{
    icon: React.ReactNode;
    role: string;
    name: string | null;
    empty: string;
    badge?: string;
    accent: string;
    pulse?: boolean;
  }> = ({ icon, role, name, empty, badge, accent, pulse }) => (
    <div className="flex items-center gap-3 p-3">
      <div className="relative">
        {name ? (
          <Avatar name={name} size="lg" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-white/15 text-slate-600">
            {icon}
          </span>
        )}
        <span
          className={`absolute -bottom-1 -end-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#121722] ${accent}`}
        >
          {icon}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-bold text-slate-500">{role}</div>
        <div className="truncate text-base font-extrabold text-white">
          {name ? <bdi dir={isFa ? 'rtl' : 'ltr'}>{name}</bdi> : <span className="text-sm font-semibold text-slate-600">{empty}</span>}
        </div>
      </div>
      {badge && (
        <span className={`chip shrink-0 ${pulse ? 'animate-glow border-[#d9b36a]/50 text-[#ecd08f]' : ''}`}>{badge}</span>
      )}
    </div>
  );

  return (
    <section className="card-surface overflow-hidden" aria-label={isFa ? 'دولت' : 'Government'}>
      <Row
        icon={<Crown className="h-3 w-3 text-[#1b1407]" />}
        accent="bg-[#d9b36a]"
        role={isFa ? 'رئیس‌جمهور' : 'President'}
        name={presidentName}
        empty={isFa ? 'کرسی خالی' : 'Vacant'}
        badge={presidentName ? (isFa ? 'در مسند' : 'In office') : undefined}
      />
      <div className="mx-3 h-px bg-white/[0.07]" />
      <Row
        icon={<ScrollText className="h-3 w-3 text-slate-900" />}
        accent="bg-slate-300"
        role={
          isNominated
            ? isFa ? 'نامزد صدراعظمی' : 'Chancellor nominee'
            : isFa ? 'صدراعظم' : 'Chancellor'
        }
        name={chancellorName}
        empty={isFa ? 'در انتظار نامزدی' : 'Awaiting nomination'}
        badge={chancellorName ? (isNominated ? (isFa ? 'در انتظار رأی' : 'Pending vote') : isFa ? 'منتخب' : 'Elected') : undefined}
        pulse={isNominated && !!chancellorName}
      />

      {/* Election tracker */}
      <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] bg-black/20 px-4 py-3">
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-slate-400">
            {isFa ? 'شمارنده انتخابات ناموفق' : 'Election tracker'}
          </div>
          <div className="truncate text-[11px] text-slate-500">
            {failedElectionCount >= 3
              ? isFa ? 'هرج‌ومرج! قانون اول دسته تصویب شد' : 'Chaos! Top policy enacted'
              : isFa ? '۳ شکست پیاپی = هرج‌ومرج' : '3 failures in a row = chaos'}
          </div>
        </div>
        <div className="flex items-center gap-2" role="img" aria-label={`${failedElectionCount} / 3`}>
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-extrabold transition-all duration-300 ${
                failedElectionCount >= n
                  ? n === 3
                    ? 'scale-110 border-red-400 bg-red-500 text-white shadow-[0_0_14px_rgba(239,68,68,.7)]'
                    : 'border-[#d9b36a] bg-[#d9b36a] text-[#1b1407] shadow-[0_0_12px_rgba(217,179,106,.5)]'
                  : 'border-white/15 text-slate-600'
              }`}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      {termLimitInfo && (termLimitInfo.lastPresidentName || termLimitInfo.lastChancellorName) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/[0.07] px-4 py-2.5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-bold text-slate-300">
            <AlertTriangle className="h-3.5 w-3.5 text-[#d9b36a]" />
            {isFa ? 'محدودیت دور قبل:' : 'Term limits:'}
          </span>
          {termLimitInfo.lastPresidentName && (
            <span>
              <bdi dir={isFa ? 'rtl' : 'ltr'} className="font-bold text-slate-200">{termLimitInfo.lastPresidentName}</bdi>{' '}
              ({isFa ? 'رئیس‌جمهور' : 'Pres.'})
            </span>
          )}
          {termLimitInfo.lastChancellorName && (
            <span>
              <bdi dir={isFa ? 'rtl' : 'ltr'} className="font-bold text-slate-200">{termLimitInfo.lastChancellorName}</bdi>{' '}
              ({isFa ? 'صدراعظم' : 'Chan.'})
            </span>
          )}
        </div>
      )}
    </section>
  );
};
