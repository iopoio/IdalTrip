import axios from 'axios';
import type { Place, CourseResponse } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

interface CourseRequest {
  festivalTitle: string;
  festivalAddr: string;
  festivalLat: number;
  festivalLng: number;
  places: Place[];
  transportation: 'car' | 'public';
  duration: 'day' | '1night' | '2night';
  origin?: string;
  travelDate?: string;
}

export const geminiService = {
  generateCourse: async (req: CourseRequest): Promise<CourseResponse | null> => {
    const dayCount = req.duration === 'day' ? 1 : req.duration === '1night' ? 2 : 3;
    const transportLabel = req.transportation === 'car' ? '자차' : '대중교통';
    const dateInfo = req.travelDate
      ? `여행 날짜: ${req.travelDate} (${new Date(req.travelDate).toLocaleDateString('ko-KR', { weekday: 'long' })})`
      : '';

    const placeList = req.places.map(p => ({
      title: p.title,
      type: p.contenttypeid === '39' ? 'food' : 'attraction',
      addr: p.addr1,
      lat: parseFloat(p.mapy),
      lng: parseFloat(p.mapx),
    }));

    const prompt = `한국 여행 코스 설계 전문가로서 ${dayCount}일 여행 코스를 JSON으로 생성하세요.

## 입력
- 출발지: ${req.origin || '서울역'}
${dateInfo}
- 축제: ${req.festivalTitle} (${req.festivalAddr})
- 이동수단: ${transportLabel}
- 일정: ${dayCount === 1 ? '당일치기' : dayCount + '일'}
- 후보 장소: ${JSON.stringify(placeList)}


## 규칙
1. 축제를 반드시 포함하고 후보 장소 중 ${dayCount === 1 ? '3~4개' : dayCount === 2 ? '5~7개' : '8~10개'}를 선택
2. 맛집은 하루 1~2개 배치 (점심/저녁)
3. 시간은 "10:00 AM" 형식, 장소 간 이동시간 고려
4. ${transportLabel} 기준 현실적 동선 (가까운 곳끼리)
5. description은 15자 이내로 간결하게
6. estimated_cost는 교통비+식비+입장료 항목별 근거를 간단히 포함 (예: "교통 2만+식비 3만+입장 1만 = 약 6만원")
7. type은 "festival", "attraction", "food" 중 하나
8. lat, lng는 후보 장소에서 가져오고 없으면 0
9. 일정(${dayCount}일)에 맞게 각 장소에 "day" 값을 1부터 부여하여 골고루 분배하세요. day 값은 반드시 숫자(1, 2, 3)로만 작성하고, ${dayCount}일이면 day:1과 day:${dayCount} 항목이 반드시 하나 이상 포함되어야 합니다.
10. title은 "${dayCount === 1 ? '당일' : dayCount + '일'}" 키워드를 반드시 포함하세요. (예: 당일이면 "강릉 당일 코스", 2일이면 "강릉 2일 코스")

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
        }
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return null;

      const result = JSON.parse(text);
      return result as CourseResponse;
    } catch (error) {
      console.error('Gemini course generation failed:', error);
      return null;
    }
  }
};
