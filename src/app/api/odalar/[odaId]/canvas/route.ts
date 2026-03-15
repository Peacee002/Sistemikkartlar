import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ odaId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { odaId } = await params;

  // Check membership
  const membership = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: { userId: session.user.id, roomId: odaId },
    },
  });

  const room = await prisma.room.findUnique({ where: { id: odaId } });

  if (!membership && room?.creatorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Erişim yok" }, { status: 403 });
  }

  const canvasCards = await prisma.canvasCard.findMany({
    where: { roomId: odaId },
    include: {
      card: {
        select: { id: true, title: true, imageUrl: true, category: true },
      },
    },
  });

  return NextResponse.json(canvasCards);
}
