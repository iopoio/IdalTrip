import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LocationOn, 
  NearMe, 
  BookmarkIcon, 
  AutoAwesome,
  ChevronLeftIcon
} from '../components/Icons';
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

    // Load Kakao Map - Targets the background div
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
          <div class="px-3 py-1 bg-white rounded-lg shadow-xl text-[11px] font-bold whitespace-nowrap border border-primary/20">
            <span class="text-primary mr-1">${idx + 1}.</span> ${item.place_name}
          </div>
        `,
        yAnchor: 2.5
      });
      customOverlay.setMap(map);
    });

    // Draw Polyline with Brand Primary color
    const polyline = new (window as any).kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 4,
      strokeColor: '#ff6b35', // primary
      strokeOpacity: 0.8,
      strokeStyle: 'dashed'
    });
    polyline.setMap(map);

    // Fit bounds
    const bounds = new (window as any).kakao.maps.LatLngBounds();
    linePath.forEach(p => bounds.extend(p));
    map.setBounds(bounds);
  }, [course]);

  if (!course) return null;

  return (
    <div className="bg-background text-on-background overflow-hidden h-screen w-full relative">
      {/* Background Map Canvas */}
      <div id="map" className="absolute inset-0 z-0 bg-surface-container" />

      {/* Upper Overlay: Controls & Summary */}
      <div className="absolute top-24 left-8 right-8 flex justify-between items-start pointer-events-none z-10">
        <div className="flex flex-col gap-4 pointer-events-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 glass-panel rounded-full shadow-lg text-slate-700 font-bold hover:bg-white transition-all active:scale-95 group"
          >
            <ChevronLeftIcon className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" />
            목록으로 돌아가기
          </button>
          
          <div className="glass-panel p-6 rounded-xl shadow-xl w-80 border border-white/40">
            <h2 className="text-xl font-bold mb-1 font-headline">{course.theme.split(' ')[0]} 축제 코스</h2>
            <p className="text-slate-500 text-[11px] mb-4 font-medium uppercase tracking-wider">AI Recommended Course ({course.schedule.length} Spots)</p>
            <div className="flex items-center gap-2 p-3 bg-surface-container-low/50 rounded-lg backdrop-blur-md">
              <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
              <input 
                className="bg-transparent border-none text-sm w-full focus:ring-0 placeholder:text-slate-400 font-medium" 
                placeholder="주변 장소 검색..." 
                type="text"
              />
            </div>
          </div>
        </div>

        {/* Map Tools - Mockup 1:1 */}
        <div className="flex flex-col gap-2 pointer-events-auto items-end">
          <button className="w-12 h-12 glass-panel rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all">
            <LocationOn className="w-6 h-6 text-slate-600" />
          </button>
          <div className="flex flex-col glass-panel rounded-2xl shadow-lg border border-white/40 overflow-hidden">
            <button className="w-12 h-12 flex items-center justify-center hover:bg-white transition-all border-b border-white/20">
              <span className="text-xl font-bold text-slate-600">+</span>
            </button>
            <button className="w-12 h-12 flex items-center justify-center hover:bg-white transition-all">
              <span className="text-xl font-bold text-slate-600">-</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Overlay: Place Cards Horizontal Scroll */}
      <div className="absolute bottom-12 left-0 w-full px-8 pointer-events-none z-10">
        <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-8 pointer-events-auto px-4">
          {course.schedule.map((item, idx) => (
            <div 
              key={idx} 
              className="flex-shrink-0 w-[420px] glass-panel p-4 rounded-xl shadow-2xl flex gap-4 border border-white/40 group hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0 shadow-inner">
                <img 
                  className="w-full h-full object-cover" 
                  src={item.image_url || "https://images.unsplash.com/photo-1547036967-23d1199d3b1f?w=400"}
                  alt={item.place_name}
                />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-tighter">Spot {idx + 1}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.move_time || '이동 중'}</span>
                  </div>
                  <h3 className="text-lg font-bold mt-1 text-on-surface line-clamp-1">{item.place_name}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">{item.description}</p>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button className="flex-1 py-2.5 bg-secondary text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md">
                    <NearMe className="w-4 h-4 fill-current" />
                    카카오맵 네비
                  </button>
                  <button className="p-2.5 bg-surface-container-high rounded-lg hover:bg-surface-variant transition-all">
                    <BookmarkIcon className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating AI Prompt - Mockup 1:1 Signature */}
      <div className="fixed bottom-36 right-8 pointer-events-auto z-20">
        <div className="flex items-center gap-3 p-4 glass-panel rounded-2xl shadow-xl border border-primary/20 max-w-xs animate-bounce cursor-help hover:animate-none group hover:bg-white transition-colors duration-500">
          <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center text-white shrink-0 shadow-lg">
            <AutoAwesome className="w-6 h-6 fill-current" />
          </div>
          <p className="text-[11px] font-bold text-on-surface leading-tight font-body">
            "이 근처에 주차하기 편한 맛집도 알려드릴까요?"
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseMapPage;
