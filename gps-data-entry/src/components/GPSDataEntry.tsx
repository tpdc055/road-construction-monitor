"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Save, Upload, FileText, CheckCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { GPSDatabase } from "@/lib/database";
import { GPSCapture } from "./GPSCapture";
import { PhotoCapture } from "./PhotoCapture";
import { BulkImport } from "./BulkImport";

interface GPSData {
  projectId: string;
  taskName: string;
  latitude: string;
  longitude: string;
  altitude: string;
  accuracy: string;
  description: string;
  workType: string;
  dateCollected: string;
  collectedBy: string;
  attachments: File[];
}

const projects = [
  { id: "proj-001", name: "Highway 1 Rehabilitation - Section A", location: "Morobe Province" },
  { id: "proj-002", name: "Coastal Road Extension", location: "Central Province" },
  { id: "proj-003", name: "Mountain Pass Construction", location: "Western Highlands" },
  { id: "proj-004", name: "Bridge Replacement Project", location: "Gulf Province" },
  { id: "proj-005", name: "Urban Road Improvement", location: "National Capital District" }
];

const workTypes = [
  "Excavation",
  "Grading",
  "Asphalt Laying",
  "Bridge Construction",
  "Drainage Installation",
  "Survey Marking",
  "Quality Control Check",
  "Environmental Monitoring"
];

export function GPSDataEntry() {
  const [formData, setFormData] = useState<GPSData>({
    projectId: "",
    taskName: "",
    latitude: "",
    longitude: "",
    altitude: "",
    accuracy: "",
    description: "",
    workType: "",
    dateCollected: new Date().toISOString().split('T')[0],
    collectedBy: "Demo Administrator",
    attachments: []
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const handleInputChange = (field: keyof GPSData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(files)]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleGPSCapture = (position: { latitude: number; longitude: number; altitude: number | null; accuracy: number }) => {
    setFormData(prev => ({
      ...prev,
      latitude: position.latitude.toString(),
      longitude: position.longitude.toString(),
      altitude: position.altitude ? position.altitude.toString() : "",
      accuracy: position.accuracy.toString()
    }));
  };

  const handlePhotosChange = (photos: File[]) => {
    // Replace all image files with the new ones from photo capture
    const nonImageFiles = formData.attachments.filter(file => !file.type.startsWith('image/'));
    setFormData(prev => ({
      ...prev,
      attachments: [...nonImageFiles, ...photos]
    }));
  };

  const saveToDatabase = async () => {
    setIsSaving(true);
    try {
      const selectedProject = projects.find(p => p.id === formData.projectId);

      const recordToSave = {
        projectId: formData.projectId,
        projectName: selectedProject?.name || "Unknown Project",
        taskName: formData.taskName,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        altitude: formData.altitude ? parseFloat(formData.altitude) : null,
        accuracy: formData.accuracy ? parseFloat(formData.accuracy) : null,
        description: formData.description,
        workType: formData.workType,
        dateCollected: formData.dateCollected,
        collectedBy: formData.collectedBy,
        attachmentNames: formData.attachments.map(file => file.name)
      };

      const savedRecord = await GPSDatabase.saveRecord(recordToSave);
      console.log("GPS data saved successfully:", savedRecord);

      setSavedSuccessfully(true);
      setTimeout(() => setSavedSuccessfully(false), 3000);

      // Reset form after successful save
      setFormData({
        projectId: "",
        taskName: "",
        latitude: "",
        longitude: "",
        altitude: "",
        accuracy: "",
        description: "",
        workType: "",
        dateCollected: new Date().toISOString().split('T')[0],
        collectedBy: "Demo Administrator",
        attachments: []
      });

    } catch (error) {
      console.error("Error saving GPS data:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = formData.projectId && formData.taskName && formData.latitude && formData.longitude;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="w-8 h-8 text-teal-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">GPS Data Entry</h1>
              <p className="text-gray-600">Enter GPS coordinates for PNG road construction work tasks</p>
            </div>
          </div>
          <Button
            onClick={() => setShowBulkImport(!showBulkImport)}
            variant={showBulkImport ? "default" : "outline"}
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>{showBulkImport ? "Single Entry" : "Bulk Import"}</span>
          </Button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Bulk Import */}
        {showBulkImport && (
          <BulkImport />
        )}

        {/* Single Entry Form */}
        {!showBulkImport && (
          <>
        {/* Project Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Select Project</span>
            </CardTitle>
            <CardDescription>
              Choose the project for this GPS data entry session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project">Project *</Label>
                <Select value={formData.projectId} onValueChange={(value) => handleInputChange("projectId", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-gray-500">{project.location}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Task Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taskName">Task Name *</Label>
                <Input
                  id="taskName"
                  value={formData.taskName}
                  onChange={(e) => handleInputChange("taskName", e.target.value)}
                  placeholder="Enter task name"
                />
              </div>
              <div>
                <Label htmlFor="workType">Work Type</Label>
                <Select value={formData.workType} onValueChange={(value) => handleInputChange("workType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work type" />
                  </SelectTrigger>
                  <SelectContent>
                    {workTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* GPS Location Capture */}
            <GPSCapture
              onLocationCapture={handleGPSCapture}
              disabled={isSaving}
            />

            {/* GPS Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange("latitude", e.target.value)}
                  placeholder="-6.314993"
                  type="number"
                  step="any"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange("longitude", e.target.value)}
                  placeholder="143.955555"
                  type="number"
                  step="any"
                />
              </div>
              <div>
                <Label htmlFor="altitude">Altitude (m)</Label>
                <Input
                  id="altitude"
                  value={formData.altitude}
                  onChange={(e) => handleInputChange("altitude", e.target.value)}
                  placeholder="1200"
                  type="number"
                />
              </div>
              <div>
                <Label htmlFor="accuracy">Accuracy (m)</Label>
                <Input
                  id="accuracy"
                  value={formData.accuracy}
                  onChange={(e) => handleInputChange("accuracy", e.target.value)}
                  placeholder="3.5"
                  type="number"
                  step="any"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter task description, notes, or observations"
                rows={3}
              />
            </div>

            {/* Collection Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateCollected">Date Collected</Label>
                <Input
                  id="dateCollected"
                  type="date"
                  value={formData.dateCollected}
                  onChange={(e) => handleInputChange("dateCollected", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="collectedBy">Collected By</Label>
                <Input
                  id="collectedBy"
                  value={formData.collectedBy}
                  onChange={(e) => handleInputChange("collectedBy", e.target.value)}
                />
              </div>
            </div>

            {/* Photo Capture */}
            <PhotoCapture
              onPhotosChange={handlePhotosChange}
              maxPhotos={5}
              disabled={isSaving}
            />

            {/* Additional File Attachments */}
            <div>
              <Label htmlFor="attachments">Additional Documents</Label>
              <div className="mt-2">
                <input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('attachments')?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>

                {formData.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-4 pt-4">
              {savedSuccessfully && (
                <Badge className="bg-green-100 text-green-800">
                  Data saved successfully!
                </Badge>
              )}
              <Button
                onClick={saveToDatabase}
                disabled={!isFormValid || isSaving}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save to Database"}
              </Button>
            </div>
          </CardContent>
        </Card>
          </>
        )}
      </div>
    </div>
  );
}
