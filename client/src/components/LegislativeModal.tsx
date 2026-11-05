import React, { useState } from 'react';
import { CardComponent } from './CardComponent.js';
import { PolicyType } from '../../../server/src/engine/types.js';
import { sound } from '../audio/SoundEffects.js';
import { Scale, Landmark, Flame, ShieldAlert, FileText } from 'lucide-react';

interface LegislativeModalProps {
  phase: string;
  isPresident: boolean;
  isChancellor: boolean;
  drawnPolicies?: PolicyType[];
  vetoUnlocked: boolean;
  onPresidentDiscard: (index: number) => void;
  onChancellorDiscard: (index: number) => void;
  onRequestVeto: () => void;
  onRespondVeto: (agree: boolean) => void;
  lang: 'fa' | 'en';
}

export const LegislativeModal: React.FC<LegislativeModalProps> = ({
  phase,
  isPresident,
  isChancellor,
  drawnPolicies = [],
  vetoUnlocked,
  onPresidentDiscard,
  onChancellorDiscard,
  onRequestVeto,
  onRespondVeto,
  lang,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isFa = lang === 'fa';

  const handleSelectCard = (idx: number) => {
    setSelectedIndex(idx);
    sound.playCardFlip();
  };

  const handleConfirmDiscard = () => {
    if (selectedIndex === null) return;
    sound.playStampThump();
    if (phase === 'LEGISLATIVE_PRESIDENT') {
      onPresidentDiscard(selectedIndex);
    } else if (phase === 'LEGISLATIVE_CHANCELLOR') {
      onChancellorDiscard(selectedIndex);
    }
    setSelectedIndex(null);
  };

  // 1. President discarding 1 of 3
  if (phase === 'LEGISLATIVE_PRESIDENT' && isPresident) {
    return (
      <div className="w-full max-w-lg mx-auto p-5 sm:p-6 flex flex-col items-center select-none bg-[#1c110a] border-2 border-[#54341c] rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.8)] animate-fadeIn my-2">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#2b190f] border border-[#a16f38] text-[#e6c687] font-mono text-xs uppercase tracking-widest mb-1 shadow">
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isFa ? 'جلسه قانون‌گذاری — رئیس‌جمهور' : 'LEGISLATIVE SESSION — PRESIDENT'}</span>
          </div>
          <h3 className="text-lg font-serif font-black text-[#f7e8ce]">
            {isFa ? 'یک کارت را برای سوزاندن انتخاب کنید' : 'Select 1 Policy to Discard'}
          </h3>
          <p className="text-xs text-[#a68e79] mt-1 max-w-sm mx-auto leading-relaxed">
            {isFa
              ? 'کارت انتخاب‌شده در دسته سوخته قرار می‌گیرد و دو کارت دیگر به صدراعظم داده خواهد شد.'
              : 'The selected policy will be secretly discarded; the remaining two pass to the Chancellor.'}
          </p>
        </div>

        <div className="flex gap-2 sm:gap-4 justify-center items-center my-4">
          {drawnPolicies.map((policy, idx) => (
            <CardComponent
              key={`p_card_${idx}`}
              variant={policy === 'LIBERAL' ? 'POLICY_LIBERAL' : 'POLICY_FASCIST'}
              size="md"
              isSelected={selectedIndex === idx}
              onClick={() => handleSelectCard(idx)}
              className="cursor-pointer"
            />
          ))}
        </div>

        <button
          disabled={selectedIndex === null}
          onClick={handleConfirmDiscard}
          className={`px-7 py-3 rounded-2xl font-serif font-black text-xs uppercase tracking-wider transition-all shadow-xl flex items-center gap-2 ${
            selectedIndex !== null
              ? 'bg-[#c49b5a] hover:bg-[#dbb069] text-[#1c100a] active:scale-95'
              : 'bg-[#2b1a11] text-[#634835] cursor-not-allowed border border-[#3d2516]'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-950" aria-hidden="true" />
          <span>{isFa ? 'سوزاندن کارت انتخابی' : 'Discard Selected Policy'}</span>
        </button>
      </div>
    );
  }

  // 2. Chancellor enacting 1 of 2 (or requesting veto)
  if (phase === 'LEGISLATIVE_CHANCELLOR' && isChancellor) {
    return (
      <div className="w-full max-w-lg mx-auto p-5 sm:p-6 flex flex-col items-center select-none bg-[#1c110a] border-2 border-[#54341c] rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.8)] animate-fadeIn my-2">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#2b190f] border border-[#a16f38] text-[#e6c687] font-mono text-xs uppercase tracking-widest mb-1 shadow">
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isFa ? 'جلسه قانون‌گذاری — صدراعظم' : 'LEGISLATIVE SESSION — CHANCELLOR'}</span>
          </div>
          <h3 className="text-lg font-serif font-black text-[#f7e8ce]">
            {isFa ? 'یک کارت را برای سوزاندن انتخاب کنید' : 'Select 1 Policy to Discard'}
          </h3>
          <p className="text-xs text-[#a68e79] mt-1 max-w-sm mx-auto leading-relaxed">
            {isFa
              ? 'کارت انتخابی سوزانده شده و کارت باقیمانده به عنوان قانون رسمی تصویب می‌شود.'
              : 'The selected policy will be discarded; the other policy will be ENACTED.'}
          </p>
        </div>

        <div className="flex gap-4 justify-center items-center my-4">
          {drawnPolicies.map((policy, idx) => (
            <div key={`c_card_${idx}`} className="flex flex-col items-center gap-2">
              <CardComponent
                variant={policy === 'LIBERAL' ? 'POLICY_LIBERAL' : 'POLICY_FASCIST'}
                size="md"
                isSelected={selectedIndex === idx}
                onClick={() => handleSelectCard(idx)}
                className="cursor-pointer"
              />
              <span className="text-[11px] font-mono text-[#a89280] flex items-center gap-1 font-bold">
                {selectedIndex === idx ? (
                  <>
                    <Flame className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
                    <span>{isFa ? 'سوزاندن' : 'Discard'}</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    <span>{isFa ? 'تصویب' : 'Enact'}</span>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-2 justify-center">
          <button
            disabled={selectedIndex === null}
            onClick={handleConfirmDiscard}
            className={`px-6 py-3 rounded-2xl font-serif font-black text-xs uppercase tracking-wider transition-all shadow-xl flex items-center gap-2 ${
              selectedIndex !== null
                ? 'bg-[#c49b5a] hover:bg-[#dbb069] text-[#1c100a] active:scale-95'
                : 'bg-[#2b1a11] text-[#634835] cursor-not-allowed border border-[#3d2516]'
            }`}
          >
            <span>{isFa ? 'سوزاندن و تصویب کارت دیگر' : 'Discard & Enact Other'}</span>
          </button>

          {vetoUnlocked && (
            <button
              onClick={() => {
                sound.playAlert();
                onRequestVeto();
              }}
              className="px-5 py-3 rounded-2xl bg-red-950/80 hover:bg-red-900 border border-red-500 text-red-200 font-serif font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-red-400" aria-hidden="true" />
              <span>{isFa ? 'درخواست وتو' : 'Request VETO'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. President responding to Veto
  if (phase === 'LEGISLATIVE_VETO_OFFERED' && isPresident) {
    return (
      <div className="w-full max-w-lg mx-auto p-6 flex flex-col items-center select-none bg-[#24100e] border-2 border-red-700/80 rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.8)] animate-fadeIn text-center my-2">
        <div className="w-14 h-14 rounded-full border-2 border-red-500 flex items-center justify-center mb-3 bg-red-950/70 shadow-lg">
          <Scale className="w-7 h-7 text-red-400 animate-pulse" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-serif font-black text-red-200 mb-1">
          {isFa ? 'درخواست وتوی صدراعظم' : 'Chancellor Requested VETO'}
        </h3>
        <p className="text-xs text-[#d4b5b3] max-w-sm mb-6 leading-relaxed">
          {isFa
            ? 'صدراعظم پیشنهاد ابطال هر دو کارت را داده است. اگر موافقت کنید، هیچ قانونی تصویب نمی‌شود و شمارنده انتخابات ناموفق ۱ واحد افزایش می‌یابد.'
            : 'Chancellor offers to discard both policies. If you agree, no policy is enacted and election tracker advances +1.'}
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => {
              sound.playStampThump();
              onRespondVeto(true);
            }}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-serif font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95"
          >
            {isFa ? 'موافقت با وتو' : 'Accept VETO'}
          </button>
          <button
            onClick={() => {
              sound.playGavel();
              onRespondVeto(false);
            }}
            className="px-6 py-2.5 rounded-xl bg-[#361e12] hover:bg-[#4d2c1c] text-[#f7e8ce] font-serif font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 border border-[#5c3a21]"
          >
            {isFa ? 'مخالفت با وتو' : 'Reject VETO'}
          </button>
        </div>
      </div>
    );
  }

  // Waiting screen for other players
  return (
    <div className="w-full max-w-sm mx-auto p-5 rounded-3xl bg-[#1c110a] border border-[#4d2f1b] flex flex-col items-center text-center shadow-xl my-2">
      <div className="w-10 h-10 rounded-full border border-[#c49b5a]/40 flex items-center justify-center mb-2 bg-[#2b190f]">
        <Landmark className="w-5 h-5 text-[#e6c687] animate-pulse" aria-hidden="true" />
      </div>
      <span className="font-serif font-bold text-[#f7e8ce] text-sm leading-snug">
        {phase === 'LEGISLATIVE_PRESIDENT'
          ? isFa ? 'رئیس‌جمهور در حال بررسی و سوزاندن قوانین است...' : 'President is examining and discarding a policy...'
          : isFa ? 'صدراعظم در حال بررسی و تصویب قانون است...' : 'Chancellor is choosing a policy to enact...'}
      </span>
      <span className="text-[10px] font-mono text-[#a89280] mt-1">
        {isFa ? 'جلسه غیرعلنی و محرمانه مجلس' : 'Closed confidential session'}
      </span>
    </div>
  );
};
