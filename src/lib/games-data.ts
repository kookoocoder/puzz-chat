"use server";

export interface Game {
  id: string;
  title: string;
  image: string;
  isTop?: boolean;
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
        { id: "1", title: "bloxd.io", image: "/api/placeholder/300/200?text=bloxd.io", isTop: false },
        { id: "2", title: "Crash Karts", image: "/api/placeholder/300/200?text=CrashKarts", isTop: false },
        { id: "3", title: "FrontWars", image: "/api/placeholder/300/200?text=FrontWars", isTop: true },
        { id: "4", title: "Bowden.io", image: "/api/placeholder/300/200?text=Bowden.io", isTop: true },
        { id: "5", title: "Wings.io", image: "/api/placeholder/300/200?text=Wings.io", isTop: false },
        { id: "6", title: "Shell Shockers", image: "/api/placeholder/300/200?text=ShellShockers", isTop: true },
        { id: "7", title: "MINIBLOX", image: "/api/placeholder/300/200?text=MINIBLOX", isTop: false },
        { id: "8", title: "Poxel.io", image: "/api/placeholder/300/200?text=Poxel.io", isTop: false },
        { id: "9", title: "Paper 2", image: "/api/placeholder/300/200?text=Paper2", isTop: false },
        { id: "10", title: "Kour.io", image: "/api/placeholder/300/200?text=Kour.io", isTop: false },
        { id: "11", title: "Ships 3D", image: "/api/placeholder/300/200?text=Ships3D", isTop: false },
        { id: "12", title: "Cube Realm.io", image: "/api/placeholder/300/200?text=CubeRealm.io", isTop: false },
        { id: "13", title: "Taming.io", image: "/api/placeholder/300/200?text=Taming.io", isTop: false },
        { id: "14", title: "Simply Up", image: "/api/placeholder/300/200?text=SimplyUp", isTop: false },
        { id: "15", title: "Tanks 3D", image: "/api/placeholder/300/200?text=Tanks3D", isTop: false },
        { id: "16", title: "Gulper.io", image: "/api/placeholder/300/200?text=Gulper.io", isTop: false },
        { id: "17", title: "Kiomet", image: "/api/placeholder/300/200?text=Kiomet", isTop: false },
        { id: "18", title: "Cowz.io", image: "/api/placeholder/300/200?text=Cowz.io", isTop: false },
        { id: "19", title: "mk48.io", image: "/api/placeholder/300/200?text=mk48.io", isTop: false },
        { id: "20", title: "Wormate.io", image: "/api/placeholder/300/200?text=Wormate.io", isTop: false },
        { id: "21", title: "Turnfight", image: "/api/placeholder/300/200?text=Turnfight", isTop: false },
        { id: "22", title: "Pixel Warfare", image: "/api/placeholder/300/200?text=PixelWarfare", isTop: false },
        { id: "23", title: "Snake.io", image: "/api/placeholder/300/200?text=Snake.io", isTop: false },
        { id: "24", title: "EvoWorld.io", image: "/api/placeholder/300/200?text=EvoWorld.io", isTop: false },
      ],
    },
  ];
}

export async function getTopGames(): Promise<Game[]> {
  const categories = await getGamesData();
  const allGames = categories.flatMap((cat) => cat.games);
  return allGames.filter((game) => game.isTop);
}

