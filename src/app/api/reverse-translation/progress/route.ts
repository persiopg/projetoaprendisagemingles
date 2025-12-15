import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { score, totalQuestions } = body;

    if (typeof score !== "number" || typeof totalQuestions !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Buscar ID do usuário
    const [users] = await db.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [session.user.email]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = users[0].id;

    // Salvar progresso
    await db.query(
      "INSERT INTO reverse_translation_progress (user_id, score, total_questions) VALUES (?, ?, ?)",
      [userId, score, totalQuestions]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving reverse translation progress:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
