'use client';

import { useEffect, useRef } from 'react';

interface LatLng {
  lat: number;
  lng: number;
}

interface HistoricalPoint extends LatLng {
  timestamp: string;
}

interface ShipmentMapProps {
  currentLocation: LatLng | null;
  locationHistory: HistoricalPoint[];
}

export default function ShipmentMap({ currentLocation, locationHistory }: ShipmentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Dynamic import to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const center: [number, number] =
        currentLocation ? [currentLocation.lat, currentLocation.lng] : [0, 20];
      const zoom = currentLocation ? 8 : 2;

      const map = L.map(mapRef.current!, { zoomControl: true }).setView(center, zoom);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Draw historical path
      if (locationHistory.length > 1) {
        const latlngs = locationHistory.map((p) => [p.lat, p.lng] as [number, number]);
        L.polyline(latlngs, { color: 'hsl(245,75%,60%)', weight: 3, opacity: 0.7 }).addTo(map);

        // Historical markers (small circles)
        locationHistory.slice(0, -1).forEach((p) => {
          L.circleMarker([p.lat, p.lng], {
            radius: 4,
            color: 'hsl(245,75%,60%)',
            fillColor: 'white',
            fillOpacity: 1,
            weight: 2,
          }).addTo(map);
        });
      }

      // Current location marker
      if (currentLocation) {
        const pulsingIcon = L.divIcon({
          html: `<div style="
            width:20px;height:20px;border-radius:50%;
            background:hsl(160,84%,39%);
            border:3px solid white;
            box-shadow:0 0 0 4px rgba(16,185,129,0.3);
          "></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          className: '',
        });
        L.marker([currentLocation.lat, currentLocation.lng], { icon: pulsingIcon })
          .addTo(map)
          .bindPopup('Current location');
      }

      if (!currentLocation && locationHistory.length === 0) {
        map.setView([20, 0], 2);
      }
    });

    return () => {
      if (mapInstance.current) {
        (mapInstance.current as { remove: () => void }).remove();
        mapInstance.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map when location changes without re-mounting
  useEffect(() => {
    if (!mapInstance.current || !currentLocation) return;
    import('leaflet').then((L) => {
      (mapInstance.current as ReturnType<typeof L.map>).setView(
        [currentLocation.lat, currentLocation.lng],
        10,
      );
    });
  }, [currentLocation]);

  if (!currentLocation && locationHistory.length === 0) {
    return (
      <div className="map-container flex items-center justify-center bg-muted">
        <div className="text-center text-sm text-muted-foreground">
          <p className="font-medium">No location data yet</p>
          <p>The carrier will appear here once they submit a location update.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={mapRef} className="map-container" />
    </>
  );
}
