import React from 'react';
import { CardComponent } from './CardComponent.js';

interface DeckPilesProps {
  drawPileCount: number;
  discardPileCount: number;
  lang: 'fa' | 'en';
}

export const DeckPiles: React.FC<DeckPilesProps> = ({
  drawPileCount,
  discardPileCount,
  lang,
}) => {
  const isFa = lang === 'fa';

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 my-2 select-none">
      {/* DRAW PILE */}
      <div className="flex flex-col items-center">
        <div className="relative group">
          {/* Faux stack elevation shadow cards */}
          {drawPileCount > 4 && (
            <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-[#0e161c] rounded-xl border border-stone-800 opacity-80 pointer-events-none" />
          )}
          {drawPileCount > 1 && (
            <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 bg-[#17232d] rounded-xl border border-stone-700 opacity-90 pointer-events-none" />
          )}

          <div className="relative">
            <CardComponent variant="CARD_BACK" size="sm" className="shadow-[0_6px_16px_rgba(0,0,0,0.6)]" />
            <div className="absolute inset-x-0 bottom-1 flex justify-center">
              <span
                dir="ltr"
                className="tabular-nums bg-[#121c24]/90 border border-[#c49b5a] text-[#f5e2b8] font-mono text-[10px] font-bold px-1.5 py-0.2 rounded shadow"
              >
                {drawPileCount}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <img
            src="/game-assets/markers/draw_pile.svg"
            alt="Draw Pile Marker"
            className="w-3.5 h-3.5 opacity-80"
          />
          <span className="text-[10px] sm:text-[11px] font-serif font-bold text-stone-300">
            {isFa ? 'دسته کارت‌ها' : 'Draw Deck'}
          </span>
        </div>
      </div>

      {/* DISCARD PILE */}
      <div className="flex flex-col items-center">
        <div className="relative">
          {discardPileCount > 0 ? (
            <div className="relative">
              {discardPileCount > 2 && (
                <div className="absolute inset-0 -rotate-3 bg-[#1e130c] rounded-xl border border-stone-800 opacity-70 pointer-events-none" />
              )}
              <CardComponent variant="CARD_BACK" size="sm" className="shadow-[0_6px_16px_rgba(0,0,0,0.5)] opacity-85" />
              <div className="absolute inset-x-0 bottom-1 flex justify-center">
                <span
                  dir="ltr"
                  className="tabular-nums bg-[#1c120c]/90 border border-stone-600 text-stone-300 font-mono text-[10px] font-bold px-1.5 py-0.2 rounded shadow"
                >
                  {discardPileCount}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-16 h-[100px] sm:w-20 sm:h-32 rounded-xl border-2 border-dashed border-stone-700/60 bg-stone-900/30 flex flex-col items-center justify-center p-1 text-center">
              <span className="text-[10px] font-serif text-stone-500">
                {isFa ? 'خالی' : 'Empty'}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <img
            src="/game-assets/markers/discard_pile.svg"
            alt="Discard Pile Marker"
            className="w-3.5 h-3.5 opacity-80"
          />
          <span className="text-[10px] sm:text-[11px] font-serif font-bold text-stone-400">
            {isFa ? 'دسته سوخته' : 'Discard Pile'}
          </span>
        </div>
      </div>
    </div>
  );
};
