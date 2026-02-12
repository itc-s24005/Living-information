import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  try {
    // fallback画像を先に用意
    const fallbackPath = path.join(process.cwd(), "public", "news.jpg");
    const fallbackBuffer = fs.readFileSync(fallbackPath);

    if (!url) {
      return new NextResponse(fallbackBuffer, {
        headers: {
          "Content-Type": "image/jpeg",
        },
      });
    }

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        // Yahoo対策（UA必須なことがある）
        "User-Agent":
          "Mozilla/5.0 (compatible; NewsImageProxy/1.0)",
      },
    });

    const contentType = res.headers.get("content-type") ?? "";
    const buffer = await res.arrayBuffer();

    // ❌ Yahooの404 gif / 空画像 / 非image
    if (
      !res.ok ||
      !contentType.startsWith("image/") ||
      buffer.byteLength < 2000
    ) {
      throw new Error("invalid image");
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    // 🔥 ここで redirect しない
    const fallbackPath = path.join(process.cwd(), "public", "news.jpg");
    const fallbackBuffer = fs.readFileSync(fallbackPath);

    return new NextResponse(fallbackBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
      },
    });
  }
}
