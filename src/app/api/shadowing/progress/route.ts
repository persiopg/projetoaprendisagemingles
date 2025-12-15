import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  }

  try {
    const { word, isLearned } = await req.json();
    const userEmail = session.user.email;

    const [users] = await db.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [userEmail]
    );

    if (users.length === 0) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    const userId = users[0].id;

    // Check if progress exists
    const [existingProgress] = await db.execute<RowDataPacket[]>(
      "SELECT id FROM shadowing_progress WHERE user_id = ? AND word = ?",
      [userId, word]
    );

    if (existingProgress.length > 0) {
      await db.execute(
        "UPDATE shadowing_progress SET is_learned = ?, last_reviewed = NOW() WHERE user_id = ? AND word = ?",
        [isLearned, userId, word]
      );
    } else {
      await db.execute(
        "INSERT INTO shadowing_progress (user_id, word, is_learned, last_reviewed) VALUES (?, ?, ?, NOW())",
        [userId, word, isLearned]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar progresso de shadowing:", error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}
