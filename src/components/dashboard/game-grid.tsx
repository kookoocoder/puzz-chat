"use client";

import { GameCard } from "./game-card";
import { Game } from "@/lib/games-data";

interface GameGridProps {
  games: Game[];
}

export function GameGrid({ games }: GameGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {games.map((game) => (
        <GameCard
          key={game.id}
          title={game.title}
          image={game.image}
          isTop={game.isTop}
        />
      ))}
    </div>
  );
}

