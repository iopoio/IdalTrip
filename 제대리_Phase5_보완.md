# Phase5 보완 지시서 — 제대리용

작성: 클과장 / 2026-04-15  
⚠️ 작업 전 CLAUDE.md + 역할-제대리.md 읽을 것.

---

## 배경

Phase5 코드 리뷰 결과 구멍 2개 발견. 작업 범위 여기까지만.

---

## Fix 1 — ExploreResultPage.tsx: load() 에러 핸들링

**문제**: `load()` 함수에 try/catch 없음. 개별 API 함수는 자체 catch가 있어서 대부분 통과하지만, 예상치 못한 예외 발생 시 `setLoading(false)` 미호출 → 무한 스피너.

**수정 대상**: `src/pages/ExploreResultPage.tsx`

`load()` 함수를 아래처럼 감쌀 것:

```typescript
const load = async () => {
  setLoading(true);
  try {
    // 기존 로직 그대로
  } catch (err) {
    console.error('ExploreResultPage load error:', err);
    setError('데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
  } finally {
    setLoading(false);
  }
};
```

상태 추가:
```typescript
const [error, setError] = useState<string | null>(null);
```

에러 UI 추가 (로딩 끝난 후, 스팟 없을 때):
```tsx
{!loading && error && (
  <div className="px-4 py-8 text-center">
    <p className="text-sm text-red-500">{error}</p>
  </div>
)}
```

---

## Fix 2 — ExploreResultPage.tsx: handleGenerateCourse 에러 UI

**문제**: catch에 `console.error(e)`만 있음. Gemini 실패 시 사용자는 아무것도 못 봄.

**수정 대상**: `src/pages/ExploreResultPage.tsx`

`handleGenerateCourse` catch 블록 수정:

```typescript
} catch (e) {
  console.error(e);
  setGenerating(false);
  alert('코스 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.');
  return;
}
```

`finally`가 있으면 `setGenerating(false)` 중복 주의. 기존 finally 블록과 조율할 것.

---

## 검증

```
Fix 1 — 네트워크 끊고 탐색 진입 → 에러 메시지 표시, 무한 스피너 없음: ✅/❌
Fix 2 — Gemini API 키 임시 제거 후 코스 생성 시도 → alert 표시: ✅/❌
npm run build 통과: ✅/❌
```

---

## 절대 규칙

- .env 수정 금지
- 기존 UI/로직 건드리지 말 것. Fix 1, Fix 2만.
- 빌드 통과 확인 후 보고
