import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cards = await prisma.card.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(cards);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, imageUrl, imageKey, category } = await req.json();

  if (!title || !imageUrl || !imageKey) {
    return NextResponse.json(
      { error: "Başlık ve resim gereklidir" },
      { status: 400 }
    );
  }

  const card = await prisma.card.create({
    data: {
      title,
      description: description || null,
      imageUrl,
      imageKey,
      category: category || "Genel",
    },
  });

  return NextResponse.json(card);
}
