import { UserProfile, MatchInfo, TrigramInfo, HexagramResult, MatchPredictionOutput } from '../types';

export const TRIGRAMS: TrigramInfo[] = [
  {
    index: 0,
    number: 1,
    name: '乾',
    symbol: '☰',
    nature: '天',
    element: '金',
    binary: '111',
    description: '乾为天，刚健中正，自强不息。象征着极高的能量、进攻与统治力。'
  },
  {
    index: 1,
    number: 2,
    name: '兑',
    symbol: '☱',
    nature: '泽',
    element: '金',
    binary: '110',
    description: '兑为泽，喜悦和乐，外柔内刚。象征着流畅的配合、传控以及快速反击。'
  },
  {
    index: 2,
    number: 3,
    name: '离',
    symbol: '☲',
    nature: '火',
    element: '火',
    binary: '101',
    description: '离为火，光明美丽，热情奔放。象征着火热的对抗、频繁的射门、斗志昂扬。'
  },
  {
    index: 3,
    number: 4,
    name: '震',
    symbol: '☳',
    nature: '雷',
    element: '木',
    binary: '100',
    description: '震为雷，奋发振动，雷厉风行。象征着闪击战、突然爆发的速度以及意外的红牌或点球。'
  },
  {
    index: 4,
    number: 5,
    name: '巽',
    symbol: '☴',
    nature: '风',
    element: '木',
    binary: '011',
    description: '巽为风，无孔不入，柔顺渗透。象征着边路突击、灵活多变的战术和持续的压迫。'
  },
  {
    index: 5,
    number: 6,
    name: '坎',
    symbol: '☵',
    nature: '水',
    element: '水',
    binary: '010',
    description: '坎为水，艰难险阻，暗流涌动。象征着极其顽固的防守、铁桶阵或充满胶着的拉锯战。'
  },
  {
    index: 6,
    number: 7,
    name: '艮',
    symbol: '☶',
    nature: '山',
    element: '土',
    binary: '001',
    description: '艮为山，静止停顿，重峦叠嶂。象征着防守反击、固若金汤的后防、节奏缓慢的拉锯。'
  },
  {
    index: 7,
    number: 8,
    name: '坤',
    symbol: '☷',
    nature: '地',
    element: '土',
    binary: '000',
    description: '坤为地，厚德载物，包容顺从。象征着整体防守、高纪律性、稳健的打法和中立的平衡。'
  }
];

// 64卦名称矩阵 [上卦1-8][下卦1-8]
const HEXAGRAM_NAMES: Record<number, Record<number, string>> = {
  1: { 1: '乾为天', 2: '天泽履', 3: '天火同人', 4: '天雷无妄', 5: '天风姤', 6: '天水讼', 7: '天山遁', 8: '天地否' },
  2: { 1: '泽天夬', 2: '兑为泽', 3: '泽火革', 4: '泽雷随', 5: '泽风大过', 6: '泽水困', 7: '泽山咸', 8: '泽地萃' },
  3: { 1: '火天大有', 2: '火泽睽', 3: '离为火', 4: '火雷噬嗑', 5: '火风鼎', 6: '火水未济', 7: '火山旅', 8: '火地晋' },
  4: { 1: '雷天大壮', 2: '雷泽归妹', 3: '雷火丰', 4: '震为雷', 5: '雷风恒', 6: '雷水解', 7: '雷山小过', 8: '雷地豫' },
  5: { 1: '风天小畜', 2: '风泽中孚', 3: '风火家人', 4: '风雷益', 5: '巽为风', 6: '风水涣', 7: '风山渐', 8: '风地观' },
  6: { 1: '水天需', 2: '水泽节', 3: '水火既济', 4: '水雷屯', 5: '水风井', 6: '坎为水', 7: '水山蹇', 8: '水地比' },
  7: { 1: '山天大畜', 2: '山泽损', 3: '山火贲', 4: '山雷颐', 5: '山风蛊', 6: '山水蒙', 7: '艮为山', 8: '山地剥' },
  8: { 1: '地天泰', 2: '地泽临', 3: '地火明夷', 4: '地雷复', 5: '地风升', 6: '地水师', 7: '地山谦', 8: '坤为地' }
};

// 卦象组合的符号
const HEXAGRAM_SYMBOLS: Record<number, Record<number, string>> = {
  1: { 1: '䷀', 2: '䷉', 3: '䷌', 4: '䷘', 5: '䷫', 6: '䷅', 7: '䷠', 8: '䷋' },
  2: { 1: '䷪', 2: '䷹', 3: '䷰', 4: '䷐', 5: '䷛', 6: '䷮', 7: '䷞', 8: '䷬' },
  3: { 1: '䷍', 2: '䷥', 3: '䷝', 4: '䷔', 5: '䷱', 6: '䷿', 7: '䷷', 8: '䷢' },
  4: { 1: '䷡', 2: '䷵', 3: '䷶', 4: '䷲', 5: '䷟', 6: '䷧', 7: '䷽', 8: '䷏' },
  5: { 1: '䷈', 2: '䷼', 3: '䷤', 4: '䷩', 5: '䷸', 6: '䷺', 7: '䷴', 8: '䷓' },
  6: { 1: '䷄', 2: '䷻', 3: '䷾', 4: '䷂', 5: '䷯', 6: '䷜', 7: '䷦', 8: '䷇' },
  7: { 1: '䷙', 2: '䷨', 3: '䷕', 4: '䷚', 5: '蛊', 6: '䷃', 7: '䷳', 8: '䷖' },
  8: { 1: '䷊', 2: '临', 3: '䷣', 4: '䷗', 5: '䷭', 6: '䷆', 7: '䷎', 8: '䷁' }
};

function getHashValue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// 获取八卦的 binary 状态，并将其解开为 1 和 0 的数组 [爻1, 爻2, 爻3] (排布从下到上)
function getTrigramLines(binary: string): number[] {
  return binary.split('').reverse().map(b => parseInt(b));
}

// 根据 binary 获取 Trigram
function getTrigramByBinary(binary: string): TrigramInfo {
  const trigram = TRIGRAMS.find(t => t.binary === binary);
  return trigram || TRIGRAMS[0];
}

// 根据 index 1-8 获取 Trigram
export function getTrigramByNumber(num: number): TrigramInfo {
  const trigram = TRIGRAMS.find(t => t.number === num);
  return trigram || TRIGRAMS[0];
}

// 根据五行相克判断: elem1 克 elem2 ?
function isDestructive(elem1: string, elem2: string): boolean {
  // 金克木，木克土，土克水，水克火，火克金
  if (elem1 === '金' && elem2 === '木') return true;
  if (elem1 === '木' && elem2 === '土') return true;
  if (elem1 === '土' && elem2 === '水') return true;
  if (elem1 === '水' && elem2 === '火') return true;
  if (elem1 === '火' && elem2 === '金') return true;
  return false;
}

// 根据五行相生判断: elem1 生 elem2 ?
function isGenerative(elem1: string, elem2: string): boolean {
  // 金生水，水生木，木生火，火生土，土生金
  if (elem1 === '金' && elem2 === '水') return true;
  if (elem1 === '水' && elem2 === '木') return true;
  if (elem1 === '木' && elem2 === '火') return true;
  if (elem1 === '火' && elem2 === '土') return true;
  if (elem1 === '土' && elem2 === '金') return true;
  return false;
}

// 核心梅花起卦法
export function calculateHexagram(user: UserProfile, match: MatchInfo): HexagramResult {
  const nameHash = getHashValue(user.name);
  const birthplaceHash = getHashValue(user.birthPlace);
  const currentAddressHash = getHashValue(match.currentAddress);
  const matchTeamsHash = getHashValue(match.homeTeam + match.awayTeam);
  
  // 生日与起卦时刻数字转化
  const birthDateObj = new Date(user.birthDate);
  const bYear = isNaN(birthDateObj.getFullYear()) ? 1998 : birthDateObj.getFullYear();
  const bMonth = isNaN(birthDateObj.getMonth()) ? 10 : birthDateObj.getMonth() + 1;
  const bDay = isNaN(birthDateObj.getDate()) ? 24 : birthDateObj.getDate();
  const bHour = user.birthHour; // 0-23
  
  const predDateObj = new Date(match.predictionTime);
  const pYear = isNaN(predDateObj.getFullYear()) ? 2026 : predDateObj.getFullYear();
  const pMonth = isNaN(predDateObj.getMonth()) ? 5 : predDateObj.getMonth() + 1;
  const pDay = isNaN(predDateObj.getDate()) ? 25 : predDateObj.getDate();
  const pHour = isNaN(predDateObj.getHours()) ? 14 : predDateObj.getHours();
  
  const genderWeight = user.gender === 'Male' ? 9 : 6;
  const handicapWeight = Math.abs(Math.floor(match.handicap * 10)) + 3;

  // 1. 计算上卦 (代表先天，与用户根骨起音相关)
  // 上卦数 = (姓名哈希 + 居住出生地哈希 + 出生年月日时 + 性别权重) % 8
  const upperSum = nameHash + birthplaceHash + bYear + bMonth + bDay + bHour + genderWeight;
  let upperNum = upperSum % 8;
  if (upperNum === 0) upperNum = 8;
  
  // 2. 计算下卦 (代表后天时刻、地理空间变数)
  // 下卦数 = (当前地址哈希 + 比赛对战哈希 + 起卦年月日时 + 让球权重) % 8
  const lowerSum = currentAddressHash + matchTeamsHash + pYear + pMonth + pDay + pHour + handicapWeight + nameHash;
  let lowerNum = lowerSum % 8;
  if (lowerNum === 0) lowerNum = 8;

  // 3. 计算动爻 (变数交汇之节点)
  // 动爻数 = (先天数 + 后天数 + 双方博弈哈希 + 起卦小时) % 6
  const movingSum = upperSum + lowerSum + pHour + Math.abs(matchTeamsHash % 100);
  let movingLine = movingSum % 6;
  if (movingLine === 0) movingLine = 6;

  // 获取对应的八卦
  const originalUpper = getTrigramByNumber(upperNum);
  const originalLower = getTrigramByNumber(lowerNum);
  
  const originalHexagramName = HEXAGRAM_NAMES[upperNum][lowerNum];
  const originalSymbol = HEXAGRAM_SYMBOLS[upperNum][lowerNum];

  // 4. 计算互卦 (取本卦二三四爻为下互，三四五爻为上互)
  // 本卦爻画从下到上：
  const lowerLines = getTrigramLines(originalLower.binary); // [爻1, 爻2, 爻3]
  const upperLines = getTrigramLines(originalUpper.binary); // [爻4, 爻5, 爻6]
  const hexLines = [...lowerLines, ...upperLines]; // 0-indexed: [爻1, 爻2, 爻3, 爻4, 爻5, 爻6]

  // 互下卦: 爻2, 爻3, 爻4
  const mutualLowerBinary = `${hexLines[3]}${hexLines[2]}${hexLines[1]}`; // 转回从上到下的二进制: 3,2,1
  // 互上卦: 爻3, 爻4, 爻5
  const mutualUpperBinary = `${hexLines[4]}${hexLines[3]}${hexLines[2]}`; // 转回从上到下的二进制: 4,3,2
  
  const mutualUpper = getTrigramByBinary(mutualUpperBinary);
  const mutualLower = getTrigramByBinary(mutualLowerBinary);
  const mutualHexagramName = HEXAGRAM_NAMES[mutualUpper.number][mutualLower.number];

  // 5. 计算变卦 (把动爻阴阳倒置)
  const transLines = [...hexLines];
  const movingIdx = movingLine - 1; // 0-5
  transLines[movingIdx] = transLines[movingIdx] === 1 ? 0 : 1;

  const transformedLowerBinary = `${transLines[2]}${transLines[1]}${transLines[0]}`;
  const transformedUpperBinary = `${transLines[5]}${transLines[4]}${transLines[3]}`;

  const transformedUpper = getTrigramByBinary(transformedUpperBinary);
  const transformedLower = getTrigramByBinary(transformedLowerBinary);
  const transformedHexagramName = HEXAGRAM_NAMES[transformedUpper.number][transformedLower.number];
  const transformedSymbol = HEXAGRAM_SYMBOLS[transformedUpper.number][transformedLower.number];

  // 6. 体用分析 (动爻所在的卦为“用卦”，没有动爻的卦为“体卦”)
  // 动爻 1,2,3 属下卦。下卦为用，上卦为体。
  // 动爻 4,5,6 属上卦。上卦为用，下卦为体。
  const isLowerUse = movingLine <= 3;
  const bodyTrigram = isLowerUse ? originalUpper : originalLower;
  const useTrigram = isLowerUse ? originalLower : originalUpper;

  let bodyRelation: '体克用' | '用克体' | '体生用' | '用生体' | '比和' = '比和';
  let auspiciousness = 50;
  let auspiciousText: '大吉' | '小吉' | '比和' | '中立' | '小凶' | '大凶' = '中立';
  let divinationComment = '';

  const bodyElem = bodyTrigram.element;
  const useElem = useTrigram.element;

  if (bodyElem === useElem) {
    bodyRelation = '比和';
    auspiciousness = 90;
    auspiciousText = '比和';
    divinationComment = '体用比和，同气连枝。此为极吉之兆，万物顺随，合力谋事大有可成。在足球博弈中，代表己方精神高度团结，战术发挥淋漓尽致，大概率占尽上风。';
  } else if (isDestructive(bodyElem, useElem)) {
    bodyRelation = '体克用';
    auspiciousness = 75;
    auspiciousText = '小吉';
    divinationComment = '体克用卦，我有余力制伏对手。主客相征，我方占据主动权，能够有效压制乃至打穿对方防线。虽然过程有对抗冲突，但终能掌握大局，顺利取胜。';
  } else if (isDestructive(useElem, bodyElem)) {
    bodyRelation = '用克体';
    auspiciousness = 15;
    auspiciousText = '大凶';
    divinationComment = '用克体卦，客来伤主，环境或对手极度不利。防守线面临重重危机，可能会因为低级失误、意外裁判判定（红牌或点球）自毁长城，慎之避之。';
  } else if (isGenerative(useElem, bodyElem)) {
    bodyRelation = '用生体';
    auspiciousness = 85;
    auspiciousText = '大吉';
    divinationComment = '用生体卦，客来生主，天降福泽，环境推一把。象征比赛中贵人协助、天时地利相助。好比对手送礼、乌龙球或绝平绝杀，我方能借势轻松登顶。';
  } else if (isGenerative(bodyElem, useElem)) {
    bodyRelation = '体生用';
    auspiciousness = 35;
    auspiciousText = '小凶';
    divinationComment = '体生用卦，我生他人，代表元气泄露，徒劳无功。足球博弈中常表现为攻势如潮却光开花不结果，体能消耗过巨，极容易在下半场或尾声被对手逆袭。';
  }

  return {
    originalUpper,
    originalLower,
    originalUpperName: originalUpper.name,
    originalLowerName: originalLower.name,
    originalHexagramName,
    originalSymbol,
    
    mutualUpper,
    mutualLower,
    mutualHexagramName,
    
    transformedUpper,
    transformedLower,
    transformedHexagramName,
    transformedSymbol,
    
    movingLine,
    
    bodyTrigram,
    useTrigram,
    bodyRelation,
    auspiciousness,
    auspiciousText,
    divinationComment,
  };
}

// 结合卦象和足球玩法，做具体数据推演
export function predictMatch(user: UserProfile, match: MatchInfo): MatchPredictionOutput {
  const hexagram = calculateHexagram(user, match);
  const originalLower = hexagram.originalLower;
  const originalUpper = hexagram.originalUpper;
  const movingLine = hexagram.movingLine;
  const bodyRelation = hexagram.bodyRelation;
  const auspScore = hexagram.auspiciousness;

  // ====== 1. 胜负平胜率计算(考虑让球情况) ======
  // 基本概率（受体用干系影响）
  let pHome = 33;
  let pDraw = 34;
  let pAway = 33;

  if (bodyRelation === '比和') {
    pHome = 58; pDraw = 25; pAway = 17;
  } else if (bodyRelation === '用生体') {
    pHome = 52; pDraw = 30; pAway = 18;
  } else if (bodyRelation === '体克用') {
    pHome = 46; pDraw = 34; pAway = 20;
  } else if (bodyRelation === '体生用') {
    pHome = 22; pDraw = 32; pAway = 46;
  } else if (bodyRelation === '用克体') {
    pHome = 12; pDraw = 23; pAway = 65;
  }

  // 让球数对概率的影响:
  // handicap < 0 (让球，意味着Home太强，概率做出调整。让1球：-1。如果是预测让球胜，则需要进一步削减由于让球导致获胜概率)
  const adjustedHC = match.handicap; // 比如 -1 
  if (adjustedHC < 0) {
    // 扣减主队在让球盘下的实际获胜概率
    pHome = Math.max(10, pHome + adjustedHC * 15);
    pAway = Math.min(90, pAway - adjustedHC * 12);
    pDraw = 100 - pHome - pAway;
  } else if (adjustedHC > 0) {
    // 主队受让，主队不败（主胜 + 平）概率大幅度提升
    pHome = Math.min(90, pHome + adjustedHC * 15);
    pAway = Math.max(10, pAway - adjustedHC * 12);
    pDraw = 100 - pHome - pAway;
  }

  // 胜负平判断（依据最大概率）
  let maxP = Math.max(pHome, pDraw, pAway);
  let winner: '胜' | '平' | '负' = '平';
  if (maxP === pHome) winner = '胜';
  else if (maxP === pAway) winner = '负';

  const teamWinnerLogic = `依据体用干系【${bodyRelation}】，当前主卦为【${hexagram.originalHexagramName}】，体卦为【${hexagram.bodyTrigram.name}(${hexagram.bodyTrigram.element})】，用卦为【${hexagram.useTrigram.name}(${hexagram.useTrigram.element})】。结合博弈对手，主队气场概率为 ${pHome.toFixed(0)}%。考虑让球调整 [${match.handicap > 0 ? '+' : ''}${match.handicap}]，五行克制指向【${winner === '胜' ? '主队胜盘' : winner === '负' ? '客队受托' : '双方战平'}】。`;

  // ====== 2. 红黄牌预测 (烈度判断) ======
  // 五行中：“火(离)”代表红牌、冲动、烈度、警告；“木(震、巽)”代表雷厉、推搡、迅速；“金”代表决断、刚毅、判罚尺度严。
  // 如果主卦或变卦中包含 离火卦，烈度必定不低。
  let severityScore = 0;
  if (originalLower.element === '火' || originalUpper.element === '火') severityScore += 4;
  if (originalLower.element === '金' || originalUpper.element === '金') severityScore += 2;
  if (originalLower.element === '木' || originalUpper.element === '木') severityScore += 1;
  // 动爻高说明中途波动大
  severityScore += movingLine % 3;

  // 内部仍计算数量用于历史校验，但前台只展示大/小趋势，不暴露具体张数。
  let yellowCardCount = Math.max(2, Math.min(8, 2 + severityScore));
  const yellowLine = severityScore >= 6 ? 3.5 : severityScore >= 4 ? 3 : 2.5;
  let yellowSize: '大' | '小' = yellowCardCount >= yellowLine ? '大' : '小';
  const yellowLineText = yellowLine % 1 === 0 ? yellowLine.toFixed(0) : yellowLine.toFixed(1);
  const yellowLogic = `卦象中见【${originalLower.element}、${originalUpper.element}】行气轮转。${originalLower.element === '火' || originalUpper.element === '火' ? '火炎燥烈，执法裁判尺度紧逼，战术阻挡频繁。' : '五行归土水，局势偏稳重内敛，恶意犯规不多。'}动爻在第 ${movingLine} 爻，局势后期容易失控，故以黄牌盘口【${yellowLineText}】为界，只取趋势为【${yellowSize}】。`;

  // 红牌预测 (5+ 的烈度，火或雷卦叠加)
  let hasRed = false;
  let redProb = 10;
  if (originalLower.name === '离' || originalUpper.name === '离' || originalLower.name === '震' || originalUpper.name === '震') {
    redProb += 25;
  }
  if (movingLine === 3 || movingLine === 5) {
    redProb += 15; // 奇数爻多变折心
  }
  if (redProb > 40) {
    hasRed = true;
  }
  const redLogic = `全场肃杀之象分析：用卦五行属【${hexagram.useTrigram.element}】，体卦属【${hexagram.bodyTrigram.element}】。${hasRed ? '用克体暴烈，防线危殆，容易出现战术性犯规或推搡冲突，红牌风险偏高。' : '体守大局，互卦安静，防守犯规处于合理范畴内，红牌风险偏低。'}`;

  // ====== 3. 全场角球总数 (攻势强弱、风水运转、边路起画) ======
  // “风 (巽)”、“水 (坎)”五行主流通、奔涌、波浪，角球往往极多。
  // “土 (艮、坤)”主静止、塞滞，角球必少。
  let cornerFactor = 5; // 基础
  if (originalUpper.name === '巽' || originalLower.name === '巽') cornerFactor += 4; // 风主边路传中
  if (originalUpper.name === '坎' || originalLower.name === '坎') cornerFactor += 3; // 水主浪击门前
  if (originalUpper.name === '乾' || originalLower.name === '乾') cornerFactor += 2; // 天主高空压制
  if (originalUpper.name === '兑' || originalLower.name === '兑') cornerFactor += 2; // 泽主渗透
  if (originalUpper.name === '艮' || originalLower.name === '艮') cornerFactor -= 2; // 山主阻碍
  if (originalUpper.name === '坤' || originalLower.name === '坤') cornerFactor -= 1; // 地主宽阔

  let totalCorners = Math.max(5, Math.min(13, 5 + cornerFactor + (movingLine % 4)));
  const cornerLine = cornerFactor >= 10 ? 9.5 : cornerFactor >= 8 ? 9 : 8.5;
  let cornerSize: '大' | '小' = totalCorners >= cornerLine ? '大' : '小';
  const cornerLineText = cornerLine % 1 === 0 ? cornerLine.toFixed(0) : cornerLine.toFixed(1);

  const cornerLogic = `角球司职【风、水】行属：上卦【${originalUpper.name}】代表${originalUpper.nature}，下卦【${originalLower.name}】代表${originalLower.nature}。${cornerSize === '大' ? '风水激荡，两翼齐飞攻势不绝，边路压迫更明显。' : '重山落于厚土，中路泥泞堵截阻碍，双方下底传中欲望偏弱。'}故以角球盘口【${cornerLineText}】为界，只取趋势为【${cornerSize}】。`;

  const goalHeat =
    (originalUpper.element === '火' || originalLower.element === '火' ? 1 : 0) +
    (originalUpper.element === '木' || originalLower.element === '木' ? 1 : 0) -
    (originalUpper.element === '土' || originalLower.element === '土' ? 1 : 0);
  const baseHomeGoals = Math.max(0, Math.min(4, Math.round((pHome / 38) + (match.handicap < 0 ? 0.35 : 0) + goalHeat * 0.2)));
  const baseAwayGoals = Math.max(0, Math.min(4, Math.round((pAway / 42) + (match.handicap > 0 ? 0.25 : 0) - goalHeat * 0.1)));
  const scoreSeeds = winner === '胜'
    ? [[Math.max(1, baseHomeGoals), Math.max(0, baseAwayGoals - 1)], [Math.max(1, baseHomeGoals + 1), baseAwayGoals], [Math.max(1, baseHomeGoals), baseAwayGoals]]
    : winner === '负'
      ? [[Math.max(0, baseHomeGoals - 1), Math.max(1, baseAwayGoals)], [baseHomeGoals, Math.max(1, baseAwayGoals + 1)], [baseHomeGoals, Math.max(1, baseAwayGoals)]]
      : [[Math.max(0, baseHomeGoals), Math.max(0, baseHomeGoals)], [Math.max(1, baseHomeGoals + 1), Math.max(1, baseHomeGoals + 1)], [Math.max(0, baseHomeGoals), Math.max(0, baseHomeGoals + (movingLine % 2))]];
  const seenScores = new Set<string>();
  const scorePredictions = scoreSeeds.map(([home, away], idx) => {
    let normalizedHome = Math.max(0, Math.min(5, home));
    let normalizedAway = Math.max(0, Math.min(5, away));
    while (seenScores.has(`${normalizedHome}-${normalizedAway}`)) {
      normalizedHome = Math.min(5, normalizedHome + (idx % 2 === 0 ? 1 : 0));
      normalizedAway = Math.min(5, normalizedAway + (idx % 2 === 1 ? 1 : 0));
      if (!seenScores.has(`${normalizedHome}-${normalizedAway}`)) break;
    }
    seenScores.add(`${normalizedHome}-${normalizedAway}`);
    return {
      score: `${normalizedHome}-${normalizedAway}`,
      tendency: normalizedHome > normalizedAway ? '主胜' as const : normalizedHome < normalizedAway ? '客胜' as const : '平局' as const,
      confidence: Math.max(45, Math.min(88, Math.round(maxP - idx * 7 + hexagram.auspiciousness / 10))),
      reason: `本地梅花盘以【${hexagram.originalHexagramName}】、动爻第 ${movingLine} 爻和体用关系【${bodyRelation}】推得，用作 DeepSeek 复核前的动态候选。`
    };
  });

  return {
    id: `pred_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userProfile: user,
    matchInfo: match,
    hexagram,
    timestamp: new Date().toISOString(),
    matchWinner: {
      prediction: winner,
      probabilityHome: Math.round(pHome),
      probabilityDraw: Math.round(pDraw),
      probabilityAway: Math.round(pAway),
      logic: teamWinnerLogic
    },
    yellowCards: {
      totalNumber: yellowCardCount,
      sizePrediction: yellowSize,
      line: yellowLine,
      logic: yellowLogic
    },
    redCards: {
      hasRedCard: hasRed,
      probability: redProb,
      logic: redLogic
    },
    corners: {
      totalNumber: totalCorners,
      sizePrediction: cornerSize,
      line: cornerLine,
      logic: cornerLogic
    },
    scorePredictions
  };
}
