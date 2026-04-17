import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Share2, Sparkles, Check } from 'lucide-react';
import { tourApi, REGION_AREA_CODES } from '../services/tourApi';
import type { CourseSubItem } from '../services/tourApi';
import { kakaoMapService } from '../services/kakaoMap';
import { geminiService } from '../services/gemini';
import type { Place, PlaceWithDetail, CourseResponse } from '../types';
import { toHttps } from '../utils/imageUrl';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Festival {
  contentid: string;
  title: string;
  addr1: string;
  firstimage: string;
  mapx: string;
  mapy: string;
}

interface SelectablePlace extends PlaceWithDetail {
  placeType: string;
  selected: boolean;
  isRecommended?: boolean;
  recommendOrder?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  '15': { label: '축제', color: 'text-primary bg-primary/5' },
  '12': { label: '관광지', color: 'text-secondary bg-secondary/5' },
  '14': { label: '문화시설', color: 'text-tertiary bg-tertiary/5' },
  '28': { label: '레포츠', color: 'text-tertiary-container bg-tertiary/5' },
  '32': { label: '숙박', color: 'text-on-surface-variant bg-surface-container-high' },
  '39': { label: '맛집', color: 'text-primary-container bg-primary/5' },
};

function getTypeConfig(contenttypeid: string) {
  return TYPE_CONFIG[contenttypeid] ?? { label: '장소', color: 'text-secondary bg-secondary/5' };
}

function getAvailableTime(departure: string, region: string): string {
  const isDepartureSeoul = departure.includes('서울') || departure.includes('경기') || departure.includes('인천');

  if (region.includes('서울') || region.includes('경기')) {
    // 서울/경기에서 서울/경기 → 이동 거의 없음
    return isDepartureSeoul ? '약 10시간 (예상)' : '약 8시간 (예상)';
  }
  if (region.includes('강원')) {
    return isDepartureSeoul ? '약 7시간 (예상)' : '약 6시간 (예상)';
  }
  if (region.includes('충청')) {
    return isDepartureSeoul ? '약 8시간 (예상)' : '약 7시간 (예상)';
  }
  if (region.includes('전라')) {
    return isDepartureSeoul ? '약 6시간 30분 (예상)' : '약 6시간 (예상)';
  }
  if (region.includes('경상')) {
    return isDepartureSeoul ? '약 6시간 30분 (예상)' : '약 7시간 (예상)';
  }
  if (region.includes('제주')) {
    return '약 8시간 (예상)';
  }
  return '약 8시간 (예상)';
}

// 지역별 중심 좌표 (카카오 맛집 검색용)
const REGION_CENTER: Record<string, { lat: number; lng: number }> = {
  '서울/경기': { lat: 37.5665, lng: 126.9780 },
  '강원': { lat: 37.8228, lng: 128.1555 },
  '충청': { lat: 36.6358, lng: 127.4913 },
  '전라': { lat: 35.8160, lng: 127.1089 },
  '경상': { lat: 35.8714, lng: 128.6014 },
  '제주': { lat: 33.4996, lng: 126.5312 },
  '전체': { lat: 36.5, lng: 127.5 },
};

function festivalToPlace(f: Festival): Place {
  return {
    contentid: f.contentid,
    title: f.title,
    addr1: f.addr1,
    firstimage: f.firstimage,
    mapx: f.mapx,
    mapy: f.mapy,
    contenttypeid: '15',
  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex gap-4 p-3 bg-surface-container-lowest rounded-[20px] shadow-sm border border-outline-variant/10 mb-3 animate-pulse">
      <div className="w-24 h-24 rounded-[12px] bg-surface-container-high shrink-0" />
      <div className="flex-1 flex flex-col gap-2 py-1">
        <div className="w-16 h-4 bg-surface-container-high rounded-full" />
        <div className="w-3/4 h-5 bg-surface-container-high rounded" />
        <div className="w-1/2 h-3 bg-surface-container-high rounded" />
      </div>
      <div className="flex items-center pr-2">
        <div className="w-6 h-6 rounded-full bg-surface-container-high" />
      </div>
    </div>
  );
}

// ─── Place Card ───────────────────────────────────────────────────────────────

interface PlaceCardProps {
  place: SelectablePlace;
  onToggle: (id: string) => void;
}

function PlaceCard({ place, onToggle }: PlaceCardProps) {
  const typeConfig = getTypeConfig(place.contenttypeid);

  return (
    <div className="flex gap-4 p-3 bg-surface-container-lowest rounded-[20px] shadow-sm border border-outline-variant/10 mb-3">
      {place.firstimage ? (
        <img
          src={toHttps(place.firstimage)}
          alt={place.title}
          className="w-24 h-24 rounded-[12px] object-cover shrink-0"
          loading="lazy"
        />
      ) : (
        <div className="w-24 h-24 rounded-[12px] bg-surface-container-high shrink-0 flex items-center justify-center">
          <span className="text-2xl">
            {place.contenttypeid === '15' ? '🎪'
              : place.contenttypeid === '39' ? '🍽️'
              : place.contenttypeid === '14' ? '🏛️'
              : place.contenttypeid === '28' ? '🏄'
              : place.contenttypeid === '32' ? '🏨'
              : '🗺️'}
          </span>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
        <div>
          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${typeConfig.color}`}>
            {typeConfig.label}
          </span>
          <h3 className="font-bold text-base mt-1 leading-snug truncate">{place.title}</h3>
          <p className="text-xs text-secondary mt-0.5 truncate">{place.addr1}</p>
        </div>
      </div>

      <div className="flex items-center pr-2 shrink-0">
        <button
          onClick={() => onToggle(place.contentid)}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
            place.selected
              ? 'bg-primary'
              : 'border-2 border-outline-variant bg-transparent'
          }`}
          aria-label={place.selected ? '선택 해제' : '선택'}
        >
          {place.selected && <Check className="text-white w-4 h-4" strokeWidth={3} />}
        </button>
      </div>
    </div>
  );
}

// ─── Recommended Section ─────────────────────────────────────────────────────

interface RecommendedSectionProps {
  places: SelectablePlace[];
  onToggle: (id: string) => void;
}

function RecommendedSection({ places, onToggle }: RecommendedSectionProps) {
  if (places.length === 0) return null;

  const sorted = [...places].sort(
    (a, b) => (a.recommendOrder ?? 99) - (b.recommendOrder ?? 99)
  );

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-primary text-on-primary text-[10px] font-bold px-2.5 py-1 rounded-full">
          한국관광공사 추천
        </span>
        <span className="text-sm font-semibold text-on-surface">이 지역 추천 코스</span>
      </div>
      <div className="space-y-3">
        {sorted.map((place, idx) => (
          <div
            key={place.contentid}
            className="flex gap-4 p-3 bg-primary/5 rounded-[20px] border border-primary/20"
          >
            {place.firstimage ? (
              <img
                src={toHttps(place.firstimage)}
                alt={place.title}
                className="w-20 h-20 rounded-[12px] object-cover shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="w-20 h-20 rounded-[12px] bg-primary/10 shrink-0 flex items-center justify-center">
                <span className="text-xl">🏛️</span>
              </div>
            )}
            <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
              <div>
                <span className="text-[10px] font-bold text-primary">{idx + 1}순위</span>
                <h3 className="font-bold text-base mt-0.5 leading-snug truncate">{place.title}</h3>
                <p className="text-xs text-secondary mt-0.5 truncate">{place.addr1}</p>
              </div>
            </div>
            <div className="flex items-center pr-2 shrink-0">
              <button
                onClick={() => onToggle(place.contentid)}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  place.selected
                    ? 'bg-primary'
                    : 'border-2 border-outline-variant bg-transparent'
                }`}
                aria-label={place.selected ? '선택 해제' : '선택'}
              >
                {place.selected && <Check className="text-white w-4 h-4" strokeWidth={3} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PlaceSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const region = searchParams.get('region') || '';
  const date = searchParams.get('date') || '';
  const [departure, setDeparture] = useState(searchParams.get('departure') || '');
  const [transport, setTransport] = useState<'car' | 'public'>(
    (searchParams.get('transport') as 'car' | 'public') || 'car'
  );
  const [duration, setDuration] = useState<'day' | '1night' | '2night'>(
    (searchParams.get('duration') as 'day' | '1night' | '2night') || 'day'
  );

  const [places, setPlaces] = useState<SelectablePlace[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  const dateDisplay = date
    ? new Date(date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
    : '';

  const availableTime = getAvailableTime(departure, region);

  // ── Load places on mount ──────────────────────────────────────────────────

  useEffect(() => {
    if (!region || !date) {
      setLoading(false);
      return;
    }
    loadPlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, date]);

  const loadPlaces = async () => {
    setLoading(true);
    setError(null);

    try {
      const center = REGION_CENTER[region] ?? REGION_CENTER['전체'];
      const areaCode = REGION_AREA_CODES[region]?.[0];

      const results = await Promise.allSettled([
        tourApi.fetchFestivalsByRegionAndDate(region, date),
        tourApi.fetchPlacesByRegion(region, '12'),
        tourApi.fetchPlacesByRegion(region, '14'),
        tourApi.fetchPlacesByRegion(region, '28'),
        kakaoMapService.searchRestaurants(`${region} 맛집`, center.lat, center.lng, 30000),
        tourApi.fetchPlacesByRegion(region, '39'),
        areaCode ? tourApi.fetchRecommendedCourses(areaCode) : Promise.resolve([]),
      ]);

      const fetchedFestivals: Festival[] =
        results[0].status === 'fulfilled' ? (results[0].value as unknown as Festival[]) : [];
      const attractions: Place[] = results[1].status === 'fulfilled' ? results[1].value : [];
      const culture: Place[] = results[2].status === 'fulfilled' ? results[2].value : [];
      const leisure: Place[] = results[3].status === 'fulfilled' ? results[3].value : [];
      const kakaoResult = results[4].status === 'fulfilled' ? results[4].value : [];
      const tourFood: Place[] = results[5].status === 'fulfilled' ? results[5].value : [];
      const courses: Place[] = results[6].status === 'fulfilled' ? results[6].value : [];

      const kakaoFood: Place[] =
        kakaoResult.length > 0
          ? kakaoResult.map((k) => ({
              contentid: `kakao_${k.id}`,
              title: k.place_name,
              addr1: k.road_address_name || k.address_name,
              firstimage: '',
              mapx: k.x,
              mapy: k.y,
              contenttypeid: '39',
            }))
          : tourFood.slice(0, 3);

      // 관광공사 코스 서브아이템 + 장소 상세정보 fetch
      let subItems: CourseSubItem[] = [];
      let recommendedPlaces: Place[] = [];
      if (courses.length > 0) {
        subItems = await tourApi.fetchCourseDetail(courses[0].contentid);
        if (subItems.length > 0) {
          const placeInfos = await Promise.all(
            subItems.slice(0, 5).map((s) => tourApi.fetchPlaceCommonInfo(s.subcontentid))
          );
          recommendedPlaces = placeInfos.filter((p): p is Place => p !== null);
        }
      }

      setFestivals(fetchedFestivals);

      const festivalPlaces: Place[] = fetchedFestivals.map(festivalToPlace);

      // 카테고리별 2개씩, 부족하면 관광지로 보충
      const pick = (arr: Place[], n: number): Place[] => arr.slice(0, n);
      const cat12 = pick(attractions, 2);
      const cat14 = pick(culture, 2);
      const cat28 = pick(leisure, 2);
      const cat39 = pick(kakaoFood, 2);
      const shortfall = (2 - cat12.length) + (2 - cat14.length) + (2 - cat28.length) + (2 - cat39.length);
      const extra12 = pick(attractions.slice(2), shortfall);
      const additionalPlaces: Place[] = [...cat12, ...cat14, ...cat28, ...cat39, ...extra12];

      const all: Place[] = [...festivalPlaces, ...recommendedPlaces, ...additionalPlaces];

      const seen = new Set<string>();
      const unique = all.filter((p) => {
        if (seen.has(p.contentid)) return false;
        seen.add(p.contentid);
        return true;
      });

      // 실제로 unique 장소와 매칭되는 추천 항목이 있는지 확인
      const matchedRecommendCount = subItems.filter(
        (s) => unique.some((p) => p.contentid === s.subcontentid)
      ).length;
      const hasMatchingRecommended = matchedRecommendCount > 0;

      const selectable: SelectablePlace[] = unique.map((p, idx) => {
        const subItem = subItems.find((s) => s.subcontentid === p.contentid);
        const isRecommended = !!subItem;
        // 매칭되는 추천 장소 없으면 앞 5개 기본 선택
        const selected = hasMatchingRecommended ? isRecommended : idx < 5;
        return {
          ...p,
          placeType: p.contenttypeid,
          selected,
          isRecommended,
          recommendOrder: subItem ? (Number(subItem.subnum) || 0) : undefined,
        };
      });

      setPlaces(selectable);
      setVisibleCount(10);
    } catch (err) {
      console.error('장소 로딩 실패:', err);
      setError('장소를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ── Toggle handlers ───────────────────────────────────────────────────────

  const togglePlace = useCallback((id: string) => {
    setPlaces((prev) =>
      prev.map((p) => (p.contentid === id ? { ...p, selected: !p.selected } : p))
    );
  }, []);

  const toggleAll = useCallback(() => {
    setPlaces((prev) => {
      const allSelected = prev.every((p) => p.selected);
      return prev.map((p) => ({ ...p, selected: !allSelected }));
    });
  }, []);

  const selectedPlaces = places.filter((p) => p.selected);
  const selectedCount = selectedPlaces.length;
  const allSelected = places.length > 0 && places.every((p) => p.selected);

  // ── Generate course ───────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (selectedCount === 0) {
      alert('최소 1곳을 선택하세요');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const firstFestival = festivals[0];
      const firstPlace = selectedPlaces[0];

      // 관광공사 추천 순서 우선 정렬
      const sortedSelected = [...selectedPlaces].sort((a, b) => {
        const aOrder = a.recommendOrder ?? 9999;
        const bOrder = b.recommendOrder ?? 9999;
        return aOrder - bOrder;
      });

      const courseRequest = {
        festivalTitle: firstFestival?.title || firstPlace?.title || `${region} 여행`,
        festivalAddr: firstFestival?.addr1 || '',
        festivalLat: parseFloat(firstFestival?.mapy || '0'),
        festivalLng: parseFloat(firstFestival?.mapx || '0'),
        places: sortedSelected,
        transportation: transport,
        duration: duration,
        origin: departure || undefined,
        travelDate: date,
        hasRecommendedCourse: sortedSelected.some((p) => p.isRecommended),
      };

      const course: CourseResponse | null = await geminiService.generateCourse(courseRequest);

      if (!course) {
        throw new Error('코스 생성 결과가 없습니다');
      }

      sessionStorage.setItem('lastCourse', JSON.stringify({ course, region, date, departure, transport, duration }));
      navigate('/course/result', {
        state: { course, region, date, departure, transport, duration },
      });
    } catch (err) {
      console.error('코스 생성 실패:', err);
      setError('코스 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setGenerating(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface font-body">
      {/* Fixed Header */}
      <header className="fixed top-0 w-full max-w-[430px] left-1/2 -translate-x-1/2 z-50 bg-surface/90 backdrop-blur-xl flex justify-between items-center px-6 h-16 border-b border-outline-variant/10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-5 h-5 text-on-surface" />
        </button>
        <h1 className="font-headline font-bold text-lg text-on-surface">
          {region && dateDisplay ? `${region} · ${dateDisplay}` : region || dateDisplay || '장소 선택'}
        </h1>
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors"
          aria-label="공유하기"
        >
          <Share2 className="w-5 h-5 text-on-surface" />
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-5 pb-44 space-y-6">

        {/* Trip Options Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-hide">
          {/* Departure pill - editable */}
          <div className="flex items-center gap-1.5 px-4 py-2 bg-surface-container-low rounded-full shrink-0 min-w-0">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wide whitespace-nowrap">출발지</span>
            <input
              type="text"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              placeholder="입력"
              className="text-sm font-semibold text-on-surface bg-transparent border-none outline-none p-0 w-20 placeholder:text-secondary/50"
            />
          </div>

          {/* Transport toggle */}
          <div className="flex bg-surface-container-low rounded-full p-1 shrink-0">
            <button
              onClick={() => setTransport('car')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                transport === 'car'
                  ? 'bg-primary text-on-primary'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              자차
            </button>
            <button
              onClick={() => setTransport('public')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                transport === 'public'
                  ? 'bg-primary text-on-primary'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              대중교통
            </button>
          </div>

          {/* Duration toggle */}
          <div className="flex bg-surface-container-low rounded-full p-1 shrink-0">
            {(['day', '1night', '2night'] as const).map((d) => {
              const label = d === 'day' ? '당일' : d === '1night' ? '1박2일' : '2박3일';
              return (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                    duration === d
                      ? 'bg-primary text-on-primary'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Insight Banner */}
        {departure && (
          <div className="bg-surface-container-high/50 p-4 rounded-[16px] flex items-center gap-3 border border-outline-variant/10">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="text-primary w-5 h-5" />
            </div>
            <p className="text-sm font-medium leading-tight text-on-surface">
              {departure} 기준 실제 관광 가능 시간{' '}
              <span className="text-primary font-bold">{availableTime}</span>
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-[16px]">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 관광공사 추천 섹션 */}
        {!loading && (
          <RecommendedSection
            places={places.filter((p) => p.isRecommended)}
            onToggle={togglePlace}
          />
        )}

        {/* 추가 장소 목록 */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-headline text-xl font-black text-on-surface">추가 장소 선택</h2>
            {!loading && places.length > 0 && (
              <button
                onClick={toggleAll}
                className="text-xs font-bold text-secondary hover:text-on-surface transition-colors"
              >
                {allSelected ? '전체 해제' : '전체 선택'}
              </button>
            )}
          </div>

          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : places.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="text-4xl">🗺️</span>
              <p className="text-sm text-secondary text-center">
                해당 지역/날짜에 검색된 장소가 없습니다
              </p>
            </div>
          ) : (
            <>
              {places
                .filter((p) => !p.isRecommended)
                .slice(0, visibleCount)
                .map((place) => (
                  <div
                    key={place.contentid}
                    className={place.contenttypeid === '15' ? 'border border-primary rounded-[22px] mb-3' : ''}
                  >
                    {place.contenttypeid === '15' && (
                      <div className="px-3 pt-2 pb-0">
                        <span className="text-[10px] font-bold text-primary">🎪 이달 진행중 축제</span>
                      </div>
                    )}
                    <PlaceCard place={place} onToggle={togglePlace} />
                  </div>
                ))}

              {/* 더 보기 */}
              {places.filter((p) => !p.isRecommended).length > visibleCount && (
                <button
                  onClick={() => setVisibleCount((v) => v + 10)}
                  className="w-full py-3 text-sm font-bold text-primary border border-primary/30 rounded-[16px] hover:bg-primary/5 transition-colors"
                >
                  + 더 보기 ({places.filter((p) => !p.isRecommended).length - visibleCount}개 남음)
                </button>
              )}
            </>
          )}
        </section>
      </main>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-surface/90 backdrop-blur-2xl rounded-t-[32px] shadow-lg border-t border-outline-variant/20 px-6 pb-10 pt-4">
        {/* 당일 초과 경고 */}
        {duration === 'day' && selectedCount > 6 && (
          <div className="mb-3 flex items-center justify-between gap-2 bg-primary/10 border border-primary/20 rounded-[14px] px-4 py-2.5">
            <p className="text-xs text-primary font-medium leading-snug">
              당일치기엔 {selectedCount}곳이 빠듯해요. 1박2일로 바꿀까요?
            </p>
            <button
              onClick={() => setDuration('1night')}
              className="text-xs font-bold text-primary border border-primary/40 rounded-full px-3 py-1 shrink-0 hover:bg-primary/10 transition-colors"
            >
              1박2일로
            </button>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wide">Selected</span>
            <span className="text-lg font-black text-on-surface">{selectedCount}곳 선택됨</span>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || loading}
            className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-4 rounded-full font-bold shadow-lg flex items-center gap-2 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
          >
            {generating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                ✈️ AI 추천 코스로 여행하기
                <span className="text-on-primary/80">→</span>
              </>
            )}
          </button>
        </div>
        {places.filter((p) => p.isRecommended && p.selected).length > 0 && (
          <p className="text-[10px] text-secondary text-center mt-2">
            관광공사 추천 {places.filter((p) => p.isRecommended && p.selected).length}개 포함
          </p>
        )}
      </div>
    </div>
  );
}
