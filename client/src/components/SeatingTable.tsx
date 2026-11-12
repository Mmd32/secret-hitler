import React from 'react';
import { PlayerPublicView } from '../../../server/src/engine/types.js';
import { Skull, Crown, ScrollText, Users, Bot, Check } from 'lucide-react';
import { Avatar, SectionTitle } from './ui.js';

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
    <section className="w-full select-none">
      <SectionTitle
        icon={<Users className="h-4 w-4 text-[#d9b36a]" aria-hidden="true" />}
        right={
          <span dir="ltr" className="chip tabular-nums">
            {players.filter((p) => p.isAlive).length} / {players.length} {isFa ? 'زنده' : 'alive'}
          </span>
        }
      >
        {isFa ? 'میز بازیکنان (ترتیب نشستن)' : 'Players (seating order)'}
      </SectionTitle>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
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

          const tone = isSelected
            ? 'border-[#d9b36a] bg-[#d9b36a]/15 shadow-[0_0_0_4px_rgba(217,179,106,.12)]'
            : isPres
            ? 'border-[#d9b36a]/60 bg-[#d9b36a]/[0.08]'
            : isChan
            ? 'border-slate-300/40 bg-white/[0.07]'
            : canSelect
            ? 'cursor-pointer border-[#d9b36a]/40 bg-white/[0.05] hover:bg-[#d9b36a]/10'
            : 'border-white/[0.08] bg-white/[0.035]';

          const Tag: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => (
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${className}`}>{children}</span>
          );

          return (
            <div
              key={id}
              role={canSelect ? 'button' : undefined}
              tabIndex={canSelect ? 0 : undefined}
              onClick={() => canSelect && onSelectPlayer?.(id)}
              onKeyDown={(e) => {
                if (canSelect && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelectPlayer?.(id);
                }
              }}
              className={`relative flex flex-col gap-2.5 rounded-2xl border p-3 transition-all duration-200 ${tone} ${
                !player.isAlive ? 'opacity-45 grayscale' : ''
              } ${canSelect ? 'active:scale-[0.97]' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Avatar
                    name={player.name}
                    size="md"
                    dead={!player.isAlive}
                    ring={isPres ? 'ring-2 ring-[#d9b36a] ring-offset-2 ring-offset-[#121722]' : isChan ? 'ring-2 ring-slate-300 ring-offset-2 ring-offset-[#121722]' : ''}
                  />
                  {!player.isAlive ? (
                    <Skull className="absolute -bottom-1 -end-1 h-4 w-4 rounded-full bg-[#121722] p-0.5 text-red-400" aria-hidden="true" />
                  ) : isPres ? (
                    <Crown className="absolute -top-2 start-1/2 h-4 w-4 -translate-x-1/2 text-[#d9b36a] drop-shadow" aria-hidden="true" />
                  ) : isChan ? (
                    <ScrollText className="absolute -bottom-1 -end-1 h-4 w-4 rounded-full bg-[#121722] p-0.5 text-slate-200" aria-hidden="true" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="truncate text-sm font-extrabold text-white"><bdi>{player.name}</bdi></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                    <span dir="ltr" className="tabular-nums">#{index + 1}</span>
                    {isMe && <span className="rounded bg-[#d9b36a] px-1 text-[#1b1407]">{isFa ? 'شما' : 'You'}</span>}
                    {isBot && <Bot className="h-3 w-3" aria-label="Bot" />}
                  </div>
                </div>

                {hasVoted ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300" title={isFa ? 'رأی داد' : 'Voted'}>
                    <Check className="h-3 w-3" />
                  </span>
                ) : !isBot ? (
                  <span
                    className={`h-2 w-2 rounded-full ${player.isConnected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,.8)]' : 'bg-slate-600'}`}
                    title={player.isConnected ? 'Connected' : 'Disconnected'}
                  />
                ) : null}
              </div>

              {(isPres || isChan || (isLastPres && !isPres) || (isLastChan && !isChan) || !player.isAlive) && (
                <div className="flex flex-wrap gap-1">
                  {isPres && <Tag className="bg-[#d9b36a] text-[#1b1407]">{isFa ? 'رئیس‌جمهور' : 'President'}</Tag>}
                  {isChan && <Tag className="bg-slate-200 text-slate-900">{isFa ? 'صدراعظم' : 'Chancellor'}</Tag>}
                  {isLastPres && !isPres && <Tag className="bg-white/10 text-slate-400">{isFa ? 'رئیس سابق' : 'Ex-Pres'}</Tag>}
                  {isLastChan && !isChan && <Tag className="bg-white/10 text-slate-400">{isFa ? 'صدراعظم سابق' : 'Ex-Chan'}</Tag>}
                  {!player.isAlive && <Tag className="bg-red-500/20 text-red-300">{isFa ? 'اعدام‌شده' : 'Dead'}</Tag>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
