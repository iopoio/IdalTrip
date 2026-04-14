import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Navigation, MapPin, Sparkles } from 'lucide-react';
import type { CourseResponse } from '../types';

declare global {
  interface window {
    kakao: any;
  }
}

const CourseMapPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { course } = (location.state as { course: CourseResponse }) || {};

  useEffect(() => {
    if (!course) return;

    // Load Kakao Map
    const container = document.getElementById('map');
    const options = {
      center: new (window as any).kakao.maps.LatLng(course.schedule[0].lat, course.schedule[0].lng),
      level: 5
    };

    const map = new (window as any).kakao.maps.Map(container, options);

    // Create markers for schedule items
    const linePath: any[] = [];
    
    course.schedule.forEach((item, idx) => {
      const position = new (window as any).kakao.maps.LatLng(item.lat, item.lng);
      linePath.push(position);

      const marker = new (window as any).kakao.maps.Marker({
        position,
        map: map
      });

      const customOverlay = new (window as any).kakao.maps.CustomOverlay({
        position,
        content: `
          <div class="bg-white px-3 py-1 rounded-full shadow-lg border-2 border-brand-primary text-[11px] font-black">
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
    return <div className="p-10 text-center">코스 정보가 없습니다.</div>;
  }

  return (
    <div className="h-screen flex flex-col pt-24">
      <div className="inner-container flex items-center gap-6 py-6 overflow-hidden">
        <button 
          onClick={() => navigate(-1)} 
          className="w-12 h-12 bg-white rounded-full shadow-premium flex items-center justify-center text-brand-secondary hover:text-brand-primary transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-brand-secondary">{course.title} 경로 확인</h1>
          <p className="text-sm text-gray-400 font-bold">AI가 설계한 최적의 이동 동선입니다.</p>
        </div>
      </div>

      <div id="map" className="flex-1 w-full bg-gray-100" />

      {/* Mini info overlay */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 pointer-events-none">
         <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[40px] shadow-premium pointer-events-auto border border-white/20">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-white">
                  <Navigation size={24} />
               </div>
               <div>
                  <span className="text-[11px] font-black text-brand-primary uppercase tracking-widest block">Real-time Path</span>
                  <h3 className="text-lg font-black text-brand-secondary">총 {course.schedule.length}개의 경유지</h3>
               </div>
            </div>
            <button className="cta-primary w-full py-4 text-[15px]">경로 안내 시작하기</button>
         </div>
      </div>
    </div>
  );
};

export default CourseMapPage;
