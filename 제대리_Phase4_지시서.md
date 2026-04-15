# IdalTrip Phase 4 작업 지시서 — 제대리용

작성: 클과장 / 2026-04-15

⚠️ 작업 전 CLAUDE.md + ~/.claude/rules/역할-제대리.md + ~/.claude/rules/개발-API.md + ~/.claude/rules/개발-프론트엔드.md + ~/.claude/rules/디자인-가이드.md 읽을 것.

---

## 배경

카카오가 공동심사. 카카오맵/네비 연동이 잘 보여야 한다.
현재 코스결과 페이지는 카카오맵이 240px로 작고, 네비 링크가 작은 텍스트로 묻혀있음.
핵심 루프: 홈 → 축제상세 → 코스결과(지도+카드) — 이 루프만 완벽하게.

---

## Task 1 — CourseResultPage 전면 재설계 [최우선]

### 목표 레이아웃

```
┌─────────────────────────────┐
│  카카오맵 (h-[55vh], sticky) │  ← 폴리라인 + 번호 마커 (기존 코드 유지)
├─────────────────────────────┤
│  [자차] [대중교통]  |  [1일차] [2일차]  │  ← 탭 바
├─────────────────────────────┤
│  ← 카드 가로 스와이프 →       │  ← snap 스크롤
│  [장소카드1] [장소카드2] ...  │
├─────────────────────────────┤
│  AI 추천 사유 (접기 가능)     │
│  코스 요약 / 예상 비용         │
│  [이 코스로 여행 확정] 버튼    │
└─────────────────────────────┘
```

### 1-1. 전체 레이아웃 구조

`CourseResultPage.tsx` 전체 return 부분을 아래 구조로 교체:

```tsx
return (
  <div className="bg-surface text-on-surface min-h-screen flex flex-col">
    {/* 상단 고정 맵 */}
    <div className="relative flex-shrink-0 h-[55vh] bg-surface-container-high">
      <div ref={mapRef} className="w-full h-full" />
      {/* 코스 제목 오버레이 */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
          <span className="text-[10px] font-bold text-primary tracking-wider">{course.theme}</span>
          <h1 className="text-base font-bold text-on-surface truncate">{course.title}</h1>
        </div>
      </div>
    </div>

    {/* 하단 스크롤 영역 */}
    <div className="flex-1 overflow-y-auto pb-24">
      {/* 탭 바: 이동수단 + 일차 */}
      ...

      {/* 가로 스와이프 카드 */}
      ...

      {/* AI 추천 사유 + 요약 + 확정 버튼 */}
      ...
    </div>
  </div>
);
```

### 1-2. 탭 바

맵 아래 바로 붙는 탭 바. 좌측: 이동수단 표시(읽기 전용), 우측: 일차 탭

```tsx
<div className="flex items-center justify-between px-4 py-3 border-b border-surface-container bg-white sticky top-0 z-10">
  {/* 이동수단 표시 */}
  <div className="flex items-center gap-2">
    <span className="text-xs font-bold text-slate-400">이동수단</span>
    <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
      {transport === 'car' ? '자가용' : '대중교통'}
    </span>
  </div>
  {/* 일차 탭 */}
  {dayCount > 1 && (
    <div className="flex gap-2">
      {Array.from({ length: dayCount }).map((_, i) => (
        <button
          key={i}
          onClick={() => setActiveDay(i + 1)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeDay === i + 1
              ? 'bg-primary text-white'
              : 'bg-surface-container text-slate-500'
          }`}
        >
          {i + 1}일차
        </button>
      ))}
    </div>
  )}
</div>
```

### 1-3. 가로 스와이프 장소 카드

일차별 장소를 가로로 스냅 스크롤. 각 카드 너비는 컨테이너 - 양 사이드 여백.

카드 스크롤 시 지도 포커스: IntersectionObserver 또는 scroll 이벤트로 visible 카드 감지 → `map.panTo(new window.kakao.maps.LatLng(item.lat, item.lng))`

```tsx
{/* 가로 스와이프 카드 리스트 */}
<div
  className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 py-5 scrollbar-hide"
  style={{ scrollPaddingLeft: '1rem' }}
>
  {course.schedule
    .filter((item: CourseItem) => (typeof item.day === 'number' ? item.day : parseInt(String(item.day)) || 1) === activeDay)
    .map((item: CourseItem, idx: number) => {
      const placeImage = getPlaceImage(item.place_name);
      return (
        <div
          key={idx}
          className="snap-start flex-shrink-0 w-[calc(100%-2rem)] bg-white rounded-2xl shadow-md overflow-hidden border border-surface-container-low"
        >
          {/* 이미지 영역 */}
          <div className="relative h-36 bg-surface-container-high">
            {placeImage ? (
              <img className="w-full h-full object-cover" src={placeImage} alt={item.place_name} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                <LocationOn className="w-10 h-10 text-primary opacity-30" />
              </div>
            )}
            {/* 순서 뱃지 */}
            <div className="absolute top-3 left-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
              {idx + 1}
            </div>
            {/* 카테고리 뱃지 */}
            <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-full">
              {item.type === 'food' ? '맛집' : item.type === 'festival' ? '축제' : '관광'}
            </div>
          </div>
          {/* 내용 영역 */}
          <div className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-primary font-bold text-xs">{item.time}</span>
              <span className="text-slate-400 text-xs">{item.stay_duration}</span>
            </div>
            <h3 className="font-bold text-base text-on-surface">{item.place_name}</h3>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.description}</p>
            {/* 이동 정보 */}
            {idx < course.schedule.filter((i: CourseItem) => (typeof i.day === 'number' ? i.day : parseInt(String(i.day)) || 1) === activeDay).length - 1 && item.move_time && (
              <div className="text-[11px] text-slate-400 pt-1 border-t border-surface-container-low">
                {transport === 'car'
                  ? `다음 장소까지 이동 ${item.move_time} (${item.distance})`
                  : '다음 장소까지 대중교통 이용'
                }
              </div>
            )}
            {/* 카카오 네비 버튼 — 카카오 노란색 */}
            <a
              href={kakaoMapService.getDirectionUrl(item.place_name, item.lat, item.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm text-black"
              style={{ backgroundColor: '#f9e000' }}
            >
              <NearMe className="w-4 h-4" />
              카카오맵으로 길찾기
            </a>
          </div>
        </div>
      );
    })}
</div>
```

### 1-4. 카드 스와이프 시 지도 포커스

`mapRef` 외에 `mapInstanceRef = useRef<any>(null)` 추가.
지도 초기화 시 `mapInstanceRef.current = map` 저장.

카드 컨테이너에 `onScroll` 핸들러 또는 `IntersectionObserver`로 현재 카드 인덱스 감지:

```tsx
// 간단한 scroll 방식
const handleCardScroll = (e: React.UIEvent<HTMLDivElement>) => {
  const container = e.currentTarget;
  const cardWidth = container.offsetWidth - 32; // w-[calc(100%-2rem)]
  const scrollLeft = container.scrollLeft;
  const idx = Math.round(scrollLeft / (cardWidth + 16)); // gap-4 = 16px
  const dayItems = course.schedule.filter(/* 현재 activeDay */);
  const item = dayItems[idx];
  if (item?.lat && item?.lng && mapInstanceRef.current) {
    mapInstanceRef.current.panTo(new window.kakao.maps.LatLng(item.lat, item.lng));
  }
};
```

### 1-5. 하단 — AI 추천 사유 + 요약 + 확정 버튼

기존 코드에서 그대로 가져오되 `px-4 pt-2 pb-24` 패딩 적용.

---

## Task 2 — FestivalDetailPage 하단 고정 CTA

현재 "AI 코스 생성하기" 버튼이 스크롤 안에 있어서 안 보임.
버튼을 화면 하단에 고정.

### 2-1. 기존 버튼 영역 제거

`FestivalDetailPage.tsx`에서 아래 블록 전체 제거:
```tsx
{/* AI Course Generation Button */}
<div className="pt-6 border-t border-slate-100">
  <div className="flex justify-between items-center mb-5">
    ...
  </div>
  <button onClick={handleGenerateCourse} ...>
    AI 코스 생성하기
  </button>
  <p className="text-center text-[10px] ..." />
</div>
```

### 2-2. 하단 고정 CTA 추가

`</div> {/* bg-surface text-on-surface */}` 닫기 태그 바로 위에 추가:

```tsx
{/* 하단 고정 CTA */}
<div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto px-4 pb-6 pt-4 bg-white/95 backdrop-blur-sm border-t border-surface-container z-40">
  <div className="flex items-center justify-between mb-3">
    <span className="text-slate-500 text-sm">선택된 스팟</span>
    <span className="font-bold text-on-surface text-sm">{selectedSpots.length + 1}곳 (축제 포함)</span>
  </div>
  <button
    onClick={handleGenerateCourse}
    disabled={generating || selectedSpots.length === 0}
    className="w-full bg-primary-container hover:scale-[1.02] text-white py-4 rounded-xl font-headline font-bold text-base shadow-lg shadow-primary-container/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
  >
    {generating ? <Loader2 className="animate-spin w-5 h-5" /> : <AutoAwesome className="w-5 h-5" />}
    {generating ? 'AI가 코스를 설계 중...' : 'AI 코스 생성하기'}
  </button>
</div>
```

주의: 기존 `pb-12` → `pb-36`으로 변경 (고정 CTA에 가리지 않게).
`<main className="pt-4 pb-12 px-5">` → `<main className="pt-4 pb-36 px-5">`

---

## Task 3 — CourseMapPage 삭제

`src/pages/CourseMapPage.tsx` 파일 삭제.

`src/App.tsx`에서 아래 두 줄 제거:
```tsx
import CourseMapPage from './pages/CourseMapPage';  // ← 제거
<Route path="/course/:id/map" element={<CourseMapPage />} />  // ← 제거
```

---

## Task 4 — 빌드 + 검증

```bash
npm run build
```

빌드 통과 후 `npm run dev` 실행 → 브라우저에서 확인:
1. 홈 → 축제 클릭 → 상세 페이지 진입: 하단 고정 CTA 보이는지
2. "AI 코스 생성하기" 클릭 → 로딩 → 코스결과 진입
3. 코스결과: 지도 상단 55vh 보이는지
4. 카드 좌우 스와이프 되는지
5. 노란 "카카오맵으로 길찾기" 버튼 보이는지
6. 실폰(Galaxy S25) 크롬에서 동일 확인

---

## 절대 규칙

- 작업 후 반드시 `npm run build` 통과 확인
- 브라우저(Chrome 모바일 에뮬 430px + 실폰) 확인 후 보고
- 같은 에러 2회 → 멈추고 보고
- .env 수정 금지 / 배포 금지
- 빌드만 통과하고 "완료" 보고 금지

---

## 완료 보고 형식

```
## Task 1 — CourseResultPage
결과: 통과 / 실패
변경 파일: CourseResultPage.tsx
지도 55vh: ✅/❌
카드 가로 스와이프: ✅/❌
노란 네비 버튼: ✅/❌
카드↔지도 포커스 연동: ✅/❌

## Task 2 — FestivalDetailPage CTA
결과: 통과 / 실패
하단 고정 버튼 표시: ✅/❌

## Task 3 — CourseMapPage 삭제
결과: 통과 / 실패
파일 삭제 완료: ✅/❌
라우트 제거 완료: ✅/❌

## Task 4 — 빌드
npm run build: 통과 / 실패
에러: (있으면)
실폰 확인: ✅/❌
```
