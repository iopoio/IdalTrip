import React from 'react';

interface MonthFilterProps {
  currentMonth: number;
  onMonthSelect: (month: number) => void;
}

const MonthFilter: React.FC<MonthFilterProps> = ({ currentMonth, onMonthSelect }) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="w-full overflow-x-auto no-scrollbar scroll-smooth">
      <div className="flex gap-3 px-8 md:px-0 py-4 items-center min-w-max">
        {months.map((month) => {
          const isActive = currentMonth === month;
          return (
            <button
              key={month}
              onClick={() => onMonthSelect(month)}
              className={`transition-all duration-300 rounded-full text-sm font-bold whitespace-nowrap ${
                isActive
                  ? 'px-10 py-3.5 bg-primary text-white shadow-vibrant scale-110'
                  : 'px-8 py-3 bg-white text-on-surface-variant hover:bg-surface-container shadow-soft'
              }`}
            >
              {month}월
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthFilter;
