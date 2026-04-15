import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { tourApi } from '../services/tourApi';
import { geminiService } from '../services/gemini';
import { kakaoMapService } from '../services/kakaoMap';
import type { SpotWithStatus, Place } from '../types';

const checkIsOpen = (intro: any, contentTypeId: string, selectedDate: string): boolean => {
  if (!intro) return true; // 정보 없으면 기본 운영으로 표시

  const date = new Date(selectedDate);
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayName = dayNames[date.getDay()];

  const restDate = contentTypeId === '39' ? intro.restdatefood : intro.restdate;
  if (!restDate) return true;

  // 휴무일 문자열에 오늘 요일이 포함되면 휴무
  if (restDate.includes(dayName)) return false;
  if (restDate.includes('연중무휴')) return true;

  return true; // 판단 불가 시 운영으로 표시
};

const ExploreResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const region = searchParams.get('region') || '강원';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [spots, setSpots] = useState<SpotWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'전체' | '축제' | '관광지' | '맛집'>('전체');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [origin, setOrigin] = useState('');
  const [transport, setTransport] = useState<'car' | 'public'>('car');
  const [duration, setDuration] = useState<'day' | '1night' | '2night'>('day');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {

      // 병렬로 데이터 조회
      const [festivals, attractions, foods] = await Promise.all([
        tourApi.fetchFestivalsByRegionAndDate(region, date),
        tourApi.fetchPlacesByRegion(region, '12'),
        tourApi.fetchPlacesByRegion(region, '39'),
      ]);

      // 축제: 날짜 필터는 API에서 이미 처리됨
      const festivalSpots: SpotWithStatus[] = festivals.map(f => ({
        ...f,
        contenttypeid: '15',
        isOpen: true, // 축제는 날짜 범위 내면 운영중
      }));

      // 관광지 + 맛집: detailIntro2로 운영 여부 체크 (상위 10개씩만)
      const checkIntro = async (items: Place[], typeId: string): Promise<SpotWithStatus[]> => {
        return Promise.all(
          items.slice(0, 10).map(async item => {
            const intro = await tourApi.fetchDetailIntro(item.contentid, typeId);
            return {
              ...item,
              contenttypeid: typeId,
              isOpen: checkIsOpen(intro, typeId, date),
              openTime: typeId === '39' ? intro?.opentimefood : intro?.usetime,
              restDate: typeId === '39' ? intro?.restdatefood : intro?.restdate,
              firstMenu: typeId === '39' ? intro?.firstmenu : undefined,
            };
          })
        );
      };

      const [attractionSpots, foodSpots] = await Promise.all([
        checkIntro(attractions, '12'),
        checkIntro(foods, '39'),
      ]);

      // 카카오 fallback — 관광지 3개 미만이면 보완
      let finalAttractionSpots = attractionSpots;
      if (attractionSpots.length < 3) {
        const kakaoResults = await kakaoMapService.searchLocal(`${region} 관광명소`, 'AT4', 8);
        const kakaoSpots: SpotWithStatus[] = kakaoResults
          .filter(doc => !attractionSpots.some(a => a.title === doc.place_name)) // 중복 제거
          .slice(0, 8 - attractionSpots.length)
          .map(doc => ({
            contentid: `kakao_${doc.id}`,
            title: doc.place_name,
            addr1: doc.road_address_name || doc.address_name,
            mapx: doc.x,
            mapy: doc.y,
            firstimage: '',
            contenttypeid: '12',
            isOpen: true,
            openTime: undefined,
            restDate: undefined,
            firstMenu: undefined,
          }));
        finalAttractionSpots = [...attractionSpots, ...kakaoSpots];
      }

      // 카카오 fallback — 맛집 3개 미만이면 보완
      let finalFoodSpots = foodSpots;
      if (foodSpots.length < 3) {
        const kakaoResults = await kakaoMapService.searchLocal(`${region} 맛집`, 'FD6', 8);
        const kakaoSpots: SpotWithStatus[] = kakaoResults
          .filter(doc => !foodSpots.some(f => f.title === doc.place_name)) // 중복 제거
          .slice(0, 8 - foodSpots.length)
          .map(doc => ({
            contentid: `kakao_${doc.id}`,
            title: doc.place_name,
            addr1: doc.road_address_name || doc.address_name,
            mapx: doc.x,
            mapy: doc.y,
            firstimage: '',
            contenttypeid: '39',
            isOpen: true,
            openTime: undefined,
            restDate: undefined,
            firstMenu: doc.category_name.split('>').pop()?.trim() || undefined,
          }));
        finalFoodSpots = [...foodSpots, ...kakaoSpots];
      }

      const allSpots = [...festivalSpots, ...finalAttractionSpots, ...finalFoodSpots];
      setSpots(allSpots);

      // 기본 선택: 운영중인 것들 중 상위 3개
      const openSpots = allSpots.filter(s => s.isOpen !== false).slice(0, 3);
      setSelectedIds(openSpots.map(s => s.contentid));
      } catch (err) {
        console.error('ExploreResultPage load error:', err);
        setError('데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [region, date]);

  const filteredSpots = activeTab === '전체' ? spots : spots.filter(s => {
    if (activeTab === '축제') return s.contenttypeid === '15';
    if (activeTab === '관광지') return s.contenttypeid === '12';
    if (activeTab === '맛집') return s.contenttypeid === '39';
    return true;
  });

  const toggleSpot = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleGenerateCourse = async () => {
    const selected = spots.filter(s => selectedIds.includes(s.contentid));
    setGenerating(true);
    try {
      const response = await geminiService.generateCourse({
        festivalTitle: selected.find(s => s.contenttypeid === '15')?.title || region + ' 여행',
        festivalAddr: region,
        festivalLat: parseFloat(selected[0]?.mapy || '37.5'),
        festivalLng: parseFloat(selected[0]?.mapx || '127.0'),
        places: selected as any,
        transportation: transport,
        duration: duration,
        origin: origin || '서울역',
        travelDate: date, // 날짜 추가
      });
      if (response) {
        navigate(`/course/${selected[0]?.contentid || 'result'}`, {
          state: { course: response, transport, places: selected, duration: duration, origin: origin || '서울역' }
        });
      }
    } catch (e) {
      console.error(e);
      alert('코스 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setGenerating(false);
    }
  };

  const dateLabel = new Date(date).toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', weekday: 'short'
  });

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-52">
      {/* 헤더 */}
      <div className="px-4 pt-6 pb-4">
        <p className="text-sm text-slate-400 font-bold">{region} · {dateLabel}</p>
        <h1 className="text-2xl font-headline font-bold mt-1">
          {loading ? '탐색 중...' : `${spots.length}곳을 찾았어요`}
        </h1>
        <p className="text-[11px] text-slate-400 mt-1">한국관광공사 TourAPI 공공데이터 기준</p>
      </div>

      {/* 출발지 + 교통수단 + 일정 */}
      <div className="flex flex-col gap-2 px-4 pb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="출발지 (예: 서울역)"
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            className="flex-1 bg-surface-container-low rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={() => setTransport(t => t === 'car' ? 'public' : 'car')}
            className="px-4 py-2.5 bg-surface-container rounded-xl text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200 flex-shrink-0"
          >
            {transport === 'car' ? '🚗 자차' : '🚌 대중'}
          </button>
        </div>
        <div className="flex gap-2">
          {(['day', '1night', '2night'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                duration === d
                  ? 'bg-slate-800 text-white'
                  : 'bg-surface-container text-slate-500'
              }`}
            >
              {d === 'day' ? '당일치기' : d === '1night' ? '1박 2일' : '2박 3일'}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-4 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {(['전체', '축제', '관광지', '맛집'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              activeTab === tab
                ? 'bg-primary-container text-white'
                : 'bg-surface-container text-slate-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 스팟 리스트 */}
      {loading ? (
        <div className="flex flex-col gap-3 px-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="animate-pulse bg-surface-container-high rounded-xl h-24" />
          ))}
        </div>
      ) : error ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : filteredSpots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-3">
          <span className="text-5xl">
            {activeTab === '축제' ? '🎪' :
             activeTab === '관광지' ? '🏞️' :
             activeTab === '맛집' ? '🍽️' : '🗺️'}
          </span>
          <p className="text-base font-bold text-on-surface">
            {activeTab === '축제' ? '이 날짜에 진행 중인 축제가 없어요' :
             activeTab === '관광지' ? '등록된 관광지 정보가 없습니다' :
             activeTab === '맛집' ? '등록된 맛집 정보가 없습니다' :
             '이 날짜에 해당 지역 정보가 없습니다'}
          </p>
          <p className="text-sm text-slate-400">
            {activeTab === '축제' ? '다른 날짜나 지역을 탐색해보세요' :
             '다른 지역을 선택하거나 홈으로 돌아가세요'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 px-6 py-2.5 bg-surface-container rounded-xl text-sm font-bold text-slate-600"
          >
            홈으로
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-4">
          {filteredSpots.map(spot => {
            const isSelected = selectedIds.includes(spot.contentid);
            const isClosed = spot.isOpen === false;
            return (
              <div
                key={spot.contentid}
                onClick={() => !isClosed && toggleSpot(spot.contentid)}
                className={`flex gap-3 p-3 rounded-xl border-2 transition-all ${
                  isClosed
                    ? 'opacity-50 border-surface-container cursor-not-allowed'
                    : isSelected
                    ? 'border-primary-container bg-primary-container/5 cursor-pointer'
                    : 'border-surface-container bg-white cursor-pointer'
                }`}
              >
                {/* 이미지 */}
                <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-surface-container-high">
                  {spot.firstimage ? (
                    <img className="w-full h-full object-cover" src={spot.firstimage} alt={spot.title} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10" />
                  )}
                </div>
                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      spot.contenttypeid === '15' ? 'bg-primary/10 text-primary' :
                      spot.contenttypeid === '12' ? 'bg-secondary/10 text-secondary' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {spot.contenttypeid === '15' ? '축제' : spot.contenttypeid === '12' ? '관광지' : '맛집'}
                    </span>
                    {/* 운영 여부 뱃지 */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isClosed ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'
                    }`}>
                      {isClosed ? '휴무' : '운영중'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-on-surface truncate">{spot.title}</h3>
                  {spot.firstMenu && (
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">대표메뉴: {spot.firstMenu}</p>
                  )}
                  {spot.openTime && !isClosed && (
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{spot.openTime}</p>
                  )}
                  {isClosed && spot.restDate && (
                    <p className="text-[11px] text-red-400 mt-0.5 line-clamp-1">휴무: {spot.restDate}</p>
                  )}
                </div>
                {/* 체크박스 */}
                {!isClosed && (
                  <div className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center self-center ${
                    isSelected ? 'bg-primary-container border-primary-container' : 'border-slate-300'
                  }`}>
                    {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 하단 고정 CTA — BottomNav(z-50, ~72px) 위에 표시 */}
      <div className="fixed bottom-[72px] left-0 right-0 max-w-[430px] mx-auto bg-white/95 backdrop-blur-sm border-t border-surface-container px-4 pt-4 pb-4 z-40">
        <button
          onClick={handleGenerateCourse}
          disabled={selectedIds.length === 0 || generating}
          className="w-full bg-primary-container text-white py-4 rounded-xl font-bold text-base shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {generating ? '코스 생성 중...' : `선택한 ${selectedIds.length}곳으로 AI 코스 짜기`}
        </button>
      </div>
    </div>
  );
};

export default ExploreResultPage;
