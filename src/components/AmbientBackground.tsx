import React, { useMemo } from 'react';
import { Heart } from 'lucide-react';

export const AmbientBackground: React.FC = () => {
  // Precompute static positions for subtle twinkling stars/bokeh
  const particles = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: `${(i * 17 + 23) % 100}%`,
      top: `${(i * 29 + 11) % 100}%`,
      size: (i % 3) + 2,
      delay: (i % 7) * 0.8,
      duration: 3 + (i % 5) * 1.2,
      opacity: 0.3 + (i % 4) * 0.15,
    }));
  }, []);

  // Precompute very prominent, vivid floating pink hearts
  const floatingHearts = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => {
      const size = 22 + (i % 6) * 5; // 22px to 47px (bold & clearly visible)
      const left = 2 + ((i * 17 + 5) % 95); // across full screen width
      const delay = (i * 0.6) % 12; // continuous staggered flow
      const duration = 8.5 + (i % 5) * 1.8; // 8.5s to 16s romantic ascent
      const colorStyle = i % 3;

      return {
        id: i,
        size,
        left: `${left}%`,
        delay,
        duration,
        colorStyle,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* KIRMIZI VE SİYAH KARIŞIMI ARKA PLAN (VIVID RED & BLACK BLEND) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#42060f] via-[#1a0206] to-[#040002]" />

      {/* Atmospheric Rich Red Lights & Ambient Clouds */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-red-600/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[700px] h-[700px] bg-rose-900/45 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[700px] h-[700px] bg-red-900/50 rounded-full blur-[150px] pointer-events-none" />

      {/* Radiant Center Pink & Crimson Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-red-600/30 rounded-full blur-[160px] pointer-events-none animate-pulse-subtle" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-pink-500/40 rounded-full blur-[100px] pointer-events-none" />

      {/* Twinkling starlight specks */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-pink-200/70 animate-pulse"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* ÇOK BELİRGİN VE PARLAK UÇUŞAN PEMBE KALPLER */}
      {floatingHearts.map((h) => (
        <div
          key={`heart-${h.id}`}
          className="absolute animate-float-heart pointer-events-none z-10"
          style={{
            left: h.left,
            bottom: '-70px',
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
          }}
        >
          <Heart
            style={{
              width: `${h.size}px`,
              height: `${h.size}px`,
              filter:
                'drop-shadow(0 0 16px rgba(255, 30, 110, 1)) drop-shadow(0 0 4px rgba(255, 255, 255, 0.9))',
            }}
            className={
              h.colorStyle === 0
                ? 'text-white fill-[#ff1493] stroke-[1.8px]'
                : h.colorStyle === 1
                ? 'text-pink-100 fill-[#ff2e79] stroke-[1.8px]'
                : 'text-rose-100 fill-[#f43f5e] stroke-[1.8px]'
            }
          />
        </div>
      ))}
    </div>
  );
};

