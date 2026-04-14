import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ShareIcon,
  BookmarkIcon,
  NearMe,
  Schedule,
  LocationOn,
  SmartToy,
  ArrowForward
} from '../components/Icons';
import { kakaoMapService } from '../services/kakaoMap';
import type { CourseResponse, Place } from '../types';

declare global {
  interface Window { kakao: any; }
}

const CourseResultPage = () => {
  useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const { course, places, duration } = (location.state as {
    course: CourseResponse;
    places?: Place[];
    duration?: string;
  }) || {};

  // 장소명으로 TourAPI 이미지 매칭
  const getPlaceImage = (placeName: string) => {
    if (!places) return null;
    const match = places.find(p => placeName.includes(p.title) || p.title.includes(placeName));
    return match?.firstimage || null;
  };

  // 카카오맵 미니맵 렌더링
  useEffect(() => {
    if (!course || !mapRef.current || !window.kakao) return;

    const firstItem = course.schedule[0];
    if (!firstItem?.lat || !firstItem?.lng) return;

    const map = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(firstItem.lat, firstItem.lng),
      level: 7
    });

    const linePath: any[] = [];

    course.schedule.forEach((item, idx) => {
      if (!item.lat || !item.lng) return;
      const position = new window.kakao.maps.LatLng(item.lat, item.lng);
      linePath.push(position);

      // 번호 마커 오버레이
      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content: `<div style="width:28px;height:28px;background:#ff6b35;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2);">${idx + 1}</div>`,
        yAnchor: 0.5
      });
      overlay.setMap(map);
    });

    // 경로 폴리라인
    if (linePath.length > 1) {
      new window.kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 3,
        strokeColor: '#ff6b35',
        strokeOpacity: 0.7,
        strokeStyle: 'dashed'
      }).setMap(map);

      // 모든 마커가 보이도록 범위 조절
      const bounds = new window.kakao.maps.LatLngBounds();
      linePath.forEach(p => bounds.extend(p));
      map.setBounds(bounds);
    }
  }, [course]);

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
    <div className="bg-surface text-on-surface min-h-screen">
      <main className="pt-28 pb-12 px-8 max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary-container/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">AI Curation</span>
                <span className="text-secondary font-bold text-sm">{course.theme}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight leading-tight">
                {course.title}
              </h1>
              <p className="text-slate-500 mt-2">{course.summary}</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-surface-container-low px-5 py-3 rounded-xl text-sm font-medium hover:bg-surface-container-high transition-colors">
                <ShareIcon className="w-4 h-4" /> 공유하기
              </button>
              <button className="flex items-center gap-2 bg-primary-container text-on-primary px-6 py-3 rounded-xl text-sm font-bold hover:opacity-95 transition-all shadow-lg shadow-primary-container/20">
                <BookmarkIcon className="w-4 h-4" /> 코스 저장
              </button>
            </div>
          </header>

          {/* Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Timeline */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Timeline */}
              <div className="relative pl-8 space-y-8">
                <div className="absolute left-[7px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-primary/40 via-surface-container-highest to-transparent"></div>

                {course.schedule.map((item, idx) => {
                  const placeImage = getPlaceImage(item.place_name);
                  return (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[31px] top-6 w-4 h-4 rounded-full border-4 border-surface shadow-sm z-10 ${idx === 0 ? 'bg-primary' : 'bg-surface-container-highest'}`}></div>

                      <div className="bg-surface-container-lowest rounded-xl p-5 flex flex-col md:flex-row gap-5 hover:shadow-xl transition-shadow group">
                        <div className="w-full md:w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-surface-container-high">
                          {placeImage ? (
                            <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={placeImage} alt={item.place_name} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                              <LocationOn className="w-8 h-8 text-primary opacity-30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-primary font-bold text-xs">{item.time}</span>
                            <a
                              href={kakaoMapService.getDirectionUrl(item.place_name, item.lat, item.lng)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-secondary text-xs font-semibold flex items-center gap-1 hover:underline"
                            >
                              <NearMe className="w-3.5 h-3.5" /> 카카오맵
                            </a>
                          </div>
                          <h3 className="text-lg font-bold mb-1 text-on-surface">{item.place_name}</h3>
                          <p className="text-sm text-slate-500 mb-3">{item.description}</p>
                          <div className="flex gap-2 mt-auto">
                            <span className="bg-surface-container text-slate-500 px-2.5 py-1 rounded-lg text-[10px] font-bold">{item.type === 'food' ? '맛집' : item.type === 'festival' ? '축제' : '관광'}</span>
                            <span className="bg-surface-container text-slate-500 px-2.5 py-1 rounded-lg text-[10px] font-bold">{item.stay_duration}</span>
                          </div>
                        </div>
                      </div>

                      {idx < course.schedule.length - 1 && item.move_time && (
                        <div className="my-4 ml-4">
                          <span className="px-4 py-1.5 glass-panel rounded-full text-[11px] font-bold text-secondary shadow-sm">
                            이동 {item.move_time} ({item.distance})
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Map + Summary */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* 카카오맵 */}
              <div ref={mapRef} className="rounded-xl overflow-hidden bg-surface-container-high h-[320px] relative shadow-lg">
                {/* 카카오맵 SDK가 렌더링할 영역 */}
              </div>

              {/* 코스 요약 */}
              <div className="bg-surface-container-lowest rounded-xl p-8 border border-surface-container-low">
                <h4 className="text-lg font-bold mb-6 font-headline">코스 요약</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center p-4 bg-surface-container-low rounded-xl">
                    <Schedule className="text-secondary w-5 h-5 mb-2" />
                    <span className="text-[10px] text-slate-400 font-bold mb-1">총 소요시간</span>
                    <span className="text-sm font-extrabold">{course.total_duration}</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-surface-container-low rounded-xl">
                    <LocationOn className="text-secondary w-5 h-5 mb-2" />
                    <span className="text-[10px] text-slate-400 font-bold mb-1">방문 장소</span>
                    <span className="text-sm font-extrabold">{course.schedule.length}곳</span>
                  </div>
                </div>
              </div>

              {/* AI 추천 사유 */}
              <div className="relative bg-primary/5 rounded-xl p-6 border border-primary/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white">
                    <SmartToy className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-primary text-sm">AI 추천 사유</span>
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {course.summary}
                </p>
              </div>

              {/* 예상 비용 상세 */}
              <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-container-low">
                <h4 className="text-sm font-bold mb-3 font-headline">예상 비용 상세</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {course.estimated_cost}
                </p>
              </div>

              {/* 확정 버튼 */}
              <button className="w-full bg-secondary text-on-secondary py-5 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg transition-all active:scale-[0.98]">
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
