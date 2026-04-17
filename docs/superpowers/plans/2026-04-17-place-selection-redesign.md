# PlaceSelectionPage 재설계 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 한국관광공사 contentTypeId=25 여행코스 데이터를 통합해 장소 큐레이션 품질을 높이고, 카테고리별 밸런싱과 더 보기 기능으로 UX를 개선한다.

**Architecture:** PlaceSelectionPage의 loadPlaces()에서 contentTypeId=25 코스를 병렬 fetch 후 subcontentid ↔ nearbyPlaces contentid 교차 매칭으로 "관광공사 추천" 장소를 자동 선별한다. 추천 장소는 상단 별도 섹션에 체크된 채로 표시, 나머지는 카테고리별 10개 기본 노출 + 더 보기 방식으로 표시한다.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, TourAPI 4.0 (contentTypeId=25 detailInfo2), Vite

---

## 파일 구조

| 파일 | 변경 | 내용 |
|------|------|------|
| `src/services/tourApi.ts` | 수정 | `fetchCourseDetail()` 함수 추가 |
| `src/pages/PlaceSelectionPage.tsx` | 수정 | 코스 매칭 로직, 섹션 분리, 더 보기, 버튼 변경 |

---

## Task 1: tourApi에 fetchCourseDetail 추가

**Files:**
- Modify: `src/services/tourApi.ts`

### 코스 서브아이템 타입

```typescript
// tourApi.ts 최상단 또는 import 아래에 추가 (export 포함)
export interface CourseSubItem {
  subnum: string;       // 방문 순서 (문자열 "0","1","2"...)
  subcontentid: string; // 장소 contentid
  subname: string;      // 장소명
  subdetailoverview: string; // 설명
}
```

### fetchCourseDetail 함수

```typescript
// tourApi 객체 안, fetchRecommendedCourses 바로 아래에 추가
fetchCourseDetail: async (contentId: string): Promise<CourseSubItem[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/detailInfo2`, {
      params: {
        serviceKey: API_KEY,
        _type: 'json',
        MobileOS: 'ETC',
        MobileApp: '이달여행',
        contentId,
        contentTypeId: '25',
      }
    });
    const items = response.data?.response?.body?.items?.item;
    if (!items) return [];
    const arr: CourseSubItem[] = Array.isArray(items) ? items : [items];
    // subnum 오름차순 정렬 (문자열 → 숫자 변환)
    return arr.sort((a, b) => parseInt(a.subnum) - parseInt(b.subnum));
  } catch (error) {
    console.error('Failed to fetch course detail:', error);
    return [];
  }
},
```

- [ ] `src/services/tourApi.ts` 파일 열기
- [ ] `CourseSubItem` 인터페이스를 파일 최상단 import 아래에 추가
- [ ] `fetchCourseDetail` 함수를 `fetchRecommendedCourses` 바로 아래에 추가
- [ ] 브라우저 콘솔 확인: `tourApi.fetchCourseDetail('2680214')` 호출해서 배열 반환되는지 확인
- [ ] 커밋:
  ```bash
  git add src/services/tourApi.ts
  git commit -m "feat: tourApi에 fetchCourseDetail(contentTypeId=25) 추가"
  ```

---

## Task 2: PlaceSelectionPage 상태 및 타입 확장

**Files:**
- Modify: `src/pages/PlaceSelectionPage.tsx`

현재 파일 상단 타입 섹션 (`// ─── Types`) 아래에 추가:

```typescript
import { tourApi } from '../services/tourApi';
import type { CourseSubItem } from '../services/tourApi'; // 추가
```

`SelectablePlace` 인터페이스 수정:

```typescript
interface SelectablePlace extends PlaceWithDetail {
  placeType: string;
  selected: boolean;
  isRecommended?: boolean; // 관광공사 추천 여부 (신규)
  recommendOrder?: number;  // subnum 순서 (신규)
}
```

컴포넌트 내부 state 추가 (`const [generating, setGenerating]` 아래에):

```typescript
const [recommendedIds, setRecommendedIds] = useState<Set<string>>(new Set());
const [visibleCount, setVisibleCount] = useState(10); // 더 보기용
```

- [ ] `CourseSubItem` import 추가
- [ ] `SelectablePlace` 인터페이스에 `isRecommended?`, `recommendOrder?` 필드 추가
- [ ] `recommendedIds`, `visibleCount` state 추가
- [ ] `npm run build` 실행, 에러 없는지 확인
- [ ] 커밋:
  ```bash
  git add src/pages/PlaceSelectionPage.tsx
  git commit -m "refactor: PlaceSelectionPage 타입 및 state 확장"
  ```

---

## Task 3: loadPlaces에 코스 매칭 로직 추가

**Files:**
- Modify: `src/pages/PlaceSelectionPage.tsx` (`loadPlaces` 함수)

현재 `loadPlaces` 함수의 `Promise.allSettled` 호출에 코스 fetch 추가:

```typescript
const loadPlaces = async () => {
  setLoading(true);
  setError(null);

  try {
    const center = REGION_CENTER[region] ?? REGION_CENTER['전체'];
    // 지역 → areaCode 변환 (강원=32, 서울/경기=1, 충청=3, 전라=5, 경상=4, 제주=39)
    const REGION_AREA_CODE: Record<string, number> = {
      '서울/경기': 1, '강원': 32, '충청': 3, '전라': 5, '경상': 4, '제주': 39,
    };
    const areaCode = REGION_AREA_CODE[region];

    const results = await Promise.allSettled([
      tourApi.fetchFestivalsByRegionAndDate(region, date),
      tourApi.fetchPlacesByRegion(region, '12'),
      tourApi.fetchPlacesByRegion(region, '14'),
      tourApi.fetchPlacesByRegion(region, '28'),
      kakaoMapService.searchRestaurants(`${region} 맛집`, center.lat, center.lng, 30000),
      tourApi.fetchPlacesByRegion(region, '39'),
      // 신규: 관광공사 추천 코스
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

    // 카카오 맛집 우선, 없으면 TourAPI 39 fallback
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

    // 코스 상세 (서브아이템) fetch — 첫 번째 코스만
    let subItems: CourseSubItem[] = [];
    if (courses.length > 0) {
      subItems = await tourApi.fetchCourseDetail(courses[0].contentid);
    }
    const recommendedContentIds = new Set(subItems.map((s) => s.subcontentid));
    setRecommendedIds(recommendedContentIds);

    setFestivals(fetchedFestivals);

    // ── 카테고리별 밸런싱 (2개씩, 합계 10개) ──
    const festivalPlaces: Place[] = fetchedFestivals.map(festivalToPlace);

    // 각 카테고리 2개씩 — 부족하면 관광지(12)로 보충
    const pick = (arr: Place[], n: number): Place[] => arr.slice(0, n);
    const cat12 = pick(attractions, 2);
    const cat14 = pick(culture, 2);
    const cat28 = pick(leisure, 2);
    const cat39 = pick(kakaoFood, 2);
    // 부족한 슬롯 계산
    const shortfall = (2 - cat12.length) + (2 - cat14.length) + (2 - cat28.length) + (2 - cat39.length);
    const extra12 = pick(attractions.slice(2), shortfall); // 관광지로 보충

    const additionalPlaces: Place[] = [...cat12, ...cat14, ...cat28, ...cat39, ...extra12];

    const all: Place[] = [
      ...festivalPlaces,
      ...additionalPlaces,
    ];

    // 중복 제거
    const seen = new Set<string>();
    const unique = all.filter((p) => {
      if (seen.has(p.contentid)) return false;
      seen.add(p.contentid);
      return true;
    });

    // isRecommended + recommendOrder 마킹
    const selectable: SelectablePlace[] = unique.map((p) => {
      const subItem = subItems.find((s) => s.subcontentid === p.contentid);
      const isRecommended = !!subItem;
      return {
        ...p,
        placeType: p.contenttypeid,
        selected: isRecommended, // 관광공사 추천은 자동 체크
        isRecommended,
        recommendOrder: subItem ? parseInt(subItem.subnum) : undefined,
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
```

- [ ] `loadPlaces` 함수를 위 코드로 교체
- [ ] `npm run build` 실행, 타입 에러 없는지 확인
- [ ] 브라우저에서 강원 지역 선택 → 장소 로딩 → 콘솔에 에러 없는지 확인
- [ ] 커밋:
  ```bash
  git add src/pages/PlaceSelectionPage.tsx
  git commit -m "feat: loadPlaces에 관광공사 코스 매칭 로직 추가"
  ```

---

## Task 4: 관광공사 추천 섹션 UI 추가

**Files:**
- Modify: `src/pages/PlaceSelectionPage.tsx`

`PlaceCard` 컴포넌트 아래, `// ─── Main Component` 위에 새 컴포넌트 추가:

```typescript
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
                src={place.firstimage}
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
```

Render 섹션 (`{/* Places Section */}` 앞)에 추가:

```tsx
{/* 관공공사 추천 섹션 */}
{!loading && (
  <RecommendedSection
    places={places.filter((p) => p.isRecommended)}
    onToggle={togglePlace}
  />
)}
```

- [ ] `RecommendedSection` 컴포넌트 추가
- [ ] `{/* Places Section */}` 위에 `<RecommendedSection>` 렌더링 추가
- [ ] 브라우저에서 관광공사 추천 섹션이 상단에 오렌지 테두리로 표시되는지 확인
- [ ] 매칭 장소 없을 때 섹션이 사라지는지 확인 (return null 경로)
- [ ] 커밋:
  ```bash
  git add src/pages/PlaceSelectionPage.tsx
  git commit -m "feat: 관광공사 추천 섹션 UI 추가"
  ```

---

## Task 5: 더 보기 + 축제 강조 + 장소 목록 개선

**Files:**
- Modify: `src/pages/PlaceSelectionPage.tsx`

`{/* Places Section */}` 섹션 전체 교체:

```tsx
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
        .filter((p) => !p.isRecommended) // 관광공사 추천은 위에서 표시했으므로 제외
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
```

- [ ] `{/* Places Section */}` 섹션을 위 코드로 교체
- [ ] 브라우저에서 축제 카드에 오렌지 테두리 표시되는지 확인
- [ ] "더 보기" 버튼 클릭 시 10개씩 추가되는지 확인
- [ ] 관광공사 추천 장소가 하단 목록에서 중복으로 뜨지 않는지 확인
- [ ] 커밋:
  ```bash
  git add src/pages/PlaceSelectionPage.tsx
  git commit -m "feat: 더 보기, 축제 오렌지 테두리, 추천 중복 제거"
  ```

---

## Task 6: Gemini 프롬프트에 코스 순서 힌트 추가

**Files:**
- Modify: `src/pages/PlaceSelectionPage.tsx` (`handleGenerate` 함수)
- Modify: `src/services/gemini.ts` (프롬프트 규칙 추가)

`handleGenerate`의 `courseRequest` 생성 부분에서 선택된 장소를 순서 정렬 후 전달:

```typescript
// handleGenerate 내부, courseRequest 생성 전
const sortedSelected = [...selectedPlaces].sort((a, b) => {
  // 관광공사 추천은 recommendOrder 순, 나머지는 뒤로
  const aOrder = a.recommendOrder ?? 9999;
  const bOrder = b.recommendOrder ?? 9999;
  return aOrder - bOrder;
});

const courseRequest = {
  festivalTitle: firstFestival?.title || firstPlace?.title || `${region} 여행`,
  festivalAddr: firstFestival?.addr1 || '',
  festivalLat: parseFloat(firstFestival?.mapy || '0'),
  festivalLng: parseFloat(firstFestival?.mapx || '0'),
  places: sortedSelected, // selectedPlaces → sortedSelected
  transportation: transport,
  duration: duration,
  origin: departure || undefined,
  travelDate: date,
  hasRecommendedCourse: sortedSelected.some((p) => p.isRecommended), // 신규
};
```

`src/services/gemini.ts` 프롬프트 규칙 13번 추가 (기존 12번 아래):

```typescript
// 프롬프트 rules 끝에 추가
${req.hasRecommendedCourse ? '13. 앞에 나열된 장소 중 한국관광공사 추천 장소들은 이미 최적 순서로 정렬되어 있습니다. 이 순서를 최대한 유지하고, 이동 효율이 크게 나빠지는 경우에만 재배치하세요.' : ''}
```

`gemini.ts`의 `CourseRequest` 인터페이스에 추가:
```typescript
hasRecommendedCourse?: boolean;
```

- [ ] `handleGenerate`에서 `sortedSelected` 정렬 로직 추가
- [ ] `courseRequest`에 `hasRecommendedCourse` 필드 추가
- [ ] `gemini.ts`의 `CourseRequest`에 `hasRecommendedCourse?` 추가
- [ ] `gemini.ts` 프롬프트에 규칙 13번 조건부 추가
- [ ] 브라우저에서 관광공사 추천 장소 체크 후 코스 생성 → 콘솔에서 순서 확인
- [ ] 커밋:
  ```bash
  git add src/pages/PlaceSelectionPage.tsx src/services/gemini.ts
  git commit -m "feat: Gemini 프롬프트에 관광공사 코스 순서 힌트 추가"
  ```

---

## Task 7: 버튼 텍스트 + 보조 텍스트 변경

**Files:**
- Modify: `src/pages/PlaceSelectionPage.tsx` (하단 버튼)

현재 버튼 텍스트 `AI 코스 생성하기` → `AI 추천 코스로 여행하기` 변경:

```tsx
{/* Fixed Bottom Bar 내 버튼 텍스트 교체 */}
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
```

버튼 아래 보조 텍스트 추가 (`</button>` 바로 아래):

```tsx
{places.filter((p) => p.isRecommended && p.selected).length > 0 && (
  <p className="text-[10px] text-secondary text-center mt-2">
    관광공사 추천 {places.filter((p) => p.isRecommended && p.selected).length}개 포함
  </p>
)}
```

- [ ] 버튼 텍스트 교체
- [ ] 보조 텍스트 추가
- [ ] 브라우저에서 최종 확인: 추천 섹션 → 장소 목록 → 더 보기 → 버튼 텍스트
- [ ] `npm run build` 빌드 에러 없는지 최종 확인
- [ ] 커밋:
  ```bash
  git add src/pages/PlaceSelectionPage.tsx
  git commit -m "feat: 버튼 텍스트 및 관광공사 추천 카운트 표시"
  ```

---

## 셀프 리뷰

**스펙 커버리지:**
- ✅ contentTypeId=25 코스 fetch + detailInfo2 매칭 (Task 1, 3)
- ✅ 매칭 장소 상단 자동 체크 + 한국관광공사 뱃지 (Task 4)
- ✅ 카테고리별 2개씩 10개 + 폴백 (Task 3)
- ✅ 더 보기 (Task 5)
- ✅ 축제 오렌지 테두리 (Task 5)
- ✅ Gemini 역할 축소 (Task 6)
- ✅ 버튼 텍스트 변경 (Task 7)
- ✅ 에러 처리: courses 0개/matched 0개 → 섹션 숨김 (Task 4 `return null`)

**타입 일관성:**
- `CourseSubItem` → Task 1에서 정의, Task 2·3에서 import
- `SelectablePlace.isRecommended` → Task 2에서 정의, Task 3·4·5·6·7에서 사용
- `hasRecommendedCourse` → Task 6에서 `CourseRequest`에 추가 + `gemini.ts` 동기화

**플레이스홀더 스캔:** 없음 ✅
