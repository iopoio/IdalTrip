import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowForward, AutoAwesome, CompassCalibration } from '../components/Icons'; // Pre-mapped icons
import { tourApi } from '../services/tourApi';
import type { Festival } from '../types';
import MonthFilter from '../components/MonthFilter';
import FestivalCard from '../components/FestivalCard';

const HomePage = () => {
  const navigate = useNavigate();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
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

  return (
    <div className="bg-surface text-on-surface">
      <main className="pt-20">
        {/* Hero Section - Matching Mockup 1:1 */}
        <section className="relative w-full h-[870px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=2670&auto=format&fit=crop"
            alt="시즌 히어로"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div className="relative h-full max-w-[1920px] mx-auto px-8 flex flex-col justify-end pb-24">
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium border border-white/30">
                Seasonal Highlight
              </span>
              <h1 className="font-headline text-[5rem] leading-[1.1] text-white font-bold mb-6 tracking-tight">
                {currentMonth}월의 여행,<br />장미의 계절
              </h1>
              <p className="text-xl text-white/90 mb-10 leading-relaxed font-light">
                전국 곳곳에서 펼쳐지는 화려한 장미 축제와 함께<br />잊지 못할 봄의 마지막 페이지를 장식해보세요.
              </p>
              <button 
                onClick={() => document.getElementById('festivals')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-primary-container text-on-primary rounded-full text-lg font-bold shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform"
              >
                지금 축제 확인하기
                <ArrowForward className="w-6 h-6" />
              </button>
            </div>
          </div>
        </section>

        {/* Monthly Filter Bar - No-Line Rule Implementation */}
        <section className="py-12 bg-surface-container-low overflow-visible">
          <div className="max-w-[1920px] mx-auto px-8 overflow-visible">
            <MonthFilter currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
          </div>
        </section>

        {/* Festival Grid - High-End Editorial Style */}
        <section id="festivals" className="py-24 bg-surface">
          <div className="max-w-[1920px] mx-auto px-8">
            <div className="flex items-end justify-between mb-16">
              <div>
                <h2 className="font-headline text-4xl font-bold text-on-surface mb-4">현재 진행 중인 축제</h2>
                <p className="text-slate-500 text-lg">전국 각지의 생생한 축제 소식을 전해드립니다.</p>
              </div>
              <button className="flex items-center gap-2 text-primary font-bold group">
                전체보기
                <ArrowForward className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse bg-surface-container-high rounded-xl aspect-[3/4]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

        {/* AI Recommendation Section - Glassmorphism & Depth */}
        <section className="pb-32 px-8">
          <div className="max-w-[1920px] mx-auto bg-gradient-to-r from-primary to-primary-container rounded-[2.5rem] p-16 relative overflow-hidden group shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none transition-transform duration-1000 group-hover:scale-110">
               {/* Decorative Background Element */}
               <div className="absolute -right-20 -top-20 w-[600px] h-[600px] bg-white rounded-full blur-[100px]" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <AutoAwesome className="w-6 h-6 fill-current" />
                  </span>
                  <span className="text-white/80 font-bold tracking-widest text-sm uppercase">AI Personalized</span>
                </div>
                <h2 className="text-5xl font-bold text-white mb-8 leading-tight">내 취향에 맞는<br />축제 찾기</h2>
                <p className="text-white/80 text-lg mb-10 leading-relaxed font-light">
                  당신의 여행 스타일을 분석하여<br />가장 설레는 축제 여정을 설계해 드립니다.
                </p>
                <button 
                  onClick={() => navigate('/festivals')}
                  className="px-10 py-5 bg-white text-primary rounded-full text-lg font-bold shadow-xl flex items-center gap-3 hover:bg-surface transition-colors"
                >
                  분석 시작하기
                  <CompassCalibration className="w-6 h-6" />
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
      <footer className="w-full py-16 px-8 bg-surface-container-lowest flex flex-col items-center gap-8 border-t border-surface-container">
        <div className="text-2xl font-black text-slate-300 tracking-tighter">IdalTrip</div>
        <div className="flex gap-10">
          <a className="text-sm font-bold text-slate-400 hover:text-primary transition-all underline-offset-8 hover:underline" href="#">이용약관</a>
          <a className="text-sm font-bold text-slate-400 hover:text-primary transition-all underline-offset-8 hover:underline" href="#">개인정보처리방침</a>
          <a className="text-sm font-bold text-slate-400 hover:text-primary transition-all underline-offset-8 hover:underline" href="#">고객센터</a>
          <a className="text-sm font-bold text-slate-400 hover:text-primary transition-all underline-offset-8 hover:underline" href="#">광고문의</a>
        </div>
        <p className="text-sm text-slate-300 font-medium">© 2024 IdalTrip. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
