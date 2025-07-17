"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import dynamic from 'next/dynamic';

// Dynamically import components that use browser APIs to avoid SSR issues
const GPSDataEntry = dynamic(() => import("@/components/GPSDataEntry").then(mod => ({ default: mod.GPSDataEntry })), {
  ssr: false,
  loading: () => <div className="p-6 text-center">Loading...</div>
});

const DataViewer = dynamic(() => import("@/components/DataViewer").then(mod => ({ default: mod.DataViewer })), {
  ssr: false,
  loading: () => <div className="p-6 text-center">Loading...</div>
});

const MapView = dynamic(() => import("@/components/MapView").then(mod => ({ default: mod.MapView })), {
  ssr: false,
  loading: () => <div className="p-6 text-center">Loading...</div>
});

export default function Home() {
  const [currentView, setCurrentView] = useState<"gps-entry" | "data-viewer" | "map-view">("gps-entry");

  const handleNavigationChange = (viewId: string) => {
    if (viewId === "gps-entry" || viewId === "data-viewer" || viewId === "map-view") {
      setCurrentView(viewId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation onNavigate={handleNavigationChange} currentView={currentView} />
      <main className="pb-8">
        {currentView === "gps-entry" && <GPSDataEntry />}
        {currentView === "data-viewer" && <DataViewer />}
        {currentView === "map-view" && <MapView />}
      </main>
    </div>
  );
}
