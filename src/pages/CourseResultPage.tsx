import { useEffect, useRef, useState } from 'react';
import type { UIEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { NearMe, LocationOn } from '../components/Icons';
import { kakaoMapService } from '../services/kakaoMap';
import type { CourseResponse, Place, CourseItem } from '../types';

declare global {
  interface Window { kakao: any; }
}

const CourseResultPage = () => {
  useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // 세션 스토리지 복원 로직
  useEffect(() => {
    if (location.state?.course) {
      sessionStorage.setItem('lastCourse', JSON.stringify(location.state));
    }
  }, [location.state]);

  const stateData = (location.state || JSON.parse(sessionStorage.getItem('lastCourse') || 'null')) as {
    course: CourseResponse;
    places?: Place[];
    duration?: string;
    transport?: string;
  } | null;
  
  useEffect(() => {
    if (!stateData) navigate('/');
  }, [stateData, navigate]);

  const { course, transport, places, duration } = stateData || {};

  const dayCountFromDuration = duration === 'day' ? 1 : duration === '1night' ? 2 : 3;
  const dayCountFromSchedule = course
    ? Math.max(1, ...course.schedule.map((i: CourseItem) => (typeof i.day === 'number' ? i.day : parseInt(String(i.day)) || 1)))
    : 1;
  const dayCount = Math.max(dayCountFromDuration, dayCountFromSchedule);

  const getPlaceImage = (placeName: string) => {
    if (!places) return null;
    const match = places.find(p => placeName.includes(p.title) || p.title.includes(placeName));
    return match?.firstimage || null;
  };

  useEffect(() => {
    if (!course || !mapRef.current || !window.kakao) return;

    const daySchedule = course.schedule.filter((item: CourseItem) => (typeof item.day === 'number' ? item.day : parseInt(String(item.day)) || 1) === activeDay);
    const firstItem = daySchedule[0] || course.schedule[0];
    if (!firstItem?.lat || !firstItem?.lng) return;

    if (!mapInstance) {
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(firstItem.lat, firstItem.lng),
        level: 7
      });
      setMapInstance(map);
    } else {
      mapRef.current.innerHTML = '';
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(firstItem.lat, firstItem.lng),
        level: 7
      });
      setMapInstance(map);
    }
  }, [course, activeDay]);

  useEffect(() => {
    if (!mapInstance || !course) return;
    
    const linePath: any[] = [];
    course.schedule.filter((item: CourseItem) => (typeof item.day === 'number' ? item.day : parseInt(String(item.day)) || 1) === activeDay).forEach((item: CourseItem, idx: number) => {
      if (!item.lat || !item.lng) return;
      const position = new window.kakao.maps.LatLng(item.lat, item.lng);
      linePath.push(position);

      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content: `<div style="width:28px;height:28px;background:#ff6b35;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2);">${idx + 1}</div>`,
        yAnchor: 0.5
      });
      overlay.setMap(mapInstance);
    });
    
    if (linePath.length > 1) {
      new window.kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 3,
        strokeColor: '#ff6b35',
        strokeOpacity: 0.7,
        strokeStyle: 'dashed'
      }).setMap(mapInstance);

      const bounds = new window.kakao.maps.LatLngBounds();
      linePath.forEach(p => bounds.extend(p));
      mapInstance.setBounds(bounds);
    }
  }, [mapInstance, course, activeDay]);

  const handleCardScroll = (e: UIEvent<HTMLDivElement>) => {
    if (!mapInstance || !course) return;
    const scrollLeft = e.currentTarget.scrollLeft;
    const cardWidth = 280 + 16; // width + gap
    const activeIdx = Math.round(scrollLeft / cardWidth);
    
    const daySchedule = course.schedule.filter((item: CourseItem) => (typeof item.day === 'number' ? item.day : parseInt(String(item.day)) || 1) === activeDay);
    const activeItem = daySchedule[activeIdx];
    
    if (activeItem?.lat && activeItem?.lng) {
      mapInstance.panTo(new window.kakao.maps.LatLng(activeItem.lat, activeItem.lng));
    }
  };

  if (!course) return null;

  const currentSchedule = course.schedule.filter((item: CourseItem) => (typeof item.day === 'number' ? item.day : parseInt(String(item.day)) || 1) === activeDay);

  return (
    <div className="bg-[#FFF8F3] min-h-screen relative flex flex-col">
      {/* Sticky Map */}
      <div className="sticky top-0 w-full h-[55vh] z-0">
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Swipeable Bottom Content */}
      <div className="relative z-10 flex-1 bg-white rounded-t-3xl -mt-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col">
        {/* Handle Bar */}
        <div className="w-full py-3 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        <div className="px-5 pb-6">
          <h1 className="text-2xl font-headline font-extrabold text-on-surface mb-2">{course.title}</h1>
          <p className="text-sm font-semibold text-primary">{course.theme} · {course.total_duration}</p>
        </div>

        {dayCount > 1 && (
          <div className="px-5 mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
             {Array.from({ length: dayCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveDay(i + 1)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                    activeDay === i + 1 
                    ? "bg-slate-800 text-white" 
                    : "bg-surface-container text-slate-500"
                  }`}
                >
                  {i + 1}일차
                </button>
              ))}
          </div>
        )}

        {/* Horizontal Cards */}
        <div 
          className="flex gap-4 px-5 pb-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          onScroll={handleCardScroll}
        >
          {currentSchedule.map((item: CourseItem, idx: number) => {
             const placeImage = getPlaceImage(item.place_name);
             return (
               <div key={idx} className="flex-shrink-0 w-[280px] bg-white border border-slate-100 rounded-2xl p-4 shadow-sm snap-center flex flex-col">
                 <div className="flex gap-3 mb-3">
                    <div className="w-16 h-16 rounded-xl bg-surface-container-high overflow-hidden flex-shrink-0">
                      {placeImage ? <img src={placeImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10"><LocationOn className="w-6 h-6 text-primary opacity-30" /></div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[9px] font-bold">{idx + 1}</span>
                          <span className="text-xs font-bold text-slate-500">{item.time}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-1.5 py-0.5 rounded">{item.stay_duration}</span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-800 truncate mb-0.5">{item.place_name}</h3>
                      <p className="text-[10px] text-slate-400 truncate">{item.description}</p>
                    </div>
                 </div>

                 <div className="mt-auto pt-3 border-t border-slate-50">
                   <a 
                      href={transport === 'public' 
                        ? `https://map.kakao.com/link/to/${encodeURIComponent(item.place_name)},${item.lat},${item.lng}`
                        : kakaoMapService.getDirectionUrl(item.place_name, item.lat, item.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#fae100] text-[#371d1e] py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                   >
                     <NearMe className="w-3.5 h-3.5" />
                     {transport === 'public' ? '카카오맵 길찾기' : '카카오내비 안내'}
                   </a>
                 </div>
               </div>
             )
          })}
        </div>
        
        {/* Course Summary */}
        <div className="px-5 pb-32">
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
            <div>
              <h4 className="font-extrabold text-sm mb-2 text-slate-800">여행 브리핑</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{course.summary}</p>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <h4 className="font-extrabold text-sm mb-2 text-slate-800">예상 비용</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{course.estimated_cost}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CourseResultPage;
