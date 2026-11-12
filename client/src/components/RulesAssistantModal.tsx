import React, { useState } from 'react';
import { GamePhase } from '../../../server/src/engine/types.js';
import {
  X,
  BookOpen,
  Shield,
  Crown,
  CheckCircle2,
} from 'lucide-react';

interface RulesAssistantModalProps {
  phase?: GamePhase;
  isOpen: boolean;
  onClose: () => void;
  lang: 'fa' | 'en';
}

export const RulesAssistantModal: React.FC<RulesAssistantModalProps> = ({
  phase,
  isOpen,
  onClose,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'PHASE' | 'RULES' | 'TUTORIAL'>('PHASE');
  const isFa = lang === 'fa';

  if (!isOpen) return null;

  // Phase explanations
  const getPhaseGuide = () => {
    switch (phase) {
      case 'ELECTION_NOMINATION':
        return {
          title: isFa ? 'مرحله اول: نامزدی صدراعظم' : 'Phase 1: Chancellor Nomination',
          desc: isFa
            ? 'رئیس‌جمهور فعلی باید یکی از بازیکنان واجد شرایط را به عنوان صدراعظم به مجلس پیشنهاد دهد.'
            : 'The current President nominates an eligible player as Chancellor.',
          rules: [
            isFa
              ? 'محدودیت تصدی دور قبل: صدراعظم دور قبل نمی‌تواند مجدداً نامزد شود.'
              : 'Term Limits: The previous Chancellor cannot be nominated.',
            isFa
              ? 'در بازی‌های ۶ نفره به بالا، رئیس‌جمهور دور قبل نیز نمی‌تواند نامزد صدراعظمی شود.'
              : 'In games with >5 living players, the previous President is also term-limited.',
            isFa
              ? 'رئیس‌جمهور نمی‌تواند خود را نامزد کند.'
              : 'The President cannot nominate themselves.',
          ],
        };
      case 'ELECTION_VOTING':
        return {
          title: isFa ? 'مرحله دوم: رأی اعتماد به دولت' : 'Phase 2: Confidence Vote',
          desc: isFa
            ? 'تمام بازیکنان زنده به دولت پیشنهادی (رئیس‌جمهور و صدراعظم) رأی موافق (Ja!) یا مخالف (Nein!) می‌دهند.'
            : 'All living players cast a secret ballot (Ja! or Nein!) for the proposed government.',
          rules: [
            isFa
              ? 'تصویب نیاز به بیش از ۵۰٪ آرای مثبت دارد (در صورت تساوی، دولت رد می‌شود).'
              : 'Strict majority (>50%) of JA votes required. Ties result in failure.',
            isFa
              ? 'اگر رأی رد شود، نشانگر شکست انتخابات یک گام جلو می‌رود و ریاست به نفر بعد می‌رسد.'
              : 'If rejected, Election Tracker advances and presidential placard passes clockwise.',
            isFa
              ? 'اگر ۳ بار متوالی انتخابات شکست بخورد، آشوب مجلس رخ داده و کارت بالای دسته فوراً تصویب می‌شود!'
              : '3 consecutive failed elections trigger Reichstag Chaos: top policy is enacted with no powers.',
            isFa
              ? 'هشدار هیتلر: اگر ۳ قانون فاشیستی تصویب شده باشد و هیتلر به صدراعظمی برسد، فاشیست‌ها فوراً برنده می‌شوند!'
              : 'Hitler Alert: If 3+ Fascist policies are enacted and Hitler is elected Chancellor, Fascists win immediately!',
          ],
        };
      case 'LEGISLATIVE_PRESIDENT':
      case 'LEGISLATIVE_CHANCELLOR':
      case 'LEGISLATIVE_VETO_OFFERED':
        return {
          title: isFa ? 'مرحله سوم: جلسه قانون‌گذاری مجلس' : 'Phase 3: Legislative Session',
          desc: isFa
            ? 'رئیس‌جمهور ۳ کارت می‌کشد، ۱ کارت را می‌سوزاند و ۲ کارت را به صدراعظم می‌دهد. صدراعظم ۱ کارت را تصویب و دیگری را می‌سوزاند.'
            : 'President draws 3 policies, discards 1, passes 2 to Chancellor. Chancellor enacts 1 and discards 1.',
          rules: [
            isFa
              ? 'سکوت مطلق: رئیس‌جمهور و صدراعظم حق ندارند در حین جلسه در مورد ماهیت کارت‌ها صحبت کنند.'
              : 'Strict Secrecy: No verbal or non-verbal communication about drawn cards is permitted.',
            isFa
              ? 'کارت‌های سوخته به هیچ‌کس نشان داده نمی‌شوند.'
              : 'Discarded cards are concealed from all other players.',
            isFa
              ? 'حق وتو: پس از تصویب ۵ قانون فاشیستی، صدراعظم می‌تواند وتو پیشنهاد دهد و در صورت موافقت رئیس‌جمهور، هر دو کارت بدون تصویب سوزانده می‌شوند.'
              : 'Veto Power: Unlocked at 5 Fascist policies. If both agree, both cards are discarded.',
          ],
        };
      case 'EXECUTIVE_POWER':
        return {
          title: isFa ? 'مرحله چهارم: اختیارات ویژه ریاست‌جمهوری' : 'Phase 4: Executive Powers',
          desc: isFa
            ? 'تصویب قانون فاشیستی می‌تواند اختیارات ویژه‌ای به رئیس‌جمهور مستقر اعطا کند.'
            : 'Enacting a Fascist policy grants the sitting President an executive power.',
          rules: [
            isFa
              ? 'بررسی وفاداری: رئیس‌جمهور کارت عضویت حزبی یک بازیکن را بررسی می‌کند (هویت هیتلر لو نمی‌رود).'
              : 'Investigate Loyalty: President secretly checks a player’s party membership card.',
            isFa
              ? 'نگاه به قوانین: رئیس‌جمهور ۳ کارت بالای دسته را مخفیانه می‌بیند.'
              : 'Policy Peek: President secretly inspects the top 3 cards of the draw pile.',
            isFa
              ? 'انتخابات ویژه: رئیس‌جمهور تعیین می‌کند چه کسی در دور بعد رئیس‌جمهور شود.'
              : 'Special Election: President chooses the next President candidate.',
            isFa
              ? 'اعدام: رئیس‌جمهور یک بازیکن را اعدام می‌کند. اگر هیتلر اعدام شود، لیبرال‌ها فوراً پیروز می‌شوند!'
              : 'Execution: President executes a player. If Hitler is killed, Liberals win immediately!',
          ],
        };
      default:
        return {
          title: isFa ? 'میز مجلس شورای جمهوری' : 'Reichstag Council Table',
          desc: isFa
            ? 'بازی استنتاج و فریب سیاسی ۱۹۳۲ با قوانین رسمی Secret Hitler.'
            : 'Social deduction and political deception set in 1932 Weimar Germany.',
          rules: [
            isFa ? '۵ قانون لیبرال یا اعدام هیتلر = پیروزی لیبرال‌ها' : '5 Liberal policies or Hitler killed = Liberal Victory',
            isFa ? '۶ قانون فاشیستی یا انتخاب هیتلر به صدراعظمی پس از ۳ قانون = پیروزی فاشیست‌ها' : '6 Fascist policies or Hitler elected Chancellor after 3 = Fascist Victory',
          ],
        };
    }
  };

  const currentGuide = getPhaseGuide();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#1a110a] border-2 border-[#2c3548] shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2c3548] bg-[#1a202c]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#d9b36a]" />
            <h3 className="font-serif font-black text-sm sm:text-base text-[#f3dfb0] tracking-wide">
              {isFa ? 'راهنمای قوانین بازی' : 'Official Rules Assistant'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close rules assistant"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2c3548] bg-[#1a100a] text-xs font-serif font-bold">
          <button
            onClick={() => setActiveTab('PHASE')}
            className={`flex-1 py-2.5 text-center transition-all ${
              activeTab === 'PHASE'
                ? 'text-[#d9b36a] border-b-2 border-[#d9b36a] bg-[#1a202c]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isFa ? 'نوبت کنونی' : 'Current Phase'}
          </button>
          <button
            onClick={() => setActiveTab('RULES')}
            className={`flex-1 py-2.5 text-center transition-all ${
              activeTab === 'RULES'
                ? 'text-[#d9b36a] border-b-2 border-[#d9b36a] bg-[#1a202c]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isFa ? 'قوانین اساسی' : 'Core Rules'}
          </button>
          <button
            onClick={() => setActiveTab('TUTORIAL')}
            className={`flex-1 py-2.5 text-center transition-all ${
              activeTab === 'TUTORIAL'
                ? 'text-[#d9b36a] border-b-2 border-[#d9b36a] bg-[#1a202c]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isFa ? 'آموزش سریع' : 'Quick Tutorial'}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs font-serif leading-relaxed">
          {activeTab === 'PHASE' && (
            <div>
              <div className="p-3 rounded-2xl bg-[#29170f] border border-[#37425a] mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#d9b36a] block mb-1">
                  {isFa ? 'وضعیت مجلس' : 'REICHSTAG STATUS'}
                </span>
                <h4 className="font-serif font-black text-sm sm:text-base text-[#f3dfb0] mb-1">
                  {currentGuide.title}
                </h4>
                <p className="text-[#c7b29f]">{currentGuide.desc}</p>
              </div>

              <div className="space-y-2 mt-3">
                <span className="text-[11px] font-bold text-[#d9b36a] uppercase tracking-wider block">
                  {isFa ? 'نکات مهم این نوبت:' : 'Key Phase Directives:'}
                </span>
                {currentGuide.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[#e3d7cd]">
                    <CheckCircle2 className="w-4 h-4 text-[#d9b36a] shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'RULES' && (
            <div className="space-y-4">
              {/* Victory Conditions */}
              <div className="p-3 rounded-xl bg-[#1a202c] border border-[#2c3548]">
                <h4 className="font-bold text-[#ecd08f] text-sm mb-2 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-[#d9b36a]" />
                  <span>{isFa ? 'شرایط پیروزی احزاب' : 'Victory Conditions'}</span>
                </h4>
                <div className="space-y-2 text-[#d4c3b4]">
                  <div>
                    <span className="font-bold text-[#73a3b8] block">
                      {isFa ? 'پیروزی لیبرال‌ها:' : 'Liberal Victory:'}
                    </span>
                    {isFa ? '۱. تصویب ۵ قانون لیبرال، یا' : '1. Enact 5 Liberal policies, OR'}
                    <br />
                    {isFa ? '۲. اعدام موفق آدولف هیتلر' : '2. Successfully execute Adolf Hitler'}
                  </div>
                  <div className="pt-2 border-t border-[#262e3f]">
                    <span className="font-bold text-red-300 block">
                      {isFa ? 'پیروزی فاشیست‌ها:' : 'Fascist Victory:'}
                    </span>
                    {isFa ? '۱. تصویب ۶ قانون فاشیستی، یا' : '1. Enact 6 Fascist policies, OR'}
                    <br />
                    {isFa
                      ? '۲. انتخاب هیتلر به عنوان صدراعظم در شرایطی که حداقل ۳ قانون فاشیستی از قبل تصویب شده باشد.'
                      : '2. Elect Hitler as Chancellor after at least 3 Fascist policies are enacted.'}
                  </div>
                </div>
              </div>

              {/* Roles Matrix */}
              <div className="p-3 rounded-xl bg-[#1a202c] border border-[#2c3548]">
                <h4 className="font-bold text-[#ecd08f] text-sm mb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#d9b36a]" />
                  <span>{isFa ? 'توزیع نقش‌ها بر اساس تعداد بازیکن' : 'Role Distribution'}</span>
                </h4>
                <div className="grid grid-cols-4 gap-1 text-[11px] font-mono text-center border-b border-[#2c3548] pb-1 mb-1 font-bold text-[#d9b36a]">
                  <span>{isFa ? 'نفرات' : 'Players'}</span>
                  <span>{isFa ? 'لیبرال' : 'Liberal'}</span>
                  <span>{isFa ? 'فاشیست' : 'Fascist'}</span>
                  <span>{isFa ? 'هیتلر' : 'Hitler'}</span>
                </div>
                {[
                  { n: 5, l: 3, f: 1, h: 1 },
                  { n: 6, l: 4, f: 1, h: 1 },
                  { n: 7, l: 4, f: 2, h: 1 },
                  { n: 8, l: 5, f: 2, h: 1 },
                  { n: 9, l: 5, f: 3, h: 1 },
                  { n: 10, l: 6, f: 3, h: 1 },
                ].map((row) => (
                  <div key={row.n} className="grid grid-cols-4 gap-1 text-[11px] font-mono text-center py-0.5 text-slate-300">
                    <span>{row.n}</span>
                    <span className="text-[#73a3b8]">{row.l}</span>
                    <span className="text-red-300">{row.f}</span>
                    <span className="text-[#d8a853]">{row.h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'TUTORIAL' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#1a202c] border border-[#2c3548]">
                <span className="font-mono text-[#d9b36a] text-[10px] font-bold block mb-0.5">
                  {isFa ? 'گام ۱: نامزدی' : 'STEP 1: NOMINATION'}
                </span>
                <p className="text-slate-300">
                  {isFa
                    ? 'پلاک ریاست‌جمهوری ساعت‌گرد می‌چرخد. رئیس‌جمهور، صدراعظم را نامزد می‌کند.'
                    : 'The Presidency moves clockwise. President nominates an eligible Chancellor.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#1a202c] border border-[#2c3548]">
                <span className="font-mono text-[#d9b36a] text-[10px] font-bold block mb-0.5">
                  {isFa ? 'گام ۲: رأی اعتماد' : 'STEP 2: ELECTION'}
                </span>
                <p className="text-slate-300">
                  {isFa
                    ? 'همه با برگه‌های محرمانه رأی می‌دهند. بیش از ۵۰٪ موافق = شروع جلسه قانون‌گذاری.'
                    : 'Everyone votes Ja! or Nein!. >50% Ja votes confirms the government.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#1a202c] border border-[#2c3548]">
                <span className="font-mono text-[#d9b36a] text-[10px] font-bold block mb-0.5">
                  {isFa ? 'گام ۳: قانون‌گذاری' : 'STEP 3: LEGISLATION'}
                </span>
                <p className="text-slate-300">
                  {isFa
                    ? 'رئیس‌جمهور از بین ۳ کارت، ۱ کارت می‌سوزاند. صدراعظم از ۲ کارت باقی‌مانده، ۱ کارت را تصویب می‌کند.'
                    : 'President discards 1 of 3 cards. Chancellor enacts 1 of 2 cards.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#1a202c] border border-[#2c3548]">
                <span className="font-mono text-[#d9b36a] text-[10px] font-bold block mb-0.5">
                  {isFa ? 'گام ۴: اختیارات ویژه' : 'STEP 4: POWERS'}
                </span>
                <p className="text-slate-300">
                  {isFa
                    ? 'تصویب احکام فاشیستی می‌تواند قدرت‌های ویژه (بازرسی، نگاه به قوانین، انتخابات یا اعدام) اعطا کند.'
                    : 'Fascist policies unlock Executive Actions for the sitting President.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Button */}
        <div className="p-3 border-t border-[#2c3548] bg-[#1a202c] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#d9b36a] hover:bg-[#e6bf78] text-[#1c100a] font-serif font-bold text-xs uppercase tracking-wide transition-all shadow active:scale-95"
          >
            {isFa ? 'بستن راهنما' : 'Got It'}
          </button>
        </div>
      </div>
    </div>
  );
};
