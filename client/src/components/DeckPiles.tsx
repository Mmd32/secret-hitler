import React from 'react';
import { CardComponent } from './CardComponent.js';

interface DeckPilesProps {
  drawPileCount: number;
  discardPileCount: number;
  lang: 'fa' | 'en';
}

const Pile: React.FC<{ count: number; label: string; dim?: boolean }> = ({ count, label, dim }) => (
  <div className="flex items-center gap-3">
    <div className="relative h-[60px] w-[43px] shrink-0">
      {count > 1 && <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-md bg-[#1b2230] ring-1 ring-white/10" />}
      {count > 4 && <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] rounded-md bg-[#141923] ring-1 ring-white/10" />}
      {count > 0 ? (
        <CardComponent
          variant="CARD_BACK"
          size="sm"
          className={`!h-[60px] !w-[43px] !rounded-md ${dim ? 'opacity-70' : ''} hover:!translate-y-0`}
        />
      ) : (
        <div className="h-full w-full rounded-md border border-dashed border-white/15" />
      )}
    </div>
    <div className="leading-tight">
      <div className="text-xl font-black tabular-nums text-white" dir="ltr">{count}</div>
      <div className="text-[11px] font-semibold text-slate-400">{label}</div>
    </div>
  </div>
);

export const DeckPiles: React.FC<DeckPilesProps> = ({ drawPileCount, discardPileCount, lang }) => {
  const isFa = lang === 'fa';
  return (
    <div className="card-surface grid grid-cols-2 gap-3 px-4 py-3.5 select-none">
      <Pile count={drawPileCount} label={isFa ? 'دسته کارت' : 'Draw pile'} />
      <Pile count={discardPileCount} label={isFa ? 'دسته سوخته' : 'Discard'} dim />
    </div>
  );
};
