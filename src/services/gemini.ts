import axios from 'axios';
import type { Place, CourseResponse } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-1.5-flash'; // Using stable flash model for speed and efficiency
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
