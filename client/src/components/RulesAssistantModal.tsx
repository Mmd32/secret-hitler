import React, { useState } from 'react';
import { GamePhase } from '../../../server/src/engine/types.js';
import {
  X,
  BookOpen,
  Shield,
  Crown,
  CheckCircle2,
} from 'lucide-react';

type Bi<T> = [T, T];

const PLAYER_TABLE = [
  {
    range: '5–6',
    rangeFa: '۵ تا ۶',
    counts: [
      { n: 5, l: 3, f: 1 },
      { n: 6, l: 4, f: 1 },
    ],
    knowFa: 'فاشیست و هیتلر یکدیگر را می‌شناسند. (فقط یک فاشیست عادی هست.)',
    knowEn: 'The Fascist and Hitler know each other.',
    powers: [
      ['قانون ۱: بدون قدرت', 'Policy 1: no power'],
      ['قانون ۲: بدون قدرت', 'Policy 2: no power'],
      ['قانون ۳: نگاه به قوانین (۳ کارت بالای دسته)', 'Policy 3: Policy Peek (top 3 cards)'],
      ['قانون ۴: اعدام یک بازیکن', 'Policy 4: Execution'],
      ['قانون ۵: اعدام + فعال شدن حق وتو', 'Policy 5: Execution + Veto unlocked'],
      ['قانون ۶: پیروزی فاشیست‌ها', 'Policy 6: Fascist victory'],
    ] as Bi<string>[],
  },
  {
    range: '7–8',
    rangeFa: '۷ تا ۸',
    counts: [
      { n: 7, l: 4, f: 2 },
      { n: 8, l: 5, f: 2 },
    ],
    knowFa: 'فاشیست‌های عادی همدیگر و هیتلر را می‌شناسند. هیتلر هیچ‌کس را نمی‌شناسد.',
    knowEn: 'Fascists know each other and Hitler. Hitler does NOT know the Fascists.',
    powers: [
      ['قانون ۱: بدون قدرت', 'Policy 1: no power'],
      ['قانون ۲: بررسی وفاداری (دیدن حزب یک بازیکن)', 'Policy 2: Investigate Loyalty'],
      ['قانون ۳: انتخابات ویژه (انتخاب رئیس‌جمهور بعدی)', 'Policy 3: Special Election'],
      ['قانون ۴: اعدام یک بازیکن', 'Policy 4: Execution'],
      ['قانون ۵: اعدام + فعال شدن حق وتو', 'Policy 5: Execution + Veto unlocked'],
      ['قانون ۶: پیروزی فاشیست‌ها', 'Policy 6: Fascist victory'],
    ] as Bi<string>[],
  },
  {
    range: '9–10',
    rangeFa: '۹ تا ۱۰',
    counts: [
      { n: 9, l: 5, f: 3 },
      { n: 10, l: 6, f: 3 },
    ],
    knowFa: 'مثل ۷ و ۸ نفره: فاشیست‌ها همدیگر و هیتلر را می‌شناسند ولی هیتلر آن‌ها را نمی‌شناسد.',
    knowEn: 'Same as 7–8: Fascists know everyone; Hitler knows no one.',
    powers: [
      ['قانون ۱: بررسی وفاداری', 'Policy 1: Investigate Loyalty'],
      ['قانون ۲: بررسی وفاداری', 'Policy 2: Investigate Loyalty'],
      ['قانون ۳: انتخابات ویژه', 'Policy 3: Special Election'],
      ['قانون ۴: اعدام یک بازیکن', 'Policy 4: Execution'],
      ['قانون ۵: اعدام + فعال شدن حق وتو', 'Policy 5: Execution + Veto unlocked'],
      ['قانون ۶: پیروزی فاشیست‌ها', 'Policy 6: Fascist victory'],
    ] as Bi<string>[],
  },
];

const GLOSSARY: { q: Bi<string>; a: Bi<string[]>; open?: boolean }[] = [
  {
    open: true,
    q: ['هرج‌ومرج یعنی چه؟ (۳ بار دولت تشکیل نشود)', 'What is Chaos? (3 failed governments)'],
    a: [
      [
        'هر بار که اکثریت به دولت پیشنهادی «نه» بگوید (یا رأی مساوی شود) دولت تشکیل نمی‌شود. «شمارنده انتخابات ناموفق» یک خانه جلو می‌رود و ریاست‌جمهوری به نفر بعدی می‌رسد.',
        'اگر این اتفاق ۳ بار پشت‌سرهم بیفتد، کشور دچار هرج‌ومرج می‌شود: کارت بالای دسته بلافاصله رو می‌شود و بدون رأی‌گیری به‌عنوان قانون تصویب می‌شود (لیبرال یا فاشیست، شانسی).',
        'قدرت ویژه‌ی آن کارت نادیده گرفته می‌شود، شمارنده به صفر برمی‌گردد و محدودیت‌های نامزدی «فراموش» می‌شوند، یعنی همه می‌توانند صدراعظم شوند.',
        'هر بار که قانونی تصویب شود (حتی با هرج‌ومرج)، شمارنده صفر می‌شود.',
      ],
      [
        'Each time a proposed government is rejected (or the vote ties) the Election Tracker moves up one and the Presidency passes on.',
        'After 3 failures in a row the country falls into chaos: the top policy is revealed and enacted immediately, with no vote.',
        'Its power is ignored, the tracker resets, and term limits are forgotten — everyone is eligible again.',
        'Any enacted policy resets the tracker.',
      ],
    ],
  },
  {
    q: ['شمارنده انتخابات ناموفق', 'Election Tracker'],
    a: [
      [
        'سه دایره‌ی کنار پلاک دولت. هر رأی منفی یک دایره روشن می‌کند. وتوی موفق هم یک دایره اضافه می‌کند. با تصویب هر قانون صفر می‌شود.',
      ],
      ['Three pips beside the government card. Each failed vote or successful veto lights one. Any enacted policy resets it.'],
    ],
  },
  {
    q: ['محدودیت دوره (Term Limits)', 'Term limits'],
    a: [
      [
        'رئیس‌جمهور و صدراعظمِ آخرین دولتِ «منتخب» دور بعد نمی‌توانند صدراعظم نامزد شوند. (توجه: دولت‌هایی که رأی نیاوردند حساب نمی‌شوند.)',
        'فقط نامزدی صدراعظم محدود است؛ هر کسی می‌تواند رئیس‌جمهور شود.',
        'وقتی فقط ۵ بازیکن زنده مانده باشند، فقط صدراعظم قبلی محدود است.',
      ],
      [
        'The last ELECTED President and Chancellor cannot be nominated Chancellor next round. Failed governments do not count.',
        'Only Chancellor nominations are limited; anyone can be President.',
        'With 5 players left, only the last Chancellor is limited.',
      ],
    ],
  },
  {
    q: ['حق وتو', 'Veto power'],
    a: [
      [
        'بعد از تصویب ۵ قانون فاشیستی فعال می‌شود. صدراعظم می‌تواند به جای تصویب یکی از دو کارت، «درخواست وتو» بدهد. اگر رئیس‌جمهور موافقت کند، هر دو کارت سوخته می‌شوند و شمارنده‌ی انتخابات یکی جلو می‌رود.',
        'اگر رئیس‌جمهور مخالفت کند، صدراعظم باید یکی از کارت‌ها را تصویب کند.',
      ],
      [
        'Unlocked after the 5th Fascist policy. The Chancellor may request a veto; if the President agrees both policies are discarded and the tracker advances. Otherwise the Chancellor must enact one.',
      ],
    ],
  },
  {
    q: ['«آیا هیتلر هستی؟» بعد از ۳ قانون فاشیستی', 'The Hitler check after 3 Fascist policies'],
    a: [
      [
        'از لحظه‌ای که ۳ قانون فاشیستی تصویب شده باشد، هر دولتی که رأی بیاورد باید بپرسد «آیا صدراعظم هیتلر است؟». اگر بله، فاشیست‌ها فوراً می‌برند.',
        'اگر نه، همه مطمئن می‌شوند این صدراعظم هیتلر نیست. این یک سرنخ بزرگ برای لیبرال‌هاست.',
      ],
      [
        'Once 3 Fascist policies are enacted, whenever a government is elected, ask if the Chancellor is Hitler. If yes: Fascists win. If not, everyone knows that player is not Hitler.',
      ],
    ],
  },
  {
    q: ['نقش مخفی و کارت عضویت حزبی', 'Secret Role vs Party Membership'],
    a: [
      [
        'هر بازیکن دو کارت دارد: «نقش» (لیبرال، فاشیست یا هیتلر) و «عضویت حزبی» (لیبرال یا فاشیست).',
        'هیتلر عضویت حزبی فاشیست دارد. پس وقتی رئیس‌جمهور او را «بررسی» می‌کند، فقط می‌بیند فاشیست است و نمی‌فهمد هیتلر است.',
      ],
      ['Everyone has a Role (Liberal/Fascist/Hitler) and a Party card (Liberal/Fascist). Hitler\'s Party card says Fascist, so an investigation never exposes him.'],
    ],
  },
  {
    q: ['قدرت‌های ویژه‌ی رئیس‌جمهور', 'Executive powers'],
    a: [
      [
        'بررسی وفاداری: یک بازیکن را انتخاب کن و فقط کارت عضویت حزبی‌اش را ببین. هر بازیکن در کل بازی فقط یک بار قابل بررسی است. می‌توانی راست یا دروغ بگویی.',
        'انتخابات ویژه: هر بازیکن دلخواه (حتی دارای محدودیت) رئیس‌جمهور بعدی می‌شود. بعد از آن، نوبت به ترتیب عادی (بعد از تو) ادامه پیدا می‌کند و کسی جا نمی‌ماند.',
        'نگاه به قوانین: سه کارت بالای دسته را فقط خودت می‌بینی، بدون تغییر ترتیب.',
        'اعدام: یک بازیکن حذف می‌شود و دیگر نمی‌تواند حرف بزند، رأی بدهد یا نامزد شود. اگر هیتلر باشد لیبرال‌ها می‌برند؛ در غیر این صورت نقش او فاش نمی‌شود.',
        'قدرت باید قبل از دور بعد استفاده شود و ذخیره نمی‌شود.',
      ],
      [
        'Investigate: see one player\'s Party card (each player at most once). You may lie about it.',
        'Special Election: pick any player as next President; the normal rotation then resumes after you.',
        'Policy Peek: look at the top 3 cards, order unchanged.',
        'Execution: remove a player. If Hitler, Liberals win; otherwise the role is not revealed.',
        'A power must be used before the next round and never carries over.',
      ],
    ],
  },
  {
    q: ['چه چیزهایی را می‌شود دروغ گفت؟', 'What may I lie about?'],
    a: [
      [
        'همه‌چیز! دربارهٔ کارت‌هایی که دیده‌اید، نتیجه‌ی بررسی و حتی نقش خودتان می‌توانید دروغ بگویید.',
        'فقط دو استثنا: هیتلر باید راست بگوید اگر او را اعدام کنند یا بعد از ۳ قانون فاشیستی صدراعظم شود.',
        'در جلسه‌ی قانون‌گذاری، رئیس‌جمهور و صدراعظم نباید با اشاره و علامت با هم هماهنگ شوند و نباید کارت را شانسی انتخاب کنند.',
      ],
      [
        'Almost everything. The only forced truths: Hitler must say so if executed or elected Chancellor after 3 Fascist policies. President and Chancellor may not signal or randomise.',
      ],
    ],
  },
  {
    q: ['چطور برنده شویم؟ (نکات استراتژی)', 'Strategy tips'],
    a: [
      [
        'لیبرال: معمولاً راست بگویید و کند بازی کنید؛ دلیل هر انتخاب را از بقیه بپرسید. اگر قانون فاشیستی آمد، فقط سه مظنون هست: رئیس‌جمهور، صدراعظم یا خود دسته.',
        'فاشیست: همه‌ی مواقع خودتان را لیبرال نشان دهید و منتظر فرصت بمانید. هدف اصلی معمولاً صدراعظم کردن هیتلر است، نه ۶ قانون.',
        'هیتلر: تا جای ممکن لیبرال رفتار کنید، دعوا نکنید و اعتماد جمع کنید.',
      ],
      [
        'Liberals: slow down, ask why. Fascists: look Liberal, wait for cover. Hitler: play as Liberal as possible.',
      ],
    ],
  },
];

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
  const [activeTab, setActiveTab] = useState<'PHASE' | 'RULES' | 'PLAYERS' | 'GLOSSARY' | 'TUTORIAL'>('PHASE');
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
      <div className="relative w-full max-w-lg card-surface-strong flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
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
        <div className="flex overflow-x-auto border-b border-[#2c3548] bg-[#10141c] text-xs font-bold" role="tablist">
          {([
            ['PHASE', isFa ? 'نوبت کنونی' : 'Now'],
            ['PLAYERS', isFa ? 'بر اساس تعداد نفرات' : 'By players'],
            ['GLOSSARY', isFa ? 'اصطلاحات' : 'Glossary'],
            ['RULES', isFa ? 'شرایط پیروزی' : 'Victory'],
            ['TUTORIAL', isFa ? 'آموزش سریع' : 'Quick start'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={`shrink-0 whitespace-nowrap px-4 py-2.5 text-center transition-all ${
                activeTab === id ? 'border-b-2 border-[#d9b36a] bg-[#1a202c] text-[#d9b36a]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
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

          {activeTab === 'PLAYERS' && (
            <div className="space-y-4">
              <p className="text-slate-300">
                {isFa
                  ? 'هر چه تعداد بازیکنان بیشتر باشد، فاشیست‌ها بیشتر می‌شوند و قدرت‌های ویژه‌ی بورد فاشیست تغییر می‌کند. جدول زیر همه‌ی تفاوت‌ها را نشان می‌دهد.'
                  : 'Player count changes team sizes, who knows whom, and which powers appear on the Fascist board.'}
              </p>

              {PLAYER_TABLE.map((row) => (
                <div key={row.range} className="rounded-xl border border-[#2c3548] bg-[#1a202c] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-[#ecd08f]">{isFa ? `${row.rangeFa} بازیکن` : `${row.range} players`}</h4>
                    <span className="chip">{isFa ? `بورد فاشیست ${row.rangeFa}` : `Board ${row.range}`}</span>
                  </div>
                  <div className="mb-2 grid grid-cols-3 gap-1 text-center text-[11px]">
                    {row.counts.map((c) => (
                      <div key={c.n} className="col-span-3 grid grid-cols-4 gap-1 rounded-lg bg-black/20 py-1">
                        <span className="font-bold text-slate-300">{c.n}</span>
                        <span className="text-[#73a3b8]">{c.l} {isFa ? 'لیبرال' : 'Lib'}</span>
                        <span className="text-red-300">{c.f} {isFa ? 'فاشیست' : 'Fas'}</span>
                        <span className="text-[#d8a853]">{isFa ? '+ هیتلر' : '+ Hitler'}</span>
                      </div>
                    ))}
                  </div>
                  <ul className="space-y-1.5 text-slate-300">
                    <li>
                      <b className="text-slate-100">{isFa ? 'چه کسی چه کسی را می‌شناسد؟ ' : 'Who knows whom: '}</b>
                      {isFa ? row.knowFa : row.knowEn}
                    </li>
                    <li>
                      <b className="text-slate-100">{isFa ? 'قدرت‌های بورد فاشیست:' : 'Fascist board powers:'}</b>
                      <ol className="mt-1 space-y-0.5">
                        {row.powers.map((pw, i) => (
                          <li key={i} className="flex items-center gap-2 rounded bg-black/20 px-2 py-1 text-[11.5px]">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-[10px] font-extrabold text-red-300">{i + 1}</span>
                            <span>{isFa ? pw[0] : pw[1]}</span>
                          </li>
                        ))}
                      </ol>
                    </li>
                  </ul>
                </div>
              ))}

              <div className="rounded-xl border border-[#2c3548] bg-[#1a202c] p-3">
                <h4 className="mb-2 text-sm font-extrabold text-[#ecd08f]">{isFa ? 'حداقل رأی موافق برای تشکیل دولت' : 'Yes votes needed to elect a government'}</h4>
                <div className="grid grid-cols-6 gap-1 text-center text-[11px]">
                  {[5, 6, 7, 8, 9, 10].map((n) => (
                    <div key={n} className="rounded-lg bg-black/20 py-1.5">
                      <div className="text-slate-500">{n}</div>
                      <div className="text-base font-extrabold text-emerald-300">{Math.floor(n / 2) + 1}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-slate-400">
                  {isFa
                    ? 'همه‌ی بازیکنان زنده (حتی رئیس‌جمهور و صدراعظم نامزد) رأی می‌دهند. تساوی یعنی رد شدن. بعد از اعدام یک نفر، تعداد رأی‌دهندگان و حداقل لازم یکی کم می‌شود.'
                    : 'Every living player votes, candidates included. A tie fails. After an execution the electorate shrinks.'}
                </p>
              </div>

              <div className="rounded-xl border border-[#2c3548] bg-[#1a202c] p-3 text-slate-300">
                <h4 className="mb-2 text-sm font-extrabold text-[#ecd08f]">{isFa ? 'محدودیت نامزدی صدراعظم' : 'Chancellor term limits'}</h4>
                <ul className="list-disc space-y-1 ps-5">
                  <li>{isFa ? 'اگر بیش از ۵ بازیکن زنده باشند: رئیس‌جمهور و صدراعظمِ آخرین دولت منتخب نمی‌توانند صدراعظم نامزد شوند.' : 'More than 5 alive: both the last elected President and Chancellor are ineligible.'}</li>
                  <li>{isFa ? 'اگر فقط ۵ بازیکن زنده مانده باشند: فقط صدراعظم آخرین دولت منتخب نامزدشدنی نیست. رئیس‌جمهور قبلی می‌تواند.' : 'Exactly 5 alive: only the last elected Chancellor is ineligible.'}</li>
                </ul>
              </div>

              <div className="rounded-xl border border-[#2c3548] bg-[#1a202c] p-3 text-slate-300">
                <h4 className="mb-2 text-sm font-extrabold text-[#ecd08f]">{isFa ? 'دسته کارت (در همه‌ی بازی‌ها یکسان)' : 'Policy deck (same for every size)'}</h4>
                <p>
                  {isFa
                    ? '۱۷ کارت: ۶ لیبرال و ۱۱ فاشیست. وقتی کمتر از ۳ کارت در دسته بماند، با دسته‌ی سوخته مخلوط و دوباره چیده می‌شود. کارت‌های سوخته هیچ‌وقت نشان داده نمی‌شوند.'
                    : '17 tiles: 6 Liberal + 11 Fascist. When fewer than 3 remain, shuffle in the discards. Discards are never revealed.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'GLOSSARY' && (
            <div className="space-y-3">
              {GLOSSARY.map((g) => (
                <details key={g.q[0]} className="group rounded-xl border border-[#2c3548] bg-[#1a202c] p-3 open:border-[#d9b36a]/40" open={g.open}>
                  <summary className="cursor-pointer list-none text-sm font-extrabold text-[#ecd08f]">
                    {isFa ? g.q[0] : g.q[1]}
                  </summary>
                  <div className="mt-2 space-y-1.5 leading-7 text-slate-300">
                    {(isFa ? g.a[0] : g.a[1]).map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </details>
              ))}
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
