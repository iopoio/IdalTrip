import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const TOUR_API_KEY = process.env.VITE_TOUR_API_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!TOUR_API_KEY || !GEMINI_API_KEY) {
  console.error("Missing API keys in .env");
  process.exit(1);
}

const TOUR_BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';
const GEMINI_MODELS = ['gemini-3-flash-preview', 'gemini-3.1-flash-lite'];

const DAY_OF_WEEK: Record<number, string> = {
  0: '일요일', 1: '월요일', 2: '화요일', 3: '수요일',
  4: '목요일', 5: '금요일', 6: '토요일',
};

const SEED_FILE = path.resolve(process.cwd(), 'scratch/course_seed_50.json');
const RAW_FILE = path.resolve(process.cwd(), 'scratch/course_responses_raw.jsonl');
const REPORT_FILE = path.resolve(process.cwd(), 'scratch/course_stability_report_2026-04-30.md');

// Utils for TourAPI
async function fetchTour(endpoint: string, params: any) {
  try {
    console.log(`[TourAPI] Fetching ${endpoint} with areaCode ${params.areaCode}...`);
    const res = await axios.get(`${TOUR_BASE_URL}/${endpoint}`, {
      params: {
        serviceKey: TOUR_API_KEY,
        _type: 'json',
        MobileOS: 'ETC',
        MobileApp: '이달여행',
        ...params
      },
      timeout: 10000
    });
    const items = res.data?.response?.body?.items?.item;
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  } catch (e: any) {
    console.error(`[TourAPI] error on ${endpoint}:`, e.message);
    return [];
  }
}

async function getFestival(areaCode: number) {
  let items = await fetchTour('searchFestival2', {
    arrange: 'C',
    eventStartDate: '20260401', // earlier date to get more results
    areaCode,
    numOfRows: 5,
    pageNo: 1
  });
  if (items.length === 0) {
    items = await fetchTour('searchFestival2', {
      arrange: 'C',
      eventStartDate: '20240101',
      areaCode,
      numOfRows: 5,
      pageNo: 1
    });
  }
  return items.length > 0 ? items[0] : null;
}

async function getPlaces(areaCode: number) {
  const items = await fetchTour('areaBasedList2', {
    arrange: 'C',
    contentTypeId: '12', // 관광지
    areaCode,
    numOfRows: 15,
    pageNo: 1
  });
  return items;
}

// 1. 시드 생성
async function generateSeeds() {
  if (fs.existsSync(SEED_FILE)) {
    console.log("Seed file already exists. Loading...");
    return JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
  }

  console.log("Generating seeds...");
  const areas = [1, 6, 32, 39, 31];
  const origins = ['서울역', '부산역', '청량리', '동대구', '광주송정'];
  const durations = ['day', '1night', '2night'];
  const transports = ['car', 'public'];

  const seeds = [];

  for (let i = 0; i < 50; i++) {
    const areaCode = areas[Math.floor(i / 10)]; // 10 each
    const transport = i < 25 ? transports[0] : transports[1];
    
    // Balance duration
    let duration;
    if (i < 17) duration = durations[0];
    else if (i < 34) duration = durations[1];
    else duration = durations[2];

    const origin = origins[i % origins.length];
    const partySize = Math.floor(Math.random() * 4) + 2; // 2~5

    // Fetch data
    let festival = await getFestival(areaCode);
    if (!festival) {
      console.log(`No festival for area ${areaCode}, falling back to area 1`);
      festival = await getFestival(1);
    }
    if (!festival) {
      console.log(`Still no festival for area 1, falling back to any available`);
      festival = await getFestival(32); // Try Gangwon
    }
    
    const festivalData = festival ? {
      title: festival.title,
      addr: festival.addr1 || '',
      lat: parseFloat(festival.mapy),
      lng: parseFloat(festival.mapx)
    } : {
      title: '서울세계불꽃축제 (대체)',
      addr: '여의도 한강공원',
      lat: 37.527,
      lng: 126.932
    };
    const places = await getPlaces(areaCode);

    seeds.push({
      id: i + 1,
      areaCode,
      transportation: transport,
      duration,
      origin,
      partySize,
      festival: festivalData,
      places: places.map((p: any) => ({
        title: p.title,
        addr: p.addr1,
        lat: parseFloat(p.mapy),
        lng: parseFloat(p.mapx),
        contenttypeid: p.contenttypeid,
        contentid: p.contentid
      }))
    });
  }

  fs.writeFileSync(SEED_FILE, JSON.stringify(seeds, null, 2));
  console.log("Seed generation complete.");
  return seeds;
}

// 2. Gemini 호출
async function callGemini(seed: any) {
  const dayCount = seed.duration === 'day' ? 1 : seed.duration === '1night' ? 2 : 3;
  const transportLabel = seed.transportation === 'car' ? '자차' : '대중교통';
  const travelDate = '2026-05-15';
  const dow = DAY_OF_WEEK[new Date(travelDate).getDay()];
  const availableMinutes = dayCount * 480;

  const placeList = seed.places.map((p: any) => {
    let type = 'attraction';
    if (p.contenttypeid === '39') type = 'food';
    else if (p.contenttypeid === '14') type = 'culture';
    else if (p.contenttypeid === '28') type = 'leisure';
    else if (p.contenttypeid === '32') type = 'stay';

    return {
      title: p.title,
      type,
      addr: p.addr,
      lat: p.lat,
      lng: p.lng
    };
  });

  const prompt = `한국 여행 코스 설계 전문가로서 ${dayCount}일 여행 코스를 JSON으로 생성하세요.

## 입력
- 출발지: ${seed.origin}
- 여행 날짜: ${travelDate}(${dow})
- 총 관광 가능 시간: ${availableMinutes}분 (출발지→목적지 이동 후 실제 관광 가능 시간)
- 축제: ${seed.festival.title} (${seed.festival.addr})
- 축제 좌표: 위도 ${seed.festival.lat}, 경도 ${seed.festival.lng}
- 이동수단: ${transportLabel}
- 이동 속도 기준: ${seed.transportation === 'car' ? '자차 평균 60km/h (고속도로 제외 시 40km/h)' : '대중교통 평균 30km/h (환승 대기 포함)'}
- 일정: ${dayCount === 1 ? '당일치기' : dayCount + '일'}
- 후보 장소: ${JSON.stringify(placeList)}

## 규칙
1. 여행 날짜가 ${travelDate}(${dow})이므로 이 날 휴무인 장소는 반드시 제외하세요 (restdate 확인)
2. 총 관광 가능 시간은 ${availableMinutes}분입니다. stay_duration 합계 + move_time 합계가 이 시간을 초과하지 않도록 장소 수를 조정하세요
3. 축제를 반드시 첫 번째 또는 오전에 배치하고, 나머지 장소는 축제 좌표(위도 ${seed.festival.lat}, 경도 ${seed.festival.lng})에서 가까운 순으로 선택하세요. 먼 거리 이동은 최소화하세요
4. 후보 장소 중 ${dayCount === 1 ? '3~4개' : dayCount === 2 ? '5~7개' : '8~10개'}를 선택 (축제 포함)
5. 맛집은 하루 1~2개 배치 (점심/저녁)
6. 시간은 "10:00 AM" 형식. 이동 속도 기준을 반드시 적용해 move_time과 distance를 현실적으로 계산하세요
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

  let lastError = '';
  let isApiError = false;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        lastError = 'EMPTY_RESPONSE';
        break;
      }
      return { success: true, text, error: null };
    } catch (error: any) {
      isApiError = true;
      lastError = error.response ? `${error.response.status} ${JSON.stringify(error.response.data)}` : error.message;
      if (error.response && error.response.status === 429) {
        console.log(`Model ${model} rate limited, falling back...`);
        continue;
      }
      break;
    }
  }

  return { success: false, text: null, error: lastError, isApiError };
}

// 3. 검증
function validateResponse(text: string, seed: any) {
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    return { valid: false, label: 'TYPE_C', reason: 'JSON Parse Error' };
  }

  if (!json.schedule || !Array.isArray(json.schedule) || json.schedule.length === 0) {
    return { valid: false, label: 'TYPE_D', reason: 'Empty schedule array' };
  }

  if (!json.total_duration || !json.estimated_cost) {
    return { valid: false, label: 'TYPE_D', reason: 'Missing total_duration or estimated_cost' };
  }

  const dayCount = seed.duration === 'day' ? 1 : seed.duration === '1night' ? 2 : 3;
  const title = json.title || '';
  const expectedKeyword = dayCount === 1 ? '당일' : `${dayCount}일`;
  if (!title.includes(expectedKeyword)) {
    return { valid: false, label: 'TYPE_E', reason: `Title missing keyword: ${expectedKeyword}` };
  }

  const daysInSchedule = new Set(json.schedule.map((s: any) => s.day));
  for (let i = 1; i <= dayCount; i++) {
    if (!daysInSchedule.has(i)) {
      return { valid: false, label: 'TYPE_E', reason: `Missing day ${i} in schedule` };
    }
  }

  for (const item of json.schedule) {
    if (!item.lat || !item.lng || !item.time || !item.place_name || !item.stay_duration) {
      return { valid: false, label: 'TYPE_D', reason: `Missing required fields in schedule item: ${item.place_name}` };
    }
  }

  return { valid: true, label: null, reason: null };
}

async function run() {
  const seeds = await generateSeeds();
  
  // Reset raw responses file
  fs.writeFileSync(RAW_FILE, '');
  
  const results = [];
  let successCount = 0;
  const failureTypes: Record<string, number> = { TYPE_A: 0, TYPE_B: 0, TYPE_C: 0, TYPE_D: 0, TYPE_E: 0 };
  
  console.log("Starting API calls...");
  let startTime = new Date();

  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i];
    console.log(`Processing ${i+1}/50 (Area: ${seed.areaCode}, Duration: ${seed.duration})...`);
    
    let res = await callGemini(seed);
    
    // Retry once on failure
    if (!res.success || !res.text) {
       console.log("Retrying...");
       await new Promise(resolve => setTimeout(resolve, 2000));
       res = await callGemini(seed);
    }
    
    // Write raw response
    fs.appendFileSync(RAW_FILE, JSON.stringify({ id: seed.id, response: res.text, error: res.error }) + '\n');
    
    let validation = { valid: false, label: 'TYPE_A', reason: res.error || 'Unknown Error' };
    
    if (res.success && res.text) {
      validation = validateResponse(res.text, seed);
    } else if (res.error === 'EMPTY_RESPONSE') {
      validation = { valid: false, label: 'TYPE_B', reason: 'Empty Response' };
    }

    if (validation.valid) {
      successCount++;
    } else {
      if (validation.label) {
        failureTypes[validation.label] = (failureTypes[validation.label] || 0) + 1;
      }
    }

    results.push({
      id: seed.id,
      dimensions: `Area:${seed.areaCode}, ${seed.transportation}, ${seed.duration}`,
      valid: validation.valid,
      label: validation.label,
      reason: validation.reason,
      text: res.text
    });
    
    // Rate limit delay
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  let endTime = new Date();
  
  // Write Report
  let md = `# 코스 생성 50건 안정화 검증 리포트
생성일: 2026-04-30

## 1. 개요
- **샘플 수**: 50건
- **성공률**: ${successCount}/50 (${((successCount/50)*100).toFixed(1)}%)
- **호출 시간**: ${startTime.toLocaleTimeString()} ~ ${endTime.toLocaleTimeString()}

## 2. 실패 통계
`;
  Object.entries(failureTypes).forEach(([k, v]) => {
    md += `- ${k}: ${v}건\n`;
  });
  
  md += `\n## 3. 실패 케이스 상세\n\n`;
  md += `| 인덱스 | 차원 | 라벨 | 사유 | 원문 발췌 |\n|---|---|---|---|---|\n`;
  
  results.filter(r => !r.valid).forEach(r => {
    const textSnippet = r.text ? r.text.substring(0, 50).replace(/\n/g, ' ') + '...' : String(r.reason).substring(0, 50);
    md += `| ${r.id} | ${r.dimensions} | ${r.label} | ${r.reason} | ${textSnippet} |\n`;
  });
  
  fs.writeFileSync(REPORT_FILE, md);
  console.log(`Done! Success: ${successCount}/50. Report saved to ${REPORT_FILE}`);
}

run().catch(console.error);
