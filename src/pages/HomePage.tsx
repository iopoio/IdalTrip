import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, MapPin, CalendarDays, ArrowRight } from 'lucide-react';
import LogoLight from '../assets/logo/이달여행.svg';

interface Destination {
  id: string;
  title: string;
  subtitle: string;
  region: string;
  badge?: string;
  badgeType?: 'festival' | 'recommend';
  imageUrl: string;
}

const DESTINATIONS: Destination[] = [
  {
    id: '1',
    title: '강릉 봄 여행',
    subtitle: '경포호수 벚꽃길과 안목해변 커피거리',
    region: '강원',
    badge: '지금 축제중',
    badgeType: 'festival',
    imageUrl: 'https://images.unsplash.com/photo-1600298882525-1d5a4b4e99d9?w=800&q=80',
  },
  {
    id: '2',
    title: '경주 벚꽃',
    subtitle: '천년 고도의 봄',
    region: '경상',
    badge: '이달 추천',
    badgeType: 'recommend',
    imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&q=80',
  },
  {
    id: '3',
    title: '여수 밤바다',
    subtitle: '낭만적인 야경과 해산물',
    region: '전라',
    badge: undefined,
    imageUrl: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
  },
];

const REGIONS = ['전체', '서울/경기', '강원', '충청', '전라', '경상', '제주'];

function getNextSaturday(): string {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 6=Sat
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
  const [selectedRegion, setSelectedRegion] = useState('강원');
  const [travelDate, setTravelDate] = useState<string>(getNextSaturday());
  const [departure, setDeparture] = useState('');

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

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body">
      {/* Fixed Header */}
      <nav className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl flex justify-between items-center px-6 h-16 border-b border-outline-variant/10">
        <img src={LogoLight} className="h-7 w-auto" alt="이달트립" />
        <div className="flex items-center gap-4">
          <button
            aria-label="검색"
            className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Search size={20} />
          </button>
          <button
            aria-label="메뉴"
            className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      <main className="pt-20 pb-12 px-5">
        {/* Hero Search Card */}
        <section className="mb-12">
          <div className="bg-surface-container-lowest rounded-[32px] p-6 shadow-lg border border-outline-variant/10">
            <h1 className="font-headline text-3xl font-bold text-on-surface mb-6 leading-tight">
              어디로 떠날까요?
            </h1>

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

          {/* Bento Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Large card — col-span-2 */}
            <button
              onClick={() => handleDestinationClick(DESTINATIONS[0])}
              className="col-span-2 relative rounded-[24px] overflow-hidden aspect-[16/9] group text-left"
            >
              <img
                src={DESTINATIONS[0].imageUrl}
                alt={DESTINATIONS[0].title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                {DESTINATIONS[0].badge && (
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                      DESTINATIONS[0].badgeType === 'festival'
                        ? 'bg-primary text-on-primary'
                        : 'bg-white/20 text-white backdrop-blur-sm'
                    }`}
                  >
                    {DESTINATIONS[0].badge}
                  </span>
                )}
                <h3 className="font-headline text-xl font-bold text-white leading-tight">
                  {DESTINATIONS[0].title}
                </h3>
                <p className="text-white/70 text-sm mt-1">{DESTINATIONS[0].subtitle}</p>
              </div>
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ArrowRight size={16} className="text-white" />
              </div>
            </button>

            {/* Small cards */}
            {DESTINATIONS.slice(1).map((dest) => (
              <button
                key={dest.id}
                onClick={() => handleDestinationClick(dest)}
                className="relative rounded-[24px] overflow-hidden aspect-[3/4] group text-left"
              >
                <img
                  src={dest.imageUrl}
                  alt={dest.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
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
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-outline-variant/10 bg-surface-container-low text-center">
        <div className="font-headline font-black text-outline text-lg opacity-40">이달트립</div>
        <div className="flex justify-center gap-6 text-secondary text-[11px] font-medium mb-6 mt-4">
          <span className="cursor-pointer hover:text-on-surface transition-colors">개인정보처리방침</span>
          <span className="cursor-pointer hover:text-on-surface transition-colors">이용약관</span>
          <span className="cursor-pointer hover:text-on-surface transition-colors">고객센터</span>
        </div>
        <p className="text-secondary/60 text-[10px] leading-relaxed">
          ⓒ 2025 이달트립. 여행을 더 쉽게.
        </p>
      </footer>
    </div>
  );
}
