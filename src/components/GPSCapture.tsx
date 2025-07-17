"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2, Satellite, AlertCircle } from "lucide-react";

interface GPSPosition {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  timestamp: number;
}

interface GPSCaptureProps {
  onLocationCapture: (position: GPSPosition) => void;
  disabled?: boolean;
}

export function GPSCapture({ onLocationCapture, disabled }: GPSCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastCapture, setLastCapture] = useState<GPSPosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const captureGPSLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setIsCapturing(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const gpsData: GPSPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        setLastCapture(gpsData);
        setIsCapturing(false);
        setError(null);
        onLocationCapture(gpsData);
      },
      (error) => {
        setIsCapturing(false);
        let errorMessage = "Failed to capture GPS location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "GPS access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "GPS location unavailable. Try moving to an open area.";
            break;
          case error.TIMEOUT:
            errorMessage = "GPS request timed out. Please try again.";
            break;
        }

        setError(errorMessage);
      },
      options
    );
  };

  const getAccuracyLevel = (accuracy: number) => {
    if (accuracy <= 5) return { level: "Excellent", color: "bg-green-500" };
    if (accuracy <= 10) return { level: "Good", color: "bg-blue-500" };
    if (accuracy <= 20) return { level: "Fair", color: "bg-yellow-500" };
    return { level: "Poor", color: "bg-red-500" };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Satellite className="w-5 h-5 text-teal-600" />
          <span className="font-medium text-gray-900">GPS Location Capture</span>
        </div>
        <Button
          onClick={captureGPSLocation}
          disabled={isCapturing || disabled}
          className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700"
        >
          {isCapturing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Capturing...</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              <span>Get Current Location</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {lastCapture && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-800">Location Captured Successfully</span>
            <Badge className={`text-white text-xs ${getAccuracyLevel(lastCapture.accuracy).color}`}>
              {getAccuracyLevel(lastCapture.accuracy).level} (±{lastCapture.accuracy.toFixed(1)}m)
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
            <div>
              <span className="font-medium">Latitude:</span> {lastCapture.latitude.toFixed(6)}
            </div>
            <div>
              <span className="font-medium">Longitude:</span> {lastCapture.longitude.toFixed(6)}
            </div>
            {lastCapture.altitude && (
              <div>
                <span className="font-medium">Altitude:</span> {lastCapture.altitude.toFixed(1)}m
              </div>
            )}
            <div>
              <span className="font-medium">Captured:</span> {new Date(lastCapture.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        💡 For best results, ensure you have a clear view of the sky and location services are enabled.
      </div>
    </div>
  );
}
