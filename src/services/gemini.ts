import axios from 'axios';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-3-flash-preview'; // Using flash for speed and cost
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

export const geminiService = {
  recommendCourse: async (festivalTitle: string, places: any[]): Promise<string> => {
    const prompt = `
      축제 이름: ${festivalTitle}
      주변 장소 목록: ${JSON.stringify(places.map(p => ({ title: p.title, type: p.contenttypeid })))}
      
      위 축제를 방문하는 여행객을 위해 최적의 여행 코스를 추천해줘.
      - 3~4개의 장소를 포함할 것.
      - 아침, 점심, 오후 일정을 나눠서 추천해줘.
      - 추천 이유를 간단히 적어줘.
      - 한국어로 답변해줘.
    `;

    try {
      const response = await axios.post(BASE_URL, {
        contents: [{
          parts: [{ text: prompt }]
        }]
      });

      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "추천 결과를 가져오지 못했습니다.";
    } catch (error) {
      console.error('Error calling Gemini:', error);
      return "AI 추천 기능에 오류가 발생했습니다.";
    }
  }
};
