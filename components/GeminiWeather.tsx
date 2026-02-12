"use client";

import { useEffect, useState } from "react";

export default function GeminiWeather() {
  const [text, setText] = useState("読み込み中...");

  useEffect(() => {
    async function run() {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          //query: "あなたは日本の生活情報アシスタントです。那覇市の今日おすすめの服装教えてください。リンクや絵文字は入れず、改行の代わりに空白を入れてください",
          query: "素敵な写真を一枚ください。バリエーションはなんでもいいです。画像のURLだけを教えてください。",
        }),
      });

      const data: { answer?: string } = await res.json();

      // ✅ answer だけ表示
      setText(data.answer ?? "取得できませんでした");
    }

    run();
  }, []);

  return <p style={{ fontSize: 20, marginTop: 10 }}>{text}</p>;
}
