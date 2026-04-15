# IdalTrip Phase 5 작업 지시서 — 제대리용

작성: 클과장 / 2026-04-15

⚠️ 작업 전 CLAUDE.md + ~/.claude/rules/역할-제대리.md 읽을 것.

---

## 배경 및 방향 전환

기존 "축제 중심" 구조에서 **"지역+날짜 중심"** 구조로 전환.

사용자 실제 의식의 흐름:
```
다음달에 바다 가고싶다 → 강원도? → 강원도에 그날 뭐 있지? → AI야 짜줘
```

**핵심 루프 (신규)**:
```
홈 (지역+날짜 선택) → 탐색결과 (그날 열리는 곳만) → AI 코스 생성 → 코스결과
```

기존 축제 브라우징은 홈 하단에 보조 흐름으로 유지.

---

## Task 1 — tourApi.ts 함수 추가

### 1-1. 지역 코드 매핑 상수 추가

`src/services/tourApi.ts` 상단에 추가:

```typescript
export const REGION_AREA_CODES: Record<string, number[]> = {
  '서울/경기': [1, 2, 31],
  '강원': [32],
  '충청': [3, 8, 33, 34],
  '전라': [5, 37, 38],
  '경상': [4, 6, 7, 35, 36],
  '제주': [39],
};
```

### 1-2. fetchByRegionAndDate 추가

지역 코드 + 날짜로 축제 조회. `areaBasedList2` 엔드포인트 사용.

```typescript
fetchFestivalsByRegionAndDate: async (region: string, date: string): Promise<Festival[]> => {
  // date: 'YYYY-MM-DD' 형식
  const areaCodes = REGION_AREA_CODES[region] || [];
  const dateFormatted = date.replace(/-/g, ''); // YYYYMMDD

  try {
    const results = await Promise.all(
      areaCodes.map(areaCode =>
        axios.get(`${BASE_URL}/searchFestival2`, {
          params: {
            serviceKey: API_KEY,
            _type: 'json',
            MobileOS: 'ETC',
            MobileApp: 'IdalTrip',
            arrange: 'C',
            eventStartDate: dateFormatted,
            eventEndDate: dateFormatted,
            areaCode,
            numOfRows: 20,
            pageNo: 1,
          }
        })
      )
    );

    const items = results.flatMap(r => {
      const raw = r.data?.response?.body?.items?.item;
      if (!raw) return [];
      return Array.isArray(raw) ? raw : [raw];
    });

    return items;
  } catch (error) {
    console.error('Failed to fetch festivals by region and date:', error);
    return [];
  }
},
```

### 1-3. fetchPlacesByRegion 추가

지역 기반 관광지/맛집 조회. `areaBasedList2` 엔드포인트 사용.

```typescript
fetchPlacesByRegion: async (region: string, contentTypeId: string): Promise<Place[]> => {
  const areaCodes = REGION_AREA_CODES[region] || [];

  try {
    const results = await Promise.all(
      areaCodes.map(areaCode =>
        axios.get(`${BASE_URL}/areaBasedList2`, {
          params: {
            serviceKey: API_KEY,
            _type: 'json',
            MobileOS: 'ETC',
            MobileApp: 'IdalTrip',
            arrange: 'C',
            contentTypeId,
            areaCode,
            numOfRows: 10,
            pageNo: 1,
          }
        })
      )
    );

    const items = results.flatMap(r => {
      const raw = r.data?.response?.body?.items?.item;
      if (!raw) return [];
      return Array.isArray(raw) ? raw : [raw];
    });

    return items.slice(0, 20);
  } catch (error) {
    console.error('Failed to fetch places by region:', error);
    return [];
  }
},
```

### 1-4. fetchDetailIntro 추가

운영시간/휴무일 조회. `detailIntro2` 엔드포인트 사용.

```typescript
fetchDetailIntro: async (contentId: string, contentTypeId: string): Promise<any> => {
  try {
    const response = await axios.get(`${BASE_URL}/detailIntro2`, {
      params: {
        serviceKey: API_KEY,
        _type: 'json',
        MobileOS: 'ETC',
        MobileApp: 'IdalTrip',
        contentId,
        contentTypeId,
      }
    });
    const item = response.data?.response?.body?.items?.item;
    return Array.isArray(item) ? item[0] : item || null;
  } catch (error) {
    console.error('Failed to fetch detail intro:', error);
    return null;
  }
},
```

---

## Task 2 — types/index.ts 확장

기존 타입 파일에 아래 추가:

```typescript
export interface SpotWithStatus {
  contentid: string;
  contenttypeid: string;
  title: string;
  firstimage?: string;
  addr1?: string;
  mapx?: string;
  mapy?: string;
  // 운영 상태 (detailIntro2에서 가져옴)
  isOpen?: boolean;       // true: 운영중, false: 휴무, undefined: 확인중
  openTime?: string;      // 이용시간/영업시간
  restDate?: string;      // 쉬는날
  firstMenu?: string;     // 대표메뉴 (음식점만)
  // 축제 전용
  eventstartdate?: string;
  eventenddate?: string;
}
```

---

## Task 3 — HomePage 상단 수정

`src/pages/HomePage.tsx` 히어로 섹션 바로 아래, MonthFilter 위에 삽입.

### 3-1. 지역+날짜 검색 섹션

```tsx
import { useNavigate } from 'react-router-dom';
// navigate 이미 있음

// 상태 추가
const [searchRegion, setSearchRegion] = useState('강원');
const [searchDate, setSearchDate] = useState(() => {
  // 기본값: 다음 주 토요일
  const d = new Date();
  d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7 + 1);
  return d.toISOString().split('T')[0];
});

// 히어로 섹션 바로 아래, MonthFilter 위에 삽입
<section className="px-4 py-6 bg-white">
  <h2 className="text-lg font-bold text-on-surface mb-4">
    어디로 떠날까요?
  </h2>
  <div className="flex flex-col gap-3">
    {/* 지역 선택 */}
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {['서울/경기', '강원', '충청', '전라', '경상', '제주'].map(region => (
        <button
          key={region}
          onClick={() => setSearchRegion(region)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
            searchRegion === region
              ? 'bg-primary-container text-white'
              : 'bg-surface-container text-slate-500'
          }`}
        >
          {region}
        </button>
      ))}
    </div>
    {/* 날짜 선택 */}
    <input
      type="date"
      value={searchDate}
      min={new Date().toISOString().split('T')[0]}
      onChange={e => setSearchDate(e.target.value)}
      className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
    />
    {/* 탐색 버튼 */}
    <button
      onClick={() => navigate(`/explore?region=${encodeURIComponent(searchRegion)}&date=${searchDate}`)}
      className="w-full bg-primary-container text-white py-4 rounded-xl font-bold text-base shadow-md active:scale-[0.98] transition-all"
    >
      {searchRegion} · {new Date(searchDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })} 탐색하기
    </button>
  </div>
</section>
```

---

## Task 4 — ExploreResultPage 신규 생성

`src/pages/ExploreResultPage.tsx` 신규 생성.

### 기능 요약
- URL 파라미터: `?region=강원&date=2026-05-03`
- 데이터 로드: 축제(해당 날짜) + 관광지 + 맛집 병렬 조회
- detailIntro2로 운영 여부 체크 (상위 15개 항목만)
- 체크박스로 스팟 선택
- 하단 고정 CTA: 출발지 + 이동수단 + AI 코스 생성

### 운영 여부 판단 로직

```typescript
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
```

### 전체 컴포넌트 구조

```tsx
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
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

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

      const allSpots = [...festivalSpots, ...attractionSpots, ...foodSpots];
      setSpots(allSpots);

      // 기본 선택: 운영중인 것들 중 상위 3개
      const openSpots = allSpots.filter(s => s.isOpen !== false).slice(0, 3);
      setSelectedIds(openSpots.map(s => s.contentid));

      setLoading(false);
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
        duration: 'day',
        origin: origin || '서울역',
        travelDate: date, // 날짜 추가
      });
      if (response) {
        navigate(`/course/${selected[0]?.contentid || 'result'}`, {
          state: { course: response, transport, places: selected, duration: 'day' }
        });
      }
    } catch (e) {
      console.error(e);
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
                    <p className="text-[11px] text-slate-400 mt-0.5">대표메뉴: {spot.firstMenu}</p>
                  )}
                  {spot.openTime && !isClosed && (
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{spot.openTime}</p>
                  )}
                  {isClosed && spot.restDate && (
                    <p className="text-[11px] text-red-400 mt-0.5">휴무: {spot.restDate}</p>
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

      {/* 하단 고정 CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white/95 backdrop-blur-sm border-t border-surface-container px-4 pt-4 pb-8 z-40">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="출발지 (예: 서울역)"
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            className="flex-1 bg-surface-container-low rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={() => setTransport(t => t === 'car' ? 'public' : 'car')}
            className="px-4 py-2.5 bg-surface-container rounded-xl text-sm font-bold text-slate-600"
          >
            {transport === 'car' ? '자가용' : '대중교통'}
          </button>
        </div>
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
```

임포트 상단에 추가:
```typescript
import { useSearchParams, useNavigate } from 'react-router-dom';
import { tourApi } from '../services/tourApi';
import { geminiService } from '../services/gemini';
import type { SpotWithStatus } from '../types';
```

---

## Task 5 — geminiService.ts 수정

`generateCourse` 함수 파라미터에 `travelDate` 추가:

```typescript
// 기존 파라미터 인터페이스에 추가
travelDate?: string; // 'YYYY-MM-DD'
```

Gemini 프롬프트에 날짜 정보 추가:
```typescript
// 프롬프트 내 장소 목록 부분에 추가
const dateInfo = params.travelDate
  ? `여행 날짜: ${params.travelDate} (${new Date(params.travelDate).toLocaleDateString('ko-KR', { weekday: 'long' })})\n운영 중인 장소만 코스에 포함되었습니다.\n`
  : '';
```

프롬프트 앞부분에 `${dateInfo}` 삽입.

---

## Task 6 — App.tsx 라우트 추가

```tsx
import ExploreResultPage from './pages/ExploreResultPage';

// Routes에 추가
<Route path="/explore" element={<ExploreResultPage />} />
```

---

## Task 7 — CourseResultPage UI 개선 (Phase4 통합)

Phase4 지시서의 Task 1 내용 그대로 적용:
- 지도 `h-[55vh]` sticky 상단
- 하단 가로 스와이프 카드
- 카카오 네비 버튼 `#f9e000`
- 카드 스크롤 시 지도 포커스
- `CourseMapPage.tsx` 삭제 + 라우트 제거

Phase4 지시서 Task 1~3 참고.

---

## 검증 체크리스트

```
## Task 1 — tourApi 확장
fetchFestivalsByRegionAndDate 실제 호출 + 응답 확인: ✅/❌
fetchPlacesByRegion 실제 호출 + 응답 확인: ✅/❌
fetchDetailIntro 실제 호출 + 응답 확인: ✅/❌

## Task 3 — HomePage
지역 선택 버튼 작동: ✅/❌
날짜 선택 작동: ✅/❌
탐색하기 버튼 → /explore 이동: ✅/❌

## Task 4 — ExploreResultPage
데이터 로드 확인 (3종 병렬): ✅/❌
운영/휴무 뱃지 표시: ✅/❌
체크박스 선택/해제: ✅/❌
하단 CTA → 코스 생성 → CourseResultPage 이동: ✅/❌

## Task 7 — CourseResultPage
지도 55vh: ✅/❌
카드 가로 스와이프: ✅/❌
노란 네비 버튼: ✅/❌

## 빌드
npm run build: 통과 / 실패
실폰 확인: ✅/❌
```

---

## 절대 규칙

- API 함수는 실제 호출 + 응답 원문 확인 후에만 "완료" 보고
- 같은 에러 2회 → 멈추고 보고
- .env 수정 금지 / 배포 금지
- 빌드만 통과하고 보고 금지 — 브라우저에서 실제 동작 확인 필수
