import React, { useState } from 'react';
import { CardComponent } from './CardComponent.js';
import { ElectionRecord, VoteChoice } from '../../../server/src/engine/types.js';
import { sound } from '../audio/SoundEffects.js';
import { Crown, ScrollText, Hourglass, CheckCircle2, XCircle } from 'lucide-react';

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
    <div className="w-full max-w-lg mx-auto p-4 flex flex-col items-center select-none animate-fadeIn">
      {/* Government Under Election */}
      <div className="w-full text-center mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-amber-500/80 mb-2">
          {isFa ? 'رأی اعتماد به دولت پیشنهادی' : 'CONFIDENCE VOTE FOR PROPOSED GOVERNMENT'}
        </div>
        <div className="flex items-center justify-center gap-3 text-lg sm:text-xl font-serif font-black text-amber-100">
          <span className="inline-flex items-center gap-1.5 bg-amber-950/70 px-3.5 py-1.5 rounded-xl border border-amber-800/60 shadow">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>{presidentName}</span>
          </span>
          <span className="text-stone-500 font-mono">&</span>
          <span className="inline-flex items-center gap-1.5 bg-stone-900/80 px-3.5 py-1.5 rounded-xl border border-stone-700/60 shadow">
            <ScrollText className="w-4 h-4 text-stone-300" />
            <span>{chancellorName}</span>
          </span>
        </div>
      </div>

      {/* Voting Cards (If player has not voted yet) */}
      {isVotingPhase && !hasVoted && (
        <div className="flex flex-col items-center w-full">
          <p className="text-sm text-stone-300 font-serif mb-5 text-center">
            {isFa
              ? 'کارت رأی خود را انتخاب کنید (انتخاب شما تا پایان رأی‌گیری مخفی خواهد ماند):'
              : 'Cast your confidential ballot (revealed once all players have voted):'}
          </p>
          <div className="flex gap-4 sm:gap-8 justify-center items-center">
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
        </div>
      )}

      {/* Waiting for other votes */}
      {isVotingPhase && hasVoted && (
        <div className="w-full p-6 rounded-3xl bg-stone-900/80 border border-stone-800 flex flex-col items-center text-center shadow-xl">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/50 flex items-center justify-center mb-3 bg-amber-950/30">
            <Hourglass className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
          <h4 className="font-serif font-bold text-amber-200 text-base">
            {isFa ? 'رأی شما ثبت شد' : 'Your Ballot is Sealed'}
          </h4>
          <p className="text-xs text-stone-400 mt-1">
            {isFa
              ? `در انتظار آرا (${votedPlayerCount} از ${totalLivingPlayers} نفر رأی داده‌اند)...`
              : `Waiting for all votes (${votedPlayerCount}/${totalLivingPlayers} cast)...`}
          </p>
        </div>
      )}

      {/* Election Results Reveal */}
      {lastElection && (
        <div className="w-full mt-4 p-4 rounded-3xl bg-stone-950/90 border border-stone-700/80 shadow-2xl flex flex-col items-center">
          <div
            className={`inline-flex items-center gap-2 text-base sm:text-lg font-serif font-black px-5 py-2 rounded-2xl border mb-3 ${
              lastElection.passed
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
            }`}
          >
            {lastElection.passed ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>{isFa ? 'دولت رأی اعتماد گرفت!' : 'Government Elected!'}</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                <span>{isFa ? 'دولت رأی اعتماد نیاورد!' : 'Government Rejected!'}</span>
              </>
            )}
          </div>

          <div className="text-xs font-mono text-stone-400 mb-3 bg-stone-900 px-3 py-1 rounded-full border border-stone-800">
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
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-serif ${
                    isJa
                      ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-800/50 text-rose-200'
                  }`}
                >
                  <span className="truncate max-w-[100px]">{voterName}</span>
                  <span
                    className={`font-black font-mono px-2 py-0.5 rounded text-[11px] ${
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
    </div>
  );
};
