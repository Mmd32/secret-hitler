import React, { useState } from 'react';
import { CardComponent } from './CardComponent.js';
import { ElectionRecord, VoteChoice } from '../../../server/src/engine/types.js';
import { sound } from '../audio/SoundEffects.js';
import { Crown, ScrollText, Hourglass, CheckCircle2, XCircle, Info } from 'lucide-react';

interface VotingModalProps {
  presidentName: string;
  chancellorName: string;
  hasVoted: boolean;
  onCastVote: (vote: VoteChoice) => void;
  lastElection: ElectionRecord | null;
  phase: string;
  votedPlayerCount: number;
  totalLivingPlayers: number;
  players: { id: string; name: string }[];
  lang: 'fa' | 'en';
}

export const VotingModal: React.FC<VotingModalProps> = ({
  presidentName,
  chancellorName,
  hasVoted,
  onCastVote,
  lastElection,
  phase,
  votedPlayerCount,
  totalLivingPlayers,
  players,
  lang,
}) => {
  const [selectedVote, setSelectedVote] = useState<VoteChoice | null>(null);
  const isFa = lang === 'fa';

  const handleVote = (choice: VoteChoice) => {
    setSelectedVote(choice);
    sound.playVoteClick();
    onCastVote(choice);
  };

  const isVotingPhase = phase === 'ELECTION_VOTING';

  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 rounded-3xl bg-[#1c110a] border-2 border-[#54341c] shadow-[0_16px_40px_rgba(0,0,0,0.7)] flex flex-col items-center select-none animate-fadeIn my-2">
      {/* 1. CLEAR PHASE TITLE & CANDIDATE PLACARDS */}
      <div className="w-full text-center mb-4">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#c49b5a] mb-1 block">
          {isFa ? 'مرحله دوم: رأی اعتماد به دولت' : 'PHASE 2: CONFIDENCE VOTE'}
        </span>
        <h3 className="text-lg sm:text-xl font-serif font-black text-[#f7e8ce] mb-3">
          {isFa ? 'رأی به هیئت دولت پیشنهادی' : 'Vote on Proposed Government'}
        </h3>

        {/* President & Chancellor Badge Pair */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2 bg-[#29170e] border border-[#a16f38] px-3.5 py-1.5 rounded-xl shadow-inner">
            <Crown className="w-4 h-4 text-[#e6c687]" aria-hidden="true" />
            <span className="font-serif font-bold text-xs text-[#f5e2b8]">
              {presidentName}
            </span>
            <span className="text-[9px] font-mono text-[#a89280] uppercase">
              ({isFa ? 'رئیس‌جمهور' : 'President'})
            </span>
          </div>

          <span className="text-[#a89280] font-serif font-bold">&amp;</span>

          <div className="flex items-center gap-2 bg-[#29170e] border border-stone-600 px-3.5 py-1.5 rounded-xl shadow-inner">
            <ScrollText className="w-4 h-4 text-stone-300" aria-hidden="true" />
            <span className="font-serif font-bold text-xs text-[#f5e2b8]">
              {chancellorName}
            </span>
            <span className="text-[9px] font-mono text-[#a89280] uppercase">
              ({isFa ? 'صدراعظم' : 'Chancellor'})
            </span>
          </div>
        </div>
      </div>

      {/* 2. INSTRUCTION & PRIMARY INTERACTION */}
      {isVotingPhase && !hasVoted && (
        <div className="flex flex-col items-center w-full my-2">
          <p className="text-xs sm:text-sm text-[#e6d5c3] font-serif mb-4 text-center max-w-sm">
            {isFa
              ? 'کارت رأی خود را مخفیانه انتخاب کنید. تمام آرا پس از اتمام نوبت همه بازیکنان هم‌زمان خوانده خواهند شد:'
              : 'Cast your confidential ballot. All votes will be revealed simultaneously:'}
          </p>

          <div className="flex gap-4 sm:gap-8 justify-center items-center my-2">
            <CardComponent
              variant="BALLOT_JA"
              size="lg"
              isSelected={selectedVote === 'JA'}
              onClick={() => handleVote('JA')}
              className="cursor-pointer active:scale-95"
            />
            <CardComponent
              variant="BALLOT_NEIN"
              size="lg"
              isSelected={selectedVote === 'NEIN'}
              onClick={() => handleVote('NEIN')}
              className="cursor-pointer active:scale-95"
            />
          </div>

          {/* Progress Indicator */}
          <div className="mt-4 flex items-center gap-2 text-xs font-mono text-[#a89280]">
            <span>{isFa ? 'پیشرفت آرا:' : 'Voting Progress:'}</span>
            <span className="text-[#c49b5a] font-bold">
              {votedPlayerCount} / {totalLivingPlayers}
            </span>
          </div>
        </div>
      )}

      {/* 3. WAITING STATUS */}
      {isVotingPhase && hasVoted && (
        <div className="w-full p-5 rounded-2xl bg-[#241710] border border-[#4d2f1b] flex flex-col items-center text-center shadow-lg my-2">
          <div className="w-10 h-10 rounded-full border border-[#c49b5a]/60 flex items-center justify-center mb-2 bg-[#361e12]">
            <Hourglass className="w-5 h-5 text-[#e6c687] animate-spin" aria-hidden="true" />
          </div>
          <h4 className="font-serif font-bold text-[#f7e8ce] text-sm mb-1">
            {isFa ? 'برگه رأی شما در صندوق انداخته شد' : 'Your Ballot is Sealed in the Urn'}
          </h4>
          <p className="text-xs text-[#a68e79]">
            {isFa
              ? `در انتظار تکمیل آرا (${votedPlayerCount} از ${totalLivingPlayers} نماینده رأی داده‌اند)...`
              : `Waiting for all representatives (${votedPlayerCount}/${totalLivingPlayers} cast)...`}
          </p>
        </div>
      )}

      {/* 4. ELECTION RESULTS REVEAL */}
      {lastElection && (
        <div className="w-full mt-3 p-4 rounded-2xl bg-[#241710] border border-[#5c3a21] shadow-2xl flex flex-col items-center">
          <div
            className={`inline-flex items-center gap-2 text-sm sm:text-base font-serif font-black px-4 py-1.5 rounded-xl border mb-2.5 ${
              lastElection.passed
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-rose-950/80 text-rose-300 border-rose-600/80 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
            }`}
          >
            {lastElection.passed ? (
              <>
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>{isFa ? 'دولت رأی اعتماد گرفت!' : 'Government Elected!'}</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" aria-hidden="true" />
                <span>{isFa ? 'دولت رأی اعتماد نیاورد!' : 'Government Rejected!'}</span>
              </>
            )}
          </div>

          <div className="text-xs font-mono font-bold text-[#c49b5a] mb-3 bg-[#180e08] px-3 py-1 rounded-full border border-[#3d2516]">
            {lastElection.jaCount} JA — {lastElection.neinCount} NEIN
          </div>

          {/* Individual Ballots Grid */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(lastElection.votes).map(([voterId, choice]) => {
              const voterName = players.find((p) => p.id === voterId)?.name || 'Player';
              const isJa = choice === 'JA';
              return (
                <div
                  key={voterId}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs font-serif ${
                    isJa
                      ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-200'
                      : 'bg-rose-950/50 border-rose-800/60 text-rose-200'
                  }`}
                >
                  <span className="truncate max-w-[90px] font-bold">{voterName}</span>
                  <span
                    className={`font-black font-mono px-2 py-0.2 rounded text-[10px] ${
                      isJa ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'
                    }`}
                  >
                    {choice}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. CONTEXTUAL RULE FOOTER */}
      <div className="w-full mt-3 pt-2.5 border-t border-[#3d2516] flex items-center justify-between text-[10px] font-serif text-[#8f7560]">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#c49b5a]" aria-hidden="true" />
          <span>
            {isFa
              ? 'تصویب نیازمند بیش از ۵۰٪ آرای مثبت است (تساوی = رد دولت).'
              : 'Strict majority (>50%) required. Ties result in failure.'}
          </span>
        </div>
      </div>
    </div>
  );
};
