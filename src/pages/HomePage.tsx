import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowForward } from '../components/Icons'; // Pre-mapped icons
import { tourApi } from '../services/tourApi';
import type { Festival } from '../types';
import MonthFilter from '../components/MonthFilter';
import FestivalCard from '../components/FestivalCard';
import { seasonCopy } from '../data/seasonCopy';
import { getFestivalStatus } from '../lib/utils';
import LogoLight from '../assets/logo/이달여행.svg';

const HomePage = () => {
  const navigate = useNavigate();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  const [searchRegion, setSearchRegion] = useState('전체');
  const [searchDate, setSearchDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7 + 1);
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    const loadFestivals = async () => {
      setLoading(true);
      const data = await tourApi.fetchFestivals(currentMonth.toString());
      
      const sorted = [...data].sort((a, b) => {
        const order = { '진행중': 0, '예정': 1, '종료': 2 };
        const sa = getFestivalStatus(a.eventstartdate, a.eventenddate) as keyof typeof order;
        const sb = getFestivalStatus(b.eventstartdate, b.eventenddate) as keyof typeof order;
        return (order[sa] ?? 3) - (order[sb] ?? 3);
      });
      
      setFestivals(sorted);
      setLoading(false);
    };
    loadFestivals();
  }, [currentMonth]);
  return (
    <div className="bg-surface text-on-surface">
      <main className="pt-0">
        {/* Hero Section - Fixed Height Image */}
        <section className="relative w-full h-48 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=2670&auto=format&fit=crop"
            alt="시즌 히어로"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="relative h-full px-6 flex flex-col justify-end pb-4">
            <p className="text-[10px] font-bold text-white/70 tracking-widest uppercase mb-1">이달의 여행</p>
            <h1 className="font-headline text-2xl font-bold text-white leading-tight whitespace-pre-line">
              {seasonCopy[currentMonth]?.title || `${currentMonth}월의 여행`}
            </h1>
          </div>
        </section>

        {/* Region & Date Selector */}
        <section className="px-4 py-6 bg-white">
          <h2 className="text-lg font-bold text-on-surface mb-4">
            어디로 떠날까요?
          </h2>
          <div className="flex flex-col gap-3">
            {/* 지역 선택 */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {['전체', '서울/경기', '강원', '충청', '전라', '경상', '제주'].map(region => (
                <button
                  key={region}
                  onClick={() => setSearchRegion(region)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    searchRegion === region
                      ? 'bg-primary-container text-white'
                      : 'bg-surface-container text-slate-500'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
            {/* 날짜 선택 */}
            <input
              type="date"
              value={searchDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setSearchDate(e.target.value)}
              className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {/* 탐색 버튼 */}
            <button
              onClick={() => navigate(`/explore?region=${encodeURIComponent(searchRegion)}&date=${searchDate}`)}
              className="w-full bg-primary-container text-white py-4 rounded-xl font-bold text-base shadow-md active:scale-[0.98] transition-all"
            >
              {searchRegion === '전체' ? '전국' : searchRegion} · {new Date(searchDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })} 탐색하기
            </button>
          </div>
        </section>



        {/* Festival Grid - Layout Readjusted */}
        <section id="festivals" className="py-6 bg-surface">
          <div className="mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-headline text-xl font-bold text-on-surface">현재 진행 중인 축제</h2>
                <p className="text-slate-500 text-xs mt-1">전국 각지의 생생한 축제 소식</p>
              </div>
              <button className="flex items-center gap-1 text-primary font-bold text-sm">
                전체보기
                <ArrowForward className="w-4 h-4" />
              </button>
            </div>

            {/* 월 탭 — 축제 목록 바로 위 */}
            <div className="mb-6 -mx-4 px-4 overflow-visible">
              <MonthFilter currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
            </div>
            
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse bg-surface-container-high rounded-xl aspect-[3/4]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {festivals.slice(0, 8).map((festival) => (
                  <FestivalCard 
                    key={festival.contentid} 
                    festival={festival} 
                    onClick={() => navigate(`/festival/${festival.contentid}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      {/* Editorial Footer - DESIGN.md Guidelines */}
      <footer className="w-full py-12 px-6 bg-surface-container-lowest flex flex-col items-center gap-6 border-t border-surface-container">
        <img src={LogoLight} alt="이달의 여행" className="h-5 w-auto opacity-40" />
        <div className="flex flex-wrap justify-center gap-4">
          <a className="text-xs font-bold text-slate-400 hover:text-primary transition-all hover:underline" href="#">이용약관</a>
          <a className="text-xs font-bold text-slate-400 hover:text-primary transition-all hover:underline" href="#">개인정보처리방침</a>
          <a className="text-xs font-bold text-slate-400 hover:text-primary transition-all hover:underline" href="#">고객센터</a>
          <a className="text-xs font-bold text-slate-400 hover:text-primary transition-all hover:underline" href="#">광고문의</a>
        </div>
        <p className="text-xs text-slate-300 font-medium">© 2026 이달트립. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
