"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

export function useSocket(roomId: string) {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!session?.user || !roomId) return;

    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
      {
        auth: {
          token: "session-token", // In production, pass actual JWT
          roomId,
          userId: session.user.id,
          userName: session.user.name,
        },
        transports: ["websocket", "polling"],
      }
    );

    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session, roomId]);

  return { socket: socketRef.current, connected };
}
