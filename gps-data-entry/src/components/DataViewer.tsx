"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Download, Trash2, Search, MapPin, Calendar, User } from "lucide-react";
import { GPSDatabase, GPSRecord } from "@/lib/database";

export function DataViewer() {
  const [records, setRecords] = useState<GPSRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<GPSRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [workTypeFilter, setWorkTypeFilter] = useState("all");

  const loadRecords = () => {
    const allRecords = GPSDatabase.getAllRecords();
    setRecords(allRecords);
  };

  const filterRecords = useCallback(() => {
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
  }, [records, searchTerm, projectFilter, workTypeFilter]);

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [filterRecords]);

  const deleteRecord = (id: string) => {
    if (confirm("Are you sure you want to delete this GPS record?")) {
      GPSDatabase.deleteRecord(id);
      loadRecords();
    }
  };

  const exportToCSV = () => {
    const csvContent = GPSDatabase.exportToCSV();
    if (csvContent) {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gps-data-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const uniqueProjects = [...new Set(records.map(r => ({ id: r.projectId, name: r.projectName })))];
  const uniqueWorkTypes = [...new Set(records.map(r => r.workType).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="w-8 h-8 text-teal-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GPS Data Records</h1>
              <p className="text-gray-600">View and manage saved GPS data entries</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="text-sm">
              {filteredRecords.length} of {records.length} records
            </Badge>
            <Button onClick={exportToCSV} variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Filter Records</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Search tasks, projects, or descriptions..."
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

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No GPS records found</h3>
              <p className="text-gray-600">
                {records.length === 0
                  ? "Start by creating your first GPS data entry."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{record.taskName}</h3>
                          <p className="text-sm text-gray-600">{record.projectName}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {record.workType && (
                            <Badge variant="outline">{record.workType}</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRecord(record.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* GPS Coordinates */}
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
                          </span>
                        </div>
                        {record.altitude && (
                          <span>Alt: {record.altitude}m</span>
                        )}
                        {record.accuracy && (
                          <span>±{record.accuracy}m</span>
                        )}
                      </div>

                      {/* Description */}
                      {record.description && (
                        <p className="text-sm text-gray-700">{record.description}</p>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center space-x-6 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{record.dateCollected}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{record.collectedBy}</span>
                        </div>
                        {record.attachmentNames.length > 0 && (
                          <span>{record.attachmentNames.length} attachment(s)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
