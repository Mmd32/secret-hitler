import React, { useState } from 'react';
import { CardComponent } from './CardComponent.js';
import { ExecutivePower, PartyMembership, PlayerPublicView, PolicyType } from '../../../server/src/engine/types.js';
import { sound } from '../audio/SoundEffects.js';
import {
  ScrollText,
  Search,
  User,
  Vote,
  Crown,
  Eye,
  Skull,
  Crosshair,
  AlertOctagon,
} from 'lucide-react';

interface ExecutivePowerModalProps {
  power: ExecutivePower;
  isPresident: boolean;
  presidentName: string;
  players: PlayerPublicView[];
  currentPresidentId: string;
  onExecutePower: (power: ExecutivePower, targetId?: string) => void;
  policyPeekCards?: PolicyType[];
  investigatedLoyalty?: {
    targetId: string;
    targetName: string;
    membership: PartyMembership;
  };
  lang: 'fa' | 'en';
}

export const ExecutivePowerModal: React.FC<ExecutivePowerModalProps> = ({
  power,
  isPresident,
  presidentName,
  players,
  currentPresidentId,
  onExecutePower,
  policyPeekCards,
  investigatedLoyalty,
  lang,
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const isFa = lang === 'fa';

  const livingOthers = players.filter(
    (p) => p.isAlive && p.id !== currentPresidentId
  );

  const eligibleForInvestigation = livingOthers.filter((p) => !p.hasInvestigated);

  const handleConfirmAction = () => {
    sound.playStampThump();
    onExecutePower(power, selectedTargetId || undefined);
    setShowConfirm(false);
  };

  if (!isPresident) {
    return (
      <div className="w-full max-w-sm mx-auto p-6 rounded-3xl bg-stone-900/80 border border-amber-900/40 flex flex-col items-center text-center shadow-xl">
        <ScrollText className="w-8 h-8 text-amber-400 mb-2 animate-pulse" />
        <h4 className="font-serif font-bold text-amber-200 text-sm">
          {isFa
            ? `رئیس‌جمهور (${presidentName}) در حال اجرای قدرت ریاست‌جمهوری است...`
            : `President (${presidentName}) is executing a Presidential Power...`}
        </h4>
        <span className="text-xs text-stone-400 mt-1 font-mono">
          {power}
        </span>
      </div>
    );
  }

  // 1. INVESTIGATE LOYALTY
  if (power === 'INVESTIGATE_LOYALTY') {
    return (
      <div className="w-full max-w-md mx-auto p-5 sm:p-6 bg-stone-900/95 border-2 border-amber-800/80 rounded-3xl shadow-2xl flex flex-col items-center select-none animate-fadeIn">
        <div className="w-12 h-12 rounded-full border border-amber-500/50 flex items-center justify-center mb-2 bg-amber-950/60 shadow">
          <Search className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="text-lg font-serif font-black text-amber-100 mb-1">
          {isFa ? 'بررسی وفاداری حزبی' : 'Investigate Loyalty'}
        </h3>
        <p className="text-xs text-stone-300 text-center mb-4 leading-relaxed">
          {isFa
            ? 'یک بازیکن را جهت مشاهده محرمانه کارت عضویت حزبی او انتخاب کنید (هر بازیکن فقط یک‌بار قابل بررسی است):'
            : 'Select a player to secretly inspect their Party Membership (each player can only be investigated once):'}
        </p>

        {/* Player Selection List */}
        <div className="w-full grid grid-cols-1 gap-2 mb-4">
          {eligibleForInvestigation.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedTargetId(p.id)}
              className={`flex items-center justify-between p-3 rounded-xl border text-sm font-serif transition-all ${
                selectedTargetId === p.id
                  ? 'bg-amber-600 text-stone-950 font-bold border-amber-400 shadow-md scale-[1.02]'
                  : 'bg-stone-800/80 text-stone-200 border-stone-700 hover:bg-stone-750'
              }`}
            >
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{p.name}</span>
              </span>
              <span className="text-xs font-mono opacity-60">
                {isFa ? 'واجد شرایط' : 'Eligible'}
              </span>
            </button>
          ))}
        </div>

        <button
          disabled={!selectedTargetId}
          onClick={handleConfirmAction}
          className={`px-7 py-3 rounded-xl font-serif font-black text-xs uppercase tracking-wider transition-all ${
            selectedTargetId
              ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-lg active:scale-95'
              : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
          }`}
        >
          {isFa ? 'مشاهده پرونده حزبی' : 'Inspect Dossier'}
        </button>

        {/* Secret Result display if already received */}
        {investigatedLoyalty && (
          <div className="mt-4 p-4 rounded-2xl bg-stone-950 border border-amber-600/60 flex flex-col items-center shadow-2xl">
            <span className="text-xs text-stone-400 mb-2">
              {isFa ? `عضویت حزبی ${investigatedLoyalty.targetName}:` : `Party Membership for ${investigatedLoyalty.targetName}:`}
            </span>
            <CardComponent
              variant={
                investigatedLoyalty.membership === 'LIBERAL'
                  ? 'MEMBERSHIP_LIBERAL'
                  : 'MEMBERSHIP_FASCIST'
              }
              size="md"
            />
          </div>
        )}
      </div>
    );
  }

  // 2. SPECIAL ELECTION
  if (power === 'SPECIAL_ELECTION') {
    return (
      <div className="w-full max-w-md mx-auto p-5 sm:p-6 bg-stone-900/95 border-2 border-amber-800/80 rounded-3xl shadow-2xl flex flex-col items-center select-none animate-fadeIn">
        <div className="w-12 h-12 rounded-full border border-amber-500/50 flex items-center justify-center mb-2 bg-amber-950/60 shadow">
          <Vote className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="text-lg font-serif font-black text-amber-100 mb-1">
          {isFa ? 'برگزاری انتخابات ویژه' : 'Call Special Election'}
        </h3>
        <p className="text-xs text-stone-300 text-center mb-4 leading-relaxed">
          {isFa
            ? 'یک بازیکن زنده را برای ریاست‌جمهوری دور بعد انتخاب کنید. پس از پایان آن دور، نوبت عادی به بازیکن بعد از شما بازمی‌گردد.'
            : 'Select any living player as next Presidential Candidate. Regular turn order resumes afterward.'}
        </p>

        <div className="w-full grid grid-cols-1 gap-2 mb-4">
          {livingOthers.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedTargetId(p.id)}
              className={`flex items-center justify-between p-3 rounded-xl border text-sm font-serif transition-all ${
                selectedTargetId === p.id
                  ? 'bg-amber-600 text-stone-950 font-bold border-amber-400 shadow-md scale-[1.02]'
                  : 'bg-stone-800/80 text-stone-200 border-stone-700 hover:bg-stone-750'
              }`}
            >
              <span className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span>{p.name}</span>
              </span>
              <span className="text-xs font-mono opacity-60">
                {isFa ? 'نامزد رئیس دور بعد' : 'Next Candidate'}
              </span>
            </button>
          ))}
        </div>

        <button
          disabled={!selectedTargetId}
          onClick={handleConfirmAction}
          className={`px-7 py-3 rounded-xl font-serif font-black text-xs uppercase tracking-wider transition-all ${
            selectedTargetId
              ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-lg active:scale-95'
              : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
          }`}
        >
          {isFa ? 'تأیید انتخابات ویژه' : 'Confirm Special Election'}
        </button>
      </div>
    );
  }

  // 3. POLICY PEEK
  if (power === 'POLICY_PEEK') {
    return (
      <div className="w-full max-w-md mx-auto p-5 sm:p-6 bg-stone-900/95 border-2 border-amber-800/80 rounded-3xl shadow-2xl flex flex-col items-center select-none animate-fadeIn text-center">
        <div className="w-12 h-12 rounded-full border border-amber-500/50 flex items-center justify-center mb-2 bg-amber-950/60 shadow">
          <Eye className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="text-lg font-serif font-black text-amber-100 mb-1">
          {isFa ? 'نگاه به ۳ کارت بالایی قوانین' : 'Policy Peek'}
        </h3>
        <p className="text-xs text-stone-300 mb-4">
          {isFa
            ? 'شما ۳ کارت بالایی دسته را بدون تغییر ترتیب مشاهده می‌کنید:'
            : 'You secretly view the top 3 cards without altering their order:'}
        </p>

        {policyPeekCards && policyPeekCards.length > 0 ? (
          <div className="flex gap-2 sm:gap-4 justify-center items-center my-3">
            {policyPeekCards.map((p, idx) => (
              <CardComponent
                key={`peek_${idx}`}
                variant={p === 'LIBERAL' ? 'POLICY_LIBERAL' : 'POLICY_FASCIST'}
                size="md"
              />
            ))}
          </div>
        ) : (
          <div className="p-4 text-xs font-mono text-stone-400">
            {isFa ? 'درحال بارگذاری کارت‌ها...' : 'Loading cards...'}
          </div>
        )}

        <button
          onClick={handleConfirmAction}
          className="mt-4 px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-black text-xs uppercase tracking-wider shadow-lg active:scale-95"
        >
          {isFa ? 'دیدم — پایان نوبت' : 'Done — End Turn'}
        </button>
      </div>
    );
  }

  // 4. EXECUTION
  if (power === 'EXECUTION') {
    return (
      <div className="w-full max-w-md mx-auto p-5 sm:p-6 bg-stone-900/95 border-2 border-red-800/80 rounded-3xl shadow-2xl flex flex-col items-center select-none animate-fadeIn">
        <div className="w-14 h-14 rounded-full border-2 border-red-500 flex items-center justify-center mb-2 bg-red-950/70 shadow-lg animate-pulse">
          <Skull className="w-7 h-7 text-red-400" />
        </div>
        <h3 className="text-xl font-serif font-black text-red-200 mb-1">
          {isFa ? 'اعدام رسمی یک بازیکن' : 'Official Execution'}
        </h3>
        <p className="text-xs text-stone-300 text-center mb-4 leading-relaxed">
          {isFa
            ? 'یک بازیکن را جهت اعدام انتخاب کنید. اگر هیتلر باشد، لیبرال‌ها بلافاصله پیروز می‌شوند! در غیر این صورت بازیکن حذف شده و نقشش مخفی می‌ماند.'
            : 'Select a player to execute. If they are Hitler, Liberals win immediately! Otherwise, they are eliminated and their role remains secret.'}
        </p>

        <div className="w-full grid grid-cols-1 gap-2 mb-4">
          {livingOthers.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedTargetId(p.id);
                setShowConfirm(false);
              }}
              className={`flex items-center justify-between p-3 rounded-xl border text-sm font-serif transition-all ${
                selectedTargetId === p.id
                  ? 'bg-red-700 text-white font-bold border-red-400 shadow-md scale-[1.02]'
                  : 'bg-stone-800/80 text-stone-200 border-stone-700 hover:bg-stone-750'
              }`}
            >
              <span className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-red-400" />
                <span>{p.name}</span>
              </span>
              <span className="text-xs font-mono text-red-400">
                {isFa ? 'هدف اعدام' : 'Target'}
              </span>
            </button>
          ))}
        </div>

        {selectedTargetId && !showConfirm && (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-7 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-serif font-black text-xs uppercase tracking-wider shadow-lg active:scale-95"
          >
            {isFa ? 'ادامه برای تأیید اعدام' : 'Proceed to Confirmation'}
          </button>
        )}

        {showConfirm && (
          <div className="w-full p-4 rounded-2xl bg-red-950 border border-red-500 text-center animate-fadeIn shadow-2xl">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-red-200 mb-3">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              <span>
                {isFa
                  ? 'آیا کاملاً مطمئن هستید؟ این اقدام غیرقابل بازگشت است!'
                  : 'Are you absolutely certain? This action is permanent!'}
              </span>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleConfirmAction}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-serif font-black text-xs uppercase shadow-lg active:scale-95"
              >
                {isFa ? 'بله، اعدام شود!' : 'Yes, Execute!'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2.5 rounded-xl bg-stone-800 text-stone-300 font-serif text-xs border border-stone-700 hover:bg-stone-700"
              >
                {isFa ? 'انصراف' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
