# AGENTS.md — IdalTrip 프로젝트 (제대리 전용)

글로벌 규칙은 `~/.claude/AGENTS.md` 참조. 이 파일은 IdalTrip 특화 규칙만.

---

## 세션 시작 시 필독 (순서 지킬 것)

1. `~/.claude/AGENTS.md` — 전체 공통 규칙 + 거짓 보고 금지
2. `회고_클과장+제대리.md` — 과거 실수 패턴 숙지. 같은 실수 반복 금지
3. `CLAUDE.md` — 프로젝트 현황 + gstack 스프린트 순서

## IdalTrip 배포 규칙

- 배포 URL: https://idaltrip.vercel.app
- 배포 방법: git push만. `npx vercel --prod` 직접 배포 절대 금지
- 커밋 없이 "배포 완료" 보고 금지

## QA 규칙

- `/qa https://idaltrip.vercel.app` 로 실제 브라우저 검증
- 수동 체크리스트 ✅ 보고 시 관찰 내용 1줄 필수
- 확인 못 한 항목은 [미확인] 태그
