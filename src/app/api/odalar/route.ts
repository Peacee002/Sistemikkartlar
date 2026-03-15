import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const where =
    session.user.role === "ADMIN" ? {} : { creatorId: session.user.id };

  const rooms = await prisma.room.findMany({
    where,
    include: {
      _count: { select: { members: true, roomCards: true } },
      creator: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rooms);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, description } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Oda adı gereklidir" }, { status: 400 });
  }

  const room = await prisma.room.create({
    data: {
      name,
      description: description || null,
      creatorId: session.user.id,
      members: {
        create: { userId: session.user.id },
      },
    },
  });

  return NextResponse.json(room);
}
