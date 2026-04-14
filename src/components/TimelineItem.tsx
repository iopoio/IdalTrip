import React from 'react';
import { Map, Clock, Navigation } from 'lucide-react';

interface TimelineItemProps {
  index: number;
  time: string;
  name: string;
  description: string;
  image?: string;
  isLast?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  index,
  time,
  name,
  description,
  image,
  isLast = false,
}) => {
  return (
    <div className="flex gap-8 relative">
      {/* Connector Line */}
      {!isLast && (
        <div className="absolute left-[23px] top-[48px] bottom-[-24px] w-[2px] bg-surface-container-high" />
      )}

      {/* Marker */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-vibrant">
          {index}
        </div>
      </div>

      {/* Content Card */}
      <div className={`flex-grow pb-12 transition-all`}>
        <div className="bg-white bg-opacity-60 backdrop-blur-sm p-8 rounded-2xl shadow-soft hover:shadow-vibrant transition-all duration-500 border border-primary/5 group">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Info */}
            <div className="flex-grow space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wider uppercase">
                <Clock size={16} />
                <span>{time}</span>
              </div>
              <h4 className="text-2xl font-bold text-on-surface group-hover:text-primary transition-colors italic">
                {name}
              </h4>
              <p className="text-on-surface-variant leading-relaxed font-light">
                {description}
              </p>
              
              <div className="flex gap-3 pt-4">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold shadow-soft hover:scale-105 transition-all">
                  <Map size={16} />
                  <span>카카오맵 보기</span>
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high text-on-surface-variant rounded-xl text-sm font-bold hover:bg-surface-container transition-colors">
                  <Navigation size={16} />
                  <span>길찾기</span>
                </button>
              </div>
            </div>

            {/* Optional Thumbnail */}
            {image && (
              <div className="w-full md:w-64 h-40 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                <img src={image} alt={name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;
