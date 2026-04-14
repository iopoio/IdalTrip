import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { tourApi } from '../services/tourApi';
import type { Festival } from '../types';
import MonthFilter from '../components/MonthFilter';
import FestivalCard from '../components/FestivalCard';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
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
      <section className="relative w-full h-[80vh] min-h-[600px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-110"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=2670&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="relative h-full max-w-[1920px] mx-auto px-8 flex flex-col justify-end pb-32">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30 uppercase tracking-widest">
              이달의 추천
            </span>
            <h1 className="font-headline text-5xl md:text-[5rem] leading-[1.1] text-white font-bold mb-6 tracking-tight">
              {currentMonth}월의 여행,<br/>꽃망울의 계절
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed font-light font-body max-w-xl">
              전국 곳곳에서 펼쳐지는 화려한 축제와 함께 당신만의 꽃길을 걸어보세요. 평범한 일상이 축제가 되는 순간을 선물합니다.
            </p>
            <button className="px-10 py-5 bg-primary-container text-on-primary rounded-full text-lg font-bold shadow-vibrant flex items-center gap-3 hover:scale-105 transition-all">
              지금 바로 축제 확인하기
              <ArrowRight size={22} />
            </button>
          </div>
        </div>
      </section>

      {/* Monthly Filter Bar */}
      <section className="py-16 bg-surface-container-low sticky top-20 z-40 backdrop-blur-md bg-white/50">
        <div className="max-w-[1920px] mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col">
            <h2 className="font-headline text-2xl font-bold text-on-surface">시즌별 축제 찾기</h2>
            <p className="text-on-surface-variant text-sm mt-1">원하시는 달의 축제들을 한눈에 모아보세요.</p>
          </div>
          <div className="w-full md:w-auto overflow-hidden">
            <MonthFilter currentMonth={currentMonth} onMonthSelect={setCurrentMonth} />
          </div>
        </div>
      </section>

      {/* Festival Grid */}
      <section className="py-24 bg-surface px-8">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex items-end justify-between mb-16 px-2">
            <div>
              <h2 className="font-headline text-4xl font-bold text-on-surface mb-4">현재 인기 있는 축제</h2>
              <p className="text-on-surface-variant text-lg h-7">
                {loading ? '데이터를 실시간으로 불러오는 중입니다...' : `${currentMonth}월에 열리는 가장 핫한 행사들을 추천해드려요.`}
              </p>
            </div>
            <button className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all group">
              전치보기
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[450px] bg-surface-container rounded-xl animate-pulse" />
              ))
            ) : festivals.length > 0 ? (
              festivals.map((festival: Festival) => (
                <div key={festival.contentid} onClick={() => navigate(`/festival/${festival.contentid}`)}>
                  <FestivalCard festival={festival} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-40 flex flex-col items-center justify-center text-center space-y-6 bg-surface-container-low rounded-[2rem] border-2 border-dashed border-surface-container">
                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant opacity-20">
                  <Sparkles size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-on-surface">이번 달 등록된 축제가 아직 없습니다</h3>
                  <p className="text-on-surface-variant">다른 달의 축제를 찾아보거나, 조금만 기다려 주세요.</p>
                </div>
                <button 
                  onClick={() => setCurrentMonth(prev => prev === 12 ? 1 : prev + 1)}
                  className="px-8 py-3 bg-on-surface text-white rounded-full font-bold hover:scale-105 transition-all"
                >
                  다음 달 축제 보기
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AI Recommendation Banner */}
      <section className="pb-32 px-8">
        <div className="max-w-[1920px] mx-auto bg-gradient-to-br from-primary via-primary-container to-secondary rounded-2xl p-10 md:p-20 relative overflow-hidden group shadow-soft hover:shadow-vibrant transition-all duration-700">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
             <Sparkles className="w-full h-full text-white" strokeWidth={0.5} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-8">
                <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 text-white">
                  <Sparkles size={24} />
                </div>
                <span className="text-white text-sm font-bold tracking-widest uppercase">나만을 위한 AI 추천</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-[1.2] tracking-tight">당신의 취향을 담은<br/>축제 여정을 설계해 드립니다.</h2>
              <p className="text-white/80 text-lg md:text-xl mb-12 leading-relaxed font-light">
                단순한 정보 검색은 그만, AI가 당신의 스타일을 분석하여<br/>가장 설레는 여행 경로를 제안할게요.
              </p>
              <button className="px-12 py-5 bg-white text-primary rounded-full text-lg font-bold shadow-soft hover:shadow-vibrant hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto md:mx-0">
                AI 여행 설계 시작하기
                <ArrowRight size={22} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
