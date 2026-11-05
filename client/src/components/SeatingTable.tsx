import React from 'react';
import { PlayerPublicView } from '../../../server/src/engine/types.js';
import { Skull, Crown, ScrollText, User, Users, Bot, CheckCircle } from 'lucide-react';

interface SeatingTableProps {
  players: PlayerPublicView[];
  seatingOrder: string[];
  presidentId: string | null;
  chancellorId: string | null;
  nominatedChancellorId: string | null;
  lastElectedPresidentId: string | null;
  lastElectedChancellorId: string | null;
  myPlayerId: string | null;
  votedPlayerIds?: string[];
  onSelectPlayer?: (playerId: string) => void;
  selectedPlayerId?: string | null;
  isSelectable?: (playerId: string) => boolean;
  lang: 'fa' | 'en';
}

export const SeatingTable: React.FC<SeatingTableProps> = ({
  players,
  seatingOrder,
  presidentId,
  chancellorId,
  nominatedChancellorId,
  lastElectedPresidentId,
  lastElectedChancellorId,
  myPlayerId,
  votedPlayerIds = [],
  onSelectPlayer,
  selectedPlayerId,
  isSelectable,
  lang,
}) => {
  const isFa = lang === 'fa';

  const playerMap = new Map<string, PlayerPublicView>();
  players.forEach((p) => playerMap.set(p.id, p));

  return (
    <div className="w-full select-none my-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-2.5">
        <div className="flex items-center gap-2 text-xs font-serif font-black text-[#c49b5a] uppercase tracking-wider">
          <Users className="w-4 h-4 text-[#c49b5a]" aria-hidden="true" />
          <span>{isFa ? 'میز هیئت دولت (ترتیب نشستن نمایندگان)' : 'Council Table (Parliament Seating)'}</span>
        </div>
        <span
          dir="ltr"
          className="tabular-nums font-mono text-[11px] text-[#8a7664] bg-[#1a0e08] px-2.5 py-0.5 rounded-md border border-[#3d2516]"
        >
          <bdi>{players.filter((p) => p.isAlive).length}</bdi> / {players.length} {isFa ? 'زنده' : 'alive'}
        </span>
      </div>

      {/* Seats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {seatingOrder.map((id, index) => {
          const player = playerMap.get(id);
          if (!player) return null;

          const isPres = presidentId === id;
          const isChan = chancellorId === id || nominatedChancellorId === id;
          const isMe = myPlayerId === id;
          const isLastPres = lastElectedPresidentId === id;
          const isLastChan = lastElectedChancellorId === id;
          const canSelect = isSelectable ? isSelectable(id) : false;
          const isSelected = selectedPlayerId === id;
          const isBot = player.id.startsWith('bot_');
          const hasVoted = votedPlayerIds.includes(id);

          return (
            <div
              key={id}
              onClick={() => {
                if (canSelect && onSelectPlayer) {
                  onSelectPlayer(id);
                }
              }}
              className={`relative flex flex-col p-3 rounded-2xl border-2 transition-all ${
                isSelected
                  ? 'border-amber-400 bg-[#3b2212] shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-[1.02]'
                  : isPres
                  ? 'border-[#c49b5a] bg-gradient-to-b from-[#2b190f] to-[#1a0e08] ring-2 ring-[#c49b5a]/40 shadow-[0_8px_16px_rgba(0,0,0,0.5)]'
                  : isChan
                  ? 'border-stone-400/80 bg-gradient-to-b from-[#241c16] to-[#14100d] ring-2 ring-stone-300/30 shadow-[0_8px_16px_rgba(0,0,0,0.5)]'
                  : canSelect
                  ? 'border-amber-500/80 bg-[#29170e] hover:bg-[#382013] cursor-pointer animate-pulse'
                  : 'border-[#3d2516] bg-[#1a0f09]/90'
              } ${!player.isAlive ? 'opacity-40 grayscale border-red-900/60 bg-[#1f0b0a]' : ''}`}
            >
              {/* Order number & Status Badges */}
              <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                <span
                  dir="ltr"
                  className="tabular-nums w-5 h-5 rounded-full bg-[#29170e] text-[#c49b5a] font-bold flex items-center justify-center border border-[#4d2f1b]"
                >
                  {index + 1}
                </span>

                <div className="flex items-center gap-1">
                  {/* Bot indicator */}
                  {isBot && (
                    <span className="text-[9px] font-mono bg-stone-800 text-stone-400 px-1 py-0.2 rounded border border-stone-700 flex items-center gap-0.5" title="Automated Bot">
                      <Bot className="w-2.5 h-2.5" aria-hidden="true" />
                      <span>BOT</span>
                    </span>
                  )}

                  {/* Has voted badge */}
                  {hasVoted && (
                    <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 px-1 py-0.2 rounded border border-emerald-800 flex items-center gap-0.5" title="Ballot Sealed">
                      <CheckCircle className="w-2.5 h-2.5" aria-hidden="true" />
                      <span>{isFa ? 'رأی داد' : 'VOTED'}</span>
                    </span>
                  )}

                  {/* Connection indicator for online players */}
                  {!isBot && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        player.isConnected ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-stone-600'
                      }`}
                      title={player.isConnected ? 'Connected' : 'Disconnected'}
                    />
                  )}
                </div>
              </div>

              {/* Delegate Name & Role Icon */}
              <div className="flex items-center gap-2 my-1">
                <span className="p-1 rounded-lg bg-[#2b180e] border border-[#4d2f1b] shrink-0">
                  {!player.isAlive ? (
                    <Skull className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
                  ) : isPres ? (
                    <Crown className="w-3.5 h-3.5 text-[#e6c687]" aria-hidden="true" />
                  ) : isChan ? (
                    <ScrollText className="w-3.5 h-3.5 text-stone-200" aria-hidden="true" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-[#8a725f]" aria-hidden="true" />
                  )}
                </span>
                <span className="font-serif font-black text-[#f7e8ce] text-xs truncate max-w-[95px]">
                  <bdi dir={isFa ? 'rtl' : 'ltr'}>{player.name}</bdi>
                </span>
                {isMe && (
                  <span className="text-[9px] bg-[#c49b5a] text-[#1c100a] font-mono font-black px-1 rounded shrink-0">
                    {isFa ? 'شما' : 'YOU'}
                  </span>
                )}
              </div>

              {/* Status Ribbon / Badges */}
              <div className="flex flex-wrap gap-1 mt-auto pt-1.5">
                {isPres && (
                  <span className="text-[9px] font-serif font-black bg-[#c49b5a] text-[#1c100a] px-1.5 py-0.5 rounded shadow">
                    {isFa ? 'رئیس‌جمهور' : 'President'}
                  </span>
                )}
                {isChan && (
                  <span className="text-[9px] font-serif font-black bg-stone-300 text-stone-950 px-1.5 py-0.5 rounded shadow">
                    {isFa ? 'صدراعظم' : 'Chancellor'}
                  </span>
                )}
                {isLastPres && !isPres && (
                  <span className="text-[8px] font-mono text-[#a89280] bg-[#29170e] px-1 py-0.2 rounded border border-[#422718]">
                    {isFa ? 'رئیس سابق' : 'Ex-Pres'}
                  </span>
                )}
                {isLastChan && !isChan && (
                  <span className="text-[8px] font-mono text-[#a89280] bg-[#29170e] px-1 py-0.2 rounded border border-[#422718]">
                    {isFa ? 'صدراعظم سابق' : 'Ex-Chan'}
                  </span>
                )}
                {!player.isAlive && (
                  <span className="text-[9px] font-bold text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-800">
                    {isFa ? 'اعدام‌شده' : 'Dead'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
