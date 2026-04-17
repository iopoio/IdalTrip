import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Navigation,
  RefreshCw,
  Share2,
  Sparkles,
  UtensilsCrossed,
  Ticket,
  Building2,
  Activity,
  Hotel,
} from 'lucide-react';
import type { CourseResponse, CourseItem, PlaceType } from '../types';
import LogoLight from '../assets/logo/이달여행.svg';
import CourseMap from '../components/CourseMap';

const TYPE_ICON: Record<PlaceType, React.ReactNode> = {
  festival: <Ticket className="w-4 h-4" />,
  attraction: <MapPin className="w-4 h-4" />,
  food: <UtensilsCrossed className="w-4 h-4" />,
  culture: <Building2 className="w-4 h-4" />,
  leisure: <Activity className="w-4 h-4" />,
  stay: <Hotel className="w-4 h-4" />,
};

const TYPE_LABEL: Record<PlaceType, string> = {
  festival: '축제',
  attraction: '관광지',
  food: '맛집',
  culture: '문화',
  leisure: '레포츠',
  stay: '숙박',
};

const openKakaoNavi = (item: CourseItem) => {
  window.open(
    `https://map.kakao.com/link/to/${encodeURIComponent(item.place_name)},${item.lat},${item.lng}`,
    '_blank'
  );
};

const CourseResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  type CourseState = {
    course?: CourseResponse;
    region?: string;
    date?: string;
    departure?: string;
    transport?: 'car' | 'public';
    duration?: 'day' | '1night' | '2night';
  };
  const state = (location.state || (() => {
    try { return JSON.parse(sessionStorage.getItem('lastCourse') || '{}'); }
    catch { return {}; }
  })()) as CourseState;

  const { course, region, date } = state;

  const schedule = course?.schedule ?? [];
  const maxDay = schedule.length ? Math.max(...schedule.map((i) => i.day)) : 1;
  const filteredSchedule = useMemo(
    () => schedule.filter((i) => maxDay === 1 || i.day === activeDay),
    [schedule, maxDay, activeDay]
  );

  // 일자 전환 시 active 리셋 + 카드 스크롤도 맨 앞으로
  useEffect(() => {
    setActiveIndex(0);
    scrollerRef.current?.scrollTo({ left: 0, behavior: 'auto' });
  }, [activeDay]);

  // IntersectionObserver로 현재 가시 카드 감지
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = Number((entry.target as HTMLElement).dataset.idx);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      { root: scroller, threshold: [0.6] }
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [filteredSchedule]);

  // 마커 클릭 시 해당 카드로 스크롤
  const handleMarkerClick = (idx: number) => {
    const card = cardRefs.current[idx];
    if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  const handleShare = () => {
    if (!course) return;
    if (navigator.share) {
      navigator.share({ title: course.title, text: course.summary, url: window.location.href });
    } else {
      alert('공유 기능은 모바일에서 사용 가능합니다.');
    }
  };

  const handleRetry = () => navigate('/');

  if (!course || schedule.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6 px-6">
        <MapPin className="w-16 h-16 text-outline-variant" />
        <p className="text-on-surface-variant text-center font-body">
          {!course ? '코스 정보를 불러올 수 없습니다.' : '생성된 일정이 없습니다.'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 py-3 rounded-[16px] border-2 border-outline-variant text-on-surface font-bold font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen h-[100svh] flex flex-col bg-surface overflow-hidden">
      {/* 상단 헤더 */}
      <header className="flex-none h-14 flex items-center justify-between px-4 bg-surface/95 backdrop-blur-md z-30">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-on-surface"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <img src={LogoLight} className="h-5 w-auto" alt="이달여행" />
        <button
          onClick={handleShare}
          className="p-2 -mr-2 text-on-surface"
          aria-label="공유"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      {/* 메타 정보 + 일자 탭 */}
      <div className="flex-none px-5 py-3 border-b border-outline-variant/10">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs text-on-surface-variant font-label truncate">
              {[region, date].filter(Boolean).join(' · ') || '코스'}
            </p>
            <h1 className="text-sm font-bold text-on-surface truncate font-headline mt-0.5">
              <Sparkles className="inline w-3.5 h-3.5 text-primary mr-1" />
              {course.title || 'AI 추천 코스'}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-on-surface-variant font-label flex-shrink-0 ml-3">
            <Clock className="w-3 h-3" />
            <span>{course.total_duration}</span>
            <span className="opacity-40">·</span>
            <span>{schedule.length}곳</span>
          </div>
        </div>

        {maxDay > 1 && (
          <div className="flex gap-2 mt-2">
            {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                className={
                  activeDay === d
                    ? 'px-3 py-1 rounded-full text-xs font-bold bg-primary text-on-primary'
                    : 'px-3 py-1 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant'
                }
              >
                Day {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 지도 */}
      <div className="flex-none h-[55vh]">
        <CourseMap
          items={filteredSchedule}
          activeIndex={activeIndex}
          onMarkerClick={handleMarkerClick}
        />
      </div>

      {/* 카드 가로 스와이프 */}
      <div
        ref={scrollerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex gap-3 px-5 pt-3 pb-2 scrollbar-hide"
        style={{ scrollPaddingLeft: '20px', scrollPaddingRight: '20px' }}
      >
        {filteredSchedule.map((item, idx) => (
          <div
            key={`${item.day}-${idx}`}
            ref={(el) => { cardRefs.current[idx] = el; }}
            data-idx={idx}
            className={`snap-center flex-none w-[82vw] max-w-[360px] flex flex-col rounded-[20px] overflow-hidden bg-surface-container-lowest shadow-md transition-shadow ${
              idx === activeIndex ? 'shadow-lg ring-1 ring-primary/20' : ''
            }`}
          >
            {/* 이미지 */}
            <div className="relative h-32 flex-none bg-surface-container-high overflow-hidden">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.place_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                  <MapPin className="w-8 h-8 text-outline-variant" />
                </div>
              )}
              {/* 순서 뱃지 */}
              <div className="absolute top-2 left-2 bg-primary text-on-primary text-xs font-bold px-2 py-1 rounded-full shadow">
                {String(idx + 1).padStart(2, '0')}
              </div>
              {/* 시간 뱃지 */}
              <div className="absolute top-2 right-2 bg-black/60 text-white text-[11px] font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                {item.time}
              </div>
            </div>

            {/* 본문 */}
            <div className="flex-1 flex flex-col p-4 min-h-0">
              <div className="flex items-center gap-1.5 text-[11px] text-primary font-label mb-1">
                {TYPE_ICON[item.type] ?? <MapPin className="w-4 h-4" />}
                <span>{TYPE_LABEL[item.type] ?? '장소'}</span>
                {item.stay_duration && (
                  <>
                    <span className="opacity-40">·</span>
                    <span className="text-on-surface-variant">체류 {item.stay_duration}</span>
                  </>
                )}
              </div>
              <h3 className="text-base font-bold text-on-surface font-headline leading-tight mb-1.5 line-clamp-2">
                {item.place_name}
              </h3>
              <p className="flex-1 text-xs text-on-surface-variant leading-relaxed line-clamp-3 font-body">
                {item.description}
              </p>

              {/* 이동 시간 (다음 장소) */}
              {item.move_time && idx < filteredSchedule.length - 1 && (
                <p className="text-[11px] text-on-surface-variant font-label mt-2 flex items-center gap-1.5">
                  <Navigation className="w-3 h-3" />
                  다음 장소까지 {item.move_time}
                  {item.distance ? ` · ${item.distance}` : ''}
                </p>
              )}

              {/* 카카오 네비 버튼 */}
              <button
                onClick={() => openKakaoNavi(item)}
                className="mt-3 flex items-center justify-center gap-2 h-11 rounded-[12px] bg-[#FEE500] text-[#1A1A1A] font-bold text-sm active:scale-[0.98] transition-transform"
              >
                <Navigation className="w-4 h-4" />
                카카오내비 길찾기
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 바 */}
      <div className="flex-none px-5 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] bg-surface border-t border-outline-variant/10 flex gap-3">
        <button
          onClick={handleRetry}
          className="flex-1 h-11 border-2 border-outline-variant rounded-[12px] font-bold text-sm text-on-surface flex items-center justify-center gap-2 font-body"
        >
          <RefreshCw className="w-4 h-4" />
          다른 코스
        </button>
        <button
          onClick={handleShare}
          className="flex-1 h-11 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-[12px] font-bold text-sm flex items-center justify-center gap-2 shadow-md font-body"
        >
          <Share2 className="w-4 h-4" />
          공유하기
        </button>
      </div>
    </div>
  );
};

export default CourseResultPage;
