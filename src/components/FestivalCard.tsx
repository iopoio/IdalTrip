import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
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
      className="group cursor-pointer"
    >
      <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden mb-5 shadow-premium border border-black/5 bg-gray-100">
        {festival.firstimage ? (
          <img 
            src={festival.firstimage} 
            alt={festival.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000&auto=format&fit=crop';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/10 flex items-center justify-center">
             <MapPin size={40} className="text-brand-primary opacity-30" />
          </div>
        )}
        
        {/* Status Badge from Mockup */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
          <span className="text-[11px] font-bold text-white tracking-widest uppercase">진행중</span>
        </div>
      </div>
      
      <div className="px-1">
        <span className="text-[13px] font-bold text-brand-primary mb-2 block uppercase tracking-wider">{region}</span>
        <h3 className="text-[19px] font-bold text-brand-secondary mb-3 leading-tight group-hover:text-brand-primary transition-colors">
          {festival.title}
        </h3>
        <div className="flex items-center gap-2 text-surface-text-muted text-[13px] font-medium">
          <Calendar size={14} />
          <span>{festival.eventstartdate} - {festival.eventenddate}</span>
        </div>
      </div>
    </div>
  );
};

export default FestivalCard;
