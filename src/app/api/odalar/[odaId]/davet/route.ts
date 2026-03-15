import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
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

  // Generate a new invite code
  const crypto = await import("crypto");
  const inviteCode = crypto.randomBytes(8).toString("hex");

  const updated = await prisma.room.update({
    where: { id: odaId },
    data: { inviteCode },
  });

  return NextResponse.json({ inviteCode: updated.inviteCode });
}
