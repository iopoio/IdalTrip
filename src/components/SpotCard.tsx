import React from 'react';
import { CheckCircle2, Circle, MapPin, Star } from 'lucide-react';

interface SpotCardProps {
  id: string;
  name: string;
  image: string;
  category: string;
  rating: number;
  isSelected?: boolean;
  onToggle: (id: string) => void;
}

const SpotCard: React.FC<SpotCardProps> = ({
  id,
  name,
  image,
  category,
  rating,
  isSelected = false,
  onToggle
}) => {
  return (
    <div
      onClick={() => onToggle(id)}
      className={`group relative flex items-center gap-6 p-4 rounded-xl transition-all duration-300 cursor-pointer border-2 ${
        isSelected
          ? 'bg-secondary/5 border-secondary shadow-soft'
          : 'bg-white border-transparent hover:bg-surface-container shadow-sm'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        {image && !image.includes('unsplash.com') ? (
          <img src={image} alt={name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
        ) : (
          <div className="text-primary opacity-30">
            <MapPin size={32} strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute top-1 left-1 bg-black/40 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-0.5">
          <Star size={10} className="fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] text-white font-bold">{rating}</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-grow">
        <span className="text-[10px] font-bold text-secondary-container bg-secondary/10 px-2 py-0.5 rounded-full mb-1 inline-block uppercase tracking-wider">
          {category}
        </span>
        <h4 className={`text-lg font-bold transition-colors ${isSelected ? 'text-secondary' : 'text-on-surface'}`}>
          {name}
        </h4>
        <div className="flex items-center gap-1 mt-1 text-on-surface-variant text-xs opacity-60">
          <MapPin size={12} />
          <span>축제장에서 1.2km</span>
        </div>
      </div>

      {/* Selection Indicator */}
      <div className={`transition-all duration-300 ${isSelected ? 'text-secondary scale-110' : 'text-surface-container-high'}`}>
        {isSelected ? <CheckCircle2 size={28} /> : <Circle size={28} strokeWidth={1} />}
      </div>
    </div>
  );
};

export default SpotCard;
