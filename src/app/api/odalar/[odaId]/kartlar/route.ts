import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ odaId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { odaId } = await params;

  const room = await prisma.room.findUnique({ where: { id: odaId } });
  if (!room) {
    return NextResponse.json({ error: "Oda bulunamadı" }, { status: 404 });
  }

  if (room.creatorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetki yok" }, { status: 403 });
  }

  const { cardIds } = await req.json();

  if (!Array.isArray(cardIds)) {
    return NextResponse.json({ error: "cardIds gerekli" }, { status: 400 });
  }

  // Remove existing and set new
  await prisma.roomCard.deleteMany({ where: { roomId: odaId } });

  if (cardIds.length > 0) {
    await prisma.roomCard.createMany({
      data: cardIds.map((cardId: string) => ({
        roomId: odaId,
        cardId,
      })),
    });
  }

  return NextResponse.json({ success: true });
}
