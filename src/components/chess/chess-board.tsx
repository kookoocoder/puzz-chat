"use client";

import { Chessboard } from "react-chessboard";

interface PieceData {
  isSparePiece: boolean;
  position: string;
  pieceType: string;
}

interface ChessBoardProps {
  position: string;
  onDrop: (args: { piece: PieceData; sourceSquare: string; targetSquare: string | null }) => boolean;
}

export function ChessBoard({ position, onDrop }: ChessBoardProps) {
  return (
    <div className="w-full max-w-[600px] mx-auto">
      <Chessboard
        options={{
          position,
          onPieceDrop: onDrop,
          boardStyle: {
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
          },
          darkSquareStyle: { backgroundColor: "#779952" },
          lightSquareStyle: { backgroundColor: "#edeed1" },
        }}
      />
    </div>
  );
}

