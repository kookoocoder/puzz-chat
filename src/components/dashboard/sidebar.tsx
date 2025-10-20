"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  Clock,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Users,
  Gamepad2,
  Flame,
  Zap,
  Sword,
  Target,
  Car,
  Puzzle,
  Crown,
  ShoppingCart,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("home");

  const navigationItems: SidebarItem[] = [
    { id: "home", label: "Home", icon: <Home className="h-5 w-5" /> },
    { id: "new", label: "New", icon: <Sparkles className="h-5 w-5" /> },
    { id: "trending", label: "Trending", icon: <TrendingUp className="h-5 w-5" /> },
    { id: "updated", label: "Updated", icon: <RefreshCw className="h-5 w-5" /> },
    { id: "originals", label: "Originals", icon: <Crown className="h-5 w-5" /> },
    { id: "multiplayer", label: "Multiplayer", icon: <Users className="h-5 w-5" /> },
  ];

  const categoryItems: SidebarItem[] = [
    { id: "action", label: "Action", icon: <Sword className="h-5 w-5" /> },
    { id: "adventure", label: "Adventure", icon: <Target className="h-5 w-5" /> },
    { id: "shooting", label: "Shooting", icon: <Zap className="h-5 w-5" /> },
    { id: "racing", label: "Racing", icon: <Car className="h-5 w-5" /> },
    { id: "puzzle", label: "Puzzle", icon: <Puzzle className="h-5 w-5" /> },
    { id: "sports", label: "Sports", icon: <Gamepad2 className="h-5 w-5" /> },
    { id: "casual", label: "Casual", icon: <Flame className="h-5 w-5" /> },
    { id: "strategy", label: "Strategy", icon: <Crown className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-14 md:top-16 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] bg-[#1a1d2e] border-r border-gray-800 transition-all duration-300 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent z-50",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "w-64 md:w-60"
        )}
      >
        <div className="p-3 md:p-4 space-y-4 md:space-y-6">
          {/* Mobile Close Button */}
          <div className="flex justify-end lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800 h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Navigation */}
          <div>
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveItem(item.id);
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 1024) {
                      onClose?.();
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors touch-manipulation active:scale-95",
                    activeItem === item.id
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
              Categories
            </h3>
            <nav className="space-y-1">
              {categoryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveItem(item.id);
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 1024) {
                      onClose?.();
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors touch-manipulation active:scale-95",
                    activeItem === item.id
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}

