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

  const room = await prisma.room.findUnique({
    where: { id: odaId },
    include: {
      creator: { select: { name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      roomCards: {
        include: { card: true },
      },
      _count: { select: { members: true, roomCards: true } },
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Oda bulunamadı" }, { status: 404 });
  }

  // Check access
  const isMember = room.members.some((m) => m.userId === session.user.id);
  const isCreator = room.creatorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isMember && !isCreator && !isAdmin) {
    return NextResponse.json({ error: "Erişim yok" }, { status: 403 });
  }

  return NextResponse.json(room);
}

export async function PUT(
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

  const { name, description, isActive } = await req.json();

  const updated = await prisma.room.update({
    where: { id: odaId },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
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

  await prisma.room.delete({ where: { id: odaId } });

  return NextResponse.json({ success: true });
}
