# 이달트립 v2 스티치 프롬프트

공통 지침:
- All prompts are in English
- All UI text content is in Korean (한국어) — please recommend and apply Korean-optimized web fonts (e.g. Pretendard, Noto Sans KR, or similar) that render Korean characters beautifully
- Choose a fitting color palette for a premium travel app — do not use predefined colors, let the design breathe
- Style: Premium editorial travel magazine feel. Clean, spacious, photo-rich. Mobile-first (390px width).

---

## Screen 1 — Home (Search-first)

```
Design a mobile home screen for a Korean travel app called "이달트립" (IdalTrip).

Typography: All text is in Korean. Choose and apply a modern Korean web font that renders beautifully (recommend Pretendard or similar). Use a separate display/headline font for large titles.

The core concept: users pick a region + date + departure city, then get a travel course automatically. The home screen should make this search feel effortless and inspiring.

Layout top to bottom:

1. MINIMAL HEADER: App logo "이달트립" small on left. No heavy navigation.

2. HERO SEARCH CARD (the most prominent element on screen, large card with soft shadow):
   - Small eyebrow label: "어디로 떠날까요?"
   - Region selector: horizontally scrollable chips — "전체" "서울/경기" "강원" "충청" "전라" "경상" "제주" — one chip selected state styled distinctly
   - Date picker field: calendar icon + date text "2025년 5월 10일 (토)" bold
   - Departure input field: location pin icon + italic placeholder "출발지 입력 (예: 서울역)"
   - Large full-width CTA button: "강원도 · 5월 10일 여행 찾기" — make it feel exciting to tap

3. SECTION — "이달의 추천 여행지":
   - Section heading + small subtitle: "클릭하면 자동으로 설정됩니다"
   - Destination card grid (2 columns, first card spans full width):
     * Large card: "강릉 봄 여행" with a beautiful coastal photo, overlay text
     * Smaller cards: "경주 벚꽃" / "여수 밤바다" / "제주 유채꽃" — each with a relevant travel photo
   - Each card has a small status badge like "지금 축제중" or "이달 추천"

4. Minimal footer

No bottom navigation bar. Mobile 390px.
```

---

## Screen 2 — Place Selection

```
Design a mobile screen for a Korean travel app "이달트립" where the user reviews and customizes AI-recommended places before generating a travel course.

Typography: Korean text throughout. Apply a high-quality Korean web font. Use font weight variation to create clear hierarchy.

This screen appears after region + date + departure are set. The AI has pre-selected recommended spots — the user can add or remove them.

Layout top to bottom:

1. HEADER: back arrow, center title showing selected region and date (e.g. "강원도 · 5월 10일"), share icon.

2. TRIP OPTIONS SUMMARY BAR (compact, horizontally laid out):
   Shows the current trip settings in one glanceable row:
   - 출발지: "서울역" (tappable to edit)
   - 이동수단: "자차" vs "대중교통" toggle
   - 일정: "당일" / "1박 2일" / "2박 3일" pill selector

3. AI INSIGHT BANNER (subtle, below options):
   "서울역 기준 실제 관광 가능 시간 약 5시간 30분" — small text showing available time after accounting for travel

4. SECTION "AI 추천 장소":
   - Header with "전체 선택" button on right
   - List of place cards (vertical scroll):

   Each card: horizontal layout — square photo thumbnail left, info right
   Info includes:
   - Type badge (축제 / 관광지 / 맛집 / 문화시설) in a small colored pill
   - Place name bold
   - Short address or distance
   - For restaurants: small Kakao logo + star rating "★ 4.8 · 카카오 맛집"
   - Checkbox on the far right (pre-checked for AI picks)

   Cards:
   1. checked — 축제: "강릉 커피 축제"
   2. checked — 관광지: "경포대"
   3. checked — 맛집 (kakao): "초당 할머니 순두부" ★4.8
   4. checked — 문화시설: "참소리 축음기 박물관"
   5. unchecked — 관광지: "안목 해변 카페거리"
   6. unchecked — 맛집 (kakao): "테라로사 커피공장"

5. FIXED BOTTOM BAR:
   Left: "4곳 선택됨" count
   Right: prominent CTA button "AI 코스 생성하기 →"

Mobile 390px.
```

---

## Screen 3 — Course Result

```
Design a mobile screen for a Korean travel app "이달트립" showing the AI-generated travel itinerary.

Typography: Korean text throughout. Apply a premium Korean web font. Make the timeline feel structured yet visually exciting.

This is the payoff screen — the user sees their full day plan. Make it feel satisfying and practical.

Layout top to bottom:

1. HEADER: back arrow, "AI 코스 결과" center, Kakao share icon right.

2. HERO SUMMARY CARD (visually striking, full-bleed color or gradient):
   - Headline: "✨ AI가 최적의 코스를 만들었습니다!"
   - Subtitle: "운영시간·이동시간·휴무일을 모두 고려했어요"
   - 3 stat chips in a row: "⏱ 총 6시간 30분" / "💰 약 3.5만원" / "📍 4곳"

3. TIMELINE (the main content):
   Vertical timeline with a connecting line on the left side.
   
   Each timeline stop:
   - Time indicator: e.g. "10:00 AM"
   - Type color-coded circle (festival / food / attraction / culture each different color)
   - Content card with:
     * Photo (full width, rounded top)
     * Place name bold + 1-line description
     * Stay duration chip: "약 1시간 30분"
     * Travel to next: "→ 차 15분 · 8km" small text
     * "카카오 내비" button: Kakao yellow, compact, right-aligned
   
   4 stops:
   1. 10:00 AM — "강릉 커피 축제" — "지금 축제 중!" badge on photo
   2. 12:30 PM — "초당 할머니 순두부" — "★ 4.8" rating badge
   3. 02:00 PM — "경포대"
   4. 04:00 PM — "참소리 축음기 박물관" — "17:00 마감" warning badge

4. FIXED BOTTOM BAR (two equal buttons):
   - "다른 코스 추천받기" (outline style)
   - "카카오톡 공유 →" (solid, prominent)

Mobile 390px.
```
