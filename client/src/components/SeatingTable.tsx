import React from 'react';
import { PlayerPublicView } from '../../../server/src/engine/types.js';
import { Skull, Crown, ScrollText, User, Users } from 'lucide-react';

interface SeatingTableProps {
  players: PlayerPublicView[];
  seatingOrder: string[];
  presidentId: string | null;
  chancellorId: string | null;
  nominatedChancellorId: string | null;
  lastElectedPresidentId: string | null;
  lastElectedChancellorId: string | null;
  myPlayerId: string | null;
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
  onSelectPlayer,
  selectedPlayerId,
  isSelectable,
  lang,
}) => {
  const isFa = lang === 'fa';

  const playerMap = new Map<string, PlayerPublicView>();
  players.forEach((p) => playerMap.set(p.id, p));

  return (
    <div className="w-full select-none my-2">
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-stone-400 uppercase tracking-wider">
          <Users className="w-4 h-4 text-amber-500" />
          <span>{isFa ? 'میز هیئت دولت (ترتیب نشستن)' : 'Council Table (Seating Order)'}</span>
        </div>
        <span className="text-[11px] font-mono text-stone-500 bg-stone-900/60 px-2 py-0.5 rounded border border-stone-800">
          {players.filter((p) => p.isAlive).length} / {players.length} {isFa ? 'نفر زنده' : 'alive'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
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

          return (
            <div
              key={id}
              onClick={() => {
                if (canSelect && onSelectPlayer) {
                  onSelectPlayer(id);
                }
              }}
              className={`relative flex flex-col p-2.5 rounded-2xl border transition-all ${
                isSelected
                  ? 'border-amber-400 bg-amber-950/70 shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-[1.02]'
                  : isPres
                  ? 'border-amber-500/70 bg-gradient-to-b from-amber-950/40 to-stone-900/90 ring-2 ring-amber-400/40 shadow-[0_0_15px_rgba(201,169,107,0.25)]'
                  : isChan
                  ? 'border-stone-400/60 bg-gradient-to-b from-stone-850 to-stone-900/90 ring-2 ring-stone-300/30 shadow-[0_0_12px_rgba(241,232,213,0.15)]'
                  : canSelect
                  ? 'border-amber-600/70 bg-stone-900 hover:bg-stone-850 cursor-pointer animate-pulse'
                  : 'border-stone-800 bg-stone-900/60'
              } ${!player.isAlive ? 'opacity-40 grayscale' : ''}`}
            >
              {/* Order number & connection status */}
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="w-4 h-4 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center">
                  {index + 1}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    player.isConnected ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-stone-600'
                  }`}
                  title={player.isConnected ? 'Online' : 'Offline'}
                />
              </div>

              {/* Name & Vector Avatar */}
              <div className="flex items-center gap-1.5 my-1">
                <span className="p-1 rounded-lg bg-stone-800/80 border border-stone-700/60">
                  {!player.isAlive ? (
                    <Skull className="w-3.5 h-3.5 text-red-500" />
                  ) : isPres ? (
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                  ) : isChan ? (
                    <ScrollText className="w-3.5 h-3.5 text-stone-200" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-stone-400" />
                  )}
                </span>
                <span className="font-serif font-bold text-stone-200 text-xs truncate max-w-[85px]">
                  {player.name}
                </span>
                {isMe && (
                  <span className="text-[9px] bg-amber-600 text-stone-950 font-bold px-1 rounded">
                    {isFa ? 'شما' : 'You'}
                  </span>
                )}
              </div>

              {/* Badges / Roles in Government */}
              <div className="flex flex-wrap gap-1 mt-auto pt-1">
                {isPres && (
                  <span className="text-[9px] font-serif font-black bg-amber-500 text-stone-950 px-1.5 py-0.5 rounded shadow">
                    {isFa ? 'رئیس‌جمهور' : 'President'}
                  </span>
                )}
                {isChan && (
                  <span className="text-[9px] font-serif font-black bg-stone-200 text-stone-900 px-1.5 py-0.5 rounded shadow">
                    {isFa ? 'صدراعظم' : 'Chancellor'}
                  </span>
                )}
                {isLastPres && !isPres && (
                  <span className="text-[8px] font-mono text-stone-400 bg-stone-800 px-1 rounded">
                    {isFa ? 'رئیس پیشین' : 'Prev Pres'}
                  </span>
                )}
                {isLastChan && !isChan && (
                  <span className="text-[8px] font-mono text-stone-400 bg-stone-800 px-1 rounded">
                    {isFa ? 'صدراعظم پیشین' : 'Prev Chan'}
                  </span>
                )}
                {!player.isAlive && (
                  <span className="text-[9px] font-bold text-red-500 bg-red-950/80 px-1 rounded">
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
