import React from 'react';
import { CalendarToday } from './Icons';
import { formatKTODate } from '../lib/utils';
import type { Festival } from '../types';

interface FestivalCardProps {
  festival: Festival;
  onClick: () => void;
}

const FestivalCard: React.FC<FestivalCardProps> = ({ festival, onClick }) => {
  // Extract region from address
  const region = festival.addr1?.split(' ')[0] || '전국';
  
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-surface-variant flex flex-col"
    >
      <div className="h-[320px] overflow-hidden relative bg-surface-container-high">
        {festival.firstimage ? (
          <img 
            src={festival.firstimage} 
            alt={festival.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1547036967-23d1199d3b1f?w=600';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
             <CalendarToday className="w-16 h-16 text-primary opacity-20" />
          </div>
        )}
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-xs font-bold text-primary shadow-sm">
          진행중
        </div>
      </div>
      
      <div className="p-8 flex-1 flex flex-col">
        <p className="text-secondary font-bold text-sm mb-2">{region}</p>
        <h3 className="text-xl font-bold mb-4 text-on-surface leading-tight group-hover:text-primary transition-colors">
          {festival.title}
        </h3>
        <div className="mt-auto flex items-center gap-2 text-slate-500 text-sm">
          <CalendarToday className="w-4 h-4" />
          <span>{formatKTODate(festival.eventstartdate)} - {formatKTODate(festival.eventenddate)}</span>
        </div>
      </div>
    </div>
  );
};

export default FestivalCard;
