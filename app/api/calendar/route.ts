import { cookies } from "next/headers";
import { getValidGoogleAccessToken } from "@/app/lib/google/token";
import { CalendarListItem, CalendarApiEvent } from "@/app/types";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return Response.json({ items: [] });
    }

    const accessToken = await getValidGoogleAccessToken(userId);
    if (!accessToken) {
      return Response.json({ items: [] });
    }

    const timeMin = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();

    const timeMax = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
      23,
      59,
      59
    ).toISOString();

    /* ① カレンダー一覧取得 */
    const listRes = await fetch(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!listRes.ok) {
      console.error("calendarList error", await listRes.text());
      return Response.json({ items: [] });
    }

    const listData = await listRes.json();

    /* ② 日本の祝日カレンダーを除外 */
    const calendars = (listData.items ?? []).filter(
      (cal: CalendarListItem) =>
        cal.summary !== "日本の祝日" &&
        !cal.id?.includes("holiday@group.v.calendar.google.com")
    );

    /* ③ 各カレンダーの予定を取得 */
    const allEvents: CalendarApiEvent[] = [];

    for (const cal of calendars) {
      const eventsRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
          cal.id
        )}/events?timeMin=${timeMin}&timeMax=${timeMax}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!eventsRes.ok) continue;

      const eventsData = await eventsRes.json();
      allEvents.push(...(eventsData.items ?? []));
    }

    return Response.json({ items: allEvents });
  } catch (e) {
    console.error("calendar route error", e);
    return Response.json({ items: [] });
  }
}
