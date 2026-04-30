import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Wallet, ChevronRight, Navigation, Calendar } from 'lucide-react';

type Festival = {
  id: string;
  title: string;
  region: string;
  emoji: string;
  gradient: string;
  thumb: string;
  distanceKm: number;
  roundTripMin: number;
  stayMin: number;
  estCost: string;
  daytrip: boolean;
  signalScore: number; // 다출처 검증 신호 (0~10)
  tags: string[];
};

const MOCK_FESTIVALS: Festival[] = [
  {
    id: 'f1',
    title: '서울 튤립축제',
    region: '서울 송파구',
    emoji: '🌷',
    gradient: 'from-pink-300 via-rose-400 to-orange-300',
    thumb: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&q=75&auto=format&fit=crop',
    distanceKm: 12,
    roundTripMin: 60,
    stayMin: 240,
    estCost: '약 4만원',
    daytrip: true,
    signalScore: 9,
    tags: ['#봄꽃', '#가족', '#무료입장'],
  },
  {
    id: 'f2',
    title: '가평 자라섬 봄꽃축제',
    region: '경기 가평',
    emoji: '🌸',
    gradient: 'from-emerald-300 via-teal-400 to-cyan-300',
    thumb: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=600&q=75&auto=format&fit=crop',
    distanceKm: 68,
    roundTripMin: 180,
    stayMin: 240,
    estCost: '약 9만원',
    daytrip: true,
    signalScore: 8,
    tags: ['#봄꽃', '#드라이빙맛집', '#즐길거리'],
  },
  {
    id: 'f3',
    title: '여주 도자기 축제',
    region: '경기 여주',
    emoji: '🏺',
    gradient: 'from-amber-300 via-orange-400 to-red-300',
    thumb: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=75&auto=format&fit=crop',
    distanceKm: 82,
    roundTripMin: 200,
    stayMin: 180,
    estCost: '약 7만원',
    daytrip: true,
    signalScore: 7,
    tags: ['#문화체험', '#가족'],
  },
  {
    id: 'f4',
    title: '진해 군항제 벚꽃축제',
    region: '경남 창원',
    emoji: '🌸',
    gradient: 'from-pink-200 via-rose-300 to-pink-400',
    thumb: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&q=75&auto=format&fit=crop',
    distanceKm: 380,
    roundTripMin: 600,
    stayMin: 360,
    estCost: '약 28만원',
    daytrip: false,
    signalScore: 10,
    tags: ['#벚꽃명소', '#1박2일'],
  },
  {
    id: 'f5',
    title: '광양 매화축제',
    region: '전남 광양',
    emoji: '🌼',
    gradient: 'from-yellow-200 via-orange-300 to-pink-300',
    thumb: 'https://images.unsplash.com/photo-1457269449834-928af64c684d?w=600&q=75&auto=format&fit=crop',
    distanceKm: 360,
    roundTripMin: 580,
    stayMin: 300,
    estCost: '약 25만원',
    daytrip: false,
    signalScore: 9,
    tags: ['#매화', '#1박2일', '#남도여행'],
  },
];

type Filter = 'all' | 'daytrip' | 'overnight';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'daytrip', label: '🎯 당일치기' },
  { value: 'overnight', label: '🛏️ 1박2일' },
  { value: 'all', label: '전체' },
];

const SignalBar = ({ score }: { score: number }) => {
  const filled = Math.round((score / 10) * 5);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i < filled ? 'bg-[#FF6B35]' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
};

export default function DistanceBundlePage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('daytrip');

  const filtered = MOCK_FESTIVALS.filter((f) => {
    if (filter === 'all') return true;
    if (filter === 'daytrip') return f.daytrip;
    return !f.daytrip;
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* 헤더 */}
      <div className="px-5 pt-6 pb-4 bg-white border-b border-gray-100">
        <p className="text-[11px] font-bold tracking-[0.25em] text-[#FF6B35] uppercase mb-1">
          Tonight's Plan
        </p>
        <h1
          className="text-[1.7rem] font-black tracking-tight text-[#1A1A1A] leading-tight"
          style={{ fontFamily: 'Noto Serif KR, serif' }}
        >
          금요일 저녁,<br />
          <span style={{ color: '#FF6B35' }}>내일 어디</span> 가지?
        </h1>

        {/* 위치 정보 */}
        <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-[#FFF4ED] rounded-lg">
          <Navigation className="w-3.5 h-3.5 text-[#FF6B35]" />
          <span className="text-[12px] text-[#1A1A1A]">
            현재 위치: <span className="font-bold">서울 강남구</span>
          </span>
          <span className="ml-auto text-[10px] text-gray-500">자동 감지</span>
        </div>
      </div>

      {/* 필터 */}
      <div className="px-5 pt-4 pb-3 bg-white">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-[12px] font-bold rounded-full transition-all ${
                filter === f.value
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-500 mt-3">
          내 위치 기준 가까운 순 · {filtered.length}개 축제
        </p>
      </div>

      {/* 축제 카드 리스트 */}
      <div className="px-5 pt-3 flex flex-col gap-3">
        {filtered.map((f) => (
          <button
            key={f.id}
            onClick={() => navigate('/preview/festival-bundle')}
            className="bg-white rounded-2xl shadow-sm overflow-hidden text-left active:scale-[0.99] transition-transform"
          >
            {/* 썸네일 + 배지 */}
            <div className={`relative h-36 bg-gradient-to-br ${f.gradient} overflow-hidden`}>
              {/* 사진 — 실패 시 Picsum 시드 사진으로 자동 교체 */}
              <img
                src={f.thumb}
                alt={f.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  const fallback = `https://picsum.photos/seed/idaltrip-${f.id}/600/400`;
                  if (!img.src.startsWith('https://picsum.photos')) {
                    img.src = fallback;
                  }
                }}
              />
              {/* 살짝 어둡게 (배지 가독성) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              {f.daytrip && (
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#FF6B35] rounded-full">
                  <span className="text-[11px] font-bold text-white">
                    🎯 당일치기 가능
                  </span>
                </div>
              )}
              {!f.daytrip && (
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#1A1A1A] rounded-full">
                  <span className="text-[11px] font-bold text-white">🛏️ 1박2일 추천</span>
                </div>
              )}
              <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#FF6B35]" />
                <span className="text-[11px] font-bold text-[#1A1A1A]">
                  {f.distanceKm}km
                </span>
              </div>
            </div>

            {/* 본문 */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h2 className="text-[15px] font-bold text-[#1A1A1A] leading-tight mb-1">
                    {f.title}
                  </h2>
                  <p className="text-[11px] text-gray-500">{f.region}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              </div>

              {/* 메트릭 그리드 */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 왕복
                  </span>
                  <span className="text-[12px] font-bold text-[#1A1A1A]">
                    {Math.floor(f.roundTripMin / 60)}h {f.roundTripMin % 60}m
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> 체류
                  </span>
                  <span className="text-[12px] font-bold text-[#1A1A1A]">
                    {Math.floor(f.stayMin / 60)}h
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Wallet className="w-3 h-3" /> 예상
                  </span>
                  <span className="text-[12px] font-bold text-[#1A1A1A]">{f.estCost}</span>
                </div>
              </div>

              {/* 검증 신호 + 태그 */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500">검증 신호</span>
                  <SignalBar score={f.signalScore} />
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {f.tags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] text-gray-600 px-2 py-0.5 bg-gray-50 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 하단 안내 */}
      <div className="mt-6 px-5">
        <div className="px-4 py-3 bg-white rounded-xl border border-gray-100">
          <p className="text-[11px] text-gray-600 leading-relaxed">
            💡 <span className="font-bold text-[#1A1A1A]">검증 신호</span>는 카카오 지도 평점·리뷰,
            사용자 리뷰, 미디어 노출 등 여러 출처에서 동시에 검증된 정도를 나타냅니다.
            클릭하면 그 안에 자동 짜인 코스 + 주변 좋은 장소·맛집·즐길거리·숙소가 함께 추천됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
