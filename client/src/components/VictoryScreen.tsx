import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CardComponent } from './CardComponent.js';
import { sound } from '../audio/SoundEffects.js';

interface VictoryScreenProps {
  winner: 'LIBERAL' | 'FASCIST';
  winReason: string | null;
  players: any[];
  isHost: boolean;
  onPlayAgain: () => void;
  onExit: () => void;
  lang: 'fa' | 'en';
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  winner,
  winReason,
  players,
  isHost,
  onPlayAgain,
  onExit,
  lang,
}) => {
  const isFa = lang === 'fa';
  const isLiberal = winner === 'LIBERAL';

  useEffect(() => {
    sound.playVictory(isLiberal);

    // Launch celebratory confetti burst
    const colors = isLiberal ? ['#22d3ee', '#38bdf8', '#0284c7', '#f8fafc'] : ['#ef4444', '#dc2626', '#991b1b', '#fbbf24'];
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors,
    });
  }, [winner]);

  const getReasonText = () => {
    switch (winReason) {
      case 'LIBERAL_5_POLICIES':
        return isFa ? 'تصویب ۵ قانون لیبرال توسط مجلس' : '5 Liberal policies enacted by the Reichstag';
      case 'HITLER_EXECUTED':
        return isFa ? 'شناسایی و اعدام هیتلر توسط رئیس‌جمهور' : 'Hitler was assassinated by the President';
      case 'FASCIST_6_POLICIES':
        return isFa ? 'تصویب ۶ قانون فاشیستی و تسلط کامل بر حکومت' : '6 Fascist policies enacted — absolute takeover';
      case 'HITLER_ELECTED_CHANCELLOR':
        return isFa ? 'انتخاب هیتلر به صدراعظمی پس از تصویب ۳ قانون فاشیستی' : 'Hitler was elected Chancellor after 3 Fascist policies enacted';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-start p-4 sm:p-8 select-none animate-fadeIn">
      {/* Top Banner */}
      <div className="text-center my-6 max-w-lg">
        <div
          className={`inline-block px-4 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest mb-3 border ${
            isLiberal
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/60 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
              : 'bg-red-950/80 text-red-300 border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
          }`}
        >
          {isFa ? 'پایان رسمی بازی' : 'GAME OVER — VICTORY'}
        </div>
        <h1
          className={`text-3xl sm:text-5xl font-serif font-black tracking-wider uppercase mb-2 ${
            isLiberal ? 'text-cyan-300 drop-shadow-[0_2px_10px_rgba(34,211,238,0.5)]' : 'text-red-500 drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]'
          }`}
        >
          {isLiberal
            ? isFa ? 'پیروزی لیبرال‌ها!' : 'LIBERAL VICTORY!'
            : isFa ? 'پیروزی فاشیست‌ها!' : 'FASCIST VICTORY!'}
        </h1>
        <p className="text-sm sm:text-base font-serif text-slate-300 leading-relaxed max-w-md mx-auto">
          {getReasonText()}
        </p>
      </div>

      {/* Roster Reveal: True Identities */}
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl mb-8">
        <h3 className="font-serif font-bold text-amber-200 text-base sm:text-lg mb-4 text-center border-b border-slate-800 pb-2">
          {isFa ? 'افشای پرونده‌های محرمانه و نقش واقعی تمام بازیکنان' : 'Classified Files: True Roles & Alliances'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {players.map((p) => {
            const role = p.role;
            const isAlive = p.isAlive;
            const cardVariant =
              role === 'LIBERAL'
                ? 'ROLE_LIBERAL'
                : role === 'FASCIST'
                ? 'ROLE_FASCIST'
                : 'ROLE_HITLER';

            return (
              <div
                key={p.id}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center"
              >
                <div className="relative mb-2">
                  <CardComponent variant={cardVariant} size="sm" />
                  {!isAlive && (
                    <div className="absolute inset-0 bg-red-950/80 backdrop-blur-[1px] rounded-lg flex items-center justify-center text-2xl">
                      💀
                    </div>
                  )}
                </div>
                <span className="font-serif font-bold text-slate-200 text-xs truncate max-w-[100px]">
                  {p.name}
                </span>
                <span
                  className={`text-[10px] font-mono mt-0.5 font-bold ${
                    role === 'LIBERAL'
                      ? 'text-cyan-400'
                      : role === 'FASCIST'
                      ? 'text-red-400'
                      : 'text-amber-400'
                  }`}
                >
                  {role}
                </span>
                {!isAlive && (
                  <span className="text-[9px] text-red-500 font-mono">
                    {isFa ? 'اعدام‌شده' : 'Executed'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center items-center">
        {isHost ? (
          <button
            onClick={() => {
              sound.playStampThump();
              onPlayAgain();
            }}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-serif font-black text-sm uppercase tracking-wider shadow-2xl active:scale-95 transition-all"
          >
            {isFa ? 'شروع بازی مجدد در همین اتاق' : 'Play Again in this Room'}
          </button>
        ) : (
          <div className="text-xs font-mono text-slate-400">
            {isFa ? 'در انتظار شروع بازی مجدد توسط میزبان...' : 'Waiting for host to restart game...'}
          </div>
        )}

        <button
          onClick={onExit}
          className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-serif text-sm border border-slate-700 shadow active:scale-95 transition-all"
        >
          {isFa ? 'خروج به منوی اصلی' : 'Exit to Main Menu'}
        </button>
      </div>
    </div>
  );
};

