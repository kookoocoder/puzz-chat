"use client";

import { useState, useCallback } from "react";
import { Chess } from "chess.js";
import { ChessBoard } from "./chess-board";
import { UnlockDialog } from "./unlock-dialog";
import { GameOverDialog } from "./game-over-dialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, RotateCcw } from "lucide-react";
import { markChessCompleted } from "@/app/chess/actions";
import { toast } from "sonner";

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

type GameOverState = {
  isOver: boolean;
  result?: "checkmate" | "stalemate" | "draw" | "threefold" | "insufficient";
  winner?: "White" | "Black";
};

export function ChessClient({ userName, userImage }: ChessClientProps) {
  const router = useRouter();
  const [game, setGame] = useState(new Chess());
  const [whiteMovesHistory, setWhiteMovesHistory] = useState<string[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [gameOverState, setGameOverState] = useState<GameOverState>({ isOver: false });

  const checkUnlock = useCallback(async (whiteMoves: string[]) => {
    if (whiteMoves.length === REQUIRED_SEQUENCE.length) {
      const matches = whiteMoves.every(
        (move, index) => move === REQUIRED_SEQUENCE[index]
      );
      if (matches) {
        setIsUnlocked(true);
        
        // Mark chess as completed in the database
        const result = await markChessCompleted();
        if (!result.success) {
          toast.error("Failed to save progress");
        }
        
        return true;
      }
    }
    return false;
  }, []);

  const checkGameOver = useCallback((currentGame: Chess) => {
    // Check for checkmate
    if (currentGame.isCheckmate()) {
      const winner = currentGame.turn() === "w" ? "Black" : "White";
      setGameOverState({
        isOver: true,
        result: "checkmate",
        winner,
      });
      return true;
    }

    // Check for stalemate
    if (currentGame.isStalemate()) {
      setGameOverState({
        isOver: true,
        result: "stalemate",
      });
      return true;
    }

    // Check for threefold repetition
    if (currentGame.isThreefoldRepetition()) {
      setGameOverState({
        isOver: true,
        result: "threefold",
      });
      return true;
    }

    // Check for insufficient material
    if (currentGame.isInsufficientMaterial()) {
      setGameOverState({
        isOver: true,
        result: "insufficient",
      });
      return true;
    }

    // Check for draw (50-move rule or other draw conditions)
    if (currentGame.isDraw()) {
      setGameOverState({
        isOver: true,
        result: "draw",
      });
      return true;
    }

    // Game is still ongoing
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
      checkGameOver(gameCopy);
    }, 500);
  }, [checkGameOver]);

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

        // Check if game is over after white's move
        const isGameOver = checkGameOver(gameCopy);
        
        // Check if puzzle is unlocked (async operation)
        checkUnlock(newWhiteHistory).then((unlocked) => {
          if (!unlocked) {
            // Make black's automatic response if game isn't over
            if (!isGameOver && !gameCopy.isGameOver()) {
              makeBlackMove(gameCopy, newWhiteHistory.length);
            }
          }
        });

        return true;
      } catch (error) {
        return false;
      }
    },
    [game, whiteMovesHistory, checkUnlock, makeBlackMove, isThinking, checkGameOver]
  );

  const resetGame = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setWhiteMovesHistory([]);
    setIsUnlocked(false);
    setIsThinking(false);
    setGameOverState({ isOver: false });
  }, []);

  const handleEnterChat = useCallback(() => {
    router.push("/chat");
  }, [router]);

  const handleGoHome = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-800 px-3 sm:px-4 py-2.5 sm:py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
              <AvatarImage src={userImage} alt={userName} />
              <AvatarFallback className="bg-purple-600 text-white text-sm">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="text-white font-semibold text-sm sm:text-base truncate">{userName}</h2>
              <p className="text-xs sm:text-sm text-gray-400">Chess Puzzle</p>
            </div>
          </div>
          <Button
            onClick={handleGoHome}
            variant="outline"
            size="sm"
            className="border-gray-700 hover:bg-gray-800 text-white h-8 sm:h-9 text-xs sm:text-sm flex-shrink-0"
          >
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden xs:inline">Dashboard</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center flex-1 px-2 sm:px-4 py-4 sm:py-6 md:py-8 overflow-auto">
        <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6 w-full max-w-[600px]">
          <ChessBoard position={game.fen()} onDrop={onDrop} />
          
          {/* Restart Button */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full px-2">
            <Button
              onClick={resetGame}
              variant="outline"
              size="lg"
              className="border-purple-500 hover:bg-purple-500/10 text-white w-full max-w-sm h-10 sm:h-11 text-sm sm:text-base touch-manipulation active:scale-95"
              disabled={isThinking}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart Game
            </Button>
          </div>
        </div>
      </div>

      {/* Unlock Dialog */}
      {isUnlocked && <UnlockDialog onEnterChat={handleEnterChat} />}
      
      {/* Game Over Dialog */}
      {gameOverState.isOver && gameOverState.result && (
        <GameOverDialog
          result={gameOverState.result}
          winner={gameOverState.winner}
          onRestart={resetGame}
        />
      )}
    </div>
  );
}

