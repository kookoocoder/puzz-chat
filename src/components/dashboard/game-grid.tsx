"use client";

import { GameCard } from "./game-card";
import { Game } from "@/lib/games-data";
import { useRouter } from "next/navigation";

interface GameGridProps {
  games: Game[];
}

export function GameGrid({ games }: GameGridProps) {
  const router = useRouter();

  const handleGameClick = (game: Game) => {
    if (game.id === "chess") {
      router.push("/chess");
    } else if (game.externalUrl) {
      window.open(game.externalUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-3 md:gap-4">
      {games.map((game) => (
        <GameCard
          key={game.id}
          title={game.title}
          image={game.image}
          isTop={game.isTop}
          onClick={() => handleGameClick(game)}
        />
      ))}
    </div>
  );
}

