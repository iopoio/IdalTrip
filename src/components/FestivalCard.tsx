import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { formatKTODate } from '../lib/utils';
import type { Festival } from '../types';

interface FestivalCardProps {
  festival: Festival;
}

const FestivalCard: React.FC<FestivalCardProps> = ({ festival }) => {
  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-vibrant transition-all duration-500 cursor-pointer">
      {/* Thumbnail Area */}
      <div className="relative h-[240px] md:h-[300px] overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
        {festival.firstimage ? (
          <img
            src={festival.firstimage}
            alt={festival.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-primary opacity-40">
            <Calendar size={48} strokeWidth={1.5} />
            <span className="text-[10px] font-bold uppercase tracking-widest italic">No Visual</span>
          </div>
        )}
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold text-primary shadow-sm">
          {festival.eventstartdate ? '진행중' : '준비중'}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <div className="flex items-center gap-1.5 text-secondary font-bold text-[11px] mb-2 uppercase tracking-wider">
          <MapPin size={12} strokeWidth={3} />
          <span>{festival.addr1 ? festival.addr1.split(' ')[0] : '전공'}</span>
        </div>
        <h3 className="text-lg font-bold mb-4 text-on-surface leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {festival.title}
        </h3>
        <div className="flex items-center gap-2 text-on-surface-variant text-xs font-medium opacity-70">
          <Calendar size={14} />
          <span>{formatKTODate(festival.eventstartdate)} - {formatKTODate(festival.eventenddate)}</span>
        </div>
      </div>
    </div>
  );
};

export default FestivalCard;
