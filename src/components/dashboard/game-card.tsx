"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface GameCardProps {
  title: string;
  image: string;
  isTop?: boolean;
  onClick?: () => void;
}

export function GameCard({ title, image, isTop, onClick }: GameCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card 
      onClick={onClick}
      className="group relative overflow-hidden rounded-lg sm:rounded-xl border-0 bg-gray-900 hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer touch-manipulation active:scale-95"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* Game Thumbnail Image */}
        <div className="relative w-full h-full">
          {!imageError ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110 group-active:scale-105"
              priority={isTop}
              onError={(e) => {
                console.error("Image failed to load:", image);
                setImageError(true);
              }}
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-active:scale-105">
              <span className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-xl text-center line-clamp-2 px-4">
                {title}
              </span>
            </div>
          )}
        </div>

        {/* Top Badge */}
        {isTop && (
          <Badge className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold flex items-center gap-1 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 z-10">
            <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
            <span className="hidden xs:inline">Top</span>
          </Badge>
        )}

        {/* Overlay on hover/active */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 group-active:bg-black/30 transition-colors" />
      </div>

      {/* Game Title */}
      <div className="p-2 sm:p-2.5 md:p-3">
        <h3 className="text-white font-semibold text-xs sm:text-sm truncate">{title}</h3>
      </div>
    </Card>
  );
}

