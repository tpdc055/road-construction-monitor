"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section - Logo and title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              PNG Road Construction Monitor
            </h1>
            <p className="text-sm text-gray-600">
              Papua New Guinea Department of Works
            </p>
          </div>
        </div>

        {/* Right section - User controls */}
        <div className="flex items-center space-x-4">
          {/* Demo Role Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Demo Role:</span>
            <Select defaultValue="administrator">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administrator">Administrator</SelectItem>
                <SelectItem value="manager">Project Manager</SelectItem>
                <SelectItem value="field-worker">Field Worker</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language Badge */}
          <Badge variant="destructive" className="bg-red-600">
            EN
          </Badge>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8 bg-teal-600">
              <AvatarFallback className="bg-teal-600 text-white text-sm">
                D
              </AvatarFallback>
            </Avatar>
            <div className="text-right">
              <div className="text-sm text-gray-600">Welcome, Demo Administrator</div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-yellow-500 text-black text-xs">ADMIN</Badge>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <Button
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-50"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
