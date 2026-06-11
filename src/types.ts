export type Gender = 'Male' | 'Female';

export interface AuthUser {
  id: number;
  username: string;
}

export interface UserProfile {
  name: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  birthHour: number; // 0-23 or 时辰 index (0-11)
  birthPlace: string;
}

export interface MatchInfo {
  homeTeam: string;
  awayTeam: string;
  handicap: number; // e.g. -1 means home handicap -1, +0.5 means home +0.5
  predictionTime: string; // ISO datetime or YYYY-MM-DDTHH:mm
  currentAddress: string;
}

export interface TrigramInfo {
  index: number; // 0 to 7 (1 to 8 in Plum Blossom format)
  name: string; // 乾、兑、离、震、巽、坎、艮、坤
  symbol: string; // ☰ ☱ ☲ ☳ ☴ ☵ ☶ ☷
  nature: string; // 天、泽、火、雷、风、水、山、地
  element: '金' | '木' | '水' | '火' | '土';
  number: number; // 1-8
  binary: string; // "111", "011", etc (1 for Yang, 0 for Yin, bottom-to-top or top-to-bottom)
  description: string;
}

export interface HexagramResult {
  // 本卦 (Original Hexagram)
  originalUpper: TrigramInfo;
  originalLower: TrigramInfo;
  originalUpperName: string;
  originalLowerName: string;
  originalHexagramName: string; // e.g., 天雷无妄
  originalSymbol: string;
  
  // 互卦 (Mutual Hexagram)
  mutualUpper: TrigramInfo;
  mutualLower: TrigramInfo;
  mutualHexagramName: string;
  
  // 变卦 (Transformed Hexagram)
  transformedUpper: TrigramInfo;
  transformedLower: TrigramInfo;
  transformedHexagramName: string;
  transformedSymbol: string;
  
  movingLine: number; // 动爻 1-6
  
  // 体用分析 (Body and Application Analysis)
  bodyTrigram: TrigramInfo;
  useTrigram: TrigramInfo;
  bodyRelation: '体克用' | '用克体' | '体生用' | '用生体' | '比和';
  auspiciousness: number; // 0 - 100%
  auspiciousText: '大吉' | '小吉' | '比和' | '中立' | '小凶' | '大凶';
  divinationComment: string; // Chinese algorithmic text helper
}

export interface MatchPredictionOutput {
  id: string;
  userProfile: UserProfile;
  matchInfo: MatchInfo;
  hexagram: HexagramResult;
  timestamp: string; // Calculated time Unix
  
  // Derived predictions
  matchWinner: {
    prediction: '胜' | '平' | '负';
    probabilityHome: number;
    probabilityDraw: number;
    probabilityAway: number;
    logic: string;
  };
  yellowCards: {
    totalNumber: number;
    sizePrediction: '大' | '小'; // e.g. >= 3 is 大, < 3 is 小
    line: number;
    logic: string;
  };
  redCards: {
    hasRedCard: boolean;
    probability: number;
    logic: string;
  };
  corners: {
    totalNumber: number;
    sizePrediction: '大' | '小'; // e.g. >= 9 is 大, < 9 is 小 (depending on target)
    line: number;
    logic: string;
  };
  scorePredictions?: {
    score: string;
    tendency: '主胜' | '平局' | '客胜';
    confidence: number;
    reason: string;
  }[];
  
  // AI analysis (DeepSeek computed or generic default when API offline)
  aiAnalysis?: string;
  isLoadingAI?: boolean;
  
  // Verification (User input)
  actualResult?: {
    matchOutcome?: '胜' | '平' | '负' | '未赛';
    yellowCardSize?: '大' | '小' | '未确定';
    redCardOutcome?: boolean | '未确定';
    cornerSize?: '大' | '小' | '未确定';
    isCorrect?: boolean; // Whether the primary winner prediction was correct
    userNotes?: string;
  };
}
