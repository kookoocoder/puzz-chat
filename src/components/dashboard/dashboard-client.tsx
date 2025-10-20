"use client";

import { useState, useEffect } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { GameGrid } from "./game-grid";
import { Game } from "@/lib/games-data";
import { signOutAction } from "@/app/dashboard/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardClientProps {
  userName: string;
  userEmail: string;
  userImage?: string;
  games: Game[];
}

export function DashboardClient({
  userName,
  userEmail,
  userImage,
  games,
}: DashboardClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      // Auto-close sidebar on mobile
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSignOut = async () => {
    await signOutAction();
  };

  return (
    <div className="min-h-screen bg-[#0f1119]">
      <Header
        userName={userName}
        userImage={userImage}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onSignOut={handleSignOut}
      />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="transition-all duration-300 pt-3 md:pt-4">
        <div className="px-3 sm:px-4 md:px-6 pb-6 md:pb-8 max-w-7xl mx-auto">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Lock horns and battle other players in all the latest .io games. Enjoy original titles like Slither.io and new .io games such as Rocket Bot Royale, Pixel Warfare, Shell Shockers, and Smash Karts.{" "}
              <button className="text-purple-400 hover:text-purple-300 font-medium inline-block mt-1 sm:mt-0">
                Show More
              </button>
            </p>
          </div>

          {/* Category Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white">Top games</h2>
            <Select defaultValue="top-games">
              <SelectTrigger className="w-full sm:w-[180px] h-10 bg-[#1a1d2e] border-gray-700 text-white text-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1d2e] border-gray-700">
                <SelectItem value="top-games" className="text-white text-sm">
                  Top games
                </SelectItem>
                <SelectItem value="new-games" className="text-white text-sm">
                  New games
                </SelectItem>
                <SelectItem value="trending" className="text-white text-sm">
                  Trending
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Games Grid */}
          <GameGrid games={games} />
        </div>
      </main>
    </div>
  );
}

