"use client";

import { useState } from "react";
import { ChevronDown, MapPin, Smartphone, Map, Truck, Eye, CheckCircle, Database } from "lucide-react";

const navigationItems = [
  {
    id: "connect",
    title: "Connect PNG Program Overview",
    icon: "🔗",
    hasDropdown: false
  },
  {
    id: "entity",
    title: "Entity & Stakeholder Management",
    icon: "👥",
    hasDropdown: false
  },
  {
    id: "project",
    title: "Project Lifecycle Management",
    icon: "📋",
    hasDropdown: false
  },
  {
    id: "field",
    title: "Field Operations",
    icon: "🏗️",
    hasDropdown: true,
    isActive: true,
    dropdownItems: [
      {
        id: "gps-entry",
        title: "GPS Data Entry",
        icon: MapPin,
        isActive: true,
        color: "bg-red-600"
      },
      {
        id: "data-viewer",
        title: "View GPS Records",
        icon: Database,
        isActive: false,
        color: "bg-blue-600"
      },
      {
        id: "map-view",
        title: "GPS Points Map",
        icon: Map,
        isActive: false,
        color: "bg-purple-600"
      },
      {
        id: "mobile-collector",
        title: "Mobile GPS Collector",
        icon: Smartphone,
        isActive: false
      },
      {
        id: "road-mapping",
        title: "Road Progress Mapping",
        icon: Map,
        isActive: false
      },
      {
        id: "equipment",
        title: "Equipment Tracking",
        icon: Truck,
        isActive: false
      },
      {
        id: "site-monitoring",
        title: "Site Monitoring",
        icon: Eye,
        isActive: false
      },
      {
        id: "quality",
        title: "Quality Assurance",
        icon: CheckCircle,
        isActive: false
      }
    ]
  },
  {
    id: "financial",
    title: "Financial Management & Reporting",
    icon: "💰",
    hasDropdown: false
  },
  {
    id: "compliance",
    title: "Compliance & Safeguards",
    icon: "🛡️",
    hasDropdown: false
  },
  {
    id: "information",
    title: "Information Sharing & Collaboration",
    icon: "📊",
    hasDropdown: false
  }
];

interface NavigationProps {
  onNavigate: (viewId: string) => void;
  currentView: string;
}

export function Navigation({ onNavigate, currentView }: NavigationProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>("field");

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleDropdownItemClick = (itemId: string) => {
    onNavigate(itemId);
    setOpenDropdown(null);
  };

  return (
    <nav className="bg-gray-50 border-b border-gray-200">
      <div className="px-6">
        <div className="flex items-center space-x-8 overflow-x-auto">
          {navigationItems.map((item) => (
            <div key={item.id} className="relative">
              {/* Main navigation item */}
              <button
                className={`flex items-center space-x-2 py-4 px-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  item.isActive
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-700 hover:text-gray-900"
                }`}
                onClick={() => item.hasDropdown && toggleDropdown(item.id)}
              >
                <span>{item.icon}</span>
                <span>{item.title}</span>
                {item.hasDropdown && (
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openDropdown === item.id ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {/* Dropdown menu */}
              {item.hasDropdown && openDropdown === item.id && item.dropdownItems && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-64 z-50">
                  {item.dropdownItems.map((dropdownItem) => {
                    const Icon = dropdownItem.icon;
                    return (
                      <button
                        key={dropdownItem.id}
                        onClick={() => handleDropdownItemClick(dropdownItem.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                          currentView === dropdownItem.id
                            ? dropdownItem.color + " text-white hover:opacity-90"
                            : ""
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{dropdownItem.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
