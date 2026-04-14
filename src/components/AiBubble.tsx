import React from 'react';
import { Sparkles, Quote } from 'lucide-react';

interface AiBubbleProps {
  content: string;
}

const AiBubble: React.FC<AiBubbleProps> = ({ content }) => {
  return (
    <div className="relative group">
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center animate-pulse">
        <Sparkles size={24} className="text-primary" />
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-soft border border-primary/5 ml-4">
        <Quote size={24} className="text-primary/20 mb-4" />
        <p className="text-on-surface-variant text-lg leading-relaxed font-medium">
          {content}
        </p>
        <div className="mt-6 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">이달여행 AI 가이드</span>
        </div>
      </div>

      {/* Decorative arrow */}
      <div className="absolute top-10 -left-2 w-4 h-4 bg-white rotate-45 border-l border-b border-primary/5 hidden md:block" />
    </div>
  );
};

export default AiBubble;
