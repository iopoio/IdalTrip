# IdalTrip Phase 5 작업 지시서 — 제대리용 (진행 보드판)

작성: 클과장 / 2026-04-15 (원본) · 2026-04-17 16:50 재작성

⚠️ 작업 전 필독: `CLAUDE.md` + `~/.claude/rules/역할-제대리.md`

---

## 배경

기존 "축제 중심" → **"지역+날짜 중심"** 구조 전환.

**핵심 루프**: 홈(지역+날짜) → 탐색결과 → AI 코스 생성 → 코스결과

공모전 마감: 2026-05-06 (19일 남음)
배포: https://idaltrip.vercel.app

---

## 🔎 현재 구현 상태 (클과장 실측 — 2026-04-17)

| Task | 상태 | 위치 |
|---|---|---|
| Task 1: tourApi 확장 (4개 함수 + REGION_AREA_CODES) | ✅ 완료 | `src/services/tourApi.ts` |
| Task 2: SpotWithStatus 타입 | ✅ 완료 | `src/types/index.ts` |
| Task 3: HomePage 지역+날짜 검색 섹션 | ✅ 완료 | `src/pages/HomePage.tsx` (REGIONS, travelDate, navigate `/places`) |
| Task 4: 탐색 결과 페이지 | ✅ 완료 | `src/pages/PlaceSelectionPage.tsx` (원 지시서는 ExploreResultPage 이름이나 **PlaceSelectionPage로 통합 구현**) |
| Task 5: geminiService travelDate | ✅ 완료 | `src/services/gemini.ts` |
| Task 6: 라우트 (탐색 결과) | ✅ 완료 | `/places` (원 지시서는 `/explore`였으나 `/places`로 통일) |
| **Task 7: CourseResultPage UI 재설계** | ❌ **미구현 — 제대리 작업 대상** | `src/pages/CourseResultPage.tsx` |

**실제 남은 작업은 Task 7 하나**. 나머지는 이름이 원 지시서와 달라서 "미완" 같이 보였으나, 실측 결과 기능 전부 구현됨.

---

## 🎯 제대리가 할 일 — Task 7 단일

### ☐ Task 7: CourseResultPage UI 재설계 (지도 + 스와이프 카드)

**목표**: 코스 결과 페이지를 "지도 상단 고정 + 하단 가로 스와이프 카드" 구조로 재설계. 카카오 네비 연동 강조.

#### 7-1. 레이아웃 구조

- [ ] `src/pages/CourseResultPage.tsx` 상단부 재설계
- [ ] 지도 영역: `h-[55vh] sticky top-0 z-10` (상단 고정)
- [ ] 하단 영역: 가로 스와이프 카드 리스트
- [ ] 페이지 전체: `flex flex-col h-screen overflow-hidden` (지도+카드 고정 레이아웃)

#### 7-2. 지도 (카카오맵)

- [ ] 기존 카카오맵 인스턴스 활용
- [ ] 모든 place 좌표를 마커로 표시 (번호 뱃지 포함 — 1, 2, 3…)
- [ ] 마커를 **폴리라인**으로 연결 (선택, 시간 남으면)
- [ ] 줌/드래그 가능

#### 7-3. 하단 가로 스와이프 카드

- [ ] `overflow-x-auto scroll-snap-x mandatory`로 가로 스크롤
- [ ] 각 카드: `scroll-snap-align: center`, 너비 `85vw` 정도
- [ ] 카드 내용:
  - 순서 번호 (01, 02, ...)
  - 장소 이미지 (없으면 그라데이션)
  - 제목 + 주소
  - 예상 소요시간 (Gemini 응답의 duration)
  - **카카오 네비 버튼** (배경 `#f9e000`, 텍스트 검정, 큼직하게)

#### 7-4. 카드 ↔ 지도 연동

- [ ] 카드 스와이프 시 해당 place 좌표로 지도 이동 (`map.setCenter(new kakao.maps.LatLng(...))`)
- [ ] `IntersectionObserver` 또는 scroll event로 현재 보이는 카드 감지
- [ ] 해당 place의 마커 강조 (색상 변경)

#### 7-5. 카카오 네비

- [ ] 기존 `openKakaoNavi(item)` 함수 활용 (`map.kakao.com/link/to/...`)
- [ ] 버튼 스타일: `bg-[#f9e000] text-black font-bold` + 카카오 로고 아이콘(선택)

#### 7-6. 정리

- [ ] `CourseMapPage.tsx` 파일이 있으면 삭제
- [ ] `App.tsx`에서 관련 라우트 있으면 제거
- [ ] 기존 타임라인/리스트 UI는 제거 (지도+카드로 대체)

#### 7-7. 검증

- [ ] `npm run build` 통과 (TS 에러 0)
- [ ] 브라우저: 지도 렌더링, 카드 스와이프, 지도 포커스 이동 확인
- [ ] 실폰 확인:
  - 스와이프 자연스러운지
  - 카카오 네비 버튼 터치 시 지도 앱 열림
  - 지도 55vh + 카드 45vh 비율 이상한지
- [ ] 콘솔 에러 없음

#### 7-8. 커밋

- [ ] `feat: CourseResultPage 지도 55vh + 가로 스와이프 카드 (Phase5 Task 7)`
- [ ] **push 금지** — 커밋만. push는 후추님/클과장 확인 후

---

## 📋 Phase Polish 추가 (Task 7과 같이 진행하면 좋음)

Phase Polish P-1~P-4가 Task 7과 겹침. 기왕 하는 김에:

- [ ] P-2: 카카오 네비 버튼 시각적으로 눈에 띄게 (7-5에서 처리)
- [ ] P-3: 폴리라인 + 번호 마커 (7-2에서 처리)
- [ ] P-4: 카드 스와이프 시 지도 포커스 (7-4에서 처리)
- [ ] P-7: AI 추천 이유 말풍선 — 카드에 Gemini의 이유 텍스트 추가 (선택)

---

## 📸 레퍼런스

Phase 4 때 찍힌 스크린샷: `artifacts/phase4/` 폴더 참조
- `home_regional_filters_*.png` — HomePage 지역 필터 (완료 상태)
- `course_result_day1_*.png`, `course_result_day2_*.png` — 코스 결과 (현재 구버전)
- `festival_detail_hero_*.png` — 축제 상세

현재 구버전 → Task 7에서 지도+스와이프로 재설계.

---

## 🚨 절대 규칙 (재확인)

- API/SDK 호출은 실제 호출 + 응답 원문 확인 후에만 "완료" 보고
- 같은 에러 2회 → 즉시 멈추고 보고
- `.env` 수정 금지
- **`git push` 금지** — 커밋만. push는 클과장/후추님
- 빌드 통과 + 실폰 확인 둘 다 끝나야 "완료"
- 체크박스는 실제 구현 완료한 것만 체크 — 주장만 하지 말 것 (J2 "거짓 보고" 카운터 누적 중)

---

## 📝 보고 형식

Task 7 완료 시 `.claude/inbox/2026-04-XX_HHmm_Task7_완료.md`에:

```markdown
## Task 7 완료 보고

### 변경 파일
- src/pages/CourseResultPage.tsx: (요약)
- ...

### 검증 결과
- 빌드: 통과/실패
- 브라우저: 스크린샷 첨부 (data URI or artifacts/ 경로)
- 실폰: OK/이슈(내용)
- 콘솔 에러: 없음/있음

### 커밋
- 해시 + 메시지

### 클과장 리뷰 요청
- 지도 비율이 모바일에서 적절한지
- 카카오 네비 버튼 UX
- 기타 우려 사항
```

---

## 🔗 참조

- **Phase5 원본 지시서 (614줄)**: git `b0827b5:제대리_Phase5_지시서.md`
- **PlaceSelectionPage 재설계 plan**: `docs/superpowers/plans/2026-04-17-place-selection-redesign.md` (완료)
- **회고**: `.claude/retro/회고.md` (내 실수 카운터 참고)
- **현재 라우트**: `/` HomePage, `/places` PlaceSelectionPage, `/course/result` CourseResultPage
- **Phase 4 스크린샷**: `artifacts/phase4/`
