interface MonthFilterProps {
  currentMonth: number;
  onMonthSelect: (month: number) => void;
}

const MonthFilter = ({ currentMonth, onMonthSelect }: MonthFilterProps) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
      {months.map((month) => {
        const isActive = currentMonth === month;
        return (
          <button
            key={month}
            onClick={() => onMonthSelect(month)}
            className={`transition-all rounded-full font-medium whitespace-nowrap ${
              isActive
                ? 'px-10 py-3 bg-primary text-white font-bold shadow-lg shadow-primary/20 scale-105'
                : 'px-8 py-3 bg-white text-on-surface-variant hover:bg-surface-container-low shadow-sm'
            }`}
          >
            {month}월
          </button>
        );
      })}
    </div>
  );
};

export default MonthFilter;
