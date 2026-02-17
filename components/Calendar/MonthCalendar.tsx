"use client";
import { useState } from "react";
import { Event } from "@/app/types";

type Props = {
  events: Event[];
  holidays: Record<string, string>;
};

/* =========================
 * 日付ユーティリティ
 * ========================= */
function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatJP(date: Date) {
  const w = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
  return `${date.getMonth() + 1}月${date.getDate()}日（${w}）`;
}

function formatRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.getMonth() + 1}/${s.getDate()}〜${e.getMonth() + 1}/${e.getDate()}`;
}

function formatTime(start?: string, end?: string) {
  if (!start || !end) return null;
  return `${start}–${end}`;
}


/* =========================
 * Component
 * ========================= */
export default function MonthCalendar({ events, holidays }: Props) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  /* =========================
   * 今月カレンダー用日付配列
   * ========================= */
  const days = (() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const start = new Date(firstDay);
    start.setDate(start.getDate() - start.getDay());

    const end = new Date(lastDay);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const result: Date[] = [];
    const cur = new Date(start);

    while (cur <= end) {
      result.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    return result;
  })();

  /* =========================
   * render
   * ========================= */
  return (
    <div style={{ padding: "20px 15px", borderRadius: "30px", backgroundColor: "#fff"}}>
      {/* 曜日 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", fontWeight: "bold" }}>
        {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
          <div key={d} style={{ textAlign: "center", color: i === 0 ? "red" : i === 6 ? "blue" : "black" }}>
            {d}
          </div>
        ))}
      </div>

      {/* カレンダー */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {days.map((date) => {
          const ymd = toYMD(date);
          const isToday = ymd === toYMD(today);
          const isCurrentMonth = date.getMonth() === month;
          const holidayName = holidays[ymd];
          const dayEvents = events.filter((e) => e.date === ymd);
          let x = 3;
          if (holidayName) x = 2;

          let color = "black";
          if (holidayName || date.getDay() === 0) color = "red";
          if (date.getDay() === 6) color = "blue";

          return (
            <div
              key={ymd}
              onClick={() => setSelectedDate(date)}
              style={{
                minHeight: 105,
                padding: 6,
                border: "1px solid #ccc",
                backgroundColor: isToday ? "#fff3cd" : "#fff",
                opacity: isCurrentMonth ? 1 : 0.4,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              <div style={{ fontWeight: "bold", color }}>{date.getDate()}</div>

              {holidayName && (
                <div style={{ color: "red", fontSize: 13 }}>{holidayName}</div>
              )}


              { dayEvents.slice(0, x).map((e, i) => (
                <div  key={i} style={{ margin: "2px -4px 2px -4px", paddingLeft: "4px", fontSize: 13, color: "white", backgroundColor: e.startTime ? "red" : "orange", borderRadius: "5px" }}>{e.title.slice(0, 12)}{e.title.length > 12 && "…"}　{e.startTime}{e.startTime && " ~"}</div>
              ))}
              {dayEvents.length > x+1 && (
                <div style={{ margin: "2px 0 2px 0", fontSize: 13 }}>他 {dayEvents.length - x} 件</div>
              )}
              { dayEvents.length === x+1 && dayEvents.slice(x, x+1).map((e, i) => (
                <div  key={i} style={{ margin: "2px -4px 2px -4px", paddingLeft: "4px", fontSize: 13, color: "white", backgroundColor: e.startTime ? "red" : "orange", borderRadius: "5px" }}>{e.title.slice(0, 12)}{e.title.length > 12 && "…"}　{e.startTime}{e.startTime && " ~"}</div>
              ))}
            </div>
          );
        })}
      </div>

      {/* =========================
       * ライトボックス
       * ========================= */}
      {selectedDate && (() => {
        const ymd = toYMD(selectedDate);
        const holidayName = holidays[ymd];
        const dayEvents = events.filter((e) => e.date === ymd);

        return (
          <div
            onClick={() => setSelectedDate(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              color: "black",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                padding: "20px",
                width: 350,
                borderRadius: 8,
              }}
            >
              <div style={{display: "flex"}}>
                <h3 style={{ marginBottom: 8 }}>{formatJP(selectedDate)}</h3>

                {holidayName && (
                  <div style={{ color: "red", marginBottom: 8 }}>
                    {holidayName}
                  </div>
                )}
              </div>

              {dayEvents.length === 0 && <div style={{marginBottom: "8px"}}>予定はありません</div>}

              {dayEvents.map((e, i) => {
                const time = formatTime(e.startTime, e.endTime);
                const range =
                  e.range && e.range.start !== e.range.end
                    ? formatRange(e.range.start, e.range.end)
                    : null;

                return (
                  <div key={i} style={{ marginBottom: 18 }}>
                    <div style={{ fontWeight: "bold" }}>{e.title}</div>

                    {time && (
                      <div style={{ fontSize: 12, color: "#555" }}>
                         {time}
                      </div>
                    )}

                    {range && (
                      <div style={{ fontSize: 12, color: "#555" }}>
                         {range}
                      </div>
                    )}
                  </div>
                );
              })}
              <a href={`https://calendar.google.com/calendar`} style={{ marginTop: "18px", fontSize: 12, color: "#0066cc" }}>
                      グーグルカレンダーで詳細を見る
              </a>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
