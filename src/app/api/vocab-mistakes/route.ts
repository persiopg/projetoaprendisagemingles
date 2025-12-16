import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { getMostCommonEnglishWords2000 } from "@/data/mostCommonEnglishWords2000";

type Source = "shadowing" | "dictation" | "reverse_translation" | "review";

function isSource(value: unknown): value is Source {
  return value === "shadowing" || value === "dictation" || value === "reverse_translation" || value === "review";
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { source, wordEn, wordPtBr } = body as {
      source?: unknown;
      wordEn?: unknown;
      wordPtBr?: unknown;
    };

    if (!isSource(source)) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }

    if (source === "review") {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }

    if (typeof wordEn !== "string" || !wordEn.trim()) {
      return NextResponse.json({ error: "Invalid wordEn" }, { status: 400 });
    }

    if (typeof wordPtBr !== "string" || !wordPtBr.trim()) {
      return NextResponse.json({ error: "Invalid wordPtBr" }, { status: 400 });
    }

    const [users] = await db.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [session.user.email]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = users[0].id as number;

    await db.execute(
      `
      INSERT INTO vocab_mistakes (user_id, source, word_en, word_pt_br, wrong_count, last_wrong_at)
      VALUES (?, ?, ?, ?, 1, NOW())
      ON DUPLICATE KEY UPDATE
        wrong_count = wrong_count + 1,
        last_wrong_at = NOW(),
        word_pt_br = VALUES(word_pt_br)
      `,
      [userId, source, wordEn.trim(), wordPtBr.trim()]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as { code?: string } | null;
    if (err?.code === "ER_NO_SUCH_TABLE") {
      return NextResponse.json(
        {
          error: "Missing table: vocab_mistakes. Run node scripts/setup-vocab-mistakes-db.js",
        },
        { status: 500 }
      );
    }

    console.error("Error saving vocab mistake:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const parsedLimit = Number(limitParam ?? 50);
    const limit = Math.max(1, Math.min(200, Number.isFinite(parsedLimit) ? parsedLimit : 50));
    const safeLimit = Math.trunc(limit);

    const [users] = await db.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [session.user.email]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userIdRaw = users[0].id as unknown;
    const userId = typeof userIdRaw === "number" ? userIdRaw : Number(userIdRaw);
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: "User id invalid" }, { status: 500 });
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      `
      SELECT source, word_en, word_pt_br, wrong_count, last_wrong_at
      FROM vocab_mistakes
      WHERE user_id = ?
      ORDER BY last_wrong_at DESC, wrong_count DESC
      LIMIT ${safeLimit}
      `,
      [userId]
    );

    const mistakeItems = rows.map((r) => ({
      source: r.source as Exclude<Source, "review">,
      wordEn: r.word_en as string,
      wordPtBr: r.word_pt_br as string,
      wrongCount: Number(r.wrong_count),
      lastWrongAt: r.last_wrong_at ? new Date(r.last_wrong_at).toISOString() : null,
    }));

    // Revisões: palavras aprendidas há >10 dias (flashcard_progress) e com <3 ciclos concluídos
    let dueRows: RowDataPacket[] = [];
    try {
      const [result] = await db.execute<RowDataPacket[]>(
        `
        SELECT fp.word AS word_en, fp.last_reviewed AS last_reviewed,
               COALESCE(vrc.completed_count, 0) AS completed_count
        FROM flashcard_progress fp
        LEFT JOIN vocab_review_cycles vrc
          ON vrc.user_id = fp.user_id AND vrc.word_en = fp.word
        WHERE fp.user_id = ?
          AND fp.is_learned = 1
          AND fp.last_reviewed IS NOT NULL
          AND fp.last_reviewed <= DATE_SUB(NOW(), INTERVAL 10 DAY)
          AND COALESCE(vrc.completed_count, 0) < 3
        ORDER BY fp.last_reviewed ASC
        LIMIT ${safeLimit}
        `,
        [userId]
      );
      dueRows = result;
    } catch (e) {
      const err2 = e as { code?: string } | null;
      // Se a tabela de ciclos ainda não existir, tratamos como 0 ciclos.
      // Se flashcard_progress não existir (não deve), só ignora revisões.
      if (err2?.code !== "ER_NO_SUCH_TABLE") {
        throw e;
      }
    }

    const allWords = await getMostCommonEnglishWords2000();
    const translationByEn = new Map<string, string>();
    for (const w of allWords) {
      if (w.translationPtBr) translationByEn.set(w.word.toLowerCase(), w.translationPtBr);
    }

    const dueItems = dueRows
      .map((r) => {
        const wordEn = String(r.word_en ?? "").trim();
        const wordPtBr = translationByEn.get(wordEn.toLowerCase()) ?? "";
        if (!wordEn || !wordPtBr) return null;
        return {
          source: "review" as const,
          wordEn,
          wordPtBr,
          wrongCount: 0,
          lastWrongAt: r.last_reviewed ? new Date(r.last_reviewed).toISOString() : null,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    const mistakeWordSet = new Set(mistakeItems.map((m) => m.wordEn.toLowerCase()));
    const filteredDueItems = dueItems.filter((d) => !mistakeWordSet.has(d.wordEn.toLowerCase()));

    return NextResponse.json({ items: [...mistakeItems, ...filteredDueItems] });
  } catch (error) {
    const err = error as { code?: string } | null;
    if (err?.code === "ER_NO_SUCH_TABLE") {
      // DB ainda não foi preparado; melhor UX é retornar vazio.
      return NextResponse.json({ items: [] });
    }

    console.error("Error loading vocab mistakes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { source, wordEn } = body as { source?: unknown; wordEn?: unknown };

    if (!isSource(source)) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }

    if (typeof wordEn !== "string" || !wordEn.trim()) {
      return NextResponse.json({ error: "Invalid wordEn" }, { status: 400 });
    }

    const [users] = await db.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [session.user.email]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = users[0].id as number;

    if (source === "review") {
      await db.execute(
        `
        INSERT INTO vocab_review_cycles (user_id, word_en, completed_count, last_completed_at)
        VALUES (?, ?, 1, NOW())
        ON DUPLICATE KEY UPDATE
          completed_count = LEAST(completed_count + 1, 3),
          last_completed_at = NOW()
        `,
        [userId, wordEn.trim()]
      );

      return NextResponse.json({ success: true });
    }

    await db.execute(
      "DELETE FROM vocab_mistakes WHERE user_id = ? AND source = ? AND word_en = ?",
      [userId, source, wordEn.trim()]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as { code?: string } | null;
    if (err?.code === "ER_NO_SUCH_TABLE") {
      return NextResponse.json({ success: true });
    }

    console.error("Error deleting vocab mistake:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
