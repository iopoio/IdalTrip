import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Sparkles, Navigation, RotateCcw, Save, Smartphone } from 'lucide-react';
import type { CourseResponse } from '../types';

const CourseResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { course } = (location.state as { course: CourseResponse }) || {};

  if (!course) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-10 text-center bg-gray-50">
        <h2 className="display-lg !text-[2rem] mb-10">코스 정보가 없습니다.</h2>
        <button onClick={() => navigate('/')} className="cta-primary px-12">처음으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9f9] min-h-screen pb-48">
      {/* AI Curator Welcome - Bubble UI */}
      <section className="inner-container pt-20 mb-24">
        <div className="flex flex-col md:flex-row items-start gap-10 mb-16">
           <div className="w-20 h-20 bg-brand-primary rounded-[32px] shadow-2xl shadow-brand-primary/40 flex items-center justify-center text-white shrink-0 animate-bounce-subtle">
              <Sparkles size={40} />
           </div>
           <div className="flex-1">
              <h1 className="display-lg !text-[3.5rem] text-brand-secondary mb-8 leading-[1.1] animate-fade-in-up">AI 큐레이터가<br />최적의 여정을 설계했습니다!</h1>
              <div className="relative glass-panel p-8 rounded-[40px] rounded-tl-none max-w-3xl animate-fade-in-up delay-100">
                 <p className="text-xl text-brand-secondary font-medium leading-relaxed italic">
                   "불필요한 이동을 걷어내고 {course.theme}에 집중했어요. {course.summary}"
                 </p>
                 <div className="absolute top-0 left-[-15px] w-0 h-0 border-t-[20px] border-t-white/70 border-l-[20px] border-l-transparent" />
              </div>
           </div>
        </div>

        {/* Stats Grid - Elevated Surface */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
           {[
             { label: '총 소요 시간', value: course.total_duration },
             { label: '예상 경비', value: course.estimated_cost },
             { label: '방문 스팟', value: `${course.schedule.length}곳` }
           ].map((stat, idx) => (
             <div key={idx} className="bg-white p-10 rounded-[48px] shadow-premium flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: `${200 + idx*100}ms` }}>
               <span className="text-[13px] font-black text-gray-300 mb-4 uppercase tracking-[0.2em]">{stat.label}</span>
               <span className="text-3xl md:text-4xl font-black text-brand-secondary">{stat.value}</span>
             </div>
           ))}
        </div>
      </section>

      {/* Course Timeline - Editorial Vertical Flow */}
      <section className="inner-container">
        <div className="flex gap-8 mb-20 border-b border-gray-100 pb-6 whitespace-nowrap overflow-x-auto no-scrollbar">
          <button className="text-2xl font-black text-brand-primary border-b-4 border-brand-primary pb-4 px-6">1일차</button>
          <button className="text-2xl font-black text-gray-200 hover:text-gray-300 pb-4 px-6 transition-all">2일차</button>
          <button className="text-2xl font-black text-gray-200 hover:text-gray-300 pb-4 px-6 transition-all">3일차</button>
        </div>

        <div className="relative space-y-24 pl-6 md:pl-16">
          {/* Timeline Backbone */}
          <div className="absolute left-[38px] md:left-[83px] top-12 bottom-12 w-[1px] bg-gradient-to-b from-brand-primary via-brand-primary/20 to-transparent" />

          {course.schedule.map((item, idx) => (
            <div key={idx} className="relative group animate-fade-in-up" style={{ animationDelay: `${400 + idx*100}ms` }}>
              {/* Timeline Icon */}
              <div className="absolute left-[-45px] md:left-[-100px] top-4 w-20 h-20 bg-white border-2 border-brand-primary rounded-full z-10 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                 {item.type === 'food' || item.type === 'coffee' ? (
                   <span className="text-brand-primary text-[28px] font-black tracking-tighter">YU</span>
                 ) : (
                   <MapPin className="text-brand-primary" size={32} />
                 )}
              </div>

              <div className="md:ml-12 lg:ml-20">
                 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                   <div>
                     <div className="flex items-center gap-4 text-brand-primary text-[15px] font-black mb-4 uppercase tracking-widest">
                       <span>{item.time}</span>
                       <span className="w-2 h-2 bg-brand-primary/20 rounded-full" />
                       <span>머무는 시간 {item.stay_duration}</span>
                     </div>
                     <h3 className="text-3xl md:text-5xl font-black text-brand-secondary tracking-tight">{item.place_name}</h3>
                   </div>
                   <button className="glass-panel px-8 py-3.5 rounded-full text-[14px] font-black text-brand-secondary flex items-center gap-3 hover:bg-white transition-all shadow-sm">
                     <Smartphone size={18} /> 카카오맵 열기
                   </button>
                 </div>

                 {/* Editorial Hero Image */}
                 <div className="rounded-[48px] overflow-hidden mb-10 shadow-premium max-w-4xl group">
                   <img 
                    src={item.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200"} 
                    className="w-full aspect-[16/9] object-cover transition-transform duration-1000 group-hover:scale-105" 
                    alt={item.place_name} 
                   />
                 </div>
                 
                 <p className="text-xl text-gray-400 leading-relaxed font-medium max-w-3xl mb-12">
                   {item.description}
                 </p>

                 {/* Smart Move Pill */}
                 {idx < course.schedule.length - 1 && (
                   <div className="my-20 -ml-10 flex items-center gap-6">
                      <div className="w-6 h-6 rounded-full bg-white border-[6px] border-brand-primary shadow-lg scale-110" />
                      <div className="glass-panel px-8 py-4 rounded-full flex items-center gap-4 text-[15px] font-black text-brand-secondary">
                        <Navigation size={18} className="text-brand-primary animate-pulse" />
                        이동 {item.move_time} <span className="text-gray-300">({item.distance})</span>
                      </div>
                   </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Action Bar - Design System Spike */}
      <div className="fixed bottom-12 left-0 right-0 z-50 pointer-events-none">
        <div className="inner-container pointer-events-auto flex justify-center gap-8 py-2">
          <button className="flex-1 max-w-[320px] h-[84px] bg-brand-secondary text-white rounded-[32px] font-black text-[20px] shadow-2xl flex items-center justify-center gap-4 hover:scale-105 transition-all active:scale-95 group">
            <Save size={26} className="group-hover:translate-y-[-2px] transition-transform" /> 이 여정 저장하기
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="flex-1 max-w-[320px] h-[84px] glass-panel text-brand-secondary rounded-[32px] font-black text-[20px] flex items-center justify-center gap-4 hover:bg-white transition-all active:scale-95"
          >
            <RotateCcw size={26} /> 다른 일정 추천
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseResultPage;
