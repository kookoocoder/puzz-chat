"use client";

import { useState, useCallback } from "react";
import { Chess } from "chess.js";
import { ChessBoard } from "./chess-board";
import { UnlockDialog } from "./unlock-dialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home } from "lucide-react";

interface ChessClientProps {
  userName: string;
  userImage?: string;
}

const REQUIRED_SEQUENCE = ["e4", "a4", "Nf3"];

// Black's automatic responses
const BLACK_RESPONSES: Record<number, string> = {
  0: "e5",  // Response to e4
  1: "d5",  // Response to a4
  2: "Nc6", // Response to Nf3
};

export function ChessClient({ userName, userImage }: ChessClientProps) {
  const router = useRouter();
  const [game, setGame] = useState(new Chess());
  const [whiteMovesHistory, setWhiteMovesHistory] = useState<string[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const checkUnlock = useCallback((whiteMoves: string[]) => {
    if (whiteMoves.length === REQUIRED_SEQUENCE.length) {
      const matches = whiteMoves.every(
        (move, index) => move === REQUIRED_SEQUENCE[index]
      );
      if (matches) {
        setIsUnlocked(true);
        return true;
      }
    }
    return false;
  }, []);

  const makeBlackMove = useCallback((currentGame: Chess, whiteMoveCount: number) => {
    // Add a small delay to make it feel more natural
    setIsThinking(true);

    setTimeout(() => {
      const gameCopy = new Chess(currentGame.fen());
      
      // Get black's response based on white's move count
      const blackResponse = BLACK_RESPONSES[whiteMoveCount - 1];
      
      if (blackResponse) {
        try {
          // Try to make the predetermined move
          gameCopy.move(blackResponse);
        } catch (error) {
          // If predetermined move fails, make a random legal move
          const moves = gameCopy.moves();
          if (moves.length > 0) {
            const randomIndex = Math.floor(Math.random() * moves.length);
            gameCopy.move(moves[randomIndex]);
          }
        }
      } else {
        // Make a random legal move if no predetermined response
        const moves = gameCopy.moves();
        if (moves.length > 0) {
          const randomIndex = Math.floor(Math.random() * moves.length);
          gameCopy.move(moves[randomIndex]);
        }
      }

      setGame(gameCopy);
      setIsThinking(false);
    }, 500);
  }, []);

  const onDrop = useCallback(
    ({ sourceSquare, targetSquare }: { piece: { isSparePiece: boolean; position: string; pieceType: string }; sourceSquare: string; targetSquare: string | null }): boolean => {
      try {
        // If targetSquare is null, the piece was dropped off the board
        if (!targetSquare) {
          return false;
        }

        // Only allow white to move
        if (game.turn() !== "w") {
          return false;
        }

        // Don't allow moves while black is thinking
        if (isThinking) {
          return false;
        }

        const gameCopy = new Chess(game.fen());
        
        // Try to make the move
        const move = gameCopy.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q", // Always promote to queen for simplicity
        });

        // If move is illegal, return false
        if (move === null) {
          return false;
        }

        // Update game state with white's move
        setGame(gameCopy);
        
        // Track only white's moves for unlock sequence
        const newWhiteHistory = [...whiteMovesHistory, move.san];
        setWhiteMovesHistory(newWhiteHistory);

        // Check if puzzle is unlocked
        if (!checkUnlock(newWhiteHistory)) {
          // Make black's automatic response if game isn't over
          if (!gameCopy.isGameOver()) {
            makeBlackMove(gameCopy, newWhiteHistory.length);
          }
        }

        return true;
      } catch (error) {
        return false;
      }
    },
    [game, whiteMovesHistory, checkUnlock, makeBlackMove, isThinking]
  );

  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setWhiteMovesHistory([]);
    setIsUnlocked(false);
    setIsThinking(false);
  }, []);

  const handleEnterChat = useCallback(() => {
    router.push("/chat");
  }, [router]);

  const handleGoHome = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userImage} alt={userName} />
              <AvatarFallback className="bg-purple-600 text-white">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-white font-semibold">{userName}</h2>
              <p className="text-sm text-gray-400">Chess Puzzle</p>
            </div>
          </div>
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="border-gray-700 hover:bg-gray-800 text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <ChessBoard position={game.fen()} onDrop={onDrop} />
      </div>

      {/* Unlock Dialog */}
      {isUnlocked && <UnlockDialog onEnterChat={handleEnterChat} />}
    </div>
  );
}

