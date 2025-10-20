"use client";

import { useState } from "react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

      <Sidebar isOpen={isSidebarOpen} />

      <main
        className={`transition-all duration-300 pt-4 ${
          isSidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        <div className="px-6 pb-8">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg p-4 mb-6">
            <p className="text-gray-300 text-sm">
              Lock horns and battle other players in all the latest .io games. Enjoy original titles like Slither.io and new .io games such as Rocket Bot Royale, Pixel Warfare, Shell Shockers, and Smash Karts.{" "}
              <button className="text-purple-400 hover:text-purple-300 font-medium">
                Show More
              </button>
            </p>
          </div>

          {/* Category Selector */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Top games</h2>
            <Select defaultValue="top-games">
              <SelectTrigger className="w-[180px] bg-[#1a1d2e] border-gray-700 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1d2e] border-gray-700">
                <SelectItem value="top-games" className="text-white">
                  Top games
                </SelectItem>
                <SelectItem value="new-games" className="text-white">
                  New games
                </SelectItem>
                <SelectItem value="trending" className="text-white">
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

