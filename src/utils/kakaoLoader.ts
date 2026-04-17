let loaderPromise: Promise<void> | null = null;

export function loadKakaoMaps(): Promise<void> {
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('window is undefined'));
      return;
    }

    const anyWindow = window as unknown as { kakao?: { maps?: { LatLng?: unknown; load?: (cb: () => void) => void } } };
    if (anyWindow.kakao?.maps?.LatLng) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[src*="dapi.kakao.com/v2/maps/sdk.js"]');
    if (existing) {
      const check = () => {
        if (anyWindow.kakao?.maps?.LatLng) resolve();
        else setTimeout(check, 100);
      };
      check();
      return;
    }

    const appkey = import.meta.env.VITE_KAKAO_JS_KEY;
    if (!appkey) {
      reject(new Error('VITE_KAKAO_JS_KEY 환경변수 누락'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false`;
    script.onload = () => {
      const kakao = (window as unknown as { kakao: { maps: { load: (cb: () => void) => void } } }).kakao;
      kakao.maps.load(() => resolve());
    };
    script.onerror = () => reject(new Error('카카오맵 SDK 로드 실패'));
    document.head.appendChild(script);
  });

  return loaderPromise;
}
