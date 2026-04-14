import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Navigation, ParkingCircle, Phone, Loader2 } from 'lucide-react';
import { kakaoMapService } from '../services/kakaoMap';
import type { CourseResponse, CourseItem } from '../types';

declare global {
  interface Window {
    kakao: any;
  }
}

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;

const CourseMapPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mapRef = useRef<HTMLDivElement>(null);
  
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // Data from previous page
  const course = location.state?.course as CourseResponse;
  const activeDay = location.state?.activeDay as number || 1;
  const currentItems = course?.days.find(d => d.day === activeDay)?.items || [];

  // Dynamic SDK Loading
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      setSdkLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        setSdkLoaded(true);
      });
    };
  }, []);

  // Initialize Map and Render Overlays
  useEffect(() => {
    if (!sdkLoaded || !mapRef.current || currentItems.length === 0) return;

    const { kakao } = window;
    const container = mapRef.current;
    
    // Set center to first item
    const options = {
      center: new kakao.maps.LatLng(currentItems[0].lat, currentItems[0].lng),
      level: 5,
    };

    const map = new kakao.maps.Map(container, options);
    setMapInstance(map);

    const linePath: any[] = [];
    const bounds = new kakao.maps.LatLngBounds();

    currentItems.forEach((item: CourseItem, idx: number) => {
      const position = new kakao.maps.LatLng(item.lat, item.lng);
      linePath.push(position);
      bounds.extend(position);

      // Custom Overlay for markers (Numbered)
      const content = `
        <div class="custom-marker" style="
          background-color: #ab3500; 
          color: white; 
          border-radius: 50%; 
          width: 32px; 
          height: 32px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-weight: bold;
          box-shadow: 0 4px 10px rgba(171, 53, 0, 0.4);
          border: 2px solid white;
        ">
          ${idx + 1}
        </div>
      `;

      const customOverlay = new kakao.maps.CustomOverlay({
        position: position,
        content: content,
        yAnchor: 0.5
      });
      customOverlay.setMap(map);
    });

    // Draw Polyline
    const polyline = new kakao.maps.Polyline({
      path: linePath,
      strokeWeight: 4,
      strokeColor: '#ab3500',
      strokeOpacity: 0.6,
      strokeStyle: 'dashed'
    });
    polyline.setMap(map);

    // Fit to bounds
    map.setBounds(bounds);

  }, [sdkLoaded, currentItems]);

  const handleNavi = (item: CourseItem) => {
    const url = kakaoMapService.getDirectionUrl(item.placeName, item.lat, item.lng);
    window.open(url, '_blank');
  };

  if (!course) {
     return <div className="p-20 text-center">동선 데이터가 존재하지 않습니다.</div>;
  }

  return (
    <div className="relative w-full h-screen bg-surface-container overflow-hidden">
      {/* Back Button Overlay */}
      <div className="absolute top-24 left-8 z-40">
        <button 
          onClick={() => navigate(-1)}
          className="p-4 bg-white/90 backdrop-blur shadow-vibrant rounded-2xl hover:scale-110 active:scale-95 transition-all text-on-surface"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Map SDK Container */}
      <div ref={mapRef} className="w-full h-full" />
      
      {!sdkLoaded && (
        <div className="absolute inset-0 z-30 bg-surface/50 backdrop-blur-md flex flex-col items-center justify-center gap-4">
           <Loader2 size={48} className="animate-spin text-primary" />
           <p className="font-bold text-on-surface-variant">지도를 일깨우는 중입니다...</p>
        </div>
      )}

      {/* Bottom Floating Carousel */}
      <div className="absolute bottom-0 left-0 w-full z-30 pb-12 animate-in slide-in-from-bottom duration-700">
        <div className="overflow-x-auto no-scrollbar scroll-smooth px-8">
           <div className="flex gap-6 min-w-max">
              {currentItems.map((item, idx) => (
                <div 
                  key={idx}
                  className="w-[360px] bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/50 space-y-6 hover:translate-y-[-8px] transition-all cursor-pointer"
                  onClick={() => {
                     if (mapInstance) {
                       mapInstance.panTo(new window.kakao.maps.LatLng(item.lat, item.lng));
                     }
                  }}
                >
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                            {idx + 1}
                         </div>
                         <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded">
                           {item.category === 'festival' ? 'Main Event' : item.category}
                         </span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleNavi(item); }} className="p-3 bg-surface-container-low rounded-2xl text-on-surface-variant hover:text-primary transition-colors">
                         <Navigation size={20} />
                      </button>
                   </div>

                   <div className="space-y-1">
                      <h4 className="text-2xl font-bold text-on-surface tracking-tight">{item.placeName}</h4>
                      <p className="text-on-surface-variant text-sm opacity-70 italic font-body">{item.memo}</p>
                   </div>

                   {item.parkingInfo && (
                     <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-xl text-xs font-bold w-fit">
                        <ParkingCircle size={16} />
                        <span>인근 주차 공간 확인 가능</span>
                     </div>
                   )}

                   <div className="pt-2 flex gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleNavi(item); }}
                        className="flex-grow py-5 bg-on-surface text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-soft"
                      >
                        <Navigation size={18} />
                        <span>카카오내비</span>
                      </button>
                      <button className="p-5 bg-white border border-surface-container rounded-2xl text-on-surface hover:bg-surface-container transition-all">
                         <Phone size={20} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CourseMapPage;
