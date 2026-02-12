import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { query } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY!;
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" +
    apiKey;

  const body = {
    contents: [
      {
        parts: [{ text: query }],
      },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    return NextResponse.json({ answer: "Gemini: quota exceeded (429)" });
  }

  const json = await res.json();

  if (json.error) {
    return NextResponse.json({
      answer: `ERROR: ${json.error.message}`,
    });
  }

  const answer =
    json.candidates?.[0]?.content?.parts?.[0]?.text ??
    "応答がありません";

  return NextResponse.json({ answer });
}
