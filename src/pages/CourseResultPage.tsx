import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Car,
  Clock,
  DollarSign,
  MapPin,
  Navigation,
  Share2,
  RefreshCw,
  UtensilsCrossed,
  Ticket,
  Building2,
  Activity,
  Hotel,
} from 'lucide-react';
import type { CourseResponse, CourseItem, PlaceType } from '../types';
import LogoLight from '../assets/logo/이달여행.svg';

declare global {
  interface Window {
    kakao: unknown;
    Kakao: unknown;
  }
}

const TYPE_ICONS: Record<PlaceType, React.ReactNode> = {
  festival: <Ticket className="w-5 h-5 text-primary" />,
  attraction: <MapPin className="w-5 h-5 text-secondary" />,
  food: <UtensilsCrossed className="w-5 h-5 text-primary-container" />,
  culture: <Building2 className="w-5 h-5 text-tertiary" />,
  leisure: <Activity className="w-5 h-5 text-tertiary" />,
  stay: <Hotel className="w-5 h-5 text-secondary" />,
};

const TYPE_ICONS_LARGE: Record<PlaceType, React.ReactNode> = {
  festival: <Ticket className="w-10 h-10 text-primary opacity-30" />,
  attraction: <MapPin className="w-10 h-10 text-secondary opacity-30" />,
  food: <UtensilsCrossed className="w-10 h-10 text-primary-container opacity-30" />,
  culture: <Building2 className="w-10 h-10 text-tertiary opacity-30" />,
  leisure: <Activity className="w-10 h-10 text-tertiary opacity-30" />,
  stay: <Hotel className="w-10 h-10 text-secondary opacity-30" />,
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

  const state = (location.state || {}) as {
    course?: CourseResponse;
    region?: string;
    date?: string;
    departure?: string;
    transport?: 'car' | 'public';
    duration?: 'day' | '1night' | '2night';
  };

  const { course, region, date } = state;

  const handleShare = () => {
    if (!course) return;
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: course.summary,
        url: window.location.href,
      });
    } else {
      alert('공유 기능은 모바일에서 사용 가능합니다.');
    }
  };

  const handleRetry = () => {
    navigate(-2);
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-6 px-6">
        <MapPin className="w-16 h-16 text-outline-variant" />
        <p className="text-on-surface-variant text-center font-body">
          코스 정보를 불러올 수 없습니다.
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

  const schedule = course.schedule;
  const maxDay = Math.max(...schedule.map((i) => i.day));
  const filteredSchedule = schedule.filter(
    (i) => maxDay === 1 || i.day === activeDay
  );

  return (
    <div className="bg-surface min-h-screen">
      {/* 고정 헤더 */}
      <header className="fixed top-0 w-full max-w-[430px] left-0 right-0 mx-auto z-50 bg-surface/90 backdrop-blur-md flex items-center justify-between px-6 h-16">
        <button
          onClick={() => navigate(-1)}
          className="text-on-surface p-1"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <img src={LogoLight} className="h-6 w-auto" alt="이달여행" />
        <button
          onClick={handleShare}
          className="text-on-surface p-1"
          aria-label="공유"
        >
          <Share2 className="w-6 h-6" />
        </button>
      </header>

      <main className="pt-20 px-5 pb-40">
        {/* AI 인사 섹션 */}
        <section className="mb-8">
          {/* 지역/날짜 부제목 */}
          {(region || date) && (
            <p className="text-xs text-on-surface-variant font-label mb-3">
              {[region, date].filter(Boolean).join(' · ')}
            </p>
          )}

          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold font-headline text-on-surface mb-2 leading-tight">
                AI가 최적의 코스를 만들었습니다!
              </h2>
              <div className="bg-surface-container-lowest p-4 rounded-[16px] rounded-tl-none border border-outline-variant/20 shadow-sm">
                <p className="text-on-surface-variant text-sm leading-relaxed font-body">
                  {course.summary}
                </p>
              </div>
            </div>
          </div>

          {/* 통계 그리드 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-container-lowest p-4 rounded-[16px] flex flex-col items-center text-center">
              <Clock className="text-secondary w-4 h-4 mb-1" />
              <span className="text-[10px] text-secondary mb-1 font-label">총 소요</span>
              <span className="font-bold text-primary text-sm font-body">{course.total_duration}</span>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-[16px] flex flex-col items-center text-center">
              <DollarSign className="text-secondary w-4 h-4 mb-1" />
              <span className="text-[10px] text-secondary mb-1 font-label">예상 비용</span>
              <span className="font-bold text-secondary text-sm font-body">{course.estimated_cost}</span>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-[16px] flex flex-col items-center text-center">
              <MapPin className="text-secondary w-4 h-4 mb-1" />
              <span className="text-[10px] text-secondary mb-1 font-label">방문 장소</span>
              <span className="font-bold text-on-surface text-sm font-body">{schedule.length}곳</span>
            </div>
          </div>
        </section>

        {/* 일자 탭 (다일정인 경우) */}
        {maxDay > 1 && (
          <div className="flex gap-4 border-b border-surface-container mb-6">
            {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                className={
                  activeDay === d
                    ? 'pb-3 px-2 text-lg font-bold font-headline text-primary border-b-2 border-primary'
                    : 'pb-3 px-2 text-lg font-medium font-headline text-secondary'
                }
              >
                Day {d}
              </button>
            ))}
          </div>
        )}

        {/* 타임라인 */}
        <section className="relative">
          <div className="absolute left-5 top-4 bottom-0 w-0.5 bg-gradient-to-b from-primary-container via-surface-container-high to-transparent" />
          <div className="flex flex-col gap-8">
            {filteredSchedule.map((item, i) => (
              <div key={`${item.day}-${i}`}>
                {/* 타임라인 아이템 */}
                <div className="relative flex gap-5 group">
                  {/* 원형 아이콘 */}
                  <div className="z-10 w-10 h-10 rounded-full bg-surface-container-lowest border-2 border-primary-container flex items-center justify-center shadow-sm flex-shrink-0">
                    {TYPE_ICONS[item.type] ?? <MapPin className="w-5 h-5 text-secondary" />}
                  </div>

                  {/* 카드 내용 */}
                  <div className="flex-1 pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-medium text-primary mb-1 block font-label">
                          {item.time}
                        </span>
                        <h3 className="text-xl font-bold text-on-surface font-headline">
                          {item.place_name}
                        </h3>
                      </div>
                      {/* 카카오내비 버튼 */}
                      <button
                        onClick={() => openKakaoNavi(item)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] bg-[#FEE500] text-[#1A1A1A] text-xs font-bold hover:opacity-90 transition-opacity flex-shrink-0 ml-2"
                      >
                        <Navigation className="w-3 h-3" />
                        카카오내비
                      </button>
                    </div>

                    {/* 사진 */}
                    {item.image_url ? (
                      <div className="rounded-[16px] overflow-hidden mb-3 aspect-video">
                        <img
                          src={item.image_url}
                          alt={item.place_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="rounded-[16px] bg-surface-container-high mb-3 aspect-video flex items-center justify-center">
                        {TYPE_ICONS_LARGE[item.type] ?? <MapPin className="w-10 h-10 text-secondary opacity-30" />}
                      </div>
                    )}

                    <p className="text-sm text-on-surface-variant leading-relaxed font-body">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* 이동 시간 + 다음 장소 소요 시간 */}
                {item.move_time && i < filteredSchedule.length - 1 && (
                  <div className="relative flex gap-5 items-center mt-2">
                    <div className="w-10 flex justify-center z-10">
                      <div className="w-2 h-2 rounded-full bg-surface-container-high" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="bg-surface-container-low px-4 py-2 rounded-full flex items-center gap-2">
                        <Car className="w-3 h-3 text-secondary" />
                        <span className="text-xs text-secondary font-medium font-label">
                          이동 {item.move_time}
                          {item.distance ? ` (${item.distance})` : ''}
                        </span>
                      </div>
                      {filteredSchedule[i + 1]?.stay_duration && (
                        <div className="bg-primary/8 px-4 py-2 rounded-full flex items-center gap-2">
                          <Clock className="w-3 h-3 text-primary" />
                          <span className="text-xs text-primary font-medium font-label">
                            체류 {filteredSchedule[i + 1].stay_duration}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 고정 하단 바 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-50 p-5 bg-gradient-to-t from-surface via-surface to-transparent">
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 py-4 border-2 border-outline-variant rounded-[16px] font-bold text-on-surface flex items-center justify-center gap-2 font-body"
          >
            <RefreshCw className="w-4 h-4" />
            다른 코스 추천받기
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-[16px] font-bold flex items-center justify-center gap-2 shadow-lg font-body"
          >
            <Share2 className="w-4 h-4" />
            카카오톡 공유
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseResultPage;
