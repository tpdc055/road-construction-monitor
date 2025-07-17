"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, CheckCircle, AlertCircle, Download, X } from "lucide-react";
import Papa, { ParseResult } from 'papaparse';
import { GPSDatabase } from "@/lib/database";

interface ImportRow {
  projectName: string;
  taskName: string;
  latitude: string;
  longitude: string;
  altitude?: string;
  accuracy?: string;
  workType?: string;
  description?: string;
  dateCollected?: string;
  collectedBy?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const projects = [
  { id: "proj-001", name: "Highway 1 Rehabilitation - Section A" },
  { id: "proj-002", name: "Coastal Road Extension" },
  { id: "proj-003", name: "Mountain Pass Construction" },
  { id: "proj-004", name: "Bridge Replacement Project" },
  { id: "proj-005", name: "Urban Road Improvement" }
];

export function BulkImport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ImportRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const [importStats, setImportStats] = useState({ success: 0, errors: 0 });
  const [defaultProject, setDefaultProject] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportComplete(false);
      setImportStats({ success: 0, errors: 0 });
      parseFile(file);
    }
  };

  const parseFile = (file: File) => {
    setIsProcessing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<ImportRow>) => {
        const data = results.data as ImportRow[];
        setParsedData(data);
        validateData(data);
        setIsProcessing(false);
      },
      error: (error: Error) => {
        console.error('Error parsing file:', error);
        setValidationErrors([{ row: 0, field: 'file', message: 'Failed to parse file. Please ensure it\'s a valid CSV.' }]);
        setIsProcessing(false);
      }
    });
  };

  const validateData = (data: ImportRow[]) => {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 1;

      // Required fields validation
      if (!row.taskName?.trim()) {
        errors.push({ row: rowNum, field: 'taskName', message: 'Task name is required' });
      }

      if (!row.latitude?.trim()) {
        errors.push({ row: rowNum, field: 'latitude', message: 'Latitude is required' });
      } else if (isNaN(parseFloat(row.latitude))) {
        errors.push({ row: rowNum, field: 'latitude', message: 'Latitude must be a valid number' });
      }

      if (!row.longitude?.trim()) {
        errors.push({ row: rowNum, field: 'longitude', message: 'Longitude is required' });
      } else if (isNaN(parseFloat(row.longitude))) {
        errors.push({ row: rowNum, field: 'longitude', message: 'Longitude must be a valid number' });
      }

      // Optional field validation
      if (row.altitude && isNaN(parseFloat(row.altitude))) {
        errors.push({ row: rowNum, field: 'altitude', message: 'Altitude must be a valid number' });
      }

      if (row.accuracy && isNaN(parseFloat(row.accuracy))) {
        errors.push({ row: rowNum, field: 'accuracy', message: 'Accuracy must be a valid number' });
      }

      // GPS bounds validation for Papua New Guinea
      const lat = parseFloat(row.latitude);
      const lng = parseFloat(row.longitude);
      if (!isNaN(lat) && (lat < -12 || lat > -1)) {
        errors.push({ row: rowNum, field: 'latitude', message: 'Latitude appears to be outside Papua New Guinea' });
      }
      if (!isNaN(lng) && (lng < 140 || lng > 160)) {
        errors.push({ row: rowNum, field: 'longitude', message: 'Longitude appears to be outside Papua New Guinea' });
      }
    });

    setValidationErrors(errors);
  };

  const processImport = async () => {
    if (!defaultProject) {
      alert('Please select a default project for the import.');
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    const selectedProjectData = projects.find(p => p.id === defaultProject);

    for (const row of parsedData) {
      try {
        // Skip rows with validation errors
        const rowIndex = parsedData.indexOf(row) + 1;
        const hasErrors = validationErrors.some(error => error.row === rowIndex);

        if (hasErrors) {
          errorCount++;
          continue;
        }

        const recordToSave = {
          projectId: defaultProject,
          projectName: selectedProjectData?.name || "Imported Project",
          taskName: row.taskName,
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
          altitude: row.altitude ? parseFloat(row.altitude) : null,
          accuracy: row.accuracy ? parseFloat(row.accuracy) : null,
          description: row.description || "",
          workType: row.workType || "",
          dateCollected: row.dateCollected || new Date().toISOString().split('T')[0],
          collectedBy: row.collectedBy || "Bulk Import",
          attachmentNames: []
        };

        await GPSDatabase.saveRecord(recordToSave);
        successCount++;
      } catch (error) {
        console.error('Error saving record:', error);
        errorCount++;
      }
    }

    setImportStats({ success: successCount, errors: errorCount });
    setImportComplete(true);
    setIsProcessing(false);
  };

  const downloadTemplate = () => {
    const template = [
      {
        projectName: 'Highway 1 Rehabilitation - Section A',
        taskName: 'Road Survey Point 1',
        latitude: '-6.314993',
        longitude: '143.955555',
        altitude: '1200',
        accuracy: '3.5',
        workType: 'Survey Marking',
        description: 'Initial survey point for highway section',
        dateCollected: '2025-07-17',
        collectedBy: 'Survey Team'
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gps-import-template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const clearImport = () => {
    setSelectedFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setImportComplete(false);
    setImportStats({ success: 0, errors: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Bulk Import GPS Data</span>
        </CardTitle>
        <CardDescription>
          Import GPS coordinates from CSV files. Download the template to see the required format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Template Download */}
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div>
            <h4 className="font-medium text-blue-900">Need the import format?</h4>
            <p className="text-sm text-blue-700">Download our CSV template with sample data</p>
          </div>
          <Button onClick={downloadTemplate} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>

        {/* File Upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!selectedFile ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h3>
                <p className="text-gray-600">Click to select your GPS data CSV file</p>
              </div>
            </button>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-teal-600" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <Button onClick={clearImport} variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Project Selection */}
        {selectedFile && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Project (for imported records)
            </label>
            <Select value={defaultProject} onValueChange={setDefaultProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select project for imported data" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Validation Results */}
        {parsedData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">
                Data Preview ({parsedData.length} records)
              </h4>
              <div className="flex space-x-2">
                <Badge variant={validationErrors.length === 0 ? "default" : "destructive"}>
                  {validationErrors.length === 0 ? "Valid" : `${validationErrors.length} errors`}
                </Badge>
              </div>
            </div>

            {validationErrors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h5 className="font-medium text-red-900">Validation Errors</h5>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700">
                      Row {error.row}, {error.field}: {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-60">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-900">Task Name</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-900">Latitude</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-900">Longitude</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-900">Work Type</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 10).map((row, index) => {
                      const rowNum = index + 1;
                      const hasErrors = validationErrors.some(error => error.row === rowNum);

                      return (
                        <tr key={index} className={hasErrors ? "bg-red-50" : "bg-white"}>
                          <td className="px-3 py-2 text-gray-900">{row.taskName}</td>
                          <td className="px-3 py-2 text-gray-600">{row.latitude}</td>
                          <td className="px-3 py-2 text-gray-600">{row.longitude}</td>
                          <td className="px-3 py-2 text-gray-600">{row.workType || "—"}</td>
                          <td className="px-3 py-2">
                            {hasErrors ? (
                              <Badge variant="destructive" className="text-xs">Error</Badge>
                            ) : (
                              <Badge variant="default" className="text-xs">Valid</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 10 && (
                <div className="px-3 py-2 bg-gray-50 text-sm text-gray-600 text-center">
                  ... and {parsedData.length - 10} more records
                </div>
              )}
            </div>
          </div>
        )}

        {/* Import Button */}
        {parsedData.length > 0 && defaultProject && (
          <div className="flex justify-end space-x-4">
            {importComplete && (
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span>Import completed: {importStats.success} success, {importStats.errors} errors</span>
              </div>
            )}
            <Button
              onClick={processImport}
              disabled={isProcessing || validationErrors.length > 0 || importComplete}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : importComplete ? (
                "Import Complete"
              ) : (
                `Import ${parsedData.length} Records`
              )}
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
