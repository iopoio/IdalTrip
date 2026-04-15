# 카카오 로컬 API Fallback 지시서 — 제대리용

작성: 클과장 / 2026-04-15  
⚠️ 작업 전 CLAUDE.md + 역할-제대리.md 읽을 것.

---

## 배경

TourAPI 관광지/맛집 결과가 부족한 경우 카카오 로컬 API로 보완.  
`/kakao-local` proxy 이미 설정됨. `REST_API_KEY` 이미 있음.  
카카오 카테고리: AT4(관광명소), FD6(음식점)  
기획서 어필 포인트: "TourAPI + 카카오 로컬 API 이중 데이터 소스"

---

## Fix 1 — `src/services/kakaoMap.ts`에 함수 추가

기존 `kakaoMapService` 객체 안에 `searchLocal` 함수 추가:

```typescript
/**
 * 카카오 키워드 검색 — 지역 관광지/맛집 fallback용
 */
searchLocal: async (query: string, categoryCode: 'AT4' | 'FD6', size = 8) => {
  try {
    const response = await axios.get('/kakao-local/v2/local/search/keyword.json', {
      params: {
        query,
        category_group_code: categoryCode,
        size,
      },
      headers: { Authorization: `KakaoAK ${REST_API_KEY}` }
    });
    return response.data.documents as Array<{
      id: string;
      place_name: string;
      address_name: string;
      road_address_name: string;
      category_name: string;
      x: string; // 경도(lng)
      y: string; // 위도(lat)
      place_url: string;
    }>;
  } catch (error) {
    console.error('카카오 로컬 검색 실패:', error);
    return [];
  }
}
```

---

## Fix 2 — `src/pages/ExploreResultPage.tsx` Fallback 로직 추가

### import 추가

```typescript
import { kakaoMapService } from '../services/kakaoMap';
```

### load() 함수 내 Fallback 적용

기존 코드에서 `attractionSpots`, `foodSpots` 계산 후, `allSpots` 합치기 전에 아래 로직 삽입:

```typescript
// 카카오 fallback — 관광지 3개 미만이면 보완
let finalAttractionSpots = attractionSpots;
if (attractionSpots.length < 3) {
  const kakaoResults = await kakaoMapService.searchLocal(`${region} 관광명소`, 'AT4', 8);
  const kakaoSpots: SpotWithStatus[] = kakaoResults
    .filter(doc => !attractionSpots.some(a => a.title === doc.place_name)) // 중복 제거
    .slice(0, 8 - attractionSpots.length)
    .map(doc => ({
      contentid: `kakao_${doc.id}`,
      title: doc.place_name,
      addr1: doc.road_address_name || doc.address_name,
      mapx: doc.x,
      mapy: doc.y,
      firstimage: '',
      contenttypeid: '12',
      isOpen: true,
      openTime: undefined,
      restDate: undefined,
      firstMenu: undefined,
    }));
  finalAttractionSpots = [...attractionSpots, ...kakaoSpots];
}

// 카카오 fallback — 맛집 3개 미만이면 보완
let finalFoodSpots = foodSpots;
if (foodSpots.length < 3) {
  const kakaoResults = await kakaoMapService.searchLocal(`${region} 맛집`, 'FD6', 8);
  const kakaoSpots: SpotWithStatus[] = kakaoResults
    .filter(doc => !foodSpots.some(f => f.title === doc.place_name)) // 중복 제거
    .slice(0, 8 - foodSpots.length)
    .map(doc => ({
      contentid: `kakao_${doc.id}`,
      title: doc.place_name,
      addr1: doc.road_address_name || doc.address_name,
      mapx: doc.x,
      mapy: doc.y,
      firstimage: '',
      contenttypeid: '39',
      isOpen: true,
      openTime: undefined,
      restDate: undefined,
      firstMenu: doc.category_name.split('>').pop()?.trim() || undefined,
    }));
  finalFoodSpots = [...foodSpots, ...kakaoSpots];
}

const allSpots = [...festivalSpots, ...finalAttractionSpots, ...finalFoodSpots];
```

기존 코드에서 `const allSpots = [...festivalSpots, ...attractionSpots, ...foodSpots];` 줄을 위 블록으로 교체. `attractionSpots`, `foodSpots` 선언은 그대로 유지.

---

## 타입 확인

`SpotWithStatus` 타입에 `openTime`, `restDate`, `firstMenu` 필드가 optional로 있는지 확인.  
없으면 `src/types/index.ts`에 추가:

```typescript
export interface SpotWithStatus extends Place {
  contenttypeid: string;
  isOpen?: boolean;
  openTime?: string;
  restDate?: string;
  firstMenu?: string;
}
```

---

## 검증 기준 (보고 전 필수 체크)

```
Fix 1: kakaoMapService.searchLocal 함수 추가됨: ✅/❌
Fix 2: TourAPI 관광지 3개 미만 시 카카오 결과 보완됨: ✅/❌
Fix 2: TourAPI 맛집 3개 미만 시 카카오 결과 보완됨: ✅/❌
Fix 2: 중복 장소 제거 로직 작동: ✅/❌
Fix 2: 카카오 결과 카드 정상 렌더링 (이미지 없는 경우 placeholder): ✅/❌
npm run build 통과: ✅/❌
```

---

## 절대 규칙

- .env 수정 금지
- 기존 TourAPI 로직 제거 금지 (fallback이지 대체가 아님)
- kakaoMapService의 기존 함수 수정 금지
- 빌드 통과 확인 후 보고
- 검증 기준 ✅/❌ 빠짐없이 보고할 것
