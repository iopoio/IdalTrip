import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NearMe, LocationOn } from '../components/Icons';
import { kakaoMapService } from '../services/kakaoMap';
import type { CourseResponse, Place, CourseItem } from '../types';

declare global {
  interface Window {
    kakao: any;
    Kakao: any;
  }
}

const CourseResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [mapReady, setMapReady] = useState(false);

  // localStorage + sessionStorage 복원
  useEffect(() => {
    if (location.state?.course) {
      const dataToSave = JSON.stringify({
        ...location.state,
        savedAt: new Date().toISOString(),
      });
      sessionStorage.setItem('lastCourse', dataToSave);
      localStorage.setItem('idaltrip_last_course', dataToSave);
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

  const { course, transport, places } = stateData || {};

  const dayCount = course
    ? Math.max(1, ...course.schedule.map((i: CourseItem) =>
        typeof i.day === 'number' ? i.day : parseInt(String(i.day)) || 1
      ))
    : 1;

  const getPlaceImage = (placeName: string) => {
    if (!places) return null;
    const match = places.find(p => placeName.includes(p.title) || p.title.includes(placeName));
    return match?.firstimage || null;
  };

  // 카카오맵 초기화 — SDK 로드 완료 대기
  useEffect(() => {
    if (!course || !mapRef.current) return;

    const initMap = () => {
      if (!window.kakao?.maps) return;

      const daySchedule = course.schedule.filter(
        (item: CourseItem) => (typeof item.day === 'number' ? item.day : parseInt(String(item.day)) || 1) === activeDay
      );
      const firstItem = daySchedule[0] || course.schedule[0];
      if (!firstItem?.lat || !firstItem?.lng) return;

      window.kakao.maps.load(() => {
        if (!mapRef.current) return;
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(firstItem.lat, firstItem.lng),
          level: 7,
        });

        const linePath: any[] = [];
        daySchedule.forEach((item: CourseItem, idx: number) => {
          if (!item.lat || !item.lng) return;
          const position = new window.kakao.maps.LatLng(item.lat, item.lng);
          linePath.push(position);
          new window.kakao.maps.CustomOverlay({
            position,
            content: `<div style="width:28px;height:28px;background:#ff6b35;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2);">${idx + 1}</div>`,
            yAnchor: 0.5,
          }).setMap(map);
        });

        if (linePath.length > 1) {
          new window.kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 3,
            strokeColor: '#ff6b35',
            strokeOpacity: 0.7,
            strokeStyle: 'dashed',
          }).setMap(map);

          const bounds = new window.kakao.maps.LatLngBounds();
          linePath.forEach(p => bounds.extend(p));
          map.setBounds(bounds);
        }

        setMapReady(true);
      });
    };

    // SDK 이미 로드된 경우 바로 실행, 아니면 1초 후 재시도
    if (window.kakao?.maps) {
      initMap();
    } else {
      const timer = setTimeout(initMap, 1000);
      return () => clearTimeout(timer);
    }
  }, [course, activeDay]);

  const handleShare = () => {
    if (!window.Kakao?.isInitialized()) {
      alert('카카오톡 공유 기능을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    const placeList = currentSchedule
      .map((item: CourseItem, idx: number) => `${idx + 1}. ${item.place_name}`)
      .join('\n');

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: course?.title || '이달의 여행 코스',
        description: `${course?.theme} · ${course?.total_duration}\n\n${placeList}\n\n이달여행에서 직접 검색해보세요!\n※ 추후 바로 공유할 수 있는 서비스를 구현 중입니다.`,
        imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=800&auto=format&fit=crop',
        link: {
          mobileWebUrl: window.location.origin,
          webUrl: window.location.origin,
        },
      },
      buttons: [
        {
          title: '이달여행에서 검색하기',
          link: {
            mobileWebUrl: window.location.origin,
            webUrl: window.location.origin,
          },
        },
      ],
    });
  };

  if (!course) return null;

  const currentSchedule = course.schedule.filter(
    (item: CourseItem) => (typeof item.day === 'number' ? item.day : parseInt(String(item.day)) || 1) === activeDay
  );

  return (
    <div className="bg-surface min-h-screen pb-24">
      {/* 지도 — 상단, 세로 스크롤하면 올라감 */}
      <div className="relative w-full h-[40vh] bg-surface-container-low">
        <div ref={mapRef} className="w-full h-full" />
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* 코스 제목 + 정보 */}
      <div className="px-5 pt-6 pb-4 bg-white">
        <h1 className="text-2xl font-headline font-extrabold text-on-surface">{course.title}</h1>
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm font-semibold text-primary">{course.theme} · {course.total_duration}</p>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEE500] text-[#371d1e] rounded-xl text-xs font-extrabold active:scale-95 transition-transform shadow-sm"
          >
            <span>💬</span>
            카카오톡 공유
          </button>
        </div>
      </div>

      {/* 여행 브리핑 + 예상비용 */}
      <div className="mx-4 my-4 bg-surface-container-lowest p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
        <div>
          <h4 className="font-extrabold text-sm mb-1 text-slate-800">여행 브리핑</h4>
          <p className="text-xs text-slate-600 leading-relaxed">{course.summary}</p>
        </div>
        <div className="border-t border-slate-100 pt-4">
          <h4 className="font-extrabold text-sm mb-1 text-slate-800">예상 비용</h4>
          <p className="text-xs text-slate-600 leading-relaxed">{course.estimated_cost}</p>
        </div>
      </div>

      {/* 1일차/2일차 탭 */}
      {dayCount > 1 && (
        <div className="px-4 mb-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {Array.from({ length: dayCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i + 1)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeDay === i + 1
                  ? 'bg-slate-800 text-white'
                  : 'bg-surface-container text-slate-500'
              }`}
            >
              {i + 1}일차
            </button>
          ))}
        </div>
      )}

      {/* 세로 타임라인 */}
      <div className="px-4 py-4">
        {currentSchedule.map((item: CourseItem, idx: number) => {
          const placeImage = getPlaceImage(item.place_name);
          const isLast = idx === currentSchedule.length - 1;

          return (
            <div key={idx}>
              {/* 이동시간 (첫 번째 제외) */}
              {idx > 0 && item.move_time && (
                <div className="flex items-center gap-2 py-1 pl-[22px] text-slate-400 text-xs">
                  <div className="w-px h-6 bg-slate-200 -ml-px" />
                  <span>🚗 {item.move_time}</span>
                </div>
              )}

              {/* 장소 카드 */}
              <div className="flex gap-3 relative">
                {/* 세로선 */}
                {!isLast && (
                  <div className="absolute left-[18px] top-[38px] bottom-[-16px] w-[2px] bg-slate-200 z-0" />
                )}

                {/* 번호 마커 */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {idx + 1}
                  </div>
                </div>

                {/* 카드 내용 */}
                <div className="flex-1 mb-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-primary font-bold">{item.time}</p>
                      <h3 className="font-bold text-sm text-slate-800 mt-0.5">{item.place_name}</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded font-bold">
                      {item.stay_duration}
                    </span>
                  </div>

                  {placeImage && (
                    <div className="w-full h-28 rounded-xl overflow-hidden mb-2">
                      <img src={placeImage} alt={item.place_name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {!placeImage && (
                    <div className="w-full h-16 rounded-xl bg-surface-container-low flex items-center justify-center mb-2">
                      <LocationOn className="w-6 h-6 text-primary opacity-30" />
                    </div>
                  )}

                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">{item.description}</p>

                  <a
                    href={transport === 'public'
                      ? `https://map.kakao.com/link/to/${encodeURIComponent(item.place_name)},${item.lat},${item.lng}`
                      : kakaoMapService.getDirectionUrl(item.place_name, item.lat, item.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#fae100] text-[#371d1e] py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <NearMe className="w-3.5 h-3.5" />
                    {transport === 'public' ? '카카오맵 길찾기' : '카카오내비 안내'}
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseResultPage;
