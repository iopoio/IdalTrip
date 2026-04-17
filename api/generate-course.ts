import type { VercelRequest, VercelResponse } from '@vercel/node';

// 2026-04 기준: gemini-2.5-flash 무료 한도 소진 → gemini-3 preview 사용
// preview 모델은 capacity 부족 시 429 발생 → 폴백 리스트로 순차 시도
const MODELS = ['gemini-3-flash-preview', 'gemini-3.1-flash-lite-preview'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }

  let lastErrorStatus = 500;
  let lastErrorBody = 'Failed to proxy Gemini request';

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data);
      }

      lastErrorStatus = response.status;
      lastErrorBody = await response.text();
      // 429/503 같은 capacity 오류는 다음 모델로 폴백
      if (response.status !== 429 && response.status !== 503) {
        return res.status(response.status).json({ error: lastErrorBody });
      }
      console.warn(`Gemini ${model} returned ${response.status}, trying next fallback`);
    } catch (error) {
      console.error(`Gemini proxy error (${model}):`, error);
      lastErrorBody = String(error);
    }
  }

  return res.status(lastErrorStatus).json({ error: lastErrorBody });
}
