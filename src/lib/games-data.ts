"use server";

export interface Game {
  id: string;
  title: string;
  image: string;
  isTop?: boolean;
  externalUrl?: string;
}

export interface GameCategory {
  id: string;
  name: string;
  games: Game[];
}

// Mock data based on CrazyGames .io games section
export async function getGamesData(): Promise<GameCategory[]> {
  return [
    {
      id: "top-games",
      name: "Top games",
      games: [
        { 
          id: "chess", 
          title: "Chess", 
          image: "/chess.avif", 
          isTop: true 
        },
        { 
          id: "frontwars", 
          title: "FrontWars.io", 
          image: "/frontwars-io_16x9-cover.avif", 
          isTop: true,
          externalUrl: "https://www.crazygames.com/game/frontwars-io"
        },
        { 
          id: "smash-karts", 
          title: "Smash Karts", 
          image: "/smash-karts_16x9-cover.avif", 
          isTop: true,
          externalUrl: "https://www.crazygames.com/game/smash-karts"
        },
        { 
          id: "ships-3d", 
          title: "Ships 3D", 
          image: "/ship-3d.avif", 
          isTop: false,
          externalUrl: "https://www.crazygames.com/game/ships-3d"
        },
        { 
          id: "simply-up", 
          title: "Simply Up", 
          image: "/simplyup-io_16x9-cover.avif", 
          isTop: false,
          externalUrl: "https://www.crazygames.com/game/simplyup-io"
        },
        { 
          id: "squid-game", 
          title: "Squid Game Online", 
          image: "/squid-game-online_16x9-cover.avif", 
          isTop: true,
          externalUrl: "https://www.crazygames.com/game/squid-game-online"
        },
        { 
          id: "snake-clash", 
          title: "Snake Clash 3D", 
          image: "/snake-clash-io_16x9-cover.avif", 
          isTop: false,
          externalUrl: "https://www.crazygames.com/game/snake-clash-io"
        },
      ],
    },
  ];
}

export async function getTopGames(): Promise<Game[]> {
  const categories = await getGamesData();
  const allGames = categories.flatMap((cat) => cat.games);
  return allGames.filter((game) => game.isTop);
}

