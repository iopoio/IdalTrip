import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Map, Share2, Heart, RefreshCcw, Car, Train, CalendarDays, Sparkles, Loader2, Info } from 'lucide-react';
import AiBubble from '../components/AiBubble';
import TimelineItem from '../components/TimelineItem';
import CourseSummary from '../components/CourseSummary';
import { kakaoMapService } from '../services/kakaoMap';
import { parkingApi } from '../services/parkingApi';
import { formatDuration, formatDistance } from '../lib/utils';
import type { CourseResponse, CourseItem } from '../types';

const CourseResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  
  // Received from FestivalDetailPage
  const initialCourse = location.state?.course as CourseResponse | undefined;
  const initialTransport = location.state?.transport as 'car' | 'public' | undefined;

  // Use initialCourse as a stable constant if it exists
  const course = initialCourse;
  const [transport, setTransport] = useState<'car' | 'public'>(initialTransport || 'car');
  const [activeDay, setActiveDay] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState({ duration: '계산 중', distance: '계산 중', count: 0 });

  useEffect(() => {
    if (!course) return;

    const processRouteDetails = async () => {
      setLoading(true);
      const currentDayData = course.days.find(d => d.day === activeDay);
      if (!currentDayData) return;

      const updatedItems = [...currentDayData.items];
      let totalSeconds = 0;
      let totalMeters = 0;

      for (let i = 0; i < updatedItems.length - 1; i++) {
        const origin = { lat: updatedItems[i].lat, lng: updatedItems[i].lng };
        const dest = { lat: updatedItems[i+1].lat, lng: updatedItems[i+1].lng };
        
        const route = transport === 'car' 
          ? await kakaoMapService.getCarRoute(origin, dest) 
          : await kakaoMapService.getPublicRoute(origin, dest);

        if (route) {
          totalSeconds += route.duration;
          totalMeters += route.distance;
          updatedItems[i+1].duration = formatDuration(route.duration);
        }

        if (transport === 'car' && updatedItems[i+1].category !== 'parking') {
           const parkings = await parkingApi.fetchNearbyParking(updatedItems[i+1].lat, updatedItems[i+1].lng);
           if (parkings.length > 0) {
             updatedItems[i+1].parkingInfo = parkings[0];
           }
        }
      }

      setSummaryData({
        duration: formatDuration(totalSeconds + (updatedItems.length * 5400)), 
        distance: formatDistance(totalMeters),
        count: updatedItems.length
      });
      setLoading(false);
    };

    processRouteDetails();
  }, [course, activeDay, transport]);

  if (!course) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center">
           <Info size={40} className="text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-on-surface">코스 정보가 없습니다</h2>
          <p className="text-on-surface-variant max-w-xs">상세 페이지에서 AI 코스를 먼저 생성해 주세요.</p>
        </div>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-on-surface text-white rounded-full font-bold">홈으로 이동</button>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low min-h-screen">
      <div className="max-w-[1920px] mx-auto px-8 py-32 space-y-12">
        
        {/* Header Section */}
        <section className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16 animate-in slide-in-from-top duration-500">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase">
              <Sparkles size={18} className="fill-primary/20" />
              <span>AI Optimized Course</span>
            </div>
            <h1 className="text-5xl font-headline font-bold text-on-surface tracking-tight leading-tight">
              {course.title}
            </h1>
            <p className="text-on-surface-variant font-medium text-lg opacity-70">당신만을 위해 정교하게 설계된 맞춤형 일정입니다.</p>
          </div>
          <div className="flex gap-3">
            <button className="p-5 bg-white rounded-2xl shadow-soft text-on-surface-variant hover:text-primary transition-all hover:scale-105">
              <Share2 size={24} />
            </button>
            <button className="px-8 py-4 bg-white rounded-2xl shadow-soft text-primary font-bold flex items-center gap-3 hover:scale-105 transition-all">
              <Heart size={20} className="fill-primary" />
              <span>74</span>
            </button>
          </div>
        </section>

        {/* AI Insight Section */}
        <section className="max-w-4xl pt-8">
           <AiBubble content={course.summary} />
        </section>

        {/* Control & Summary Bar */}
        <section className="space-y-8 animate-in fade-in duration-700 delay-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-surface-container w-full md:w-auto">
               {course.days.map((d: { day: number }) => (
                 <button 
                  key={d.day}
                  onClick={() => setActiveDay(d.day)}
                  className={`flex-grow md:flex-none px-10 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeDay === d.day ? 'bg-on-surface text-white shadow-soft' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                 >
                   <CalendarDays size={18} />
                   <span>Day {d.day}</span>
                 </button>
               ))}
            </div>

            <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-surface-container w-full md:w-auto">
               <button 
                onClick={() => setTransport('car')}
                className={`flex-grow md:flex-none px-12 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${transport === 'car' ? 'bg-primary text-white shadow-vibrant' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
               >
                 <Car size={18} />
                 <span>자차</span>
               </button>
               <button 
                onClick={() => setTransport('public')}
                className={`flex-grow md:flex-none px-12 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${transport === 'public' ? 'bg-primary text-white shadow-vibrant' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
               >
                 <Train size={18} />
                 <span>대중교통</span>
               </button>
            </div>
          </div>

          <CourseSummary 
            duration={summaryData.duration} 
            distance={summaryData.distance} 
            count={summaryData.count} 
            theme={course.days[activeDay-1]?.items[0]?.category === 'festival' ? '축제 중심 힐링' : '커스텀 투어'} 
          />
        </section>

        {/* Timeline Section */}
        <section className="max-w-5xl py-12 relative min-h-[400px]">
           {loading && (
             <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4 rounded-3xl">
                <Loader2 size={40} className="animate-spin text-primary" />
                <p className="font-bold text-on-surface-variant">경로를 실시간으로 분석 중입니다...</p>
             </div>
           )}
           <div className="space-y-4">
              {course.days.find(d => d.day === activeDay)?.items.map((item: CourseItem, idx: number, arr: CourseItem[]) => (
                <TimelineItem 
                  key={idx}
                  index={idx + 1}
                  isLast={idx === arr.length - 1}
                  {...item}
                  name={item.placeName}
                  description={item.memo || ''}
                />
              ))}
           </div>
        </section>

        {/* Final Actions */}
        <section className="flex flex-col md:flex-row gap-4 pt-12 pb-32">
          <button 
            onClick={() => navigate(`/course/${id}/map`, { state: { course, activeDay, transport } })}
            className="flex-grow py-8 bg-on-surface text-white rounded-[2.5rem] text-2xl font-bold shadow-soft hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
          >
            <Map size={32} className="group-hover:rotate-6 transition-transform" />
            <span>지도로 상세 동선 확인하기</span>
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="px-12 py-8 bg-white border border-surface-container text-on-surface rounded-[2.5rem] text-2xl font-bold hover:bg-surface-container transition-all flex items-center justify-center gap-4"
          >
            <RefreshCcw size={32} />
            <span>조건 변경하기</span>
          </button>
        </section>

      </div>
    </div>
  );
};

export default CourseResultPage;
