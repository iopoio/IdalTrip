import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { loadKakaoMaps } from '../utils/kakaoLoader';
import type { CourseItem } from '../types';

interface CourseMapProps {
  items: CourseItem[];
  activeIndex: number;
  onMarkerClick?: (index: number) => void;
}

type KakaoMap = {
  setCenter: (latlng: unknown) => void;
  panTo: (latlng: unknown) => void;
  setLevel: (level: number) => void;
  setBounds: (bounds: unknown) => void;
};

type MarkerInstance = {
  setMap: (m: KakaoMap | null) => void;
  setImage: (img: unknown) => void;
};

type PolylineInstance = { setMap: (m: KakaoMap | null) => void };

type AnyKakao = {
  kakao: {
    maps: {
      LatLng: new (lat: number, lng: number) => unknown;
      LatLngBounds: new () => { extend: (latlng: unknown) => void };
      Map: new (container: HTMLElement, options: { center: unknown; level: number }) => KakaoMap;
      Marker: new (options: { position: unknown; map?: KakaoMap; image?: unknown; zIndex?: number }) => MarkerInstance;
      MarkerImage: new (src: string, size: unknown, options?: { offset?: unknown }) => unknown;
      Size: new (w: number, h: number) => unknown;
      Point: new (x: number, y: number) => unknown;
      Polyline: new (options: {
        path: unknown[];
        strokeWeight: number;
        strokeColor: string;
        strokeOpacity: number;
        strokeStyle: string;
      }) => PolylineInstance;
      event: { addListener: (target: unknown, type: string, handler: () => void) => void };
    };
  };
};

const PRIMARY_COLOR = '#FF6B35';
const MUTED_COLOR = '#9BA5B0';

function createNumberedMarkerImage(kakao: AnyKakao['kakao'], n: number, active: boolean): unknown {
  const color = active ? PRIMARY_COLOR : MUTED_COLOR;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28s18-14.5 18-28C36 8.06 27.94 0 18 0z" fill="${color}"/>
      <circle cx="18" cy="18" r="11" fill="white"/>
      <text x="18" y="23" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="13" font-weight="800" fill="${color}">${n}</text>
    </svg>
  `;
  const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.trim());
  return new kakao.maps.MarkerImage(dataUri, new kakao.maps.Size(36, 46), {
    offset: new kakao.maps.Point(18, 46),
  });
}

export default function CourseMap({ items, activeIndex, onMarkerClick }: CourseMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markerObjsRef = useRef<MarkerInstance[]>([]);
  const polylineRef = useRef<PolylineInstance | null>(null);
  const kakaoRef = useRef<AnyKakao['kakao'] | null>(null);
  const onMarkerClickRef = useRef(onMarkerClick);
  const [loadError, setLoadError] = useState(false);

  // 콜백 변경에 따른 재등록 회피용 ref
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  // 1) 최초 1회: 카카오 SDK 로드 + 지도 인스턴스 생성 (items 변경 시 재생성 안 함)
  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    loadKakaoMaps()
      .then(() => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        const kakao = (window as unknown as AnyKakao).kakao;
        kakaoRef.current = kakao;
        const map = new kakao.maps.Map(containerRef.current, {
          center: new kakao.maps.LatLng(37.5665, 126.9780),
          level: 8,
        });
        mapRef.current = map;
        // items가 이미 들어와 있으면 즉시 마커/폴리라인 렌더 트리거
        // (다음 effect가 items 의존성으로 실행됨)
        // 강제 re-render용 dummy state 없이도 items effect가 이미 마운트 순서상 뒤에 실행됨
      })
      .catch((err) => {
        console.error('[CourseMap] 지도 로드 실패:', err);
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
      // 언마운트 시에만 정리
      markerObjsRef.current.forEach((m) => m.setMap(null));
      markerObjsRef.current = [];
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      mapRef.current = null;
    };
  }, []);

  // 2) items 변경 시: 기존 마커/폴리라인만 교체. 지도는 유지
  useEffect(() => {
    const kakao = kakaoRef.current;
    const map = mapRef.current;
    if (!kakao || !map) {
      // 지도가 아직 준비 안 됐으면 다음 렌더에서 재시도되도록 polling
      const retry = setInterval(() => {
        if (kakaoRef.current && mapRef.current) {
          clearInterval(retry);
          renderMarkers();
        }
      }, 100);
      return () => clearInterval(retry);
    }
    renderMarkers();

    function renderMarkers() {
      const kakao = kakaoRef.current!;
      const map = mapRef.current!;

      // 기존 마커/폴리라인 제거
      markerObjsRef.current.forEach((m) => m.setMap(null));
      markerObjsRef.current = [];
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }

      const validItems = items.filter((it) => typeof it.lat === 'number' && typeof it.lng === 'number');
      if (validItems.length === 0) return;

      // bounds 조정
      if (validItems.length > 1) {
        const bounds = new kakao.maps.LatLngBounds();
        validItems.forEach((it) => bounds.extend(new kakao.maps.LatLng(it.lat, it.lng)));
        map.setBounds(bounds);
      } else {
        map.panTo(new kakao.maps.LatLng(validItems[0].lat, validItems[0].lng));
      }

      // 마커
      items.forEach((item, idx) => {
        if (typeof item.lat !== 'number' || typeof item.lng !== 'number') return;
        const position = new kakao.maps.LatLng(item.lat, item.lng);
        const marker = new kakao.maps.Marker({
          position,
          map,
          image: createNumberedMarkerImage(kakao, idx + 1, idx === activeIndex),
          zIndex: idx === activeIndex ? 10 : 1,
        });
        kakao.maps.event.addListener(marker, 'click', () => {
          onMarkerClickRef.current?.(idx);
        });
        markerObjsRef.current.push(marker);
      });

      // 폴리라인
      const path = validItems.map((it) => new kakao.maps.LatLng(it.lat, it.lng));
      if (path.length > 1) {
        const polyline = new kakao.maps.Polyline({
          path,
          strokeWeight: 3,
          strokeColor: PRIMARY_COLOR,
          strokeOpacity: 0.7,
          strokeStyle: 'solid',
        });
        polyline.setMap(map);
        polylineRef.current = polyline;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // 3) activeIndex 변경 시: 지도 이동 + 마커 이미지만 교체
  useEffect(() => {
    const kakao = kakaoRef.current;
    const map = mapRef.current;
    if (!kakao || !map) return;

    const active = items[activeIndex];
    if (active && typeof active.lat === 'number' && typeof active.lng === 'number') {
      map.panTo(new kakao.maps.LatLng(active.lat, active.lng));
    }
    markerObjsRef.current.forEach((marker, idx) => {
      marker.setImage(createNumberedMarkerImage(kakao, idx + 1, idx === activeIndex));
    });
  }, [activeIndex, items]);

  if (loadError) {
    return (
      <div className="w-full h-full bg-surface-container flex flex-col items-center justify-center gap-3 px-6 text-center">
        <MapPin className="w-10 h-10 text-outline-variant" />
        <p className="text-sm font-bold text-on-surface font-headline">지도를 불러올 수 없어요</p>
        <p className="text-xs text-on-surface-variant leading-relaxed font-body">
          잠시 후 다시 시도해 주세요.<br />아래 카드로 코스 순서를 확인할 수 있어요.
        </p>
        {items.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-1 max-w-full">
            {items.slice(0, 8).map((item, idx) => (
              <span
                key={`${item.day}-${idx}`}
                className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                  idx === activeIndex
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {idx + 1}. {item.place_name.slice(0, 10)}
              </span>
            ))}
            {items.length > 8 && (
              <span className="text-[10px] text-on-surface-variant self-center">
                외 {items.length - 8}곳
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full bg-surface-container" />;
}
