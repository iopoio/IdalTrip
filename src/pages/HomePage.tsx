import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowForward, AutoAwesome, CompassCalibration } from '../components/Icons'; // Pre-mapped icons
import { tourApi } from '../services/tourApi';
import type { Festival } from '../types';
import MonthFilter from '../components/MonthFilter';
import FestivalCard from '../components/FestivalCard';
import { seasonCopy } from '../data/seasonCopy';

const HomePage = () => {
  const navigate = useNavigate();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFestivals = async () => {
      setLoading(true);
      const data = await tourApi.fetchFestivals(currentMonth.toString());
      setFestivals(data);
      setLoading(false);
    };
    loadFestivals();
  }, [currentMonth]);

  const regions = ["전체", "서울/경기", "강원", "충청", "전라", "경상", "제주"];

  const filteredFestivals = festivals.filter(festival => {
    if (selectedRegion === "전체") return true;
    const addr = festival.addr1 || "";
    const regionPrefix = addr.split(' ')[0];
    
    if (selectedRegion === "서울/경기") {
      return ["서울", "경기", "인천"].some(r => regionPrefix.includes(r));
    }
    if (selectedRegion === "충청") {
      return ["충청", "대전", "세종"].some(r => regionPrefix.includes(r));
    }
    if (selectedRegion === "전라") {
      return ["전라", "광주"].some(r => regionPrefix.includes(r));
    }
    if (selectedRegion === "경상") {
      return ["경상", "부산", "대구", "울산"].some(r => regionPrefix.includes(r));
    }
    return regionPrefix.includes(selectedRegion);
  });

  return (
    <div className="bg-surface text-on-surface">
      <main className="pt-0">
        {/* Hero Section - Mobile App Style */}
        <section className="relative w-full aspect-[4/5] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=2670&auto=format&fit=crop"
            alt="시즌 히어로"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div className="relative h-full mx-auto px-6 flex flex-col justify-end pb-12">
            <div className="max-w-3xl">
              <h1 className="font-headline text-5xl leading-[1.2] text-white font-bold mb-4 tracking-tight whitespace-pre-line">
                {seasonCopy[currentMonth]?.title || `${currentMonth}월의 여행`}
              </h1>
              <p className="text-lg text-white/90 mb-8 leading-relaxed font-light whitespace-pre-line">
                {seasonCopy[currentMonth]?.subtitle}
              </p>
              <button 
                onClick={() => document.getElementById('festivals')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-4 bg-primary-container text-on-primary rounded-full text-base font-bold shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform"
              >
                지금 축제 확인하기
                <ArrowForward className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Monthly Filter Bar - No-Line Rule Implementation */}
        <section className="pt-8 pb-10 bg-surface-container-low overflow-visible">
          <div className="mx-auto px-6 overflow-visible">
            <MonthFilter currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
          </div>
        </section>

        {/* Festival Grid - High-End Editorial Style */}
        <section id="festivals" className="py-12 bg-surface">
          <div className="mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex gap-6 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                  {regions.map(region => (
                    <button
                      key={region}
                      onClick={() => setSelectedRegion(region)}
                      className={`whitespace-nowrap pb-2 text-lg transition-all ${
                        selectedRegion === region 
                        ? "text-primary font-bold border-b-2 border-primary" 
                        : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
                <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">현재 진행 중인 축제</h2>
                <p className="text-slate-500 text-sm">전국 각지의 생생한 축제 소식을 전해드립니다.</p>
              </div>
              <button className="flex items-center gap-2 text-primary font-bold group">
                전체보기
                <ArrowForward className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse bg-surface-container-high rounded-xl aspect-[3/4]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredFestivals.slice(0, 8).map((festival) => (
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

        {/* AI Recommendation Section - Glassmorphism & Depth */}
        <section className="pb-16 px-4">
          <div className="mx-auto bg-gradient-to-r from-primary to-primary-container rounded-[2rem] p-8 relative overflow-hidden group shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none transition-transform duration-1000 group-hover:scale-110">
               {/* Decorative Background Element */}
               <div className="absolute -right-20 -top-20 w-[600px] h-[600px] bg-white rounded-full blur-[100px]" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <AutoAwesome className="w-4 h-4 fill-current" />
                  </span>
                  <span className="text-white/80 font-bold tracking-widest text-[11px] uppercase">AI 맞춤 추천</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 leading-tight">내 취향에 맞는<br />축제 찾기</h2>
                <p className="text-white/80 text-sm mb-8 leading-relaxed font-light">
                  당신의 여행 스타일을 분석하여<br />가장 설레는 축제 여정을 설계해 드립니다.
                </p>
                <button 
                  onClick={() => navigate('/festivals')}
                  className="px-6 py-4 bg-white text-primary rounded-full font-bold shadow-xl flex items-center gap-2 hover:bg-surface transition-colors text-sm"
                >
                  분석 시작하기
                  <CompassCalibration className="w-5 h-5" />
                </button>
              </div>
              <div className="hidden lg:block relative">
                <div className="w-[400px] h-[400px] bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center p-8 border border-white/20 relative overflow-hidden">
                  <div className="absolute inset-4 border-2 border-dashed border-white/30 rounded-full animate-[spin_20s_linear_infinite]"></div>
                  <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center">
                    <CompassCalibration className="w-32 h-32 text-white opacity-80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Editorial Footer - DESIGN.md Guidelines */}
      <footer className="w-full py-12 px-6 bg-surface-container-lowest flex flex-col items-center gap-6 border-t border-surface-container">
        <div className="text-xl font-black text-slate-300 tracking-tighter">IdalTrip</div>
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
