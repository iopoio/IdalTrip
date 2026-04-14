import React from 'react';
import { Clock, MapPin, Wallet, Zap } from 'lucide-react';

interface CourseSummaryProps {
  duration: string;
  count: number;
  distance: string;
  theme: string;
}

const CourseSummary: React.FC<CourseSummaryProps> = ({
  duration,
  count,
  distance,
  theme
}) => {
  return (
    <div className="bg-white rounded-2xl p-10 shadow-soft border border-surface-container-high relative overflow-hidden">
      {/* Decorative Gradient Accent */}
      <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-primary to-secondary opacity-50" />
      
      <h3 className="text-2xl font-bold text-on-surface mb-8">여정 브리핑</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-on-surface-variant opacity-60">
            <Clock size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Expected Time</span>
          </div>
          <p className="text-3xl font-headline font-bold text-on-surface">{duration}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-on-surface-variant opacity-60">
            <MapPin size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Total Spots</span>
          </div>
          <p className="text-3xl font-headline font-bold text-on-surface">{count}곳</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-on-surface-variant opacity-60">
            <Zap size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Travel Theme</span>
          </div>
          <p className="text-2xl font-headline font-bold text-primary">{theme}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-on-surface-variant opacity-60">
            <Wallet size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Distance</span>
          </div>
          <p className="text-3xl font-headline font-bold text-on-surface">{distance}</p>
        </div>
      </div>
      
      {/* Visual Indicator of Progress */}
      <div className="mt-10 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
        <div className="h-full w-2/3 bg-gradient-to-r from-primary to-primary-container rounded-full" />
      </div>
    </div>
  );
};

export default CourseSummary;
