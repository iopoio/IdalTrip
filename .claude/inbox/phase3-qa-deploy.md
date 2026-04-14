# 제대리 작업 지시 — Phase 3 QA + 배포

클과장 → 제대리 | 마감: 2026.05.04 (제출 이틀 전 완료 목표)

Phase 2 잘 마무리했다. 이제 실전 투입 전 마지막 다듬기다. 기능 추가는 없고, 깨지는 거 잡고 배포하는 단계.

---

## 3-2. 모바일 반응형 QA

테스트 뷰포트: 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1440px (데스크탑)

확인 항목:
- [ ] 메인 히어로 텍스트가 모바일에서 잘리지 않는지 (text-[5rem]이 모바일에선 과할 수 있음)
- [ ] 월별 필터 가로 스크롤이 모바일에서 자연스러운지
- [ ] 축제 카드 그리드가 1열(모바일) / 2열(태블릿) / 4열(데스크탑)로 전환되는지
- [ ] 축제 상세 페이지 2단 레이아웃이 모바일에서 세로 스택으로 전환되는지
- [ ] 모바일 하단 고정 CTA("AI 코스 생성하기")가 BottomNav와 겹치지 않는지
- [ ] 코스 결과 타임라인이 모바일에서 가독성 유지되는지
- [ ] 지도 뷰 하단 카드 캐러셀이 모바일에서 스와이프 가능한지
- [ ] Header 네비가 md 이하에서 숨겨지고 BottomNav로 대체되는지

문제 발견 시: 해당 컴포넌트의 responsive class 수정. 새 컴포넌트 추가하지 말 것.

---

## 3-3. 에러 상태 사용자 안내

현재 에러 시 console.error만 하고 있다. 사용자에게 보이는 피드백 추가.

| 상황 | 처리 |
|------|------|
| TourAPI 축제 목록 0건 | "이번 달 등록된 축제가 아직 없습니다" 안내 문구 + 다른 달 선택 유도 |
| TourAPI 네트워크 에러 | "데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요" |
| Gemini 코스 생성 실패 | "AI 코스 생성에 실패했습니다. 다시 시도해주세요" (현재 alert → UI 내 인라인 메시지로 교체) |
| 카카오 경로 API 실패 | 이동시간 표시 부분에 "경로 계산 불가" 표시. 앱 크래시 안 되게. |

구현 방식: 각 페이지에 error state 추가. 별도 ErrorBoundary 컴포넌트까지는 불필요.

---

## 3-4. 이미지 없는 축제 fallback

TourAPI에서 `firstimage`가 빈 문자열인 축제가 많다.

FestivalCard와 FestivalDetailPage에서:
- `firstimage`가 없으면 → 그래디언트 배경 + 축제 카테고리 아이콘 표시
- 예: `bg-gradient-to-br from-primary/20 to-secondary/10` + 중앙에 `Calendar` 아이콘

현재 FestivalDetailPage에 Unsplash fallback URL이 하드코딩되어 있는데(`SpotCard` 150행), 이것도 같은 패턴으로 통일.

---

## 3-5. SEO 메타태그 + OG 태그

index.html `<head>`에 추가:

```html
<title>이달여행 — 이번 달, 어디 갈까?</title>
<meta name="description" content="시즌별 축제를 중심으로 AI가 맞춤 여행 코스를 자동 생성해주는 국내 여행 플래너" />
<meta property="og:title" content="이달여행" />
<meta property="og:description" content="이번 달 가장 빛나는 축제와 함께, AI가 설계하는 나만의 여행 코스" />
<meta property="og:type" content="website" />
<meta property="og:image" content="/og-image.png" />
<meta name="theme-color" content="#ff6b35" />
```

OG 이미지: 로고 + 서비스 소개 이미지 1200x630px. 간단하게 오렌지 배경 + "이달여행" 로고 중앙 배치로 만들면 됨. `public/og-image.png`에 저장.

---

## 3-6. Vercel 배포

순서:
1. GitHub 리포 생성 (private) + push
2. Vercel에 연결
3. 환경변수 설정 (VITE_TOUR_API_KEY, VITE_KAKAO_JS_KEY, VITE_KAKAO_REST_KEY, VITE_GEMINI_API_KEY)
4. 빌드 커맨드: `npm run build`, 출력: `dist`
5. 배포 후 URL 공유

주의:
- `.env` 파일은 push하지 말 것 (`.gitignore` 확인)
- Vercel 환경변수에 키 값 직접 입력
- 배포 후 실제로 축제 목록이 뜨는지, AI 코스 생성이 되는지 확인

---

## 3-7 (클과장 담당)
최종 디자인 QA는 배포 후 내가 직접 확인한다. 제대리는 3-2~3-6까지만 처리.

---

## pass/fail 기준

1. `npm run build` 에러 0건 → pass
2. 375px 뷰포트에서 전체 플로우 깨짐 없음 → pass
3. 축제 목록 0건일 때 빈 화면 아닌 안내 문구 표시 → pass
4. 이미지 없는 축제에 fallback UI 표시 → pass
5. Vercel 배포 URL에서 실제 동작 확인 → pass
6. OG 태그 적용 확인 (URL 공유 시 미리보기 표시) → pass

---

이번 Phase가 양은 적지만 디테일 싸움이다. "동작은 하는데 좀 어색한" 부분들을 잡는 거라 꼼꼼하게 해라. 특히 모바일 반응형은 실제 브라우저 DevTools에서 각 뷰포트별로 다 확인할 것.

배포 URL 나오면 바로 공유해줘. 내가 E2E + 디자인 QA 들어간다.

— 클과장
