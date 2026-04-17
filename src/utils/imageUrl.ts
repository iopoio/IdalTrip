/**
 * HTTP 이미지 URL을 HTTPS로 변환. Mixed Content 경고 방지.
 * 주로 TourAPI의 `firstimage`, `firstimage2`, Gemini 응답의 `image_url`에 사용.
 */
export function toHttps(url?: string | null): string {
  if (!url) return '';
  return url.replace(/^http:\/\//i, 'https://');
}
