"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  MapPin,
  Plus,
  Settings,
  Trash2,
  TrendingUp,
  Upload,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  location: string;
  province: any;
  district?: string;
  contractor: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  description?: string;
  distance?: number;
}

const mockProjects: Project[] = [
  {
    id: "PNG001",
    name: "Mt. Hagen-Kagamuga Road Upgrade",
    location: "Mt. Hagen to Kagamuga Airport",
    province: { name: "Western Highlands" },
    contractor: "PNG Construction Ltd",
    status: "ACTIVE",
    progress: 65,
    budget: 25000000,
    spent: 16250000,
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    description: "Major highway upgrade connecting Mt. Hagen city to Kagamuga Airport",
    distance: 15.2
  },
  {
    id: "PNG002",
    name: "Port Moresby Ring Road",
    location: "Port Moresby Metropolitan",
    province: { name: "National Capital District" },
    contractor: "Pacific Roads Pty Ltd",
    status: "ACTIVE",
    progress: 45,
    budget: 45000000,
    spent: 20250000,
    startDate: "2024-02-01",
    endDate: "2025-06-30",
    description: "Ring road to ease traffic congestion in Port Moresby",
    distance: 28.5
  },
  {
    id: "PNG003",
    name: "Lae-Nadzab Highway",
    location: "Lae to Nadzab Airport",
    province: { name: "Morobe" },
    contractor: "Highland Construction",
    status: "PLANNING",
    progress: 15,
    budget: 18000000,
    spent: 2700000,
    startDate: "2024-03-01",
    endDate: "2024-11-30",
    description: "Highway connecting Lae city to Nadzab Airport",
    distance: 12.8
  }
];

export default function ProjectTrackingModuleSimple() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0]);
    }
  }, [projects, selectedProject]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-500";
      case "planning":
        return "bg-blue-500";
      case "on_hold":
        return "bg-yellow-500";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 50) return "text-blue-600";
    if (progress >= 25) return "text-yellow-600";
    return "text-red-600";
  };

  const calculateCompletionPercentage = (project: Project) => {
    return Math.round(project.progress || 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PG', {
      style: 'currency',
      currency: 'PGK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project tracking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Project Tracking
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Monitor road construction projects across Papua New Guinea
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {projects.map((project) => (
          <Card
            key={project.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedProject?.id === project.id
                ? "ring-2 ring-blue-500 shadow-md"
                : "hover:ring-1 hover:ring-gray-300"
            }`}
            onClick={() => setSelectedProject(project)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-semibold line-clamp-2">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {project.location} • {typeof project.province === 'object' ? project.province?.name : project.province}
                  </CardDescription>
                </div>
                <Badge
                  className={`text-xs ${getStatusColor(project.status)} text-white`}
                >
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span
                      className={`font-medium ${getProgressColor(calculateCompletionPercentage(project))}`}
                    >
                      {calculateCompletionPercentage(project)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        calculateCompletionPercentage(project) >= 80
                          ? "bg-green-500"
                          : calculateCompletionPercentage(project) >= 50
                          ? "bg-blue-500"
                          : calculateCompletionPercentage(project) >= 25
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${calculateCompletionPercentage(project)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Distance */}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-medium">
                    {project.distance ? `${project.distance} km` : "N/A"}
                  </span>
                </div>

                {/* Budget */}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-medium">
                    {formatCurrency(project.budget)}
                  </span>
                </div>

                {/* Contractor */}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Contractor:</span>
                  <span className="font-medium text-right flex-1 ml-2 line-clamp-1">
                    {project.contractor}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Project Details */}
      {selectedProject && (
        <>
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {selectedProject.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {selectedProject.location} • {
                      typeof selectedProject.province === 'object'
                        ? selectedProject.province?.name
                        : selectedProject.province
                    }
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge
                    className={`${getStatusColor(selectedProject.status)} text-white`}
                  >
                    {selectedProject.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Progress</span>
                    <span className="sm:hidden">%</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {calculateCompletionPercentage(selectedProject)}%
                  </div>
                  <div className="text-xs text-gray-600">
                    Overall completion
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <DollarSign className="h-4 w-4" />
                    <span className="hidden sm:inline">Financial</span>
                    <span className="sm:hidden">Budget</span>
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    {formatCurrency(selectedProject.budget)}
                  </div>
                  <div className="text-xs text-gray-600">
                    Total budget allocated
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Timeline</span>
                    <span className="sm:hidden">Days</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    {calculateDaysRemaining(selectedProject.endDate)}
                  </div>
                  <div className="text-xs text-gray-600">Days remaining</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin className="h-4 w-4" />
                    <span className="hidden sm:inline">Contractor</span>
                    <span className="sm:hidden">Contractor</span>
                  </div>
                  <div className="text-sm sm:text-lg font-bold text-gray-800 line-clamp-2">
                    {selectedProject.contractor}
                  </div>
                  <div className="text-xs text-gray-600">
                    Primary contractor
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <Card>
            <CardContent className="p-0">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="border-b overflow-x-auto">
                  <TabsList className="w-full min-w-max justify-start rounded-none h-12 bg-transparent">
                    <TabsTrigger
                      value="dashboard"
                      className="gap-1 sm:gap-2 px-2 sm:px-4"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Dashboard</span>
                      <span className="sm:hidden text-xs">Home</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="gps-entry"
                      className="gap-1 sm:gap-2 px-2 sm:px-4"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="hidden sm:inline">GPS Data Entry</span>
                      <span className="sm:hidden text-xs">GPS</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="phases"
                      className="gap-1 sm:gap-2 px-2 sm:px-4"
                    >
                      <Calendar className="h-4 w-4" />
                      <span className="hidden sm:inline">Phases & Tasks</span>
                      <span className="sm:hidden text-xs">Tasks</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="maps"
                      className="gap-1 sm:gap-2 px-2 sm:px-4"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="hidden sm:inline">Maps & GPS</span>
                      <span className="sm:hidden text-xs">Maps</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="reports"
                      className="gap-1 sm:gap-2 px-2 sm:px-4"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Reports</span>
                      <span className="sm:hidden text-xs">Reports</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-4 sm:p-6">
                  <TabsContent value="dashboard" className="mt-0">
                    <div className="text-center py-8">
                      <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Project Dashboard
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Comprehensive project analytics and monitoring dashboard
                      </p>
                      <Button>
                        View Dashboard
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="gps-entry" className="mt-0">
                    <div className="text-center py-8">
                      <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        GPS Data Entry
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Enter GPS coordinates and track construction progress
                      </p>
                      <Button>
                        Start GPS Entry
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="phases" className="mt-0">
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Project Phases
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Manage project phases, milestones, and task assignments
                      </p>
                      <Button>
                        Manage Phases
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="maps" className="mt-0">
                    <div className="text-center py-8">
                      <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Maps & GPS Tracking
                      </h3>
                      <p className="text-gray-600 mb-4">
                        View project locations on interactive maps with GPS tracking
                      </p>
                      <Button>
                        View Maps
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="reports" className="mt-0">
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Project Reports
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Generate comprehensive reports and export project data
                      </p>
                      <Button>
                        Generate Reports
                      </Button>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
