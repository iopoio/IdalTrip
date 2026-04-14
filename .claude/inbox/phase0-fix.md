# 제대리 작업 지시 — Phase 0 잔여 정리

클과장 → 제대리 | 우선순위: 즉시

ROADMAP.md Phase 0 항목. 아래 전부 끝내고 `npm run build` 통과 확인 후 보고할 것.

---

## 1. TS 빌드 에러 수정 (4건)

현재 `npx tsc -b --noEmit` 결과:

```
src/App.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
src/App.tsx(7,10): error TS1484: 'Festival' is a type and must be imported using a type-only import
src/services/tourApi.ts(2,10): error TS1484: 'Festival' is a type and must be imported using a type-only import
src/services/tourApi.ts(2,20): error TS1484: 'Place' is a type and must be imported using a type-only import
```

수정 방법:
- App.tsx 1행: `import React` 삭제
- App.tsx 7행: `import { Festival }` → `import type { Festival }`
- tourApi.ts 2행: `import { Festival, Place }` → `import type { Festival, Place }`

## 2. 엔드포인트 통일

src/services/tourApi.ts 4행:
```
const BASE_URL = 'https://apis.data.go.kr/B551011/KorService1';
```
→ 실제 테스트에서 KorService2로 성공했으니 아래로 변경:
```
const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';
```

그리고 15행 `searchFestival1` → `searchFestival2`, 41행 `areaBasedList1` → `areaBasedList2`로 변경.

## 3. Gemini 모델명 통일

src/services/gemini.ts 4행:
```
const MODEL = 'gemini-1.5-flash';
```
→ scratch/test_gemini.ts에서 `gemini-3-flash-preview`로 성공했으니 그걸로 통일:
```
const MODEL = 'gemini-3-flash-preview';
```

## 4. 보안 처리

(1) .gitignore 맨 아래에 추가:
```
.env
```

(2) scratch/test_gemini.ts 3행 하드코딩된 API 키 제거:
```
const API_KEY = 'AIzaSyAo38AODdjbxwG1xWadImb1m-AwoLWUPqU';
```
→ 변경:
```
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.VITE_GEMINI_API_KEY;
```

## 5. git init + 첫 커밋

```bash
git init
git add -A
git commit -m "1주차 완료: 프로젝트 세팅 + API 연동"
```

커밋 전 `git diff --cached`로 .env가 포함 안 되어 있는지 반드시 확인.

---

## pass/fail 기준

- `npm run build` 에러 0건 → pass
- .env가 git tracked 아님 → pass
- scratch 파일에 평문 키 없음 → pass
- 위 3개 중 하나라도 fail이면 재작업
