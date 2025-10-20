"use client";

import { useEffect, useRef } from "react";
import { ChatClient } from "./chat-client";
import { revokeChessCompletion } from "@/app/chess/actions";

interface ChatWrapperProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export function ChatWrapper({ currentUser }: ChatWrapperProps) {
  const hasRevokedRef = useRef(false);

  useEffect(() => {
    // Reset revoke flag when component mounts
    hasRevokedRef.current = false;

    const revokeAccess = async () => {
      if (!hasRevokedRef.current) {
        hasRevokedRef.current = true;
        await revokeChessCompletion();
      }
    };

    // Handle page visibility changes (tab switch, minimize, close)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        revokeAccess();
      }
    };

    // Handle before unload (closing tab/window/refresh)
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable data sending during unload
      if (!hasRevokedRef.current) {
        hasRevokedRef.current = true;
        navigator.sendBeacon("/api/revoke-chess");
      }
    };

    // Handle popstate (back/forward navigation)
    const handlePopState = () => {
      revokeAccess();
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Cleanup function - revoke when navigating away
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      
      // Revoke when component unmounts (Next.js navigation)
      revokeAccess();
    };
  }, []);

  return <ChatClient currentUser={currentUser} />;
}

