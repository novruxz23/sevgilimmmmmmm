import React, { useState } from 'react';
import { Heart, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface DedicationNoteProps {
  dedication?: string;
  artist: string;
}

export const DedicationNote: React.FC<DedicationNoteProps> = ({
  dedication,
  artist,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const displayMessage = dedication && dedication.trim()
    ? dedication.trim()
    : 'Bu şarkının her notasında sana olan sevgim, seninle geçen her anın huzuru ve hayatıma kattığın sonsuz güzellik var. İyi ki varsın, iyi ki benimlesin...';

  return (
    <div
      id="dedication-card"
      className="w-full max-w-md mx-auto mt-6 bg-[#08080c]/90 border border-pink-500/20 hover:border-pink-500/40 rounded-2xl p-5 backdrop-blur-md transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.8)] shadow-pink-950/20 text-left"
    >
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-pink-500/15 flex items-center justify-center text-pink-400">
            <Heart className="w-3.5 h-3.5 fill-pink-500/40" />
          </div>
          <span className="text-xs font-semibold tracking-wider uppercase text-pink-300/90 flex items-center gap-1.5">
            Sana Özel Not
            <Sparkles className="w-3 h-3 text-pink-400/80" />
          </span>
        </div>
        <button
          type="button"
          className="text-neutral-400 hover:text-white p-1 rounded transition-colors"
          aria-label={isExpanded ? 'Notu gizle' : 'Notu göster'}
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3.5 pt-3.5 border-t border-white/5 space-y-2.5 animate-fade-in">
          <p className="font-serif-romantic text-base sm:text-lg italic text-neutral-200 leading-relaxed font-normal">
            &ldquo;{displayMessage}&rdquo;
          </p>
          <div className="flex items-center justify-end gap-1.5 text-xs text-pink-400/90 font-medium">
            <span>&mdash; {artist || 'Sadece Senin İçin'}</span>
            <Heart className="w-3 h-3 fill-pink-500 text-pink-400 inline" />
          </div>
        </div>
      )}
    </div>
  );
};
