# 코스 생성 50건 안정화 검증 리포트
생성일: 2026-04-30

## 1. 개요
- **샘플 수**: 50건
- **성공률**: 48/50 (96.0%)
- **호출 시간**: PM 12:29:52 ~ PM 12:46:14

## 2. 실패 통계
- TYPE_A: 0건
- TYPE_B: 0건
- TYPE_C: 0건
- TYPE_D: 2건
- TYPE_E: 0건

## 3. 실패 케이스 상세

| 인덱스 | 차원 | 라벨 | 사유 | 원문 발췌 |
|---|---|---|---|---|
| 20 | Area:6, car, 1night | TYPE_D | Missing required fields in schedule item: 마린시티 한식당 | {   "title": "부산 2일 감성 바다 여행",   "theme": "해안 힐링",... |
| 37 | Area:39, public, 2night | TYPE_D | Missing required fields in schedule item: 조천읍 맛집 | {   "title": "제주 힐링 3일",   "theme": "레저와 휴식",   "s... |
