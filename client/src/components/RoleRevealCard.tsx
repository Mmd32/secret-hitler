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
    <div className="w-full max-w-md mx-auto p-2 sm:p-4 flex flex-col items-center select-none">
      {/* Header Stamp */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-amber-600/60 bg-amber-950/40 text-amber-300 font-mono text-xs uppercase tracking-widest mb-1 shadow">
          <FileText className="w-3.5 h-3.5" />
          <span>{isFa ? 'محرمانه — فقط برای چشمان شما' : 'CLASSIFIED — FOR YOUR EYES ONLY'}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-black text-amber-100">
          {isFa ? 'پرونده هویت و حزب' : 'Secret Dossier & Alignment'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          {isFa
            ? 'مطمئن شوید کسی صفحه را نمی‌بیند. کارت را نگه دارید تا نقش و هم‌تیمی‌هایتان را ببینید؛ با رها کردن دوباره پنهان می‌شود.'
            : 'Hold the card to peek at your role. Release to conceal immediately.'}
        </p>
      </div>

      {/* Touchable card: hold to reveal */}
      <div
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        onTouchCancel={endHold}
        onContextMenu={(e) => e.preventDefault()}
        className="relative flex w-full cursor-pointer select-none flex-col items-center"
      >
        {!isRevealed ? (
          <div className="relative">
            <CardComponent variant="ROLE_BACK" size="xl" className="!cursor-pointer" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-black/35 backdrop-blur-[1px]">
              <span className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full border border-[#d9b36a]/60 bg-black/50">
                <Lock className="h-7 w-7 text-[#ecd08f]" />
              </span>
              <span className="rounded-full bg-black/60 px-4 py-1.5 text-sm font-extrabold text-white">
                {isFa ? 'نگه دارید تا نقشتان را ببینید' : 'Press & hold to reveal'}
              </span>
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/20">
                <div className="h-full bg-[#d9b36a] transition-all duration-75" style={{ width: `${holdProgress}%` }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex w-full animate-fadeIn flex-col items-center gap-4">
            <div className="relative flex items-end justify-center">
              <CardComponent variant={getRoleVariant()} size="xl" className="z-10 !shadow-[0_24px_50px_rgba(0,0,0,0.7)]" />
              <CardComponent variant={getMembershipVariant()} size="md" className="-ms-12 mb-3 -rotate-6 opacity-95" />
            </div>

            <div className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-[13px] leading-7">
              {player.role === 'LIBERAL' && (
                <div className="flex flex-col gap-1.5 text-sky-200">
                  <div className="flex items-center gap-2 font-extrabold"><Shield className="h-4 w-4 text-sky-400" />{isFa ? 'تو لیبرال هستی' : 'You are a Liberal'}</div>
                  <p className="text-slate-300">
                    {isFa
                      ? 'هیچ‌کس را نمی‌شناسی؛ باید با بحث و رأی دادن بفهمی چه کسی فاشیست است. برای برد، ۵ قانون لیبرال تصویب کن یا هیتلر را اعدام کن. به هیچ‌کس نشان نده!'
                      : 'You know no one. Enact 5 Liberal policies or execute Hitler. Do not show anyone!'}
                  </p>
                </div>
              )}
              {player.role === 'FASCIST' && (
                <div className="flex flex-col gap-2 text-red-200">
                  <div className="flex items-center gap-2 font-extrabold"><Skull className="h-4 w-4 text-red-400" />{isFa ? 'تو فاشیست هستی' : 'You are a Fascist'}</div>
                  <p className="text-slate-300">
                    {isFa ? 'هیتلر و هم‌تیمی‌هایت را می‌شناسی. دروغ بگو، قانون فاشیستی تصویب کن و هیتلر را پنهان نگه دار.' : 'You know Hitler and your allies. Lie, pass Fascist laws, protect Hitler.'}
                  </p>
                  {player.knownTeam?.hitler && (
                    <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5">
                      <span>{isFa ? 'هیتلر:' : 'Hitler:'}</span>
                      <span className="font-extrabold text-white">{player.knownTeam.hitler.name}</span>
                    </div>
                  )}
                  {player.knownTeam?.allies && player.knownTeam.allies.length > 0 && (
                    <div className="text-[12px]">
                      <span className="text-slate-400">{isFa ? 'سایر فاشیست‌ها: ' : 'Allies: '}</span>
                      <span className="font-bold text-slate-100">{player.knownTeam.allies.map((a) => a.name).join('، ')}</span>
                    </div>
                  )}
                </div>
              )}
              {player.role === 'HITLER' && (
                <div className="flex flex-col gap-2 text-amber-200">
                  <div className="flex items-center gap-2 font-extrabold"><Crown className="h-4 w-4 text-amber-400" />{isFa ? 'تو هیتلر هستی' : 'You are Hitler'}</div>
                  <p className="text-slate-300">
                    {isFa
                      ? 'خودت را لو نده. اگر بعد از تصویب ۳ قانون فاشیستی صدراعظم شوی، فاشیست‌ها می‌برند. اگر اعدام شوی، لیبرال‌ها می‌برند.'
                      : 'Stay hidden. If elected Chancellor after 3 Fascist laws, Fascists win. If executed, Liberals win.'}
                  </p>
                  {player.knownTeam?.allies && player.knownTeam.allies.length > 0 ? (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5">
                      <span className="text-slate-400">{isFa ? 'هم‌تیمی فاشیست: ' : 'Your Fascist ally: '}</span>
                      <span className="font-extrabold text-white">{player.knownTeam.allies.map((a) => a.name).join('، ')}</span>
                    </div>
                  ) : (
                    <div className="text-[12px] text-amber-100/80">
                      {isFa ? 'در بازی‌های ۷ تا ۱۰ نفره فاشیست‌ها را نمی‌شناسی، اما آن‌ها تو را می‌شناسند.' : 'In 7–10 player games you do not know the Fascists, but they know you.'}
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
          className="mt-6 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-serif font-black text-sm uppercase tracking-wider shadow-xl active:scale-95 transition-all flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>{isFa ? 'نقش خود را فهمیدم — شروع بازی' : 'I Understand My Role — Begin'}</span>
        </button>
      )}
    </div>
  );
};
