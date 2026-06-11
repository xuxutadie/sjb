import React from 'react';
import { MatchPredictionOutput, TrigramInfo } from '../types';
import { Calendar, Trash2, CheckCircle2, Award, PieChart, Info, HelpCircle } from 'lucide-react';

interface StatisticsPanelProps {
  history: MatchPredictionOutput[];
  onUpdatePredictions: (history: MatchPredictionOutput[]) => void;
  onSelectSaved: (prediction: MatchPredictionOutput) => void;
}

export default function StatisticsPanel({ history, onUpdatePredictions, onSelectSaved }: StatisticsPanelProps) {
  // 1. Calculate general stats
  const totalPredicts = history.length;
  
  const resolvedWinnerPredictions = history.filter(
    p => p.actualResult && p.actualResult.matchOutcome !== '未赛' && p.actualResult.matchOutcome !== undefined
  );
  const correctWinners = resolvedWinnerPredictions.filter(
    p => p.matchWinner.prediction === p.actualResult?.matchOutcome
  );
  
  const resolvedCorners = history.filter(
    p => p.actualResult && p.actualResult.cornerSize !== '未确定' && p.actualResult.cornerSize !== undefined
  );
  const correctCorners = resolvedCorners.filter(
    p => p.corners.sizePrediction === p.actualResult?.cornerSize
  );

  const resolvedCards = history.filter(
    p => p.actualResult && p.actualResult.yellowCardSize !== '未确定' && p.actualResult.yellowCardSize !== undefined
  );
  const correctCards = resolvedCards.filter(
    p => p.yellowCards.sizePrediction === p.actualResult?.yellowCardSize
  );

  // Success Rates
  const winSuccessRate = resolvedWinnerPredictions.length > 0 
    ? Math.round((correctWinners.length / resolvedWinnerPredictions.length) * 100) 
    : 0;

  const cornerSuccessRate = resolvedCorners.length > 0 
    ? Math.round((correctCorners.length / resolvedCorners.length) * 100) 
    : 0;

  const yellowCardSuccessRate = resolvedCards.length > 0
    ? Math.round((correctCards.length / resolvedCards.length) * 100)
    : 0;

  // 2. Hexagram statistics: calculate the frequency of body trigrams (体卦频率)
  const trigramFrequencyCount: Record<string, number> = {};
  const elementFrequencyCount: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };

  history.forEach(p => {
    const bodyName = p.hexagram.bodyTrigram.name;
    trigramFrequencyCount[bodyName] = (trigramFrequencyCount[bodyName] || 0) + 1;
    
    const bodyElem = p.hexagram.bodyTrigram.element;
    elementFrequencyCount[bodyElem] = (elementFrequencyCount[bodyElem] || 0) + 1;
  });

  const totalBodyTrigrams = Object.values(trigramFrequencyCount).reduce((a, b) => a + b, 0) || 1;

  // Resolve prediction outcomes
  const handleSetActualOutcome = (
    id: string, 
    field: 'matchOutcome' | 'cornerSize' | 'yellowCardSize' | 'redCardOutcome', 
    value: any
  ) => {
    const nextHistory = history.map(p => {
      if (p.id === id) {
        const actualResult = p.actualResult || {
          matchOutcome: '未赛',
          cornerSize: '未确定',
          yellowCardSize: '未确定',
          redCardOutcome: '未确定'
        };
        
        const nextResult = {
          ...actualResult,
          [field]: value
        };
        
        // Auto calculate accuracy correctness of winner
        if (field === 'matchOutcome') {
          nextResult.isCorrect = p.matchWinner.prediction === value;
        }

        return {
          ...p,
          actualResult: nextResult
        };
      }
      return p;
    });
    onUpdatePredictions(nextHistory);
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm('您确定要抹除这条起卦预测记录吗？这会清除对应卦象信息。')) {
      const next = history.filter(p => p.id !== id);
      onUpdatePredictions(next);
    }
  };

  return (
    <div id="statistics_panel" className="w-full flex flex-col gap-6">
      
      {/* SECTION 1: OVERALL STATISTICS BADGES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total predictions card */}
        <div className="bg-stone-900 border border-amber-600/10 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-sm">累积卜筮起卦</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-amber-500">{totalPredicts}</span>
            <span className="text-xs text-stone-500">局</span>
          </div>
          <p className="text-[10px] text-stone-500 mt-2">包含主客预测、红黄牌及角球运数</p>
        </div>

        {/* Win success rate card */}
        <div className="bg-stone-900 border border-amber-600/10 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-sm">胜负平灵准度</span>
            <Award className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-orange-400">{winSuccessRate}%</span>
            <span className="text-xs text-stone-500">已验证 {resolvedWinnerPredictions.length} 局</span>
          </div>
          {/* visual percentage line */}
          <div className="w-full bg-stone-850 h-1 rounded overflow-hidden mt-3">
            <div className="h-full bg-orange-500" style={{ width: `${winSuccessRate}%` }} />
          </div>
        </div>

        {/* Corners rate card */}
        <div className="bg-stone-900 border border-amber-600/10 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-sm">角球预测准度</span>
            <PieChart className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-emerald-400">{cornerSuccessRate}%</span>
            <span className="text-xs text-stone-500">已验证 {resolvedCorners.length} 局</span>
          </div>
          <div className="w-full bg-stone-850 h-1 rounded overflow-hidden mt-3">
            <div className="h-full bg-emerald-500" style={{ width: `${cornerSuccessRate}%` }} />
          </div>
        </div>

        {/* Card size rate card */}
        <div className="bg-stone-900 border border-amber-600/10 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-sm">黄牌数预测准度</span>
            <Info className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-red-400">{yellowCardSuccessRate}%</span>
            <span className="text-xs text-stone-500">已验证 {resolvedCards.length} 局</span>
          </div>
          <div className="w-full bg-stone-850 h-1 rounded overflow-hidden mt-3">
            <div className="h-full bg-red-500" style={{ width: `${yellowCardSuccessRate}%` }} />
          </div>
        </div>
      </div>

      {/* SECTION 2: COSMIC SIG & TRIGRAM STATISTICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {/* Five Elements Affinity Breakdown */}
        <div id="five_elements_card" className="bg-stone-900 border border-amber-600/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-amber-500 mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            用户五行命理亲和度 (依据体卦)
          </h3>
          <p className="text-[11px] text-stone-400 mb-4 leading-normal">
            基于你历次起卦产生的【体卦】所属性质。当某一属性占比极高时，说明你与对应的足坛五行力量具有强烈的气场感知，决策时最宜参考该属性。
          </p>
          <div className="flex flex-col gap-3">
            {Object.entries(elementFrequencyCount).map(([elem, count]) => {
              const percentage = totalPredicts > 0 ? Math.round((count / totalPredicts) * 100) : 0;
              const barColor = 
                elem === '金' ? 'bg-amber-100' :
                elem === '木' ? 'bg-emerald-600' :
                elem === '水' ? 'bg-sky-500' :
                elem === '火' ? 'bg-red-500' : 'bg-amber-600';

              const elemDesc = 
                elem === '金' ? '刚重凌厉，球风侵略进攻，主射门' :
                elem === '木' ? '雷厉风行，边路快速渗透与突击' :
                elem === '水' ? '暗流防守，擅长沉稳防守反击与拉锯' :
                elem === '火' ? '激情高昂，节奏极快、高强度拼抢对抗' : '稳重固守，以大巴大后防体系著称';

              return (
                <div key={elem} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${barColor}`} />
                      {elem}行要素（出现 {count} 次）
                    </span>
                    <span className="text-stone-400">{percentage}%</span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded overflow-hidden">
                    <div className={`h-full ${barColor}`} style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-[9px] text-stone-500">{elemDesc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trigram Frequency Breakdown */}
        <div id="trigram_freq_card" className="bg-stone-900 border border-amber-600/10 rounded-xl p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-amber-500 mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            本命宿定卦象占重 (体卦)
          </h3>
          <p className="text-[11px] text-stone-400 mb-4 leading-normal">
            体卦为你自身或支持意图在此对决中的代表。以下为你卜得最多的八卦，点击可回顾其战道智慧。
          </p>
          {totalPredicts === 0 ? (
            <div className="flex-grow flex items-center justify-center text-xs text-stone-500">
              请进行至少一次起卦，以开启宇宙极星卦象解析
            </div>
          ) : (
            <div className="flex-grow flex flex-col gap-2 overflow-y-auto max-h-[220px] scrollbar-thin">
              {Object.entries(trigramFrequencyCount)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => {
                  const perc = Math.round((count / totalBodyTrigrams) * 100);
                  return (
                    <div key={name} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-800/60 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold font-serif">{name}</span>
                        <span className="text-stone-300">卦名象征</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-stone-500">出现 {count} 次</span>
                        <span className="font-semibold text-amber-500">{perc}%</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: RECENT CALCULATION HISTORY & VERIFICATION */}
      <div id="history_list_section" className="bg-stone-900 border border-amber-600/10 rounded-xl p-5 mt-2">
        <h3 className="text-sm font-semibold text-amber-500 mb-4 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
          易理推算历史案牍 & 战果校正
        </h3>
        {history.length === 0 ? (
          <div className="text-center py-8 text-xs text-stone-500">
            竹简清浅，尚无记录。请先在上方表单中进行起卦测算。
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {history.map((p) => {
              const actual = p.actualResult || {
                matchOutcome: '未赛',
                cornerSize: '未确定',
                yellowCardSize: '未确定',
                redCardOutcome: '未确定'
              };

              // Determine outcome states
              const outcomeColor = 
                actual.matchOutcome === '未赛' ? 'text-stone-400 bg-stone-800' :
                p.matchWinner.prediction === actual.matchOutcome ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' :
                'text-red-400 bg-red-500/10 border border-red-500/20';

              return (
                <div 
                  key={p.id}
                  id={`history_item_${p.id}`}
                  className="bg-neutral-950 p-4 border border-stone-800 rounded-lg hover:border-amber-600/20 transition-all cursor-pointer flex flex-col gap-3"
                  onClick={() => onSelectSaved(p)}
                >
                  {/* Header metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/60 pb-2 text-[11px] text-stone-400">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-400 rounded-md font-serif font-bold">
                        {p.hexagram.originalHexagramName}
                      </span>
                      <span>起卦师: {p.userProfile.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>卦刻: {new Date(p.timestamp).toLocaleString('zh-CN', { hour12: false })}</span>
                      <button 
                        onClick={(e) => handleDeleteHistory(p.id, e)}
                        className="text-stone-500 hover:text-red-400 p-1 rounded transition-colors"
                        title="删除记录"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Match Matchup and predict results */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-stone-200">{p.matchInfo.homeTeam}</span>
                      <span className="text-xs text-stone-500">让{p.matchInfo.handicap}</span>
                      <span className="text-xs font-serif text-amber-500">VS</span>
                      <span className="text-sm font-semibold text-stone-200">{p.matchInfo.awayTeam}</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Prediction Tag Display */}
                      <span className="text-xs px-2 py-1 bg-stone-900 text-amber-300 rounded border border-amber-600/10">
                        预测: {p.matchWinner.prediction}
                      </span>
                      <span className="text-xs px-2 py-1 bg-stone-900 text-emerald-400 rounded border border-emerald-500/10">
                        角球: {p.corners.sizePrediction}
                      </span>
                      <span className="text-xs px-2 py-1 bg-stone-900 text-red-400 rounded border border-red-500/10">
                        黄牌: {p.yellowCards.sizePrediction}
                      </span>
                      
                      {/* Verification Badge */}
                      <span className={`text-xs px-2 py-1 rounded-md ${outcomeColor}`}>
                        {actual.matchOutcome === '未赛' ? '未校正' : p.matchWinner.prediction === actual.matchOutcome ? '卜验准确' : '卜验失准'}
                      </span>
                    </div>
                  </div>

                  {/* User interactive result register */}
                  <div 
                    className="mt-1 bg-stone-900/40 p-3 sm:p-4 rounded-md border border-stone-900 flex flex-col gap-3"
                    onClick={(e) => e.stopPropagation() /* Prevent opening detail when interacting with outcome fields */}
                  >
                    <span className="text-xs sm:text-sm text-stone-300 font-bold block mb-1">登记该场绿茵【实际产出】校定天机(点击进行快速记录)：</span>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-x-6 gap-y-3 sm:items-center">
                      
                      {/* Match outcome actual selection */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                        <span className="text-xs text-stone-500 font-semibold mb-1 sm:mb-0">实战赛果:</span>
                        <div className="flex bg-stone-950 rounded border border-stone-800 overflow-hidden w-fit">
                          {['胜', '平', '负', '未赛'].map((val) => (
                            <button
                              key={val}
                              onClick={() => handleSetActualOutcome(p.id, 'matchOutcome', val)}
                              className={`text-xs px-3 py-1.5 transition-all font-semibold ${
                                actual.matchOutcome === val 
                                  ? 'bg-amber-600 text-neutral-900 font-bold' 
                                  : 'text-stone-400 hover:bg-stone-800'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Corner actual selection */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                        <span className="text-xs text-stone-500 font-semibold mb-1 sm:mb-0">实战角球(≥9为大):</span>
                        <div className="flex bg-stone-950 rounded border border-stone-800 overflow-hidden w-fit">
                          {['大', '小', '未确定'].map((val) => (
                            <button
                              key={val}
                              onClick={() => handleSetActualOutcome(p.id, 'cornerSize', val)}
                              className={`text-xs px-3 py-1.5 transition-all font-semibold ${
                                actual.cornerSize === val 
                                  ? 'bg-emerald-600 text-white font-bold' 
                                  : 'text-stone-400 hover:bg-stone-800'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Card actual selection */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                        <span className="text-xs text-stone-500 font-semibold mb-1 sm:mb-0">实战黄牌(≥4为大):</span>
                        <div className="flex bg-stone-950 rounded border border-stone-800 overflow-hidden w-fit">
                          {['大', '小', '未确定'].map((val) => (
                            <button
                              key={val}
                              onClick={() => handleSetActualOutcome(p.id, 'yellowCardSize', val)}
                              className={`text-xs px-3 py-1.5 transition-all font-semibold ${
                                actual.yellowCardSize === val 
                                  ? 'bg-red-600 text-white font-bold' 
                                  : 'text-stone-400 hover:bg-stone-800'
                              }`}
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
