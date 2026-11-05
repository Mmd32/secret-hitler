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
      <div className="w-full max-w-sm mx-auto p-5 rounded-3xl bg-[#1c110a] border border-[#4d2f1b] flex flex-col items-center text-center shadow-xl my-2">
        <ScrollText className="w-7 h-7 text-[#c49b5a] mb-2 animate-pulse" aria-hidden="true" />
        <h4 className="font-serif font-bold text-[#f7e8ce] text-sm">
          {isFa
            ? `رئیس‌جمهور (${presidentName}) در حال اجرای قدرت ریاست‌جمهوری است...`
            : `President (${presidentName}) is executing a Presidential Power...`}
        </h4>
        <span className="text-[10px] text-[#a89280] mt-1 font-mono uppercase">
          {power}
        </span>
      </div>
    );
  }

  // 1. INVESTIGATE LOYALTY
  if (power === 'INVESTIGATE_LOYALTY') {
    return (
      <div className="w-full max-w-md mx-auto p-5 sm:p-6 bg-[#1c110a] border-2 border-[#54341c] rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.8)] flex flex-col items-center select-none animate-fadeIn my-2">
        <div className="w-12 h-12 rounded-full border border-[#c49b5a]/60 flex items-center justify-center mb-2 bg-[#29170e] shadow">
          <Search className="w-6 h-6 text-[#e6c687]" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-serif font-black text-[#f7e8ce] mb-1">
          {isFa ? 'بررسی وفاداری حزبی' : 'Investigate Loyalty'}
        </h3>
        <p className="text-xs text-[#a68e79] text-center mb-4 leading-relaxed">
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
                  ? 'bg-[#c49b5a] text-[#1c100a] font-bold border-[#e6c687] shadow-md scale-[1.01]'
                  : 'bg-[#29170e] text-[#f7e8ce] border-[#4d2f1b] hover:bg-[#382013]'
              }`}
            >
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#8a725f]" aria-hidden="true" />
                <span>{p.name}</span>
              </span>
              <span className="text-[10px] font-mono opacity-70">
                {isFa ? 'واجد شرایط' : 'Eligible'}
              </span>
            </button>
          ))}
        </div>

        <button
          disabled={!selectedTargetId}
          onClick={handleConfirmAction}
          className={`px-7 py-3 rounded-2xl font-serif font-black text-xs uppercase tracking-wider transition-all shadow-xl ${
            selectedTargetId
              ? 'bg-[#c49b5a] hover:bg-[#dbb069] text-[#1c100a] active:scale-95'
              : 'bg-[#2b1a11] text-[#634835] cursor-not-allowed border border-[#3d2516]'
          }`}
        >
          {isFa ? 'مشاهده پرونده حزبی' : 'Inspect Dossier'}
        </button>

        {/* Secret Result display if already received */}
        {investigatedLoyalty && (
          <div className="mt-4 p-4 rounded-2xl bg-[#24100c] border border-[#a16f38] flex flex-col items-center shadow-2xl">
            <span className="text-xs text-[#a68e79] mb-2 font-serif font-bold">
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
      <div className="w-full max-w-md mx-auto p-5 sm:p-6 bg-[#1c110a] border-2 border-[#54341c] rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.8)] flex flex-col items-center select-none animate-fadeIn my-2">
        <div className="w-12 h-12 rounded-full border border-[#c49b5a]/60 flex items-center justify-center mb-2 bg-[#29170e] shadow">
          <Vote className="w-6 h-6 text-[#e6c687]" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-serif font-black text-[#f7e8ce] mb-1">
          {isFa ? 'برگزاری انتخابات ویژه' : 'Call Special Election'}
        </h3>
        <p className="text-xs text-[#a68e79] text-center mb-4 leading-relaxed">
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
                  ? 'bg-[#c49b5a] text-[#1c100a] font-bold border-[#e6c687] shadow-md scale-[1.01]'
                  : 'bg-[#29170e] text-[#f7e8ce] border-[#4d2f1b] hover:bg-[#382013]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#8a725f]" aria-hidden="true" />
                <span>{p.name}</span>
              </span>
              <span className="text-[10px] font-mono opacity-70">
                {isFa ? 'نامزد رئیس دور بعد' : 'Next Candidate'}
              </span>
            </button>
          ))}
        </div>

        <button
          disabled={!selectedTargetId}
          onClick={handleConfirmAction}
          className={`px-7 py-3 rounded-2xl font-serif font-black text-xs uppercase tracking-wider transition-all shadow-xl ${
            selectedTargetId
              ? 'bg-[#c49b5a] hover:bg-[#dbb069] text-[#1c100a] active:scale-95'
              : 'bg-[#2b1a11] text-[#634835] cursor-not-allowed border border-[#3d2516]'
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
      <div className="w-full max-w-md mx-auto p-5 sm:p-6 bg-[#1c110a] border-2 border-[#54341c] rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.8)] flex flex-col items-center select-none animate-fadeIn text-center my-2">
        <div className="w-12 h-12 rounded-full border border-[#c49b5a]/60 flex items-center justify-center mb-2 bg-[#29170e] shadow">
          <Eye className="w-6 h-6 text-[#e6c687]" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-serif font-black text-[#f7e8ce] mb-1">
          {isFa ? 'نگاه به ۳ کارت بالایی قوانین' : 'Policy Peek'}
        </h3>
        <p className="text-xs text-[#a68e79] mb-4">
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
          <div className="p-4 text-xs font-mono text-[#a89280]">
            {isFa ? 'درحال بارگذاری کارت‌ها...' : 'Loading cards...'}
          </div>
        )}

        <button
          onClick={handleConfirmAction}
          className="mt-4 px-8 py-3 rounded-2xl bg-[#c49b5a] hover:bg-[#dbb069] text-[#1c100a] font-serif font-black text-xs uppercase tracking-wider shadow-xl active:scale-95"
        >
          {isFa ? 'دیدم — پایان نوبت' : 'Done — End Turn'}
        </button>
      </div>
    );
  }

  // 4. EXECUTION
  if (power === 'EXECUTION') {
    return (
      <div className="w-full max-w-md mx-auto p-5 sm:p-6 bg-[#24100e] border-2 border-red-800/80 rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.8)] flex flex-col items-center select-none animate-fadeIn my-2">
        <div className="w-14 h-14 rounded-full border-2 border-red-500 flex items-center justify-center mb-2 bg-red-950/70 shadow-lg animate-pulse">
          <Skull className="w-7 h-7 text-red-400" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-serif font-black text-red-200 mb-1">
          {isFa ? 'اعدام رسمی یک بازیکن' : 'Official Execution'}
        </h3>
        <p className="text-xs text-[#d4b5b3] text-center mb-4 leading-relaxed">
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
                  ? 'bg-red-700 text-white font-bold border-red-400 shadow-md scale-[1.01]'
                  : 'bg-[#1a0908] text-[#f7e8ce] border-[#5c1c18] hover:bg-[#2e100e]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-red-400" aria-hidden="true" />
                <span>{p.name}</span>
              </span>
              <span className="text-[10px] font-mono text-red-400">
                {isFa ? 'هدف اعدام' : 'Target'}
              </span>
            </button>
          ))}
        </div>

        {selectedTargetId && !showConfirm && (
          <button
            onClick={() => setShowConfirm(true)}
            className="px-7 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-serif font-black text-xs uppercase tracking-wider shadow-lg active:scale-95"
          >
            {isFa ? 'ادامه برای تأیید اعدام' : 'Proceed to Confirmation'}
          </button>
        )}

        {showConfirm && (
          <div className="w-full p-4 rounded-2xl bg-[#1c0807] border border-red-500 text-center animate-fadeIn shadow-2xl">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-red-200 mb-3">
              <AlertOctagon className="w-4 h-4 text-red-400" aria-hidden="true" />
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
                className="px-5 py-2.5 rounded-xl bg-[#2b180e] text-[#f7e8ce] font-serif text-xs border border-[#4d2f1b] hover:bg-[#382013]"
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
