import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ kartId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { kartId } = await params;
  const { title, description, category } = await req.json();

  const card = await prisma.card.update({
    where: { id: kartId },
    data: { title, description, category },
  });

  return NextResponse.json(card);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ kartId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { kartId } = await params;

  await prisma.card.delete({ where: { id: kartId } });

  return NextResponse.json({ success: true });
}
