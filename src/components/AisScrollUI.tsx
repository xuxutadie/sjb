import { motion } from 'motion/react';
import { Sparkles, BookOpen } from 'lucide-react';

interface AisScrollUIProps {
  content?: string;
  isLoading: boolean;
  hexagramName: string;
}

export default function AisScrollUI({ content, isLoading, hexagramName }: AisScrollUIProps) {
  
  // Custom parser to split paragraph headers and items for spectacular calligraphy layouts
  const formatContent = (text: string) => {
    if (!text) return null;
    
    const blocks = text.split('\n\n');
    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;
      
      // Check for headers like 【太极初开，易理卦气】 or 【易理断语】
      if (trimmed.startsWith('【') && trimmed.includes('】')) {
        const titleEnd = trimmed.indexOf('】') + 1;
        const title = trimmed.substring(0, titleEnd);
        const bodyContent = trimmed.substring(titleEnd).trim();
        
        return (
          <div key={idx} className="mb-4">
            <h4 className="font-serif font-bold text-lg sm:text-xl text-amber-950 border-b border-amber-800/30 pb-1.5 mb-2.5 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rotate-45 bg-amber-800" />
              {title}
            </h4>
            <p className="text-stone-900 hover:text-black leading-8 font-serif text-base sm:text-[17px] indent-8 text-justify whitespace-pre-line font-semibold">
              {bodyContent}
            </p>
          </div>
        );
      }
      
      // Standard list items or paragraphs
      if (trimmed.startsWith('-') || trimmed.startsWith('·') || trimmed.startsWith('*')) {
        const lines = trimmed.split('\n');
        return (
          <ul key={idx} className="list-disc pl-5 mb-4 text-stone-900 space-y-1.5 my-2.5">
            {lines.map((line, lidx) => {
              const cleanLine = line.replace(/^[-·*\s]+/, '');
              return (
                <li key={lidx} className="font-serif text-base sm:text-[17px] text-stone-900 leading-8 font-semibold">
                  {cleanLine}
                </li>
              );
            })}
          </ul>
        );
      }

      return (
        <p key={idx} className="mb-4 text-stone-900 hover:text-black leading-8 font-serif text-base sm:text-[17px] indent-8 text-justify whitespace-pre-line font-semibold">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div id="ais_scroll_container" className="relative w-full max-w-2xl mx-auto my-4">
      {/* Scroll Wooden Axes */}
      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-amber-700 to-amber-950 rounded-l shadow-lg z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-gradient-to-l from-amber-700 to-amber-950 rounded-r shadow-lg z-10" />
      
      {/* Scroll Content Canvas */}
      <div className="mx-[10px] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect width=%22100%22 height=%22100%22 fill=%22%23faf3e0%22/></svg>')] bg-amber-50/95 border-y-4 border-amber-700/50 shadow-2xl p-6 sm:p-10 min-h-[320px] rounded-sm transition-all relative">
        {/* Underlay Chinese Seal Watermark */}
        <div className="absolute right-10 bottom-10 w-24 h-24 border-2 border-dashed border-red-700/15 rounded-full flex items-center justify-center pointer-events-none select-none rotate-12">
          <span className="font-serif text-red-700/15 text-xs sm:text-sm text-center leading-none font-bold">
            梅花神算<br />绿茵神盘
          </span>
        </div>

        {/* Loading Indicator */}
        {isLoading ? (
          <div className="absolute inset-0 bg-amber-50/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-8 text-center z-10 rounded-sm">
            <div className="relative flex items-center justify-center mb-4">
              <div className="absolute w-12 h-12 border-4 border-amber-800/20 border-t-amber-800 rounded-full animate-spin" />
              <BookOpen className="w-5 h-5 text-amber-800" />
            </div>
            <motion.h4 
              className="text-amber-950 font-serif font-bold text-base sm:text-lg mb-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              正在开启九宫命理，卦推乾坤战局...
            </motion.h4>
            <p className="text-sm sm:text-base text-stone-700 max-w-xs font-serif leading-relaxed font-bold">
              梅花易数结合球队对峙阵列。正在调用 AI 大师模型参透【{hexagramName}】体用大运。
            </p>
          </div>
        ) : null}

        {/* Scroll Header Content */}
        {!content && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-stone-600">
            <Sparkles className="w-8 h-8 text-amber-700 mb-3 animate-pulse" />
            <h4 className="font-serif font-black text-stone-800 text-lg sm:text-xl mb-1.5">未有签文卜得</h4>
            <p className="text-sm sm:text-base max-w-xs leading-relaxed font-serif text-stone-600 font-bold">
              请在上方输入双方球队名称、个人出生时日信息，点击【起卦测天格】。大师将开阵卜测。
            </p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="prose prose-stone max-w-none select-text prose-p:text-stone-900 prose-li:text-stone-900 prose-strong:text-stone-950"
          >
            {/* Calligraphy main title */}
            <div className="text-center mb-8 border-b-2 border-double border-amber-800/30 pb-4">
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-amber-950 tracking-widest flex items-center justify-center gap-1.5 font-extrabold text-shadow">
                梅花易数绿茵对决天机签文
              </h2>
              <div className="text-sm sm:text-base text-amber-900/80 font-black font-serif mt-1.5 flex items-center justify-center gap-3">
                <span>卦象：{hexagramName}</span>
                <span>·</span>
                <span>太极造化 运数使然</span>
              </div>
            </div>

            {/* Structured paragraph columns */}
            <div className="text-stone-900 space-y-4 font-serif">
              {content ? formatContent(content) : null}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
