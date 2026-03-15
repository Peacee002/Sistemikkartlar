"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Canvas } from "@/components/canvas/canvas";
import { useSocket } from "@/hooks/use-socket";
import { useCanvas } from "@/hooks/use-canvas";
import { useCanvasStore } from "@/stores/canvas-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type RoomData = {
  id: string;
  name: string;
  creatorId: string;
  roomCards: {
    card: {
      id: string;
      title: string;
      imageUrl: string;
      category: string;
    };
  }[];
};

type OnlineUser = {
  userId: string;
  userName: string;
};

export default function RoomCanvasPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const roomId = params.odaId as string;
  const { socket, connected } = useSocket(roomId);
  const {
    emitMove,
    emitRotate,
    emitAdd,
    emitRemove,
    emitBringToFront,
    emitCursor,
  } = useCanvas(socket);

  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  // Load room data
  const loadRoom = useCallback(async () => {
    const res = await fetch(`/api/odalar/${roomId}`);
    if (res.ok) {
      const data = await res.json();
      setRoom(data);
    } else {
      setError("Odaya erişim yok");
    }
    setLoading(false);
  }, [roomId]);

  // Load canvas state via REST as fallback
  const loadCanvasState = useCallback(async () => {
    const res = await fetch(`/api/odalar/${roomId}/canvas`);
    if (res.ok) {
      const cards = await res.json();
      if (cards.length > 0) {
        useCanvasStore.getState().setCards(cards);
      }
    }
  }, [roomId]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push(`/giris?callbackUrl=/oda/${roomId}`);
      return;
    }
    loadRoom();
    loadCanvasState();
  }, [session, status, roomId, router, loadRoom, loadCanvasState]);

  // Track online users
  useEffect(() => {
    if (!socket) return;

    socket.emit("room:getUsers");

    socket.on("room:users", (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    socket.on(
      "user:joined",
      (user: { userId: string; userName: string }) => {
        setOnlineUsers((prev) => {
          if (prev.some((u) => u.userId === user.userId)) return prev;
          return [...prev, user];
        });
      }
    );

    socket.on("user:left", (data: { userId: string }) => {
      setOnlineUsers((prev) =>
        prev.filter((u) => u.userId !== data.userId)
      );
    });

    return () => {
      socket.off("room:users");
      socket.off("user:joined");
      socket.off("user:left");
    };
  }, [socket]);

  if (status === "loading" || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-destructive">{error}</p>
        <Link href="/">
          <Button variant="outline">Ana Sayfa</Button>
        </Link>
      </div>
    );
  }

  if (!room || !session?.user) return null;

  const poolCards = room.roomCards.map((rc) => rc.card);
  const isTeacherOrAdmin =
    room.creatorId === session.user.id ||
    session.user.role === "ADMIN" ||
    session.user.role === "TEACHER";

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <header className="h-12 border-b bg-background flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href={isTeacherOrAdmin ? `/odalar/${roomId}` : "/"}>
            <Button variant="ghost" size="sm">
              ← Geri
            </Button>
          </Link>
          <span className="font-semibold text-sm">{room.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {onlineUsers.map((user) => (
            <Badge key={user.userId} variant="outline" className="text-xs">
              {user.userName}
            </Badge>
          ))}
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <Canvas
          poolCards={poolCards}
          currentUserId={session.user.id}
          onMove={emitMove}
          onRotate={emitRotate}
          onAdd={emitAdd}
          onRemove={emitRemove}
          onBringToFront={emitBringToFront}
          onCursorMove={emitCursor}
          connected={connected}
        />
      </div>
    </div>
  );
}
