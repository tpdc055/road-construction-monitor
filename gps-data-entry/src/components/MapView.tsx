"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Map, Filter, Download, Eye, MapPin } from "lucide-react";
import { GPSDatabase, GPSRecord } from "@/lib/database";
import { GPSMap } from "./GPSMap";

export function MapView() {
  const [records, setRecords] = useState<GPSRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<GPSRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState("all");
  const [workTypeFilter, setWorkTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, projectFilter, workTypeFilter, searchTerm]);

  const loadRecords = () => {
    const allRecords = GPSDatabase.getAllRecords();
    setRecords(allRecords);
  };

  const filterRecords = () => {
    let filtered = records;

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (projectFilter !== "all") {
      filtered = filtered.filter(record => record.projectId === projectFilter);
    }

    if (workTypeFilter !== "all") {
      filtered = filtered.filter(record => record.workType === workTypeFilter);
    }

    setFilteredRecords(filtered);
  };

  const handleMarkerClick = (record: GPSRecord) => {
    setSelectedRecord(record.id);
  };

  const exportGeoJSON = () => {
    const geoJSON = {
      type: "FeatureCollection",
      features: filteredRecords.map(record => ({
        type: "Feature",
        properties: {
          id: record.id,
          taskName: record.taskName,
          projectName: record.projectName,
          workType: record.workType,
          description: record.description,
          dateCollected: record.dateCollected,
          collectedBy: record.collectedBy,
          accuracy: record.accuracy,
          altitude: record.altitude
        },
        geometry: {
          type: "Point",
          coordinates: [record.longitude, record.latitude]
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geoJSON, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gps-points-${new Date().toISOString().split('T')[0]}.geojson`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const uniqueProjects = [...new Set(records.map(r => ({ id: r.projectId, name: r.projectName })))];
  const uniqueWorkTypes = [...new Set(records.map(r => r.workType).filter(Boolean))];

  const selectedRecordData = selectedRecord ? records.find(r => r.id === selectedRecord) : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Map className="w-8 h-8 text-teal-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GPS Points Map</h1>
              <p className="text-gray-600">Interactive map showing all collected GPS coordinates</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="text-sm">
              {filteredRecords.length} points displayed
            </Badge>
            <Button onClick={exportGeoJSON} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export GeoJSON
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Map Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Search tasks, projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {uniqueProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={workTypeFilter} onValueChange={setWorkTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by work type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Work Types</SelectItem>
                    {uniqueWorkTypes.map((workType) => (
                      <SelectItem key={workType} value={workType}>
                        {workType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map and Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>GPS Points Map</CardTitle>
                <CardDescription>
                  Click on markers to view detailed information about each GPS point
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredRecords.length > 0 ? (
                  <GPSMap
                    records={filteredRecords}
                    height="500px"
                    selectedRecord={selectedRecord}
                    onMarkerClick={handleMarkerClick}
                  />
                ) : (
                  <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No GPS points found</h3>
                      <p className="text-gray-600">
                        {records.length === 0
                          ? "Start by creating GPS data entries to see them on the map."
                          : "Try adjusting your search or filter criteria."
                        }
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Selected Point Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Point Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRecordData ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{selectedRecordData.taskName}</h3>
                      <p className="text-sm text-gray-600">{selectedRecordData.projectName}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Latitude:</span>
                          <p className="text-gray-900">{selectedRecordData.latitude.toFixed(6)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Longitude:</span>
                          <p className="text-gray-900">{selectedRecordData.longitude.toFixed(6)}</p>
                        </div>
                        {selectedRecordData.altitude && (
                          <div>
                            <span className="font-medium text-gray-700">Altitude:</span>
                            <p className="text-gray-900">{selectedRecordData.altitude}m</p>
                          </div>
                        )}
                        {selectedRecordData.accuracy && (
                          <div>
                            <span className="font-medium text-gray-700">Accuracy:</span>
                            <p className="text-gray-900">±{selectedRecordData.accuracy}m</p>
                          </div>
                        )}
                      </div>

                      {selectedRecordData.workType && (
                        <div>
                          <span className="font-medium text-gray-700">Work Type:</span>
                          <Badge variant="outline" className="ml-2">{selectedRecordData.workType}</Badge>
                        </div>
                      )}

                      {selectedRecordData.description && (
                        <div>
                          <span className="font-medium text-gray-700">Description:</span>
                          <p className="text-sm text-gray-900 mt-1">{selectedRecordData.description}</p>
                        </div>
                      )}

                      <div className="border-t pt-3 space-y-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Collected:</span> {selectedRecordData.dateCollected}
                        </div>
                        <div>
                          <span className="font-medium">By:</span> {selectedRecordData.collectedBy}
                        </div>
                        {selectedRecordData.attachmentNames.length > 0 && (
                          <div>
                            <span className="font-medium">Attachments:</span> {selectedRecordData.attachmentNames.length} file(s)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Click on a map marker to view point details</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Points:</span>
                    <span className="font-medium">{records.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Filtered Points:</span>
                    <span className="font-medium">{filteredRecords.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projects:</span>
                    <span className="font-medium">{uniqueProjects.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Work Types:</span>
                    <span className="font-medium">{uniqueWorkTypes.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
