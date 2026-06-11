import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { initDatabase } from './server/db';
import { registerAuthRoutes } from './server/auth';

dotenv.config();

const app = express();
const PORT = 3000;

// Serve static body parser
app.use(express.json());
registerAuthRoutes(app);

type ScorePrediction = {
  score: string;
  tendency: '主胜' | '平局' | '客胜';
  confidence: number;
  reason: string;
};

function getDeepSeekConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey === 'YOUR_DEEPSEEK_API_KEY') {
    console.warn('DEEPSEEK_API_KEY is not configured or uses a default placeholder. AI feature will run in fallback mode.');
    return null;
  }

  return {
    apiKey,
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/chat/completions',
  };
}

function parseDeepSeekJson(content: string): { analysis?: string; scorePredictions?: ScorePrediction[] } {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return { analysis: content };
    try {
      return JSON.parse(match[0]);
    } catch {
      return { analysis: content };
    }
  }
}

function normalizeScorePredictions(value: unknown, fallback: ScorePrediction[] = []): ScorePrediction[] {
  if (!Array.isArray(value)) return fallback.slice(0, 3);

  const normalized = value
    .map((item: any) => {
      const score = String(item?.score || '').trim();
      const tendency = item?.tendency === '主胜' || item?.tendency === '平局' || item?.tendency === '客胜'
        ? item.tendency
        : '平局';
      const confidence = Number(item?.confidence);
      const reason = String(item?.reason || '').trim();

      if (!/^\d+\s*-\s*\d+$/.test(score)) return null;
      return {
        score: score.replace(/\s+/g, ''),
        tendency,
        confidence: Number.isFinite(confidence) ? Math.max(1, Math.min(99, Math.round(confidence))) : 60,
        reason: reason || 'DeepSeek 结合梅花易数体用关系与比赛攻守态势推得。',
      };
    })
    .filter(Boolean) as ScorePrediction[];

  return normalized.length >= 3 ? normalized.slice(0, 3) : fallback.slice(0, 3);
}

// REST API for Divination AI Analysis
app.post('/api/divination-ai', async (req, res) => {
  try {
    const { userProfile, matchInfo, hexagram, prediction } = req.body;
    
    // Check if configuration exists
    const deepSeek = getDeepSeekConfig();
    
    if (!deepSeek) {
      // Return a beautiful, algorithmic fallback if no API key is provided
      const backupText = `【易理断语】
体用气交，【${hexagram.bodyTrigram.name}${hexagram.bodyTrigram.element}】受制，【${hexagram.useTrigram.name}${hexagram.useTrigram.element}】腾挪。主卦得【${hexagram.originalHexagramName}】（${hexagram.originalSymbol}），预示博弈处于极高震荡期。

【世界杯技战术映射】
主队（体卦）${userProfile.gender === 'Male' ? '阳刚外露' : '内敛守气'}，在防守方面体现高度的纪律。客队（用卦）则如同云遮雾障，让球情况为 ${matchInfo.handicap}。
全场战机将在动爻位于第 ${hexagram.movingLine} 爻处剧烈逆转，此时易主攻守之势。全场倾向预测：【${prediction.matchWinner.prediction}】，黄牌呈【${prediction.yellowCards.sizePrediction}】，角球呈【${prediction.corners.sizePrediction}】。

（提示：当前未检测到专属 DEEPSEEK_API_KEY，以上为《梅花易理》本地默认谶言，比分为本地动态候选。）`;

      return res.json({ text: backupText, scorePredictions: prediction.scorePredictions || [] });
    }

    const prompt = `你是一位精通中国传统《易经》、《梅花易数》以及现代足球（世界杯）技战术博弈的国风神算大师。
现在有一位用户想要预测世界杯淘汰赛/小组赛的详情，请你为他撰写一篇富有中国传统易理深度（词藻古风雅致、带玄学谶语）同时又具备极强足球技战术实战说服力的“世界杯易数推演报告”。

以下是算命者的个人信息：
- 姓名: ${userProfile.name}
- 性别: ${userProfile.gender === 'Male' ? '乾造(男)' : '坤造(女)'}
- 出生地: ${userProfile.birthPlace}
- 生日: ${userProfile.birthDate} (阴阳命理)
- 地理位置(当前起卦地): ${matchInfo.currentAddress}

以下是世界杯对阵关键信息：
- 比赛对阵: 【${matchInfo.homeTeam}】(主队/体) VS 【${matchInfo.awayTeam}】(客队/用)
- 让球情况: ${matchInfo.handicap > 0 ? '主队受让' : '主队让'} ${Math.abs(matchInfo.handicap)} 球
- 预测针对时刻: ${matchInfo.predictionTime}

以下是梅花起卦计算得出的命格卦象：
- 本卦（初始状态）: 【${hexagram.originalHexagramName}】 (符号: ${hexagram.originalSymbol})
  * 上卦: ${hexagram.originalUpper.name}(${hexagram.originalUpper.nature}) · 属${hexagram.originalUpper.element}
  * 下卦: ${hexagram.originalLower.name}(${hexagram.originalLower.nature}) · 属${hexagram.originalLower.element}
- 互卦（中间博弈纠缠）: 【${hexagram.mutualHexagramName}】
- 变卦（最终结局节点）: 【${hexagram.transformedHexagramName}】 (符号: ${hexagram.transformedSymbol})
- 动爻: 第 ${hexagram.movingLine} 爻
- 体用相互干系: 【${hexagram.bodyRelation}】
- 起卦吉凶指示: 【${hexagram.auspiciousText}】 (契合指数: ${hexagram.auspiciousness}%)

以下是程序算法推荐的初步物理模型预测：
- 胜负平指向: ${prediction.matchWinner.prediction} (主胜率: ${prediction.matchWinner.probabilityHome}%, 平率: ${prediction.matchWinner.probabilityDraw}%, 客胜率: ${prediction.matchWinner.probabilityAway}%)
- 黄牌趋势: ${prediction.yellowCards.sizePrediction}${typeof prediction.yellowCards.line === 'number' ? '（盘口线 ' + prediction.yellowCards.line + '）' : ''}（只表达大/小倾向，不写具体张数）
- 红牌警示: ${prediction.redCards.hasRedCard ? '红牌风险偏高' : '红牌风险偏低'}（不写具体概率）
- 角球趋势: ${prediction.corners.sizePrediction}${typeof prediction.corners.line === 'number' ? '（盘口线 ' + prediction.corners.line + '）' : ''}（只表达大/小倾向，不写具体个数）
- 本地梅花易数动态比分候选: ${JSON.stringify(prediction.scorePredictions || [])}

请根据这些信息，在350字到500字间撰写一篇《梅花易理足球神数判解》，并额外给出 3 个 90 分钟常规时间比分预测。注意比分必须由你结合梅花易数卦象、体用关系、动爻、让球与攻守态势综合推断，不能照抄固定比分模板，也不能全部照抄本地候选。

报告要分为三个部分：
1. 【太极初开，易理卦气】：通过姓名、生日、卦象体用干系（如${hexagram.bodyRelation}），以富有神学古风、富有灵气的笔触，解读此番世界杯对局的本质宇宙磁场。
2. 【绿茵博弈，玄机判语】：将卦象（本卦、互卦、变卦）与具体的足球比赛战术、攻守局势进行深度融合。比如分析离火生土、坎水主防守，指出某队战法特点（结合主队客队名称与让球）。说明动爻在第${hexagram.movingLine}爻会对比赛走势（如红黄牌或关键换人）有什么天机暗示。
3. 【断命指津，世界杯天机】：给出一个高高在上的终极断语，覆盖“胜负平、黄牌趋势、角球趋势、红牌警戒”，但不要写黄牌张数、红牌概率、角球个数等具体数量，给用户带去充满仪式感的指引。

输出必须是严格 JSON，不要 Markdown，不要额外解释：
{
  "analysis": "350到500字签文正文",
  "scorePredictions": [
    {"score":"1-0","tendency":"主胜","confidence":72,"reason":"一句话说明该比分的梅花易数与足球依据"},
    {"score":"1-1","tendency":"平局","confidence":61,"reason":"一句话说明该比分的梅花易数与足球依据"},
    {"score":"0-1","tendency":"客胜","confidence":55,"reason":"一句话说明该比分的梅花易数与足球依据"}
  ]
}

注意：词藻一定要讲究、专业、古香古色，不要有半点现代机器感。scorePredictions 必须正好 3 个，score 使用“主队进球-客队进球”格式。`;

    const response = await fetch(deepSeek.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${deepSeek.apiKey}`,
      },
      body: JSON.stringify({
        model: deepSeek.model,
        messages: [
          {
            role: 'system',
            content: '你是专业的梅花易数足球预测分析师。必须严格输出 JSON，不输出 Markdown。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.75,
        top_p: 0.9,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('DeepSeek 返回内容为空。');
    }

    const parsed = parseDeepSeekJson(content);
    res.json({
      text: parsed.analysis || content,
      scorePredictions: normalizeScorePredictions(parsed.scorePredictions, prediction.scorePredictions || []),
    });
  } catch (error: any) {
    console.error('Error invoking DeepSeek on server:', error);
    res.status(500).json({ error: 'AI 起卦失败，请稍后重试或使用默认卦象断语。', message: error.message });
  }
});

// Setup Vite & static assets routes
async function startServer() {
  await initDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer();
