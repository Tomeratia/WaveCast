import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import type { SpotDTO } from '@shared/types';

// Fix default marker icons (Leaflet's Webpack/Vite quirk)
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

interface SpotMapProps {
  spots: SpotDTO[];
  center?: [number, number];
  zoom?: number;
}

export function SpotMap({ spots, center = [32.0907, 34.7707], zoom = 6 }: SpotMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const navigate = useNavigate();

  // Init map ONCE
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers on data change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    spots.forEach((spot) => {
      const marker = L.marker([spot.lat, spot.lng])
        .addTo(map)
        .bindPopup(`<b>${spot.name}</b><br/>${spot.region}, ${spot.country}`)
        .on('click', () => navigate(`/spot/${spot.id}`));
      markersRef.current.push(marker);
    });
  }, [spots, navigate]);

  return <div ref={containerRef} className="h-[500px] w-full rounded-xl border border-gray-200 dark:border-gray-700" />;
}
