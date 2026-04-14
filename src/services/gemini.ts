import axios from 'axios';
import type { Place, CourseResponse } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.0-flash';
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

export const geminiService = {
  generateCourse: async (req: CourseRequest): Promise<CourseResponse | null> => {
    const dayCount = req.duration === 'day' ? 1 : req.duration === '1night' ? 2 : 3;
    const transportLabel = req.transportation === 'car' ? '자차' : '대중교통';

    const placeList = req.places.map(p => ({
      title: p.title,
      type: p.contenttypeid === '39' ? 'food' : 'attraction',
      addr: p.addr1,
      lat: parseFloat(p.mapy),
      lng: parseFloat(p.mapx),
    }));

    const prompt = `당신은 한국 프리미엄 여행 코스 전문가입니다. 
아래 정보를 바탕으로 아주 상세한 ${dayCount}일 여행 코스를 JSON으로 생성하세요.

## 입력 정보
- 메인 축제: ${req.festivalTitle} (${req.festivalAddr})
- 이동수단: ${transportLabel}
- 일정: ${dayCount}일
- 방문 후보 장소: ${JSON.stringify(placeList)}

## 설계 필수 규칙
1. 코스 테마(theme)는 시안처럼 "미식 위주", "풍경 중심" 등으로 제시
2. 총 소요 시간, 예상 비용(예: 24만원)을 포함
3. schedule 내 장소들은 시간 순서대로 정렬
4. 각 장소 사이의 move_time(이동 시간)과 distance(거리)를 ${transportLabel} 기준으로 현실적으로 추정
5. image_url은 Unsplash의 키워드 검색 URL 사용 (예: https://source.unsplash.com/800x600/?restaurant,nature,view 등 테마에 맞게)
6. type은 "festival", "attraction", "food", "coffee" 중 하나로 매칭

## 응답 JSON 형식
{
  "title": "코스명",
  "theme": "코스 테마 설명",
  "summary": "AI 추천 요약 (에디토리얼 스타일)",
  "total_duration": "총 소요 시간",
  "estimated_cost": "예상 비용(문자열)",
  "schedule": [
    {
      "time": "12:30 PM",
      "place_name": "장소명",
      "type": "food",
      "stay_duration": "1시간 30분",
      "description": "감성적인 장소 설명 (40자 내외)",
      "move_time": "15분",
      "distance": "4.2km",
      "image_url": "https://images.unsplash.com/photo-...?auto=format&fit=crop&q=80&w=800",
      "lat": 0,
      "lng": 0
    }
  ]
}

주의: JSON만 출력하고 다른 텍스트는 포함하지 마세요.`;

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
