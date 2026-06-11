import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrigramInfo, HexagramResult } from '../types';
import { TRIGRAMS } from '../utils/divination';
import { findWorldCupFlag } from '../utils/worldCupFlags';

interface DivinationCompassProps {
  hexagram?: HexagramResult;
  homeTeam?: string;
  awayTeam?: string;
  onSelectTrigram?: (trigram: TrigramInfo) => void;
}

export default function DivinationCompass({ hexagram, homeTeam = '', awayTeam = '', onSelectTrigram }: DivinationCompassProps) {
  // We make radius dynamically responsive so it never overflows tiny mobile screens (like iPhone SE).
  const [radius, setRadius] = useState(160);

  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('divination_compass_container');
      if (container) {
        const width = container.clientWidth;
        // Padding is p-4
        const contentWidth = width - 36;
        if (contentWidth < 280) {
          setRadius(76);
        } else if (contentWidth < 320) {
          setRadius(90);
        } else if (contentWidth < 420) {
          setRadius(120);
        } else if (contentWidth < 560) {
          setRadius(145);
        } else {
          setRadius(160);
        }
      } else {
        // Fallback checks
        if (window.innerWidth < 360) {
          setRadius(76);
        } else if (window.innerWidth < 400) {
          setRadius(90);
        } else {
          setRadius(160);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nodeSize = radius < 85 ? 42 : radius < 100 ? 48 : radius < 140 ? 58 : radius < 170 ? 66 : 76;
  const nodeHalfSize = nodeSize / 2;
  const boardSizeClass = radius < 85 ? "w-60 h-60" : radius < 100 ? "w-72 h-72" : radius < 140 ? "w-80 h-80" : "w-[440px] h-[440px]";
  const centerCoord = radius < 85 ? 120 : radius < 100 ? 144 : radius < 140 ? 160 : 220;
  const homeFlag = findWorldCupFlag(homeTeam);
  const awayFlag = findWorldCupFlag(awayTeam);

  const getTrigramColor = (t: TrigramInfo) => {
    if (!hexagram) {
      return 'text-amber-400/85 border-amber-500/20 bg-black/75 hover:text-amber-200 hover:border-amber-400 hover:bg-neutral-900/90 hover:shadow-[0_0_12px_rgba(245,158,11,0.3)]';
    }
    const isBody = hexagram.bodyTrigram.number === t.number;
    const isUse = hexagram.useTrigram.number === t.number;
    
    if (isBody && isUse) {
      return 'text-yellow-200 border-amber-400 bg-amber-950/80 shadow-[0_0_18px_rgba(245,158,11,0.85)] font-bold scale-105';
    }
    if (isBody) {
      return 'text-orange-200 border-orange-500 bg-orange-950/75 shadow-[0_0_15px_rgba(249,115,22,0.7)] font-bold scale-105';
    }
    if (isUse) {
      return 'text-red-300 border-red-500 bg-red-950/75 shadow-[0_0_15px_rgba(239,68,68,0.7)] font-bold scale-105';
    }
    return 'text-stone-500/80 border-stone-800 bg-neutral-950/80 hover:text-amber-400 hover:border-amber-500/50 hover:bg-neutral-900/80';
  };

  const getTrigramBadge = (t: TrigramInfo) => {
    if (!hexagram) return null;
    const isBody = hexagram.bodyTrigram.number === t.number;
    const isUse = hexagram.useTrigram.number === t.number;
    
    if (isBody && isUse) return <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold rounded whitespace-nowrap shadow-[0_0_8px_rgba(245,158,11,0.65)]">体/用</span>;
    if (isBody) return <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-xs bg-amber-500 text-black font-extrabold rounded whitespace-nowrap shadow-[0_0_8px_rgba(245,158,11,0.55)]">主 · 体</span>;
    if (isUse) return <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-xs bg-red-600 text-white font-extrabold rounded whitespace-nowrap shadow-[0_0_8px_rgba(220,38,38,0.65)]">客 · 用</span>;
    return null;
  };

  return (
    <div id="divination_compass_container" className="relative w-full flex flex-col items-center justify-center p-5 bg-neutral-950/95 border border-amber-500/25 rounded-xl shadow-2xl overflow-hidden max-w-none mx-auto shadow-glow-orange">
      <div
        className="absolute inset-0 bg-[url('/assets/pitch-compass-texture.png')] bg-cover bg-center opacity-55 pointer-events-none"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/45 pointer-events-none" aria-hidden="true" />

      {(homeFlag || awayFlag) && (
        <div className="pointer-events-none absolute inset-x-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-between sm:flex">
          {homeFlag ? (
            <div className="flex max-w-[120px] flex-col items-center gap-1.5 rounded-xl border border-orange-500/30 bg-black/65 px-2.5 py-2 shadow-[0_0_18px_rgba(249,115,22,0.18)] backdrop-blur-sm">
              <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-orange-400/70 bg-neutral-950 shadow-[0_0_16px_rgba(249,115,22,0.38)]">
                <img src={homeFlag.asset} alt={`${homeFlag.displayName}国旗`} className="h-full w-full object-cover" />
              </div>
              <span className="max-w-full truncate text-xs font-black text-orange-200">{homeFlag.displayName}</span>
            </div>
          ) : <span />}

          {awayFlag ? (
            <div className="flex max-w-[120px] flex-col items-center gap-1.5 rounded-xl border border-red-500/30 bg-black/65 px-2.5 py-2 shadow-[0_0_18px_rgba(239,68,68,0.18)] backdrop-blur-sm">
              <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-red-400/70 bg-neutral-950 shadow-[0_0_16px_rgba(239,68,68,0.36)]">
                <img src={awayFlag.asset} alt={`${awayFlag.displayName}国旗`} className="h-full w-full object-cover" />
              </div>
              <span className="max-w-full truncate text-xs font-black text-red-200">{awayFlag.displayName}</span>
            </div>
          ) : <span />}
        </div>
      )}

      {(homeFlag || awayFlag) && (
        <div className="relative z-20 mb-3 flex w-full items-center justify-between gap-3 sm:hidden">
          {homeFlag ? (
            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-orange-500/30 bg-black/65 px-2 py-1.5">
              <img src={homeFlag.asset} alt={`${homeFlag.displayName}国旗`} className="h-7 w-7 rounded-full object-cover" />
              <span className="truncate text-xs font-black text-orange-200">{homeFlag.displayName}</span>
            </div>
          ) : <span />}
          {awayFlag ? (
            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-red-500/30 bg-black/65 px-2 py-1.5">
              <span className="truncate text-xs font-black text-red-200">{awayFlag.displayName}</span>
              <img src={awayFlag.asset} alt={`${awayFlag.displayName}国旗`} className="h-7 w-7 rounded-full object-cover" />
            </div>
          ) : <span />}
        </div>
      )}

      {/* Compass Circular Board */}
      <div className={`relative z-10 ${boardSizeClass} flex items-center justify-center select-none transition-all duration-300`}>
        
        {/* Connection Linkages between Body and Use Trigrams */}
        {hexagram && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <g transform={`translate(${centerCoord}, ${centerCoord})`}>
              {/* Draw a brilliant energy beam between Body and Use Trigrams */}
              {(() => {
                const bodyIdx = TRIGRAMS.findIndex(t => t.number === hexagram.bodyTrigram.number);
                const useIdx = TRIGRAMS.findIndex(t => t.number === hexagram.useTrigram.number);
                if (bodyIdx !== -1 && useIdx !== -1 && bodyIdx !== useIdx) {
                  const bodyAngle = (bodyIdx * 45 - 90) * (Math.PI / 180);
                  const useAngle = (useIdx * 45 - 90) * (Math.PI / 180);
                  const x1 = Math.cos(bodyAngle) * radius;
                  const y1 = Math.sin(bodyAngle) * radius;
                  const x2 = Math.cos(useAngle) * radius;
                  const y2 = Math.sin(useAngle) * radius;
                  return (
                    <g>
                      <line 
                        x1={x1} y1={y1} x2={x2} y2={y2} 
                        stroke="url(#compassBeamGrad)" 
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                        className="animate-pulse"
                      />
                      <defs>
                        <linearGradient id="compassBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                        </linearGradient>
                      </defs>
                      <circle cx={x1} cy={y1} r="4.5" fill="#f59e0b" className="animate-ping" />
                      <circle cx={x2} cy={y2} r="4.5" fill="#ef4444" className="animate-ping" />
                    </g>
                  );
                }
                return null;
              })()}
            </g>
          </svg>
        )}

        {/* Outer Circular Trigram nodes (Glow customized) */}
        {TRIGRAMS.map((t, idx) => {
          const angleDeg = idx * 45 - 90;
          const angleRad = angleDeg * (Math.PI / 180);
          const x = Math.cos(angleRad) * radius;
          const y = Math.sin(angleRad) * radius;

          return (
            <motion.div
              key={t.number}
              id={`trigram_node_${t.number}`}
              className={`absolute rounded-full border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 p-0.5 ${getTrigramColor(t)}`}
              style={{
                width: `${nodeSize}px`,
                height: `${nodeSize}px`,
                left: `calc(50% + ${x}px - ${nodeHalfSize}px)`,
                top: `calc(50% + ${y}px - ${nodeHalfSize}px)`,
              }}
              whileHover={{ scale: 1.15 }}
              onClick={() => onSelectTrigram?.(t)}
            >
              {getTrigramBadge(t)}
              {/* Glyph Symbol */}
              <span className={`leading-none ${radius < 85 ? 'text-xl' : 'text-2xl'} font-extrabold select-none text-glow-amber`} title={t.description}>{t.symbol}</span>
              {/* Chinese Name & Five Elements Tag */}
              <div className="flex flex-col items-center leading-none mt-1 select-none">
                <span className={`font-serif font-black tracking-tight ${radius < 85 ? 'text-xs' : radius < 100 ? 'text-[13px]' : 'text-sm'} text-stone-200`}>{t.name}</span>
                <span className="opacity-95 font-mono font-bold text-amber-400 text-xs mt-0.5">{t.nature}({t.element})</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Underlay Legend tags */}
      <div className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 mt-4 text-sm font-bold text-amber-400 border-t border-stone-800/90 pt-3 px-1">
        <div className="flex items-center gap-1.5 hover:text-orange-400 transition-colors text-xs sm:text-sm">
          <span className="inline-block w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.73)] animate-pulse" />
          <span>橙星 · 主队主命 (体卦)</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-red-400 transition-colors text-xs sm:text-sm">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.73)] animate-pulse" />
          <span>红星 · 客队用阵 (用卦)</span>
        </div>
      </div>
    </div>
  );
}
