"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RoomCard } from "@/components/rooms/room-card";
import { Button } from "@/components/ui/button";

type Room = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  _count: { members: number; roomCards: number };
  creator: { name: string };
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);

  const loadRooms = useCallback(async () => {
    const res = await fetch("/api/odalar");
    if (res.ok) {
      setRooms(await res.json());
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Odalarım</h1>
        <Link href="/odalar/yeni">
          <Button>Yeni Oda</Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
      {rooms.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Henüz oda oluşturmadınız
        </p>
      )}
    </div>
  );
}
