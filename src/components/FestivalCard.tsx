import { Calendar } from 'lucide-react';
import { formatKTODate } from '../lib/utils';
import type { Festival } from '../types';

interface FestivalCardProps {
  festival: Festival;
}

const FestivalCard = ({ festival }: FestivalCardProps) => {
  return (
    <div className="group bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500">
      {/* Thumbnail */}
      <div className="h-[320px] overflow-hidden relative">
        {festival.firstimage ? (
          <img
            src={festival.firstimage}
            alt={festival.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center">
            <Calendar size={48} className="text-primary opacity-30" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-xs font-bold text-primary">
          진행중
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <p className="text-secondary font-bold text-sm mb-2">
          {festival.addr1 ? `${festival.addr1.split(' ')[0]} ${festival.addr1.split(' ')[1] || ''}`.trim() : '전국'}
        </p>
        <h3 className="text-xl font-bold mb-4 text-on-surface leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {festival.title}
        </h3>
        <div className="flex items-center gap-1.5 text-on-surface-variant text-sm">
          <Calendar size={14} />
          <span>{formatKTODate(festival.eventstartdate)} - {formatKTODate(festival.eventenddate)}</span>
        </div>
      </div>
    </div>
  );
};

export default FestivalCard;
