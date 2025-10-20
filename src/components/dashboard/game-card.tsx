"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import Image from "next/image";

interface GameCardProps {
  title: string;
  image: string;
  isTop?: boolean;
  onClick?: () => void;
}

export function GameCard({ title, image, isTop, onClick }: GameCardProps) {
  return (
    <Card 
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border-0 bg-gray-900 hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* Using div with background image as fallback for placeholder URLs */}
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
          style={{
            backgroundImage: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          }}
        >
          {/* Placeholder overlay with game title */}
          <div className="flex items-center justify-center h-full">
            <span className="text-white font-bold text-xl opacity-70">{title}</span>
          </div>
        </div>

        {/* Top Badge */}
        {isTop && (
          <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            Top
          </Badge>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      </div>

      {/* Game Title */}
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate">{title}</h3>
      </div>
    </Card>
  );
}

