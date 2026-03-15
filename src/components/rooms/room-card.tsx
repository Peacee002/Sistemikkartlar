"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type RoomCardProps = {
  room: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    _count: { members: number; roomCards: number };
    creator: { name: string };
  };
};

export function RoomCard({ room }: RoomCardProps) {
  return (
    <Link href={`/odalar/${room.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{room.name}</CardTitle>
            <Badge variant={room.isActive ? "default" : "secondary"}>
              {room.isActive ? "Aktif" : "Pasif"}
            </Badge>
          </div>
          {room.description && (
            <CardDescription>{room.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{room._count.members} üye</span>
            <span>{room._count.roomCards} kart</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
