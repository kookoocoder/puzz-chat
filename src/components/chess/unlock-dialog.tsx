"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface UnlockDialogProps {
  onEnterChat: () => void;
}

export function UnlockDialog({ onEnterChat }: UnlockDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full bg-gray-900 border-green-500 border-2 p-8 text-center">
        <div className="flex flex-col items-center gap-6">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Unlocked!
            </h2>
            <p className="text-gray-300 text-lg">
              You&apos;ve solved the chess puzzle! Welcome to the chat.
            </p>
          </div>
          <Button
            onClick={onEnterChat}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg"
          >
            Enter Chat
          </Button>
        </div>
      </Card>
    </div>
  );
}

