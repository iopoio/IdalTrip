interface MonthFilterProps {
  currentMonth: number;
  onMonthChange: (month: number) => void;
}

const MonthFilter = ({ currentMonth, onMonthChange }: MonthFilterProps) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
      <div className="flex items-center gap-3 py-4">
        {months.map((month) => {
          const isActive = currentMonth === month;
          return (
            <button
              key={month}
              onClick={() => onMonthChange(month)}
              className={`rounded-full transition-all whitespace-nowrap ${
                isActive
                  ? 'px-10 py-3 bg-primary text-white font-bold shadow-lg shadow-primary/20 scale-105'
                  : 'px-8 py-3 bg-white text-slate-500 font-medium hover:bg-slate-50 shadow-sm'
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
