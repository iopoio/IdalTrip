# 제대리 작업 지시 — Phase 1 디자인 적용

클과장 → 제대리 | 우선순위: 즉시 착수

---

## 참조 파일

- 디자인 시안: `download/stitch/` 폴더 전체 (8개 화면 screen.png + code.html)
- 디자인 시스템: `download/stitch/idaltrip_vibe_system/DESIGN.md`
- 컬러/폰트/컴포넌트 규칙은 DESIGN.md를 SoT(Single Source of Truth)로 삼을 것

---

## 0. 사전 작업

### 0-1. 패키지 추가
```bash
npm install react-router-dom
```

### 0-2. 폰트 설정
- Google Fonts에서 `Pretendard` (한국어 본문) + `Plus Jakarta Sans` (헤드라인) 로드
- index.html `<head>`에 추가하거나 @import 사용
- tailwind.config.js에 fontFamily 반영:
  ```
  fontFamily: {
    headline: ['Plus Jakarta Sans', 'Pretendard', 'sans-serif'],
    body: ['Pretendard', 'sans-serif'],
  }
  ```

### 0-3. 컬러 시스템 적용
DESIGN.md 기준으로 tailwind.config.js colors 교체. 핵심 토큰:
- `primary`: #ab3500 (dark) / #ff6b35 (default)
- `secondary`: #225ea9 (dark) / #7cafff (light)
- `surface`, `surface-container-low`, `surface-container`, `surface-container-high` 등 계층 토큰 포함
- stitch code.html의 tailwind config에서 정확한 hex 값 추출할 것

### 0-4. 로고
- 로고 확정: `design/logo/이달여행.svg` (라이트) / `이달여행_D.svg` (다크)
- 네비게이션: 라이트 배경 → 이달여행.svg / 다크 배경 → 이달여행_D.svg
- 폰트: Diphylleia (Google Fonts, OFL 라이선스). "이달" 오렌지 + "여행" 다크/화이트 + 오렌지 마침표
- footer: "IdalTrip" 영문 서브 (Montserrat Regular)
- 시안의 "IdalTrip" 상단 로고를 이달여행 SVG로 교체

---

## 1. 공통 컴포넌트 분리

시안에서 반복되는 요소를 컴포넌트로 추출. `src/components/` 폴더 생성.

| 컴포넌트 | 파일명 | 시안 참조 |
|---------|--------|----------|
| 상단 네비게이션 | `Header.tsx` | _1, _3, ai_2 상단 |
| 하단 모바일 네비 | `BottomNav.tsx` | 5, _4 하단 |
| 축제 카드 | `FestivalCard.tsx` | _1 카드 그리드 |
| 장소 카드 (체크박스) | `SpotCard.tsx` | _3 AI 추천 스팟 |
| 타임라인 아이템 | `TimelineItem.tsx` | ai_1, ai_2 일정표 |
| 코스 요약 | `CourseSummary.tsx` | ai_2 우측 요약 |
| AI 말풍선 | `AiBubble.tsx` | ai_2 추천 사유 |
| 월별 탭 필터 | `MonthFilter.tsx` | _1, 5 월 선택 |

### DESIGN.md 적용 규칙 (컴포넌트 공통)
- 카드 border-radius: `xl` (1.5rem)
- 경계선 금지: 보더 대신 배경색 차이로 구분
- 그림자: blur 20~40px, opacity 4~8%만 (은은하게)
- 아이콘: lucide-react 사용 (Material Symbols 아닌 것 주의)
- 시안에 Material Symbols Outlined 아이콘이 쓰인 곳은 lucide-react에서 대응되는 아이콘으로 매핑

---

## 2. 라우팅 설정

`src/App.tsx`를 react-router 기반으로 재구성.

```
/                → 메인 홈 (pages/HomePage.tsx)
/festival/:id   → 축제 상세 + 옵션 (pages/FestivalDetailPage.tsx)
/course/:id     → 코스 결과 타임라인 (pages/CourseResultPage.tsx)
/course/:id/map → 코스 결과 지도 뷰 (pages/CourseMapPage.tsx)
```

`src/pages/` 폴더 생성.

---

## 3. 페이지별 구현

### 3-1. 메인 홈 (HomePage.tsx)
시안: `_1` (데스크탑) + `5` (모바일)

- 히어로: 시즌 헤드라인 ("5월의 여행") + 배경 이미지 + CTA
- 월별 필터: **시안의 dot 방식 대신** "5월" 같은 텍스트 탭으로 구현 (가로 스크롤). 현재 월 강조.
- 축제 카드 그리드: tourApi.fetchFestivals() 연동. 이미지 없는 축제는 그래디언트 + 축제 아이콘 placeholder.
- AI 추천 배너: "내 취향에 맞는 축제 찾기" 섹션 (시안 _1 하단 참조)
- 모바일: BottomNav 표시 / 데스크탑: Header 네비 링크

### 3-2. 축제 상세 (FestivalDetailPage.tsx)
시안: `_3` (데스크탑) + `_2` (모바일)

- 데스크탑: 좌측(축제 정보 + AI 추천 스팟) / 우측(옵션 패널) 2단
- 모바일: 세로 스택
- AI 추천 스팟: SpotCard 컴포넌트, 체크/해제 가능
- 옵션: 출발지 입력 / 자차 or 대중교통 / 당일 or 1박2일 or 2박3일
- CTA: "AI 코스 생성하기" — 모바일에서는 하단 고정 (BottomNav 숨김)
- **시안에 없는 보완:** 자차/대중교통 선택 버튼을 시안 _3 우측 패널 스타일로 구현

### 3-3. 코스 결과 (CourseResultPage.tsx)
시안: `ai_2` (데스크탑) + `ai_1` (모바일)

- AI 로딩 → 완료 전환 (로딩 시 스켈레톤 + "AI가 코스를 만들고 있어요" 메시지)
- 코스 요약: 소요시간 / 예산 / 장소 수
- 타임라인: TimelineItem 컴포넌트 반복. 각 장소에 "카카오맵으로 보기" 버튼.
- Day 탭: 1박2일 이상이면 Day1 / Day2 탭 전환
- AI 추천 사유 말풍선 (AiBubble)
- **시안에 없는 보완:** Day 탭 옆에 자차/대중교통 전환 탭 추가
- 하단: "이 코스 저장하기" + "다른 코스 추천받기"

### 3-4. 지도 뷰 (CourseMapPage.tsx)
시안: `_5` (데스크탑) + `_4` (모바일)

- 지도 영역: 카카오맵 SDK div (시안의 지도 스타일은 무시 — SDK가 자체 렌더링)
- 마커: 번호 마커 오버레이 (primary 컬러 원형 + 흰색 숫자)
- 점선 경로: 카카오맵 폴리라인
- 하단 카드: 장소 리스트 가로 스크롤. "카카오맵 네비" 버튼.
- 자차 시 주차장 정보 표시 (시안 _4 참조)

---

## 4. 기존 코드 정리

- `src/App.css` → 불필요하면 삭제
- `src/assets/react.svg`, `src/assets/vite.svg` → 삭제
- `src/assets/hero.png` → 히어로에 계속 쓸 거면 유지, 아니면 삭제

---

## pass/fail 기준

1. `npm run build` 에러 0건 → pass
2. 4개 라우트 모두 접근 가능 (빈 페이지라도 OK) → pass
3. 메인 홈에서 축제 카드 클릭 → 상세 페이지 이동 → pass
4. tailwind.config.js 컬러가 DESIGN.md 기준으로 교체됨 → pass
5. 로고가 "이달의 여행" 한글로 표시됨 → pass
6. lucide-react 아이콘만 사용 (Material Symbols 사용 시 fail) → pass
7. 시안의 code.html을 그대로 복붙하지 말 것. React 컴포넌트로 재구성 → pass

---

## 주의사항

- 시안의 code.html은 참조용. 그대로 복붙하면 정적 HTML이 되어 React 의미 없음.
- 이미지 URL은 시안의 구글 AI 생성 이미지를 임시로 써도 되지만, 추후 TourAPI 이미지로 교체 예정.
- Phase 2에서 API 연동 + 코스 생성 로직 작업이 이어지므로, 데이터는 목업으로 처리해도 OK.
- 작업 완료 후 `npm run build` 통과 + 각 페이지 스크린샷 첨부해서 보고할 것.
