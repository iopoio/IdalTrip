# PlaceSelectionPage 재설계 스펙

작성일: 2026-04-17
상태: 승인됨

---

## 목적

현재 PlaceSelectionPage는 30개 체크박스 나열 방식으로 결정 피로가 높고, Gemini에 장소 선택·순서·시간 배분을 전부 위임해 신뢰도가 낮다. 한국관광공사 contentTypeId=25 여행코스 데이터를 통합해 장소 큐레이션 품질을 높이고 Gemini 역할을 최소화한다.

---

## 변경 전 vs 변경 후

| 항목 | 현재 | 변경 후 |
|------|------|---------|
| 장소 목록 | locationBasedList2 결과 최대 30개 나열 | 관광공사 추천 상단 + 카테고리별 10개 기본 |
| 큐레이션 | 없음 (정렬만) | contentTypeId=25 코스 교차 매칭 |
| 기본 선택 | 없음 (모두 미체크) | 관광공사 매칭 장소 자동 체크 |
| Gemini 역할 | 장소 선택 + 순서 + 시간 배분 | 시간 배분만 (순서는 subnum 활용) |
| 버튼 | "코스 생성하기" | "AI 추천 코스로 여행하기" (펄스 애니메이션) |

---

## 데이터 플로우

```
[PlaceSelectionPage 진입]
    ↓
[병렬 fetch]
  A. locationBasedList2 (축제 좌표 기준 반경) → nearbyPlaces[]
  B. areaBasedList2 (contentTypeId=25, 지역 areaCode) → courses[]
    ↓
[코스 상세]
  courses[0] contentid → detailInfo2 → subItems[] (subcontentid, subname, subnum)
    ↓
[교차 매칭]
  subItems.subcontentid ↔ nearbyPlaces.contentid
  → matched[]: 관광공사 추천 + 축제 반경 내 확인된 장소
  → unmatched nearbyPlaces[]: 추가 선택 후보
    ↓
[UI 렌더링]
  matched → 상단 "한국관광공사 추천" 섹션 (자동 체크, subnum 순 정렬)
  unmatched → 하단 카테고리별 10개 (미체크)
```

---

## UI 구조

### 섹션 1: 축제 헤더 (현재 유지)
- 축제 이미지, 제목, 날짜, 주소
- 오렌지(#FF6B35) 배경

### 섹션 2: 한국관광공사 추천 [신규]
- 헤더: `[한국관광공사 추천]` 오렌지 뱃지 + 코스명 + 코스 타입(힐링/가족/맛)
- 장소 카드 (matched[]): 오렌지 좌측 보더 + 체크 표시 + subnum 순서
- 폴백: matched[] 길이 0 → 섹션 전체 숨김 (조용히 처리)

### 섹션 3: 추가 장소 선택
- 카테고리별 2개씩 10개 기본 노출
  - 축제(contentTypeId=15): 오렌지 테두리 강조
  - 관광지(12), 문화시설(14), 레포츠(28), 음식점(39) 각 2개
  - 폴백: 특정 카테고리 결과 0개 → 해당 슬롯을 관광지(12)로 대체
- "더 보기" 버튼: 10개씩 추가 로드
- 모두 미체크 상태

### 섹션 4: 옵션 (현재 유지)
- 이동수단 (자차/대중교통)
- 일정 (당일/1박2일/2박3일)
- 출발지

### 하단 버튼
- 텍스트: "AI 추천 코스로 여행하기"
- 스타일: 오렌지 배경 + 흰 텍스트 + `animate-pulse` (선택 시)
- 보조 텍스트: "관광공사 추천 N개 포함" (matched 수)

---

## Gemini 프롬프트 변경

현재: 후보 장소 전체 전달 → Gemini가 선택 + 순서 + 시간

변경:
- `selectedPlaces`: matched[] (subnum 순 정렬) + 사용자 추가 선택
- 프롬프트에 추가: "앞에 나열된 장소는 한국관광공사 추천 순서입니다. 이 순서를 최대한 유지하되 이동 효율이 크게 나빠지는 경우에만 조정하세요."
- Gemini 역할: 시작 시간 결정 + 체류시간 배분 + 식사 장소 삽입

---

## 에러 처리

| 상황 | 처리 |
|------|------|
| contentTypeId=25 API 실패 | 섹션 2 숨김, 기존 방식으로 폴백 |
| detailInfo2 실패 | 섹션 2 숨김 |
| matched[] 0개 | 섹션 2 숨김 |
| nearbyPlaces 0개 | "이 지역은 데이터가 부족합니다" 안내 |

---

## 구현 범위 (이번 스프린트)

- tourApi.ts: `fetchCourseDetail(contentId)` 함수 추가 (detailInfo2 contentTypeId=25)
- PlaceSelectionPage.tsx: 코스 fetch + 매칭 로직 + 섹션 2 UI
- 카테고리별 밸런싱 로직 (2개씩 10개)
- 버튼 텍스트 + 애니메이션 변경

## 구현 범위 외 (공모전 이후)

- 카카오 API 교차 검증 (운영시간 실시간)
- 대중교통 실제 경로 (Kakao Transit API 승인 필요)
- 코스 타입 선택 UI (힐링/가족/맛 사용자가 직접 선택)
