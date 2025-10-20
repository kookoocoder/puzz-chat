"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Handshake, RotateCcw } from "lucide-react";

interface GameOverDialogProps {
  result: "checkmate" | "stalemate" | "draw" | "threefold" | "insufficient";
  winner?: "White" | "Black";
  onRestart: () => void;
}

export function GameOverDialog({ result, winner, onRestart }: GameOverDialogProps) {
  const getResultMessage = () => {
    switch (result) {
      case "checkmate":
        return {
          icon: <Trophy className="w-20 h-20 text-yellow-500" />,
          title: "Checkmate!",
          message: `${winner} wins the game!`,
          color: "border-yellow-500",
        };
      case "stalemate":
        return {
          icon: <Handshake className="w-20 h-20 text-gray-400" />,
          title: "Stalemate",
          message: "The game is drawn.",
          color: "border-gray-500",
        };
      case "draw":
        return {
          icon: <Handshake className="w-20 h-20 text-gray-400" />,
          title: "Draw",
          message: "The game ended in a draw.",
          color: "border-gray-500",
        };
      case "threefold":
        return {
          icon: <Handshake className="w-20 h-20 text-gray-400" />,
          title: "Draw by Repetition",
          message: "The same position occurred three times.",
          color: "border-gray-500",
        };
      case "insufficient":
        return {
          icon: <Handshake className="w-20 h-20 text-gray-400" />,
          title: "Draw",
          message: "Insufficient material to checkmate.",
          color: "border-gray-500",
        };
      default:
        return {
          icon: <Handshake className="w-20 h-20 text-gray-400" />,
          title: "Game Over",
          message: "The game has ended.",
          color: "border-gray-500",
        };
    }
  };

  const resultInfo = getResultMessage();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className={`max-w-md w-full bg-gray-900 border-2 ${resultInfo.color} p-8 text-center`}>
        <div className="flex flex-col items-center gap-6">
          {resultInfo.icon}
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {resultInfo.title}
            </h2>
            <p className="text-gray-300 text-lg">
              {resultInfo.message}
            </p>
          </div>
          <Button
            onClick={onRestart}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 text-lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Restart Game
          </Button>
        </div>
      </Card>
    </div>
  );
}

