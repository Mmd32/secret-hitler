import React from 'react';
import { Lightbulb, Hand, Hourglass } from 'lucide-react';

interface GuideBannerProps {
  phase: string;
  lang: 'fa' | 'en';
  isPresident: boolean;
  isChancellor: boolean;
  hasVoted: boolean;
  isAlive: boolean;
  vetoUnlocked: boolean;
  power: string | null;
  presidentName: string;
  chancellorName: string;
  role?: 'LIBERAL' | 'FASCIST' | 'HITLER';
}

const STEPS = [
  { id: 'nom', fa: 'نامزدی', en: 'Nominate', phases: ['ELECTION_NOMINATION'] },
  { id: 'vote', fa: 'رأی‌گیری', en: 'Vote', phases: ['ELECTION_VOTING'] },
  { id: 'law', fa: 'قانون‌گذاری', en: 'Legislate', phases: ['LEGISLATIVE_PRESIDENT', 'LEGISLATIVE_CHANCELLOR', 'LEGISLATIVE_VETO_OFFERED'] },
  { id: 'power', fa: 'قدرت ویژه', en: 'Power', phases: ['EXECUTIVE_POWER'] },
];

export const GuideBanner: React.FC<GuideBannerProps> = ({
  phase, lang, isPresident, isChancellor, hasVoted, isAlive, vetoUnlocked, power, presidentName, chancellorName, role,
}) => {
  const fa = lang === 'fa';
  const stepIdx = STEPS.findIndex((s) => s.phases.includes(phase));
  if (stepIdx < 0) return null;

  const powerFa: Record<string, string> = {
    INVESTIGATE_LOYALTY: 'یک بازیکن را انتخاب کن تا فقط وابستگی حزبی او (لیبرال یا فاشیست) را ببینی. نقش دقیق (هیتلر) نشان داده نمی‌شود. بعد می‌توانی راست یا دروغ به بقیه بگویی.',
    SPECIAL_ELECTION: 'یک بازیکن دلخواه را انتخاب کن تا رئیس‌جمهورِ دور بعد شود. بعد از آن نوبت به ترتیب عادی ادامه پیدا می‌کند.',
    POLICY_PEEK: 'سه کارت بالای دسته را فقط خودت می‌بینی. ترتیب آن‌ها تغییر نمی‌کند. می‌توانی آنچه دیدی را به بقیه بگویی یا دروغ بگویی.',
    EXECUTION: 'یک بازیکن را انتخاب کن تا از بازی حذف شود. اگر او هیتلر باشد، لیبرال‌ها بلافاصله می‌برند. نقش بازیکن حذف‌شده اعلام نمی‌شود.',
  };
  const powerEn: Record<string, string> = {
    INVESTIGATE_LOYALTY: "Pick a player to secretly see their party (Liberal/Fascist) — not whether they're Hitler. You may tell the table anything.",
    SPECIAL_ELECTION: 'Pick any player to be the next President. Normal rotation then resumes.',
    POLICY_PEEK: 'Secretly look at the top 3 cards. Order is unchanged. You may share or lie about what you saw.',
    EXECUTION: 'Pick a player to eliminate. If they are Hitler, Liberals win immediately. Their role is not revealed.',
  };

  let mine = false;
  let title = '';
  let body = '';

  if (!isAlive) {
    title = fa ? 'شما از بازی حذف شده‌اید' : 'You have been eliminated';
    body = fa ? 'می‌توانی تماشا کنی. اجازه‌ی صحبت درباره‌ی نقش‌ها یا کمک به بقیه را نداری.' : 'You can watch, but must stay silent about roles.';
  } else if (phase === 'ELECTION_NOMINATION') {
    mine = isPresident;
    title = mine ? (fa ? 'نوبت شماست: صدراعظم را انتخاب کن' : 'Your turn: choose a Chancellor') : fa ? `منتظر ${presidentName} باش` : `Waiting for ${presidentName}`;
    body = mine
      ? fa
        ? 'روی اسم یک بازیکن بزن و «معرفی به عنوان صدراعظم» را بزن. کسی را انتخاب کن که به او اعتماد داری. رئیس‌جمهور و صدراعظم دورِ قبل را نمی‌توان انتخاب کرد.'
        : 'Tap a player, then confirm. Pick someone you trust. Last government members are ineligible.'
      : fa
      ? 'رئیس‌جمهور دارد صدراعظم پیشنهادی را انتخاب می‌کند. تا آن موقع با بقیه بحث کنید که چه کسی قابل‌اعتماد است.'
      : 'The President is choosing. Discuss who seems trustworthy.';
  } else if (phase === 'ELECTION_VOTING') {
    mine = !hasVoted;
    title = hasVoted ? (fa ? 'رأی شما ثبت شد' : 'Vote cast') : fa ? 'نوبت رأی دادن توست' : 'Cast your vote: JA or NEIN';
    body = hasVoted
      ? fa ? 'منتظر بقیه بازیکنان باش. وقتی همه رأی دادند، نتیجه همزمان نمایش داده می‌شود.' : 'Waiting for the others. Results are revealed together.'
      : fa
      ? `اگر با دولت «${presidentName} و ${chancellorName}» موافقی، JA (بله) را بزن؛ در غیر این صورت NEIN (خیر). بیش از نصف آرا باید موافق باشد؛ تساوی یعنی رد شدن.`
      : `Vote JA to approve ${presidentName} & ${chancellorName}, NEIN to reject. A strict majority is needed.`;
  } else if (phase === 'LEGISLATIVE_PRESIDENT') {
    mine = isPresident;
    title = mine ? (fa ? 'یک کارت را بسوزان' : 'Discard one policy') : fa ? 'رئیس‌جمهور در حال بررسی قوانین است' : 'President is reviewing policies';
    body = mine
      ? fa
        ? 'سه قانون به تو داده شده. یکی را انتخاب کن تا سوخته شود؛ دو تای دیگر به صدراعظم می‌رسد. کارت‌ها را نباید نشان بدهی، اما می‌توانی دربارهٔ آن‌ها حرف بزنی (حتی دروغ بگویی).'
        : 'Pick one of three to discard; the other two go to the Chancellor. You may not show cards but may speak about them.'
      : fa ? 'کارت‌ها محرمانه‌اند. بعد از تصویب، فقط نتیجه روی صفحه ظاهر می‌شود.' : 'Cards are secret. Only the result is shown.';
  } else if (phase === 'LEGISLATIVE_CHANCELLOR') {
    mine = isChancellor;
    title = mine ? (fa ? 'یک کارت را برای تصویب نگه دار' : 'Choose the policy to enact') : fa ? 'صدراعظم در حال انتخاب قانون است' : 'Chancellor is choosing';
    body = mine
      ? fa
        ? `کارتی که انتخاب می‌کنی سوخته می‌شود و کارت دیگر به‌عنوان قانون تصویب می‌شود.${vetoUnlocked ? ' چون وتو فعال است می‌توانی «درخواست وتو» بدهی.' : ''}`
        : `The card you select is discarded and the other is enacted.${vetoUnlocked ? ' Veto is available.' : ''}`
      : fa ? 'منتظر بمان. آنچه تصویب شود روی بورد قرار می‌گیرد.' : 'The enacted policy will appear on the board.';
  } else if (phase === 'LEGISLATIVE_VETO_OFFERED') {
    mine = isPresident;
    title = mine ? (fa ? 'تصمیم درباره‌ی وتو با توست' : 'Decide on the veto') : fa ? 'صدراعظم درخواست وتو داده است' : 'Chancellor requested a veto';
    body = fa ? 'اگر موافقت شود هر دو کارت سوخته می‌شوند و شمارندهٔ انتخابات یک واحد جلو می‌رود.' : 'If accepted, both cards are discarded and the election tracker advances.';
  } else if (phase === 'EXECUTIVE_POWER') {
    mine = isPresident;
    title = mine ? (fa ? 'قدرت ویژه‌ی خود را به کار ببر' : 'Use your executive power') : fa ? 'رئیس‌جمهور قدرت ویژه دارد' : 'President holds an executive power';
    body = mine ? (fa ? powerFa[power || ''] : powerEn[power || '']) || '' : fa ? 'منتظر بمان تا رئیس‌جمهور تصمیم بگیرد.' : 'Wait for the President.';
  }

  const roleHint =
    role === 'LIBERAL'
      ? fa ? 'تو لیبرالی: هیتلر را پیدا کن و به دولت‌های مشکوک رأی نده.' : 'You are Liberal: find Hitler, reject suspicious governments.'
      : role === 'FASCIST'
      ? fa ? 'تو فاشیستی: قانون فاشیستی تصویب کن و هیتلر را پنهان نگه دار.' : 'You are Fascist: pass fascist laws, protect Hitler.'
      : role === 'HITLER'
      ? fa ? 'تو هیتلری: ساکت و معتدل باش؛ اگر بعد از ۳ قانون فاشیستی صدراعظم شوی، فاشیست‌ها می‌برند.' : 'You are Hitler: stay quiet; become Chancellor after 3 fascist laws to win.'
      : '';

  return (
    <section
      aria-live="polite"
      className={`overflow-hidden rounded-2xl border ${
        mine ? 'border-[#d9b36a]/60 bg-gradient-to-br from-[#d9b36a]/[0.16] to-[#d9b36a]/[0.04] shadow-[0_0_0_4px_rgba(217,179,106,.08)]' : 'border-white/10 bg-white/[0.035]'
      }`}
    >
      {/* stepper */}
      <ol className="flex items-center gap-1 border-b border-white/[0.07] px-3 py-2">
        {STEPS.map((s, i) => (
          <li key={s.id} className="flex flex-1 items-center gap-1.5">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${
                i === stepIdx ? 'bg-[#d9b36a] text-[#1b1407]' : i < stepIdx ? 'bg-emerald-500/30 text-emerald-200' : 'bg-white/10 text-slate-500'
              }`}
            >
              {i + 1}
            </span>
            <span className={`truncate text-[10px] font-bold ${i === stepIdx ? 'text-[#ecd08f]' : 'text-slate-500'}`}>{fa ? s.fa : s.en}</span>
          </li>
        ))}
      </ol>
      <div className="flex gap-3 p-4">
        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${mine ? 'bg-[#d9b36a] text-[#1b1407]' : 'bg-white/10 text-slate-300'}`}>
          {mine ? <Hand className="h-5 w-5" /> : <Hourglass className="h-5 w-5" />}
        </span>
        <div className="min-w-0">
          <h3 className="text-[15px] font-extrabold text-white">{title}</h3>
          <p className="mt-1 text-[13px] leading-7 text-slate-300">{body}</p>
          {roleHint && (
            <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-black/25 px-2.5 py-1.5 text-[11.5px] leading-6 text-slate-400">
              <Lightbulb className="mt-1 h-3.5 w-3.5 shrink-0 text-[#d9b36a]" />
              {roleHint}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
