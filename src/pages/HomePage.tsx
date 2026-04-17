import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, MapPin, CalendarDays, ArrowRight } from 'lucide-react';
import LogoLight from '../assets/logo/이달여행.svg';
import { tourApi } from '../services/tourApi';
import type { Festival } from '../types';
import { seasonCopy } from '../data/seasonCopy';

interface Destination {
  id: string;
  title: string;
  subtitle: string;
  region: string;
  badge?: string;
  badgeType?: 'festival' | 'recommend';
  imageUrl: string;
}

const REGIONS = ['전체', '서울/경기', '강원', '충청', '전라', '경상', '제주'];


function toHttps(url: string): string {
  return url ? url.replace(/^http:\/\//, 'https://') : '';
}

function regionFromAddr(addr: string): string {
  if (!addr) return '전국';
  if (addr.includes('서울') || addr.includes('경기') || addr.includes('인천')) return '서울/경기';
  if (addr.includes('강원')) return '강원';
  if (addr.includes('충청') || addr.includes('대전') || addr.includes('세종') || addr.includes('충북') || addr.includes('충남')) return '충청';
  if (addr.includes('전라') || addr.includes('광주') || addr.includes('전북') || addr.includes('전남')) return '전라';
  if (addr.includes('경상') || addr.includes('부산') || addr.includes('대구') || addr.includes('울산') || addr.includes('경북') || addr.includes('경남')) return '경상';
  if (addr.includes('제주')) return '제주';
  return '전체';
}

function festivalToDestination(f: Festival, idx: number): Destination {
  const region = regionFromAddr(f.addr1 || '');
  return {
    id: f.contentid,
    title: f.title,
    subtitle: f.addr1 || region,
    region,
    badge: idx === 0 ? '지금 축제중' : '이달 추천',
    badgeType: idx === 0 ? 'festival' : 'recommend',
    imageUrl: toHttps(f.firstimage || f.firstimage2 || ''),
  };
}

function getNextSaturday(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilSaturday = dayOfWeek === 6 ? 0 : 6 - dayOfWeek;
  const sat = new Date(today);
  sat.setDate(today.getDate() + daysUntilSaturday);
  return sat.toISOString().split('T')[0];
}

function formatDateKorean(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayName = days[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${dayName})`;
}

export default function HomePage() {
  const navigate = useNavigate();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [travelDate, setTravelDate] = useState<string>(getNextSaturday());
  const [departure, setDeparture] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingDest, setLoadingDest] = useState(true);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    const month = String(new Date().getMonth() + 1);
    tourApi.fetchFestivals(month).then((festivals) => {
      const withImage = (festivals as unknown as Festival[]).filter((f) => f.firstimage || f.firstimage2);
      setDestinations(withImage.slice(0, 3).map(festivalToDestination));
      setLoadingDest(false);
    }).catch(() => setLoadingDest(false));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams({
      region: selectedRegion,
      date: travelDate,
      departure,
    });
    navigate('/places?' + params.toString());
  };

  const handleDestinationClick = (dest: Destination) => {
    const params = new URLSearchParams({
      region: dest.region,
      date: travelDate,
      departure,
    });
    navigate('/places?' + params.toString());
  };

  const ctaRegionLabel = selectedRegion === '전체' ? '전국' : selectedRegion;
  const formattedDate = formatDateKorean(travelDate);

  const heroBg = destinations[0]?.imageUrl || '';

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body">
      {/* Fixed Header */}
      <nav className="fixed top-0 w-full max-w-[430px] left-1/2 -translate-x-1/2 z-50 flex justify-between items-center px-6 h-16 bg-white/15 backdrop-blur-md border-b border-white/10">
        <img src={LogoLight} className="h-7 w-auto" alt="이달여행" />
        <div className="flex items-center gap-4">
          <button
            aria-label="검색"
            className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <Search size={20} />
          </button>
          <button
            aria-label="메뉴"
            className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[520px] flex flex-col justify-end">
        {/* 배경 이미지 */}
        {heroBg ? (
          <img
            src={heroBg}
            alt="배경"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0e06] via-[#a63415] to-[#FF6B35]" />
        )}
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60" />
        {/* 상단 헤더 영역 반투명 처리 */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />
        {/* 히어로 텍스트 */}
        <div className="relative px-6 pt-24 pb-8">
          {/* 텍스트 가독성용 로컬 그라데이션 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent pointer-events-none" />
          {(() => {
            const month = new Date().getMonth() + 1;
            const copy = (seasonCopy as Record<number, { title: string; subtitle: string }>)[month];
            return (
              <div className="relative">
                <p className="text-white/60 text-xs font-label uppercase tracking-widest mb-1">
                  {copy.subtitle}
                </p>
                <h1 className="font-headline text-4xl font-black text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  {copy.title.split('\n').map((line, i) => (
                    <span key={i}>{line}{i < copy.title.split('\n').length - 1 && <br />}</span>
                  ))}
                </h1>
              </div>
            );
          })()}
        </div>
      </section>

      <main className="pb-12 px-5 -mt-6 relative z-10">
        {/* Hero Search Card */}
        <section className="mb-12">
          <div className="bg-surface-container-lowest rounded-[32px] p-6 shadow-xl border border-outline-variant/10">
            {/* Region Chips */}
            <div
              className="flex gap-2 overflow-x-auto mb-8"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {REGIONS.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all ${
                    selectedRegion === region
                      ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/20'
                      : 'bg-surface-container-high text-on-surface font-medium'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>

            {/* Date Field */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-secondary tracking-widest uppercase mb-1 font-label">
                TRAVEL DATE
              </label>
              <div
                className="flex items-center gap-3 bg-surface-container-low p-4 rounded-[16px] cursor-pointer relative"
                onClick={() => dateInputRef.current?.showPicker()}
              >
                <CalendarDays size={20} className="text-secondary flex-shrink-0" />
                <span className="text-on-surface text-sm font-medium flex-1">
                  {formattedDate}
                </span>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={travelDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                />
              </div>
            </div>

            {/* Departure Input */}
            <div className="mb-6">
              <label className="block text-[10px] font-bold text-secondary tracking-widest uppercase mb-1 font-label">
                DEPARTURE
              </label>
              <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-[16px]">
                <MapPin size={20} className="text-secondary flex-shrink-0" />
                <input
                  type="text"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  placeholder="출발지 입력 (예: 서울역)"
                  className="flex-1 bg-transparent text-on-surface text-sm placeholder:text-on-surface-variant/50 focus:outline-none"
                />
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleSearch}
              className="w-full py-5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-[16px] shadow-xl text-base active:scale-[0.98] transition-transform"
            >
              {ctaRegionLabel} · {formatDateKorean(travelDate).slice(5)} 여행 찾기
            </button>
          </div>
        </section>

        {/* Recommended Destinations */}
        <section>
          <div className="mb-5">
            <h2 className="font-headline text-2xl font-bold text-on-surface">
              이달의 추천 여행지
            </h2>
            <p className="text-secondary text-sm mt-1">클릭하면 자동으로 설정됩니다</p>
          </div>

          {loadingDest ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 rounded-[24px] bg-surface-container-high aspect-[16/9] animate-pulse" />
              <div className="rounded-[24px] bg-surface-container-high aspect-[3/4] animate-pulse" />
              <div className="rounded-[24px] bg-surface-container-high aspect-[3/4] animate-pulse" />
            </div>
          ) : destinations.length === 0 ? (
            <div className="text-center py-10 text-secondary text-sm">이달의 추천 여행지 정보가 없습니다.</div>
          ) : (
            /* Bento Grid */
            <div className="grid grid-cols-2 gap-4">
              {/* Large card — col-span-2 */}
              <button
                onClick={() => handleDestinationClick(destinations[0])}
                className="col-span-2 relative rounded-[24px] overflow-hidden aspect-[16/9] group text-left"
              >
                {destinations[0].imageUrl ? (
                  <img
                    src={toHttps(destinations[0].imageUrl)}
                    alt={destinations[0].title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-primary-container/80" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  {destinations[0].badge && (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                        destinations[0].badgeType === 'festival'
                          ? 'bg-primary text-on-primary'
                          : 'bg-white/20 text-white backdrop-blur-sm'
                      }`}
                    >
                      {destinations[0].badge}
                    </span>
                  )}
                  <h3 className="font-headline text-xl font-bold text-white leading-tight">
                    {destinations[0].title}
                  </h3>
                  <p className="text-white/70 text-sm mt-1">{destinations[0].subtitle}</p>
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ArrowRight size={16} className="text-white" />
                </div>
              </button>

              {/* Small cards */}
              {destinations.slice(1).map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => setShowComingSoon(true)}
                  className="relative rounded-[24px] overflow-hidden aspect-[3/4] group text-left"
                >
                  {dest.imageUrl ? (
                    <img
                      src={toHttps(dest.imageUrl)}
                      alt={dest.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-primary-container/80" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {dest.badge && (
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-1.5 ${
                          dest.badgeType === 'festival'
                            ? 'bg-primary text-on-primary'
                            : 'bg-white/20 text-white backdrop-blur-sm'
                        }`}
                      >
                        {dest.badge}
                      </span>
                    )}
                    <h3 className="font-headline text-base font-bold text-white leading-tight">
                      {dest.title}
                    </h3>
                    <p className="text-white/60 text-xs mt-0.5">{dest.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 준비중 팝업 */}
      {showComingSoon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowComingSoon(false)}
        >
          <div
            className="bg-surface rounded-[28px] px-8 py-8 mx-6 text-center shadow-2xl border border-outline-variant/10 max-w-xs w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="font-headline text-lg font-bold text-on-surface mb-2">준비 중입니다</h3>
            <p className="text-sm text-secondary leading-relaxed mb-6">
              더 많은 여행지를 준비하고 있어요.
              <br />조금만 기다려 주세요!
            </p>
            <button
              onClick={() => setShowComingSoon(false)}
              className="w-full bg-primary text-on-primary py-3 rounded-full font-bold text-sm"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-outline-variant/10 bg-surface-container-low text-center">
        <img src={LogoLight} className="h-6 w-auto opacity-40 mx-auto" alt="이달여행" />
        <div className="flex justify-center gap-6 text-secondary text-[11px] font-medium mb-6 mt-4">
          <span className="cursor-pointer hover:text-on-surface transition-colors">개인정보처리방침</span>
          <span className="cursor-pointer hover:text-on-surface transition-colors">이용약관</span>
          <span className="cursor-pointer hover:text-on-surface transition-colors">고객센터</span>
        </div>
        <div className="text-secondary/50 text-[10px] leading-relaxed space-y-0.5 mb-4">
          <p>시즌드 · 대표 채영화</p>
          <p>사업자등록번호 890-19-01928</p>
          <p>서울특별시 관악구 남부순환로244가길 12</p>
          <p>
            <a
              href="mailto:chaejenn@gmail.com"
              className="hover:text-on-surface underline underline-offset-2 transition-colors"
            >
              문의하기
            </a>
          </p>
        </div>

        <p className="text-secondary/60 text-[10px] leading-relaxed">
          ⓒ 2025 이달여행. 여행을 더 쉽게.
        </p>
      </footer>
    </div>
  );
}
