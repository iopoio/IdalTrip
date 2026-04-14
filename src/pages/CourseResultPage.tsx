import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  ShareIcon, 
  BookmarkIcon, 
  NearMe, 
  Schedule, 
  Payments, 
  LocationOn, 
  SmartToy, 
  ArrowForward 
} from '../components/Icons';
import type { CourseResponse } from '../types';

const CourseResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { course } = (location.state as { course: CourseResponse }) || {};

  if (!course) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-10 text-center bg-surface">
        <h2 className="text-2xl font-headline font-bold mb-10">코스 정보가 없습니다.</h2>
        <button 
          onClick={() => navigate('/')} 
          className="px-10 py-5 bg-primary text-white rounded-full font-bold shadow-xl"
        >
          처음으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed min-h-screen">
      <main className="pt-28 pb-12 px-8 max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-8">
          {/* Hero Header Section - Mockup 1:1 */}
          <header className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary-container/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">AI Curation</span>
                <h2 className="text-secondary font-bold text-sm tracking-tight">{course.theme} 코스</h2>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight leading-tight">
                {course.summary.split('. ')[0]}<br />{course.summary.split('. ')[1] || '당신만을 위한 특별한 여정'}
              </h1>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-surface-container-low px-5 py-3 rounded-xl text-sm font-medium hover:bg-surface-container-high transition-colors">
                <ShareIcon className="w-5 h-5" /> 공유하기
              </button>
              <button className="flex items-center gap-2 bg-primary-container text-on-primary px-6 py-3 rounded-xl text-sm font-bold hover:opacity-95 transition-all shadow-lg shadow-primary-container/20">
                <BookmarkIcon className="w-5 h-5 fill-current" /> 코스 저장
              </button>
            </div>
          </header>

          {/* Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Timeline - Multiple Day Support */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Day Selector - Mockup 1:1 */}
              <div className="flex p-1.5 bg-surface-container-low rounded-2xl w-fit">
                <button className="px-8 py-2.5 bg-white rounded-xl shadow-sm text-sm font-bold text-primary transition-all">Day 1</button>
                <button className="px-8 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-all">Day 2</button>
              </div>

              {/* Timeline Cards - Editorial Style */}
              <div className="relative pl-8 space-y-8">
                {/* Vertical Line - Mockup 1:1 */}
                <div className="absolute left-[7px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-primary/40 via-surface-container-highest to-transparent"></div>
                
                {course.schedule.map((item, idx) => (
                  <div key={idx} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[31px] top-6 w-4 h-4 rounded-full border-4 border-surface bg-primary shadow-sm z-10 transition-transform hover:scale-125 cursor-pointer"></div>
                    
                    <div className="bg-surface-container-lowest rounded-xl p-5 flex flex-col md:flex-row gap-6 hover:shadow-xl transition-shadow group border border-transparent hover:border-surface-variant/50">
                      <div className="w-full md:w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-surface-container-high">
                        <img 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          src={item.image_url || "https://images.unsplash.com/photo-1547036967-23d1199d3b1f?w=400"}
                          alt={item.place_name}
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-primary font-bold font-headline text-xs">{item.time}</span>
                          <button className="text-secondary text-xs font-semibold flex items-center gap-1 hover:underline">
                            <NearMe className="w-3.5 h-3.5" /> 카카오맵
                          </button>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-on-surface">{item.place_name}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">{item.description}</p>
                        <div className="flex gap-2 mt-auto">
                          <span className="bg-surface-container text-slate-500 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">{item.type}</span>
                          <span className="bg-surface-container text-slate-500 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">머무는시간 {item.stay_duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Smart Move Pill - Mockup 1:1 Extension */}
                    {idx < course.schedule.length - 1 && (
                      <div className="my-6 ml-4 flex items-center gap-4">
                        <div className="px-5 py-2 glass-panel rounded-full flex items-center gap-3 text-[11px] font-bold text-secondary shadow-sm">
                          <NearMe className="w-3.5 h-3.5 text-primary rotate-45" />
                          이동 {item.move_time} <span className="text-slate-300">({item.distance})</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Summary & Map - Mockup 1:1 */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Map Preview */}
              <div className="rounded-xl overflow-hidden bg-surface-container-high h-[320px] relative shadow-premium">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-WEUasDwmjkGJCzfxJrBWolVpr_AUTLmLzCYjgOehRTmhf35St-hZAx9RxjuAO17IX2saCUq_jBcYqfyJ-JyV9IfxVH4QELhTY3jX86FjKqmTeFVP446bJGCQ-SPI-U1szthge738tlbnV_7LtYUL9h3ITPmvnm2SuIL25FfSznfhzZCNdkOqlDuD_v6l4w3tgX8TvWIIH_akWyRWyEJHqYVMHV1UPUL_0J-yDIbzrT3fVMy2aCje5PMLu74Q0ToOshFsUR2v9n8"
                  alt="Course Map Preview"
                />
                  <button 
                    onClick={() => navigate(`/course/${id}/map`, { state: { course } })}
                    className="absolute bottom-4 right-4 glass-panel px-4 py-2 rounded-xl flex items-center gap-2 border border-white/20 hover:scale-105 transition-transform"
                  >
                    <LocationOn className="w-4.5 h-4.5 text-primary" />
                    <span className="text-xs font-bold">지도로 크게 보기</span>
                  </button>
              </div>

              {/* Course Stats Card */}
              <div className="bg-surface-container-lowest rounded-xl p-8 border border-surface-container-low shadow-sm">
                <h4 className="text-lg font-bold mb-6 text-on-surface font-headline">코스 요약</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-4 bg-surface-container-low rounded-xl">
                    <Schedule className="text-secondary w-6 h-6 mb-2" />
                    <span className="text-[10px] text-slate-400 font-bold mb-1 uppercase">총 소요시간</span>
                    <span className="text-sm font-extrabold text-on-surface">{course.total_duration}</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-surface-container-low rounded-xl">
                    <Payments className="text-secondary w-6 h-6 mb-2" />
                    <span className="text-[10px] text-slate-400 font-bold mb-1 uppercase">예상 비용</span>
                    <span className="text-sm font-extrabold text-on-surface">{course.estimated_cost}</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-surface-container-low rounded-xl">
                    <LocationOn className="text-secondary w-6 h-6 mb-2" />
                    <span className="text-[10px] text-slate-400 font-bold mb-1 uppercase">방문 장소</span>
                    <span className="text-sm font-extrabold text-on-surface">{course.schedule.length}곳</span>
                  </div>
                </div>
              </div>

              {/* AI Insight Bubble - DESIGN.MD Signature */}
              <div className="relative bg-primary/5 rounded-xl p-6 border border-primary/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white shadow-lg">
                    <SmartToy className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-primary text-sm uppercase tracking-wide">Idal AI 추천 사유</span>
                </div>
                <p className="text-sm leading-relaxed text-on-primary-container font-medium font-body italic">
                  "{course.summary}"
                </p>
                {/* Speech Bubble Tail */}
                <div className="absolute -top-3 left-10 w-6 h-6 bg-primary/5 rotate-45 border-l border-t border-primary/10 -z-10"></div>
              </div>

              {/* Next Action */}
              <button className="w-full bg-secondary text-on-secondary py-5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1a4b87] shadow-xl transition-all active:scale-[0.98]">
                이 코스로 여행 확정하기 <ArrowForward className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseResultPage;
