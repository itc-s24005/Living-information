"use client";

import { useEffect, useState } from "react";

export default function GmailBadge() {
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/gmail", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        console.log("gmail badge data:", data);
        setUnreadCount(data.unreadCount);
      })
      .catch(() => setUnreadCount(0));
  }, []);

  // まだ取得中
  if (unreadCount === null) {
    return <span style={{ fontSize: 12 }}>…</span>;
  }

  // 未読なし → 0 を表示する or 非表示（好み）
  if (unreadCount === 0) {
    return <span style={{ fontSize: 12 }}></span>;
  }

  return (
    <span
      style={{
        background: "red",
        color: "white",
        borderRadius: "50%",
        minWidth: 20,
        height: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: "bold",
        marginTop: "-22px",
        marginLeft: "-20px",
        padding: "0 5px",
      }}
    >
      {unreadCount}
    </span>
  );
}
