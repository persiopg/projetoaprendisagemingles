import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserStreak } from "@/lib/streak";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const [users] = await db.execute(`SELECT id FROM users WHERE email = ?`, [session.user.email]);
    const userId = (users as any)?.[0]?.id;
    if (!userId) return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });

    const data = await getUserStreak(userId, 14);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro em /api/dashboard/streak:", error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}
