import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import type { CourseItem } from '../types';

interface CourseMapProps {
  items: CourseItem[];
  activeIndex: number;
  onMarkerClick?: (index: number) => void;
}

const PRIMARY_COLOR = '#FF6B35';
const MUTED_COLOR = '#9BA5B0';

function createNumberedIcon(n: number, active: boolean) {
  const color = active ? PRIMARY_COLOR : MUTED_COLOR;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 28 18 28s18-14.5 18-28C36 8.06 27.94 0 18 0z" fill="${color}"/>
      <circle cx="18" cy="18" r="11" fill="white"/>
      <text x="18" y="23" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="13" font-weight="800" fill="${color}">${n}</text>
    </svg>
  `;
  const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.trim());
  return L.icon({
    iconUrl: dataUri,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
  });
}

function MapEffect({ items, activeIndex }: { items: CourseItem[]; activeIndex: number }) {
  const map = useMap();

  useEffect(() => {
    const validItems = items.filter((it) => typeof it.lat === 'number' && typeof it.lng === 'number');
    if (validItems.length === 0) return;

    if (validItems.length > 1) {
      const bounds = L.latLngBounds(validItems.map((it) => [it.lat, it.lng]));
      map.fitBounds(bounds, { padding: [30, 30] });
    } else {
      map.panTo([validItems[0].lat, validItems[0].lng]);
    }
  }, [items, map]);

  useEffect(() => {
    const active = items[activeIndex];
    if (active && typeof active.lat === 'number' && typeof active.lng === 'number') {
      map.panTo([active.lat, active.lng]);
    }
  }, [activeIndex, items, map]);

  return null;
}

export default function CourseMap({ items, activeIndex, onMarkerClick }: CourseMapProps) {
  const validItems = useMemo(() => items.filter((it) => typeof it.lat === 'number' && typeof it.lng === 'number'), [items]);
  const polylinePositions = useMemo(() => validItems.map((it) => [it.lat, it.lng] as [number, number]), [validItems]);

  const defaultCenter: [number, number] = validItems.length > 0 ? [validItems[0].lat, validItems[0].lng] : [37.5665, 126.9780];

  return (
    <div className="w-full h-full bg-surface-container relative">
      <MapContainer center={defaultCenter} zoom={13} className="w-full h-full" zoomControl={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {items.map((item, idx) => {
          if (typeof item.lat !== 'number' || typeof item.lng !== 'number') return null;
          return (
            <Marker
              key={`${item.day}-${idx}`}
              position={[item.lat, item.lng]}
              icon={createNumberedIcon(idx + 1, idx === activeIndex)}
              zIndexOffset={idx === activeIndex ? 1000 : 0}
              eventHandlers={{
                click: () => onMarkerClick?.(idx),
              }}
            />
          );
        })}
        {polylinePositions.length > 1 && (
          <Polyline positions={polylinePositions} pathOptions={{ color: PRIMARY_COLOR, weight: 3, opacity: 0.7 }} />
        )}
        <MapEffect items={items} activeIndex={activeIndex} />
      </MapContainer>
    </div>
  );
}
