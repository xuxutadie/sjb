import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserProfile, 
  MatchInfo, 
  MatchPredictionOutput, 
  TrigramInfo,
  AuthUser
} from './types';
import { predictMatch } from './utils/divination';
import DivinationCompass from './components/DivinationCompass';
import StatisticsPanel from './components/StatisticsPanel';
import AisScrollUI from './components/AisScrollUI';
import { 
  Compass, 
  Activity, 
  User, 
  Bookmark, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCw, 
  Sparkles,
  CircleDot,
  CalendarDays,
  MapPin,
  Clock,
  HelpCircle,
  Dices,
  Flame,
  ShieldCheck,
  ChevronRight,
  Palette,
  X,
  Upload,
  Image as ImageIcon,
  Sliders,
  Eye,
  EyeOff
} from 'lucide-react';

const hideSpecificDisciplineCounts = (text?: string) => {
  if (!text) return text;

  return text
    .replace(/折合成全场黄牌，断定约【?\d+】?[张颗个]?[，,]?/g, '')
    .replace(/推演全场得角球数约【?\d+】?[张颗个]?[，,]?/g, '')
    .replace(/黄牌测算：推测总张数达【?\d+】?张附近。/g, '黄牌测算：只取趋势，不列具体张数。')
    .replace(/角球测盘：推算共【?\d+】?颗上下。/g, '角球测盘：只取趋势，不列具体个数。')
    .replace(/约【?\d+】?[张颗个]/g, '趋势')
    .replace(/出现红牌概率仅\d+%[，,]?/g, '红牌风险偏低，')
    .replace(/概率\d+%/g, '风险值');
};

const formatMarketLine = (size: '大' | '小', line?: number) => {
  if (typeof line !== 'number' || !Number.isFinite(line)) return size;
  const lineText = line % 1 === 0 ? line.toFixed(0) : line.toFixed(1);
  return `${size}（${size === '大' ? '≥' : '<'}${lineText}）`;
};

export default function App() {
  // Tab states
  const [activeTab, setActiveTab] = useState<'divination' | 'history'>('divination');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authMessage, setAuthMessage] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isDbReady, setIsDbReady] = useState(true);
  const [isProfilePrivate, setIsProfilePrivate] = useState(false);

  // Input states
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '李知命',
    gender: 'Male',
    birthDate: '1998-10-24',
    birthHour: 10,
    birthPlace: '长安',
  });

  const [matchInfo, setMatchInfo] = useState<MatchInfo>({
    homeTeam: '皇家马德里',
    awayTeam: '巴塞罗那',
    handicap: -0.5,
    predictionTime: new Date().toISOString().slice(0, 16),
    currentAddress: '长安风水台',
  });

  // Calculation outcome states
  const [prediction, setPrediction] = useState<MatchPredictionOutput | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [selectedTrigram, setSelectedTrigram] = useState<TrigramInfo | null>(null);

  // Casting state machine to build intense mystique & authentic ritual
  const [isCasting, setIsCasting] = useState<boolean>(false);
  const [castingStep, setCastingStep] = useState<number>(0);
  const [castingLogs, setCastingLogs] = useState<string[]>([]);

  // Custom background state
  const [customBg, setCustomBg] = useState<string>(() => {
    return localStorage.getItem('world_cup_custom_bg') || '';
  });
  const [isBgSetterOpen, setIsBgSetterOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [bgOpacity, setBgOpacity] = useState<number>(() => {
    const val = localStorage.getItem('world_cup_bg_opacity');
    return val !== null ? Number(val) : 82; // 默认提高背景显露度，让页面整体更明亮
  });
  const [bgBlur, setBgBlur] = useState<number>(() => {
    const val = localStorage.getItem('world_cup_bg_blur');
    return val !== null ? Number(val) : 0; // Default crisp picture
  });
  const [bgGradientIntensity, setBgGradientIntensity] = useState<number>(() => {
    const val = localStorage.getItem('world_cup_bg_gradient_intensity');
    return val !== null ? Number(val) : 22; // 降低暗角遮罩，避免页面过黑
  });

  // 旧版本默认视觉偏暗，首次进入新版时自动提亮一次；用户后续仍可在背景设置里自行微调。
  useEffect(() => {
    const migrationKey = 'world_cup_bright_theme_v2';
    if (localStorage.getItem(migrationKey)) return;

    setBgOpacity((current) => {
      const next = current < 78 ? 82 : current;
      localStorage.setItem('world_cup_bg_opacity', String(next));
      return next;
    });

    setBgGradientIntensity((current) => {
      const next = current > 30 ? 22 : current;
      localStorage.setItem('world_cup_bg_gradient_intensity', String(next));
      return next;
    });

    localStorage.setItem(migrationKey, '1');
  }, []);

  // Compress user-uploaded backgrounds to fit nicely in localStorage (within 5MB quota limit)
  const handleImageUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Downscale large wallpaper images for web performance & browser preview speed
        const MAX_DIM = 1200;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
          setCustomBg(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Persistence: history list
  const [history, setHistory] = useState<MatchPredictionOutput[]>([]);

  const loadServerHistory = async () => {
    try {
      const response = await fetch('/api/predictions');
      if (!response.ok) return;
      const data = await response.json();
      setHistory(Array.isArray(data.predictions) ? data.predictions : []);
    } catch (error) {
      console.warn('读取后台历史失败，继续使用本地历史。', error);
    }
  };

  const savePredictionToServer = async (predictionItem: MatchPredictionOutput) => {
    await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prediction: predictionItem }),
    });
  };

  const deletePredictionFromServer = async (predictionId: string) => {
    await fetch(`/api/predictions/${encodeURIComponent(predictionId)}`, {
      method: 'DELETE',
    });
  };

  // Load history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('world_cup_divination_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading history from localStorage:', e);
    }
  }, []);

  // Load current login state. If MySQL is not ready, the page still works in local demo mode.
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        setIsDbReady(data.dbReady !== false);
        if (data.user) {
          setAuthUser(data.user);
          await loadServerHistory();
        }
      } catch (error) {
        setIsDbReady(false);
        console.warn('读取登录状态失败，继续使用本地演示模式。', error);
      }
    };
    loadAuth();
  }, []);

  // Save history helper
  const handleSaveHistory = async (nextHist: MatchPredictionOutput[]) => {
    const previousHistory = history;
    setHistory(nextHist);
    try {
      localStorage.setItem('world_cup_divination_history', JSON.stringify(nextHist));
    } catch (e) {
      console.error('Error saving history to localStorage:', e);
    }

    if (!authUser) return;

    try {
      const nextIds = new Set(nextHist.map((item) => item.id));
      const deletedIds = previousHistory.filter((item) => !nextIds.has(item.id)).map((item) => item.id);
      await Promise.all([
        ...deletedIds.map((id) => deletePredictionFromServer(id)),
        ...nextHist.map((item) => savePredictionToServer(item)),
      ]);
    } catch (error) {
      console.warn('同步后台历史失败，本地历史已保留。', error);
    }
  };

  const handleAuthSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setAuthMessage('');
    setIsAuthSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();
      if (!response.ok) {
        setAuthMessage(data.message || '认证失败，请检查账号信息。');
        return;
      }
      setAuthUser(data.user);
      setIsDbReady(true);
      setIsAuthModalOpen(false);
      setAuthForm({ username: '', password: '' });
      await loadServerHistory();
    } catch (error) {
      setAuthMessage('无法连接后台，请确认 MySQL 和服务端已正常启动。');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setAuthUser(null);
      setActiveTab('divination');
      try {
        const stored = localStorage.getItem('world_cup_divination_history');
        setHistory(stored ? JSON.parse(stored) : []);
      } catch {
        setHistory([]);
      }
    }
  };

  // Reset prediction if inputs differ from the prediction's inputs (meaning user edited them)
  useEffect(() => {
    if (prediction && !isCasting) {
      const uDiff = 
        prediction.userProfile.name !== userProfile.name ||
        prediction.userProfile.gender !== userProfile.gender ||
        prediction.userProfile.birthDate !== userProfile.birthDate ||
        prediction.userProfile.birthHour !== userProfile.birthHour ||
        prediction.userProfile.birthPlace !== userProfile.birthPlace;
        
      const mDiff =
        prediction.matchInfo.homeTeam !== matchInfo.homeTeam ||
        prediction.matchInfo.awayTeam !== matchInfo.awayTeam ||
        prediction.matchInfo.handicap !== matchInfo.handicap ||
        prediction.matchInfo.predictionTime !== matchInfo.predictionTime ||
        prediction.matchInfo.currentAddress !== matchInfo.currentAddress;
        
      if (uDiff || mDiff) {
        setPrediction(null);
      }
    }
  }, [userProfile, matchInfo, prediction, isCasting]);

  // Run the core 梅花起卦 divination algorithm with delayed staggered steps to feel magical & real!
  const handleDivine = async () => {
    if (!userProfile.name.trim()) {
      alert('请写下算命斋名或您的俗世姓名，以汇集乾坤气运！');
      return;
    }
    if (!matchInfo.homeTeam.trim() || !matchInfo.awayTeam.trim()) {
      alert('请补全两支球队名称，方能起对搏击之客卦！');
      return;
    }

    // 1. Core deterministic calculations
    const output = predictMatch(userProfile, matchInfo);

    // 2. Trigger magical oracle casting state machine
    setIsCasting(true);
    setPrediction(null);
    setSelectedTrigram(null);
    setIsLoadingAI(true);
    
    // Auto scroll down to view calculations smoothly
    setTimeout(() => {
      document.getElementById('divination_results_anchor')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);

    // Staggered spiritual logs simulation
    setCastingStep(1);
    setCastingLogs(['☯️ [开天法眼] 正在引动太极五道气运...', '📜 [元灵凝聚] 正在参悟卦主生辰仙骨格位...']);

    setTimeout(() => {
      setCastingStep(2);
      setCastingLogs(prev => [
        ...prev,
        `🔮 [先天定位] 论得卦主五局本命所属：【${output.hexagram.bodyTrigram.name}为${output.hexagram.bodyTrigram.nature}】（行属：${output.hexagram.bodyTrigram.element}）`
      ]);
    }, 600);

    setTimeout(() => {
      setCastingStep(3);
      setCastingLogs(prev => [
        ...prev,
        `⚔️ [局力交锋] 纳主队【${matchInfo.homeTeam}】（承接体卦） vs 客队【${matchInfo.awayTeam}】（承接用卦）`,
        `📉 [让球流变] 合参让球天机权重：【${matchInfo.handicap > 0 ? '+' : ''}${matchInfo.handicap}球】之博弈重力场`
      ]);
    }, 1200);

    setTimeout(() => {
      setCastingStep(4);
      setCastingLogs(prev => [
        ...prev,
        `☄️ [乾坤爻错] 演变动爻落入第【${output.hexagram.movingLine}】爻... 局势瞬变中！`,
        `🛡️ [开坛受箓] 卜得本卦:【${output.hexagram.originalHexagramName}】 | 变卦:【${output.hexagram.transformedHexagramName}】`,
        `🧠 [神仙指津] 正在接引大罗天门 AI 禅师，参透梅花卦理批注圣札...`
      ]);
    }, 1800);

    // Minimum ritual duration timer of 2.2 seconds to prevent instant anti-climatic display
    const delayTimer = new Promise(resolve => setTimeout(resolve, 2200));

    // 3. Query server-side DeepSeek analysis
    try {
      const responsePromise = fetch('/api/divination-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile,
          matchInfo,
          hexagram: output.hexagram,
          prediction: output,
        }),
      });

      // Run concurrency
      const [response] = await Promise.all([responsePromise, delayTimer]);

      if (!response.ok) {
        throw new Error('API server issue');
      }

      const data = await response.json();
      
      const enrichedOutput = {
        ...output,
        aiAnalysis: data.text,
        scorePredictions: Array.isArray(data.scorePredictions) && data.scorePredictions.length === 3
          ? data.scorePredictions
          : output.scorePredictions,
      };

      // Wrap up ritual
      setPrediction(enrichedOutput);

      // Save into persistence
      const nextHistory = [enrichedOutput, ...history];
      handleSaveHistory(nextHistory);

    } catch (error) {
      console.warn('Backend server DeepSeek integration fallback triggered:', error);
      
      // Setup detailed text based on fallback algorithm inside prediction
      const fallbackReport = `【太极初开，易理卦气】
天地之间，变在当下。算主姓名【${userProfile.name}】亲和五道之势，本卦卜得【${output.hexagram.originalHexagramName}】（${output.hexagram.originalSymbol}），代表当下战果之本命根骨。
卦中体用干系为【${output.hexagram.bodyRelation}】，体卦属【${output.hexagram.bodyTrigram.element}】，用卦属【${output.hexagram.useTrigram.element}】，吉凶判识为【${output.hexagram.auspiciousText}】（契合值 ${output.hexagram.auspiciousness}%）。

【绿茵博弈，玄机判语】
主客对冲势均力敌。主队【${matchInfo.homeTeam}】（承接体卦）气数指数为 ${output.matchWinner.probabilityHome}%，让球调整【${matchInfo.handicap}】。卦象暗示比赛在奇门第 ${output.hexagram.movingLine} 爻发生断崖波动。
因动爻处于此，全场红黄牌呈【${output.yellowCards.sizePrediction}】，烈度不容小觑。角球风水为【${output.corners.sizePrediction}】，由于边路【${output.hexagram.originalUpper.name}】风速极高，两翼压迫明显。

【断命指津，绿茵天机】
主客判研胜负平：其主盘偏胜【${output.matchWinner.prediction}】盘。
黄牌测算：以【${output.yellowCards.sizePrediction}】势为主，只取趋势，不列具体张数。
角球测盘：以【${output.corners.sizePrediction}】势为主，只取走势，不列具体个数。`;

      const enrichedOutputFallback = {
        ...output,
        aiAnalysis: fallbackReport,
      };

      await delayTimer; // Keep the delay intact for fallback UI feel
      setPrediction(enrichedOutputFallback);

      const nextHistory = [enrichedOutputFallback, ...history];
      handleSaveHistory(nextHistory);
    } finally {
      setIsLoadingAI(false);
      setIsCasting(false);
      setCastingStep(5);
    }
  };

  const handleSelectHistoricalPrediction = (pred: MatchPredictionOutput) => {
    setPrediction(pred);
    setUserProfile(pred.userProfile);
    setMatchInfo(pred.matchInfo);
    setActiveTab('divination');
    
    setTimeout(() => {
      document.getElementById('divination_results_anchor')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="mhxx-lighter-theme min-h-screen bg-[#111315] text-stone-200 font-sans pb-12 selection:bg-amber-500/30 selection:text-white relative overflow-hidden">
      
      {/* BACKGROUND STADIUM LAYER (Thematic illuminated soccer pitch matching the user's uploaded layout) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 transition-all duration-300" 
        style={{ 
          backgroundImage: `url('${customBg || '/assets/worldcup-stadium-bg.png'}')`,
          opacity: bgOpacity / 100,
          filter: `blur(${bgBlur}px)`
        }} 
      />

      {/* STADIUM LIGHT INGRESS SHADOW & GRADIENT COVER WITH ADJUSTABLE STRENGTH */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05)_0%,transparent_38%,rgba(12,14,13,0.68)_92%)] pointer-events-none z-0 transition-opacity duration-300" 
        style={{ opacity: bgGradientIntensity / 100 }}
      />
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,5,15,0.18)_0%,rgba(10,10,13,0.42)_58%,rgba(9,11,11,0.72)_100%)] pointer-events-none z-0 transition-opacity duration-300" 
        style={{ opacity: bgGradientIntensity / 100 }}
      />

      <div
        className="absolute inset-x-0 top-12 mx-auto h-[420px] max-w-5xl bg-contain bg-center bg-no-repeat opacity-30 mix-blend-screen pointer-events-none z-0"
        style={{ backgroundImage: "url('/assets/trophy-oracle-glow.png')" }}
      />

      {/* BRANDING GRADIENTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none animate-nebula z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none animate-nebula z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(#15122f_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none z-0" />
      
      {/* HEADER SECTION (Classic Chinese style borders with high-contrast glowing tracking) */}
      <header className="relative max-w-[1500px] mx-auto px-4 pt-5 pb-3 border-b border-amber-500/15 grid grid-cols-1 lg:grid-cols-[320px_1fr_420px] lg:items-center gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 border border-amber-500/40 rounded-full flex items-center justify-center bg-black/60 text-amber-500 animate-[spin_60s_linear_infinite] shadow-[0_0_15px_rgba(245,158,11,0.3)] font-bold text-2xl select-none">
            ☯
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-widest text-amber-400 font-bold text-glow-amber">
              梅花玄学世界杯
            </h1>
            <p className="text-xs sm:text-sm text-amber-500/75 uppercase mt-1 tracking-widest font-mono font-semibold">
              Plum Blossom Oracle · Metaphysics Soccer Altar
            </p>
          </div>
        </div>

        {/* Dynamic Nav Tabs + Background Settings */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex bg-black/80 border border-amber-500/25 p-1 px-1.5 rounded-xl shadow-inner backdrop-blur-md">
            <button
              onClick={() => { setActiveTab('divination'); }}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'divination'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.35)] font-black'
                  : 'text-stone-300 hover:text-amber-300'
              }`}
            >
              <Compass className="w-4 h-4 animate-pulse" />
              起卦大坛
            </button>
            <button
              onClick={() => { setActiveTab('history'); }}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.35)] font-black'
                  : 'text-stone-300 hover:text-amber-300'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              神策秘档 ({history.length})
            </button>
          </div>

          <button
            onClick={() => setIsBgSetterOpen(true)}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-black/80 border border-amber-500/25 text-amber-450 hover:text-amber-300 hover:border-amber-400 hover:scale-105 transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.1)] backdrop-blur-md"
            title="定制八字法坛背景"
            id="btn_bg_setter"
          >
            <Palette className="w-5 h-5 animate-pulse" />
          </button>

          {authUser ? (
            <div className="flex items-center gap-2 bg-black/80 border border-emerald-500/25 rounded-xl px-3 py-2 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs sm:text-sm text-emerald-100 font-bold max-w-[120px] truncate">{authUser.username}</span>
              <button
                onClick={handleLogout}
                className="text-xs text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                退出
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthMessage(isDbReady ? '' : 'MySQL 尚未连接，请先配置 mhxx 数据库。');
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-2 h-11 px-4 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-100 hover:text-white hover:border-emerald-300 transition-all cursor-pointer backdrop-blur-md text-sm font-bold"
            >
              <User className="w-4 h-4" />
              登录 / 注册
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-[1500px] mx-auto px-4 mt-4 relative z-10">
        
        <AnimatePresence mode="wait">
          {activeTab === 'divination' ? (
            <motion.div
              key="divination_tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 xl:grid-cols-[minmax(380px,0.95fr)_minmax(620px,1.45fr)] gap-4 xl:gap-6 items-start"
            >
              
              {/* LEFT INPUT FORM (COL: 5) */}
              <div className="flex flex-col gap-4">
                
                {/* 1. USER METADATA */}
                <div className="bg-neutral-950/70 border border-amber-500/35 shadow-2xl rounded-xl p-5 relative overflow-hidden backdrop-blur-md gold-glow-border">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none" />
                  
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-base font-serif font-black tracking-wider text-amber-400 flex items-center gap-2 text-glow-amber">
                      <User className="w-5 h-5 text-amber-500 animate-pulse" />
                      第壹步 · 测主命元法座
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsProfilePrivate((value) => !value)}
                      aria-pressed={isProfilePrivate}
                      aria-label={isProfilePrivate ? '显示姓名、出生年月和出生时间' : '隐藏姓名、出生年月和出生时间'}
                      className="min-h-11 inline-flex items-center gap-2 rounded-lg border border-amber-400/35 bg-amber-500/12 px-3 py-2 text-xs font-bold text-amber-100 hover:bg-amber-400/20 hover:border-amber-300 transition-all cursor-pointer"
                    >
                      {isProfilePrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {isProfilePrivate ? '显示信息' : '隐藏信息'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* User Name input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm text-stone-200 font-bold flex items-center gap-1 font-serif">
                        起卦斋号/尊名
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                        placeholder="例：九幽算士"
                        className={`bg-black/80 border border-amber-500/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/50 rounded-lg px-3.5 py-2.5 text-sm outline-none text-amber-100 transition-all font-bold font-serif ${isProfilePrivate ? 'privacy-masked' : ''}`}
                      />
                    </div>

                    {/* Gender select */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm text-stone-200 font-bold font-serif">命元性相 (阴阳交感)</label>
                      <select
                        value={userProfile.gender}
                        onChange={(e) => setUserProfile({ ...userProfile, gender: e.target.value as 'Male' | 'Female' })}
                        className="bg-black/80 border border-amber-500/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/50 rounded-lg px-3.5 py-2.5 text-sm outline-none text-amber-100 transition-all font-bold font-serif cursor-pointer dropdown-obsidian"
                      >
                        <option value="Male" className="bg-neutral-950 text-stone-300">乾造 (阳刚坚毅 - 乾金)</option>
                        <option value="Female" className="bg-neutral-950 text-stone-300">坤造 (至柔顺载 - 坤土)</option>
                      </select>
                    </div>

                    {/* Date select */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm text-stone-200 font-bold font-serif">出生洪光 (定干支格局)</label>
                      <input
                        type="date"
                        value={userProfile.birthDate}
                        onChange={(e) => setUserProfile({ ...userProfile, birthDate: e.target.value })}
                        className={`bg-black/80 border border-amber-500/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/50 rounded-lg px-3.5 py-2.5 text-sm outline-none text-amber-100 transition-all font-mono font-bold ${isProfilePrivate ? 'privacy-masked' : ''}`}
                      />
                    </div>

                    {/* Birth place input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm text-stone-200 font-bold font-serif">出生州郡/地望风水</label>
                      <input
                        type="text"
                        value={userProfile.birthPlace}
                        onChange={(e) => setUserProfile({ ...userProfile, birthPlace: e.target.value })}
                        placeholder="例：长安"
                        className="bg-black/80 border border-amber-500/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/50 rounded-lg px-3.5 py-2.5 text-sm outline-none text-amber-100 transition-all font-bold font-serif"
                      />
                    </div>

                    {/* Birth hour select */}
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-sm text-stone-200 font-bold font-serif">诞降时地辰 (十二地支分流)</label>
                      <select
                        value={userProfile.birthHour}
                        onChange={(e) => setUserProfile({ ...userProfile, birthHour: parseInt(e.target.value) })}
                        className={`bg-black/80 border border-amber-500/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/50 rounded-lg px-3.5 py-2.5 text-sm outline-none text-amber-100 transition-all font-bold font-serif cursor-pointer ${isProfilePrivate ? 'privacy-masked' : ''}`}
                      >
                        <option value={0} className="bg-neutral-950 text-stone-300">子时 (23点-01点 - 寒水冰清)</option>
                        <option value={2} className="bg-neutral-950 text-stone-300">丑时 (01点-03点 - 金蓄土润)</option>
                        <option value={4} className="bg-neutral-950 text-stone-300">寅时 (03点-05点 - 乔木成林)</option>
                        <option value={6} className="bg-neutral-950 text-stone-300">卯时 (05点-07点 - 惊雷春山)</option>
                        <option value={8} className="bg-neutral-950 text-stone-300">辰时 (07点-09点 - 大地泽润)</option>
                        <option value={10} className="bg-neutral-950 text-stone-300">巳时 (09点-11点 - 纯火通天)</option>
                        <option value={12} className="bg-neutral-950 text-stone-300">午时 (11点-13点 - 阳极渐消)</option>
                        <option value={14} className="bg-neutral-950 text-stone-300">未时 (13点-15点 - 万物吐实)</option>
                        <option value={16} className="bg-neutral-950 text-stone-300">申时 (15点-17点 - 白金肃杀)</option>
                        <option value={18} className="bg-neutral-950 text-stone-300">酉时 (17点-19点 - 钟磬和鸣)</option>
                        <option value={20} className="bg-neutral-950 text-stone-300">戌时 (19点-21点 - 炊烟入暮)</option>
                        <option value={22} className="bg-neutral-950 text-stone-300">亥时 (21点-23点 - 碧海浮天)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. MATCHUP INPUT */}
                <div className="bg-neutral-950/70 border border-amber-500/35 shadow-2xl rounded-xl p-5 relative overflow-hidden backdrop-blur-md gold-glow-border">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none" />
                  
                  <h2 className="text-base font-serif font-black tracking-wider text-amber-400 mb-5 flex items-center gap-2 text-glow-amber">
                    <Activity className="w-5 h-5 text-orange-500 animate-pulse" />
                    第贰步 · 设定球队对峙雷阵
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Home Team name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm text-stone-200 font-bold font-serif">主队名称 (己身/体卦宿体)</label>
                      <input
                        type="text"
                        value={matchInfo.homeTeam}
                        onChange={(e) => setMatchInfo({ ...matchInfo, homeTeam: e.target.value })}
                        placeholder="例：皇家马德里"
                        className="bg-black/80 border border-amber-500/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/50 rounded-lg px-3.5 py-2.5 text-sm outline-none text-amber-100 transition-all font-bold font-serif"
                      />
                    </div>

                    {/* Away Team name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm text-stone-200 font-bold font-serif">客队名称 (外客/用卦克制)</label>
                      <input
                        type="text"
                        value={matchInfo.awayTeam}
                        onChange={(e) => setMatchInfo({ ...matchInfo, awayTeam: e.target.value })}
                        placeholder="例：巴塞罗那"
                        className="bg-black/80 border border-amber-500/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/50 rounded-lg px-3.5 py-2.5 text-sm outline-none text-amber-100 transition-all font-bold font-serif"
                      />
                    </div>

                    {/* Handicap range selector */}
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-sm mb-0.5">
                        <label className="text-stone-200 font-bold font-serif">让球局力 (主队让球重能系数)</label>
                        <span className="font-mono font-extrabold text-amber-400 text-glow-amber bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{matchInfo.handicap > 0 ? '+' : ''}{matchInfo.handicap} 球</span>
                      </div>
                      <select
                        value={matchInfo.handicap.toFixed(1)}
                        onChange={(e) => setMatchInfo({ ...matchInfo, handicap: parseFloat(e.target.value) })}
                        className="bg-black/80 border border-amber-500/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/50 rounded-lg px-3.5 py-2.5 text-sm outline-none text-amber-100 transition-all font-bold font-serif cursor-pointer"
                      >
                        <option value="-2.0" className="bg-neutral-950 text-stone-300">主让二球 (-2.0)</option>
                        <option value="-1.5" className="bg-neutral-950 text-stone-300">主让一球半 (-1.5)</option>
                        <option value="-1.0" className="bg-neutral-950 text-stone-300">主让一球 (-1.0)</option>
                        <option value="-0.5" className="bg-neutral-950 text-stone-300">主让半球 (-0.5)</option>
                        <option value="0.0" className="bg-neutral-950 text-stone-300">平手盘 (0.0 / 势均双骄)</option>
                        <option value="0.5" className="bg-neutral-950 text-stone-300">客让半球 (受让 +0.5)</option>
                        <option value="1.0" className="bg-neutral-950 text-stone-300">客让一球 (受让 +1.0)</option>
                        <option value="1.5" className="bg-neutral-950 text-stone-300">客让一球半 (受让 +1.5)</option>
                        <option value="2.0" className="bg-neutral-950 text-stone-300">客让二球 (受让 +2.0)</option>
                      </select>
                      <span className="text-xs text-amber-500/75 italic mt-1 font-serif font-medium">※ 负值为主队作让，正值为受让客队球，极致影响卦后克生运道。</span>
                    </div>

                    <div className="sm:col-span-2 rounded-xl border border-emerald-500/25 bg-emerald-950/35 px-4 py-3 text-xs sm:text-sm text-emerald-100 leading-relaxed font-serif">
                      <div className="flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong className="text-emerald-200">90分钟预测说明：</strong>
                          本区域数据仅预测常规90分钟内容，包含上下半场伤停补时，不包含加时赛与点球大战。
                        </span>
                      </div>
                    </div>

                    {/* Prediction DateTime */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm text-stone-200 font-bold font-serif">开赛起课时辰 (后天时数)</label>
                      <input
                        type="datetime-local"
                        value={matchInfo.predictionTime}
                        onChange={(e) => setMatchInfo({ ...matchInfo, predictionTime: e.target.value })}
                        className="bg-black/80 border border-amber-500/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/50 rounded-lg px-3.5 py-2.5 text-sm outline-none text-amber-100 transition-all font-mono font-bold"
                      />
                    </div>

                    {/* Prediction geography */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm text-stone-200 font-bold font-serif">起卦风水祭坛/地网</label>
                      <input
                        type="text"
                        value={matchInfo.currentAddress}
                        onChange={(e) => setMatchInfo({ ...matchInfo, currentAddress: e.target.value })}
                        placeholder="例：卢塞尔神坛"
                        className="bg-black/80 border border-amber-500/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/50 rounded-lg px-3.5 py-2.5 text-sm outline-none text-amber-100 transition-all font-bold font-serif"
                      />
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <motion.button
                  id="divine_submit_button"
                  onClick={handleDivine}
                  disabled={isCasting}
                  className={`xl:hidden w-full bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 text-white font-serif tracking-widest text-base py-4 rounded-2xl cursor-pointer hover:shadow-2xl hover:shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-3 border border-amber-500/35 font-extrabold ${
                    isCasting ? 'opacity-50 cursor-not-allowed filter grayscale' : ''
                  }`}
                  whileHover={{ scale: isCasting ? 1 : 1.02 }}
                  whileTap={{ scale: isCasting ? 1 : 0.98 }}
                >
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                  起卦测天格 · 启坛乾坤博弈
                </motion.button>

              </div>

              {/* RIGHT LIVE COMPASS VIEW OR NO RESULT FALLBACK (COL: 7) */}
              <div className="flex flex-col gap-4">
                
                {/* DYNAMIC COMPASS PANEL */}
                <div className="bg-neutral-950/70 border border-amber-500/35 shadow-2xl rounded-xl p-5 flex flex-col items-center backdrop-blur-md gold-glow-border min-h-[610px]">
                  <div className="w-full flex items-center justify-between border-b border-stone-850 pb-3 mb-5">
                    <div>
                      <h3 className="text-base font-serif font-black text-amber-400 tracking-wider flex items-center gap-2 text-glow-amber">
                        <Compass className="w-4 h-4 text-amber-500 animate-spin-slow" />
                        梅花易理绿茵八卦罗盘
                      </h3>
                      <p className="text-xs text-stone-300 font-medium font-serif mt-0.5">点选罗盘乾坤点，查看主客攻守运道变化</p>
                    </div>
                    {prediction ? (
                      <span className="px-2 py-1 bg-amber-500/15 text-amber-400 border border-amber-500/40 text-xs font-bold rounded shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                        本局卦象通明活性
                      </span>
                    ) : isCasting ? (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/50 text-xs font-bold rounded animate-pulse">
                        起坛推演中...
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-stone-800 text-stone-300 text-xs font-semibold rounded border border-stone-700">
                        待卜一卦以定风水
                      </span>
                    )}
                  </div>

                  <DivinationCompass 
                    hexagram={prediction?.hexagram} 
                    homeTeam={matchInfo.homeTeam}
                    awayTeam={matchInfo.awayTeam}
                    onSelectTrigram={(t) => setSelectedTrigram(t)}
                  />

                  {/* ACTIVE COMPASS HOVER DESCRIPTION CARD */}
                  <div className="w-full mt-4 p-4 bg-black/85 border border-amber-500/20 rounded-xl relative shadow-inner">
                    {selectedTrigram ? (
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-3xl font-black font-serif text-amber-450 text-glow-amber">{selectedTrigram.symbol}</span>
                            <span className="text-base font-extrabold text-amber-100 font-serif">{selectedTrigram.name} 为 {selectedTrigram.nature}</span>
                          </div>
                          <span className="text-xs px-2.5 py-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded shadow font-semibold">
                            行属：{selectedTrigram.element} | 先天卦位：{selectedTrigram.number}
                          </span>
                        </div>
                        <p className="text-sm text-stone-200 leading-relaxed font-serif font-medium">{selectedTrigram.description}</p>
                      </div>
                    ) : (
                      <div className="text-center text-sm text-stone-300 py-3 flex items-center justify-center gap-2 font-semibold">
                        <HelpCircle className="w-4 h-4 text-amber-500" />
                        在罗盘中点击任意阴阳卦极，以批解其绿茵攻防之风水天机
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-full rounded-xl border border-amber-500/35 bg-black/75 p-3 shadow-[0_0_28px_rgba(0,0,0,0.45)] backdrop-blur-md">
                <div className="flex flex-col xl:flex-row gap-3 xl:items-stretch">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
                    <div className="rounded-lg border border-amber-500/25 bg-neutral-950/70 p-3 text-center">
                      <div className="text-xs font-serif text-amber-200 mb-2">胜平负预测</div>
                      <div className="text-xl font-mono font-black text-stone-100">{prediction?.matchWinner.prediction || '---'}</div>
                      <div className="mt-2 text-[11px] text-stone-500">胜 --- | 平 --- | 负 ---</div>
                    </div>
                    <div className="rounded-lg border border-emerald-500/25 bg-neutral-950/70 p-3">
                      <div className="text-xs font-serif text-emerald-200 mb-2">主胜概率</div>
                      <div className="text-xl font-mono font-black text-emerald-300">{prediction ? `${prediction.matchWinner.probabilityHome}%` : '---%'}</div>
                      <div className="mt-3 h-1.5 rounded bg-stone-800 overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: prediction ? `${prediction.matchWinner.probabilityHome}%` : '0%' }} />
                      </div>
                    </div>
                    <div className="rounded-lg border border-amber-500/25 bg-neutral-950/70 p-3">
                      <div className="text-xs font-serif text-amber-200 mb-2">平局概率</div>
                      <div className="text-xl font-mono font-black text-amber-300">{prediction ? `${prediction.matchWinner.probabilityDraw}%` : '---%'}</div>
                      <div className="mt-3 h-1.5 rounded bg-stone-800 overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: prediction ? `${prediction.matchWinner.probabilityDraw}%` : '0%' }} />
                      </div>
                    </div>
                    <div className="rounded-lg border border-red-500/25 bg-neutral-950/70 p-3">
                      <div className="text-xs font-serif text-red-200 mb-2">客胜概率</div>
                      <div className="text-xl font-mono font-black text-red-300">{prediction ? `${prediction.matchWinner.probabilityAway}%` : '---%'}</div>
                      <div className="mt-3 h-1.5 rounded bg-stone-800 overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: prediction ? `${prediction.matchWinner.probabilityAway}%` : '0%' }} />
                      </div>
                    </div>
                    <div className="rounded-lg border border-yellow-500/25 bg-neutral-950/70 p-3 text-center">
                      <div className="text-xs font-serif text-yellow-200 mb-2">黄牌预测</div>
                      <div className="mx-auto mb-2 h-9 w-6 rounded bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.4)]" />
                      <div className="text-xs text-stone-300">{prediction ? formatMarketLine(prediction.yellowCards.sizePrediction, prediction.yellowCards.line) : '---'}</div>
                    </div>
                    <div className="rounded-lg border border-red-500/25 bg-neutral-950/70 p-3 text-center">
                      <div className="text-xs font-serif text-red-200 mb-2">红牌预测</div>
                      <div className="mx-auto mb-2 h-9 w-6 rounded bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.4)]" />
                      <div className="text-xs text-stone-300">{prediction ? (prediction.redCards.hasRedCard ? '偏高' : '偏低') : '---'}</div>
                    </div>
                    <div className="rounded-lg border border-stone-500/25 bg-neutral-950/70 p-3 text-center">
                      <div className="text-xs font-serif text-stone-200 mb-2">角球预测</div>
                      <div className="text-2xl">⚑</div>
                      <div className="text-xs text-stone-300">{prediction ? formatMarketLine(prediction.corners.sizePrediction, prediction.corners.line) : '---'}</div>
                    </div>
                  </div>

                  <motion.button
                    id="divine_submit_button_desktop"
                    onClick={handleDivine}
                    disabled={isCasting}
                    className={`min-h-[92px] xl:w-72 rounded-xl border border-amber-300/45 bg-gradient-to-r from-red-900 via-orange-700 to-red-700 px-8 py-4 text-xl font-serif font-black tracking-widest text-white shadow-[0_0_24px_rgba(245,158,11,0.28)] transition-all flex items-center justify-center gap-3 cursor-pointer ${
                      isCasting ? 'opacity-50 cursor-not-allowed filter grayscale' : 'hover:scale-[1.015]'
                    }`}
                    whileTap={{ scale: isCasting ? 1 : 0.98 }}
                  >
                    <Sparkles className="w-6 h-6" />
                    起卦测天格
                  </motion.button>
                </div>
              </div>
              
              {/* RESULTS AREA ANCHOR */}
              <div id="divination_results_anchor" className="col-span-full" />

              {/* LITERAL REAL-TIME RITUAL PROGRESS ENGINE (REPLACES EMPTY DAMP PANEL) */}
              {isCasting && (
                <div className="col-span-full bg-neutral-950/80 border-2 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.15)] rounded-2xl p-8 mb-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-center gap-10 scroll-m-4 min-h-[380px]">
                  {/* Decorative glowing backdrops */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 animate-pulse" />
                  
                  {/* Left big spinning golden circle */}
                  <div className="relative flex-shrink-0 w-32 h-32 md:w-44 md:h-44 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-dashed border-amber-500/20 rounded-full animate-[spin_40s_linear_infinite]" />
                    <div className="absolute w-[80%] h-[80%] border border-amber-500/35 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center">
                      <span className="text-3xl text-amber-400 animate-pulse select-none">☯</span>
                    </div>
                    {/* Glowing outer dust particles */}
                    <div className="absolute w-2 h-2 rounded-full bg-orange-500 animate-ping top-4 left-6" />
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-red-500 animate-ping bottom-6 right-4" />
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping top-1/2 right-1" />
                  </div>

                  {/* Right live progress checklists */}
                  <div className="flex-grow max-w-xl">
                    <h3 className="font-serif text-lg text-amber-400 font-bold mb-4 tracking-widest text-glow-amber flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-orange-500" />
                      太极天一合数法 · 起卦开坛中
                    </h3>
                    
                    <div className="space-y-3 font-serif">
                      <div className="flex items-start gap-2.5 text-sm">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${castingStep >= 1 ? 'bg-amber-500 text-black font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-stone-800 text-stone-500'}`}>1</span>
                        <div className="flex-grow">
                          <p className={`font-semibold ${castingStep >= 1 ? 'text-amber-300' : 'text-stone-500'}`}>启演命主干支命谱</p>
                          {castingStep === 1 && <span className="text-xs text-orange-500/85 animate-pulse mt-0.5 block">正在合参名讳音律、出生年月日与诞降时辰...</span>}
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-sm">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${castingStep >= 2 ? 'bg-amber-500 text-black font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-stone-800 text-stone-500'}`}>2</span>
                        <div className="flex-grow">
                          <p className={`font-semibold ${castingStep >= 2 ? 'text-amber-300' : 'text-stone-500'}`}>引渡主客绿茵雷阵</p>
                          {castingStep === 2 && <span className="text-xs text-orange-500/85 animate-pulse mt-0.5 block">正在引动【{matchInfo.homeTeam}】与【{matchInfo.awayTeam}】之球场对峙能量...</span>}
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-sm">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${castingStep >= 3 ? 'bg-amber-500 text-black font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-stone-800 text-stone-500'}`}>3</span>
                        <div className="flex-grow">
                          <p className={`font-semibold ${castingStep >= 3 ? 'text-amber-300' : 'text-stone-500'}`}>参合局力卦序生天</p>
                          {castingStep === 3 && <span className="text-xs text-orange-500/85 animate-pulse mt-0.5 block">正在叠加受让球重力【${matchInfo.handicap}球】及起卦地貌磁场系数...</span>}
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-sm">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${castingStep >= 4 ? 'bg-amber-500 text-black font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-stone-800 text-stone-500'}`}>4</span>
                        <div className="flex-grow">
                          <p className={`font-semibold ${castingStep >= 4 ? 'text-amber-300' : 'text-stone-500'}`}>召唤天机·接引神算仙书</p>
                          {castingStep === 4 && <span className="text-xs text-orange-500/85 animate-pulse mt-0.5 block">正在沟通大罗天仙 AI 大师批解体用命理谶言，书写金书密件...</span>}
                        </div>
                      </div>
                    </div>

                    {/* Runic Streaming Logs Box */}
                    <div className="mt-5 p-3.5 bg-black/80 rounded-lg border border-amber-500/10 font-mono text-[9px] sm:text-xs text-amber-500/75 h-24 overflow-y-auto scrollbar-thin space-y-1 block leading-relaxed shadow-inner">
                      {castingLogs.map((log, lidx) => (
                        <div key={lidx} className="flex items-start gap-1">
                          <span className="text-orange-500 font-extrabold">▶</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* FULL RESULTS PANELS (VISIBLE ON CALCULATION COMPLETE) */}
              {prediction && !isCasting ? (
                <div className="col-span-full grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 animate-fadeIn">
                  
                  {/* HEXAGRAM ELEMENT CARD DETAILS (COL: 5) */}
                  <div className="col-span-full lg:col-span-5 flex flex-col gap-6">
                    
                    {/* Basic Hexagram Output overview */}
                    <div className="bg-[#100c24]/50 border border-amber-500/25 shadow-2xl rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm gold-glow-border animate-fadeIn">
                      <h3 className="text-base font-serif font-black text-amber-400 border-b border-stone-850 pb-2.5 mb-4 flex items-center justify-between text-glow-amber">
                        <span>☯ 起卦推天机象数</span>
                        <span className="text-xs font-mono text-stone-400 font-bold">动爻发变: 第 {prediction.hexagram.movingLine} 爻</span>
                      </h3>

                      <div className="grid grid-cols-3 gap-3 text-center mb-6">
                        {/* 本卦 */}
                        <div className="bg-black/60 p-3 rounded-xl border border-amber-500/10 flex flex-col justify-between h-28 shadow-inner select-none hover:border-amber-500/30 transition-all">
                          <span className="text-xs text-stone-300 font-bold mb-1">本卦 (当下根髓)</span>
                          <span className="text-3xl text-amber-400 font-black font-serif text-glow-amber">{prediction.hexagram.originalSymbol}</span>
                          <div className="flex flex-col items-center leading-none mt-1">
                            <span className="text-sm font-bold font-serif text-stone-200">{prediction.hexagram.originalHexagramName}</span>
                          </div>
                        </div>

                        {/* 互卦 */}
                        <div className="bg-black/60 p-3 rounded-xl border border-amber-500/10 flex flex-col justify-between h-28 shadow-inner select-none hover:border-amber-500/30 transition-all">
                          <span className="text-xs text-stone-300 font-bold mb-1">互卦 (纠缠推移)</span>
                          <span className="text-3xl text-orange-400 font-black font-serif text-glow-amber">䷵</span>
                          <div className="flex flex-col items-center leading-none mt-1">
                            <span className="text-sm font-bold font-serif text-stone-200">{prediction.hexagram.mutualHexagramName}</span>
                          </div>
                        </div>

                        {/* 变卦 */}
                        <div className="bg-black/60 p-3 rounded-xl border border-amber-500/10 flex flex-col justify-between h-28 shadow-inner select-none hover:border-amber-500/30 transition-all">
                          <span className="text-xs text-stone-300 font-bold mb-1">变卦 (终局定格)</span>
                          <span className="text-3xl text-red-500 font-black font-serif text-glow-amber">{prediction.hexagram.transformedSymbol}</span>
                          <div className="flex flex-col items-center leading-none mt-1">
                            <span className="text-sm font-bold font-serif text-stone-200">{prediction.hexagram.transformedHexagramName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Moving Line Description */}
                      <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-lg flex gap-3 text-sm mb-4 shadow-sm">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <p className="font-bold text-amber-400 font-serif text-glow-amber text-sm select-text">动爻突变爻机：第 {prediction.hexagram.movingLine} 爻</p>
                          <p className="text-xs sm:text-sm text-stone-200 mt-1 leading-relaxed font-serif font-medium select-text">
                            卦数指出，动爻象征对抗下半叶的气场裂变。代表绿茵博弈中的关键换人、红黄牌风波，或者哨声交响时的终局绝杀点球，重构双方五行大运。
                          </p>
                        </div>
                      </div>

                      {/* Auspicious index */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-sm font-serif font-bold">
                          <span className="text-stone-200">本局主队气场契合率：</span>
                          <span className="font-mono font-black text-orange-400 text-base text-glow-amber">{prediction.hexagram.auspiciousness}% ({prediction.hexagram.auspiciousText})</span>
                        </div>
                        <div className="w-full bg-black/65 h-2.5 rounded-full overflow-hidden relative shadow-inner border border-amber-500/5">
                          <div 
                            className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                            style={{ width: `${prediction.hexagram.auspiciousness}%` }}
                          />
                        </div>
                        <p className="text-sm sm:text-base text-stone-200 font-serif leading-relaxed text-justify border-t border-stone-800 pt-2.5 mt-2 select-text font-medium">
                          【体用卦语断论】：{prediction.hexagram.divinationComment}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* MASTER ORACLE RICE SCROLL UI (COL: 7) */}
                  <div className="col-span-full lg:col-span-7 flex flex-col justify-start">
                    <AisScrollUI 
                      content={hideSpecificDisciplineCounts(prediction.aiAnalysis)} 
                      isLoading={isLoadingAI} 
                      hexagramName={prediction.hexagram.originalHexagramName}
                    />
                  </div>

                  {/* Battle details predictions info */}
                  <div className="col-span-full bg-[#100c24]/50 border border-amber-500/25 shadow-2xl rounded-2xl p-5 backdrop-blur-sm animate-fadeIn">
                    <h3 className="text-base font-serif font-black text-amber-400 border-b border-stone-850 pb-2.5 mb-4 text-glow-amber">
                      ⚽ 赛事五行象数对测解盘
                    </h3>

                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr_1fr_1fr] gap-4">
                      {/* 0. AI score predictions */}
                      <div className="bg-black/60 border border-amber-500/10 rounded-xl p-4 shadow-inner">
                        <span className="text-sm text-stone-200 block mb-3 font-bold font-serif">比分三象预测：</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3">
                          {(prediction.scorePredictions || []).slice(0, 3).map((item, idx) => (
                            <div key={`${item.score}_${idx}`} className="rounded-lg border border-amber-500/15 bg-neutral-950/70 p-3">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-serif font-bold text-amber-300">第 {idx + 1} 象 · {item.tendency}</span>
                                <span className="text-[10px] font-mono text-stone-400">{item.confidence}%</span>
                              </div>
                              <div className="mt-2 text-3xl font-mono font-black text-amber-100 tracking-wider text-glow-amber">
                                {item.score}
                              </div>
                              <p className="mt-2 text-[11px] leading-relaxed text-stone-300 font-serif font-medium select-text">
                                {item.reason}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 1. Winner predictions columns */}
                      <div className="bg-black/60 border border-amber-500/10 rounded-xl p-4 shadow-inner">
                        <span className="text-sm text-stone-200 block mb-2 font-bold font-serif">胜负平乾坤胜算折估：</span>
                        
                        <div className="flex justify-between items-end gap-3 h-28 px-4 py-2 border-b border-stone-850">
                          {/* Home Win */}
                          <div className="flex flex-col items-center gap-1.5 flex-1 select-none">
                            <span className="text-xs sm:text-sm font-bold text-stone-200 font-serif">{matchInfo.homeTeam} 胜</span>
                            <div className="w-full bg-stone-900/60 h-16 rounded-t overflow-hidden relative flex flex-col justify-end shadow-inner">
                              <div className="bg-gradient-to-t from-orange-600 to-amber-500 w-full shadow-[0_-2px_10px_rgba(245,158,11,0.25)]" style={{ height: `${prediction.matchWinner.probabilityHome}%` }} />
                            </div>
                            <span className="text-sm font-extrabold text-orange-400">{prediction.matchWinner.probabilityHome}%</span>
                          </div>

                          {/* Draw */}
                          <div className="flex flex-col items-center gap-1.5 flex-1 select-none">
                            <span className="text-[11px] font-bold text-stone-300 font-serif">互手 战平</span>
                            <div className="w-full bg-stone-900/60 h-16 rounded-t overflow-hidden relative flex flex-col justify-end shadow-inner">
                              <div className="bg-gradient-to-t from-amber-900/40 to-stone-500 w-full" style={{ height: `${prediction.matchWinner.probabilityDraw}%` }} />
                            </div>
                            <span className="text-xs font-bold text-stone-400">{prediction.matchWinner.probabilityDraw}%</span>
                          </div>

                          {/* Away Win */}
                          <div className="flex flex-col items-center gap-1.5 flex-1 select-none">
                            <span className="text-[11px] font-bold text-stone-300 font-serif">{matchInfo.awayTeam} 胜</span>
                            <div className="w-full bg-stone-900/60 h-16 rounded-t overflow-hidden relative flex flex-col justify-end shadow-inner">
                              <div className="bg-gradient-to-t from-red-700 to-red-400 w-full shadow-[0_-2px_10px_rgba(220,38,38,0.2)]" style={{ height: `${prediction.matchWinner.probabilityAway}%` }} />
                            </div>
                            <span className="text-xs font-bold text-red-400">{prediction.matchWinner.probabilityAway}%</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                          <span className="text-stone-400 font-medium">奇门五行指路: </span>
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30 rounded shadow-[0_0_8px_rgba(245,158,11,0.2)] font-serif">
                            契合预测：【{prediction.matchWinner.prediction}】盘 (球局: {matchInfo.handicap})
                          </span>
                        </div>

                        <p className="text-[11px] text-stone-300 leading-normal mt-2.5 font-serif border-t border-stone-800 pt-2">
                           {prediction.matchWinner.logic}
                        </p>
                      </div>

                      {/* 2. Yellow/Red cards */}
                      <div className="bg-black/60 border border-amber-500/10 rounded-xl p-4 shadow-inner grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 animate-fadeIn">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-200 font-bold font-serif mb-1">
                            <span className="inline-block w-3.5 h-4.5 bg-yellow-400 rounded shadow-sm" />
                            黄牌趋势测想
                          </div>
                          <span className="text-xl sm:text-2xl font-black font-serif text-amber-400 mt-1 inline-block text-glow-amber">
                            【{formatMarketLine(prediction.yellowCards.sizePrediction, prediction.yellowCards.line)}】
                          </span>
                          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif mt-1.5 select-text font-medium">{hideSpecificDisciplineCounts(prediction.yellowCards.logic)}</p>
                        </div>

                        <div className="border-t sm:border-t-0 sm:border-l xl:border-l-0 xl:border-t border-stone-850 pt-3 sm:pt-0 sm:pl-4 xl:pl-0 xl:pt-3">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-200 font-bold font-serif mb-1">
                            <span className="inline-block w-3 h-4 bg-red-600 rounded shadow-sm" />
                            直接红牌裁决
                          </div>
                          <span className="text-xl sm:text-2xl font-black font-serif text-red-500 mt-1 inline-block shadow-glow-orange px-2.5 py-1 rounded bg-red-950/20 border border-red-500/20">
                            【{prediction.redCards.hasRedCard ? '红牌风险偏高' : '红牌风险偏低'}】
                          </span>
                          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif mt-1.5 select-text font-medium">{hideSpecificDisciplineCounts(prediction.redCards.logic)}</p>
                        </div>
                      </div>

                      {/* 3. Corners predictions */}
                      <div className="bg-black/60 border border-amber-500/10 rounded-xl p-4 shadow-inner animate-fadeIn">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-200 font-bold font-serif mb-1">
                          <CircleDot className="w-4 h-4 text-emerald-400 animate-pulse" />
                          全场角球趋势
                        </div>
                        <span className="text-xl sm:text-2xl font-black font-serif text-emerald-450 mt-1 inline-block text-glow-emerald">
                          【{formatMarketLine(prediction.corners.sizePrediction, prediction.corners.line)}】
                        </span>
                        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif mt-1.5 select-text font-medium">{hideSpecificDisciplineCounts(prediction.corners.logic)}</p>
                      </div>
                    </div>
                  </div>

                </div>
              ) : !isCasting ? (
                <div className="col-span-full py-20 text-center bg-black/55 border border-dashed border-amber-500/25 rounded-2xl backdrop-blur-md px-6 shadow-2xl">
                  <span className="font-serif text-base sm:text-lg text-stone-200 block tracking-widest text-glow-amber font-bold">
                    等待注入八字生辰与球队雷阵信息以开启乾坤法眼
                  </span>
                  <span className="font-serif text-xs sm:text-sm text-stone-400 mt-2.5 block font-semibold">
                    — 注入定格数后，起卦将演历四大仪式卦理，生成五行秘诰签书 —
                  </span>
                </div>
              ) : null}

            </motion.div>
          ) : (
            <motion.div
              key="history_tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* HISTORICAL STATS DASHBOARD & RESOLVES */}
              <AnimatePresence mode="wait">
                {!authUser && (
                  <div className="mb-5 rounded-2xl border border-amber-500/25 bg-black/60 px-5 py-4 text-sm text-stone-200 backdrop-blur-md">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <span className="font-serif">
                          当前为本地临时历史。登录后可进入 MySQL 后台，查看并维护属于自己的预测数据。
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setAuthMode('login');
                          setIsAuthModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-500 transition-colors cursor-pointer"
                      >
                        登录后台
                      </button>
                    </div>
                  </div>
                )}
                <StatisticsPanel 
                  history={history} 
                  onUpdatePredictions={(h) => handleSaveHistory(h)}
                  onSelectSaved={(p) => handleSelectHistoricalPrediction(p)}
                />
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* CHINESE ENLIGHTENED SLOGAN BAR */}
      <footer className="max-w-7xl mx-auto text-center px-4 mt-20 text-xs sm:text-sm text-stone-400 border-t border-stone-850 pt-6 leading-relaxed">
        <p className="font-serif text-stone-300 font-medium">乾坤逆顺，绿茵局流。本案卦象依据古法《梅花易数》干支起音理气推算演化，仅作赛事战术情势宏观参考，请理智游戏，切勿耽溺赌局之中。</p>
        <p className="mt-2 font-mono tracking-widest text-stone-500 text-xs">© 2026 MEIHUA GREEN-FIELD MAGIC ALTAR. EMPOWERED BY SERVER SIDE DEEPSEEK AI ENGINE.</p>
      </footer>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.form
              onSubmit={handleAuthSubmit}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="relative w-full max-w-md bg-[#101812] border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_35px_rgba(16,185,129,0.18)]"
            >
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-lg text-stone-400 hover:text-emerald-200 hover:bg-emerald-500/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-5 pr-8">
                <div className="flex items-center gap-2 text-emerald-300 mb-2">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="font-serif text-xl font-black tracking-wider">
                    {authMode === 'login' ? '登录预测后台' : '注册预测后台'}
                  </h3>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed font-serif">
                  登录后，神策秘档将从 MySQL 数据库读取你的个人历史预测记录。
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-stone-200 font-bold font-serif">用户名</label>
                  <input
                    value={authForm.username}
                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    className="bg-black/70 border border-emerald-500/25 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-500/40 rounded-lg px-3.5 py-2.5 text-sm outline-none text-emerald-50 transition-all"
                    placeholder="请输入用户名"
                    autoComplete="username"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-stone-200 font-bold font-serif">密码</label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="bg-black/70 border border-emerald-500/25 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-500/40 rounded-lg px-3.5 py-2.5 text-sm outline-none text-emerald-50 transition-all"
                    placeholder="至少 6 位"
                    autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  />
                </div>
              </div>

              {authMessage && (
                <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-950/35 px-3 py-2 text-xs text-amber-100 leading-relaxed">
                  {authMessage}
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  className="flex-1 rounded-lg bg-gradient-to-r from-emerald-600 to-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:from-emerald-500 hover:to-amber-500 disabled:opacity-60 cursor-pointer"
                >
                  {isAuthSubmitting ? '处理中...' : authMode === 'login' ? '登录' : '注册并登录'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthMessage('');
                  }}
                  className="flex-1 rounded-lg border border-emerald-500/25 px-4 py-2.5 text-sm font-bold text-emerald-100 hover:bg-emerald-500/10 cursor-pointer"
                >
                  {authMode === 'login' ? '切换注册' : '已有账号登录'}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* BACKGROUND SETTING DRAWER/MODAL */}
      <AnimatePresence>
        {isBgSetterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#110e20] border-2 border-amber-500/30 rounded-2xl p-6 overflow-hidden shadow-[0_0_35px_rgba(245,158,11,0.2)] max-h-[90vh] flex flex-col"
              id="bg_setter_modal"
            >
              {/* Corner decor */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/60 pointer-events-none rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500/60 pointer-events-none rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-500/60 pointer-events-none rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/60 pointer-events-none rounded-br-xl" />

              {/* Header */}
              <div className="flex items-center justify-between border-b border-amber-500/15 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-400 animate-pulse" />
                  <h3 className="font-serif text-lg font-bold text-amber-400 tracking-widest">
                    法坛视觉背景定制
                  </h3>
                </div>
                <button
                  onClick={() => setIsBgSetterOpen(false)}
                  className="p-1 hover:bg-amber-500/10 text-stone-400 hover:text-amber-300 rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto space-y-5 pr-1 text-left flex-1 scrollbar-thin">
                {/* 1. Drag & Drop File Upload Area */}
                <div className="space-y-2">
                  <label className="block text-xs font-serif font-bold text-amber-300 uppercase tracking-wider">
                    第一步：上传您电脑上的专属背景图 (支持拖拽/点击)
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    onClick={() => document.getElementById('bg-file-input')?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
                      isDragging 
                        ? 'border-amber-400 bg-amber-500/10 scale-[1.01]' 
                        : customBg 
                        ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50'
                        : 'border-amber-500/20 bg-black/40 hover:border-amber-500/40 hover:bg-black/60'
                    }`}
                  >
                    <input
                      id="bg-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Upload className={`w-8 h-8 ${customBg ? 'text-emerald-400 animate-bounce' : 'text-amber-450'}`} />
                      <div className="text-xs font-semibold text-stone-200">
                        {customBg ? '已成功渲染并加载自定背景' : '拖拽您的电脑专属背景到此处，或点击选择图片'}
                      </div>
                      <p className="text-[10px] text-stone-400">
                        支持大部分常见图片格式，智能压缩提速，保存后永久生效
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Sliders for Quality Fine-tuning */}
                <div className="space-y-4 pt-4 border-t border-amber-500/10">
                  <h4 className="text-xs font-bold text-amber-300 font-serif uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" /> 第二步：调校背景品质 (调整清晰度 & 亮度)
                  </h4>
                  
                  {/* Opacity Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-300">背景不透明度 (Opacity)</span>
                      <span className="font-mono text-amber-400 font-bold">{bgOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="w-full h-1 bg-black/60 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      value={bgOpacity}
                      onChange={(e) => setBgOpacity(Number(e.target.value))}
                    />
                    <p className="text-[10px] text-stone-400">拉高不透明度可使您添加的专属壁纸渲染得更明亮透彻</p>
                  </div>

                  {/* Blur Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-300">背景模糊度 (Blur)</span>
                      <span className="font-mono text-amber-400 font-bold">{bgBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      className="w-full h-1 bg-black/60 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      value={bgBlur}
                      onChange={(e) => setBgBlur(Number(e.target.value))}
                    />
                    <p className="text-[10px] text-stone-400">【重要提示】设为 0px 即保留百分百纯洁超清原图！</p>
                  </div>

                  {/* Gradient Light Mask Intensity Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-300">法坛边界幽暗暗影 (Shadow Shield)</span>
                      <span className="font-mono text-amber-400 font-bold">{bgGradientIntensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="w-full h-1 bg-black/60 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      value={bgGradientIntensity}
                      onChange={(e) => setBgGradientIntensity(Number(e.target.value))}
                    />
                    <p className="text-[10px] text-stone-400">将暗影拉低可以把周围的黑胶遮罩盖板拿开，使图片彻底曝光出来</p>
                  </div>
                </div>

                {/* 3. Manual path input and hints */}
                <div className="space-y-3 pt-4 border-t border-amber-500/10">
                  <h4 className="text-xs font-bold text-amber-300 font-serif uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> 第三步：或直接输入相对路径/网络直通 URL
                  </h4>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      className="w-full bg-black/60 border border-amber-500/30 text-stone-200 px-3 py-2 text-xs rounded-lg font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/40"
                      placeholder="例如：/background.jpg 或 https://example.com/worldcup.png"
                      value={customBg}
                      onChange={(e) => setCustomBg(e.target.value)}
                    />
                    <p className="text-[10px] text-stone-400 leading-normal">
                      提示：如果您在左侧文件管理中直接拖入了如 <code className="bg-stone-850 text-amber-400 px-1 rounded font-mono">stadium.png</code> 这样的文件，输入 <code className="bg-stone-850 text-amber-400 px-1 rounded font-mono">/stadium.png</code> 即可快速读取。
                    </p>
                  </div>
                </div>

                {/* 4. Preset Gallery */}
                <div className="space-y-2 pt-4 border-t border-amber-500/10">
                  <label className="block text-xs font-serif font-bold text-stone-300">
                    一键预设精美大礼包：
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setCustomBg('');
                        setBgOpacity(65);
                        setBgBlur(0);
                        setBgGradientIntensity(40);
                      }}
                      className={`text-left p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                        !customBg 
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
                          : 'bg-black/30 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                      }`}
                    >
                      <div className="font-bold font-serif mb-0.5">默认世界杯狂欢</div>
                      <div className="text-[10px] opacity-60">璀璨体育场景观与灯光影</div>
                    </button>

                    <button
                      onClick={() => {
                        setCustomBg('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop');
                        setBgOpacity(75);
                        setBgBlur(0);
                        setBgGradientIntensity(30);
                      }}
                      className={`text-left p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                        customBg === 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop' 
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
                          : 'bg-black/30 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                      }`}
                    >
                      <div className="font-bold font-serif mb-0.5">梅花玄墨画卷</div>
                      <div className="text-[10px] opacity-60">禅意泼墨宣纸古风</div>
                    </button>

                    <button
                      onClick={() => {
                        setCustomBg('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop');
                        setBgOpacity(75);
                        setBgBlur(0);
                        setBgGradientIntensity(35);
                      }}
                      className={`text-left p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                        customBg === 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop' 
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
                          : 'bg-black/30 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                      }`}
                    >
                      <div className="font-bold font-serif mb-0.5">深邃星云祭坛</div>
                      <div className="text-[10px] opacity-60">宇宙星河玄重底色</div>
                    </button>

                    <button
                      onClick={() => {
                        setCustomBg('https://images.unsplash.com/photo-1543536448-d209d2d13a1c?q=80&w=1920&auto=format&fit=crop');
                        setBgOpacity(80);
                        setBgBlur(0);
                        setBgGradientIntensity(25);
                      }}
                      className={`text-left p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                        customBg === 'https://images.unsplash.com/photo-1543536448-d209d2d13a1c?q=80&w=1920&auto=format&fit=crop' 
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
                          : 'bg-black/30 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-300'
                      }`}
                    >
                      <div className="font-bold font-serif mb-0.5">黄金神话球场</div>
                      <div className="text-[10px] opacity-60">金色狂欢胜境</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 border-t border-amber-500/15 pt-4 mt-4">
                <button
                  onClick={() => {
                    setCustomBg('');
                    setBgOpacity(65);
                    setBgBlur(0);
                    setBgGradientIntensity(40);
                    localStorage.removeItem('world_cup_custom_bg');
                    localStorage.setItem('world_cup_bg_opacity', '65');
                    localStorage.setItem('world_cup_bg_blur', '0');
                    localStorage.setItem('world_cup_bg_gradient_intensity', '40');
                    setIsBgSetterOpen(false);
                  }}
                  className="flex-1 py-2 text-stone-300 bg-stone-900/80 hover:bg-stone-800 hover:text-stone-100 rounded-lg text-xs font-bold font-serif transition border border-stone-800 cursor-pointer text-center"
                >
                  恢复默认
                </button>
                <button
                  onClick={() => {
                    if (customBg) {
                      localStorage.setItem('world_cup_custom_bg', customBg);
                    } else {
                      localStorage.removeItem('world_cup_custom_bg');
                    }
                    localStorage.setItem('world_cup_bg_opacity', String(bgOpacity));
                    localStorage.setItem('world_cup_bg_blur', String(bgBlur));
                    localStorage.setItem('world_cup_bg_gradient_intensity', String(bgGradientIntensity));
                    setIsBgSetterOpen(false);
                  }}
                  className="flex-1 py-2 text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-lg text-xs font-bold font-serif shadow-lg shadow-orange-500/20 cursor-pointer text-center"
                >
                  激活专属背景
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
