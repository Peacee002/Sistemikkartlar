import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ inviteCode: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inviteCode } = await params;

  const room = await prisma.room.findUnique({
    where: { inviteCode },
    select: { id: true, name: true, description: true, isActive: true },
  });

  if (!room) {
    return NextResponse.json({ error: "Geçersiz davet kodu" }, { status: 404 });
  }

  if (!room.isActive) {
    return NextResponse.json({ error: "Bu oda aktif değil" }, { status: 400 });
  }

  // Add user as member if not already
  await prisma.roomMember.upsert({
    where: {
      userId_roomId: { userId: session.user.id, roomId: room.id },
    },
    create: { userId: session.user.id, roomId: room.id },
    update: {},
  });

  return NextResponse.json({ roomId: room.id, roomName: room.name });
}
