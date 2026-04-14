# 제대리 작업 지시 — Phase 2 핵심 기능 구현

클과장 → 제대리 | 우선순위: 즉시 착수

Phase 1 리뷰 결과 전항목 pass. 잘했다. 컴포넌트 분리랑 디자인 시스템 이식 퀄리티 좋았다.

이번 Phase 2는 실제 데이터 연동 + 코스 생성이 핵심이다. 목업 데이터가 진짜 API 데이터로 바뀌는 단계.

---

## 0. Phase 1 잔여 처리 (먼저)

| # | 작업 |
|---|------|
| 0-1 | HomePage.tsx의 "Seasonal Highlight", "AI Personalized" → 한국어로 교체 |
| 0-2 | AiBubble.tsx의 "IdalTrip AI Guide" → "이달여행 AI 가이드"로 교체 |
| 0-3 | index.html favicon을 vite.svg 대신 이달여행 로고로 교체 |
| 0-4 | src/assets/vite.svg 삭제 |

---

## 2A. 데이터 레이어

### 2A-1. TourAPI 축제 — 보완
현재 `tourApi.fetchFestivals()`는 동작하지만, 축제 상세 페이지에서 개별 축제 조회가 없다.

추가할 것:
```typescript
// tourApi.ts에 추가
fetchFestivalDetail: async (contentId: string): Promise<Festival | null> => {
  // detailCommon2 엔드포인트 사용
  // GET /KorService2/detailCommon2
  // params: contentId, defaultYN=Y, overviewYN=Y, ...
}
```

### 2A-2. TourAPI 관광지/맛집 — 위치 기반 조회
현재 `fetchPlaces()`는 areaCode 기반인데, 축제 좌표 기반 반경 검색이 필요하다.

추가할 것:
```typescript
// tourApi.ts에 추가
fetchNearbyPlaces: async (mapx: string, mapy: string, radius: number = 10000, contentTypeId?: string): Promise<Place[]> => {
  // locationBasedList2 엔드포인트 사용
  // GET /KorService2/locationBasedList2
  // params: mapX, mapY, radius, contentTypeId
  // contentTypeId: '12'=관광지, '39'=음식점
}
```

축제 좌표(mapx, mapy)를 받아서 반경 10km 내 관광지와 맛집을 각각 조회.

### 2A-3. 공영주차장 API
`.env`에 공영주차장 API 키가 아직 없다. 일단 서비스 껍데기만 만들어두고, 키 없으면 빈 배열 반환하도록.

```typescript
// src/services/parkingApi.ts (신규)
fetchNearbyParking: async (lat: number, lng: number): Promise<ParkingLot[]>
```

타입 추가:
```typescript
// types/index.ts에 추가
export interface ParkingLot {
  name: string;
  addr: string;
  lat: number;
  lng: number;
  capacity: number;
  feeInfo: string;
}
```

### 2A-4, 2A-5. 카카오 경로 API
현재 `kakaoMap.ts`의 `getRoute()`가 하드코딩 목업이다. 실제 API로 교체.

```typescript
// kakaoMap.ts 교체
// 자차: https://apis-navi.kakaomobility.com/v1/directions
// 대중교통: https://apis-navi.kakaomobility.com/v1/directions (priority=RECOMMEND)
// 헤더: Authorization: KakaoAK {VITE_KAKAO_REST_KEY}

getCarRoute: async (origin, destination) => {
  // 자차 경로 — distance(m), duration(초) 반환
}

getPublicRoute: async (origin, destination) => {
  // 대중교통 경로 — distance, duration 반환
  // 카카오 대중교통 API 또는 자차와 동일 엔드포인트에 priority 파라미터
}
```

### 2A-6 (클과장 담당 — 여기서 가이드만 줌)
API 에러 핸들링은 내가 나중에 통일할 거니까, 지금은 각 서비스에서 try-catch + console.error + 빈값 반환 패턴 유지하면 된다.

---

## 2B. 코스 생성 엔진

### 2B-2. Gemini 프롬프트 (클과장 설계 — 이대로 적용할 것)

현재 `gemini.ts`의 `recommendCourse()`를 아래로 교체:

```typescript
// src/services/gemini.ts — 전체 교체

import axios from 'axios';
import type { Place, CourseItem } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-3-flash-preview';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

interface CourseRequest {
  festivalTitle: string;
  festivalAddr: string;
  festivalLat: number;
  festivalLng: number;
  places: Place[];
  transportation: 'car' | 'public';
  duration: 'day' | '1night' | '2night';
}

interface CourseResponse {
  title: string;
  summary: string;
  days: {
    day: number;
    items: CourseItem[];
  }[];
}

export const geminiService = {
  generateCourse: async (req: CourseRequest): Promise<CourseResponse | null> => {
    const dayCount = req.duration === 'day' ? 1 : req.duration === '1night' ? 2 : 3;
    const transportLabel = req.transportation === 'car' ? '자차' : '대중교통';

    const placeList = req.places.map(p => ({
      title: p.title,
      type: p.contenttypeid === '39' ? '맛집' : '관광지',
      addr: p.addr1,
      lat: parseFloat(p.mapy),
      lng: parseFloat(p.mapx),
    }));

    const prompt = `당신은 한국 여행 코스 설계 전문가입니다.

아래 정보를 바탕으로 ${dayCount}일 여행 코스를 JSON으로 생성하세요.

## 입력 정보
- 축제: ${req.festivalTitle} (${req.festivalAddr})
- 축제 좌표: ${req.festivalLat}, ${req.festivalLng}
- 이동수단: ${transportLabel}
- 일정: ${dayCount}일 (${req.duration === 'day' ? '당일치기' : req.duration === '1night' ? '1박2일' : '2박3일'})
- 선택된 장소 목록:
${JSON.stringify(placeList, null, 2)}

## 코스 설계 규칙
1. 축제를 반드시 포함하고, 나머지 장소 중 ${dayCount === 1 ? '3~5개' : dayCount === 2 ? '6~8개' : '9~12개'}를 선택
2. 맛집은 하루에 1~2개 배치 (점심, 저녁)
3. 시간은 "09:00" 형식, 장소 간 이동시간 고려
4. ${transportLabel} 기준 현실적 동선 (가까운 곳끼리 묶기)
5. category는 "festival", "attraction", "food" 중 하나
6. 각 장소에 20자 이내 한줄 메모 작성

## 응답 형식 (JSON만, 다른 텍스트 없이)
{
  "title": "코스 제목 (15자 이내)",
  "summary": "이 코스를 추천하는 이유 (50자 이내)",
  "days": [
    {
      "day": 1,
      "items": [
        {
          "time": "09:00",
          "placeName": "장소명",
          "category": "attraction",
          "duration": "1시간 30분",
          "memo": "한줄 설명",
          "lat": 37.1234,
          "lng": 127.5678
        }
      ]
    }
  ]
}`;

    try {
      const response = await axios.post(BASE_URL, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        }
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return null;

      return JSON.parse(text) as CourseResponse;
    } catch (error) {
      console.error('Gemini course generation failed:', error);
      return null;
    }
  }
};
```

### 2B-1. 축제 → 주변 장소 자동 조회 플로우

FestivalDetailPage에서 축제 선택 시:
1. `tourApi.fetchNearbyPlaces(mapx, mapy, 10000, '12')` → 관광지 목록
2. `tourApi.fetchNearbyPlaces(mapx, mapy, 10000, '39')` → 맛집 목록
3. 합쳐서 SpotCard 리스트로 표시
4. 사용자가 체크/해제

### 2B-3. Gemini 응답 파싱

`geminiService.generateCourse()`가 이미 `CourseResponse`로 파싱하도록 설계했다.
`responseMimeType: 'application/json'`으로 JSON 응답을 강제하니, 별도 파싱 로직 불필요.

다만 타입 안전을 위해 types/index.ts에 추가:
```typescript
export interface CourseResponse {
  title: string;
  summary: string;
  days: {
    day: number;
    items: CourseItem[];
  }[];
}
```

### 2B-4. 이동시간 계산

코스 생성 후, 각 장소 간 `kakaoMapService.getCarRoute()` 또는 `getPublicRoute()`로 실제 이동시간 조회.
Gemini가 추정한 시간을 카카오 실측값으로 교체하는 후처리 단계.

### 2B-5. 자차 주차장 매칭

코스 내 각 관광지에 대해 `parkingApi.fetchNearbyParking(lat, lng)` 호출.
CourseItem에 `parkingInfo?: ParkingLot` 필드 추가.

### 2B-6. 당일/1박2일/2박3일

이미 Gemini 프롬프트에서 `duration` 파라미터로 분기 처리됨.
FestivalDetailPage의 옵션 선택 UI → `CourseRequest.duration`으로 전달.

---

## 2C. 프론트 연동

Phase 1에서 페이지 껍데기는 다 만들었으니, 이제 실데이터 연결.

### 2C-1~2. 라우팅/월별 탭 — Phase 1에서 완료됨. Skip.

### 2C-3. 축제 상세 페이지 — 실데이터 연동
- URL 파라미터 `contentId`로 `tourApi.fetchFestivalDetail()` 호출
- 축제 좌표로 `fetchNearbyPlaces()` 호출 → SpotCard에 실데이터 표시
- 옵션 선택 (출발지/교통/일정) state 관리
- "AI 코스 생성하기" 클릭 → `geminiService.generateCourse()` 호출 → CourseResultPage로 navigate

### 2C-4~5. 코스 결과 페이지 — 실데이터 연동
- Gemini 응답의 `days[]` → Day 탭 전환
- `items[]` → TimelineItem 컴포넌트에 매핑
- 자차/대중교통 탭: 같은 코스에 대해 교통수단만 바꿔서 이동시간 재계산
- CourseSummary에 총 시간/장소 수 표시
- AiBubble에 `summary` 표시

### 2C-6~7. 카카오맵 연동
- CourseMapPage에 카카오맵 SDK 초기화 (index.html에 SDK 스크립트 추가 필요)
- 마커 + 폴리라인 렌더링
- 각 장소 "카카오맵 네비" 버튼 → `kakaoMapService.getDirectionUrl()` 연결

### 2C-8. 날짜 포맷
- `20260520` → `2026.05.20` 변환 유틸 함수 작성 (`src/lib/utils.ts`에 추가)
- FestivalCard, FestivalDetailPage에서 적용

---

## pass/fail 기준

1. `npm run build` 에러 0건 → pass
2. 메인에서 축제 카드 클릭 → 상세 페이지에 실제 TourAPI 데이터(관광지/맛집) 표시 → pass
3. "AI 코스 생성하기" 클릭 → Gemini 호출 → 코스 결과 페이지에 타임라인 표시 → pass
4. 자차/대중교통 탭 전환 시 이동시간 변경 → pass
5. 각 장소 "카카오맵으로 보기" 클릭 → 카카오맵 네비 URL로 이동 → pass
6. 날짜 포맷이 `2026.05.20` 형식으로 표시 → pass

---

## 전달 사항

- Gemini 프롬프트(2B-2)는 내가 설계했으니 그대로 적용. 수정 필요하면 먼저 물어볼 것.
- 카카오맵 SDK 스크립트는 index.html `<head>`에 `<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=${VITE_KAKAO_JS_KEY}"></script>` 추가. 단, Vite 환경변수는 HTML에서 직접 못 쓰니 빌드타임 치환 또는 하드코딩 대신 동적 로드 방식 사용할 것.
- 작업량이 많다. 2A(데이터) → 2B(엔진) → 2C(연동) 순서로 하나씩 붙여나가고, 중간중간 빌드 깨지지 않는지 확인하면서 진행.
- 완료 후 `npm run build` 통과 + 실제 동작 스크린샷 첨부해서 보고.

수고해라, Phase 2가 이 프로젝트의 핵심이다.

— 클과장
