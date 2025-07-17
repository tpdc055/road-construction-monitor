"use client";

import { useEffect, useRef, useState } from "react";
import { GPSRecord } from "@/lib/database";
import dynamic from 'next/dynamic';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), {
  ssr: false
});
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), {
  ssr: false
});
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), {
  ssr: false
});
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), {
  ssr: false
});
// useMap will be imported dynamically inside the component

interface GPSMapProps {
  records: GPSRecord[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedRecord?: string | null;
  onMarkerClick?: (record: GPSRecord) => void;
}

export function GPSMap({
  records,
  center = [-6.314993, 143.955555], // Default to PNG coordinates
  zoom = 10,
  height = "400px",
  selectedRecord,
  onMarkerClick
}: GPSMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<typeof import('leaflet') | null>(null);

  useEffect(() => {
    setIsClient(true);
    // Dynamically import Leaflet only on client side
    import('leaflet').then((leafletModule) => {
      const L = leafletModule.default;

      // Fix for default markers in react-leaflet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      setL(L);
    });
  }, []);

  // Don't render until client-side
  if (!isClient || !L) {
    return (
      <div
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50"
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  // Calculate center point from records for initial map view
  const calculateCenter = (records: GPSRecord[]): [number, number] => {
    if (records.length === 0) return center;

    const latSum = records.reduce((sum, record) => sum + record.latitude, 0);
    const lngSum = records.reduce((sum, record) => sum + record.longitude, 0);

    return [latSum / records.length, lngSum / records.length];
  };

  const mapCenter = records.length > 0 ? calculateCenter(records) : center;

  // Custom marker icons for different work types
  const getMarkerIcon = (workType: string, isSelected: boolean = false) => {
    const color = isSelected ? '#ef4444' : getWorkTypeColor(workType);

    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            color: white;
            font-size: 10px;
            font-weight: bold;
          ">${getWorkTypeInitial(workType)}</div>
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };

  const getWorkTypeColor = (workType: string): string => {
    const colors: { [key: string]: string } = {
      'Excavation': '#8B5CF6',
      'Grading': '#10B981',
      'Asphalt Laying': '#F59E0B',
      'Bridge Construction': '#3B82F6',
      'Drainage Installation': '#06B6D4',
      'Survey Marking': '#EF4444',
      'Quality Control Check': '#84CC16',
      'Environmental Monitoring': '#6366F1'
    };
    return colors[workType] || '#6B7280';
  };

  const getWorkTypeInitial = (workType: string): string => {
    const initials: { [key: string]: string } = {
      'Excavation': 'E',
      'Grading': 'G',
      'Asphalt Laying': 'A',
      'Bridge Construction': 'B',
      'Drainage Installation': 'D',
      'Survey Marking': 'S',
      'Quality Control Check': 'Q',
      'Environmental Monitoring': 'M'
    };
    return initials[workType] || '●';
  };

  return (
    <div className="relative">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-200"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />



        {records.map((record) => (
          <Marker
            key={record.id}
            position={[record.latitude, record.longitude]}
            icon={getMarkerIcon(record.workType, selectedRecord === record.id)}
            eventHandlers={{
              click: () => onMarkerClick?.(record)
            }}
          >
            <Popup>
              <div className="space-y-2 min-w-64">
                <div>
                  <h3 className="font-semibold text-gray-900">{record.taskName}</h3>
                  <p className="text-sm text-gray-600">{record.projectName}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Lat:</span> {record.latitude.toFixed(6)}
                  </div>
                  <div>
                    <span className="font-medium">Lng:</span> {record.longitude.toFixed(6)}
                  </div>
                  {record.altitude && (
                    <div>
                      <span className="font-medium">Alt:</span> {record.altitude}m
                    </div>
                  )}
                  {record.accuracy && (
                    <div>
                      <span className="font-medium">Acc:</span> ±{record.accuracy}m
                    </div>
                  )}
                </div>

                {record.workType && (
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getWorkTypeColor(record.workType) }}
                    ></div>
                    <span className="text-sm text-gray-700">{record.workType}</span>
                  </div>
                )}

                {record.description && (
                  <p className="text-sm text-gray-600 border-t pt-2">
                    {record.description}
                  </p>
                )}

                <div className="text-xs text-gray-500 border-t pt-2">
                  <div>Collected: {record.dateCollected}</div>
                  <div>By: {record.collectedBy}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute top-2 right-2 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-[1000]">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Work Types</h4>
        <div className="space-y-1">
          {[
            'Excavation', 'Grading', 'Asphalt Laying', 'Bridge Construction',
            'Drainage Installation', 'Survey Marking', 'Quality Control Check', 'Environmental Monitoring'
          ].map((workType) => (
            <div key={workType} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: getWorkTypeColor(workType) }}
              ></div>
              <span className="text-xs text-gray-700">{workType}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
