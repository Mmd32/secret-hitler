import React, { useState, useRef, useEffect } from 'react';
import { CardComponent } from './CardComponent.js';
import { PlayerPrivateView } from '../../../server/src/engine/types.js';
import { sound } from '../audio/SoundEffects.js';
import { Lock, Shield, Skull, Crown, FileText, CheckCircle } from 'lucide-react';

interface RoleRevealCardProps {
  player: PlayerPrivateView;
  lang: 'fa' | 'en';
  onAcknowledge: () => void;
  canAdvance: boolean;
}

export const RoleRevealCard: React.FC<RoleRevealCardProps> = ({
  player,
  lang,
  onAcknowledge,
  canAdvance,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<any>(null);
  const isFa = lang === 'fa';

  const startHold = () => {
    sound.playCardFlip();
    const startTime = Date.now();
    const duration = 250; // ms to fully reveal

    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(holdIntervalRef.current);
        setIsRevealed(true);
        if (navigator.vibrate) navigator.vibrate(40);
      }
    }, 16);
  };

  const endHold = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    setHoldProgress(0);
    setIsRevealed(false);
  };

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  const getRoleVariant = () => {
    if (player.role === 'LIBERAL') return 'ROLE_LIBERAL';
    if (player.role === 'FASCIST') return 'ROLE_FASCIST';
    return 'ROLE_HITLER';
  };

  const getMembershipVariant = () => {
    return player.membership === 'LIBERAL' ? 'MEMBERSHIP_LIBERAL' : 'MEMBERSHIP_FASCIST';
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col items-center select-none">
      {/* Header Stamp */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-amber-600/60 bg-amber-950/40 text-amber-300 font-mono text-xs uppercase tracking-widest mb-1 shadow">
          <FileText className="w-3.5 h-3.5" />
          <span>{isFa ? 'محرمانه — فقط برای چشمان شما' : 'CLASSIFIED — FOR YOUR EYES ONLY'}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-black text-amber-100">
          {isFa ? 'پرونده هویت و حزب' : 'Secret Dossier & Alignment'}
        </h2>
        <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
          {isFa
            ? 'برای جلوگیری از لو رفتن هویت، کارت را نگه دارید تا ببینید و با رها کردن مخفی شود.'
            : 'Hold the card to peek at your role. Release to conceal immediately.'}
        </p>
      </div>

      {/* Main Touchable Dossier Container */}
      <div
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        onTouchCancel={endHold}
        className="relative w-full max-w-xs aspect-[3/4] rounded-3xl cursor-pointer transition-all duration-300 flex items-center justify-center p-4 bg-gradient-to-b from-[#241c18] to-[#120e0c] border-2 border-amber-900/60 shadow-[0_20px_50px_rgba(0,0,0,0.8)] active:scale-[0.98]"
      >
        {/* Progress ring border while holding */}
        {!isRevealed && holdProgress > 0 && (
          <div
            className="absolute inset-0 rounded-3xl border-4 border-amber-400 transition-all pointer-events-none"
            style={{ opacity: holdProgress / 100 }}
          />
        )}

        {/* Concealed State */}
        {!isRevealed ? (
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-500/50 flex items-center justify-center bg-amber-950/30 mb-4 animate-pulse">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <span className="font-serif font-bold text-amber-200 text-base mb-2">
              {isFa ? 'انگشت خود را نگه دارید' : 'Press & Hold to Reveal'}
            </span>
            <div className="w-32 h-1.5 bg-stone-800 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-amber-400 transition-all duration-75"
                style={{ width: `${holdProgress}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-stone-500 mt-3">
              {isFa ? 'برای ایمنی در کنار سایر بازیکنان' : 'Concealed for safety'}
            </span>
          </div>
        ) : (
          /* Revealed State */
          <div className="w-full h-full flex flex-col items-center justify-between animate-fadeIn">
            {/* The 2 Cards: Role Card and Party Membership Card */}
            <div className="flex gap-2 items-center justify-center w-full">
              <CardComponent variant={getRoleVariant()} size="md" />
              <CardComponent variant={getMembershipVariant()} size="md" />
            </div>

            {/* Teammate Intelligence Box */}
            <div className="w-full mt-3 p-3 rounded-2xl bg-stone-900/90 border border-stone-700/60 text-xs shadow-inner">
              {player.role === 'LIBERAL' && (
                <div className="text-cyan-200 text-center leading-relaxed flex flex-col items-center gap-1">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>
                    {isFa
                      ? 'شما لیبرال هستید. شما هیچ‌کس را نمی‌شناسید. ۵ قانون لیبرال تصویب کنید یا هیتلر را اعدام کنید!'
                      : 'You are a Liberal. You know no one. Enact 5 Liberal policies or execute Hitler!'}
                  </span>
                </div>
              )}

              {player.role === 'FASCIST' && (
                <div className="text-red-300 flex flex-col gap-1.5">
                  <div className="font-bold border-b border-red-800/40 pb-1 flex items-center gap-1.5">
                    <Skull className="w-4 h-4 text-red-400" />
                    <span>{isFa ? 'اطلاعات محرمانه فاشیست‌ها:' : 'Fascist Intel:'}</span>
                  </div>
                  {player.knownTeam?.hitler && (
                    <div className="flex justify-between items-center bg-red-950/60 p-1.5 rounded-lg border border-red-900/50">
                      <span>{isFa ? 'هیتلر:' : 'Hitler:'}</span>
                      <span className="font-bold text-red-200">{player.knownTeam.hitler.name}</span>
                    </div>
                  )}
                  {player.knownTeam?.allies && player.knownTeam.allies.length > 0 && (
                    <div className="text-[11px]">
                      <span className="text-stone-400">{isFa ? 'سایر فاشیست‌ها:' : 'Allies:'} </span>
                      <span className="font-bold text-stone-200">
                        {player.knownTeam.allies.map((a) => a.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {player.role === 'HITLER' && (
                <div className="text-amber-300 flex flex-col gap-1.5">
                  <div className="font-bold border-b border-amber-800/40 pb-1 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>{isFa ? 'اطلاعات محرمانه هیتلر:' : 'Hitler Intel:'}</span>
                  </div>
                  {player.knownTeam?.allies && player.knownTeam.allies.length > 0 ? (
                    <div>
                      <span className="text-stone-400">{isFa ? 'هم‌تیمی فاشیست شما:' : 'Your Fascist ally:'} </span>
                      <span className="font-bold text-red-300">
                        {player.knownTeam.allies.map((a) => a.name).join(', ')}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-200/80 leading-relaxed">
                      {isFa
                        ? 'در بازی‌های ۷ تا ۱۰ نفره شما هویت فاشیست‌ها را نمی‌دانید! آنها شما را می‌شناسند.'
                        : 'In 7-10 player games, you do not know the fascists. But they know you!'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Acknowledge Button */}
      {canAdvance && (
        <button
          onClick={onAcknowledge}
          className="mt-6 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-serif font-black text-sm uppercase tracking-wider shadow-xl active:scale-95 transition-all flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>{isFa ? 'نقش خود را فهمیدم — شروع بازی' : 'I Understand My Role — Begin'}</span>
        </button>
      )}
    </div>
  );
};
