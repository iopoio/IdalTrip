import axios from 'axios';
import type { Place, PlaceDetail, CourseResponse, PlaceType } from '../types';

// Gemini 호출은 서버사이드 Edge Function을 통해 처리 (API 키 클라이언트 노출 방지)
const BASE_URL = '/api/generate-course';

interface CourseRequest {
  festivalTitle: string;
  festivalAddr: string;
  festivalLat: number;
  festivalLng: number;
  places: Place[];
  transportation: 'car' | 'public';
  duration: 'day' | '1night' | '2night';
  origin?: string;
  travelDate?: string;          // YYYY-MM-DD
  availableMinutes?: number;    // 출발지→목적지 이동 후 실제 관광 가능 분
  placeDetails?: Record<string, PlaceDetail>; // contentid → detail
}

const DAY_OF_WEEK: Record<number, string> = {
  0: '일요일', 1: '월요일', 2: '화요일', 3: '수요일',
  4: '목요일', 5: '금요일', 6: '토요일',
};

export const geminiService = {
  generateCourse: async (req: CourseRequest): Promise<CourseResponse | null> => {
    const dayCount = req.duration === 'day' ? 1 : req.duration === '1night' ? 2 : 3;
    const transportLabel = req.transportation === 'car' ? '자차' : '대중교통';
    const travelDate = req.travelDate ?? new Date().toISOString().slice(0, 10);
    const dow = DAY_OF_WEEK[new Date(travelDate).getDay()];
    const availableMinutes = req.availableMinutes ?? dayCount * 480;

    const placeList = req.places.map(p => {
      const detail = req.placeDetails?.[p.contentid];
      const typeId = p.contenttypeid;
      let type: PlaceType = 'attraction';
      if (typeId === '39') type = 'food';
      else if (typeId === '14') type = 'culture';
      else if (typeId === '28') type = 'leisure';
      else if (typeId === '32') type = 'stay';

      return {
        title: p.title,
        type,
        addr: p.addr1,
        lat: parseFloat(p.mapy),
        lng: parseFloat(p.mapx),
        ...(detail?.opentime ? { opentime: detail.opentime } : {}),
        ...(detail?.restdate ? { restdate: detail.restdate } : {}),
        ...(detail?.usetime ? { usetime: detail.usetime } : {}),
      };
    });

    const prompt = `한국 여행 코스 설계 전문가로서 ${dayCount}일 여행 코스를 JSON으로 생성하세요.

## 입력
- 출발지: ${req.origin || '서울역'}
- 여행 날짜: ${travelDate}(${dow})
- 총 관광 가능 시간: ${availableMinutes}분
- 축제: ${req.festivalTitle} (${req.festivalAddr})
- 이동수단: ${transportLabel}
- 일정: ${dayCount === 1 ? '당일치기' : dayCount + '일'}
- 후보 장소: ${JSON.stringify(placeList)}

## 규칙
1. 여행 날짜가 ${travelDate}(${dow})이므로 이 날 휴무인 장소는 반드시 제외하세요 (restdate 확인)
2. 총 관광 가능 시간은 ${availableMinutes}분입니다. 이 시간 안에 소요시간 합계가 들어오도록 장소 수를 조정하세요
3. 축제를 반드시 포함하고 후보 장소 중 ${dayCount === 1 ? '3~4개' : dayCount === 2 ? '5~7개' : '8~10개'}를 선택
4. 맛집은 하루 1~2개 배치 (점심/저녁)
5. 시간은 "10:00 AM" 형식, 장소 간 이동시간 고려
6. ${transportLabel} 기준 현실적 동선 (가까운 곳끼리)
7. description은 15자 이내로 간결하게
8. estimated_cost는 교통비+식비+입장료 항목별 근거를 간단히 포함 (예: "교통 2만+식비 3만+입장 1만 = 약 6만원")
9. 축제는 type:"festival"로, 문화시설은 type:"culture"로, 레포츠는 type:"leisure"로 표시
10. lat, lng는 후보 장소에서 가져오고 없으면 0
11. 일정(${dayCount}일)에 맞게 각 장소에 "day" 값을 1부터 부여하여 골고루 분배하세요. day 값은 반드시 숫자(1, 2, 3)로만 작성하고, ${dayCount}일이면 day:1과 day:${dayCount} 항목이 반드시 하나 이상 포함되어야 합니다.
12. title은 "${dayCount === 1 ? '당일' : dayCount + '일'}" 키워드를 반드시 포함하세요.

## JSON 형식 (JSON만 출력)
{
  "title": "코스명 (10자 이내)",
  "theme": "테마 (5자 이내, 예: 미식탐방)",
  "summary": "추천 이유 한줄 (30자 이내)",
  "total_duration": "약 6시간",
  "estimated_cost": "교통 2만+식비 3만+입장 1만 = 약 6만원",
  "schedule": [
    {
      "day": 1,
      "time": "10:00 AM",
      "place_name": "장소명",
      "type": "attraction",
      "stay_duration": "1시간",
      "description": "15자 이내 설명",
      "move_time": "15분",
      "distance": "3km",
      "lat": 35.23,
      "lng": 128.87
    }
  ]
}`;

    try {
      const response = await axios.post(BASE_URL, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
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
