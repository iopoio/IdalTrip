import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Wallet,
  Navigation,
  Star,
  Camera,
  Utensils,
  Mountain,
  Bed,
  Check,
} from 'lucide-react';

type ScheduleItem = {
  time: string;
  type: 'festival' | 'food' | 'attraction' | 'leisure' | 'depart' | 'return';
  name: string;
  duration: string;
  distance?: string;
  badge?: string;
  signal?: number; // 검증 신호 0~10
};

const SCHEDULE: ScheduleItem[] = [
  { time: '09:30', type: 'depart', name: '서울 강남구 출발', duration: '' },
  {
    time: '10:30',
    type: 'festival',
    name: '가평 자라섬 봄꽃축제',
    duration: '2시간',
    distance: '68km',
    badge: '🌸 시즌 축제',
    signal: 9,
  },
  {
    time: '12:30',
    type: 'food',
    name: '청평 화로구이 손맛집',
    duration: '1시간',
    distance: '4km',
    badge: '🚗 드라이빙 맛집',
    signal: 8,
  },
  {
    time: '14:00',
    type: 'leisure',
    name: '자라섬 둘레길 산책',
    duration: '1시간 30분',
    distance: '3km',
    badge: '🚶 즐길거리',
    signal: 7,
  },
  {
    time: '16:00',
    type: 'attraction',
    name: '청평호 전망대',
    duration: '1시간',
    distance: '6km',
    badge: '📸 좋은 장소',
    signal: 8,
  },
  { time: '17:30', type: 'return', name: '서울 복귀', duration: '1시간 30분' },
];

const STAYS = [
  {
    id: 's1',
    name: '가평 청평 ○○펜션',
    type: '펜션',
    price: '11만원',
    distanceFromCourse: '4km',
    signal: 8,
    tag: '코스 동선 위',
  },
  {
    id: 's2',
    name: '가평 ○○호텔',
    type: '호텔',
    price: '14만원',
    distanceFromCourse: '7km',
    signal: 9,
    tag: '평점 4.7+',
  },
  {
    id: 's3',
    name: '청평 한옥스테이 ○○',
    type: '한옥',
    price: '16만원',
    distanceFromCourse: '5km',
    signal: 8,
    tag: '특색 숙소',
  },
];

const TYPE_ICON = {
  festival: <Star className="w-3.5 h-3.5" />,
  food: <Utensils className="w-3.5 h-3.5" />,
  attraction: <Camera className="w-3.5 h-3.5" />,
  leisure: <Mountain className="w-3.5 h-3.5" />,
  depart: <Navigation className="w-3.5 h-3.5" />,
  return: <Navigation className="w-3.5 h-3.5" />,
};

const TYPE_COLOR = {
  festival: 'bg-[#FF6B35] text-white',
  food: 'bg-[#FFD23F] text-[#1A1A1A]',
  attraction: 'bg-[#2EC4B6] text-white',
  leisure: 'bg-[#7B5EA7] text-white',
  depart: 'bg-gray-300 text-[#1A1A1A]',
  return: 'bg-gray-300 text-[#1A1A1A]',
};

const SignalBar = ({ score }: { score: number }) => {
  const filled = Math.round((score / 10) * 5);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`w-1 h-1 rounded-full ${i < filled ? 'bg-[#FF6B35]' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
};

export default function FestivalBundlePage() {
  const navigate = useNavigate();
  const [overnight, setOvernight] = useState(false);
  const [selectedStay, setSelectedStay] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32">
      {/* 헤더 */}
      <div className="px-5 pt-5 pb-4 bg-white border-b border-gray-100">
        <button
          onClick={() => navigate('/preview/distance-bundle')}
          className="flex items-center gap-1 text-[12px] text-gray-500 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> 거리순 리스트로
        </button>

        <div className="flex items-start gap-2 mb-2">
          <div className="px-2 py-0.5 bg-[#FF6B35] rounded-full">
            <span className="text-[10px] font-bold text-white">🎯 당일치기 가능</span>
          </div>
          <div className="px-2 py-0.5 bg-[#FFF4ED] rounded-full">
            <span className="text-[10px] font-bold text-[#FF6B35]">
              내 위치 기준 68km
            </span>
          </div>
        </div>

        <h1
          className="text-[1.5rem] font-black tracking-tight text-[#1A1A1A] leading-tight"
          style={{ fontFamily: 'Noto Serif KR, serif' }}
        >
          가평 자라섬<br />
          <span style={{ color: '#FF6B35' }}>봄꽃축제</span>
        </h1>
        <p className="text-[12px] text-gray-500 mt-2">
          5월 3일(토) · 경기 가평 · 입장 무료
        </p>

        {/* 메트릭 그리드 */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> 총 시간
            </span>
            <span className="text-[12px] font-bold text-[#1A1A1A]">8시간</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> 총 이동
            </span>
            <span className="text-[12px] font-bold text-[#1A1A1A]">156km</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Wallet className="w-3 h-3" /> 예상
            </span>
            <span className="text-[12px] font-bold text-[#1A1A1A]">9만원</span>
          </div>
        </div>
      </div>

      {/* 코스 안내 */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-bold text-[#1A1A1A]">
            ✦ 자동 코스 (1일차)
          </h2>
          <span className="text-[10px] text-gray-500">AI 동선 최적화</span>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed mb-4">
          축제와 그 주변의 좋은 장소·맛집·즐길거리를 시간·동선 기준으로 자동 묶었습니다.
        </p>
      </div>

      {/* 타임라인 */}
      <div className="px-5 flex flex-col gap-2.5">
        {SCHEDULE.map((item, idx) => (
          <div key={idx} className="flex gap-3">
            {/* 시간 + 라인 */}
            <div className="flex flex-col items-center w-12 shrink-0 pt-1">
              <span className="text-[11px] font-bold text-[#1A1A1A]">{item.time}</span>
              {idx < SCHEDULE.length - 1 && (
                <div className="w-px flex-1 bg-gray-200 mt-1" />
              )}
            </div>

            {/* 카드 */}
            <div className="flex-1 bg-white rounded-xl shadow-sm p-3 mb-1">
              <div className="flex items-start gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    TYPE_COLOR[item.type]
                  }`}
                >
                  {TYPE_ICON[item.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-[13px] font-bold text-[#1A1A1A] leading-tight">
                      {item.name}
                    </h3>
                    {item.badge && (
                      <span className="text-[9px] font-bold text-gray-600 px-1.5 py-0.5 bg-gray-100 rounded shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {item.duration && (
                      <span className="text-[10px] text-gray-500">
                        체류 {item.duration}
                      </span>
                    )}
                    {item.distance && (
                      <span className="text-[10px] text-gray-500">· {item.distance}</span>
                    )}
                  </div>
                  {item.signal !== undefined && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[9px] text-gray-500">검증 신호</span>
                      <SignalBar score={item.signal} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 하단 1박2일 확장 섹션 */}
      <div className="mt-6 mx-5 px-4 py-4 bg-white rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[14px] font-bold text-[#1A1A1A] flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-[#FF6B35]" />
            1박2일로 확장하시겠어요?
          </h2>
          <button
            onClick={() => setOvernight(!overnight)}
            className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all ${
              overnight ? 'bg-[#FF6B35] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {overnight ? <Check className="w-3 h-3 inline mr-1" /> : null}
            {overnight ? '1박2일' : '체크'}
          </button>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
          코스 동선상 가까운 추천 숙소 (체크하면 다음 날 일정 자동 추가)
        </p>

        <div className="flex flex-col gap-2">
          {STAYS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStay(s.id === selectedStay ? null : s.id)}
              disabled={!overnight}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                selectedStay === s.id
                  ? 'border-[#FF6B35] bg-[#FFF4ED]'
                  : 'border-gray-200 bg-white'
              } ${!overnight ? 'opacity-40' : 'active:scale-[0.99]'}`}
            >
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <Bed className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-[12px] font-bold text-[#1A1A1A]">{s.name}</h3>
                  <span className="text-[11px] font-bold text-[#FF6B35] shrink-0">
                    {s.price}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">{s.type}</span>
                  <span className="text-[10px] text-gray-500">
                    · 코스에서 {s.distanceFromCourse}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] text-gray-500">{s.tag}</span>
                  <SignalBar score={s.signal} />
                </div>
              </div>
              {selectedStay === s.id && (
                <Check className="w-4 h-4 text-[#FF6B35] shrink-0" />
              )}
            </button>
          ))}
        </div>

        {overnight && selectedStay && (
          <div className="mt-3 px-3 py-2 bg-[#FFF4ED] rounded-lg">
            <p className="text-[11px] text-[#FF6B35] font-bold">
              ✓ 1박2일 코스로 자동 확장됩니다 (다음 날 일정 추가)
            </p>
          </div>
        )}
      </div>

      {/* 고정 하단 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-5 pt-3 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA] to-transparent">
        <button className="w-full h-12 bg-[#FEE500] text-[#1A1A1A] font-bold rounded-xl shadow-md flex items-center justify-center gap-2">
          <Navigation className="w-4 h-4" />
          카카오내비로 이 코스 시작하기
        </button>
      </div>
    </div>
  );
}
