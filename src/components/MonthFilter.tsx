import React from 'react';

interface MonthFilterProps {
  currentMonth: number;
  onMonthChange: (month: number) => void;
}

const MonthFilter: React.FC<MonthFilterProps> = ({ currentMonth, onMonthChange }) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between w-full gap-4 overflow-x-auto pb-4 px-2 no-scrollbar">
      {months.map((month) => (
        <button
          key={month}
          onClick={() => onMonthChange(month)}
          className={`
            flex-shrink-0 w-[70px] h-[70px] md:w-[84px] md:h-[84px] rounded-full flex flex-col items-center justify-center transition-all duration-300
            ${currentMonth === month 
              ? 'bg-brand-secondary text-white shadow-[0_10px_20px_rgba(45,26,18,0.3)] scale-110 z-10' 
              : 'bg-white text-surface-text-muted shadow-premium hover:shadow-md hover:-translate-y-1'
            }
          `}
        >
          <span className="text-[15px] font-bold">{month}</span>
          <span className="text-[12px] opacity-80 font-medium">월</span>
        </button>
      ))}
    </div>
  );
};

export default MonthFilter;
