import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Map } from 'lucide-react';
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
    <div className="pb-40 bg-white">
      {/* Hero Section - Display LG Scale Case Study */}
      <section className="relative h-[800px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1496062031456-07b8f162a322?auto=format&fit=crop&q=80&w=2400" 
            alt="Main Festival Scene"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative inner-container w-full text-white">
          <div className="mb-10 px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full w-fit flex items-center gap-3 animate-fade-in">
             <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
             <span className="text-[11px] font-black uppercase tracking-[0.3em]">Season Spotlight</span>
          </div>
          <h1 className="display-lg mb-10 drop-shadow-2xl">
            {currentMonth}월의 여행,<br />
            장미의 계절
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl font-medium leading-[1.6] mb-14">
            꽃잎이 흩날리는 축제의 현장 속으로 당신을 초대합니다.<br />
            계절이 머무는 찰나의 순간을 IdalTrip과 함께 기록하세요.
          </p>
          <button className="cta-primary group px-12 py-6">
            지금 축제 구경하기
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>

      {/* Month Navigation - Surface Tiering */}
      <div className="inner-container translate-y-[-50%] relative z-20">
        <div className="px-12 py-12 bg-white rounded-[48px] shadow-premium">
           <MonthFilter currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
        </div>
      </div>

      {/* Festival Showcase Grid */}
      <section className="inner-container mt-20 mb-40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-20 whitespace-normal">
          <div className="max-w-2xl">
            <h2 className="display-lg !text-[2.5rem] md:!text-[3.5rem] text-brand-secondary mb-6">현재 진행 중인 축제</h2>
            <p className="text-lg md:text-xl text-gray-400 font-medium">전국 각지의 생생한 축제 소식을 IdalTrip 큐레이터가 전해드립니다.</p>
          </div>
          <button className="flex items-center gap-4 text-brand-secondary hover:text-brand-primary font-black text-[18px] transition-all group pb-2 border-b-2 border-brand-secondary/10">
            전체 일정 보기 <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-gray-50 rounded-[40px] aspect-[4/5]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {festivals.slice(0, 8).map((festival) => (
              <FestivalCard 
                key={festival.contentid} 
                festival={festival} 
                onClick={() => navigate(`/festival/${festival.contentid}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* AI Personalized Experience - Gradient Layering */}
      <section className="inner-container">
        <div className="bg-brand-secondary rounded-[60px] p-16 md:p-32 relative overflow-hidden flex flex-col md:flex-row items-center gap-24 text-white shadow-premium">
          <div className="absolute left-[-20%] bottom-[-20%] w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-[120px]" />
          
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-4 mb-12 opacity-90">
              <Sparkles size={28} className="text-brand-primary" />
              <span className="text-[13px] font-black tracking-widest uppercase">The Digital Curator</span>
            </div>
            <h2 className="display-lg !text-[3rem] md:!text-[4.5rem] mb-12 leading-[1.1]">
              취향이 머무는<br />코스 설계
            </h2>
            <p className="text-xl md:text-2xl text-white/70 mb-16 max-w-lg font-medium leading-relaxed">
              수만 개의 데이터 속에서 당신의 영감을 자극할<br />단 하나의 여정을 AI가 직접 큐레이션합니다.
            </p>
            <button 
              onClick={() => navigate('/festivals')}
              className="bg-brand-primary text-white px-14 py-6 rounded-full font-black text-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-4 active:scale-95 group"
            >
              여정 시작하기 
              <Map size={24} className="group-hover:rotate-12 transition-transform" />
            </button>
          </div>

          {/* Compass Silhouette - Glassmorphism UI */}
          <div className="relative z-10 scale-125 lg:scale-150 py-20 md:py-0">
            <div className="w-80 h-80 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 flex items-center justify-center">
              <div className="w-64 h-64 bg-white rounded-full shadow-2xl flex items-center justify-center p-8 rotate-12 transition-transform hover:rotate-0 duration-700">
                 <div className="w-full h-full border-[1px] border-gray-100 rounded-full flex items-center justify-center relative bg-gray-50/30">
                    <Map size={100} className="text-brand-primary opacity-90" strokeWidth={1} />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Editorial Footer */}
      <footer className="mt-60 pb-20 text-center border-t border-gray-50 pt-32">
        <h3 className="brand-font text-[32px] font-black text-gray-200 mb-12">IdalTrip</h3>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-[15px] text-gray-400 font-bold mb-16">
          <a href="#" className="hover:text-brand-primary transition-colors">서비스 이용약관</a>
          <a href="#" className="text-brand-secondary border-b-2 border-brand-secondary/20 pb-1">개인정보처리방침</a>
          <a href="#" className="hover:text-brand-primary transition-colors">고객지원센터</a>
          <a href="#" className="hover:text-brand-primary transition-colors">비즈니스 협업</a>
        </div>
        <p className="text-[13px] text-gray-300 font-medium tracking-wide">© 2026 IdalTrip. Editorial Curation System Powered by AI.</p>
      </footer>
    </div>
  );
};

export default HomePage;
