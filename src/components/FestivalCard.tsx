import React from 'react';
import { CalendarToday } from './Icons';
import { formatKTODate, getFestivalStatus } from '../lib/utils';
import type { Festival } from '../types';

interface FestivalCardProps {
  festival: Festival;
  onClick: () => void;
}

const FestivalCard: React.FC<FestivalCardProps> = ({ festival, onClick }) => {
  // Extract region from address
  const region = festival.addr1?.split(' ')[0] || '전국';
  const status = getFestivalStatus(festival.eventstartdate, festival.eventenddate);
  
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer relative bg-surface-container-high rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 aspect-[3/4]"
    >
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
      <div className={`absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur rounded text-[10px] font-bold shadow-sm z-10 ${
        status === '진행중' ? 'text-primary' : status === '예정' ? 'text-secondary' : 'text-slate-400'
      }`}>
        {status}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
        <p className="text-secondary font-bold text-[10px] mb-1">{region}</p>
        <h3 className="text-sm font-bold mb-2 text-white leading-tight group-hover:text-primary-container transition-colors line-clamp-2">
          {festival.title}
        </h3>
        <div className="flex items-center gap-1.5 text-white/70 text-[10px]">
          <CalendarToday className="w-3 h-3" />
          <span>{formatKTODate(festival.eventstartdate)} - {formatKTODate(festival.eventenddate)}</span>
        </div>
      </div>
    </div>
  );
};

export default FestivalCard;
