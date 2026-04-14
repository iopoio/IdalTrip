# IdalTrip Phase 3 작업 지시서 — 제대리용

작성: 클과장 / 2026-04-15

⚠️ 작업 전 CLAUDE.md + ~/.claude/rules/역할-제대리.md + ~/.claude/rules/개발-API.md + ~/.claude/rules/개발-프론트엔드.md + ~/.claude/rules/디자인-가이드.md 읽을 것.

---

## 핵심 방향 결정 (후추님 확정)

> 웹/모바일 분리 없이, 웹에서도 모바일 앱처럼 보이게.
> 데스크탑에서 열어도 폰 앱 미리보기 느낌.

---

## Task 1 — 전체 레이아웃 모바일 앱 구조로 전환 [최우선]

### 1-1. 루트 컨테이너
모든 페이지의 최상위 wrapper를 아래 구조로 통일:

```tsx
// 바깥 배경 (데스크탑에서 양 옆)
<div className="min-h-screen bg-[#FFF8F3]">
  // 앱 컨테이너 (430px 센터)
  <div className="max-w-[430px] mx-auto min-h-screen bg-white relative shadow-xl">
    {children}
  </div>
</div>
```

- 바깥 배경색: `#FFF8F3` (오렌지 아주 연한 tint)
- 앱 컨테이너: `max-w-[430px]`, `shadow-xl` (데스크탑에서 앱처럼 보이게)
- 기존 `max-w-[1920px]`, `max-w-[1440px]` 전부 제거

### 1-2. 상단 헤더 제거 → 하단 탭바로 교체

기존 상단 Header 컴포넌트 숨기기 (삭제 말고 `hidden` 처리).

하단 고정 탭바 새로 만들기 (`src/components/BottomNav.tsx`):
```tsx
// 탭 3개
// 홈(/) | 탐색(/festivals) | 내 여행(/my-trips, 미구현이면 빈 페이지)
// fixed bottom-0, 430px 컨테이너 안에서만 표시
// 높이 64px, 안전영역 pb-safe 고려
// 현재 경로에 따라 active 탭 표시
```

탭바가 있으므로 각 페이지 하단에 `pb-20` 추가 (탭바에 가리지 않게).

### 1-3. 기존 `pt-20`, `pt-32` 상단 패딩 제거
헤더가 없어지므로 각 페이지 상단 패딩 제거. `pt-4` 또는 `pt-0`으로.

---

## Task 2 — 히어로 섹션 재구성

### 변경 사항
- `h-[870px]` → `aspect-[4/5]` (세로형)
- 영어 뱃지 `"Seasonal Highlight"` → 제거
- 하드코딩된 "장미의 계절" 카피 → 월별 동적 카피로 교체

### 월별 카피 데이터 (`src/data/seasonCopy.ts` 신규 생성)
```ts
export const seasonCopy: Record<number, { title: string; subtitle: string }> = {
  1: { title: "새해의 시작,\n겨울 축제", subtitle: "눈 위에서 펼쳐지는 특별한 순간" },
  2: { title: "봄의 예감,\n매화의 계절", subtitle: "이른 봄을 먼저 만나는 여행" },
  3: { title: "3월의 여행,\n벚꽃 시즌 시작", subtitle: "분홍빛으로 물드는 전국 각지" },
  4: { title: "4월의 여행,\n봄 축제 절정", subtitle: "전국 곳곳에서 펼쳐지는 봄의 향연" },
  5: { title: "5월의 여행,\n녹음의 계절", subtitle: "싱그러운 초여름, 축제가 시작됩니다" },
  6: { title: "6월의 여행,\n초여름 바다", subtitle: "여름이 시작되기 전 마지막 선선함" },
  7: { title: "7월의 여행,\n여름 축제", subtitle: "뜨거운 여름, 더 뜨거운 축제" },
  8: { title: "8월의 여행,\n해변과 축제", subtitle: "여름의 절정에서 만나는 특별함" },
  9: { title: "9월의 여행,\n단풍 예고", subtitle: "가을이 물들기 시작하는 계절" },
  10: { title: "10월의 여행,\n단풍 절정", subtitle: "붉고 노란 가을빛 속으로" },
  11: { title: "11월의 여행,\n늦가을 감성", subtitle: "쓸쓸하고 아름다운 마지막 가을" },
  12: { title: "12월의 여행,\n겨울 시작", subtitle: "한 해를 마무리하는 특별한 여행" },
}
```

HomePage에서 `seasonCopy[currentMonth]`로 불러와서 표시.

---

## Task 3 — 영어 → 한국어 전환

아래 문자열 전부 찾아서 교체:

| 현재 (영어) | 교체 (한국어) |
|------------|--------------|
| `"Seasonal Highlight"` | 제거 |
| `"AI Personalized"` | `"AI 맞춤 추천"` |
| `"AI Curation"` | `"AI 큐레이션"` |
| `"Day 1"`, `"Day 2"`, `"Day 3"` | `"1일차"`, `"2일차"`, `"3일차"` |
| `"AI Curation Engine"` | 제거 또는 `"AI 코스 설계"` |
| Footer `"© 2024 IdalTrip. All rights reserved."` | `"© 2026 이달트립. All rights reserved."` |

---

## Task 4 — 축제 카드 세로형 2열로 교체

HomePage 축제 그리드:
```tsx
// 변경 전
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"

// 변경 후
className="grid grid-cols-2 gap-3"
```

FestivalCard 컴포넌트:
- `aspect-[3/4]` 세로형
- 카드 라운딩 `rounded-xl` (기존 과도한 라운딩 제거)
- 이미지 위에 그라디언트 오버레이 + 하단에 축제명/날짜/지역

---

## Task 5 — 코스 결과 페이지 단일 컬럼 + 새로고침 대응

### 5-1. 레이아웃 단일 컬럼으로
```tsx
// 변경 전: lg:col-span-7 / lg:col-span-5 2단
// 변경 후: 단일 컬럼
// 순서: 헤더 → Day 탭 → 카카오맵 → 타임라인 → 코스 요약 → 비용 → 확정 버튼
```

카카오맵 높이: `h-[240px]` (모바일 기준)

### 5-2. 새로고침 대응 (sessionStorage)
`CourseResultPage.tsx` 상단에:
```tsx
// location.state 있으면 sessionStorage에 저장
// location.state 없으면 sessionStorage에서 복원
// 둘 다 없으면 "/"로 navigate
useEffect(() => {
  if (location.state?.course) {
    sessionStorage.setItem('lastCourse', JSON.stringify(location.state));
  }
}, [location.state]);

const stateData = location.state || JSON.parse(sessionStorage.getItem('lastCourse') || 'null');
if (!stateData) navigate('/');
```

---

## Task 6 — 대중교통 경로 정직한 처리

현재 `getPublicRoute`가 자동차 시간 × 1.5 가짜 구현.

수정: 대중교통 선택 시 이동시간 표시 대신 카카오맵 링크로 연결.

`CourseResultPage`에서 transport === 'public'일 때 이동시간 표시 부분:
```tsx
{transport === 'public' && item.move_time && (
  <a 
    href={`https://map.kakao.com/link/to/${encodeURIComponent(item.place_name)},${item.lat},${item.lng}`}
    target="_blank"
    className="..."
  >
    카카오맵에서 대중교통 경로 보기
  </a>
)}
```

`kakaoMap.ts`의 `getPublicRoute`는 건드리지 말고 위 UI 처리만.

---

## 완료 보고 형식

```
## Task 1 — 레이아웃
결과: 통과 / 실패
변경 파일: (목록)
로컬 확인: npm run dev 실행 후 브라우저 확인 완료 여부

## Task 2 — 히어로
결과: 통과 / 실패
seasonCopy.ts 생성: ✅/❌

## Task 3 — 한국어
결과: 통과 / 실패
교체 항목: (완료된 것 목록)

## Task 4 — 카드
결과: 통과 / 실패

## Task 5 — 코스 결과
결과: 통과 / 실패
새로고침 테스트: ✅/❌

## Task 6 — 대중교통
결과: 통과 / 실패

## 빌드
npm run build 결과: 통과 / 실패
에러: (있으면)
```

---

## 절대 규칙

- 작업 후 반드시 `npm run build` 통과 확인
- 브라우저에서 실제 확인 후 보고 (빌드만 통과하고 보고 금지)
- 모바일 너비(430px) 기준으로 확인할 것 — Chrome DevTools 모바일 에뮬레이터 사용
- 같은 에러 2회 → 멈추고 보고
- .env 수정 금지 / 배포 금지
