"use client";

import { Search, Menu, User, Bell, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  userName?: string;
  userImage?: string;
  onMenuClick?: () => void;
  onSignOut?: () => void;
}

export function Header({ userName, userImage, onMenuClick, onSignOut }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#1a1d2e] border-gray-800">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Logo and Menu Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="text-white hover:bg-gray-800"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 rounded-lg p-2 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CG</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg leading-none">crazy</span>
              <span className="text-white font-bold text-lg leading-none">games</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search"
            className="w-full pl-10 bg-[#2a2d3e] border-gray-700 text-white placeholder:text-gray-400 focus-visible:ring-purple-500"
          />
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <User className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <Heart className="h-5 w-5" />
          </Button>

          {/* User Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                    {userName?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#2a2d3e] border-gray-700" align="end">
              <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                onClick={onSignOut}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

