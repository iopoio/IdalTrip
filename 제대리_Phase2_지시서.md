# IdalTrip Phase 2 작업 지시서 — 제대리용

작성: 클과장 / 2026-04-15

⚠️ 작업 전 CLAUDE.md + ~/.claude/rules/역할-제대리.md + ~/.claude/rules/개발-API.md 읽을 것.

---

## 현재 상태 (클과장 확인 완료)

- 빌드: ✅ 통과 (`npm run build` 성공)
- 페이지 4개 구현됨: HomePage, FestivalDetailPage, CourseResultPage, CourseMapPage
- TourAPI: `/B551011/KorService2` 프록시 연결됨 (vercel.json)
- Gemini: 서비스 구현됨 — 단, 모델명 `gemini-2.5-flash` 미검증
- KakaoMap: REST API 직접 브라우저 호출 → CORS 문제 있음
- parkingApi.ts: 미구현 (빈 껍데기)
- .env 파일 존재 확인됨

---

## 작업 목록 (순서대로)

### Task 1 — Gemini 모델명 검증 + 수정 [검증 의무]

`src/services/gemini.ts` 현재 모델: `gemini-2.5-flash`

1. 실제 API 호출 1회 실행해서 모델명 동작 여부 확인
2. 실패 시 공식 문서 확인 후 동작하는 모델명으로 교체
3. 완료 보고 시 실제 API 응답 원문 첨부 필수. 응답 없으면 "미완료"

---

### Task 2 — KakaoMap REST API CORS 수정 [필수]

**문제**: `src/services/kakaoMap.ts`에서 카카오 REST API를 브라우저에서 직접 호출 → CORS 에러

**해결책**: vercel.json에 카카오 API 프록시 추가

현재 vercel.json:
```json
{
  "rewrites": [
    { "source": "/B551011/:path*", "destination": "https://apis.data.go.kr/B551011/:path*" }
  ]
}
```

추가할 것:
```json
{ "source": "/kakao-navi/:path*", "destination": "https://apis-navi.kakaomobility.com/:path*" },
{ "source": "/kakao-local/:path*", "destination": "https://dapi.kakao.com/:path*" }
```

그리고 `kakaoMap.ts`에서:
- `https://apis-navi.kakaomobility.com/...` → `/kakao-navi/...`
- `https://dapi.kakao.com/...` → `/kakao-local/...`
- Authorization 헤더는 서버 프록시를 타므로 클라이언트에서 그대로 전달 가능

검증: 로컬에서 `npm run dev` 실행 후 Vite proxy 설정도 같이 수정해야 로컬 테스트 가능.
`vite.config.ts`에 proxy 추가:
```ts
proxy: {
  '/B551011': { target: 'https://apis.data.go.kr', changeOrigin: true },
  '/kakao-navi': { target: 'https://apis-navi.kakaomobility.com', changeOrigin: true, rewrite: (path) => path.replace(/^\/kakao-navi/, '') },
  '/kakao-local': { target: 'https://dapi.kakao.com', changeOrigin: true, rewrite: (path) => path.replace(/^\/kakao-local/, '') }
}
```

---

### Task 3 — TourAPI 실제 호출 검증 [검증 의무]

1. 로컬에서 `npm run dev` 실행
2. 메인 페이지 로드 → 축제 목록 실제 로딩 확인
3. API 응답 원문(console 또는 Network 탭) 캡처 후 보고에 첨부
4. 빈 배열 반환 시 이유 분석 (키 없음 / 파라미터 오류 / 응답 구조 불일치)

---

### Task 4 — .env 파일 키 현황 보고 [조사]

`.env` 파일을 열어서 어떤 키가 있고 어떤 키가 비어 있는지 확인.
(키 값은 보고 불필요. 키 이름과 채워진 여부만 보고)

예시 형식:
```
VITE_TOUR_API_KEY: ✅ 있음
VITE_KAKAO_REST_KEY: ✅ 있음
VITE_GEMINI_API_KEY: ❌ 없음
VITE_KAKAO_JS_KEY: ❓ 확인 필요
```

---

### Task 5 — 타입 안전성 점검

`src/types/index.ts` 또는 types 폴더에서:
- Festival, Place, CourseResponse, ParkingLot 타입이 실제 API 응답과 일치하는지 확인
- `any` 사용 부분 발견 시 목록으로 보고 (수정은 클과장 지시 후)

---

## 완료 보고 형식

```
## Task 1 — Gemini 모델명
결과: 통과 / 실패
모델명: (실제 동작한 이름)
응답 원문: (첨부)

## Task 2 — CORS 수정
결과: 통과 / 실패
수정 파일: vercel.json, vite.config.ts, kakaoMap.ts
로컬 테스트 결과: (확인 내용)

## Task 3 — TourAPI 검증
결과: 통과 / 실패
응답 원문: (첨부)
이슈: (있으면)

## Task 4 — .env 현황
(키 목록 표)

## Task 5 — 타입 점검
any 사용 위치: (목록 또는 "없음")
```

---

## 절대 규칙

- 모델명/파라미터 추측 금지 → 실제 호출로 확인
- "완료" 보고 시 증거(응답 원문) 없으면 미완료 처리
- 같은 에러 2회 → 멈추고 클과장에게 보고
- .env 수정 금지 (deny 등급)
- 프로덕션 배포 금지
