import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';
import { tourApi } from '../services/tourApi';
import type { Festival } from '../types';
import MonthFilter from '../components/MonthFilter';
import FestivalCard from '../components/FestivalCard';

const HomePage = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await tourApi.fetchFestivals(currentMonth.toString());
        setFestivals(data);
      } catch (error) {
        console.error('Failed to fetch festivals:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentMonth]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] md:h-[870px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=2670&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="relative h-full max-w-[1920px] mx-auto px-8 flex flex-col justify-end pb-24">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium border border-white/30">
              이달의 추천
            </span>
            <h1 className="font-headline text-4xl md:text-[5rem] leading-[1.1] text-white font-bold mb-6 tracking-tight">
              {currentMonth}월의 여행,<br />꽃망울의 계절
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed font-light">
              전국 곳곳에서 펼쳐지는 화려한 축제와 함께<br />잊지 못할 여행의 한 페이지를 장식해보세요.
            </p>
            <button
              onClick={() => document.getElementById('festival-grid')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-5 bg-primary-container text-on-primary rounded-full text-lg font-bold shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform"
            >
              지금 축제 확인하기
              <ArrowRight size={22} />
            </button>
          </div>
        </div>
      </section>

      {/* Monthly Filter Bar */}
      <section className="py-12 bg-surface-container-low">
        <div className="max-w-[1920px] mx-auto px-8">
          <MonthFilter currentMonth={currentMonth} onMonthSelect={setCurrentMonth} />
        </div>
      </section>

      {/* Festival Grid */}
      <section id="festival-grid" className="py-24 bg-surface">
        <div className="max-w-[1920px] mx-auto px-8">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-4">현재 진행 중인 축제</h2>
              <p className="text-on-surface-variant text-lg">
                {loading ? '데이터를 불러오는 중입니다...' : `전국 각지의 생생한 축제 소식을 전해드립니다.`}
              </p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-primary font-bold group">
              전체보기
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-xl overflow-hidden">
                  <div className="h-[320px] bg-surface-container animate-pulse" />
                  <div className="p-8 space-y-3">
                    <div className="h-3 w-20 bg-surface-container rounded animate-pulse" />
                    <div className="h-5 w-3/4 bg-surface-container rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-surface-container rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : festivals.length > 0 ? (
              festivals.map((festival) => (
                <div key={festival.contentid} onClick={() => navigate(`/festival/${festival.contentid}`)} className="cursor-pointer">
                  <FestivalCard festival={festival} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center">
                  <Sparkles size={36} className="text-on-surface-variant opacity-30" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-on-surface">이번 달 등록된 축제가 아직 없습니다</h3>
                  <p className="text-on-surface-variant">다른 달의 축제를 찾아보거나, 조금만 기다려 주세요.</p>
                </div>
                <button
                  onClick={() => setCurrentMonth(prev => prev === 12 ? 1 : prev + 1)}
                  className="px-8 py-3 bg-on-surface text-white rounded-full font-bold hover:opacity-90 active:scale-95 transition-all"
                >
                  다음 달 축제 보기
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AI Recommendation Section */}
      <section className="pb-32 px-8">
        <div className="max-w-[1920px] mx-auto bg-gradient-to-r from-primary to-primary-container rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none transition-transform duration-1000 group-hover:scale-110">
            <Compass className="absolute -right-20 -top-20 w-[30rem] h-[30rem] text-white" strokeWidth={0.5} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </span>
                <span className="text-white/80 font-bold tracking-widest text-sm">AI 맞춤 추천</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">내 취향에 맞는<br />축제 찾기</h2>
              <p className="text-white/80 text-base md:text-lg mb-10 leading-relaxed">
                당신의 여행 스타일을 분석하여<br />가장 설레는 축제 여정을 설계해 드립니다.
              </p>
              <button className="px-10 py-5 bg-white text-primary rounded-full text-lg font-bold shadow-xl flex items-center gap-3 hover:bg-surface-container-lowest transition-colors">
                분석 시작하기
                <Compass size={22} />
              </button>
            </div>
            <div className="hidden lg:block">
              <div className="w-[350px] h-[350px] bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center p-8 border border-white/20 relative">
                <div className="absolute inset-4 border-2 border-dashed border-white/30 rounded-full animate-[spin_20s_linear_infinite]" />
                <Compass size={160} className="text-white" strokeWidth={1} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-8 bg-surface-container-low flex flex-col items-center gap-6 border-t border-surface-container">
        <div className="text-lg font-bold text-on-surface-variant opacity-40">IdalTrip</div>
        <div className="flex gap-8">
          <a className="text-xs text-on-surface-variant opacity-50 hover:opacity-80 transition-opacity" href="#">이용약관</a>
          <a className="text-xs text-on-surface-variant opacity-50 hover:opacity-80 transition-opacity" href="#">개인정보처리방침</a>
          <a className="text-xs text-on-surface-variant opacity-50 hover:opacity-80 transition-opacity" href="#">고객센터</a>
        </div>
        <p className="text-xs text-on-surface-variant opacity-30">© 2026 이달여행. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
