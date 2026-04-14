import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation } from 'lucide-react';
import type { CourseResponse } from '../types';

declare global {
  interface Window {
    kakao: any;
  }
}

const CourseMapPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { course } = (location.state as { course: CourseResponse }) || {};

  useEffect(() => {
    if (!course || !course.schedule || course.schedule.length === 0) return;

    // Load Kakao Map
    const container = document.getElementById('map');
    const firstPlace = course.schedule[0];
    const options = {
      center: new (window as any).kakao.maps.LatLng(firstPlace.lat, firstPlace.lng),
      level: 5
    };

    const map = new (window as any).kakao.maps.Map(container, options);

    // Create markers for schedule items
    const linePath: any[] = [];
    
    course.schedule.forEach((item, idx) => {
      const position = new (window as any).kakao.maps.LatLng(item.lat, item.lng);
      linePath.push(position);

      new (window as any).kakao.maps.Marker({
        position,
        map: map
      });

      const customOverlay = new (window as any).kakao.maps.CustomOverlay({
        position,
        content: `
          <div class="bg-white px-3 py-1 rounded-full shadow-lg border-2 border-brand-primary text-[11px] font-black pointer-events-none">
            ${idx + 1}. ${item.place_name}
          </div>
        `,
        yAnchor: 2.5
      });
      customOverlay.setMap(map);
    });

    // Draw Polyline
    const polyline = new (window as any).kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 4,
      strokeColor: '#ff6b35',
      strokeOpacity: 0.8,
      strokeStyle: 'solid'
    });
    polyline.setMap(map);

    // Fit bounds
    const bounds = new (window as any).kakao.maps.LatLngBounds();
    linePath.forEach(p => bounds.extend(p));
    map.setBounds(bounds);
  }, [course]);

  if (!course) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <h2 className="text-xl font-bold">코스 정보가 없습니다.</h2>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col pt-24 bg-white">
      <div className="inner-container flex items-center gap-8 py-8 overflow-hidden">
        <button 
          onClick={() => navigate(-1)} 
          className="w-14 h-14 bg-white rounded-full shadow-premium flex items-center justify-center text-brand-secondary hover:text-brand-primary transition-all active:scale-95"
        >
          <ArrowLeft size={28} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-brand-secondary tracking-tight">{course.title} 경로 미리보기</h1>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">AI Optimized Routing Map</p>
        </div>
      </div>

      <div id="map" className="flex-1 w-full bg-gray-50" />

      {/* Floating Navigator Panel */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-sm px-8 pointer-events-none">
         <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[48px] shadow-premium pointer-events-auto border border-white/20 animate-fade-in-up">
            <div className="flex items-center gap-6 mb-8">
               <div className="w-16 h-16 bg-brand-primary rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-brand-primary/30">
                  <Navigation size={32} />
               </div>
               <div>
                  <span className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] block mb-1">Navigation</span>
                  <h3 className="text-[20px] font-black text-brand-secondary">총 {course.schedule.length}개의 포인트</h3>
               </div>
            </div>
            <button className="cta-primary w-full py-5 text-[16px] font-black shadow-brand-primary/30">탐색 시작</button>
         </div>
      </div>
    </div>
  );
};

export default CourseMapPage;
