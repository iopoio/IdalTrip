interface MonthFilterProps {
  currentMonth: number;
  onMonthChange: (month: number) => void;
}

const MonthFilter = ({ currentMonth, onMonthChange }: MonthFilterProps) => {
  const today = new Date();
  const thisMonth = today.getMonth() + 1;
  const months = Array.from({ length: 12 - thisMonth + 1 }, (_, i) => thisMonth + i);

  return (
    <div className="overflow-x-auto no-scrollbar" style={{ overflow: 'clip visible', overflowX: 'auto', overflowY: 'visible' }}>
      <div className="flex items-center gap-3" style={{ padding: '16px 4px' }}>
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
